import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface FeatureLockProps {
  feature: 'voice_chat' | 'advanced_templates' | 'plagiarism_check' | 'export_formats' | 'ai_generations' | 'exports';
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

const FeatureLock: React.FC<FeatureLockProps> = ({ feature, children, fallback }) => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const getFeatureInfo = () => {
    switch (feature) {
      case 'voice_chat':
        return {
          title: 'Trợ lý AI giọng nói',
          description: 'Tương tác bằng giọng nói với AI để viết luận văn',
          icon: <Zap className="h-5 w-5" />,
          canUse: permissions.canUseVoiceChat
        };
      case 'advanced_templates':
        return {
          title: 'Mẫu luận văn chuyên nghiệp',
          description: 'Truy cập thư viện mẫu luận văn đa ngành',
          icon: <Crown className="h-5 w-5" />,
          canUse: permissions.canUseAdvancedTemplates
        };
      case 'plagiarism_check':
        return {
          title: 'Kiểm tra đạo văn',
          description: 'Quét và phát hiện nội dung đạo văn',
          icon: <Lock className="h-5 w-5" />,
          canUse: permissions.canUsePlagiarismCheck
        };
      case 'export_formats':
        return {
          title: 'Định dạng xuất nâng cao',
          description: 'Xuất DOCX, LaTeX ngoài PDF cơ bản',
          icon: <Crown className="h-5 w-5" />,
          canUse: permissions.availableExportFormats.length > 1
        };
      case 'ai_generations':
        return {
          title: 'Tạo luận văn AI',
          description: `Bạn đã sử dụng hết giới hạn (${permissions.maxAiGenerationsPerMonth}/tháng)`,
          icon: <Zap className="h-5 w-5" />,
          canUse: permissions.canGenerateThesis
        };
      case 'exports':
        return {
          title: 'Xuất file',
          description: `Bạn đã sử dụng hết giới hạn (${permissions.maxExportsPerMonth}/tháng)`,
          icon: <Lock className="h-5 w-5" />,
          canUse: permissions.canExportFile
        };
      default:
        return {
          title: 'Tính năng cao cấp',
          description: 'Tính năng này yêu cầu gói cao cấp',
          icon: <Crown className="h-5 w-5" />,
          canUse: false
        };
    }
  };

  const featureInfo = getFeatureInfo();

  // If user has access to feature, render children
  if (featureInfo.canUse) {
    return <>{children}</>;
  }

  // If fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state UI
  return (
    <Card className="border-dashed border-muted-foreground/50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-muted-foreground">
          {featureInfo.icon}
          {featureInfo.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          {featureInfo.description}
        </p>
        
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="text-xs">
            {permissions.userTier === 'free' ? 'Miễn phí' : 
             permissions.userTier === 'premium' ? 'Cao cấp' : 'Cao cấp (Năm)'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Cần nâng cấp
          </Badge>
        </div>

        <Button 
          onClick={() => navigate('/pricing')}
          className="w-full"
          size="sm"
        >
          <Crown className="h-4 w-4 mr-2" />
          Nâng cấp ngay
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureLock;