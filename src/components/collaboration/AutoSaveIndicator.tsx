import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  History,
  RotateCcw 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface AutoSave {
  id: string;
  thesis_id: string;
  chapter_id?: string;
  user_id: string;
  content: string;
  version_number: number;
  is_current: boolean;
  created_at: string;
}

interface AutoSaveIndicatorProps {
  autoSaves: AutoSave[];
  isAutoSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
  onManualSave?: () => Promise<void>;
  onRestoreVersion?: (autoSave: AutoSave) => void;
  currentUserId?: string;
}

export const AutoSaveIndicator = ({
  autoSaves,
  isAutoSaving = false,
  lastSaved,
  hasUnsavedChanges = false,
  onManualSave,
  onRestoreVersion,
  currentUserId
}: AutoSaveIndicatorProps) => {
  const [showHistory, setShowHistory] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const currentAutoSave = autoSaves.find(save => save.is_current);
  const versionHistory = autoSaves
    .filter(save => !save.is_current)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10); // Show last 10 versions

  const getStatusIcon = () => {
    if (isAutoSaving) {
      return <Clock className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (hasUnsavedChanges) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isAutoSaving) {
      return 'Đang lưu tự động...';
    }
    if (hasUnsavedChanges) {
      return 'Có thay đổi chưa lưu';
    }
    if (lastSaved) {
      return `Đã lưu ${formatDistanceToNow(lastSaved, { addSuffix: true, locale: vi })}`;
    }
    return 'Chưa có thay đổi';
  };

  const getVersionLabel = (save: AutoSave) => {
    return `Phiên bản ${save.version_number}`;
  };

  const getUserName = (userId: string) => {
    return userId === currentUserId ? 'Bạn' : `Người dùng ${userId.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Tự động lưu
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
          >
            <History className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{getStatusText()}</p>
            {currentAutoSave && (
              <p className="text-xs text-muted-foreground">
                {getVersionLabel(currentAutoSave)} • {getUserName(currentAutoSave.user_id)}
              </p>
            )}
          </div>
          {onManualSave && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualSave}
              disabled={isAutoSaving || !hasUnsavedChanges}
            >
              Lưu ngay
            </Button>
          )}
        </div>

        {/* Auto-save Settings Info */}
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            💡 Tự động lưu mỗi 30 giây khi có thay đổi
          </p>
        </div>

        {/* Version History */}
        {showHistory && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Lịch sử phiên bản</h4>
              
              {versionHistory.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Chưa có phiên bản lưu trước đó
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {versionHistory.map((save) => (
                    <div
                      key={save.id}
                      className="flex items-center justify-between p-2 rounded-md border bg-background"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getVersionLabel(save)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getUserName(save.user_id)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(save.created_at), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </p>
                      </div>
                      
                      {onRestoreVersion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestoreVersion(save)}
                          className="h-8 px-2"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Khôi phục
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Current Version Info */}
        {currentAutoSave && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Phiên bản hiện tại</h4>
              <div className="p-2 rounded-md bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {getVersionLabel(currentAutoSave)}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Lưu bởi {getUserName(currentAutoSave.user_id)} • {formatDistanceToNow(new Date(currentAutoSave.created_at), { 
                    addSuffix: true, 
                    locale: vi 
                  })}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};