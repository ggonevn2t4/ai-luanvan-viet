import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, Bot, User, Lightbulb, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    type: 'general' | 'chapter' | 'improvement' | 'citation';
    data?: any;
  };
}

interface AIChatProps {
  thesisContent?: string;
  currentChapter?: any;
  onContentUpdate?: (content: string) => void;
  onSuggestionApply?: (suggestion: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({
  thesisContent = '',
  currentChapter,
  onContentUpdate,
  onSuggestionApply
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp bạn cải thiện luận văn, đưa ra gợi ý cho từng chương, và trả lời các câu hỏi về nội dung. Bạn cần hỗ trợ gì?',
      timestamp: new Date(),
      context: { type: 'general' }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'chapter' | 'improvement'>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateContextPrompt = (userMessage: string) => {
    let context = '';
    
    if (chatMode === 'chapter' && currentChapter) {
      context = `Ngữ cảnh: Đang làm việc với chương "${currentChapter.title}"
Nội dung chương hiện tại: ${currentChapter.content?.substring(0, 1000) || 'Chưa có nội dung'}...
`;
    } else if (chatMode === 'improvement' && thesisContent) {
      context = `Ngữ cảnh: Đang cải thiện luận văn
Nội dung luận văn (đoạn đầu): ${thesisContent.substring(0, 1000)}...
`;
    }

    return `${context}

Câu hỏi/yêu cầu của người dùng: ${userMessage}

Hãy trả lời một cách hữu ích và cụ thể cho việc viết luận văn tiếng Việt. Nếu là gợi ý cải thiện, hãy đưa ra các đề xuất cụ thể có thể áp dụng ngay.`;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      context: { type: chatMode }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-thesis', {
        body: {
          topic: inputValue,
          major: 'Tư vấn học thuật',
          academicLevel: 'Chuyên gia',
          pages: 1,
          requirements: generateContextPrompt(inputValue),
          researchMethod: 'Tư vấn AI',
          citationFormat: 'Conversational',
          stage: 'refinement'
        }
      });

      if (error) throw error;

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.content,
          timestamp: new Date(),
          context: { type: chatMode }
        };

        setMessages(prev => [...prev, assistantMessage]);

        // If this is an improvement suggestion, offer to apply it
        if (chatMode === 'improvement' && onSuggestionApply) {
          toast({
            title: "Gợi ý cải thiện",
            description: "Bạn có muốn áp dụng gợi ý này không?",
            action: (
              <Button size="sm" onClick={() => onSuggestionApply(data.content)}>
                Áp dụng
              </Button>
            )
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi tin nhắn. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Lightbulb,
      label: 'Gợi ý cải thiện chung',
      action: () => {
        setInputValue('Hãy đưa ra 5 gợi ý cải thiện chất lượng tổng thể cho luận văn này');
        setChatMode('improvement');
      }
    },
    {
      icon: FileText,
      label: 'Kiểm tra cấu trúc',
      action: () => {
        setInputValue('Hãy phân tích cấu trúc của luận văn và đề xuất cải thiện');
        setChatMode('improvement');
      }
    },
    {
      icon: Sparkles,
      label: 'Cải thiện ngôn ngữ',
      action: () => {
        setInputValue('Hãy gợi ý cách cải thiện ngôn ngữ học thuật trong luận văn');
        setChatMode('improvement');
      }
    }
  ];

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle>Trợ lý AI</CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant={chatMode === 'general' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('general')}
            >
              Tổng quát
            </Button>
            <Button
              variant={chatMode === 'chapter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('chapter')}
              disabled={!currentChapter}
            >
              Chương
            </Button>
            <Button
              variant={chatMode === 'improvement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChatMode('improvement')}
            >
              Cải thiện
            </Button>
          </div>
        </div>
        <CardDescription>
          {chatMode === 'general' && 'Tư vấn chung về luận văn'}
          {chatMode === 'chapter' && 'Tư vấn về chương hiện tại'}
          {chatMode === 'improvement' && 'Gợi ý cải thiện nội dung'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Quick Actions */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="flex items-center gap-1"
              >
                <action.icon className="h-3 w-3" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {message.context?.type}
                      </Badge>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi trợ lý AI về luận văn..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
            />
            <Button onClick={sendMessage} disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};