-- Add assigned_ekspert_id column to applications table
ALTER TABLE public.applications 
ADD COLUMN assigned_ekspert_id UUID REFERENCES public.profiles(id);

-- Create index for better performance when querying by assigned expert
CREATE INDEX idx_applications_assigned_ekspert ON public.applications(assigned_ekspert_id);

-- Add RLS policies for application_notes table
ALTER TABLE public.application_notes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view notes on their own applications
CREATE POLICY "Users can view notes on their applications" 
ON public.application_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applications 
    WHERE applications.id = application_notes.application_id 
    AND applications.user_id = auth.uid()
  )
);

-- Policy for admins and experts to view all notes
CREATE POLICY "Admins and experts can view all notes" 
ON public.application_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'ekspert', 'ekzekutiv')
  )
);

-- Policy for admins and experts to create notes
CREATE POLICY "Admins and experts can create notes" 
ON public.application_notes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'ekspert', 'ekzekutiv')
  )
);

-- Policy for users to create notes on their own applications
CREATE POLICY "Users can create notes on their applications" 
ON public.application_notes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications 
    WHERE applications.id = application_notes.application_id 
    AND applications.user_id = auth.uid()
  )
);