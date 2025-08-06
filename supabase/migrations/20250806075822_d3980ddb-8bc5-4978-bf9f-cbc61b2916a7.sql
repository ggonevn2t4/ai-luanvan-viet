-- Enhanced thesis management schema for Vietnamese AI platform

-- First, let's add new columns to the existing theses table for project management
ALTER TABLE public.theses 
ADD COLUMN description TEXT,
ADD COLUMN research_method TEXT,
ADD COLUMN citation_format TEXT DEFAULT 'APA',
ADD COLUMN pages_target INTEGER DEFAULT 50,
ADD COLUMN progress_percentage INTEGER DEFAULT 0,
ADD COLUMN deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN is_active BOOLEAN DEFAULT true,
ADD COLUMN tags TEXT[],
ADD COLUMN completion_date TIMESTAMP WITH TIME ZONE;

-- Create chapters table for progress tracking
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  target_words INTEGER DEFAULT 1000,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'reviewed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(thesis_id, chapter_number)
);

-- Create thesis versions table for version control
CREATE TABLE public.thesis_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  changes_summary TEXT,
  word_count INTEGER DEFAULT 0,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(thesis_id, version_number)
);

-- Create collaborators table for sharing with supervisors
CREATE TABLE public.collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  collaborator_email TEXT NOT NULL,
  collaborator_name TEXT,
  role TEXT DEFAULT 'reviewer' CHECK (role IN ('reviewer', 'supervisor', 'co_author', 'reader')),
  permissions TEXT[] DEFAULT ARRAY['read'],
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(thesis_id, collaborator_email)
);

-- Create citations table for reference library
CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  citation_key TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[],
  publication_year INTEGER,
  publication_type TEXT DEFAULT 'journal' CHECK (publication_type IN ('journal', 'book', 'conference', 'website', 'thesis', 'report', 'other')),
  journal_name TEXT,
  publisher TEXT,
  volume TEXT,
  issue TEXT,
  pages TEXT,
  doi TEXT,
  url TEXT,
  isbn TEXT,
  abstract TEXT,
  keywords TEXT[],
  notes TEXT,
  formatted_citation TEXT,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(thesis_id, citation_key)
);

-- Create export logs table for tracking exports
CREATE TABLE public.export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  export_format TEXT NOT NULL CHECK (export_format IN ('pdf', 'docx', 'latex', 'html')),
  export_options JSONB DEFAULT '{}',
  file_size INTEGER,
  export_duration INTEGER, -- in milliseconds
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS on all new tables
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thesis_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chapters table
CREATE POLICY "Users can view their own chapters"
ON public.chapters FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create chapters for their theses"
ON public.chapters FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.theses WHERE id = thesis_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their own chapters"
ON public.chapters FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapters"
ON public.chapters FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for thesis_versions table
CREATE POLICY "Users can view their thesis versions"
ON public.thesis_versions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create versions for their theses"
ON public.thesis_versions FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.theses WHERE id = thesis_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their thesis versions"
ON public.thesis_versions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their thesis versions"
ON public.thesis_versions FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for collaborators table
CREATE POLICY "Owners can manage collaborators"
ON public.collaborators FOR ALL
USING (auth.uid() = owner_id);

CREATE POLICY "Collaborators can view collaboration info"
ON public.collaborators FOR SELECT
USING (
  auth.uid() = owner_id OR 
  (SELECT email FROM auth.users WHERE id = auth.uid()) = collaborator_email
);

-- RLS Policies for citations table
CREATE POLICY "Users can view their citations"
ON public.citations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create citations for their theses"
ON public.citations FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.theses WHERE id = thesis_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their citations"
ON public.citations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their citations"
ON public.citations FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for export_logs table
CREATE POLICY "Users can view their export logs"
ON public.export_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create export logs for their theses"
ON public.export_logs FOR INSERT
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.theses WHERE id = thesis_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update their export logs"
ON public.export_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_thesis_versions_updated_at
  BEFORE UPDATE ON public.thesis_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaborators_updated_at
  BEFORE UPDATE ON public.collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citations_updated_at
  BEFORE UPDATE ON public.citations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_chapters_thesis_id ON public.chapters(thesis_id);
CREATE INDEX idx_chapters_user_id ON public.chapters(user_id);
CREATE INDEX idx_chapters_status ON public.chapters(status);

CREATE INDEX idx_thesis_versions_thesis_id ON public.thesis_versions(thesis_id);
CREATE INDEX idx_thesis_versions_user_id ON public.thesis_versions(user_id);
CREATE INDEX idx_thesis_versions_current ON public.thesis_versions(thesis_id, is_current);

CREATE INDEX idx_collaborators_thesis_id ON public.collaborators(thesis_id);
CREATE INDEX idx_collaborators_owner_id ON public.collaborators(owner_id);
CREATE INDEX idx_collaborators_email ON public.collaborators(collaborator_email);
CREATE INDEX idx_collaborators_status ON public.collaborators(status);

CREATE INDEX idx_citations_thesis_id ON public.citations(thesis_id);
CREATE INDEX idx_citations_user_id ON public.citations(user_id);
CREATE INDEX idx_citations_type ON public.citations(publication_type);
CREATE INDEX idx_citations_used ON public.citations(is_used);

CREATE INDEX idx_export_logs_thesis_id ON public.export_logs(thesis_id);
CREATE INDEX idx_export_logs_user_id ON public.export_logs(user_id);
CREATE INDEX idx_export_logs_status ON public.export_logs(status);
CREATE INDEX idx_export_logs_expires ON public.export_logs(expires_at);

-- Function to calculate thesis progress based on chapters
CREATE OR REPLACE FUNCTION public.calculate_thesis_progress(thesis_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    ROUND(
      (COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / 
       GREATEST(COUNT(*), 1)) * 100
    ), 0
  )::INTEGER
  FROM public.chapters 
  WHERE thesis_id = thesis_id_param;
$$;

-- Function to update thesis progress automatically
CREATE OR REPLACE FUNCTION public.update_thesis_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.theses 
  SET progress_percentage = public.calculate_thesis_progress(NEW.thesis_id),
      updated_at = now()
  WHERE id = NEW.thesis_id;
  RETURN NEW;
END;
$$;

-- Trigger to auto-update thesis progress when chapters change
CREATE TRIGGER update_thesis_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_thesis_progress();

-- Function to create default chapters for a new thesis
CREATE OR REPLACE FUNCTION public.create_default_chapters(thesis_id_param UUID, user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.chapters (thesis_id, user_id, chapter_number, title, target_words) VALUES
    (thesis_id_param, user_id_param, 1, 'Mở đầu', 1500),
    (thesis_id_param, user_id_param, 2, 'Chương 1: Cơ sở lý thuyết và tổng quan nghiên cứu', 3000),
    (thesis_id_param, user_id_param, 3, 'Chương 2: Phương pháp nghiên cứu', 2500),
    (thesis_id_param, user_id_param, 4, 'Chương 3: Kết quả nghiên cứu và thảo luận', 4000),
    (thesis_id_param, user_id_param, 5, 'Kết luận và kiến nghị', 1500),
    (thesis_id_param, user_id_param, 6, 'Tài liệu tham khảo', 500);
END;
$$;