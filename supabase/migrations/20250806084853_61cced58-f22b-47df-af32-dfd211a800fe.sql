-- Fix RLS policies that reference auth.users table which causes permission denied errors
-- Create a security definer function to get user email safely
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update collaborators policies to use the security definer function
DROP POLICY IF EXISTS "Collaborators can view collaboration info" ON public.collaborators;
CREATE POLICY "Collaborators can view collaboration info" ON public.collaborators
FOR SELECT
USING (
  (auth.uid() = owner_id) OR 
  (public.get_current_user_email() = collaborator_email)
);

-- Update comments policies
DROP POLICY IF EXISTS "Users can create comments on accessible theses" ON public.comments;
CREATE POLICY "Users can create comments on accessible theses" ON public.comments
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND (
    (EXISTS (SELECT 1 FROM theses WHERE theses.id = comments.thesis_id AND theses.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM collaborators WHERE collaborators.thesis_id = comments.thesis_id AND collaborators.collaborator_email = public.get_current_user_email() AND collaborators.status = 'accepted'))
  )
);

DROP POLICY IF EXISTS "Users can view comments on accessible theses" ON public.comments;
CREATE POLICY "Users can view comments on accessible theses" ON public.comments
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (SELECT 1 FROM theses WHERE theses.id = comments.thesis_id AND theses.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM collaborators WHERE collaborators.thesis_id = comments.thesis_id AND collaborators.collaborator_email = public.get_current_user_email() AND collaborators.status = 'accepted'))
);

-- Update auto_saves policies
DROP POLICY IF EXISTS "Users can create auto_saves on accessible theses" ON public.auto_saves;
CREATE POLICY "Users can create auto_saves on accessible theses" ON public.auto_saves
FOR INSERT
WITH CHECK (
  (auth.uid() = user_id) AND (
    (EXISTS (SELECT 1 FROM theses WHERE theses.id = auto_saves.thesis_id AND theses.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM collaborators WHERE collaborators.thesis_id = auto_saves.thesis_id AND collaborators.collaborator_email = public.get_current_user_email() AND collaborators.status = 'accepted' AND 'write' = ANY(collaborators.permissions)))
  )
);

DROP POLICY IF EXISTS "Users can view auto_saves on accessible theses" ON public.auto_saves;
CREATE POLICY "Users can view auto_saves on accessible theses" ON public.auto_saves
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (SELECT 1 FROM theses WHERE theses.id = auto_saves.thesis_id AND theses.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM collaborators WHERE collaborators.thesis_id = auto_saves.thesis_id AND collaborators.collaborator_email = public.get_current_user_email() AND collaborators.status = 'accepted'))
);

-- Update user_sessions policies
DROP POLICY IF EXISTS "Users can view sessions on accessible theses" ON public.user_sessions;
CREATE POLICY "Users can view sessions on accessible theses" ON public.user_sessions
FOR SELECT
USING (
  (auth.uid() = user_id) OR
  (EXISTS (SELECT 1 FROM theses WHERE theses.id = user_sessions.thesis_id AND theses.user_id = auth.uid())) OR
  (EXISTS (SELECT 1 FROM collaborators WHERE collaborators.thesis_id = user_sessions.thesis_id AND collaborators.collaborator_email = public.get_current_user_email() AND collaborators.status = 'accepted'))
);