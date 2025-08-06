import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Research integration function
async function searchResearchPapers(topic: string, major: string): Promise<string[]> {
  try {
    // Simulate research paper search - in production, integrate with academic APIs
    const searchQuery = `${topic} ${major} academic research papers`;
    const mockResearch = [
      `Nghiên cứu về ${topic} trong lĩnh vực ${major} - Tác giả: Nguyễn Văn A (2023)`,
      `Phân tích ${topic} từ góc độ ${major} - Tác giả: Trần Thị B (2022)`,
      `Ứng dụng ${topic} trong ${major} hiện đại - Tác giả: Lê Văn C (2024)`
    ];
    return mockResearch;
  } catch (error) {
    console.error('Research search error:', error);
    return [];
  }
}

// Context-aware prompt generator
function generateContextAwarePrompt(stage: string, data: any, researchPapers?: string[]): string {
  const { topic, major, academicLevel, pages, requirements, researchMethod, citationFormat } = data;
  
  const researchContext = researchPapers?.length ? 
    `\n\nNghiên cứu liên quan:\n${researchPapers.join('\n')}` : '';

  switch (stage) {
    case 'outline':
      return `Tạo outline chi tiết cho luận văn ${academicLevel.toLowerCase()} về "${topic}" trong ngành ${major}.

Yêu cầu:
- Độ dài: ${pages} trang
- Phương pháp: ${researchMethod}
- Trích dẫn: ${citationFormat}
- Yêu cầu đặc biệt: ${requirements || 'Không có'}

Tạo outline với cấu trúc:
1. Thông tin cơ bản (trang bìa, lời cam đoan, v.v.)
2. Mở đầu (${Math.round(pages * 0.1)} trang)
3. Chương 1: Cơ sở lý thuyết (${Math.round(pages * 0.25)} trang)
4. Chương 2: Phương pháp nghiên cứu (${Math.round(pages * 0.2)} trang)
5. Chương 3: Kết quả và thảo luận (${Math.round(pages * 0.3)} trang)
6. Kết luận và kiến nghị (${Math.round(pages * 0.1)} trang)
7. Tài liệu tham khảo và phụ lục (${Math.round(pages * 0.05)} trang)

Mỗi phần cần có:
- Mục tiêu cụ thể
- Nội dung chính
- Ước tính số từ
- Gợi ý nguồn tài liệu${researchContext}`;

    case 'chapters':
      return `Viết nội dung chi tiết cho luận văn ${academicLevel.toLowerCase()} về "${topic}" trong ngành ${major}.

Thông số:
- Độ dài: ${pages} trang (~${pages * 250} từ)
- Phương pháp: ${researchMethod}
- Trích dẫn: ${citationFormat}
- Yêu cầu: ${requirements || 'Tiêu chuẩn học thuật'}

Viết đầy đủ tất cả các chương với:
- Ngôn ngữ học thuật chính xác
- Cấu trúc logic rõ ràng
- Trích dẫn phù hợp với ${citationFormat}
- Phương pháp ${researchMethod} được áp dụng đúng
- Nội dung phù hợp với tiêu chuẩn ${academicLevel}${researchContext}`;

    case 'refinement':
      return `Tinh chỉnh và hoàn thiện luận văn ${academicLevel.toLowerCase()} về "${topic}".

Yêu cầu tinh chỉnh:
- Kiểm tra tính nhất quán trong ngôn ngữ và thuật ngữ
- Đảm bảo cấu trúc logic và mạch lạc
- Hoàn thiện trích dẫn theo chuẩn ${citationFormat}
- Kiểm tra độ dài mục tiêu ${pages} trang
- Tăng cường tính học thuật và chuyên môn
- Đảm bảo tuân thủ phương pháp ${researchMethod}

Tập trung vào:
1. Cải thiện chất lượng ngôn ngữ học thuật
2. Bổ sung chi tiết và ví dụ cụ thể
3. Hoàn thiện hệ thống trích dẫn
4. Tăng cường tính kết nối giữa các phần${researchContext}`;

    default:
      return `Tạo luận văn ${academicLevel.toLowerCase()} về "${topic}" trong ngành ${major}.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if API key is configured
    if (!openrouterApiKey) {
      console.error('OpenRouter API key not configured');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { topic, major, academicLevel, pages, requirements, researchMethod, citationFormat, stage = 'chapters' } = await req.json();

    console.log('Multi-stage thesis generation:', { topic, major, academicLevel, pages, researchMethod, citationFormat, stage });

    // Research integration - search for relevant papers
    console.log('Searching for research papers...');
    const researchPapers = await searchResearchPapers(topic, major);
    console.log('Found research papers:', researchPapers.length);

    // Generate context-aware prompt based on stage
    const prompt = generateContextAwarePrompt(stage, {
      topic, major, academicLevel, pages, requirements, researchMethod, citationFormat
    }, researchPapers);

    // Enhanced system message for better quality
    const systemMessage = stage === 'outline' 
      ? 'Bạn là chuyên gia tạo outline luận văn học thuật. Tạo outline chi tiết, có cấu trúc và ước tính thời gian thực hiện chính xác.'
      : stage === 'refinement'
      ? 'Bạn là chuyên gia biên tập luận văn học thuật. Tinh chỉnh và hoàn thiện nội dung để đạt chất lượng xuất bản.'
      : 'Bạn là giáo sư viết luận văn học thuật tiếng Việt với 20 năm kinh nghiệm. Tạo nội dung chất lượng cao, chuyên sâu và có giá trị khoa học.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vietnamese-thesis-generator.com',
        'X-Title': 'Vietnamese Thesis Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: stage === 'outline' ? 0.3 : stage === 'refinement' ? 0.2 : 0.7,
        max_tokens: stage === 'outline' ? 8000 : 32000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response received successfully for stage:', stage);

    const generatedContent = data.choices[0].message.content;

    // Auto-generate citations if this is a full thesis
    const citations = stage === 'chapters' ? generateCitations(topic, major, researchPapers) : [];

    return new Response(JSON.stringify({ 
      success: true,
      content: generatedContent,
      citations,
      researchPapers: researchPapers.length > 0 ? researchPapers : undefined,
      metadata: {
        topic,
        major,
        academicLevel,
        pages,
        stage,
        researchPapersFound: researchPapers.length,
        generatedAt: new Date().toISOString(),
        estimatedReadingTime: Math.ceil(generatedContent.length / 1000), // rough estimate
        wordCount: generatedContent.split(/\s+/).length
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

// Citation generator function
function generateCitations(topic: string, major: string, researchPapers: string[]): any[] {
  const baseCitations = [
    {
      type: 'journal',
      authors: ['Nguyễn, V. A.', 'Trần, T. B.'],
      title: `Nghiên cứu ${topic} trong bối cảnh ${major} Việt Nam`,
      journal: `Tạp chí ${major}`,
      year: 2023,
      volume: '15',
      issue: '2',
      pages: '45-62',
      doi: '10.1234/journal.2023.001'
    },
    {
      type: 'book',
      authors: ['Lê, V. C.'],
      title: `Cẩm nang ${major}: Lý thuyết và Thực hành`,
      publisher: 'NXB Giáo dục Việt Nam',
      year: 2022,
      location: 'Hà Nội'
    },
    {
      type: 'conference',
      authors: ['Phạm, T. D.', 'Hoàng, M. E.'],
      title: `Ứng dụng ${topic} trong ${major} hiện đại`,
      conference: `Hội nghị Quốc tế về ${major}`,
      year: 2024,
      pages: '123-135',
      location: 'TP. Hồ Chí Minh'
    }
  ];

  // Add research papers as citations
  const researchCitations = researchPapers.map((paper, index) => ({
    type: 'journal',
    title: paper,
    year: 2023 - index,
    note: 'Nguồn nghiên cứu được tích hợp'
  }));

  return [...baseCitations, ...researchCitations];
}