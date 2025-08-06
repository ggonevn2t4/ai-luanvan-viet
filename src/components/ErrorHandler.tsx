import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

interface ErrorHandlerProps {
  error: Error | string;
  onRetry?: () => void;
  onReset?: () => void;
  context?: string;
  showDetails?: boolean;
}

const ErrorHandler = ({ 
  error, 
  onRetry, 
  onReset, 
  context = 'Hệ thống',
  showDetails = false 
}: ErrorHandlerProps) => {
  const [showFullError, setShowFullError] = useState(false);
  
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? null : error.stack;

  const getErrorType = () => {
    const message = errorMessage.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        title: 'Lỗi kết nối mạng',
        description: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.',
        icon: '🌐',
        suggestions: [
          'Kiểm tra kết nối internet',
          'Thử tải lại trang',
          'Kiểm tra tường lửa hoặc VPN'
        ]
      };
    }
    
    if (message.includes('unauthorized') || message.includes('403') || message.includes('401')) {
      return {
        type: 'auth',
        title: 'Lỗi xác thực',
        description: 'Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập.',
        icon: '🔒',
        suggestions: [
          'Đăng nhập lại',
          'Kiểm tra quyền truy cập',
          'Liên hệ quản trị viên nếu cần'
        ]
      };
    }
    
    if (message.includes('api') || message.includes('openrouter') || message.includes('key')) {
      return {
        type: 'api',
        title: 'Lỗi API',
        description: 'Có vấn đề với dịch vụ AI hoặc cấu hình API.',
        icon: '🤖',
        suggestions: [
          'Kiểm tra cấu hình API key',
          'Thử lại sau vài phút',
          'Liên hệ hỗ trợ kỹ thuật'
        ]
      };
    }
    
    return {
      type: 'general',
      title: 'Đã xảy ra lỗi',
      description: 'Có lỗi không mong muốn xảy ra trong hệ thống.',
      icon: '⚠️',
      suggestions: [
        'Thử tải lại trang',
        'Xóa bộ nhớ đệm trình duyệt',
        'Liên hệ hỗ trợ nếu lỗi tiếp tục'
      ]
    };
  };

  const errorInfo = getErrorType();

  return (
    <Card className="max-w-2xl mx-auto border-destructive/20">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">{errorInfo.icon}</div>
        <CardTitle className="text-destructive flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {errorInfo.title}
        </CardTitle>
        <CardDescription>
          {context && `${context}: `}{errorInfo.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Message */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="break-words">
            {errorMessage}
          </AlertDescription>
        </Alert>

        {/* Suggestions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Gợi ý khắc phục:</h4>
          <ul className="space-y-2">
            {errorInfo.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start text-sm text-muted-foreground">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button onClick={onRetry} className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          )}
          
          {onReset && (
            <Button onClick={onReset} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.reload()} 
            variant="ghost"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tải lại trang
          </Button>
        </div>

        {/* Error Details (for developers) */}
        {showDetails && errorStack && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullError(!showFullError)}
              className="text-xs"
            >
              <Bug className="w-3 h-3 mr-1" />
              {showFullError ? 'Ẩn' : 'Hiện'} chi tiết lỗi
            </Button>
            
            {showFullError && (
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                {errorStack}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ErrorHandler;