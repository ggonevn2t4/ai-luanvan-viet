import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Copy,
  Download,
  RefreshCw,
  BookOpen,
  Target,
  Clock
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OutlineSection {
  title: string;
  content: string[];
  subsections: {
    title: string;
    content: string[];
    estimatedPages: number;
  }[];
  estimatedPages: number;
}

interface StructuredOutline {
  type: string;
  sections: OutlineSection[];
  estimatedPages: number;
}

interface OutlineGeneratorProps {
  topic: string;
  major: string;
  academicLevel: string;
  researchMethod: string;
  pages: number;
  requirements?: string;
  onOutlineGenerated?: (outline: StructuredOutline) => void;
}

export const OutlineGenerator = ({
  topic,
  major,
  academicLevel,
  researchMethod,
  pages,
  requirements,
  onOutlineGenerated
}: OutlineGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState<StructuredOutline | null>(null);
  const [outlineType, setOutlineType] = useState<'basic' | 'detailed' | 'chapter-based'>('detailed');
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const generateOutline = async () => {
    if (!topic || !major || !academicLevel || !researchMethod) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin cơ bản trước khi tạo dàn bài.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-outline', {
        body: {
          topic: topic.trim(),
          major,
          academicLevel,
          researchMethod,
          pages,
          specificRequirements: requirements?.trim(),
          outlineType
        }
      });

      if (error) {
        throw new Error(error.message || 'Có lỗi xảy ra khi tạo dàn bài');
      }

      if (!data.success) {
        throw new Error(data.error || 'Tạo dàn bài thất bại');
      }

      setOutline(data.outline);
      setExpandedSections(new Set([0])); // Expand first section by default
      onOutlineGenerated?.(data.outline);

      toast({
        title: "Thành công",
        description: "Đã tạo dàn bài thành công!",
      });

    } catch (error: any) {
      console.error('Error generating outline:', error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi tạo dàn bài. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const copyOutlineToClipboard = () => {
    if (!outline) return;
    
    let text = `DÀN BÀI LUẬN VĂN: ${topic.toUpperCase()}\n`;
    text += `Ngành: ${major} | Mức độ: ${academicLevel}\n`;
    text += `Phương pháp nghiên cứu: ${researchMethod}\n`;
    text += `Số trang dự kiến: ${outline.estimatedPages} trang\n\n`;
    
    outline.sections.forEach((section, index) => {
      text += `${index + 1}. ${section.title}`;
      if (section.estimatedPages > 0) {
        text += ` (${section.estimatedPages} trang)`;
      }
      text += '\n';
      
      section.content.forEach(content => {
        text += `   - ${content}\n`;
      });
      
      section.subsections.forEach(subsection => {
        text += `   ${index + 1}.${section.subsections.indexOf(subsection) + 1}. ${subsection.title}`;
        if (subsection.estimatedPages > 0) {
          text += ` (${subsection.estimatedPages} trang)`;
        }
        text += '\n';
        
        subsection.content.forEach(content => {
          text += `      - ${content}\n`;
        });
      });
      
      text += '\n';
    });
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Dàn bài đã được sao chép vào clipboard.",
    });
  };

  const getOutlineTypeLabel = (type: string) => {
    switch (type) {
      case 'basic': return 'Cơ bản';
      case 'detailed': return 'Chi tiết';
      case 'chapter-based': return 'Theo chương';
      default: return 'Chi tiết';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          AI Outline Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Tạo dàn bài chi tiết cho luận văn theo chuẩn học thuật Việt Nam
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center">
          <Select value={outlineType} onValueChange={(value: any) => setOutlineType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Cơ bản</SelectItem>
              <SelectItem value="detailed">Chi tiết</SelectItem>
              <SelectItem value="chapter-based">Theo chương</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={generateOutline}
            disabled={isGenerating}
            variant="vietnamese"
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo dàn bài...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Tạo dàn bài {getOutlineTypeLabel(outlineType).toLowerCase()}
              </>
            )}
          </Button>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <Progress value={85} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Đang phân tích chủ đề và tạo dàn bài theo chuẩn {major}...
            </p>
          </div>
        )}

        {outline && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {outline.sections.length} mục
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {outline.estimatedPages} trang
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getOutlineTypeLabel(outline.type)}
                </Badge>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOutlineToClipboard}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Sao chép
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateOutline()}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Tạo lại
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {outline.sections.map((section, sectionIndex) => (
                <Collapsible
                  key={sectionIndex}
                  open={expandedSections.has(sectionIndex)}
                  onOpenChange={() => toggleSection(sectionIndex)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                    >
                      <div className="flex items-center gap-2 w-full">
                        {expandedSections.has(sectionIndex) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium">
                            {sectionIndex + 1}. {section.title}
                          </div>
                          {section.estimatedPages > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Dự kiến: {section.estimatedPages} trang
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <div className="pl-6 pr-3 pb-3 space-y-2">
                      {section.content.map((content, contentIndex) => (
                        <p key={contentIndex} className="text-sm text-muted-foreground">
                          • {content}
                        </p>
                      ))}
                      
                      {section.subsections.map((subsection, subIndex) => (
                        <div key={subIndex} className="mt-3 border-l-2 border-muted pl-3">
                          <div className="font-medium text-sm">
                            {sectionIndex + 1}.{subIndex + 1}. {subsection.title}
                            {subsection.estimatedPages > 0 && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({subsection.estimatedPages} trang)
                              </span>
                            )}
                          </div>
                          {subsection.content.map((content, contentIndex) => (
                            <p key={contentIndex} className="text-xs text-muted-foreground mt-1">
                              - {content}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>

            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Gợi ý:</strong> Dàn bài này được tạo dựa trên chuẩn học thuật Việt Nam cho ngành {major}. 
                Bạn có thể sử dụng làm khung để viết luận văn hoặc tùy chỉnh theo yêu cầu cụ thể.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};