-- Make applications bucket public to allow document viewing
UPDATE storage.buckets 
SET public = true 
WHERE id = 'applications';