import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { FileText, Search, Edit, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MultiStageGeneratorProps {
  thesisData: {
    topic: string;
    major: string;
    academicLevel: string;
    pages: number;
    requirements?: string;
    researchMethod: string;
    citationFormat: string;
  };
  onStageComplete: (stage: string, content: string, metadata?: any) => void;
}

interface StageResult {
  content: string;
  metadata?: any;
  citations?: any[];
  researchPapers?: string[];
}

export const MultiStageGenerator: React.FC<MultiStageGeneratorProps> = ({
  thesisData,
  onStageComplete
}) => {
  const { toast } = useToast();
  const [currentStage, setCurrentStage] = useState<'outline' | 'chapters' | 'refinement' | null>(null);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [stageResults, setStageResults] = useState<Record<string, StageResult>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const stages = [
    {
      id: 'outline',
      title: 'Tạo Outline',
      description: 'Xây dựng cấu trúc và outline chi tiết',
      icon: FileText,
      estimatedTime: '2-3 phút'
    },
    {
      id: 'chapters',
      title: 'Viết Nội Dung',
      description: 'Tạo nội dung đầy đủ các chương',
      icon: Edit,
      estimatedTime: '5-8 phút'
    },
    {
      id: 'refinement',
      title: 'Tinh Chỉnh',
      description: 'Hoàn thiện và tối ưu hóa chất lượng',
      icon: CheckCircle,
      estimatedTime: '3-5 phút'
    }
  ];

  const executeStage = async (stageId: string) => {
    setCurrentStage(stageId as any);
    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      const { data, error } = await supabase.functions.invoke('generate-thesis', {
        body: {
          ...thesisData,
          stage: stageId
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo nội dung');
      }

      const result: StageResult = {
        content: data.content,
        metadata: data.metadata,
        citations: data.citations,
        researchPapers: data.researchPapers
      };

      setStageResults(prev => ({ ...prev, [stageId]: result }));
      setCompletedStages(prev => new Set([...prev, stageId]));
      onStageComplete(stageId, data.content, data.metadata);

      toast({
        title: "Hoàn thành giai đoạn",
        description: `${stages.find(s => s.id === stageId)?.title} đã được tạo thành công`,
      });

    } catch (error) {
      console.error('Error in stage execution:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra',
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setCurrentStage(null);
    }
  };

  const getStageStatus = (stageId: string) => {
    if (completedStages.has(stageId)) return 'completed';
    if (currentStage === stageId) return 'active';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tạo Luận Văn Theo Giai Đoạn
          </CardTitle>
          <CardDescription>
            Quy trình tạo luận văn chất lượng cao với 3 giai đoạn chuyên nghiệp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Tiến độ tổng thể:</span>
            <div className="flex-1">
              <Progress value={(completedStages.size / stages.length) * 100} className="h-2" />
            </div>
            <Badge variant="outline">
              {completedStages.size}/{stages.length} hoàn thành
            </Badge>
          </div>

          <Separator />

          {/* Stages */}
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const status = getStageStatus(stage.id);
              const Icon = stage.icon;
              const isDisabled = index > 0 && !completedStages.has(stages[index - 1].id) && status !== 'active';

              return (
                <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getStatusColor(status)}`}>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{stage.title}</h3>
                      <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
                        {status === 'completed' ? 'Hoàn thành' : 
                         status === 'active' ? 'Đang thực hiện' : 'Chờ'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                    <p className="text-xs text-muted-foreground">Thời gian ước tính: {stage.estimatedTime}</p>
                  </div>

                  <div className="space-y-2">
                    {status === 'active' && isGenerating && (
                      <div className="w-32">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-center mt-1">{progress}%</p>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => executeStage(stage.id)}
                      disabled={isDisabled || isGenerating || status === 'completed'}
                      variant={status === 'completed' ? 'outline' : 'default'}
                      size="sm"
                    >
                      {status === 'completed' ? 'Tạo lại' :
                       status === 'active' ? 'Đang tạo...' : 'Bắt đầu'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Research Papers Display */}
          {Object.values(stageResults).some(result => result.researchPapers?.length) && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Nghiên cứu đã tích hợp:</h4>
              <div className="space-y-2">
                {Object.values(stageResults)
                  .flatMap(result => result.researchPapers || [])
                  .slice(0, 5)
                  .map((paper, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      • {paper}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Auto-generated Citations */}
          {Object.values(stageResults).some(result => result.citations?.length) && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Trích dẫn tự động:</h4>
              <div className="space-y-2">
                {Object.values(stageResults)
                  .flatMap(result => result.citations || [])
                  .slice(0, 3)
                  .map((citation, index) => (
                    <div key={index} className="text-sm p-2 bg-muted rounded">
                      <span className="font-medium">{citation.title}</span>
                      {citation.authors && <span> - {citation.authors.join(', ')}</span>}
                      {citation.year && <span> ({citation.year})</span>}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};