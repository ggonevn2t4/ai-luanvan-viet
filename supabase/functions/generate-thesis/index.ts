import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const kimiApiKey = Deno.env.get('KIMI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, major, academicLevel, pages, requirements, researchMethod, citationFormat } = await req.json();

    console.log('Generating thesis with Kimi API:', { topic, major, academicLevel, pages, researchMethod, citationFormat });

    // Create a detailed prompt for thesis generation in Vietnamese
    const prompt = `Tạo một luận văn ${academicLevel.toLowerCase()} chuyên nghiệp về chủ đề "${topic}" trong ngành ${major}. 

Yêu cầu chi tiết:
- Độ dài: khoảng ${pages} trang
- Mức độ học thuật: ${academicLevel}
- Phương pháp nghiên cứu: ${researchMethod}
- Định dạng trích dẫn: ${citationFormat}
- Yêu cầu đặc biệt: ${requirements || 'Không có'}

Cấu trúc luận văn phải tuân thủ chuẩn học thuật Việt Nam:

1. TRANG BÌA
2. LỜI CAM ĐOAN
3. LỜI CẢM ơN
4. MỤC LỤC
5. DANH MỤC CÁC TỪ VIẾT TẮT
6. DANH MỤC BẢNG, BIỂU
7. DANH MỤC HÌNH ẢNH

8. MỞ ĐẦU
   - Lý do chọn đề tài
   - Mục tiêu nghiên cứu (tổng quát và cụ thể)
   - Đối tượng và phạm vi nghiên cứu
   - Phương pháp nghiên cứu: ${researchMethod}
   - Ý nghĩa khoa học và thực tiễn
   - Cấu trúc luận văn

9. CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN NGHIÊN CỨU
   - Tổng quan các nghiên cứu liên quan
   - Khung lý thuyết cơ sở
   - Các khái niệm chính
   - Khoảng trống nghiên cứu

10. CHƯƠNG 2: PHƯƠNG PHÁP NGHIÊN CỨU
    - Thiết kế nghiên cứu (${researchMethod})
    - Đối tượng và mẫu nghiên cứu
    - Công cụ thu thập dữ liệu
    - Phương pháp phân tích dữ liệu
    - Đảm bảo tính đáng tin cậy và tính giá trị

11. CHƯƠNG 3: KẾT QUẢ NGHIÊN CỨU VÀ THẢO LUẬN
    - Trình bày kết quả nghiên cứu
    - Phân tích và giải thích kết quả
    - Thảo luận so sánh với các nghiên cứu trước
    - Hạn chế của nghiên cứu

12. KẾT LUẬN VÀ KIẾN NGHỊ
    - Tóm tắt những phát hiện chính
    - Đóng góp khoa học và thực tiễn
    - Kiến nghị cho nghiên cứu tiếp theo
    - Kiến nghị cho thực tiễn

13. TÀI LIỆU THAM KHẢO (theo định dạng ${citationFormat})

14. PHỤ LỤC

Lưu ý quan trọng:
- Sử dụng ngôn ngữ học thuật chính xác và trang trọng
- Đảm bảo tính logic và mạch lạc trong trình bày
- Áp dụng đúng phương pháp ${researchMethod}
- Trích dẫn theo chuẩn ${citationFormat}
- Nội dung phải phù hợp với tiêu chuẩn giáo dục đại học Việt Nam
- Đảm bảo tính nguyên gốc và chất lượng học thuật cao`;

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${kimiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'Bạn là một chuyên gia viết luận văn học thuật tiếng Việt. Hãy tạo ra những luận văn chất lượng cao, có cấu trúc rõ ràng và nội dung chuyên sâu.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API error:', errorText);
      throw new Error(`Kimi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Kimi API response received successfully');

    const generatedContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      success: true,
      content: generatedContent,
      metadata: {
        topic,
        major,
        academicLevel,
        pages,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-thesis function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});