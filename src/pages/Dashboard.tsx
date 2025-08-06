import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { FileText, Calendar, Plus, Eye, Edit, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Thesis {
  id: string;
  title: string;
  content: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTheses();
    }
  }, [user]);

  const fetchTheses = async () => {
    try {
      const { data, error } = await supabase
        .from('theses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTheses(data || []);
    } catch (error: any) {
      console.error('Error fetching theses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách luận văn.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteThesis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('theses')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setTheses(theses.filter(thesis => thesis.id !== id));
      toast({
        title: "Thành công",
        description: "Luận văn đã được xóa.",
      });
    } catch (error: any) {
      console.error('Error deleting thesis:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa luận văn.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang làm';
      case 'draft':
        return 'Bản nháp';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Đang tải...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground mt-2">
                  Quản lý luận văn của bạn
                </p>
              </div>
              <Button onClick={() => navigate('/write')} variant="vietnamese">
                <Plus className="w-4 h-4 mr-2" />
                Tạo luận văn mới
              </Button>
            </div>
          </div>

          {theses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Chưa có luận văn nào</h3>
                <p className="text-muted-foreground mb-6">
                  Bắt đầu tạo luận văn đầu tiên của bạn với AI
                </p>
                <Button onClick={() => navigate('/write')} variant="vietnamese">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo luận văn mới
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {theses.map((thesis) => (
                <Card key={thesis.id} className="shadow-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-2 flex-1">
                        {thesis.title}
                      </CardTitle>
                      <Badge className={getStatusColor(thesis.status)}>
                        {getStatusText(thesis.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mb-1">
                        <FileText className="w-3 h-3" />
                        {thesis.subject}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(thesis.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {thesis.content.substring(0, 150)}...
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        Xem
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteThesis(thesis.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;