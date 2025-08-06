import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  thesisId: string;
  format: 'pdf' | 'docx' | 'latex';
  options?: {
    includeTableOfContents?: boolean;
    includeReferences?: boolean;
    fontSize?: number;
    pageMargins?: string;
    citationStyle?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { thesisId, format, options = {} } = await req.json() as ExportRequest;

    console.log('Exporting thesis:', { thesisId, format, options });

    // Get thesis data from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const response = await fetch(`${supabaseUrl}/rest/v1/theses?id=eq.${thesisId}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Không thể tải dữ liệu luận văn');
    }

    const theses = await response.json();
    if (!theses || theses.length === 0) {
      throw new Error('Không tìm thấy luận văn');
    }

    const thesis = theses[0];

    // Generate export content based on format
    let exportContent: string;
    let contentType: string;
    let fileName: string;

    switch (format) {
      case 'pdf':
        exportContent = await generatePDFContent(thesis, options);
        contentType = 'application/pdf';
        fileName = `${sanitizeFileName(thesis.title)}.pdf`;
        break;

      case 'docx':
        exportContent = await generateDOCXContent(thesis, options);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileName = `${sanitizeFileName(thesis.title)}.docx`;
        break;

      case 'latex':
        exportContent = await generateLaTeXContent(thesis, options);
        contentType = 'application/x-latex';
        fileName = `${sanitizeFileName(thesis.title)}.tex`;
        break;

      default:
        throw new Error('Định dạng xuất không được hỗ trợ');
    }

    // Log export activity
    await logExport(thesisId, format, options, exportContent.length);

    return new Response(JSON.stringify({
      success: true,
      content: exportContent,
      fileName,
      contentType,
      size: exportContent.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in export-thesis function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePDFContent(thesis: any, options: any): Promise<string> {
  // For PDF, we'll generate HTML content that can be converted to PDF on the client side
  // Using a clean academic format
  
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${thesis.title}</title>
    <style>
        @page {
            size: A4;
            margin: ${options.pageMargins || '2.5cm'};
        }
        
        body {
            font-family: "Times New Roman", serif;
            font-size: ${options.fontSize || 12}pt;
            line-height: 1.5;
            text-align: justify;
            color: #000;
        }
        
        .cover-page {
            text-align: center;
            page-break-after: always;
            padding-top: 2cm;
        }
        
        .university {
            font-weight: bold;
            font-size: 14pt;
            margin-bottom: 0.5cm;
        }
        
        .faculty {
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 2cm;
        }
        
        .thesis-title {
            font-weight: bold;
            font-size: 16pt;
            text-transform: uppercase;
            margin: 2cm 0;
            line-height: 1.3;
        }
        
        .thesis-type {
            font-size: 14pt;
            margin: 1cm 0;
        }
        
        .author-info {
            margin-top: 3cm;
            font-size: 13pt;
        }
        
        .footer-info {
            position: absolute;
            bottom: 2cm;
            width: 100%;
            text-align: center;
            font-size: 12pt;
        }
        
        h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin: 2cm 0 1cm 0;
            page-break-before: always;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 1.5cm 0 0.5cm 0;
        }
        
        h3 {
            font-size: 13pt;
            font-weight: bold;
            margin: 1cm 0 0.5cm 0;
        }
        
        p {
            margin: 0.5cm 0;
            text-indent: 1cm;
        }
        
        .toc {
            page-break-after: always;
        }
        
        .toc h1 {
            page-break-before: avoid;
        }
        
        .toc-item {
            display: flex;
            justify-content: space-between;
            margin: 0.3cm 0;
            text-indent: 0;
        }
        
        .page-number {
            position: fixed;
            bottom: 1cm;
            right: 50%;
            font-size: 11pt;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="cover-page">
        <div class="university">ĐẠI HỌC QUỐC GIA VIỆT NAM<br>TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN</div>
        <div class="faculty">KHOA ${thesis.subject?.toUpperCase() || 'KHOA HỌC'}</div>
        
        <div class="thesis-title">${thesis.title}</div>
        
        <div class="thesis-type">
            LUẬN VĂN THẠC SĨ ${thesis.subject?.toUpperCase() || ''}
        </div>
        
        <div class="author-info">
            <p><strong>Học viên:</strong> [Tên học viên]</p>
            <p><strong>Mã số học viên:</strong> [MSHV]</p>
            <p><strong>Lớp:</strong> [Lớp]</p>
            <p><strong>Giảng viên hướng dẫn:</strong> [Tên GVHD]</p>
        </div>
        
        <div class="footer-info">
            <p>HÀ NỘI - ${new Date().getFullYear()}</p>
        </div>
    </div>

    ${options.includeTableOfContents ? generateTableOfContents(thesis.content) : ''}
    
    <!-- Main Content -->
    <div class="main-content">
        ${formatContentForPDF(thesis.content)}
    </div>
    
    ${options.includeReferences ? generateReferences(thesis) : ''}
</body>
</html>`;

  return html;
}

async function generateDOCXContent(thesis: any, options: any): Promise<string> {
  // Generate DOCX-compatible content using a simplified approach
  // This would typically use a library like docx, but for now we'll return structured content
  
  const docContent = {
    title: thesis.title,
    content: thesis.content,
    metadata: {
      author: "Generated by AI Thesis Platform",
      subject: thesis.subject,
      keywords: thesis.tags?.join(', ') || '',
      citationStyle: options.citationStyle || thesis.citation_format || 'APA'
    },
    formatting: {
      fontSize: options.fontSize || 12,
      fontFamily: "Times New Roman",
      lineSpacing: 1.5,
      margins: options.pageMargins || "2.5cm"
    }
  };

  // Return as base64 encoded content that can be processed on client side
  return btoa(JSON.stringify(docContent));
}

async function generateLaTeXContent(thesis: any, options: any): Promise<string> {
  const latex = `\\documentclass[12pt,a4paper]{report}
\\usepackage[utf8]{inputenc}
\\usepackage[vietnamese]{babel}
\\usepackage{times}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{cite}
\\usepackage{hyperref}

\\geometry{
    left=${options.pageMargins?.split(' ')[0] || '2.5cm'},
    right=${options.pageMargins?.split(' ')[1] || '2.5cm'},
    top=${options.pageMargins?.split(' ')[2] || '2.5cm'},
    bottom=${options.pageMargins?.split(' ')[3] || '2.5cm'}
}

\\onehalfspacing

\\title{${escapeLatex(thesis.title)}}
\\author{[Tên tác giả]}
\\date{${new Date().getFullYear()}}

\\begin{document}

% Title page
\\begin{titlepage}
\\begin{center}
\\Large \\textbf{ĐẠI HỌC QUỐC GIA VIỆT NAM} \\\\
\\textbf{TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN} \\\\[2cm]

\\textbf{KHOA ${thesis.subject?.toUpperCase() || 'KHOA HỌC'}} \\\\[3cm]

\\huge \\textbf{${escapeLatex(thesis.title)}} \\\\[2cm]

\\Large \\textbf{LUẬN VĂN THẠC SĨ ${thesis.subject?.toUpperCase() || ''}} \\\\[2cm]

\\normalsize
\\textbf{Học viên:} [Tên học viên] \\\\
\\textbf{Mã số học viên:} [MSHV] \\\\
\\textbf{Lớp:} [Lớp] \\\\
\\textbf{Giảng viên hướng dẫn:} [Tên GVHD] \\\\[3cm]

\\vfill
\\textbf{HÀ NỘI - ${new Date().getFullYear()}}
\\end{center}
\\end{titlepage}

${options.includeTableOfContents ? '\\tableofcontents\n\\newpage\n' : ''}

% Main content
${formatContentForLatex(thesis.content)}

${options.includeReferences ? generateLatexReferences(thesis) : ''}

\\end{document}`;

  return latex;
}

function formatContentForPDF(content: string): string {
  if (!content) return '';
  
  return content
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h([123])>/g, '<h$1>')
    .replace(/<\/h([123])><\/p>/g, '</h$1>');
}

function formatContentForLatex(content: string): string {
  if (!content) return '';
  
  return escapeLatex(content)
    .replace(/^#\s+(.+)$/gm, '\\chapter{$1}')
    .replace(/^##\s+(.+)$/gm, '\\section{$1}')
    .replace(/^###\s+(.+)$/gm, '\\subsection{$1}')
    .replace(/\n\n/g, '\n\n\\par\n');
}

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[{}]/g, '\\$&')
    .replace(/[%$&#^_~]/g, '\\$&')
    .replace(/\textbackslash\{\}/g, '\\textbackslash{}');
}

function generateTableOfContents(content: string): string {
  const toc = `
    <div class="toc">
        <h1>MỤC LỤC</h1>
        <div class="toc-item"><span>LỜI CAM ĐOAN</span><span>i</span></div>
        <div class="toc-item"><span>LỜI CẢM ƠN</span><span>ii</span></div>
        <div class="toc-item"><span>MỤC LỤC</span><span>iii</span></div>
        <div class="toc-item"><span>DANH MỤC CÁC TỪ VIẾT TẮT</span><span>iv</span></div>
        <div class="toc-item"><span>MỞ ĐẦU</span><span>1</span></div>
        <div class="toc-item"><span>CHƯƠNG 1: CƠ SỞ LÝ THUYẾT</span><span>5</span></div>
        <div class="toc-item"><span>CHƯƠNG 2: PHƯƠNG PHÁP NGHIÊN CỨU</span><span>15</span></div>
        <div class="toc-item"><span>CHƯƠNG 3: KẾT QUẢ VÀ THẢO LUẬN</span><span>25</span></div>
        <div class="toc-item"><span>KẾT LUẬN</span><span>40</span></div>
        <div class="toc-item"><span>TÀI LIỆU THAM KHẢO</span><span>42</span></div>
    </div>`;
  
  return toc;
}

function generateReferences(thesis: any): string {
  return `
    <h1>TÀI LIỆU THAM KHẢO</h1>
    <p>[1] Tài liệu tham khảo sẽ được tự động tạo dựa trên các trích dẫn trong luận văn.</p>
    <p>[2] Định dạng trích dẫn: ${thesis.citation_format || 'APA'}</p>
  `;
}

function generateLatexReferences(thesis: any): string {
  return `
\\begin{thebibliography}{99}
\\bibitem{ref1} Tài liệu tham khảo sẽ được tự động tạo dựa trên các trích dẫn trong luận văn.
\\bibitem{ref2} Định dạng trích dẫn: ${thesis.citation_format || 'APA'}
\\end{thebibliography}
  `;
}

function sanitizeFileName(title: string): string {
  return title
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

async function logExport(thesisId: string, format: string, options: any, fileSize: number) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/export_logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        thesis_id: thesisId,
        export_format: format,
        export_options: options,
        file_size: fileSize,
        status: 'completed',
        export_duration: Date.now()
      })
    });
  } catch (error) {
    console.error('Error logging export:', error);
  }
}