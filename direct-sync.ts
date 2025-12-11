#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

// Production Supabase credentials (you'll need to provide these)
const PROD_SUPABASE_URL = process.env.PROD_VITE_SUPABASE_URL || 'https://etjtxhucuubuqqmrzfoh.supabase.co';
const PROD_SUPABASE_KEY = process.env.PROD_VITE_SUPABASE_ANON_KEY || '';

// Local Supabase credentials
const LOCAL_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const LOCAL_SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!LOCAL_SUPABASE_URL || !LOCAL_SUPABASE_KEY) {
  console.error('❌ Missing local Supabase environment variables');
  process.exit(1);
}

const localSupabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SUPABASE_KEY);

// Tables to sync
const tables = [
  'contact_messages',
  'expertise_content',
  'service_content',
  'client_content',
  'project_content',
  'blog_articles',
  'hero_slides',
  'about_content',
  'footer_content',
  'impact_stats',
  'team_members',
  'locations',
  'project_services',
  'blog_article_services',
  'blog_article_projects',
  'team_member_services'
];

// Direct database sync from production to local
async function syncFromProductionDb() {
  console.log('🚀 Starting direct database sync from production to local...\n');

  // Create production client only when needed
  if (!process.env.PROD_VITE_SUPABASE_URL || !process.env.PROD_VITE_SUPABASE_ANON_KEY) {
    console.log('❌ Production Supabase credentials not found in environment variables');
    console.log('Please set:');
    console.log('  PROD_VITE_SUPABASE_URL=your_production_supabase_url');
    console.log('  PROD_VITE_SUPABASE_ANON_KEY=your_production_supabase_key');
    return;
  }

  const prodSupabase = createClient(process.env.PROD_VITE_SUPABASE_URL, process.env.PROD_VITE_SUPABASE_ANON_KEY);

  for (const table of tables) {
    try {
      console.log(`📋 Syncing ${table}...`);

      // Fetch from production
      const { data: prodData, error: prodError } = await prodSupabase
        .from(table)
        .select('*');

      if (prodError) {
        console.error(`❌ Failed to fetch from production ${table}:`, prodError);
        continue;
      }

      console.log(`📥 Fetched ${prodData?.length || 0} records from production ${table}`);

      if (!prodData || prodData.length === 0) {
        console.log(`⏭️  Skipping ${table} - no data in production`);
        continue;
      }

      // Clear local table
      const { error: deleteError } = await localSupabase
        .from(table)
        .delete()
        .neq('id', 0);

      if (deleteError) {
        console.error(`❌ Failed to clear local ${table}:`, deleteError);
        continue;
      }

      // Insert into local in batches
      const batchSize = 50;
      for (let i = 0; i < prodData.length; i += batchSize) {
        const batch = prodData.slice(i, i + batchSize);
        const { error: insertError } = await localSupabase
          .from(table)
          .insert(batch);

        if (insertError) {
          console.error(`❌ Failed to insert batch into local ${table}:`, insertError);
          break;
        }
      }

      console.log(`✅ Successfully synced ${prodData.length} records to local ${table}`);

    } catch (error) {
      console.error(`❌ Error syncing ${table}:`, error);
    }
  }

  console.log('\n🎉 Database sync completed!');
}

// Create template for manual data entry
function createDataTemplate() {
  const template = {
    contact_messages: [],
    expertise_content: [],
    service_content: [],
    client_content: [],
    project_content: [],
    blog_articles: [],
    hero_slides: [],
    about_content: [],
    footer_content: [],
    impact_stats: [],
    team_members: [],
    locations: [],
    project_services: [],
    blog_article_services: [],
    blog_article_projects: [],
    team_member_services: []
  };

  const templatePath = path.join(process.cwd(), 'production-data-template.json');
  fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));

  console.log(`📝 Created data template at: ${templatePath}`);
  console.log('\n📋 Instructions:');
  console.log('1. Go to https://pact-website-vps-p9j9.onrender.com/admin/');
  console.log('2. Login with: pact / pact123');
  console.log('3. Copy data from each admin section into the template');
  console.log('4. Save as production-data.json');
  console.log('5. Run: npx tsx manual-sync.ts import production-data.json');
}

// Main function
async function main() {
  const command = process.argv[2];

  if (command === 'direct') {
    await syncFromProductionDb();
  } else if (command === 'template') {
    createDataTemplate();
  } else {
    console.log('🛠️  Database Sync Tool');
    console.log('');
    console.log('Direct sync (if you have production DB credentials):');
    console.log('  npx tsx direct-sync.ts direct');
    console.log('');
    console.log('Manual sync (recommended):');
    console.log('  npx tsx direct-sync.ts template  # Creates template file');
    console.log('  # Edit template with production data');
    console.log('  npx tsx manual-sync.ts import production-data.json');
    console.log('');
    console.log('Environment variables needed for direct sync:');
    console.log('  PROD_VITE_SUPABASE_URL=...');
    console.log('  PROD_VITE_SUPABASE_ANON_KEY=...');
  }
}

main().catch(console.error);