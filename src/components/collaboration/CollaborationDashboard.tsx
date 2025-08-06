import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageCircle, 
  Save, 
  Wifi, 
  WifiOff,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { CommentSystem } from './CommentSystem';
import { UserPresence } from './UserPresence';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CollaborationDashboardProps {
  thesisId: string;
  chapterId?: string;
  content?: string;
  onContentChange?: (content: string) => void;
  className?: string;
}

export const CollaborationDashboard = ({
  thesisId,
  chapterId,
  content = '',
  onContentChange,
  className = ''
}: CollaborationDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const contentRef = useRef(content);
  const lastAutoSaveRef = useRef<Date | null>(null);

  const {
    comments,
    activeSessions,
    autoSaves,
    isConnected,
    addComment,
    updateComment,
    resolveComment,
    updateCursorPosition,
    scheduleAutoSave,
    performAutoSave
  } = useRealtimeCollaboration({ thesisId, chapterId });

  // Track content changes
  useEffect(() => {
    if (content !== contentRef.current) {
      contentRef.current = content;
      setHasUnsavedChanges(true);
      
      // Schedule auto-save
      scheduleAutoSave(content);
    }
  }, [content, scheduleAutoSave]);

  // Handle text selection for commenting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      setSelectedText({
        start: range.startOffset,
        end: range.endOffset,
        text: selection.toString()
      });
    }
  };

  // Manual save
  const handleManualSave = async () => {
    try {
      await performAutoSave(content);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Đã lưu thành công",
        description: "Nội dung của bạn đã được lưu an toàn.",
      });
    } catch (error) {
      toast({
        title: "Lỗi lưu file",
        description: "Có lỗi xảy ra khi lưu. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  // Restore version
  const handleRestoreVersion = (autoSave: any) => {
    if (onContentChange) {
      onContentChange(autoSave.content);
      setHasUnsavedChanges(true);
      
      toast({
        title: "Đã khôi phục phiên bản",
        description: `Đã khôi phục phiên bản ${autoSave.version_number}`,
      });
    }
  };

  // Clear text selection
  const clearSelection = () => {
    setSelectedText(null);
    window.getSelection()?.removeAllRanges();
  };

  // Auto-save status detection
  const isAutoSaving = lastAutoSaveRef.current && 
    Date.now() - lastAutoSaveRef.current.getTime() < 2000;

  const unresolvedComments = comments.filter(c => !c.resolved);
  const activeUsers = activeSessions.filter(s => 
    s.user_id !== user?.id && 
    s.is_active &&
    new Date(s.last_activity).getTime() > Date.now() - 5 * 60 * 1000
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Status Bar */}
      <Card className="bg-background border">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {isConnected ? 'Đã kết nối' : 'Mất kết nối'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {activeUsers.length + 1} trực tuyến
                </Badge>
                
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {unresolvedComments.length} bình luận
                </Badge>

                <Badge 
                  variant={hasUnsavedChanges ? "destructive" : "secondary"} 
                  className="flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  {hasUnsavedChanges ? 'Chưa lưu' : 'Đã lưu'}
                </Badge>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Collaboration Panel */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Cộng tác thời gian thực
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Bình luận ({unresolvedComments.length})
                </TabsTrigger>
                <TabsTrigger value="presence" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Người dùng ({activeUsers.length})
                </TabsTrigger>
                <TabsTrigger value="autosave" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Tự động lưu
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-4">
                <CommentSystem
                  comments={comments}
                  onAddComment={addComment}
                  onUpdateComment={updateComment}
                  onResolveComment={resolveComment}
                  selectedText={selectedText}
                  onClearSelection={clearSelection}
                />
              </TabsContent>

              <TabsContent value="presence" className="mt-4">
                <UserPresence
                  activeSessions={activeSessions}
                  currentUserId={user?.id}
                  currentChapterId={chapterId}
                />
              </TabsContent>

              <TabsContent value="autosave" className="mt-4">
                <AutoSaveIndicator
                  autoSaves={autoSaves}
                  isAutoSaving={isAutoSaving}
                  lastSaved={lastSaved}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onManualSave={handleManualSave}
                  onRestoreVersion={handleRestoreVersion}
                  currentUserId={user?.id}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions (when collapsed) */}
      {!isExpanded && (
        <div className="flex gap-2">
          {selectedText && (
            <Card className="flex-1">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Văn bản được chọn</p>
                    <p className="text-xs text-muted-foreground truncate">
                      "{selectedText.text}"
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => {
                        addComment(`Bình luận về: "${selectedText.text}"`, selectedText.start, selectedText.end);
                        clearSelection();
                      }}
                    >
                      Bình luận
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {unresolvedComments.length > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {unresolvedComments.length} bình luận mới
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(true)}
                  >
                    Xem
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Hidden text selection handler */}
      <div
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
};