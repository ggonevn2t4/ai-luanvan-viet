import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Award, Heart } from "lucide-react";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Nguyễn Văn An",
      role: "CEO & Founder",
      description: "Tiến sĩ Công nghệ thông tin, 15 năm kinh nghiệm nghiên cứu AI"
    },
    {
      name: "TS. Trần Thị Bình",
      role: "CTO",
      description: "Chuyên gia AI và Machine Learning, cựu nhân viên Google"
    },
    {
      name: "ThS. Lê Văn Cường",
      role: "Trưởng phòng Sản phẩm",
      description: "Thạc sĩ Quản trị kinh doanh, chuyên gia về trải nghiệm người dùng"
    },
    {
      name: "TS. Phạm Thị Dung",
      role: "Giám đốc Học thuật",
      description: "Tiến sĩ Ngôn ngữ học, chuyên gia về văn phong học thuật Việt Nam"
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Sứ mệnh",
      description: "Giúp sinh viên Việt Nam tiếp cận công nghệ AI tiên tiến để nâng cao chất lượng học tập và nghiên cứu."
    },
    {
      icon: Award,
      title: "Tầm nhìn",
      description: "Trở thành nền tảng AI hỗ trợ học tập hàng đầu Việt Nam, góp phần nâng cao chất lượng giáo dục."
    },
    {
      icon: Heart,
      title: "Giá trị cốt lõi",
      description: "Chính trực, sáng tạo, và luôn đặt lợi ích của sinh viên lên hàng đầu trong mọi quyết định."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Về chúng tôi
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AI Luận Văn được thành lập với sứ mệnh democratize việc tiếp cận công nghệ AI 
            cho sinh viên Việt Nam, giúp các bạn tạo ra những luận văn chất lượng cao 
            một cách hiệu quả và chuyên nghiệp.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Câu chuyện của chúng tôi
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                AI Luận Văn ra đời từ chính trải nghiệm của những sinh viên, nghiên cứu sinh 
                Việt Nam khi phải đối mặt với áp lực viết luận văn, luận án trong thời gian hạn chế.
              </p>
              <p>
                Với sự phát triển mạnh mẽ của công nghệ AI, chúng tôi nhận ra cơ hội to lớn 
                để tạo ra một công cụ hỗ trợ thông minh, giúp sinh viên tiết kiệm thời gian 
                và nâng cao chất lượng nghiên cứu.
              </p>
              <p>
                Từ năm 2023, đội ngũ chuyên gia AI và giáo dục của chúng tôi đã không ngừng 
                nghiên cứu và phát triển để tạo ra nền tảng AI Luận Văn - công cụ hỗ trợ 
                viết luận văn thông minh nhất Việt Nam.
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Thành tựu đạt được
                </h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Hơn 10,000 sinh viên tin tưởng sử dụng</li>
                  <li>• 50,000+ luận văn được tạo thành công</li>
                  <li>• 95% khách hàng hài lòng với kết quả</li>
                  <li>• Hỗ trợ 12+ ngành học chính</li>
                  <li>• Tích hợp AI model tiên tiến nhất thế giới</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Cam kết chất lượng
                </h3>
                <p className="text-muted-foreground">
                  Chúng tôi cam kết cung cấp nội dung luận văn chất lượng cao, 
                  tuân thủ tiêu chuẩn học thuật Việt Nam và bảo mật thông tin 
                  tuyệt đối cho người dùng.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Sứ mệnh & Giá trị
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="shadow-card text-center hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Đội ngũ chuyên gia
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="shadow-card text-center hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center bg-gradient-card p-12 rounded-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Muốn tìm hiểu thêm?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300"
            >
              Liên hệ với chúng tôi
            </a>
            <a 
              href="/write" 
              className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              Bắt đầu dùng thử
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;