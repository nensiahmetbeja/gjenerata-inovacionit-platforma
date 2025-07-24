-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) VALUES ('applications', 'applications', false);

-- Create storage policies for application documents
CREATE POLICY "Users can upload their own application documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own application documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own application documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own application documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'applications' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable RLS on applications table and add policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" 
ON public.applications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS on status_history table and add policies
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history of their applications" 
ON public.status_history 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.applications 
  WHERE applications.id = status_history.application_id 
  AND applications.user_id = auth.uid()
));

CREATE POLICY "System can insert status history" 
ON public.status_history 
FOR INSERT 
WITH CHECK (true);

-- Enable RLS on reference tables for read access
ALTER TABLE public.fusha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bashkia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view fusha" ON public.fusha FOR SELECT USING (true);
CREATE POLICY "Anyone can view bashkia" ON public.bashkia FOR SELECT USING (true);
CREATE POLICY "Anyone can view status" ON public.status FOR SELECT USING (true);

-- Insert initial status values
INSERT INTO public.status (label) VALUES ('I Ri'), ('Në Shqyrtim'), ('I Pranuar'), ('I Refuzuar')
ON CONFLICT DO NOTHING;