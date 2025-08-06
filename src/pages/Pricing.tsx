import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Star } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Miễn phí",
      price: "0",
      period: "",
      description: "Dành cho sinh viên mới bắt đầu",
      features: [
        "1 luận văn / tháng",
        "Tối đa 20 trang",
        "Hỗ trợ cơ bản",
        "Định dạng PDF",
        "3 ngành học cơ bản"
      ],
      buttonText: "Bắt đầu miễn phí",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Chuyên nghiệp",
      price: "300,000",
      period: "VNĐ / tháng", 
      description: "Phù hợp cho thạc sĩ, tiến sĩ",
      features: [
        "Không giới hạn luận văn",
        "Tối đa 100 trang",
        "Hỗ trợ ưu tiên",
        "Tất cả định dạng",
        "Tư vấn chuyên gia",
        "Kiểm tra đạo văn nâng cao",
        "Trích dẫn tự động",
        "Backup đám mây"
      ],
      buttonText: "Chọn gói Chuyên nghiệp",
      buttonVariant: "vietnamese" as const,
      popular: true
    },
    {
      name: "Chuyên nghiệp", 
      price: "3,000,000",
      period: "VNĐ / năm",
      description: "Tiết kiệm 17% với gói năm",
      features: [
        "Không giới hạn luận văn",
        "Tối đa 100 trang",
        "Hỗ trợ ưu tiên",
        "Tất cả định dạng",
        "Tư vấn chuyên gia",
        "Kiểm tra đạo văn nâng cao", 
        "Trích dẫn tự động",
        "Backup đám mây",
        "Tiết kiệm 500,000 VNĐ"
      ],
      buttonText: "Chọn gói năm",
      buttonVariant: "outline" as const,
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Bảng giá
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu học tập của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative shadow-card hover:shadow-elegant transition-all duration-300 ${
                plan.popular ? 'border-primary shadow-glow scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Phổ biến nhất
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </CardTitle>
                <div className="flex items-center justify-center mb-2">
                  <span className="text-4xl font-bold text-primary">
                    {plan.price === "0" ? "Miễn phí" : `${plan.price.toLocaleString()}`}
                  </span>
                  {plan.price !== "0" && (
                    <span className="text-muted-foreground ml-2">VNĐ</span>
                  )}
                </div>
                <p className="text-muted-foreground">{plan.period}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-success mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={plan.buttonVariant}
                  size="lg"
                  className="w-full mt-6"
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Câu hỏi thường gặp về giá
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Tôi có thể hủy đăng ký bất cứ lúc nào?
              </h3>
              <p className="text-muted-foreground">
                Có, bạn có thể hủy đăng ký bất cứ lúc nào mà không mất phí. 
                Gói của bạn sẽ tiếp tục hoạt động đến hết chu kỳ thanh toán.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Có được hoàn tiền không?
              </h3>
              <p className="text-muted-foreground">
                Chúng tôi cung cấp chính sách hoàn tiền 100% trong vòng 7 ngày 
                đầu tiên nếu bạn không hài lòng với dịch vụ.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Tôi có thể nâng cấp gói sau không?
              </h3>
              <p className="text-muted-foreground">
                Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. 
                Thay đổi sẽ có hiệu lực ngay lập tức.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-foreground mb-2">
                Có giảm giá cho sinh viên không?
              </h3>
              <p className="text-muted-foreground">
                Có, chúng tôi có chương trình giảm giá đặc biệt cho sinh viên. 
                Liên hệ để biết thêm chi tiết.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;