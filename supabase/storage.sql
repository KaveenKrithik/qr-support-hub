
-- Create a storage bucket for request attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('request-attachments', 'Request Attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the storage bucket
CREATE POLICY "Anyone can view attachments" 
ON storage.objects FOR SELECT
USING (bucket_id = 'request-attachments');

CREATE POLICY "Authenticated users can upload attachments" 
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'request-attachments');
