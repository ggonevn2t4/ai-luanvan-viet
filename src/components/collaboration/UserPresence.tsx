import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Circle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface UserSession {
  id: string;
  thesis_id: string;
  user_id: string;
  session_start: string;
  last_activity: string;
  is_active: boolean;
  current_chapter_id?: string;
  cursor_position?: number;
}

interface UserPresenceProps {
  activeSessions: UserSession[];
  currentUserId?: string;
  currentChapterId?: string;
}

export const UserPresence = ({ 
  activeSessions, 
  currentUserId, 
  currentChapterId 
}: UserPresenceProps) => {
  const [now, setNow] = useState(new Date());

  // Update current time every minute for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter out current user and show only active sessions
  const otherUsers = activeSessions.filter(session => 
    session.user_id !== currentUserId &&
    session.is_active &&
    // Consider active if last activity was within 5 minutes
    new Date(session.last_activity).getTime() > Date.now() - 5 * 60 * 1000
  );

  // Group by chapter
  const usersByChapter = otherUsers.reduce((acc, session) => {
    const chapterId = session.current_chapter_id || 'general';
    if (!acc[chapterId]) acc[chapterId] = [];
    acc[chapterId].push(session);
    return acc;
  }, {} as Record<string, UserSession[]>);

  const getUserName = (userId: string) => {
    // In a real app, you'd fetch user profiles
    return `Người dùng ${userId.slice(-4)}`;
  };

  const getUserInitials = (userId: string) => {
    return userId.slice(-2).toUpperCase();
  };

  const getStatusColor = (lastActivity: string) => {
    const timeDiff = Date.now() - new Date(lastActivity).getTime();
    if (timeDiff < 60000) return 'text-green-500'; // Active within 1 minute
    if (timeDiff < 300000) return 'text-yellow-500'; // Active within 5 minutes
    return 'text-gray-500';
  };

  const getStatusText = (lastActivity: string) => {
    const timeDiff = Date.now() - new Date(lastActivity).getTime();
    if (timeDiff < 60000) return 'Đang hoạt động';
    return `Hoạt động ${formatDistanceToNow(new Date(lastActivity), { addSuffix: true, locale: vi })}`;
  };

  if (otherUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Người dùng trực tuyến
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Hiện tại chỉ có bạn đang trực tuyến
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Người dùng trực tuyến ({otherUsers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(usersByChapter).map(([chapterId, sessions]) => (
          <div key={chapterId} className="space-y-2">
            {chapterId !== 'general' && (
              <h4 className="font-medium text-sm text-muted-foreground">
                {chapterId === currentChapterId ? 'Chương hiện tại' : `Chương ${chapterId}`}
              </h4>
            )}
            
            <div className="space-y-2">
              {sessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(session.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <Circle 
                      className={`absolute -bottom-1 -right-1 w-3 h-3 fill-current ${getStatusColor(session.last_activity)}`}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getUserName(session.user_id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStatusText(session.last_activity)}
                    </p>
                    {session.cursor_position !== undefined && (
                      <p className="text-xs text-blue-600">
                        Vị trí con trỏ: {session.cursor_position}
                      </p>
                    )}
                  </div>

                  {session.current_chapter_id === currentChapterId && (
                    <Badge variant="secondary" className="text-xs">
                      Cùng chương
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tổng cộng {otherUsers.length} người đang trực tuyến</span>
            <span>Cập nhật {formatDistanceToNow(now, { addSuffix: true, locale: vi })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};