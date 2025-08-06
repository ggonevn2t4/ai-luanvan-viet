import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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

interface UseRealtimeCollaborationProps {
  thesisId: string;
  chapterId?: string;
}

export const useRealtimeCollaboration = ({ thesisId, chapterId }: UseRealtimeCollaborationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [autoSaves, setAutoSaves] = useState<AutoSave[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<any>(null);
  const sessionRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize real-time connection
  useEffect(() => {
    if (!user || !thesisId) return;

    const channelName = `thesis_${thesisId}${chapterId ? `_chapter_${chapterId}` : ''}`;
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `thesis_id=eq.${thesisId}${chapterId ? ` and chapter_id=eq.${chapterId}` : ''}`
        },
        (payload) => {
          handleCommentChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_sessions',
          filter: `thesis_id=eq.${thesisId}`
        },
        (payload) => {
          handleSessionChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auto_saves',
          filter: `thesis_id=eq.${thesisId}${chapterId ? ` and chapter_id=eq.${chapterId}` : ''}`
        },
        (payload) => {
          handleAutoSaveChange(payload);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          createUserSession();
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      endUserSession();
      clearAutoSaveTimer();
    };
  }, [user, thesisId, chapterId]);

  // Handle real-time comment changes
  const handleCommentChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setComments(prev => [...prev, newRecord]);
        break;
      case 'UPDATE':
        setComments(prev => prev.map(comment => 
          comment.id === newRecord.id ? newRecord : comment
        ));
        break;
      case 'DELETE':
        setComments(prev => prev.filter(comment => comment.id !== oldRecord.id));
        break;
    }
  }, []);

  // Handle real-time session changes
  const handleSessionChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setActiveSessions(prev => [...prev, newRecord]);
        break;
      case 'UPDATE':
        setActiveSessions(prev => prev.map(session => 
          session.id === newRecord.id ? newRecord : session
        ));
        break;
      case 'DELETE':
        setActiveSessions(prev => prev.filter(session => session.id !== oldRecord.id));
        break;
    }
  }, []);

  // Handle real-time auto-save changes
  const handleAutoSaveChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        setAutoSaves(prev => [...prev, newRecord]);
        break;
      case 'UPDATE':
        setAutoSaves(prev => prev.map(save => 
          save.id === newRecord.id ? newRecord : save
        ));
        break;
      case 'DELETE':
        setAutoSaves(prev => prev.filter(save => save.id !== oldRecord.id));
        break;
    }
  }, []);

  // Create user session for presence tracking
  const createUserSession = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          thesis_id: thesisId,
          user_id: user.id,
          current_chapter_id: chapterId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      sessionRef.current = data.id;
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  };

  // End user session
  const endUserSession = async () => {
    if (!sessionRef.current) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionRef.current);
    } catch (error) {
      console.error('Error ending user session:', error);
    }
  };

  // Update cursor position
  const updateCursorPosition = useCallback(async (position: number) => {
    if (!sessionRef.current) return;

    try {
      await supabase
        .from('user_sessions')
        .update({ 
          cursor_position: position,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionRef.current);
    } catch (error) {
      console.error('Error updating cursor position:', error);
    }
  }, []);

  // Add comment
  const addComment = useCallback(async (content: string, positionStart?: number, positionEnd?: number, parentId?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          thesis_id: thesisId,
          chapter_id: chapterId,
          user_id: user.id,
          content,
          position_start: positionStart,
          position_end: positionEnd,
          parent_comment_id: parentId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Bình luận đã được thêm",
        description: "Bình luận của bạn đã được lưu thành công.",
      });

      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, thesisId, chapterId, toast]);

  // Update comment
  const updateComment = useCallback(async (commentId: string, content: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Bình luận đã được cập nhật",
        description: "Bình luận của bạn đã được lưu thành công.",
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật bình luận. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Resolve comment
  const resolveComment = useCallback(async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ resolved: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Bình luận đã được giải quyết",
        description: "Bình luận đã được đánh dấu là đã giải quyết.",
      });
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast({
        title: "Lỗi",
        description: "Không thể giải quyết bình luận. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Auto-save functionality
  const clearAutoSaveTimer = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  };

  const scheduleAutoSave = useCallback((content: string) => {
    clearAutoSaveTimer();
    
    autoSaveTimerRef.current = setTimeout(async () => {
      await performAutoSave(content);
    }, 30000); // 30 seconds
  }, [thesisId, chapterId, user]);

  const performAutoSave = useCallback(async (content: string) => {
    if (!user) return;

    try {
      // Get the latest version number
      const { data: latestSave } = await supabase
        .from('auto_saves')
        .select('version_number')
        .eq('thesis_id', thesisId)
        .eq('chapter_id', chapterId || null)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestSave?.version_number || 0) + 1;

      // Mark previous saves as not current
      await supabase
        .from('auto_saves')
        .update({ is_current: false })
        .eq('thesis_id', thesisId)
        .eq('chapter_id', chapterId || null);

      // Create new auto-save
      const { error } = await supabase
        .from('auto_saves')
        .insert({
          thesis_id: thesisId,
          chapter_id: chapterId,
          user_id: user.id,
          content,
          version_number: nextVersion,
          is_current: true
        });

      if (error) throw error;

      console.log('Auto-save completed successfully');
    } catch (error) {
      console.error('Error performing auto-save:', error);
    }
  }, [user, thesisId, chapterId]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user || !thesisId) return;

      try {
        // Load comments
        const { data: commentsData } = await supabase
          .from('comments')
          .select('*')
          .eq('thesis_id', thesisId)
          .eq('chapter_id', chapterId || null)
          .order('created_at', { ascending: true });

        if (commentsData) setComments(commentsData);

        // Load active sessions
        const { data: sessionsData } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('thesis_id', thesisId)
          .eq('is_active', true)
          .gte('last_activity', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes

        if (sessionsData) setActiveSessions(sessionsData);

        // Load recent auto-saves
        const { data: autoSavesData } = await supabase
          .from('auto_saves')
          .select('*')
          .eq('thesis_id', thesisId)
          .eq('chapter_id', chapterId || null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (autoSavesData) setAutoSaves(autoSavesData);
      } catch (error) {
        console.error('Error loading collaboration data:', error);
      }
    };

    loadInitialData();
  }, [user, thesisId, chapterId]);

  return {
    // State
    comments,
    activeSessions,
    autoSaves,
    isConnected,
    
    // Actions
    addComment,
    updateComment,
    resolveComment,
    updateCursorPosition,
    scheduleAutoSave,
    performAutoSave
  };
};