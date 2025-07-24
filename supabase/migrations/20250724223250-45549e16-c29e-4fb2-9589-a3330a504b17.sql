-- Add foreign key constraint between application_notes.created_by and profiles.id
ALTER TABLE public.application_notes 
ADD CONSTRAINT application_notes_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;