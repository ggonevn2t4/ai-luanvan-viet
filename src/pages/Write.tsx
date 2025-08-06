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
import { useState } from "react";

const Write = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pages, setPages] = useState([50]);
  const [generatedContent, setGeneratedContent] = useState("");

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
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate AI generation progress
    const intervals = [10, 25, 45, 70, 85, 100];
    for (let i = 0; i < intervals.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(intervals[i]);
    }
    
    // Sample generated content
    setGeneratedContent(`
# LUẬN VĂN TỐT NGHIỆP

## MỞ ĐẦU

### 1.1. Lý do chọn đề tài

Trong bối cảnh công nghệ thông tin phát triển mạnh mẽ như hiện nay, việc nghiên cứu và ứng dụng các công nghệ tiên tiến vào thực tiễn đã trở thành một yêu cầu cấp thiết...

### 1.2. Mục tiêu nghiên cứu

Mục tiêu tổng quát:
- Nghiên cứu và phân tích...
- Xây dựng hệ thống...
- Đánh giá hiệu quả...

### 1.3. Phương pháp nghiên cứu

Luận văn sử dụng các phương pháp nghiên cứu sau:
- Phương pháp nghiên cứu lý thuyết
- Phương pháp thực nghiệm
- Phương pháp thống kê

## CHƯƠNG 1: CƠ SỞ LÝ THUYẾT

### 1.1. Tổng quan tài liệu

Qua việc nghiên cứu các tài liệu trong và ngoài nước, tác giả đã tham khảo được nhiều nghiên cứu liên quan...

### 1.2. Khung lý thuyết

Khung lý thuyết của nghiên cứu được xây dựng dựa trên...

## CHƯƠNG 2: PHƯƠNG PHÁP NGHIÊN CỨU

### 2.1. Thiết kế nghiên cứu

Nghiên cứu được thiết kế theo mô hình...

### 2.2. Đối tượng và phạm vi nghiên cứu

Đối tượng nghiên cứu: ...
Phạm vi nghiên cứu: ...

## CHƯƠNG 3: KẾT QUẢ VÀ THẢO LUẬN

### 3.1. Kết quả nghiên cứu

Sau quá trình nghiên cứu, tác giả đã thu được các kết quả sau...

### 3.2. Thảo luận

Kết quả nghiên cứu cho thấy...

## KẾT LUẬN VÀ KIẾN NGHỊ

### Kết luận

Luận văn đã hoàn thành các mục tiêu đề ra...

### Kiến nghị

Dựa trên kết quả nghiên cứu, tác giả đưa ra một số kiến nghị...

## TÀI LIỆU THAM KHẢO

[1] Nguyễn Văn A (2023), "Nghiên cứu về...", NXB Đại học Quốc gia, Hà Nội.
[2] Trần Thị B (2022), "Phân tích...", Tạp chí Khoa học, số 15.
    `);
    
    setIsGenerating(false);
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
                  placeholder="Nhập chủ đề luận văn của bạn..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Ngành học *</Label>
                <Select>
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
                <Select>
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