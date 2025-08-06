import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Star, Headphones, BookOpen, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-vietnamese-ai.jpg";

const Index = () => {
  const features = [
    {
      icon: Clock,
      title: "Tiết kiệm thời gian",
      description: "Tạo luận văn chất lượng trong vài phút thay vì vài tuần"
    },
    {
      icon: Star,
      title: "Chất lượng cao",
      description: "Nội dung được tối ưu theo tiêu chuẩn học thuật Việt Nam"
    },
    {
      icon: Headphones,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn mọi lúc"
    },
    {
      icon: BookOpen,
      title: "Đa ngành học",
      description: "Hỗ trợ tất cả các chuyên ngành từ Kinh tế đến Công nghệ"
    },
    {
      icon: TrendingUp,
      title: "Tối ưu SEO",
      description: "Nội dung được tối ưu để đạt điểm cao trong đánh giá"
    },
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description: "Thông tin và luận văn của bạn được bảo mật hoàn toàn"
    }
  ];

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Trợ lý AI viết luận văn
                <span className="text-primary-glow"> chuyên nghiệp</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Tạo luận văn chất lượng cao trong vài phút với công nghệ AI tiên tiến. 
                Tiết kiệm thời gian, nâng cao chất lượng học thuật.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild variant="hero" size="xl">
                  <Link to="/write">Bắt đầu viết ngay</Link>
                </Button>
                <Button variant="outline" size="xl" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Xem demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Vietnamese AI Thesis Platform" 
                className="w-full h-auto rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tại sao chọn AI Luận Văn?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Nền tảng AI hàng đầu Việt Nam với tính năng vượt trội
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-card transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Sẵn sàng tạo luận văn của bạn?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Hàng nghìn sinh viên đã tin tưởng và sử dụng AI Luận Văn để hoàn thành luận văn xuất sắc
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="vietnamese" size="xl">
              <Link to="/write">Bắt đầu ngay - Miễn phí</Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/pricing">Xem bảng giá</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
