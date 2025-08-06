-- Create subscription system for Vietnamese bank transfer payments
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_vietnamese TEXT NOT NULL,
  description TEXT,
  description_vietnamese TEXT,
  price_vnd INTEGER NOT NULL, -- Price in VND
  duration_months INTEGER NOT NULL DEFAULT 1,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'inactive', -- inactive, pending, active, expired, cancelled
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_transaction_code TEXT, -- For bank transfer verification
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create payment transactions table for bank transfers
CREATE TABLE public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  amount_vnd INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  bank_account_info JSONB, -- Store bank transfer details
  transaction_code TEXT, -- User-provided transaction code
  payment_proof_url TEXT, -- Optional screenshot upload
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  notes TEXT,
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create usage tracking table for feature limitations
CREATE TABLE public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'ai_generation', 'export', 'collaboration'
  count INTEGER NOT NULL DEFAULT 0,
  reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, reset_date)
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_plans (public read access)
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
FOR SELECT USING (is_active = true);

-- RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.user_subscriptions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment transactions" ON public.payment_transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment transactions" ON public.payment_transactions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_usage
CREATE POLICY "Users can view their own usage" ON public.user_usage
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON public.user_usage
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON public.user_usage
FOR UPDATE USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, name_vietnamese, description, description_vietnamese, price_vnd, duration_months, features) VALUES
('Free', 'Miễn phí', 'Basic features for students', 'Tính năng cơ bản cho sinh viên', 0, 1, '{
  "ai_generations_per_month": 3,
  "exports_per_month": 5,
  "collaboration_projects": 1,
  "max_thesis_length": 10000,
  "export_formats": ["pdf"],
  "support_level": "community"
}'::jsonb),
('Premium', 'Cao cấp', 'Full features for serious researchers', 'Đầy đủ tính năng cho nghiên cứu viên', 299000, 1, '{
  "ai_generations_per_month": 50,
  "exports_per_month": 100,
  "collaboration_projects": 10,
  "max_thesis_length": 100000,
  "export_formats": ["pdf", "docx", "latex"],
  "support_level": "priority",
  "voice_chat": true,
  "advanced_templates": true,
  "plagiarism_check": true
}'::jsonb),
('Premium Yearly', 'Cao cấp (Năm)', 'Premium features with yearly discount', 'Tính năng cao cấp với giảm giá cả năm', 2999000, 12, '{
  "ai_generations_per_month": 50,
  "exports_per_month": 100,
  "collaboration_projects": 10,
  "max_thesis_length": 100000,
  "export_formats": ["pdf", "docx", "latex"],
  "support_level": "priority",
  "voice_chat": true,
  "advanced_templates": true,
  "plagiarism_check": true,
  "yearly_discount": true
}'::jsonb);

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION public.get_user_subscription(user_id_param UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_name TEXT,
  plan_name_vietnamese TEXT,
  status TEXT,
  features JSONB,
  expires_at TIMESTAMPTZ
) 
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    us.id,
    sp.name,
    sp.name_vietnamese,
    us.status,
    sp.features,
    us.expires_at
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_id_param 
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
$$;

-- Create function to check feature usage limits
CREATE OR REPLACE FUNCTION public.check_feature_limit(
  user_id_param UUID,
  feature_type_param TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_usage INTEGER;
  feature_limit INTEGER;
  user_sub RECORD;
BEGIN
  -- Get user's current subscription
  SELECT * FROM public.get_user_subscription(user_id_param) INTO user_sub;
  
  -- If no active subscription, use free plan limits
  IF user_sub.subscription_id IS NULL THEN
    SELECT features FROM subscription_plans WHERE name = 'Free' INTO user_sub;
  END IF;
  
  -- Get feature limit from subscription
  feature_limit := (user_sub.features ->> (feature_type_param || '_per_month'))::INTEGER;
  
  -- Get current usage for this month
  SELECT COALESCE(count, 0) FROM user_usage 
  WHERE user_id = user_id_param 
    AND feature_type = feature_type_param 
    AND reset_date = CURRENT_DATE
  INTO current_usage;
  
  -- Check if under limit
  RETURN (current_usage < feature_limit);
END;
$$;

-- Create function to increment feature usage
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  user_id_param UUID,
  feature_type_param TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if user can use the feature
  IF NOT public.check_feature_limit(user_id_param, feature_type_param) THEN
    RETURN FALSE;
  END IF;
  
  -- Increment usage
  INSERT INTO user_usage (user_id, feature_type, count, reset_date)
  VALUES (user_id_param, feature_type_param, 1, CURRENT_DATE)
  ON CONFLICT (user_id, feature_type, reset_date) 
  DO UPDATE SET 
    count = user_usage.count + 1,
    updated_at = now();
    
  RETURN TRUE;
END;
$$;