import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, RefreshCw, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LoadingStates from "@/components/LoadingStates";
import { useToast } from "@/hooks/use-toast";

interface PaymentTransaction {
  transaction_id: string;
  user_email: string;
  user_name: string;
  plan_name: string;
  amount_vnd: number;
  status: string;
  payment_method: string;
  transaction_code: string;
  created_at: string;
  verified_at: string;
}

const PaymentManagement = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_payment_transactions_admin');
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (transactionId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase.rpc('update_payment_status', {
        transaction_id_param: transactionId,
        new_status_param: newStatus
      });
      
      if (error) throw error;
      if (!data) throw new Error('Failed to update payment status');

      toast({
        title: "Thành công",
        description: `Đã ${newStatus === 'approved' ? 'duyệt' : 'từ chối'} giao dịch`,
      });
      
      await fetchTransactions();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái giao dịch",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Đã từ chối</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleAction = (transaction: PaymentTransaction, action: 'approve' | 'reject') => {
    setSelectedTransaction(transaction);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!selectedTransaction || !actionType) return;
    
    const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
    await updatePaymentStatus(selectedTransaction.transaction_id, newStatus);
    
    setSelectedTransaction(null);
    setActionType(null);
  };

  if (loading) {
    return <LoadingStates type="analyzing" />;
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const completedTransactions = transactions.filter(t => t.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Thanh toán</h1>
          <p className="text-muted-foreground">
            {pendingTransactions.length} giao dịch chờ duyệt
          </p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              Giao dịch chờ duyệt ({pendingTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Gói</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Mã GD</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.map((transaction) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{transaction.user_email}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.user_name || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.plan_name}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.amount_vnd)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {transaction.transaction_code || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(transaction, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(transaction, 'reject')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Tất cả giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Gói</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ngày duyệt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.user_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.user_name || 'Chưa cập nhật'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.plan_name}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount_vnd)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {transaction.transaction_code || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    <TableCell>{formatDate(transaction.verified_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Không có giao dịch nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog 
        open={!!selectedTransaction && !!actionType} 
        onOpenChange={() => {
          setSelectedTransaction(null);
          setActionType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Duyệt giao dịch' : 'Từ chối giao dịch'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {actionType === 'approve' ? 'duyệt' : 'từ chối'} giao dịch 
              {formatCurrency(selectedTransaction?.amount_vnd || 0)} từ {selectedTransaction?.user_email}?
              {actionType === 'approve' && " Subscription sẽ được kích hoạt ngay lập tức."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PaymentManagement;