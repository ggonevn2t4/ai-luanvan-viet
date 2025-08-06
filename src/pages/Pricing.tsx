import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  Star, 
  Check, 
  X, 
  Zap, 
  FileText, 
  Users, 
  Download,
  CreditCard,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BankTransferDialog from '@/components/BankTransferDialog';

interface SubscriptionPlan {
  id: string;
  name: string;
  name_vietnamese: string;
  description: string;
  description_vietnamese: string;
  price_vnd: number;
  duration_months: number;
  features: {
    ai_generations_per_month: number;
    exports_per_month: number;
    collaboration_projects: number;
    max_thesis_length: number;
    export_formats: string[];
    support_level: string;
    voice_chat?: boolean;
    advanced_templates?: boolean;
    plagiarism_check?: boolean;
    yearly_discount?: boolean;
  };
}

interface UserSubscription {
  subscription_id: string;
  plan_name: string;
  plan_name_vietnamese: string;
  status: string;
  features: any;
  expires_at: string;
}

interface UserUsage {
  feature_type: string;
  count: number;
  reset_date: string;
}

const Pricing = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UserUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      // Load subscription plans
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_vnd');

      if (plansError) throw plansError;
      setPlans((plansData || []).map(plan => ({
        ...plan,
        features: plan.features as unknown as SubscriptionPlan['features']
      })));

      if (user) {
        // Load current subscription
        const { data: subData, error: subError } = await supabase
          .rpc('get_user_subscription', { user_id_param: user.id });

        if (subError) throw subError;
        if (subData && subData.length > 0) {
          setCurrentSubscription(subData[0]);
        }

        // Load usage data
        const { data: usageData, error: usageError } = await supabase
          .from('user_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('reset_date', new Date().toISOString().split('T')[0]);

        if (usageError) throw usageError;
        setUsage(usageData || []);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin gói dịch vụ",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceVnd: number) => {
    if (priceVnd === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
  };

  const getUsageCount = (featureType: string): number => {
    const found = usage.find(u => u.feature_type === featureType);
    return found ? found.count : 0;
  };

  const getUsagePercentage = (featureType: string, limit: number): number => {
    const current = getUsageCount(featureType);
    return Math.min((current / limit) * 100, 100);
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để nâng cấp gói dịch vụ",
        variant: "destructive",
      });
      return;
    }

    if (plan.price_vnd === 0) {
      toast({
        title: "Gói miễn phí",
        description: "Bạn đã đang sử dụng gói miễn phí",
      });
      return;
    }

    setSelectedPlan(plan);
    setShowBankTransfer(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-vietnamese">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Current Subscription Status */}
        {user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Gói dịch vụ hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{currentSubscription.plan_name_vietnamese}</h3>
                      <p className="text-muted-foreground">
                        Hết hạn: {new Date(currentSubscription.expires_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Badge variant={currentSubscription.status === 'active' ? 'default' : 'secondary'}>
                      {currentSubscription.status === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </div>

                  {/* Usage Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4" />
                          Tạo luận văn AI
                        </span>
                        <span>{getUsageCount('ai_generation')}/{currentSubscription.features.ai_generations_per_month}</span>
                      </div>
                      <Progress value={getUsagePercentage('ai_generation', currentSubscription.features.ai_generations_per_month)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          Xuất file
                        </span>
                        <span>{getUsageCount('export')}/{currentSubscription.features.exports_per_month}</span>
                      </div>
                      <Progress value={getUsagePercentage('export', currentSubscription.features.exports_per_month)} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Cộng tác
                        </span>
                        <span>0/{currentSubscription.features.collaboration_projects}</span>
                      </div>
                      <Progress value={0} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <h3 className="font-semibold text-lg mb-2">Gói miễn phí</h3>
                  <p className="text-muted-foreground mb-4">Bạn đang sử dụng gói miễn phí với tính năng cơ bản</p>
                  <Button onClick={() => setShowBankTransfer(true)}>
                    Nâng cấp ngay
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Bảng giá
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nâng cao trải nghiệm viết luận văn với các gói dịch vụ chuyên nghiệp
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isPopular = plan.name === 'Premium';
            const isCurrent = currentSubscription?.plan_name === plan.name;
            
            return (
              <Card key={plan.id} className={`relative ${isPopular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Phổ biến nhất
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.name === 'Free' && <Star className="h-5 w-5" />}
                    {plan.name === 'Premium' && <Crown className="h-5 w-5" />}
                    {plan.name === 'Premium Yearly' && <TrendingUp className="h-5 w-5" />}
                    {plan.name_vietnamese}
                  </CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">{formatPrice(plan.price_vnd)}</div>
                    <div className="text-sm text-muted-foreground">
                      {plan.duration_months === 1 ? '/tháng' : plan.duration_months === 12 ? '/năm' : `/${plan.duration_months} tháng`}
                    </div>
                    {plan.features.yearly_discount && (
                      <Badge variant="secondary" className="text-xs">
                        Tiết kiệm 17% so với gói tháng
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description_vietnamese}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Tạo luận văn AI
                      </span>
                      <span className="font-medium">{plan.features.ai_generations_per_month}/tháng</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Xuất file
                      </span>
                      <span className="font-medium">{plan.features.exports_per_month}/tháng</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Dự án cộng tác
                      </span>
                      <span className="font-medium">{plan.features.collaboration_projects}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Định dạng xuất
                      </span>
                      <span className="font-medium">{plan.features.export_formats.join(', ').toUpperCase()}</span>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {plan.features.voice_chat ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                        <span className={plan.features.voice_chat ? '' : 'text-muted-foreground'}>
                          Trợ lý AI giọng nói
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {plan.features.advanced_templates ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                        <span className={plan.features.advanced_templates ? '' : 'text-muted-foreground'}>
                          Mẫu luận văn chuyên nghiệp
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {plan.features.plagiarism_check ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                        <span className={plan.features.plagiarism_check ? '' : 'text-muted-foreground'}>
                          Kiểm tra đạo văn
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Đang sử dụng' : plan.price_vnd === 0 ? 'Gói hiện tại' : 'Chọn gói này'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Câu hỏi thường gặp về giá
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Tôi có thể hủy đăng ký bất cứ lúc nào?
              </h3>
              <p className="text-muted-foreground">
                Có, bạn có thể hủy đăng ký bất cứ lúc nào mà không mất phí. 
                Gói của bạn sẽ tiếp tục hoạt động đến hết chu kỳ thanh toán.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Có được hoàn tiền không?
              </h3>
              <p className="text-muted-foreground">
                Chúng tôi cung cấp chính sách hoàn tiền 100% trong vòng 7 ngày 
                đầu tiên nếu bạn không hài lòng với dịch vụ.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Phương thức thanh toán nào được hỗ trợ?
              </h3>
              <p className="text-muted-foreground">
                Hiện tại chúng tôi hỗ trợ chuyển khoản ngân hàng. Thanh toán sẽ được xác minh trong vòng 24h.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Có giảm giá cho sinh viên không?
              </h3>
              <p className="text-muted-foreground">
                Có, chúng tôi có chương trình giảm giá đặc biệt cho sinh viên. 
                Liên hệ để biết thêm chi tiết.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Transfer Dialog */}
      {showBankTransfer && selectedPlan && (
        <BankTransferDialog
          isOpen={showBankTransfer}
          onClose={() => {
            setShowBankTransfer(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          onPaymentSubmitted={() => {
            loadSubscriptionData();
            setShowBankTransfer(false);
            setSelectedPlan(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default Pricing;