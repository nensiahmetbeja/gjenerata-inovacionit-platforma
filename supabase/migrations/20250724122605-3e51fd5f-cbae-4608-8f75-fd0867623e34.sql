-- Fix the function to have proper search_path security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, emri, mbiemri, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'emri',
    NEW.raw_user_meta_data->>'mbiemri',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;