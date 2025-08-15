-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_param AND role = 'admin'
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.user_roles 
  WHERE user_id = auth.uid()
  ORDER BY assigned_at DESC
  LIMIT 1;
$$;

-- Admin functions for user management
CREATE OR REPLACE FUNCTION public.get_all_users_with_stats()
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT,
  plan_name TEXT,
  total_theses BIGINT,
  role TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    au.id,
    au.email,
    p.full_name,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(us.status, 'inactive') as subscription_status,
    COALESCE(sp.name, 'Free') as plan_name,
    COALESCE(thesis_count.total, 0) as total_theses,
    COALESCE(ur.role::text, 'user') as role
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  LEFT JOIN public.user_subscriptions us ON au.id = us.user_id AND us.status = 'active'
  LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as total 
    FROM public.theses 
    GROUP BY user_id
  ) thesis_count ON au.id = thesis_count.user_id
  WHERE public.is_admin(auth.uid())
  ORDER BY au.created_at DESC;
$$;

-- Admin function for payment management
CREATE OR REPLACE FUNCTION public.get_payment_transactions_admin()
RETURNS TABLE(
  transaction_id UUID,
  user_email TEXT,
  user_name TEXT,
  plan_name TEXT,
  amount_vnd INTEGER,
  status TEXT,
  payment_method TEXT,
  transaction_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pt.id,
    au.email,
    p.full_name,
    sp.name,
    pt.amount_vnd,
    pt.status,
    pt.payment_method,
    pt.transaction_code,
    pt.created_at,
    pt.verified_at
  FROM public.payment_transactions pt
  JOIN auth.users au ON pt.user_id = au.id
  LEFT JOIN public.profiles p ON au.id = p.user_id
  LEFT JOIN public.subscription_plans sp ON pt.plan_id = sp.id
  WHERE public.is_admin(auth.uid())
  ORDER BY pt.created_at DESC;
$$;

-- Admin function to update payment status
CREATE OR REPLACE FUNCTION public.update_payment_status(
  transaction_id_param UUID,
  new_status_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN FALSE;
  END IF;
  
  -- Update payment transaction
  UPDATE public.payment_transactions 
  SET status = new_status_param,
      verified_at = CASE WHEN new_status_param = 'approved' THEN now() ELSE NULL END,
      verified_by = CASE WHEN new_status_param = 'approved' THEN auth.uid() ELSE NULL END,
      updated_at = now()
  WHERE id = transaction_id_param;
  
  -- If approved, activate subscription
  IF new_status_param = 'approved' THEN
    INSERT INTO public.user_subscriptions (user_id, plan_id, status, starts_at, expires_at)
    SELECT 
      pt.user_id,
      pt.plan_id,
      'active',
      now(),
      now() + (sp.duration_months || ' months')::INTERVAL
    FROM public.payment_transactions pt
    JOIN public.subscription_plans sp ON pt.plan_id = sp.id
    WHERE pt.id = transaction_id_param
    ON CONFLICT (user_id, plan_id) DO UPDATE SET
      status = 'active',
      starts_at = now(),
      expires_at = now() + (EXCLUDED.expires_at - EXCLUDED.starts_at),
      updated_at = now();
  END IF;
  
  RETURN TRUE;
END;
$$;

-- System analytics function
CREATE OR REPLACE FUNCTION public.get_system_analytics()
RETURNS TABLE(
  total_users BIGINT,
  active_subscriptions BIGINT,
  total_revenue BIGINT,
  pending_payments BIGINT,
  total_theses BIGINT,
  monthly_signups BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active') as active_subscriptions,
    (SELECT COALESCE(SUM(amount_vnd), 0) FROM public.payment_transactions WHERE status = 'approved') as total_revenue,
    (SELECT COUNT(*) FROM public.payment_transactions WHERE status = 'pending') as pending_payments,
    (SELECT COUNT(*) FROM public.theses) as total_theses,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= date_trunc('month', now())) as monthly_signups
  WHERE public.is_admin(auth.uid());
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Insert default admin user (replace with actual admin email)
-- You'll need to manually set this after creating an admin account
-- INSERT INTO public.user_roles (user_id, role, assigned_by) 
-- SELECT id, 'admin', id FROM auth.users WHERE email = 'admin@example.com';