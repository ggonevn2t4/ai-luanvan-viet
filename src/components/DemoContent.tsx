import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Zap, Star, Clock, CheckCircle } from "lucide-react";

const DemoContent = () => {
  const demoTheses = [
    {
      id: "demo-1",
      title: "Ứng dụng trí tuệ nhân tạo trong quản lý dự án phần mềm",
      major: "Công nghệ thông tin",
      academicLevel: "Thạc sĩ",
      pages: 85,
      status: "completed",
      progress: 100,
      generatedAt: "2024-01-15",
      preview: "Nghiên cứu này tập trung vào việc phân tích và đánh giá hiệu quả của các công cụ AI trong việc quản lý dự án phần mềm..."
    },
    {
      id: "demo-2", 
      title: "Phân tích tác động của thương mại điện tử đến kinh tế Việt Nam",
      major: "Kinh tế học",
      academicLevel: "Cử nhân",
      pages: 65,
      status: "in-progress",
      progress: 75,
      generatedAt: "2024-01-20",
      preview: "Luận văn nghiên cứu sự phát triển mạnh mẽ của thương mại điện tử và những tác động tích cực đến nền kinh tế..."
    },
    {
      id: "demo-3",
      title: "Chiến lược marketing số cho doanh nghiệp vừa và nhỏ",
      major: "Quản trị kinh doanh", 
      academicLevel: "Thạc sĩ",
      pages: 92,
      status: "completed",
      progress: 100,
      generatedAt: "2024-01-10",
      preview: "Nghiên cứu các chiến lược marketing số hiệu quả dành cho doanh nghiệp vừa và nhỏ trong bối cảnh chuyển đổi số..."
    }
  ];

  const handlePreviewThesis = (thesisId: string) => {
    // In a real app, this would navigate to the thesis preview
    window.open(`/demo/thesis/${thesisId}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
          <Star className="w-4 h-4 mr-2" />
          Nội dung Demo
        </Badge>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Khám phá các mẫu luận văn được tạo bởi AI
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Dưới đây là một số mẫu luận văn đã được tạo thành công bằng hệ thống AI của chúng tôi.
          Hãy xem qua để hiểu rõ hơn về chất lượng và khả năng của công cụ.
        </p>
      </div>

      {/* Demo Theses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demoTheses.map((thesis) => (
          <Card key={thesis.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between">
                <Badge 
                  variant={thesis.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {thesis.status === 'completed' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Hoàn thành
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Đang viết
                    </>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">{thesis.pages} trang</span>
              </div>
              
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {thesis.title}
              </CardTitle>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {thesis.major}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  {thesis.academicLevel}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <CardDescription className="text-sm leading-relaxed line-clamp-3">
                {thesis.preview}
              </CardDescription>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-medium">{thesis.progress}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                    style={{ width: `${thesis.progress}%` }}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handlePreviewThesis(thesis.id)}
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
              >
                <Zap className="w-4 h-4 mr-2" />
                Xem trước luận văn
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center pt-8">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Sẵn sàng tạo luận văn của riêng bạn?</h3>
              <p className="text-muted-foreground">
                Bắt đầu với một chủ đề và để AI giúp bạn tạo ra một luận văn chất lượng cao
              </p>
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <BookOpen className="w-5 h-5 mr-2" />
                Bắt đầu viết luận văn
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoContent;