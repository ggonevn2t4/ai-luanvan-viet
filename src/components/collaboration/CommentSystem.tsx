import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  Check, 
  Reply, 
  MoreHorizontal,
  Edit2,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Comment {
  id: string;
  thesis_id: string;
  chapter_id?: string;
  user_id: string;
  content: string;
  position_start?: number;
  position_end?: number;
  resolved: boolean;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

interface CommentSystemProps {
  comments: Comment[];
  onAddComment: (content: string, positionStart?: number, positionEnd?: number, parentId?: string) => Promise<any>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
  selectedText?: { start: number; end: number; text: string } | null;
  onClearSelection?: () => void;
}

export const CommentSystem = ({
  comments,
  onAddComment,
  onUpdateComment,
  onResolveComment,
  selectedText,
  onClearSelection
}: CommentSystemProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  // Filter comments based on resolved status
  const filteredComments = comments.filter(comment => 
    showResolved ? true : !comment.resolved
  );

  // Group comments by parent/child relationship
  const groupedComments = filteredComments.reduce((acc, comment) => {
    if (!comment.parent_comment_id) {
      acc[comment.id] = {
        parent: comment,
        replies: filteredComments.filter(c => c.parent_comment_id === comment.id)
      };
    }
    return acc;
  }, {} as Record<string, { parent: Comment; replies: Comment[] }>);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const result = await onAddComment(
      newComment,
      selectedText?.start,
      selectedText?.end,
      replyingTo || undefined
    );

    if (result) {
      setNewComment('');
      setReplyingTo(null);
      onClearSelection?.();
    }
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setNewComment('');
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !editContent.trim()) return;

    await onUpdateComment(editingComment, editContent);
    setEditingComment(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const getUserName = (userId: string) => {
    // In a real app, you'd have user profiles
    return userId === user?.id ? 'Bạn' : 'Người dùng';
  };

  const getUserInitials = (userId: string) => {
    return userId === user?.id ? 'B' : 'U';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Bình luận ({filteredComments.length})
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResolved(!showResolved)}
          >
            {showResolved ? 'Ẩn đã giải quyết' : 'Hiện đã giải quyết'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Comment Form */}
        <div className="space-y-3">
          {selectedText && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground mb-1">Văn bản được chọn:</p>
              <p className="text-sm italic">"{selectedText.text}"</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="mt-1 h-6 px-2"
              >
                Hủy chọn
              </Button>
            </div>
          )}

          {replyingTo && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                Đang trả lời bình luận của {getUserName(replyingTo)}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(null)}
                className="mt-1 h-6 px-2 text-blue-700"
              >
                Hủy trả lời
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              placeholder={replyingTo ? "Viết câu trả lời..." : "Thêm bình luận..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              size="sm"
              className="self-end"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Comments List */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          {Object.values(groupedComments).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          ) : (
            Object.values(groupedComments).map(({ parent, replies }) => (
              <div key={parent.id} className="space-y-3">
                {/* Parent Comment */}
                <div className={`p-3 rounded-md border ${parent.resolved ? 'bg-green-50 border-green-200' : 'bg-background'}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(parent.user_id)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {getUserName(parent.user_id)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(parent.created_at), { 
                              addSuffix: true, 
                              locale: vi 
                            })}
                          </span>
                          {parent.resolved && (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Đã giải quyết
                            </Badge>
                          )}
                        </div>

                        {parent.user_id === user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(parent)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              {!parent.resolved && (
                                <DropdownMenuItem onClick={() => onResolveComment(parent.id)}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Đánh dấu đã giải quyết
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {editingComment === parent.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Lưu
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{parent.content}</p>
                          {parent.position_start !== undefined && parent.position_end !== undefined && (
                            <p className="text-xs text-muted-foreground">
                              Vị trí: {parent.position_start}-{parent.position_end}
                            </p>
                          )}
                        </>
                      )}

                      {!parent.resolved && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReply(parent.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Trả lời
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-2 rounded-md bg-muted/50 border">
                        <div className="flex items-start gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {getUserInitials(reply.user_id)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">
                                {getUserName(reply.user_id)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(reply.created_at), { 
                                  addSuffix: true, 
                                  locale: vi 
                                })}
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};