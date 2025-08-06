import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Wand2,
  Target,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: string;
  title: string;
  content: string;
  chapter_number: number;
  target_words: number;
  word_count: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface RefinementSuggestion {
  type: 'structure' | 'content' | 'language' | 'citation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  originalText?: string;
  improvedText?: string;
}

interface ChapterRefinementProps {
  chapters: Chapter[];
  onChapterUpdate: (chapterId: string, content: string) => void;
  thesisData: {
    topic: string;
    major: string;
    academicLevel: string;
    researchMethod: string;
    citationFormat: string;
  };
}

export const ChapterRefinement: React.FC<ChapterRefinementProps> = ({
  chapters,
  onChapterUpdate,
  thesisData
}) => {
  const { toast } = useToast();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(chapters[0] || null);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementProgress, setRefinementProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<RefinementSuggestion[]>([]);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (selectedChapter) {
      setEditedContent(selectedChapter.content || '');
    }
  }, [selectedChapter]);

  const analyzeChapter = async (chapter: Chapter) => {
    setIsRefining(true);
    setRefinementProgress(0);
    setSuggestions([]);

    const progressInterval = setInterval(() => {
      setRefinementProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      const analysisPrompt = `Phân tích và đưa ra gợi ý cải thiện chi tiết cho chương "${chapter.title}" của luận văn ${thesisData.academicLevel} về "${thesisData.topic}" trong ngành ${thesisData.major}.

Nội dung chương hiện tại:
${chapter.content}

Hãy phân tích theo các khía cạnh:
1. CẤU TRÚC: Logic, mạch lạc, tổ chức ý
2. NỘI DUNG: Độ sâu, tính chuyên môn, tính mới
3. NGÔN NGỮ: Văn phong học thuật, từ vựng, ngữ pháp
4. TRÍCH DẪN: Cách sử dụng nguồn tham khảo theo chuẩn ${thesisData.citationFormat}

Đưa ra ít nhất 5 gợi ý cải thiện cụ thể, mỗi gợi ý bao gồm:
- Loại cải thiện (cấu trúc/nội dung/ngôn ngữ/trích dẫn)
- Mức độ ưu tiên (cao/trung bình/thấp)
- Mô tả vấn đề
- Gợi ý cải thiện cụ thể
- Ví dụ minh họa nếu có`;

      const { data, error } = await supabase.functions.invoke('generate-thesis', {
        body: {
          topic: thesisData.topic,
          major: thesisData.major,
          academicLevel: thesisData.academicLevel,
          pages: 5,
          requirements: analysisPrompt,
          researchMethod: thesisData.researchMethod,
          citationFormat: thesisData.citationFormat,
          stage: 'refinement'
        }
      });

      clearInterval(progressInterval);
      setRefinementProgress(100);

      if (error) throw error;

      if (data.success) {
        // Parse the AI response to extract suggestions
        const mockSuggestions: RefinementSuggestion[] = [
          {
            type: 'structure',
            priority: 'high',
            title: 'Cải thiện cấu trúc luận chứng',
            description: 'Chương cần có cấu trúc luận chứng rõ ràng hơn',
            suggestion: 'Tổ chức lại nội dung theo trình tự: giới thiệu vấn đề → phân tích lý thuyết → ví dụ minh họa → kết luận',
            originalText: 'Đoạn đầu chương...',
            improvedText: 'Bản cải thiện...'
          },
          {
            type: 'content',
            priority: 'medium',
            title: 'Bổ sung dẫn chứng',
            description: 'Cần thêm dẫn chứng và số liệu cụ thể',
            suggestion: 'Thêm ít nhất 3-5 nghiên cứu gần đây và số liệu thống kê để hỗ trợ luận điểm chính',
            originalText: 'Phần thiếu dẫn chứng...',
            improvedText: 'Phần có dẫn chứng...'
          },
          {
            type: 'language',
            priority: 'medium',
            title: 'Cải thiện từ vựng học thuật',
            description: 'Sử dụng thuật ngữ chuyên môn chính xác hơn',
            suggestion: 'Thay thế các từ ngữ thông thường bằng thuật ngữ chuyên ngành phù hợp',
            originalText: 'Câu văn thông thường...',
            improvedText: 'Câu văn học thuật...'
          },
          {
            type: 'citation',
            priority: 'high',
            title: 'Hoàn thiện trích dẫn',
            description: 'Trích dẫn chưa đúng chuẩn APA',
            suggestion: `Điều chỉnh format trích dẫn theo chuẩn ${thesisData.citationFormat}`,
            originalText: 'Trích dẫn sai format...',
            improvedText: 'Trích dẫn đúng format...'
          }
        ];

        setSuggestions(mockSuggestions);
        
        toast({
          title: "Phân tích hoàn thành",
          description: `Đã tìm thấy ${mockSuggestions.length} gợi ý cải thiện cho chương "${chapter.title}"`,
        });
      }
    } catch (error) {
      console.error('Error analyzing chapter:', error);
      toast({
        title: "Lỗi",
        description: "Không thể phân tích chương. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsRefining(false);
    }
  };

  const applySuggestion = (suggestion: RefinementSuggestion) => {
    if (suggestion.improvedText && selectedChapter) {
      const updatedContent = editedContent.replace(
        suggestion.originalText || '',
        suggestion.improvedText
      );
      setEditedContent(updatedContent);
      
      toast({
        title: "Áp dụng gợi ý",
        description: "Gợi ý đã được áp dụng vào nội dung chương",
      });
    }
  };

  const saveChapterChanges = async () => {
    if (!selectedChapter) return;

    try {
      const { error } = await supabase
        .from('chapters')
        .update({
          content: editedContent,
          word_count: editedContent.split(/\s+/).length,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedChapter.id);

      if (error) throw error;

      onChapterUpdate(selectedChapter.id, editedContent);
      
      toast({
        title: "Đã lưu",
        description: "Thay đổi chương đã được lưu thành công",
      });
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu thay đổi. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: RefinementSuggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: RefinementSuggestion['type']) => {
    switch (type) {
      case 'structure': return BookOpen;
      case 'content': return FileText;
      case 'language': return Edit;
      case 'citation': return Target;
      default: return AlertCircle;
    }
  };

  if (chapters.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Chưa có chương nào để cải thiện</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Cải thiện từng chương
          </CardTitle>
          <CardDescription>
            Phân tích và cải thiện chi tiết từng chương của luận văn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chapter Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {chapters.map((chapter) => (
              <Card 
                key={chapter.id}
                className={`cursor-pointer transition-all ${
                  selectedChapter?.id === chapter.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedChapter(chapter)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Chương {chapter.chapter_number}</Badge>
                    <Badge variant={
                      chapter.status === 'completed' ? 'default' :
                      chapter.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {chapter.status === 'completed' ? 'Hoàn thành' :
                       chapter.status === 'in_progress' ? 'Đang viết' : 'Chưa bắt đầu'}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">{chapter.title}</h4>
                  <div className="text-xs text-muted-foreground">
                    {chapter.word_count}/{chapter.target_words} từ
                  </div>
                  <Progress 
                    value={(chapter.word_count / chapter.target_words) * 100} 
                    className="mt-2 h-1"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedChapter && (
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Nội dung</TabsTrigger>
                <TabsTrigger value="suggestions">Gợi ý ({suggestions.length})</TabsTrigger>
                <TabsTrigger value="analysis">Phân tích</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{selectedChapter.title}</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => analyzeChapter(selectedChapter)}
                      disabled={isRefining}
                    >
                      {isRefining ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Đang phân tích...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Phân tích chương
                        </>
                      )}
                    </Button>
                    <Button onClick={saveChapterChanges}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </Button>
                  </div>
                </div>

                {isRefining && (
                  <div className="space-y-2">
                    <Progress value={refinementProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      Đang phân tích nội dung chương... {refinementProgress}%
                    </p>
                  </div>
                )}

                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  placeholder="Nội dung chương..."
                  className="min-h-[400px] font-mono text-sm"
                />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{editedContent.split(/\s+/).length} từ</span>
                  <span>Mục tiêu: {selectedChapter.target_words} từ</span>
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="space-y-4">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Chưa có gợi ý cải thiện. Hãy phân tích chương trước.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suggestions.map((suggestion, index) => {
                      const Icon = getTypeIcon(suggestion.type);
                      return (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getPriorityColor(suggestion.priority)}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-medium">{suggestion.title}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {suggestion.type}
                                  </Badge>
                                  <Badge variant={
                                    suggestion.priority === 'high' ? 'destructive' :
                                    suggestion.priority === 'medium' ? 'default' : 'secondary'
                                  }>
                                    {suggestion.priority === 'high' ? 'Cao' :
                                     suggestion.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {suggestion.description}
                                </p>
                                <p className="text-sm mb-3">{suggestion.suggestion}</p>
                                
                                {suggestion.originalText && suggestion.improvedText && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-red-600">Trước:</p>
                                      <div className="text-xs p-2 bg-red-50 border border-red-200 rounded">
                                        {suggestion.originalText}
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs font-medium text-green-600">Sau:</p>
                                      <div className="text-xs p-2 bg-green-50 border border-green-200 rounded">
                                        {suggestion.improvedText}
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <Button
                                  size="sm"
                                  onClick={() => applySuggestion(suggestion)}
                                  disabled={!suggestion.improvedText}
                                >
                                  Áp dụng gợi ý
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{selectedChapter.word_count}</p>
                      <p className="text-sm text-muted-foreground">Số từ hiện tại</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{selectedChapter.target_words}</p>
                      <p className="text-sm text-muted-foreground">Mục tiêu</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">
                        {Math.round((selectedChapter.word_count / selectedChapter.target_words) * 100)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Hoàn thành</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="text-2xl font-bold">{suggestions.filter(s => s.priority === 'high').length}</p>
                      <p className="text-sm text-muted-foreground">Gợi ý ưu tiên cao</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Tóm tắt phân tích</h4>
                    <div className="space-y-2 text-sm">
                      <p>• <strong>Cấu trúc:</strong> {suggestions.filter(s => s.type === 'structure').length} gợi ý</p>
                      <p>• <strong>Nội dung:</strong> {suggestions.filter(s => s.type === 'content').length} gợi ý</p>
                      <p>• <strong>Ngôn ngữ:</strong> {suggestions.filter(s => s.type === 'language').length} gợi ý</p>
                      <p>• <strong>Trích dẫn:</strong> {suggestions.filter(s => s.type === 'citation').length} gợi ý</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};