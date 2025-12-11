-- =========================================
-- SUPABASE STORAGE BUCKETS SETUP SCRIPT
-- =========================================
-- Run this in Supabase SQL Editor to create all required storage buckets

-- =========================================
-- SUPABASE STORAGE BUCKETS SETUP SCRIPT
-- =========================================
-- Run this in Supabase SQL Editor to create all required storage buckets

-- Create buckets first
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('client-logos', 'client-logos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('team-members', 'team-members', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('about-images', 'about-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('location-images', 'location-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- CREATE STORAGE POLICIES
-- =========================================
-- Note: In Supabase, storage policies are created differently than table policies
-- These policies allow public read access to uploaded images

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for each bucket (these allow public read access)
-- Hero images
CREATE POLICY "hero-images-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'hero-images');

-- Client logos
CREATE POLICY "client-logos-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'client-logos');

-- Team members
CREATE POLICY "team-members-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'team-members');

-- Blog images
CREATE POLICY "blog-images-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

-- About images
CREATE POLICY "about-images-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'about-images');

-- Service images
CREATE POLICY "service-images-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Location images
CREATE POLICY "location-images-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'location-images');

-- Project images
CREATE POLICY "project-images-public-access" ON storage.objects
FOR SELECT USING (bucket_id = 'project-images');

-- =========================================
-- ALLOW AUTHENTICATED USERS TO UPLOAD
-- =========================================
-- These policies allow authenticated users to upload files to buckets

-- Hero images upload policy
CREATE POLICY "hero-images-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'hero-images' AND auth.role() = 'authenticated');

-- Client logos upload policy
CREATE POLICY "client-logos-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'client-logos' AND auth.role() = 'authenticated');

-- Team members upload policy
CREATE POLICY "team-members-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'team-members' AND auth.role() = 'authenticated');

-- Blog images upload policy
CREATE POLICY "blog-images-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- About images upload policy
CREATE POLICY "about-images-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'about-images' AND auth.role() = 'authenticated');

-- Service images upload policy
CREATE POLICY "service-images-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- Location images upload policy
CREATE POLICY "location-images-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'location-images' AND auth.role() = 'authenticated');

-- Project images upload policy
CREATE POLICY "project-images-upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- =========================================
-- VERIFICATION
-- =========================================

-- Check created buckets:
-- SELECT id, name, public, file_size_limit FROM storage.buckets ORDER BY name;

-- Check policies (should show 8 policies, one for each bucket):
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';