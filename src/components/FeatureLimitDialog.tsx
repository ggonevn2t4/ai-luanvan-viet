import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  Download, 
  Users, 
  Lock, 
  Sparkles,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface FeatureLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  featureType: string;
  featureName: string;
}

export const FeatureLimitDialog = ({ isOpen, onClose, featureType, featureName }: FeatureLimitDialogProps) => {
  const { subscription, getRemainingUsage, usage } = useSubscription();

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'ai_generation':
        return <Zap className="h-6 w-6" />;
      case 'export':
        return <Download className="h-6 w-6" />;
      case 'collaboration':
        return <Users className="h-6 w-6" />;
      default:
        return <Lock className="h-6 w-6" />;
    }
  };

  const getCurrentUsage = () => {
    const found = usage.find(u => u.feature_type === featureType);
    return found ? found.count : 0;
  };

  const getFeatureLimit = () => {
    if (!subscription) return 0;
    const limitKey = `${featureType}_per_month` as keyof typeof subscription.features;
    return subscription.features[limitKey] as number || 0;
  };

  const getUsagePercentage = () => {
    const current = getCurrentUsage();
    const limit = getFeatureLimit();
    return limit > 0 ? Math.min((current / limit) * 100, 100) : 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                {getFeatureIcon(featureType)}
              </div>
            </div>
            Đã hết lượt sử dụng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="font-medium">Gói hiện tại: {subscription?.plan_name_vietnamese}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{featureName}</span>
                    <span>{getCurrentUsage()}/{getFeatureLimit()}</span>
                  </div>
                  <Progress value={getUsagePercentage()} className="h-2" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Bạn đã sử dụng hết lượt {featureName.toLowerCase()} trong tháng này
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Options */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Nâng cấp để tiếp tục</h3>
              <p className="text-sm text-muted-foreground">
                Chọn gói Premium để có thêm nhiều tính năng
              </p>
            </div>

            <div className="space-y-3">
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Gói Premium</p>
                        <p className="text-sm text-muted-foreground">299.000 VNĐ/tháng</p>
                      </div>
                    </div>
                    <Badge variant="default">Phổ biến</Badge>
                  </div>
                  
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span>50 lượt tạo luận văn AI/tháng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>100 lượt xuất file/tháng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>10 dự án cộng tác</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-500/50 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Gói Premium (Năm)</p>
                        <p className="text-sm text-muted-foreground">2.999.000 VNĐ/năm</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Tiết kiệm 17%
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2">
                    Tất cả tính năng Premium + tiết kiệm 500.000 VNĐ
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
              <Crown className="h-4 w-4 mr-2" />
              Nâng cấp ngay
            </Button>
            
            <Button variant="outline" className="w-full" onClick={onClose}>
              Để sau
            </Button>
          </div>

          {/* Reset Information */}
          <div className="text-center text-xs text-muted-foreground">
            Lượt sử dụng sẽ được reset vào đầu tháng tới
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureLimitDialog;