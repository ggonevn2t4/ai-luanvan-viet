import { Loader2, FileText, Brain, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface LoadingStatesProps {
  type: 'generating' | 'exporting' | 'saving' | 'analyzing';
  progress?: number;
  message?: string;
  steps?: string[];
  currentStep?: number;
}

const LoadingStates = ({ 
  type, 
  progress = 0, 
  message, 
  steps = [],
  currentStep = 0 
}: LoadingStatesProps) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'generating':
        return {
          icon: Brain,
          title: 'Đang tạo luận văn...',
          defaultMessage: 'AI đang phân tích chủ đề và tạo nội dung chất lượng cao',
          color: 'from-primary to-accent',
          steps: steps.length > 0 ? steps : [
            'Phân tích chủ đề và yêu cầu',
            'Xây dựng cấu trúc luận văn',
            'Tạo nội dung chi tiết',
            'Kiểm tra và hoàn thiện'
          ]
        };
      case 'exporting':
        return {
          icon: FileText,
          title: 'Đang xuất file...',
          defaultMessage: 'Đang chuẩn bị file để tải xuống',
          color: 'from-accent to-secondary',
          steps: steps.length > 0 ? steps : [
            'Chuẩn bị nội dung',
            'Định dạng file',
            'Tạo file xuất',
            'Sẵn sàng tải xuống'
          ]
        };
      case 'saving':
        return {
          icon: CheckCircle,
          title: 'Đang lưu...',
          defaultMessage: 'Lưu tiến trình và nội dung',
          color: 'from-green-500 to-emerald-500',
          steps: steps.length > 0 ? steps : [
            'Chuẩn bị dữ liệu',
            'Lưu vào cơ sở dữ liệu',
            'Đồng bộ hóa',
            'Hoàn tất'
          ]
        };
      case 'analyzing':
        return {
          icon: Brain,
          title: 'Đang phân tích...',
          defaultMessage: 'Phân tích nội dung và đưa ra gợi ý',
          color: 'from-purple-500 to-pink-500',
          steps: steps.length > 0 ? steps : [
            'Đọc nội dung',
            'Phân tích cấu trúc',
            'Kiểm tra chất lượng',
            'Đưa ra gợi ý'
          ]
        };
      default:
        return {
          icon: Loader2,
          title: 'Đang xử lý...',
          defaultMessage: 'Vui lòng chờ trong giây lát',
          color: 'from-primary to-accent',
          steps: ['Đang xử lý...']
        };
    }
  };

  const config = getLoadingConfig();
  const IconComponent = config.icon;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${config.color} p-4 animate-pulse`}>
              <IconComponent className="w-12 h-12 text-white animate-spin" />
            </div>
            {/* Ripple effect */}
            <div className={`absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-r ${config.color} opacity-20 animate-ping`} />
          </div>

          {/* Title and Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{config.title}</h3>
            <p className="text-muted-foreground">
              {message || config.defaultMessage}
            </p>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tiến độ</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Steps */}
          {config.steps.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">Các bước thực hiện:</div>
              <div className="space-y-2">
                {config.steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center text-sm p-2 rounded-lg transition-all ${
                      index < currentStep 
                        ? 'bg-primary/10 text-primary' 
                        : index === currentStep 
                        ? 'bg-accent/10 text-accent animate-pulse' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      index < currentStep 
                        ? 'bg-primary' 
                        : index === currentStep 
                        ? 'bg-accent animate-pulse' 
                        : 'bg-muted-foreground/30'
                    }`} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingStates;