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
    const { topic, major, academicLevel, pages, requirements } = await req.json();

    console.log('Generating thesis with Kimi API:', { topic, major, academicLevel, pages });

    // Create a detailed prompt for thesis generation in Vietnamese
    const prompt = `Tạo một luận văn ${academicLevel.toLowerCase()} chuyên nghiệp về chủ đề "${topic}" trong ngành ${major}. 

Yêu cầu:
- Độ dài: khoảng ${pages} trang
- Mức độ học thuật: ${academicLevel}
- Yêu cầu đặc biệt: ${requirements || 'Không có'}

Cấu trúc luận văn phải bao gồm:
1. MỞ ĐẦU (Lý do chọn đề tài, Mục tiêu nghiên cứu, Phương pháp nghiên cứu)
2. CHƯƠNG 1: CƠ SỞ LÝ THUYẾT (Tổng quan tài liệu, Khung lý thuyết)
3. CHƯƠNG 2: PHƯƠNG PHÁP NGHIÊN CỨU (Thiết kế nghiên cứu, Đối tượng và phạm vi)
4. CHƯƠNG 3: KẾT QUẢ VÀ THẢO LUẬN (Kết quả nghiên cứu, Thảo luận)
5. KẾT LUẬN VÀ KIẾN NGHỊ
6. TÀI LIỆU THAM KHẢO

Viết nội dung chi tiết, chuyên nghiệp và phù hợp với tiêu chuẩn học thuật Việt Nam.`;

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