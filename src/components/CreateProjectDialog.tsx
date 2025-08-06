import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (projectData: ProjectFormData) => void;
  loading?: boolean;
}

export interface ProjectFormData {
  title: string;
  description: string;
  subject: string;
  researchMethod: string;
  citationFormat: string;
  pagesTarget: number;
  deadline?: Date;
  tags: string[];
}

export const CreateProjectDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  loading = false 
}: CreateProjectDialogProps) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    subject: "",
    researchMethod: "",
    citationFormat: "APA",
    pagesTarget: 50,
    deadline: undefined,
    tags: []
  });
  const [newTag, setNewTag] = useState("");

  const vietnameseMajors = [
    "Công nghệ thông tin",
    "Kinh tế học", 
    "Quản trị kinh doanh",
    "Ngôn ngữ Anh",
    "Văn học Việt Nam",
    "Lịch sử",
    "Triết học",
    "Tâm lý học",
    "Giáo dục học",
    "Kỹ thuật",
    "Y học",
    "Luật học"
  ];

  const researchMethods = [
    "Nghiên cứu định tính",
    "Nghiên cứu định lượng", 
    "Nghiên cứu hỗn hợp",
    "Nghiên cứu lý thuyết",
    "Nghiên cứu thực nghiệm",
    "Nghiên cứu khảo sát"
  ];

  const citationFormats = [
    "APA",
    "MLA", 
    "Harvard",
    "Vancouver",
    "Chicago",
    "IEEE"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      subject: "",
      researchMethod: "",
      citationFormat: "APA",
      pagesTarget: 50,
      deadline: undefined,
      tags: []
    });
    setNewTag("");
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo dự án luận văn mới</DialogTitle>
          <DialogDescription>
            Thiết lập thông tin cơ bản cho dự án luận văn của bạn
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Tiêu đề luận văn *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nhập tiêu đề luận văn..."
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Mô tả dự án</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả ngắn gọn về dự án luận văn..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Ngành học *</Label>
              <Select 
                value={formData.subject} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngành học" />
                </SelectTrigger>
                <SelectContent>
                  {vietnameseMajors.map((major) => (
                    <SelectItem key={major} value={major}>
                      {major}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Phương pháp nghiên cứu *</Label>
              <Select 
                value={formData.researchMethod} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, researchMethod: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phương pháp nghiên cứu" />
                </SelectTrigger>
                <SelectContent>
                  {researchMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Định dạng trích dẫn</Label>
              <Select 
                value={formData.citationFormat} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, citationFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn định dạng trích dẫn" />
                </SelectTrigger>
                <SelectContent>
                  {citationFormats.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pages">Số trang mục tiêu</Label>
              <Input
                id="pages"
                type="number"
                min="10"
                max="200"
                value={formData.pagesTarget}
                onChange={(e) => setFormData(prev => ({ ...prev, pagesTarget: parseInt(e.target.value) || 50 }))}
              />
            </div>
            
            <div className="md:col-span-2">
              <Label>Hạn chót (tùy chọn)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, "PPP", { locale: vi })
                    ) : (
                      "Chọn ngày hạn chót"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="md:col-span-2">
              <Label>Thẻ tag (tùy chọn)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nhập tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.subject || !formData.researchMethod}>
              {loading ? "Đang tạo..." : "Tạo dự án"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};