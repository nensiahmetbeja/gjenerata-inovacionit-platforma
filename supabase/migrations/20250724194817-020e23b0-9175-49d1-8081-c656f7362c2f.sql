-- Add RLS policies to allow ekzekutiv users to view and manage all applications
CREATE POLICY "Ekzekutiv users can view all applications" 
ON public.applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ekzekutiv'
  )
);

CREATE POLICY "Ekzekutiv users can update all applications" 
ON public.applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ekzekutiv'
  )
);

-- Also add policy for ekspert users to view their assigned applications
CREATE POLICY "Ekspert users can view assigned applications" 
ON public.applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'ekspert'
  ) AND assigned_ekspert_id = auth.uid()
);