#!/usr/bin/env node

/**
 * Migration script to move existing local files to Supabase Storage
 * Run this after setting up the storage buckets in Supabase
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Bucket mappings for different file types
const BUCKET_MAPPINGS = {
  'hero': 'hero-images',
  'clients': 'client-logos',
  'team': 'team-members',
  'blog': 'blog-images',
  'about': 'about-images',
  'services': 'service-images',
  'locations': 'location-images',
  'projects': 'project-images'
};

async function uploadFile(filePath, bucketName) {
  try {
    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    console.log(`Uploading ${fileName} to ${bucketName}...`);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: getContentType(fileName),
        upsert: true
      });

    if (error) {
      console.error(`Error uploading ${fileName}:`, error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    console.log(`✓ Uploaded ${fileName} to ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  return contentTypes[ext] || 'application/octet-stream';
}

async function migrateDirectory(localDir, bucketName) {
  if (!fs.existsSync(localDir)) {
    console.log(`Directory ${localDir} does not exist, skipping...`);
    return [];
  }

  const files = fs.readdirSync(localDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });

  console.log(`Found ${files.length} files in ${localDir}`);

  const results = [];
  for (const file of files) {
    const filePath = path.join(localDir, file);
    const publicUrl = await uploadFile(filePath, bucketName);
    if (publicUrl) {
      results.push({
        localPath: filePath,
        supabaseUrl: publicUrl,
        bucket: bucketName
      });
    }
  }

  return results;
}

async function main() {
  console.log('🚀 Starting migration from local files to Supabase Storage...\n');

  const uploadsDir = path.join(__dirname, 'uploads');
  const results = [];

  // Migrate each directory
  for (const [localFolder, bucketName] of Object.entries(BUCKET_MAPPINGS)) {
    const localDir = path.join(uploadsDir, localFolder);
    console.log(`\n📁 Migrating ${localFolder} to ${bucketName}...`);
    const folderResults = await migrateDirectory(localDir, bucketName);
    results.push(...folderResults);
  }

  // Also check for any files in the root uploads directory
  const rootFiles = fs.readdirSync(uploadsDir).filter(file => {
    return fs.statSync(path.join(uploadsDir, file)).isFile();
  });

  if (rootFiles.length > 0) {
    console.log('\n📁 Migrating root uploads files...');
    for (const file of rootFiles) {
      const filePath = path.join(uploadsDir, file);
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        // Try to determine bucket based on filename patterns
        let bucketName = 'hero-images'; // default
        if (file.includes('client') || file.includes('logo')) bucketName = 'client-logos';
        else if (file.includes('team') || file.includes('member')) bucketName = 'team-members';
        else if (file.includes('blog')) bucketName = 'blog-images';
        else if (file.includes('about')) bucketName = 'about-images';
        else if (file.includes('service')) bucketName = 'service-images';
        else if (file.includes('location')) bucketName = 'location-images';
        else if (file.includes('project')) bucketName = 'project-images';

        const publicUrl = await uploadFile(filePath, bucketName);
        if (publicUrl) {
          results.push({
            localPath: filePath,
            supabaseUrl: publicUrl,
            bucket: bucketName
          });
        }
      }
    }
  }

  // Save migration results
  const resultsPath = path.join(__dirname, 'migration-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Migration complete!`);
  console.log(`📊 Migrated ${results.length} files`);
  console.log(`📄 Results saved to migration-results.json`);

  // Summary
  const bucketSummary = results.reduce((acc, result) => {
    acc[result.bucket] = (acc[result.bucket] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📈 Summary by bucket:');
  Object.entries(bucketSummary).forEach(([bucket, count]) => {
    console.log(`  ${bucket}: ${count} files`);
  });
}

main().catch(console.error);