-- Allow ekzekutiv users to view ekspert profiles for assignment purposes
CREATE POLICY "Ekzekutiv users can view ekspert profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (get_current_user_role() = 'ekzekutiv' AND role = 'ekspert')
);