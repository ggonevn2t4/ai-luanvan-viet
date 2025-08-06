import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, Header, Footer, PageNumber } from 'docx';
import { saveAs } from 'file-saver';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'latex';
  includeTableOfContents?: boolean;
  includeReferences?: boolean;
  fontSize?: number;
  pageMargins?: string;
  citationStyle?: string;
  fontFamily?: string;
  lineSpacing?: number;
  pageHeader?: string;
  pageFooter?: string;
}

export interface ThesisData {
  id: string;
  title: string;
  content: string;
  subject?: string;
  tags?: string[];
  citation_format?: string;
  author?: {
    name?: string;
    studentId?: string;
    class?: string;
    supervisor?: string;
  };
  chapters?: Array<{
    title: string;
    content: string;
    chapter_number: number;
  }>;
}

export class HighQualityExporter {
  private static instance: HighQualityExporter;

  static getInstance(): HighQualityExporter {
    if (!HighQualityExporter.instance) {
      HighQualityExporter.instance = new HighQualityExporter();
    }
    return HighQualityExporter.instance;
  }

  private createPDFStyles(options: ExportOptions) {
    return {
      fontSize: options.fontSize || 12,
      fontFamily: options.fontFamily || 'Times-Roman',
      lineHeight: (options.lineSpacing || 1.5) * (options.fontSize || 12),
      margins: this.parseMargins(options.pageMargins || '2.5cm'),
    };
  }

  private parseMargins(marginString: string) {
    const margin = parseFloat(marginString.replace(/[^\d.]/g, '')) || 2.5;
    const marginPt = margin * 28.35; // Convert cm to points
    return {
      top: marginPt,
      bottom: marginPt,
      left: marginPt,
      right: marginPt
    };
  }

  async exportToPDF(thesis: ThesisData, options: ExportOptions): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const styles = this.createPDFStyles(options);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - styles.margins.left - styles.margins.right;

    // Set font
    pdf.setFont(styles.fontFamily);
    
    // Cover page
    this.addCoverPage(pdf, thesis, styles, pageWidth, pageHeight);

    // Table of contents (if requested)
    if (options.includeTableOfContents) {
      pdf.addPage();
      this.addTableOfContents(pdf, thesis, styles, contentWidth);
    }

    // Main content
    pdf.addPage();
    this.addMainContent(pdf, thesis, styles, contentWidth, pageHeight);

    // References (if requested)
    if (options.includeReferences) {
      pdf.addPage();
      this.addReferences(pdf, thesis, styles, contentWidth);
    }

    // Add page numbers
    this.addPageNumbers(pdf, styles);

    // Save the PDF
    const fileName = `${this.sanitizeFileName(thesis.title)}.pdf`;
    pdf.save(fileName);
  }

  private addCoverPage(pdf: jsPDF, thesis: ThesisData, styles: any, pageWidth: number, pageHeight: number) {
    const centerX = pageWidth / 2;
    let currentY = styles.margins.top + 60;

    // University header
    pdf.setFontSize(14);
    pdf.setFont(styles.fontFamily, 'bold');
    pdf.text('ĐẠI HỌC QUỐC GIA VIỆT NAM', centerX, currentY, { align: 'center' });
    currentY += 20;
    pdf.text('TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN', centerX, currentY, { align: 'center' });
    currentY += 60;

    // Faculty
    pdf.setFontSize(13);
    const faculty = `KHOA ${thesis.subject?.toUpperCase() || 'KHOA HỌC'}`;
    pdf.text(faculty, centerX, currentY, { align: 'center' });
    currentY += 80;

    // Title
    pdf.setFontSize(16);
    pdf.setFont(styles.fontFamily, 'bold');
    const titleLines = pdf.splitTextToSize(thesis.title.toUpperCase(), 400);
    titleLines.forEach((line: string) => {
      pdf.text(line, centerX, currentY, { align: 'center' });
      currentY += 24;
    });
    currentY += 40;

    // Thesis type
    pdf.setFontSize(14);
    const thesisType = `LUẬN VĂN THẠC SĨ ${thesis.subject?.toUpperCase() || ''}`;
    pdf.text(thesisType, centerX, currentY, { align: 'center' });
    currentY += 100;

    // Author info
    pdf.setFontSize(12);
    pdf.setFont(styles.fontFamily, 'normal');
    const authorInfo = [
      `Học viên: ${thesis.author?.name || '[Tên học viên]'}`,
      `Mã số học viên: ${thesis.author?.studentId || '[MSHV]'}`,
      `Lớp: ${thesis.author?.class || '[Lớp]'}`,
      `Giảng viên hướng dẫn: ${thesis.author?.supervisor || '[Tên GVHD]'}`
    ];
    
    authorInfo.forEach(info => {
      pdf.text(info, centerX, currentY, { align: 'center' });
      currentY += 24;
    });

    // Footer
    const footerY = pageHeight - styles.margins.bottom - 40;
    pdf.setFont(styles.fontFamily, 'bold');
    pdf.text(`HÀ NỘI - ${new Date().getFullYear()}`, centerX, footerY, { align: 'center' });
  }

  private addTableOfContents(pdf: jsPDF, thesis: ThesisData, styles: any, contentWidth: number) {
    let currentY = styles.margins.top;

    pdf.setFontSize(16);
    pdf.setFont(styles.fontFamily, 'bold');
    pdf.text('MỤC LỤC', styles.margins.left, currentY);
    currentY += 40;

    pdf.setFontSize(12);
    pdf.setFont(styles.fontFamily, 'normal');

    const tocItems = [
      { title: 'LỜI CAM ĐOAN', page: 'i' },
      { title: 'LỜI CẢM ƠN', page: 'ii' },
      { title: 'MỤC LỤC', page: 'iii' },
      { title: 'DANH MỤC CÁC TỪ VIẾT TẮT', page: 'iv' },
      { title: 'MỞ ĐẦU', page: '1' },
      { title: 'CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN NGHIÊN CỨU', page: '5' },
      { title: 'CHƯƠNG 2: PHƯƠNG PHÁP NGHIÊN CỨU', page: '15' },
      { title: 'CHƯƠNG 3: KẾT QUẢ NGHIÊN CỨU VÀ THẢO LUẬN', page: '25' },
      { title: 'KẾT LUẬN VÀ KIẾN NGHỊ', page: '40' },
      { title: 'TÀI LIỆU THAM KHẢO', page: '42' }
    ];

    tocItems.forEach(item => {
      pdf.text(item.title, styles.margins.left, currentY);
      pdf.text(item.page, styles.margins.left + contentWidth - 30, currentY, { align: 'right' });
      
      // Add dots
      const dotsWidth = contentWidth - pdf.getTextWidth(item.title) - pdf.getTextWidth(item.page) - 20;
      const dotsCount = Math.floor(dotsWidth / 4);
      const dots = '.'.repeat(dotsCount);
      const dotsX = styles.margins.left + pdf.getTextWidth(item.title) + 10;
      pdf.text(dots, dotsX, currentY);
      
      currentY += 20;
    });
  }

  private addMainContent(pdf: jsPDF, thesis: ThesisData, styles: any, contentWidth: number, pageHeight: number) {
    let currentY = styles.margins.top;
    const maxY = pageHeight - styles.margins.bottom;

    pdf.setFontSize(styles.fontSize);
    pdf.setFont(styles.fontFamily, 'normal');

    // Process content by paragraphs
    const content = this.formatContentForPDF(thesis.content);
    const paragraphs = content.split('\n\n');

    paragraphs.forEach(paragraph => {
      if (paragraph.trim() === '') return;

      // Check if it's a heading
      if (paragraph.startsWith('#')) {
        this.addHeading(pdf, paragraph, styles, currentY, contentWidth);
        currentY += styles.lineHeight * 1.5;
      } else {
        // Regular paragraph
        const lines = pdf.splitTextToSize(paragraph, contentWidth);
        lines.forEach((line: string) => {
          if (currentY > maxY - styles.lineHeight) {
            pdf.addPage();
            currentY = styles.margins.top;
          }
          pdf.text(line, styles.margins.left, currentY);
          currentY += styles.lineHeight;
        });
        currentY += styles.lineHeight * 0.5; // Paragraph spacing
      }
    });
  }

  private addHeading(pdf: jsPDF, heading: string, styles: any, y: number, contentWidth: number) {
    const level = (heading.match(/^#+/) || [''])[0].length;
    const text = heading.replace(/^#+\s/, '');

    let fontSize = styles.fontSize;
    let fontWeight = 'bold';

    switch (level) {
      case 1:
        fontSize = styles.fontSize + 4;
        break;
      case 2:
        fontSize = styles.fontSize + 2;
        break;
      case 3:
        fontSize = styles.fontSize + 1;
        break;
    }

    pdf.setFontSize(fontSize);
    pdf.setFont(styles.fontFamily, fontWeight);
    pdf.text(text, styles.margins.left, y);
    pdf.setFontSize(styles.fontSize);
    pdf.setFont(styles.fontFamily, 'normal');
  }

  private addReferences(pdf: jsPDF, thesis: ThesisData, styles: any, contentWidth: number) {
    let currentY = styles.margins.top;

    pdf.setFontSize(16);
    pdf.setFont(styles.fontFamily, 'bold');
    pdf.text('TÀI LIỆU THAM KHẢO', styles.margins.left, currentY);
    currentY += 40;

    pdf.setFontSize(styles.fontSize);
    pdf.setFont(styles.fontFamily, 'normal');

    const references = [
      '[1] Tài liệu tham khảo sẽ được tự động tạo dựa trên các trích dẫn trong luận văn.',
      `[2] Định dạng trích dẫn: ${thesis.citation_format || 'APA'}`
    ];

    references.forEach(ref => {
      const lines = pdf.splitTextToSize(ref, contentWidth);
      lines.forEach((line: string) => {
        pdf.text(line, styles.margins.left, currentY);
        currentY += styles.lineHeight;
      });
      currentY += styles.lineHeight * 0.5;
    });
  }

  private addPageNumbers(pdf: jsPDF, styles: any) {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(11);
      pdf.setFont(styles.fontFamily, 'normal');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.text(i.toString(), pageWidth / 2, pageHeight - styles.margins.bottom + 20, { align: 'center' });
    }
  }

  async exportToDOCX(thesis: ThesisData, options: ExportOptions): Promise<void> {
    const children: any[] = [];

    // Add cover page
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'ĐẠI HỌC QUỐC GIA VIỆT NAM',
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN',
            bold: true,
            size: 26,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `KHOA ${thesis.subject?.toUpperCase() || 'KHOA HỌC'}`,
            bold: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: thesis.title.toUpperCase(),
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `LUẬN VĂN THẠC SĨ ${thesis.subject?.toUpperCase() || ''}`,
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      })
    );

    // Add author information
    const authorInfo = [
      `Học viên: ${thesis.author?.name || '[Tên học viên]'}`,
      `Mã số học viên: ${thesis.author?.studentId || '[MSHV]'}`,
      `Lớp: ${thesis.author?.class || '[Lớp]'}`,
      `Giảng viên hướng dẫn: ${thesis.author?.supervisor || '[Tên GVHD]'}`
    ];

    authorInfo.forEach(info => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: info,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    });

    // Add year
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `HÀ NỘI - ${new Date().getFullYear()}`,
            bold: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000 },
        pageBreakBefore: true,
      })
    );

    // Add table of contents if requested
    if (options.includeTableOfContents) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'MỤC LỤC',
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          pageBreakBefore: true,
        })
      );

      // Add TOC items
      const tocItems = [
        { title: 'LỜI CAM ĐOAN', page: 'i' },
        { title: 'LỜI CẢM ƠN', page: 'ii' },
        { title: 'MỤC LỤC', page: 'iii' },
        { title: 'DANH MỤC CÁC TỪ VIẾT TẮT', page: 'iv' },
        { title: 'MỞ ĐẦU', page: '1' },
        { title: 'CHƯƠNG 1: CƠ SỞ LÝ THUYẾT VÀ TỔNG QUAN NGHIÊN CỨU', page: '5' },
        { title: 'CHƯƠNG 2: PHƯƠNG PHÁP NGHIÊN CỨU', page: '15' },
        { title: 'CHƯƠNG 3: KẾT QUẢ NGHIÊN CỨU VÀ THẢO LUẬN', page: '25' },
        { title: 'KẾT LUẬN VÀ KIẾN NGHỊ', page: '40' },
        { title: 'TÀI LIỆU THAM KHẢO', page: '42' }
      ];

      tocItems.forEach(item => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.title,
                size: 24,
              }),
              new TextRun({
                text: '\t' + item.page,
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    // Add main content
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'NỘI DUNG LUẬN VĂN',
            bold: true,
            size: 32,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        pageBreakBefore: true,
      })
    );

    // Process content
    const formattedContent = this.formatContentForDOCX(thesis.content);
    formattedContent.forEach(paragraph => {
      children.push(paragraph);
    });

    // Add references if requested
    if (options.includeReferences) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'TÀI LIỆU THAM KHẢO',
              bold: true,
              size: 32,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          pageBreakBefore: true,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '[1] Tài liệu tham khảo sẽ được tự động tạo dựa trên các trích dẫn trong luận văn.',
              size: 24,
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `[2] Định dạng trích dẫn: ${thesis.citation_format || 'APA'}`,
              size: 24,
            }),
          ],
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch in twips
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: options.pageHeader || thesis.title,
                      size: 20,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 20,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children,
        },
      ],
      styles: {
        default: {
          document: {
            run: {
              font: options.fontFamily || 'Times New Roman',
              size: (options.fontSize || 12) * 2, // DOCX uses half-points
            },
            paragraph: {
              spacing: {
                line: Math.round((options.lineSpacing || 1.5) * 240), // 240 twips per line
              },
            },
          },
        },
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const fileName = `${this.sanitizeFileName(thesis.title)}.docx`;
    saveAs(new Blob([buffer]), fileName);
  }

  private formatContentForPDF(content: string): string {
    if (!content) return '';
    
    return content
      .replace(/^#\s+(.+)$/gm, '# $1')
      .replace(/^##\s+(.+)$/gm, '## $1')
      .replace(/^###\s+(.+)$/gm, '### $1');
  }

  private formatContentForDOCX(content: string): Paragraph[] {
    if (!content) return [];
    
    const paragraphs: Paragraph[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        paragraphs.push(new Paragraph({ children: [] }));
        return;
      }
      
      if (trimmedLine.startsWith('# ')) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine.replace('# ', ''),
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );
      } else if (trimmedLine.startsWith('## ')) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine.replace('## ', ''),
                bold: true,
                size: 28,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
          })
        );
      } else if (trimmedLine.startsWith('### ')) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine.replace('### ', ''),
                bold: true,
                size: 26,
              }),
            ],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 },
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: trimmedLine,
                size: 24,
              }),
            ],
            spacing: { after: 120 },
            indent: {
              firstLine: 360, // 0.25 inch first line indent
            },
          })
        );
      }
    });
    
    return paragraphs;
  }

  async exportToLaTeX(thesis: ThesisData, options: ExportOptions): Promise<void> {
    const latex = this.generateLatexContent(thesis, options);
    const fileName = `${this.sanitizeFileName(thesis.title)}.tex`;
    
    const blob = new Blob([latex], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName);
  }

  private generateLatexContent(thesis: ThesisData, options: ExportOptions): string {
    const margins = options.pageMargins?.split(' ') || ['2.5cm', '2.5cm', '2.5cm', '2.5cm'];
    
    return `\\documentclass[${options.fontSize || 12}pt,a4paper]{report}
\\usepackage[utf8]{inputenc}
\\usepackage[vietnamese]{babel}
\\usepackage{${options.fontFamily === 'Arial' ? 'helvet' : 'times'}}
\\usepackage{geometry}
\\usepackage{setspace}
\\usepackage{graphicx}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{cite}
\\usepackage{hyperref}
\\usepackage{titlesec}

\\geometry{
    left=${margins[0]},
    right=${margins[1]},
    top=${margins[2]},
    bottom=${margins[3]}
}

${options.lineSpacing === 2 ? '\\doublespacing' : options.lineSpacing === 1 ? '\\singlespacing' : '\\onehalfspacing'}

\\title{${this.escapeLatex(thesis.title)}}
\\author{${thesis.author?.name || '[Tên tác giả]'}}
\\date{${new Date().getFullYear()}}

\\begin{document}

% Title page
\\begin{titlepage}
\\begin{center}
\\Large \\textbf{ĐẠI HỌC QUỐC GIA VIỆT NAM} \\\\
\\textbf{TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN} \\\\[2cm]

\\textbf{KHOA ${this.escapeLatex(thesis.subject?.toUpperCase() || 'KHOA HỌC')}} \\\\[3cm]

\\huge \\textbf{${this.escapeLatex(thesis.title)}} \\\\[2cm]

\\Large \\textbf{LUẬN VĂN THẠC SĨ ${this.escapeLatex(thesis.subject?.toUpperCase() || '')}} \\\\[2cm]

\\normalsize
\\textbf{Học viên:} ${this.escapeLatex(thesis.author?.name || '[Tên học viên]')} \\\\
\\textbf{Mã số học viên:} ${thesis.author?.studentId || '[MSHV]'} \\\\
\\textbf{Lớp:} ${thesis.author?.class || '[Lớp]'} \\\\
\\textbf{Giảng viên hướng dẫn:} ${this.escapeLatex(thesis.author?.supervisor || '[Tên GVHD]')} \\\\[3cm]

\\vfill
\\textbf{HÀ NỘI - ${new Date().getFullYear()}}
\\end{center}
\\end{titlepage}

${options.includeTableOfContents ? '\\tableofcontents\n\\newpage\n' : ''}

% Main content
${this.formatContentForLatex(thesis.content)}

${options.includeReferences ? this.generateLatexReferences(thesis) : ''}

\\end{document}`;
  }

  private formatContentForLatex(content: string): string {
    if (!content) return '';
    
    return this.escapeLatex(content)
      .replace(/^#\s+(.+)$/gm, '\\chapter{$1}')
      .replace(/^##\s+(.+)$/gm, '\\section{$1}')
      .replace(/^###\s+(.+)$/gm, '\\subsection{$1}')
      .replace(/\n\n/g, '\n\n\\par\n');
  }

  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/[{}]/g, '\\$&')
      .replace(/[%$&#^_~]/g, '\\$&')
      .replace(/\\textbackslash\{\}/g, '\\textbackslash{}');
  }

  private generateLatexReferences(thesis: ThesisData): string {
    return `
\\begin{thebibliography}{99}
\\bibitem{ref1} Tài liệu tham khảo sẽ được tự động tạo dựa trên các trích dẫn trong luận văn.
\\bibitem{ref2} Định dạng trích dẫn: ${thesis.citation_format || 'APA'}
\\end{thebibliography}
    `;
  }

  private sanitizeFileName(title: string): string {
    return title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  async exportThesis(thesis: ThesisData, options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(thesis, options);
          break;
        case 'docx':
          await this.exportToDOCX(thesis, options);
          break;
        case 'latex':
          await this.exportToLaTeX(thesis, options);
          break;
        default:
          throw new Error('Định dạng xuất không được hỗ trợ');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Lỗi khi xuất luận văn: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  }
}

export const exportThesis = async (thesis: ThesisData, options: ExportOptions): Promise<void> => {
  const exporter = HighQualityExporter.getInstance();
  return exporter.exportThesis(thesis, options);
};