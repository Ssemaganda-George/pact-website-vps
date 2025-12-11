#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL in .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env');
  console.error('Get this from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// List of buckets to manage
const buckets = [
  'hero-images',
  'client-logos',
  'team-members',
  'blog-images',
  'about-images',
  'service-images',
  'location-images',
  'project-images'
];

async function resetBuckets() {
  console.log('🚀 Resetting Supabase Storage Buckets...\n');

  for (const bucketName of buckets) {
    try {
      console.log(`🔄 Processing bucket: ${bucketName}`);

      // Try to delete the bucket first (will fail if it has files)
      try {
        const { error: deleteError } = await supabase.storage.deleteBucket(bucketName);
        if (deleteError && !deleteError.message.includes('not found')) {
          console.log(`  ⚠️  Could not delete ${bucketName} (may have files): ${deleteError.message}`);
        } else if (!deleteError) {
          console.log(`  🗑️  Deleted ${bucketName}`);
        }
      } catch (err) {
        console.log(`  ⚠️  Could not delete ${bucketName}: ${(err as Error).message}`);
      }

      // Create the bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        if (createError.message.includes('already exists')) {
          console.log(`  ✅ ${bucketName} already exists`);
        } else {
          console.log(`  ❌ Failed to create ${bucketName}: ${createError.message}`);
        }
      } else {
        console.log(`  ✅ Created ${bucketName}`);
      }

    } catch (err) {
      console.log(`  ❌ Error processing ${bucketName}: ${(err as Error).message}`);
    }
  }

  console.log('\n🔍 Verifying buckets...\n');

  try {
    const { data: bucketList, error } = await supabase.storage.listBuckets();

    if (error) {
      console.log(`❌ Failed to list buckets: ${error.message}`);
    } else {
      console.log('Current buckets:');
      bucketList.forEach(bucket => {
        console.log(`  📁 ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });

      const expectedBuckets = new Set(buckets);
      const existingBuckets = new Set(bucketList.map(b => b.name));
      const missingBuckets = [...expectedBuckets].filter(b => !existingBuckets.has(b));

      if (missingBuckets.length > 0) {
        console.log(`\n⚠️  Missing buckets: ${missingBuckets.join(', ')}`);
      } else {
        console.log('\n✅ All expected buckets exist!');
      }
    }

  } catch (err) {
    console.log(`❌ Error verifying buckets: ${(err as Error).message}`);
  }

  console.log('\n🎉 Bucket reset complete!');
  console.log('\n📋 Note: Row Level Security policies may need to be configured manually in Supabase Dashboard');
  console.log('   Go to: Storage → [bucket] → Policies');
}

async function main() {
  try {
    await resetBuckets();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();