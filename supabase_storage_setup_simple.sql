-- =========================================
-- ALTERNATIVE: SUPABASE STORAGE SETUP (SIMPLE VERSION)
-- =========================================
-- This version creates policies one by one to avoid conflicts
-- Run this if the main script fails due to existing policies

-- Create buckets (skip if they exist)
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

-- Create policies (skip if they exist - run these individually if needed)
DO $$
BEGIN
    -- Hero images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Hero Images Public Access') THEN
        CREATE POLICY "Hero Images Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');
    END IF;

    -- Client logos
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Client Logos Public Access') THEN
        CREATE POLICY "Client Logos Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'client-logos');
    END IF;

    -- Team members
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Team Members Public Access') THEN
        CREATE POLICY "Team Members Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'team-members');
    END IF;

    -- Blog images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Blog Images Public Access') THEN
        CREATE POLICY "Blog Images Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
    END IF;

    -- About images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'About Images Public Access') THEN
        CREATE POLICY "About Images Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'about-images');
    END IF;

    -- Service images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service Images Public Access') THEN
        CREATE POLICY "Service Images Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
    END IF;

    -- Location images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Location Images Public Access') THEN
        CREATE POLICY "Location Images Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'location-images');
    END IF;

    -- Project images
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Project Images Public Access') THEN
        CREATE POLICY "Project Images Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
    END IF;
END $$;