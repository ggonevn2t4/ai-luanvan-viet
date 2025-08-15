import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Download, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserPermissions } from '@/hooks/useUserPermissions';

const UsageQuotaDisplay: React.FC = () => {
  const navigate = useNavigate();
  const permissions = useUserPermissions();

  const getUsageData = () => [
    {
      icon: <Zap className="h-4 w-4" />,
      label: 'Tạo luận văn AI',
      current: permissions.maxAiGenerationsPerMonth - permissions.remainingAiGenerations,
      total: permissions.maxAiGenerationsPerMonth,
      remaining: permissions.remainingAiGenerations,
      color: permissions.remainingAiGenerations === 0 ? 'destructive' : 'default'
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: 'Xuất file', 
      current: permissions.maxExportsPerMonth - permissions.remainingExports,
      total: permissions.maxExportsPerMonth,
      remaining: permissions.remainingExports,
      color: permissions.remainingExports === 0 ? 'destructive' : 'default'
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Dự án cộng tác',
      current: 0, // Would need to track this
      total: permissions.maxCollaborationProjects,
      remaining: permissions.maxCollaborationProjects,
      color: 'default'
    }
  ];

  const usageData = getUsageData();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Sử dụng tháng này</CardTitle>
        <Badge variant={permissions.userTier === 'free' ? 'outline' : 'default'}>
          {permissions.userTier === 'free' ? 'Miễn phí' : 
           permissions.userTier === 'premium' ? 'Cao cấp' : 'Cao cấp (Năm)'}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {usageData.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              <span className={item.remaining === 0 ? 'text-destructive font-medium' : ''}>
                {item.current}/{item.total}
              </span>
            </div>
            
            <Progress 
              value={(item.current / item.total) * 100} 
              className={item.remaining === 0 ? 'bg-destructive/20' : ''}
            />
            
            {item.remaining === 0 && (
              <p className="text-xs text-destructive">
                Đã sử dụng hết giới hạn tháng này
              </p>
            )}
          </div>
        ))}

        {permissions.userTier === 'free' && (
          <div className="pt-4 border-t">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Nâng cấp để có thêm tính năng và giới hạn cao hơn
              </p>
              
              <Button onClick={() => navigate('/pricing')} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Xem bảng giá
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageQuotaDisplay;