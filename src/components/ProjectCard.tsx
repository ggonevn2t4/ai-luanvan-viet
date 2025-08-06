import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  Clock, 
  Target,
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Copy,
  Archive,
  Star,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProjectCardProps {
  thesis: {
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
  };
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
}

export const ProjectCard = ({ 
  thesis, 
  onDelete, 
  onEdit, 
  onView, 
  onDuplicate, 
  onArchive 
}: ProjectCardProps) => {
  const [isStarred, setIsStarred] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'in_progress':
        return 'Đang thực hiện';
      case 'draft':
        return 'Bản nháp';
      default:
        return status;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Quá hạn ${Math.abs(diffDays)} ngày`, color: 'text-red-600' };
    } else if (diffDays <= 7) {
      return { text: `Còn ${diffDays} ngày`, color: 'text-orange-600' };
    } else {
      return { text: date.toLocaleDateString('vi-VN'), color: 'text-muted-foreground' };
    }
  };

  const deadlineInfo = formatDeadline(thesis.deadline);

  return (
    <Card className={`shadow-card hover:shadow-lg transition-all duration-200 ${!thesis.is_active ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg line-clamp-2 flex-1">
                {thesis.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsStarred(!isStarred)}
                className={`p-1 h-auto ${isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
              >
                <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
              </Button>
            </div>
            
            {thesis.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {thesis.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(thesis.status)}>
              {getStatusText(thesis.status)}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(thesis.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(thesis.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(thesis.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Nhân bản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive(thesis.id)}>
                  <Archive className="w-4 h-4 mr-2" />
                  {thesis.is_active ? 'Lưu trữ' : 'Khôi phục'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      <span className="text-red-600">Xóa</span>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn xóa luận văn "{thesis.title}"? 
                        Hành động này không thể hoàn tác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(thesis.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Xóa
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {thesis.subject}
            </div>
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {thesis.pages_target} trang
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(thesis.created_at).toLocaleDateString('vi-VN')}
            </div>
            {deadlineInfo && (
              <div className={`flex items-center gap-1 ${deadlineInfo.color}`}>
                <Clock className="w-3 h-3" />
                {deadlineInfo.text}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tiến độ</span>
              <span className="text-sm text-muted-foreground">{thesis.progress_percentage}%</span>
            </div>
            <Progress 
              value={thesis.progress_percentage} 
              className="h-2"
            />
          </div>
          
          {/* Tags */}
          {thesis.tags && thesis.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {thesis.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {thesis.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{thesis.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView(thesis.id)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Xem
            </Button>
            <Button 
              variant="vietnamese" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit(thesis.id)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Tiếp tục
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};