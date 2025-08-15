import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FileText, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import LoadingStates from "@/components/LoadingStates";

interface SystemStats {
  total_users: number;
  active_subscriptions: number;
  total_revenue: number;
  pending_payments: number;
  total_theses: number;
  monthly_signups: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_system_analytics');
        if (error) throw error;
        if (data && data.length > 0) {
          setStats(data[0]);
        }
      } catch (error) {
        console.error('Error fetching system analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingStates type="analyzing" />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statCards = [
    {
      title: "Tổng số Users",
      value: stats?.total_users || 0,
      icon: Users,
      description: `+${stats?.monthly_signups || 0} tháng này`,
      color: "text-blue-600"
    },
    {
      title: "Subscriptions hoạt động", 
      value: stats?.active_subscriptions || 0,
      icon: TrendingUp,
      description: "Đang sử dụng Premium",
      color: "text-green-600"
    },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats?.total_revenue || 0),
      icon: CreditCard,
      description: `${stats?.pending_payments || 0} thanh toán chờ duyệt`,
      color: "text-purple-600"
    },
    {
      title: "Tổng số Thesis",
      value: stats?.total_theses || 0,
      icon: FileText,
      description: "Đã được tạo",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống và thống kê
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Kiểm tra thanh toán chờ duyệt: {stats?.pending_payments || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              • Users đăng ký tháng này: {stats?.monthly_signups || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              • Tỷ lệ chuyển đổi Premium: {stats?.total_users ? Math.round((stats.active_subscriptions / stats.total_users) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê hệ thống</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              • Thesis trung bình mỗi user: {stats?.total_users ? Math.round((stats.total_theses / stats.total_users) * 10) / 10 : 0}
            </p>
            <p className="text-sm text-muted-foreground">
              • Doanh thu trung bình mỗi user: {stats?.total_users ? formatCurrency(Math.round(stats.total_revenue / stats.total_users)) : formatCurrency(0)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;