-- Add UPDATE and DELETE policies for application_notes so users can edit their own comments

-- Allow users to update their own comments
CREATE POLICY "Users can update their own notes" 
ON public.application_notes 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own notes" 
ON public.application_notes 
FOR DELETE 
USING (auth.uid() = created_by);