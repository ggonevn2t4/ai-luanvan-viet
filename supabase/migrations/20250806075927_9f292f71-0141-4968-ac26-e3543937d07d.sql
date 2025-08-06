-- Fix security linter warnings by setting proper search paths

-- Fix function search path for calculate_thesis_progress
CREATE OR REPLACE FUNCTION public.calculate_thesis_progress(thesis_id_param UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
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

-- Fix function search path for update_thesis_progress
CREATE OR REPLACE FUNCTION public.update_thesis_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.theses 
  SET progress_percentage = public.calculate_thesis_progress(NEW.thesis_id),
      updated_at = now()
  WHERE id = NEW.thesis_id;
  RETURN NEW;
END;
$$;

-- Fix function search path for create_default_chapters
CREATE OR REPLACE FUNCTION public.create_default_chapters(thesis_id_param UUID, user_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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