#!/usr/bin/env node

/**
 * PACT Consultancy - Supabase Storage Setup Script
 *
 * This script creates all required Supabase Storage buckets for the PACT website.
 * Run this script to set up storage buckets programmatically.
 *
 * Usage:
 * 1. Make sure your environment variables are set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * 2. Run: node setup-storage.js
 * 3. Or: npm run setup-storage (if added to package.json)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Bucket configurations
const BUCKETS = [
  {
    id: 'hero-images',
    name: 'hero-images',
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'client-logos',
    name: 'client-logos',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'team-members',
    name: 'team-members',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'blog-images',
    name: 'blog-images',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'about-images',
    name: 'about-images',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'service-images',
    name: 'service-images',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'location-images',
    name: 'location-images',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  {
    id: 'project-images',
    name: 'project-images',
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  }
];

async function setupStorageBuckets() {
  console.log('🚀 Setting up Supabase Storage buckets for PACT Consultancy...\n');

  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const bucket of BUCKETS) {
    try {
      console.log(`📦 Checking bucket: ${bucket.name}`);

      // Check if bucket exists
      const { data: existingBucket, error: checkError } = await supabase.storage.getBucket(bucket.id);

      if (checkError && checkError.message.includes('not found')) {
        // Bucket doesn't exist, create it
        console.log(`  ➕ Creating bucket: ${bucket.name}`);
        const { error: createError } = await supabase.storage.createBucket(bucket.id, {
          public: bucket.public,
          allowedMimeTypes: bucket.allowedMimeTypes,
          fileSizeLimit: bucket.fileSizeLimit
        });

        if (createError) {
          console.error(`  ❌ Failed to create bucket ${bucket.name}:`, createError.message);
          errorCount++;
        } else {
          console.log(`  ✅ Created bucket: ${bucket.name}`);
          successCount++;
        }
      } else if (existingBucket) {
        console.log(`  ℹ️  Bucket already exists: ${bucket.name}`);
        successCount++;
      } else {
        console.error(`  ❌ Error checking bucket ${bucket.name}:`, checkError.message);
        errorCount++;
      }
    } catch (error) {
      console.error(`  ❌ Unexpected error with bucket ${bucket.name}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Setup Summary:`);
  console.log(`  ✅ Successful: ${successCount} buckets`);
  console.log(`  ❌ Errors: ${errorCount} buckets`);

  if (successCount === BUCKETS.length) {
    console.log(`\n🎉 All storage buckets are ready!`);
    console.log(`\nNext steps:`);
    console.log(`1. Verify buckets in Supabase Dashboard > Storage`);
    console.log(`2. Test file uploads in your application`);
    console.log(`3. Check that images are publicly accessible`);
  } else {
    console.log(`\n⚠️  Some buckets failed to create. This is likely due to Row Level Security (RLS) policies.`);
    console.log(`\n🔧 Manual Setup Instructions:`);
    console.log(`1. Go to Supabase Dashboard → Storage`);
    console.log(`2. Create buckets manually with these settings:`);
    BUCKETS.forEach(bucket => {
      console.log(`   - ${bucket.name} (Public, 10MB limit, image types)`);
    });
    console.log(`3. Or run the SQL in supabase_storage_setup.sql in Supabase SQL Editor`);
    process.exit(1);
  }
}

// Run the setup
setupStorageBuckets().catch((error) => {
  console.error('💥 Setup failed:', error);
  process.exit(1);
});