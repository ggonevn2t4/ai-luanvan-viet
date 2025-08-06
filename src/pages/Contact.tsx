import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "support@ailuanvan.vn",
      details: "Phản hồi trong vòng 2 giờ"
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "1900 1234",
      details: "Hỗ trợ 24/7"
    },
    {
      icon: MessageCircle,
      title: "Chat trực tuyến",
      description: "Trò chuyện ngay",
      details: "Phản hồi tức thì"
    },
    {
      icon: MapPin,
      title: "Địa chỉ",
      description: "Tầng 10, Tòa nhà ABC",
      details: "Quận 1, TP.HCM"
    }
  ];

  const inquiryTypes = [
    "Hỗ trợ kỹ thuật",
    "Tư vấn gói dịch vụ",
    "Khiếu nại/Phản hồi",
    "Hợp tác kinh doanh",
    "Báo lỗi",
    "Đề xuất tính năng",
    "Khác"
  ];

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, 
            chúng tôi sẽ phản hồi sớm nhất có thể.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Thông tin liên hệ
            </h2>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {method.title}
                        </h3>
                        <p className="text-primary font-medium mb-1">
                          {method.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.details}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Business Hours */}
            <Card className="shadow-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Giờ làm việc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Thứ 2 - Thứ 6:</span>
                    <span className="font-medium">8:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thứ 7:</span>
                    <span className="font-medium">8:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chủ nhật:</span>
                    <span className="font-medium">Nghỉ</span>
                  </div>
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-primary font-medium">
                      📞 Hỗ trợ khẩn cấp 24/7 qua hotline
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Gửi tin nhắn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input 
                      id="fullName"
                      placeholder="Nguyễn Văn A"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input 
                      id="phone"
                      placeholder="0123 456 789"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Loại yêu cầu *</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Chọn loại yêu cầu" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Tiêu đề *</Label>
                  <Input 
                    id="subject"
                    placeholder="Tiêu đề tin nhắn của bạn"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Nội dung tin nhắn *</Label>
                  <Textarea 
                    id="message"
                    placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu của bạn..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div className="flex items-start space-x-2">
                  <input 
                    type="checkbox" 
                    id="agreement" 
                    className="mt-1"
                  />
                  <Label htmlFor="agreement" className="text-sm">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-primary hover:underline">
                      Chính sách bảo mật
                    </a>{" "}
                    và{" "}
                    <a href="#" className="text-primary hover:underline">
                      Điều khoản sử dụng
                    </a>{" "}
                    của AI Luận Văn.
                  </Label>
                </div>

                <Button 
                  variant="vietnamese" 
                  size="lg" 
                  className="w-full md:w-auto"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi tin nhắn
                </Button>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="shadow-card mt-6">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-foreground mb-2">
                  Có thể bạn quan tâm
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tìm câu trả lời nhanh cho những thắc mắc phổ biến
                </p>
                <Button variant="outline" asChild>
                  <a href="/faq">Xem câu hỏi thường gặp</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section (Placeholder) */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Vị trí văn phòng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Bản đồ văn phòng AI Luận Văn
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tầng 10, Tòa nhà ABC, Quận 1, TP.HCM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;