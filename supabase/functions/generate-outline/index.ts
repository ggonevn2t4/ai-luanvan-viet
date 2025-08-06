import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const kimiApiKey = Deno.env.get('KIMI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutlineRequest {
  topic: string;
  major: string;
  academicLevel: string;
  researchMethod: string;
  pages: number;
  specificRequirements?: string;
  outlineType: 'basic' | 'detailed' | 'chapter-based';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      topic, 
      major, 
      academicLevel, 
      researchMethod, 
      pages, 
      specificRequirements,
      outlineType = 'detailed'
    } = await req.json() as OutlineRequest;

    console.log('Generating outline with Kimi API:', { 
      topic, major, academicLevel, researchMethod, pages, outlineType 
    });

    // Create specialized prompts based on major and outline type
    const prompt = createOutlinePrompt(
      topic, major, academicLevel, researchMethod, pages, specificRequirements, outlineType
    );

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
            content: 'Bạn là chuyên gia tạo dàn bài luận văn học thuật tiếng Việt với kinh nghiệm sâu rộng trong từng ngành học. Hãy tạo ra những dàn bài chi tiết, logic và phù hợp với chuẩn giáo dục Việt Nam.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kimi API error:', errorText);
      throw new Error(`Kimi API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Kimi API response received successfully');

    const generatedOutline = data.choices[0].message.content;

    // Parse and structure the outline
    const structuredOutline = parseOutline(generatedOutline, outlineType);

    return new Response(JSON.stringify({
      success: true,
      outline: structuredOutline,
      rawOutline: generatedOutline,
      metadata: {
        topic,
        major,
        academicLevel,
        researchMethod,
        pages,
        outlineType,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-outline function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createOutlinePrompt(
  topic: string, 
  major: string, 
  academicLevel: string, 
  researchMethod: string, 
  pages: number, 
  specificRequirements: string | undefined,
  outlineType: string
): string {
  // Get field-specific outline structure
  const fieldStructure = getFieldSpecificStructure(major);
  
  let detailLevel = '';
  switch (outlineType) {
    case 'basic':
      detailLevel = 'Tạo dàn bài cơ bản với các mục chính';
      break;
    case 'detailed':
      detailLevel = 'Tạo dàn bài chi tiết với các mục con và nội dung cụ thể cho từng phần';
      break;
    case 'chapter-based':
      detailLevel = 'Tạo dàn bài theo từng chương với nội dung chi tiết và mục tiêu rõ ràng cho mỗi chương';
      break;
  }

  return `Tạo dàn bài luận văn ${academicLevel.toLowerCase()} chuyên nghiệp cho chủ đề "${topic}" trong ngành ${major}.

THÔNG TIN CƠ BẢN:
- Chủ đề: ${topic}
- Ngành học: ${major}
- Mức độ: ${academicLevel}
- Phương pháp nghiên cứu: ${researchMethod}
- Số trang dự kiến: ${pages} trang
- Yêu cầu đặc biệt: ${specificRequirements || 'Không có'}

YÊU CẦU DÀNG BÀI:
${detailLevel}

CẤU TRÚC LUẬN VĂN THEO CHUẨN VIỆT NAM:
${fieldStructure}

NGUYÊN TẮC TẠO DÀN BÀI:
1. Phù hợp với đặc thù ngành ${major}
2. Áp dụng phương pháp ${researchMethod}
3. Đảm bảo tính logic và mạch lạc
4. Nội dung phù hợp với ${pages} trang
5. Tuân thủ chuẩn học thuật Việt Nam
6. Có tính khả thi và thực tiễn cao

ĐỊNH DẠNG ĐẦU RA:
- Sử dụng số thứ tự và đầu dòng rõ ràng
- Mỗi mục có mô tả ngắn gọn về nội dung
- Ước tính số trang cho từng phần
- Đưa ra gợi ý về tài liệu tham khảo chính

Hãy tạo dàn bài chi tiết và chuyên nghiệp.`;
}

function getFieldSpecificStructure(major: string): string {
  const structures: { [key: string]: string } = {
    "Công nghệ thông tin": `
1. MỞ ĐẦU (2-3 trang)
   - Đặt vấn đề và lý do chọn đề tài
   - Mục tiêu và nhiệm vụ nghiên cứu
   - Đối tượng và phạm vi nghiên cứu
   - Phương pháp nghiên cứu
   - Ý nghĩa khoa học và thực tiễn

2. CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ (25-30%)
   - Tổng quan về lĩnh vực nghiên cứu
   - Các công nghệ và thuật toán liên quan
   - Phân tích các giải pháp hiện có
   - Đánh giá ưu nhược điểm

3. CHƯƠNG 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG (30-35%)
   - Phân tích yêu cầu hệ thống
   - Thiết kế kiến trúc tổng thể
   - Thiết kế cơ sở dữ liệu
   - Thiết kế giao diện người dùng

4. CHƯƠNG 3: XÂY DỰNG VÀ ĐÁNH GIÁ (25-30%)
   - Cài đặt và lập trình
   - Kiểm thử hệ thống
   - Đánh giá hiệu năng
   - So sánh với các giải pháp khác

5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (2-3 trang)`,

    "Kinh tế học": `
1. MỞ ĐẦU (2-3 trang)
   - Đặt vấn đề nghiên cứu
   - Tính cấp thiết của đề tài
   - Mục tiêu và nhiệm vụ nghiên cứu
   - Phạm vi nghiên cứu (thời gian, không gian)
   - Phương pháp nghiên cứu

2. CHƯƠNG 1: CƠ SỞ LÝ THUYẾT (25-30%)
   - Tổng quan lý thuyết kinh tế liên quan
   - Các mô hình kinh tế áp dụng
   - Kinh nghiệm quốc tế
   - Thực tiễn tại Việt Nam

3. CHƯƠNG 2: THỰC TRẠNG VÀ PHÂN TÍCH (30-35%)
   - Hiện trạng của vấn đề nghiên cứu
   - Thu thập và xử lý dữ liệu
   - Phân tích định lượng/định tính
   - Đánh giá và nhận xét

4. CHƯƠNG 3: GIẢI PHÁP VÀ KHUYẾN NGHỊ (25-30%)
   - Đề xuất các giải pháp
   - Phân tích tác động kinh tế
   - Điều kiện thực hiện
   - Dự báo và khuyến nghị chính sách

5. KẾT LUẬN (2-3 trang)`,

    "Quản trị kinh doanh": `
1. MỞ ĐẦU (2-3 trang)
   - Đặt vấn đề và lý do chọn đề tài
   - Mục tiêu nghiên cứu
   - Đối tượng và phạm vi nghiên cứu
   - Phương pháp nghiên cứu
   - Ý nghĩa lý luận và thực tiễn

2. CHƯƠNG 1: CƠ SỞ LÝ THUYẾT (25-30%)
   - Khái niệm và lý thuyết cơ bản
   - Các mô hình quản trị
   - Kinh nghiệm của các doanh nghiệp
   - Xu hướng phát triển

3. CHƯƠNG 2: THỰC TRẠNG VÀ PHÂN TÍCH (30-35%)
   - Giới thiệu đối tượng nghiên cứu
   - Phân tích thực trạng quản trị
   - Đánh giá hiệu quả hoạt động
   - Phát hiện vấn đề tồn tại

4. CHƯƠNG 3: ĐỀ XUẤT GIẢI PHÁP (25-30%)
   - Các giải pháp quản trị
   - Kế hoạch triển khai
   - Đánh giá tác động
   - Điều kiện thành công

5. KẾT LUẬN VÀ KIẾN NGHỊ (2-3 trang)`
  };

  return structures[major] || structures["Kinh tế học"];
}

function parseOutline(rawOutline: string, outlineType: string): any {
  // Parse the generated outline into structured format
  const lines = rawOutline.split('\n').filter(line => line.trim());
  const structure = {
    type: outlineType,
    sections: [] as any[],
    estimatedPages: 0
  };

  let currentSection: any = null;
  let currentSubsection: any = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Main sections (1., 2., CHƯƠNG 1:, etc.)
    if (/^(\d+\.|CHƯƠNG \d+:|MỞ ĐẦU|KẾT LUẬN)/i.test(trimmed)) {
      if (currentSection) {
        structure.sections.push(currentSection);
      }
      
      currentSection = {
        title: trimmed.replace(/^\d+\.\s*/, '').replace(/^CHƯƠNG \d+:\s*/i, ''),
        content: [],
        subsections: [],
        estimatedPages: extractPageEstimate(trimmed)
      };
      currentSubsection = null;
    }
    // Subsections (1.1, 1.2, -, etc.)
    else if (/^(\d+\.\d+|\-|\•)/.test(trimmed)) {
      if (currentSection) {
        const subsection = {
          title: trimmed.replace(/^(\d+\.\d+|\-|\•)\s*/, ''),
          content: [],
          estimatedPages: extractPageEstimate(trimmed)
        };
        currentSection.subsections.push(subsection);
        currentSubsection = subsection;
      }
    }
    // Content lines
    else if (trimmed && currentSection) {
      if (currentSubsection) {
        currentSubsection.content.push(trimmed);
      } else {
        currentSection.content.push(trimmed);
      }
    }
  }

  // Add the last section
  if (currentSection) {
    structure.sections.push(currentSection);
  }

  // Calculate total estimated pages
  structure.estimatedPages = structure.sections.reduce(
    (total: number, section: any) => total + (section.estimatedPages || 0), 0
  );

  return structure;
}

function extractPageEstimate(text: string): number {
  const match = text.match(/(\d+)(?:-(\d+))?\s*trang/i);
  if (match) {
    return match[2] ? parseInt(match[2]) : parseInt(match[1]);
  }
  return 0;
}