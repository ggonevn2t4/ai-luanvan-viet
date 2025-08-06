-- Fix security issues by setting proper search paths

-- Update the comment timestamp function with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_comments()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update the last activity function with secure search path
CREATE OR REPLACE FUNCTION public.update_last_activity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;