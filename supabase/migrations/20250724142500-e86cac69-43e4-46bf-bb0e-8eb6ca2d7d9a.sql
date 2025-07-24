-- Create application_notes table for storing comments
CREATE TABLE public.application_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'internal',
  role TEXT,
  created_by UUID,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for application_notes
CREATE POLICY "Users can view notes for their applications" 
ON public.application_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applications 
    WHERE applications.id = application_notes.application_id 
    AND applications.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can insert notes" 
ON public.application_notes 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Add assigned_ekspert_id column to applications table
ALTER TABLE public.applications ADD COLUMN assigned_ekspert_id UUID;