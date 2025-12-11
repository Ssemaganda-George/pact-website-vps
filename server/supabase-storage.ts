import { createClient } from '@supabase/supabase-js';
import { Request } from 'express';
import path from 'path';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Storage bucket names
export const BUCKETS = {
  HERO: 'hero-images',
  CLIENTS: 'client-logos',
  TEAM: 'team-members',
  BLOG: 'blog-images',
  ABOUT: 'about-images',
  SERVICES: 'service-images',
  LOCATIONS: 'location-images',
  PROJECTS: 'project-images'
} as const;

// Create buckets if they don't exist
export async function ensureBucketsExist() {
  for (const bucketName of Object.values(BUCKETS)) {
    try {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      if (error && error.message.includes('not found')) {
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        });
        if (createError) {
          console.error(`Failed to create bucket ${bucketName}:`, createError);
        } else {
          console.log(`Created bucket: ${bucketName}`);
        }
      }
    } catch (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
    }
  }
}

// Upload file to Supabase Storage
export async function uploadFileToSupabase(
  file: Express.Multer.File,
  bucketName: string,
  folder: string = ''
): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

// Delete file from Supabase Storage
export async function deleteFileFromSupabase(bucketName: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    return false;
  }
}

// Get public URL for a file
export function getSupabasePublicUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Convert local upload path to Supabase Storage URL
export function convertLocalPathToSupabaseUrl(localPath: string): string {
  if (!localPath || !localPath.startsWith('/uploads/')) {
    return localPath;
  }

  // Extract folder and filename from local path
  const pathParts = localPath.replace('/uploads/', '').split('/');
  const folder = pathParts[0];
  const filename = pathParts.slice(1).join('/');

  // Map folder to bucket
  const bucketMapping: Record<string, string> = {
    'hero': BUCKETS.HERO,
    'clients': BUCKETS.CLIENTS,
    'team': BUCKETS.TEAM,
    'blog': BUCKETS.BLOG,
    'about': BUCKETS.ABOUT,
    'services': BUCKETS.SERVICES,
    'locations': BUCKETS.LOCATIONS,
    'projects': BUCKETS.PROJECTS
  };

  const bucketName = bucketMapping[folder] || BUCKETS.HERO;

  return getSupabasePublicUrl(bucketName, filename);
}