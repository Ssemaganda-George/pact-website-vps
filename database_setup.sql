-- =========================================
-- PACT CONSULTANCY WEBSITE - DATABASE SETUP
-- =========================================
-- This script ensures all required tables and Supabase Storage buckets are created
-- Run this in your Supabase SQL Editor or database console

-- =========================================
-- 1. CREATE SUPABASE STORAGE BUCKETS
-- =========================================
-- Note: These need to be created via Supabase Dashboard or API
-- The buckets defined in the application are:
-- - hero-images (for hero slide background images)
-- - client-logos (for client/partner logos)
-- - team-members (for team member profile images)
-- - blog-images (for blog article images)
-- - about-images (for about section images)
-- - service-images (for service content images)
-- - location-images (for location images)
-- - project-images (for project background images)

-- SQL commands to create buckets (run these individually in Supabase SQL Editor):
-- Note: Bucket creation is typically done via the Supabase Dashboard Storage section
-- or programmatically. These are the bucket configurations:

-- Bucket: hero-images
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('hero-images', 'hero-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: client-logos
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('client-logos', 'client-logos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: team-members
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('team-members', 'team-members', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: blog-images
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('blog-images', 'blog-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: about-images
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('about-images', 'about-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: service-images
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('service-images', 'service-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: location-images
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('location-images', 'location-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Bucket: project-images
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('project-images', 'project-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- =========================================
-- 2. ENSURE ALL REQUIRED TABLES EXIST
-- =========================================
-- Note: Most tables are created via Drizzle migrations, but this ensures they exist

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"is_read" boolean DEFAULT false
);

-- CMS Content Tables

-- Expertise content
CREATE TABLE IF NOT EXISTS "expertise_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"capabilities" json NOT NULL,
	"order_index" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Service content
CREATE TABLE IF NOT EXISTS "service_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"details" json NOT NULL,
	"image" text,
	"order_index" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Client content
CREATE TABLE IF NOT EXISTS "client_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"type" text DEFAULT 'client' NOT NULL,
	"description" text,
	"url" text,
	"order_index" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Project content
CREATE TABLE IF NOT EXISTS "project_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"organization" text NOT NULL,
	"category" text,
	"bg_image" text,
	"icon" text,
	"duration" text,
	"location" text,
	"image" text,
	"status" text DEFAULT 'completed',
	"order_index" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Project to services many-to-many relationship
CREATE TABLE IF NOT EXISTS "project_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL REFERENCES "project_content"("id") ON DELETE cascade,
	"service_id" integer NOT NULL REFERENCES "service_content"("id") ON DELETE cascade,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_services_project_id_service_id_unique" UNIQUE("project_id","service_id")
);

-- Blog articles
CREATE TABLE IF NOT EXISTS "blog_articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"image" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"slug" text NOT NULL,
	"meta_description" text,
	"keywords" json DEFAULT '[]'::json,
	"author_name" text,
	"author_position" text,
	"author_avatar" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"updated_by" integer REFERENCES "users"("id"),
	CONSTRAINT "blog_articles_slug_unique" UNIQUE("slug")
);

-- Blog article to services many-to-many relationship
CREATE TABLE IF NOT EXISTS "blog_article_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_article_id" integer NOT NULL REFERENCES "blog_articles"("id") ON DELETE cascade,
	"service_id" integer NOT NULL REFERENCES "service_content"("id") ON DELETE cascade,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_article_services_blog_article_id_service_id_unique" UNIQUE("blog_article_id","service_id")
);

-- Blog article to projects many-to-many relationship
CREATE TABLE IF NOT EXISTS "blog_article_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"blog_article_id" integer NOT NULL REFERENCES "blog_articles"("id") ON DELETE cascade,
	"project_id" integer NOT NULL REFERENCES "project_content"("id") ON DELETE cascade,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_article_projects_blog_article_id_project_id_unique" UNIQUE("blog_article_id","project_id")
);

-- Locations table
CREATE TABLE IF NOT EXISTS "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"city" text NOT NULL,
	"country" text NOT NULL,
	"image" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Team members table
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"bio" text NOT NULL,
	"expertise" text[] NOT NULL,
	"image" text,
	"slug" text NOT NULL,
	"meta_description" text,
	"email" text NOT NULL,
	"linkedin" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Team member to services many-to-many relationship
CREATE TABLE IF NOT EXISTS "team_member_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_member_id" integer NOT NULL REFERENCES "team_members"("id") ON DELETE cascade,
	"service_id" integer NOT NULL REFERENCES "service_content"("id") ON DELETE cascade,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_member_services_team_member_id_service_id_unique" UNIQUE("team_member_id","service_id")
);

-- Hero slides table
CREATE TABLE IF NOT EXISTS "hero_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text NOT NULL,
	"action_text" text NOT NULL,
	"action_link" text NOT NULL,
	"background_image" text NOT NULL,
	"category" text,
	"video_background" text,
	"accent_color" text,
	"order_index" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- About content table
CREATE TABLE IF NOT EXISTS "about_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text NOT NULL,
	"image" text,
	"features" json NOT NULL,
	"client_retention_rate" integer DEFAULT 97,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Footer content table
CREATE TABLE IF NOT EXISTS "footer_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_description" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"social_links" jsonb DEFAULT '[]'::jsonb,
	"copyright_text" text NOT NULL,
	"privacy_link" text DEFAULT '#',
	"terms_link" text DEFAULT '#',
	"sitemap_link" text DEFAULT '#',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- Impact stats table
CREATE TABLE IF NOT EXISTS "impact_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"value" integer NOT NULL,
	"suffix" text,
	"label" text NOT NULL,
	"color" text DEFAULT '#E96D1F',
	"order_index" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" integer REFERENCES "users"("id")
);

-- =========================================
-- 3. CREATE STORAGE BUCKET POLICY FOR PUBLIC ACCESS
-- =========================================
-- This ensures uploaded images are publicly accessible

-- Create a policy for each bucket to allow public read access
-- Note: These policies need to be created for each bucket individually

-- Example policy for hero-images bucket:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');

-- Repeat for each bucket:
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'client-logos');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'team-members');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'about-images');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'location-images');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');

-- =========================================
-- 4. CREATE DEFAULT ADMIN USER (OPTIONAL)
-- =========================================
-- Uncomment and modify the following to create a default admin user
-- Make sure to hash the password properly in your application

-- INSERT INTO users (username, password, role) VALUES
-- ('admin', '$2b$10$hashed_password_here', 'admin')
-- ON CONFLICT (username) DO NOTHING;

-- =========================================
-- 5. VERIFICATION QUERIES
-- =========================================
-- Run these queries to verify everything is set up correctly

-- Check if all tables exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- Check if storage buckets exist:
-- SELECT id, name, public FROM storage.buckets;

-- Check storage policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'storage';

-- =========================================
-- SETUP COMPLETE
-- =========================================
-- Your PACT Consultancy website database and storage are now ready!
-- Make sure to:
-- 1. Create the storage buckets in Supabase Dashboard
-- 2. Set up the bucket policies for public access
-- 3. Configure your environment variables
-- 4. Run the application and test file uploads