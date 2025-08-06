import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Upload, CreditCard, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BankTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name_vietnamese: string;
    price_vnd: number;
    duration_months: number;
  };
  onPaymentSubmitted: () => void;
}

const BANK_INFO = {
  bankName: 'MB Bank (Ngân hàng Thương mại Cổ phần Quân đội)',
  accountNumber: '8873333333',
  accountHolder: 'Cao Nhật Quang',
  branch: 'Chi nhánh Hà Nội'
};

export const BankTransferDialog = ({ isOpen, onClose, plan, onPaymentSubmitted }: BankTransferDialogProps) => {
  const [transactionCode, setTransactionCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'payment' | 'confirmation'>('payment');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const transferContent = `${plan.name_vietnamese} - ${user?.email}`;
  const amount = plan.price_vnd;

  const formatPrice = (priceVnd: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(priceVnd);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Thông tin đã được sao chép vào clipboard",
    });
  };

  const handleSubmitPayment = async () => {
    if (!transactionCode.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập mã giao dịch",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create payment transaction record
      const { error: paymentError } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user!.id,
          plan_id: plan.id,
          amount_vnd: amount,
          payment_method: 'bank_transfer',
          bank_account_info: BANK_INFO,
          transaction_code: transactionCode,
          status: 'pending',
          notes: notes || null
        });

      if (paymentError) throw paymentError;

      // Create pending subscription
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);

      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user!.id,
          plan_id: plan.id,
          status: 'pending',
          payment_method: 'bank_transfer',
          bank_transaction_code: transactionCode,
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      if (subscriptionError) throw subscriptionError;

      setStep('confirmation');
      
      toast({
        title: "Đã gửi thông tin thanh toán",
        description: "Chúng tôi sẽ xác minh và kích hoạt gói dịch vụ trong vòng 24h",
      });

    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi thông tin thanh toán. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'confirmation') {
      onPaymentSubmitted();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {step === 'payment' ? 'Thanh toán chuyển khoản' : 'Xác nhận thanh toán'}
          </DialogTitle>
        </DialogHeader>

        {step === 'payment' ? (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Gói dịch vụ:</span>
                  <span className="font-medium">{plan.name_vietnamese}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời hạn:</span>
                  <span className="font-medium">
                    {plan.duration_months === 1 ? '1 tháng' : 
                     plan.duration_months === 12 ? '1 năm' : 
                     `${plan.duration_months} tháng`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary">{formatPrice(amount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin chuyển khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Vui lòng chuyển khoản chính xác số tiền và ghi đúng nội dung để được xử lý nhanh nhất.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm text-muted-foreground">Ngân hàng</Label>
                      <p className="font-medium">{BANK_INFO.bankName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm text-muted-foreground">Số tài khoản</Label>
                      <p className="font-mono text-lg font-bold">{BANK_INFO.accountNumber}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_INFO.accountNumber)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm text-muted-foreground">Chủ tài khoản</Label>
                      <p className="font-medium">{BANK_INFO.accountHolder}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(BANK_INFO.accountHolder)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Label className="text-sm text-muted-foreground">Số tiền</Label>
                      <p className="font-mono text-lg font-bold text-primary">{formatPrice(amount)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(amount.toString())}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div>
                      <Label className="text-sm text-muted-foreground">Nội dung chuyển khoản</Label>
                      <p className="font-medium text-primary">{transferContent}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(transferContent)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Confirmation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Xác nhận thanh toán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionCode">Mã giao dịch *</Label>
                  <Input
                    id="transactionCode"
                    value={transactionCode}
                    onChange={(e) => setTransactionCode(e.target.value)}
                    placeholder="Nhập mã giao dịch từ ngân hàng (VD: FT24001234567)"
                  />
                  <p className="text-sm text-muted-foreground">
                    Mã giao dịch có trong SMS hoặc lịch sử giao dịch của bạn
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú (tùy chọn)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thêm ghi chú nếu cần..."
                    rows={3}
                  />
                </div>

                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Sau khi gửi thông tin, chúng tôi sẽ xác minh và kích hoạt gói dịch vụ trong vòng 24 giờ.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button 
                onClick={handleSubmitPayment} 
                disabled={isSubmitting || !transactionCode.trim()}
              >
                {isSubmitting ? 'Đang gửi...' : 'Xác nhận thanh toán'}
              </Button>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Đã nhận thông tin thanh toán</h3>
              <p className="text-muted-foreground">
                Cảm ơn bạn đã chọn gói {plan.name_vietnamese}
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Mã giao dịch:</span>
                    <span className="font-mono">{transactionCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số tiền:</span>
                    <span className="font-medium">{formatPrice(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <Badge variant="secondary">Đang xác minh</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Tiếp theo:</strong><br />
                • Chúng tôi sẽ xác minh thông tin trong vòng 24h<br />
                • Bạn sẽ nhận email thông báo khi gói dịch vụ được kích hoạt<br />
                • Có thể kiểm tra trạng thái trong trang Quản lý tài khoản
              </AlertDescription>
            </Alert>

            <Button onClick={handleClose} className="w-full">
              Hoàn thành
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BankTransferDialog;