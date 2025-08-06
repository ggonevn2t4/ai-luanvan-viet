import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionFeatures {
  ai_generations_per_month: number;
  exports_per_month: number;
  collaboration_projects: number;
  max_thesis_length: number;
  export_formats: string[];
  support_level: string;
  voice_chat?: boolean;
  advanced_templates?: boolean;
  plagiarism_check?: boolean;
}

interface UserSubscription {
  subscription_id: string;
  plan_name: string;
  plan_name_vietnamese: string;
  status: string;
  features: SubscriptionFeatures;
  expires_at: string;
}

interface FeatureUsage {
  feature_type: string;
  count: number;
  reset_date: string;
}

interface SubscriptionContextType {
  subscription: UserSubscription | null;
  usage: FeatureUsage[];
  isLoading: boolean;
  canUseFeature: (featureType: string) => boolean;
  getRemainingUsage: (featureType: string) => number;
  incrementFeatureUsage: (featureType: string) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
  isFeatureLimited: (featureType: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider = ({ children }: SubscriptionProviderProps) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<FeatureUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Default free plan features
  const defaultFeatures: SubscriptionFeatures = {
    ai_generations_per_month: 3,
    exports_per_month: 5,
    collaboration_projects: 1,
    max_thesis_length: 10000,
    export_formats: ['pdf'],
    support_level: 'community'
  };

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setUsage([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Get current subscription
      const { data: subData, error: subError } = await supabase
        .rpc('get_user_subscription', { user_id_param: user.id });

      if (subError) throw subError;

      if (subData && subData.length > 0) {
        setSubscription({
          ...subData[0],
          features: subData[0].features as unknown as SubscriptionFeatures
        });
      } else {
        // No active subscription, user is on free plan
        setSubscription({
          subscription_id: 'free',
          plan_name: 'Free',
          plan_name_vietnamese: 'Miễn phí',
          status: 'active',
          features: defaultFeatures,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        });
      }

      // Get usage data for current month
      const { data: usageData, error: usageError } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('reset_date', new Date().toISOString().split('T')[0]);

      if (usageError) throw usageError;
      setUsage(usageData || []);

    } catch (error) {
      console.error('Error loading subscription:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin gói dịch vụ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  const getUsageCount = (featureType: string): number => {
    const found = usage.find(u => u.feature_type === featureType);
    return found ? found.count : 0;
  };

  const canUseFeature = (featureType: string): boolean => {
    if (!subscription) return false;

    const currentUsage = getUsageCount(featureType);
    const limit = subscription.features[featureType as keyof SubscriptionFeatures] as number;
    
    return currentUsage < limit;
  };

  const getRemainingUsage = (featureType: string): number => {
    if (!subscription) return 0;

    const currentUsage = getUsageCount(featureType);
    const limit = subscription.features[featureType as keyof SubscriptionFeatures] as number;
    
    return Math.max(0, limit - currentUsage);
  };

  const incrementFeatureUsage = async (featureType: string): Promise<boolean> => {
    if (!user || !canUseFeature(featureType)) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('increment_feature_usage', {
          user_id_param: user.id,
          feature_type_param: featureType
        });

      if (error) throw error;

      if (data) {
        // Refresh usage data
        await refreshSubscription();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error incrementing feature usage:', error);
      return false;
    }
  };

  const hasFeature = (feature: keyof SubscriptionFeatures): boolean => {
    if (!subscription) return false;
    
    const featureValue = subscription.features[feature];
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }
    if (typeof featureValue === 'number') {
      return featureValue > 0;
    }
    if (Array.isArray(featureValue)) {
      return featureValue.length > 0;
    }
    
    return !!featureValue;
  };

  const isFeatureLimited = (featureType: string): boolean => {
    return !canUseFeature(featureType);
  };

  const value: SubscriptionContextType = {
    subscription,
    usage,
    isLoading,
    canUseFeature,
    getRemainingUsage,
    incrementFeatureUsage,
    refreshSubscription,
    hasFeature,
    isFeatureLimited
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionProvider;