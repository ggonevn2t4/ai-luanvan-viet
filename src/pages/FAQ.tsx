import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqCategories = [
    {
      title: "Câu hỏi chung",
      items: [
        {
          question: "AI Luận Văn hoạt động như thế nào?",
          answer: "AI Luận Văn sử dụng công nghệ AI tiên tiến để phân tích chủ đề của bạn và tạo ra nội dung luận văn theo cấu trúc học thuật chuẩn Việt Nam. Hệ thống sẽ tự động tạo dàn ý, viết nội dung chi tiết, và định dạng theo yêu cầu."
        },
        {
          question: "Luận văn được tạo có chất lượng như thế nào?",
          answer: "Luận văn được tạo bởi AI của chúng tôi tuân thủ nghiêm ngặt các tiêu chuẩn học thuật Việt Nam, có cấu trúc rõ ràng, nội dung logic và phù hợp với từng ngành học. Tuy nhiên, bạn nên xem xét và chỉnh sửa để phù hợp với yêu cầu cụ thể của trường."
        },
        {
          question: "Tôi có thể chỉnh sửa luận văn sau khi tạo không?",
          answer: "Có, bạn hoàn toàn có thể chỉnh sửa luận văn sau khi AI tạo xong. Chúng tôi cung cấp công cụ chỉnh sửa trực tuyến hoặc bạn có thể tải về để chỉnh sửa bằng Word."
        },
        {
          question: "Luận văn có bị trùng lặp với nguồn khác không?",
          answer: "Không, AI của chúng tôi tạo ra nội dung hoàn toàn mới dựa trên chủ đề và yêu cầu của bạn. Chúng tôi cũng cung cấp công cụ kiểm tra đạo văn để đảm bảo tính độc đáo."
        }
      ]
    },
    {
      title: "Tính năng và sử dụng",
      items: [
        {
          question: "Tôi có thể tạo luận văn cho ngành học nào?",
          answer: "Chúng tôi hỗ trợ hầu hết các ngành học phổ biến tại Việt Nam bao gồm: Công nghệ thông tin, Kinh tế, Quản trị kinh doanh, Ngôn ngữ Anh, Văn học, Lịch sử, Triết học, Tâm lý học, Giáo dục, Kỹ thuật, Y học, và Luật học."
        },
        {
          question: "Luận văn có bao nhiều trang?",
          answer: "Bạn có thể chọn số trang từ 10 đến 100 trang tùy theo gói đăng ký. Gói miễn phí hỗ trợ tối đa 20 trang, gói Sinh viên tối đa 50 trang, và gói Chuyên nghiệp tối đa 100 trang."
        },
        {
          question: "Có thể xuất file định dạng nào?",
          answer: "Chúng tôi hỗ trợ xuất file PDF và DOCX. Gói miễn phí chỉ hỗ trợ PDF, các gói trả phí hỗ trợ cả PDF và DOCX để bạn dễ dàng chỉnh sửa."
        },
        {
          question: "Mất bao lâu để tạo xong một luận văn?",
          answer: "Thông thường chỉ mất từ 3-10 phút tùy theo độ dài và độ phức tạp của luận văn. Luận văn càng dài và chuyên sâu thì thời gian tạo có thể lâu hơn."
        }
      ]
    },
    {
      title: "Thanh toán và gói dịch vụ",
      items: [
        {
          question: "Có những gói dịch vụ nào?",
          answer: "Chúng tôi có 3 gói: Cơ bản (miễn phí), Sinh viên (199,000 VNĐ/tháng), và Chuyên nghiệp (499,000 VNĐ/tháng). Mỗi gói có giới hạn và tính năng khác nhau phù hợp với nhu cầu của bạn."
        },
        {
          question: "Có được hoàn tiền không?",
          answer: "Có, chúng tôi có chính sách hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn không hài lòng với dịch vụ."
        },
        {
          question: "Có giảm giá cho sinh viên không?",
          answer: "Có, chúng tôi có chương trình giảm giá đặc biệt cho sinh viên. Liên hệ với chúng tôi qua email support@ailuanvan.vn với thẻ sinh viên để được hỗ trợ."
        },
        {
          question: "Tôi có thể hủy đăng ký bất cứ lúc nào không?",
          answer: "Có, bạn có thể hủy đăng ký bất cứ lúc nào mà không mất phí. Gói của bạn sẽ tiếp tục hoạt động đến hết chu kỳ thanh toán hiện tại."
        }
      ]
    },
    {
      title: "Bảo mật và hỗ trợ",
      items: [
        {
          question: "Thông tin của tôi có được bảo mật không?",
          answer: "Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân và nội dung luận văn của bạn. Dữ liệu được mã hóa và lưu trữ an toàn theo tiêu chuẩn quốc tế."
        },
        {
          question: "Có hỗ trợ khách hàng không?",
          answer: "Có, chúng tôi cung cấp hỗ trợ 24/7 qua email, chat trực tuyến, và hotline. Gói Chuyên nghiệp được hỗ trợ ưu tiên với thời gian phản hồi nhanh hơn."
        },
        {
          question: "Tôi gặp lỗi kỹ thuật thì phải làm sao?",
          answer: "Nếu gặp lỗi kỹ thuật, vui lòng liên hệ ngay với đội hỗ trợ qua email support@ailuanvan.vn hoặc chat trực tuyến. Chúng tôi sẽ khắc phục trong thời gian sớm nhất."
        },
        {
          question: "AI có thể tạo luận văn bằng tiếng Anh không?",
          answer: "Hiện tại chúng tôi chuyên về luận văn tiếng Việt. Tính năng tạo luận văn tiếng Anh sẽ được bổ sung trong các phiên bản tương lai."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background font-vietnamese">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Câu hỏi thường gặp
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tìm câu trả lời cho những thắc mắc phổ biến về AI Luận Văn
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                      <AccordionTrigger className="text-left font-medium hover:text-primary">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto shadow-card">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Không tìm thấy câu trả lời?
              </h2>
              <p className="text-muted-foreground mb-6">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-primary text-white rounded-lg hover:shadow-glow transition-all duration-300"
                >
                  Liên hệ hỗ trợ
                </a>
                <a 
                  href="mailto:support@ailuanvan.vn" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Gửi email
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;