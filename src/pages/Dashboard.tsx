import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  Archive, 
  Star,
  TrendingUp,
  Clock,
  Target
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectDialog, ProjectFormData } from "@/components/CreateProjectDialog";

interface Thesis {
  id: string;
  title: string;
  description?: string;
  subject: string;
  status: string;
  progress_percentage: number;
  pages_target: number;
  deadline?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  research_method?: string;
  citation_format?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'recent' | 'title' | 'progress' | 'deadline';
type FilterOption = 'all' | 'active' | 'completed' | 'in_progress' | 'draft' | 'archived';

const Dashboard = () => {
  const { user } = useAuth();
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [filteredTheses, setFilteredTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchTheses();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [theses, searchQuery, filterOption, sortOption]);

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

  const applyFiltersAndSort = () => {
    let filtered = [...theses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(thesis => 
        thesis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thesis.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (filterOption !== 'all') {
      if (filterOption === 'active') {
        filtered = filtered.filter(thesis => thesis.is_active);
      } else if (filterOption === 'archived') {
        filtered = filtered.filter(thesis => !thesis.is_active);
      } else {
        filtered = filtered.filter(thesis => thesis.status === filterOption);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'progress':
          return b.progress_percentage - a.progress_percentage;
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'recent':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredTheses(filtered);
  };

  const createProject = async (projectData: ProjectFormData) => {
    setCreateLoading(true);
    try {
      const { data: thesisData, error: thesisError } = await supabase
        .from('theses')
        .insert({
          user_id: user?.id,
          title: projectData.title,
          description: projectData.description,
          subject: projectData.subject,
          research_method: projectData.researchMethod,
          citation_format: projectData.citationFormat,
          pages_target: projectData.pagesTarget,
          deadline: projectData.deadline?.toISOString(),
          tags: projectData.tags,
          status: 'draft',
          progress_percentage: 0,
          is_active: true
        })
        .select()
        .single();

      if (thesisError) throw thesisError;

      // Create default chapters for the new thesis
      const { error: chaptersError } = await supabase.rpc(
        'create_default_chapters',
        {
          thesis_id_param: thesisData.id,
          user_id_param: user?.id
        }
      );

      if (chaptersError) {
        console.error('Error creating default chapters:', chaptersError);
      }

      await fetchTheses();
      setCreateDialogOpen(false);
      
      toast({
        title: "Thành công",
        description: "Dự án luận văn đã được tạo thành công!",
      });

      // Navigate to the write page with the new thesis
      navigate(`/write?thesis=${thesisData.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo dự án luận văn.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
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

  const archiveThesis = async (id: string) => {
    try {
      const thesis = theses.find(t => t.id === id);
      if (!thesis) return;

      const { error } = await supabase
        .from('theses')
        .update({ is_active: !thesis.is_active })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      setTheses(theses.map(t => 
        t.id === id ? { ...t, is_active: !t.is_active } : t
      ));

      toast({
        title: "Thành công",
        description: thesis.is_active ? "Luận văn đã được lưu trữ." : "Luận văn đã được khôi phục.",
      });
    } catch (error: any) {
      console.error('Error archiving thesis:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thực hiện thao tác.",
        variant: "destructive",
      });
    }
  };

  const duplicateThesis = async (id: string) => {
    try {
      const originalThesis = theses.find(t => t.id === id);
      if (!originalThesis) return;

      const { data, error } = await supabase
        .from('theses')
        .insert({
          user_id: user?.id,
          title: `${originalThesis.title} (Bản sao)`,
          description: originalThesis.description,
          subject: originalThesis.subject,
          research_method: originalThesis.research_method,
          citation_format: originalThesis.citation_format,
          pages_target: originalThesis.pages_target,
          tags: originalThesis.tags,
          status: 'draft',
          progress_percentage: 0,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTheses();
      toast({
        title: "Thành công",
        description: "Luận văn đã được nhân bản.",
      });
    } catch (error: any) {
      console.error('Error duplicating thesis:', error);
      toast({
        title: "Lỗi",
        description: "Không thể nhân bản luận văn.",
        variant: "destructive",
      });
    }
  };

  // Statistics
  const stats = {
    total: theses.length,
    active: theses.filter(t => t.is_active).length,
    completed: theses.filter(t => t.status === 'completed').length,
    avgProgress: theses.length > 0 ? Math.round(theses.reduce((sum, t) => sum + t.progress_percentage, 0) / theses.length) : 0
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
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Quản lý dự án</h1>
                <p className="text-muted-foreground mt-2">
                  Theo dõi và quản lý tất cả luận văn của bạn
                </p>
              </div>
              <Button 
                onClick={() => setCreateDialogOpen(true)} 
                variant="vietnamese"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo dự án mới
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {theses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng dự án</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completed}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiến độ TB</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.avgProgress}%</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          {theses.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm luận văn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={filterOption} onValueChange={(value: FilterOption) => setFilterOption(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="in_progress">Đang làm</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="archived">Đã lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mới nhất</SelectItem>
                    <SelectItem value="title">Tên A-Z</SelectItem>
                    <SelectItem value="progress">Tiến độ</SelectItem>
                    <SelectItem value="deadline">Hạn chót</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid/List */}
          {filteredTheses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {theses.length === 0 ? "Chưa có dự án nào" : "Không tìm thấy kết quả"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {theses.length === 0 
                    ? "Bắt đầu tạo dự án luận văn đầu tiên của bạn với AI"
                    : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  }
                </p>
                {theses.length === 0 && (
                  <Button onClick={() => setCreateDialogOpen(true)} variant="vietnamese">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo dự án mới
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
              : "space-y-4"
            }>
              {filteredTheses.map((thesis) => (
                <ProjectCard
                  key={thesis.id}
                  thesis={thesis}
                  onDelete={deleteThesis}
                  onEdit={(id) => navigate(`/write?thesis=${id}`)}
                  onView={(id) => navigate(`/write?thesis=${id}&view=true`)}
                  onDuplicate={duplicateThesis}
                  onArchive={archiveThesis}
                />
              ))}
            </div>
          )}
        </div>

        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={createProject}
          loading={createLoading}
        />

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;