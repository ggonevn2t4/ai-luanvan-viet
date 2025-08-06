-- Create comments table for real-time commenting system
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thesis_id UUID NOT NULL,
  chapter_id UUID,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  position_start INTEGER,
  position_end INTEGER,
  resolved BOOLEAN DEFAULT false,
  parent_comment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create auto_saves table for conflict resolution
CREATE TABLE public.auto_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thesis_id UUID NOT NULL,
  chapter_id UUID,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_sessions table for presence tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thesis_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  current_chapter_id UUID,
  cursor_position INTEGER
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Users can view comments on accessible theses" 
ON public.comments 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM theses 
    WHERE theses.id = comments.thesis_id 
    AND theses.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM collaborators 
    WHERE collaborators.thesis_id = comments.thesis_id 
    AND collaborators.collaborator_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    AND collaborators.status = 'accepted'
  )
);

CREATE POLICY "Users can create comments on accessible theses" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    EXISTS (
      SELECT 1 FROM theses 
      WHERE theses.id = comments.thesis_id 
      AND theses.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.thesis_id = comments.thesis_id 
      AND collaborators.collaborator_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND collaborators.status = 'accepted'
    )
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for auto_saves
CREATE POLICY "Users can view auto_saves on accessible theses" 
ON public.auto_saves 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM theses 
    WHERE theses.id = auto_saves.thesis_id 
    AND theses.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM collaborators 
    WHERE collaborators.thesis_id = auto_saves.thesis_id 
    AND collaborators.collaborator_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    AND collaborators.status = 'accepted'
  )
);

CREATE POLICY "Users can create auto_saves on accessible theses" 
ON public.auto_saves 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    EXISTS (
      SELECT 1 FROM theses 
      WHERE theses.id = auto_saves.thesis_id 
      AND theses.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborators.thesis_id = auto_saves.thesis_id 
      AND collaborators.collaborator_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
      AND collaborators.status = 'accepted'
      AND 'write' = ANY(collaborators.permissions)
    )
  )
);

CREATE POLICY "Users can update their own auto_saves" 
ON public.auto_saves 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view sessions on accessible theses" 
ON public.user_sessions 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM theses 
    WHERE theses.id = user_sessions.thesis_id 
    AND theses.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM collaborators 
    WHERE collaborators.thesis_id = user_sessions.thesis_id 
    AND collaborators.collaborator_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
    AND collaborators.status = 'accepted'
  )
);

CREATE POLICY "Users can create their own sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.user_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_comments()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update last_activity
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_comments();

CREATE TRIGGER update_user_sessions_last_activity
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_last_activity();

-- Enable realtime for all collaboration tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auto_saves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.theses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chapters;

-- Set replica identity for realtime updates
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.auto_saves REPLICA IDENTITY FULL;
ALTER TABLE public.user_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.theses REPLICA IDENTITY FULL;
ALTER TABLE public.chapters REPLICA IDENTITY FULL;