-- Create applications storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('applications', 'applications', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Create storage policies for applications bucket
CREATE POLICY "Users can upload their own application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'applications' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'ekspert', 'ekzekutiv')
));

CREATE POLICY "Users can update their own application documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own application documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);