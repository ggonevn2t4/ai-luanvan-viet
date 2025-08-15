import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';

export interface UserPermissions {
  canGenerateThesis: boolean;
  canExportFile: boolean;
  canCreateCollaboration: boolean;
  canUseVoiceChat: boolean;
  canUseAdvancedTemplates: boolean;
  canUsePlagiarismCheck: boolean;
  maxAiGenerationsPerMonth: number;
  maxExportsPerMonth: number;
  maxCollaborationProjects: number;
  availableExportFormats: string[];
  supportLevel: string;
  remainingAiGenerations: number;
  remainingExports: number;
  userTier: 'free' | 'premium' | 'premium_yearly';
}

export const useUserPermissions = (): UserPermissions => {
  const { user } = useAuth();
  const { subscription, canUseFeature, getRemainingUsage, hasFeature } = useSubscription();

  // Default free tier permissions
  const defaultPermissions: UserPermissions = {
    canGenerateThesis: true,
    canExportFile: true,
    canCreateCollaboration: true,
    canUseVoiceChat: false,
    canUseAdvancedTemplates: false,
    canUsePlagiarismCheck: false,
    maxAiGenerationsPerMonth: 3,
    maxExportsPerMonth: 5,
    maxCollaborationProjects: 1,
    availableExportFormats: ['pdf'],
    supportLevel: 'community',
    remainingAiGenerations: 0,
    remainingExports: 0,
    userTier: 'free'
  };

  if (!user) {
    return defaultPermissions;
  }

  if (!subscription) {
    return {
      ...defaultPermissions,
      canGenerateThesis: canUseFeature('ai_generations_per_month'),
      canExportFile: canUseFeature('exports_per_month'),
      remainingAiGenerations: getRemainingUsage('ai_generations_per_month'),
      remainingExports: getRemainingUsage('exports_per_month')
    };
  }

  // Get user tier based on subscription plan
  let userTier: 'free' | 'premium' | 'premium_yearly' = 'free';
  if (subscription.plan_name === 'Premium') userTier = 'premium';
  if (subscription.plan_name === 'Premium Yearly') userTier = 'premium_yearly';

  const features = subscription.features || {} as any;

  return {
    canGenerateThesis: canUseFeature('ai_generations_per_month'),
    canExportFile: canUseFeature('exports_per_month'),
    canCreateCollaboration: true, // Based on max projects limit
    canUseVoiceChat: hasFeature('voice_chat'),
    canUseAdvancedTemplates: hasFeature('advanced_templates'),
    canUsePlagiarismCheck: hasFeature('plagiarism_check'),
    maxAiGenerationsPerMonth: features.ai_generations_per_month || 3,
    maxExportsPerMonth: features.exports_per_month || 5,
    maxCollaborationProjects: features.collaboration_projects || 1,
    availableExportFormats: features.export_formats || ['pdf'],
    supportLevel: features.support_level || 'community',
    remainingAiGenerations: getRemainingUsage('ai_generations_per_month'),
    remainingExports: getRemainingUsage('exports_per_month'),
    userTier
  };
};

export default useUserPermissions;