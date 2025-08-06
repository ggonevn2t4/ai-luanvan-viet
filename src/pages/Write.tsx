import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Download, Edit, Eye, FileText, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Write = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState([50]);
  const [generatedContent, setGeneratedContent] = useState("");
  const [topic, setTopic] = useState("");
  const [major, setMajor] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [requirements, setRequirements] = useState("");
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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

  const academicLevels = [
    "Đại học",
    "Thạc sĩ", 
    "Tiến sĩ"
  ];

  const handleGenerate = async () => {
    // Validate required fields
    if (!topic.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập chủ đề luận văn",
        variant: "destructive",
      });
      return;
    }

    if (!major) {
      toast({
        title: "Lỗi", 
        description: "Vui lòng chọn ngành học",
        variant: "destructive",
      });
      return;
    }

    if (!academicLevel) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn mức độ học thuật", 
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setGeneratedContent("");
    
    try {
      // Simulate progress while generating
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const { data, error } = await supabase.functions.invoke('generate-thesis', {
        body: {
          topic: topic.trim(),
          major,
          academicLevel,
          pages: pages[0],
          requirements: requirements.trim()
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Error calling generate-thesis function:', error);
        throw new Error(error.message || 'Có lỗi xảy ra khi tạo luận văn');
      }

      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo luận văn');
      }

      setGeneratedContent(data.content);
      toast({
        title: "Thành công",
        description: "Luận văn đã được tạo thành công!",
      });

    } catch (error) {
      console.error('Error generating thesis:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo luận văn. Vui lòng thử lại.",
        variant: "destructive",
      });
      setGeneratedContent("");
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tạo luận văn với AI
          </h1>
          <p className="text-xl text-muted-foreground">
            Nhập thông tin để AI tạo luận văn chuyên nghiệp cho bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Thông tin luận văn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="topic">Chủ đề luận văn *</Label>
                <Input 
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Nhập chủ đề luận văn của bạn..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Ngành học *</Label>
                <Select value={major} onValueChange={setMajor}>
                  <SelectTrigger className="mt-2">
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
                <Label>Mức độ học thuật *</Label>
                <Select value={academicLevel} onValueChange={setAcademicLevel}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Số trang yêu cầu: {pages[0]} trang</Label>
                <Slider
                  value={pages}
                  onValueChange={setPages}
                  min={10}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>10 trang</span>
                  <span>100 trang</span>
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Yêu cầu đặc biệt</Label>
                <Textarea 
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Mô tả chi tiết về yêu cầu, định hướng nghiên cứu..."
                  className="mt-2 min-h-[100px]"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
                variant="vietnamese"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Đang tạo luận văn...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Tạo luận văn
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ tạo luận văn</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    {progress < 30 && "Phân tích chủ đề..."}
                    {progress >= 30 && progress < 60 && "Tạo dàn ý..."}
                    {progress >= 60 && progress < 90 && "Viết nội dung..."}
                    {progress >= 90 && "Hoàn thiện luận văn..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Output Display */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Kết quả luận văn</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Tải PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Tải DOCX
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Xem trước
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedContent}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Luận văn sẽ hiển thị ở đây sau khi tạo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Write;