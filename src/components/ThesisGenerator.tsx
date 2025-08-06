import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import LoadingStates from './LoadingStates';
import ErrorHandler from './ErrorHandler';

interface ThesisData {
  topic: string;
  major: string;
  academicLevel: string;
  pages: number;
  requirements: string;
  researchMethod: string;
  citationFormat: string;
}

interface ThesisGeneratorProps {
  onGenerated?: (content: string, metadata: any) => void;
}

export const ThesisGenerator = ({ onGenerated }: ThesisGeneratorProps) => {
  const [formData, setFormData] = useState<ThesisData>({
    topic: '',
    major: '',
    academicLevel: 'Thạc sĩ',
    pages: 50,
    requirements: '',
    researchMethod: 'Nghiên cứu định tính',
    citationFormat: 'APA'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ThesisData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  };

  const validateForm = () => {
    if (!formData.topic.trim()) {
      setError('Vui lòng nhập chủ đề luận văn');
      return false;
    }
    if (!formData.major.trim()) {
      setError('Vui lòng nhập ngành học');
      return false;
    }
    if (formData.pages < 10 || formData.pages > 200) {
      setError('Số trang phải từ 10 đến 200');
      return false;
    }
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('generate-thesis', {
        body: formData
      });

      if (functionError) {
        throw new Error(functionError.message || 'Lỗi khi gọi dịch vụ tạo luận văn');
      }

      if (!data.success) {
        throw new Error(data.error || 'Không thể tạo luận văn');
      }

      toast({
        title: "Thành công!",
        description: "Luận văn đã được tạo thành công",
      });

      onGenerated?.(data.content, data.metadata);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn';
      setError(errorMessage);
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    handleGenerate();
  };

  if (isGenerating) {
    return (
      <LoadingStates 
        type="generating"
        message="Đang tạo luận văn với AI..."
        progress={undefined}
      />
    );
  }

  if (error) {
    return (
      <ErrorHandler
        error={new Error(error)}
        onRetry={handleRetry}
        context="Tạo luận văn"
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Tạo luận văn với AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Chủ đề luận văn *</Label>
            <Input
              id="topic"
              placeholder="VD: Ảnh hưởng của công nghệ đến giáo dục"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="major">Ngành học *</Label>
            <Input
              id="major"
              placeholder="VD: Kinh tế học, Công nghệ thông tin"
              value={formData.major}
              onChange={(e) => handleInputChange('major', e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicLevel">Trình độ học thuật</Label>
            <Select 
              value={formData.academicLevel} 
              onValueChange={(value) => handleInputChange('academicLevel', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Đại học">Đại học</SelectItem>
                <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pages">Số trang mục tiêu</Label>
            <Input
              id="pages"
              type="number"
              min="10"
              max="200"
              value={formData.pages}
              onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || 50)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="researchMethod">Phương pháp nghiên cứu</Label>
            <Select 
              value={formData.researchMethod} 
              onValueChange={(value) => handleInputChange('researchMethod', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nghiên cứu định tính">Nghiên cứu định tính</SelectItem>
                <SelectItem value="Nghiên cứu định lượng">Nghiên cứu định lượng</SelectItem>
                <SelectItem value="Nghiên cứu hỗn hợp">Nghiên cứu hỗn hợp</SelectItem>
                <SelectItem value="Nghiên cứu tài liệu">Nghiên cứu tài liệu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="citationFormat">Định dạng trích dẫn</Label>
            <Select 
              value={formData.citationFormat} 
              onValueChange={(value) => handleInputChange('citationFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APA">APA</SelectItem>
                <SelectItem value="MLA">MLA</SelectItem>
                <SelectItem value="Chicago">Chicago</SelectItem>
                <SelectItem value="Harvard">Harvard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Yêu cầu đặc biệt (tùy chọn)</Label>
          <Textarea
            id="requirements"
            placeholder="Thêm bất kỳ yêu cầu đặc biệt nào cho luận văn của bạn..."
            value={formData.requirements}
            onChange={(e) => handleInputChange('requirements', e.target.value)}
            rows={3}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleGenerate} 
          className="w-full" 
          size="lg"
          disabled={isGenerating}
        >
          <FileText className="h-4 w-4 mr-2" />
          Tạo luận văn
        </Button>
      </CardContent>
    </Card>
  );
};