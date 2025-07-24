-- First, drop the problematic policies that could cause infinite recursion
DROP POLICY IF EXISTS "Ekzekutiv users can view all applications" ON public.applications;
DROP POLICY IF EXISTS "Ekzekutiv users can update all applications" ON public.applications;
DROP POLICY IF EXISTS "Ekspert users can view assigned applications" ON public.applications;

-- Create a security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now create the correct RLS policies using the function
CREATE POLICY "Ekzekutiv users can view all applications" 
ON public.applications 
FOR SELECT 
USING (public.get_current_user_role() = 'ekzekutiv');

CREATE POLICY "Ekzekutiv users can update all applications" 
ON public.applications 
FOR UPDATE 
USING (public.get_current_user_role() = 'ekzekutiv');

CREATE POLICY "Ekspert users can view assigned applications" 
ON public.applications 
FOR SELECT 
USING (
  public.get_current_user_role() = 'ekspert' 
  AND assigned_ekspert_id = auth.uid()
);