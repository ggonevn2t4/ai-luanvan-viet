import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Lightbulb, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  FileText,
  Edit3,
  Quote
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'structure' | 'citation' | 'content';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  originalText: string;
  suggestedText: string;
  position: {
    start: number;
    end: number;
  };
}

interface RealTimeSuggestionsProps {
  content: string;
  onContentChange: (newContent: string) => void;
  isEnabled: boolean;
}

export const RealTimeSuggestions: React.FC<RealTimeSuggestionsProps> = ({
  content,
  onContentChange,
  isEnabled
}) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeSuggestions, setActiveSuggestions] = useState<Suggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Debounced content analysis
  const analyzeContent = useCallback(
    debounce(async (text: string) => {
      if (!isEnabled || text.length < 100) {
        setSuggestions([]);
        return;
      }

      setIsAnalyzing(true);

      try {
        // Simulate real-time analysis with mock suggestions
        const mockSuggestions: Suggestion[] = generateMockSuggestions(text);
        setSuggestions(mockSuggestions);
        
        // Show high priority suggestions immediately
        const highPrioritySuggestions = mockSuggestions.filter(s => s.priority === 'high').slice(0, 3);
        setActiveSuggestions(highPrioritySuggestions);

      } catch (error) {
        console.error('Error analyzing content:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }, 2000),
    [isEnabled]
  );

  useEffect(() => {
    if (isEnabled) {
      analyzeContent(content);
    }
  }, [content, analyzeContent, isEnabled]);

  const applySuggestion = (suggestion: Suggestion) => {
    const newContent = content.replace(suggestion.originalText, suggestion.suggestedText);
    onContentChange(newContent);
    
    // Remove applied suggestion
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    
    toast({
      title: "Đã áp dụng gợi ý",
      description: suggestion.title,
    });
  };

  const dismissSuggestion = (suggestionId: string) => {
    setActiveSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'grammar': return Edit3;
      case 'style': return FileText;
      case 'structure': return Lightbulb;
      case 'citation': return Quote;
      case 'content': return AlertCircle;
      default: return Lightbulb;
    }
  };

  const getSuggestionColor = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (!isEnabled || activeSuggestions.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 w-80 max-h-[60vh] overflow-y-auto z-50 space-y-2">
      {isAnalyzing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-sm text-blue-800">Đang phân tích nội dung...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSuggestions.map((suggestion) => {
        const Icon = getSuggestionIcon(suggestion.type);
        
        return (
          <Card 
            key={suggestion.id} 
            className={`${getSuggestionColor(suggestion.priority)} shadow-lg animate-in slide-in-from-right-full duration-300`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <Badge variant="outline" className="text-xs">
                    {suggestion.type === 'grammar' ? 'Ngữ pháp' :
                     suggestion.type === 'style' ? 'Văn phong' :
                     suggestion.type === 'structure' ? 'Cấu trúc' :
                     suggestion.type === 'citation' ? 'Trích dẫn' : 'Nội dung'}
                  </Badge>
                  <Badge variant={
                    suggestion.priority === 'high' ? 'destructive' :
                    suggestion.priority === 'medium' ? 'default' : 'secondary'
                  } className="text-xs">
                    {suggestion.priority === 'high' ? 'Cao' :
                     suggestion.priority === 'medium' ? 'TB' : 'Thấp'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <h4 className="font-medium text-sm mb-2">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{suggestion.description}</p>

              <div className="space-y-2 mb-3">
                <div className="text-xs">
                  <span className="font-medium text-red-600">Hiện tại:</span>
                  <div className="mt-1 p-2 bg-red-100 border border-red-200 rounded text-red-800">
                    "{suggestion.originalText}"
                  </div>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-green-600">Gợi ý:</span>
                  <div className="mt-1 p-2 bg-green-100 border border-green-200 rounded text-green-800">
                    "{suggestion.suggestedText}"
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => applySuggestion(suggestion)}
                  className="flex-1 text-xs h-7"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Áp dụng
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="text-xs h-7"
                >
                  Bỏ qua
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {suggestions.length > activeSuggestions.length && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSuggestions(suggestions.slice(0, 5))}
              className="w-full text-xs"
            >
              Xem thêm {suggestions.length - activeSuggestions.length} gợi ý khác
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

// Mock suggestion generator for demonstration
function generateMockSuggestions(text: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let idCounter = 1;

  // Grammar suggestions
  if (text.includes('tác giả')) {
    suggestions.push({
      id: (idCounter++).toString(),
      type: 'grammar',
      priority: 'medium',
      title: 'Sử dụng cách diễn đạt học thuật',
      description: 'Trong văn học thuật, nên sử dụng "các nhà nghiên cứu" thay vì "tác giả"',
      originalText: 'tác giả',
      suggestedText: 'các nhà nghiên cứu',
      position: { start: text.indexOf('tác giả'), end: text.indexOf('tác giả') + 7 }
    });
  }

  // Style suggestions
  if (text.includes('rất nhiều')) {
    suggestions.push({
      id: (idCounter++).toString(),
      type: 'style',
      priority: 'low',
      title: 'Cải thiện từ vựng học thuật',
      description: 'Thay thế từ ngữ thông thường bằng thuật ngữ chuyên môn',
      originalText: 'rất nhiều',
      suggestedText: 'đáng kể',
      position: { start: text.indexOf('rất nhiều'), end: text.indexOf('rất nhiều') + 9 }
    });
  }

  // Structure suggestions
  if (text.length > 500 && !text.includes('Theo như')) {
    suggestions.push({
      id: (idCounter++).toString(),
      type: 'structure',
      priority: 'high',
      title: 'Thêm từ nối chuyển tiếp',
      description: 'Đoạn văn cần có từ nối để tạo tính mạch lạc',
      originalText: text.substring(0, 50) + '...',
      suggestedText: 'Theo như các nghiên cứu đã chỉ ra, ' + text.substring(0, 47) + '...',
      position: { start: 0, end: 50 }
    });
  }

  // Citation suggestions
  if (text.includes('nghiên cứu') && !text.includes('(')) {
    suggestions.push({
      id: (idCounter++).toString(),
      type: 'citation',
      priority: 'high',
      title: 'Bổ sung trích dẫn',
      description: 'Cần có trích dẫn khi đề cập đến nghiên cứu',
      originalText: 'nghiên cứu cho thấy',
      suggestedText: 'nghiên cứu cho thấy (Nguyễn, 2023)',
      position: { start: text.indexOf('nghiên cứu'), end: text.indexOf('nghiên cứu') + 20 }
    });
  }

  // Content suggestions
  if (text.length > 200 && text.split('.').length < 5) {
    suggestions.push({
      id: (idCounter++).toString(),
      type: 'content',
      priority: 'medium',
      title: 'Chia nhỏ đoạn văn',
      description: 'Đoạn văn quá dài, nên chia thành các câu ngắn hơn',
      originalText: text.substring(0, 100) + '...',
      suggestedText: text.substring(0, 50) + '. ' + text.substring(51, 100) + '...',
      position: { start: 0, end: 100 }
    });
  }

  return suggestions;
}