#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

// Export data from local database
async function exportLocalData() {
  console.log('📤 Exporting data from local database...\n');

  const exportData: Record<string, any[]> = {};

  for (const table of tables) {
    try {
      console.log(`📋 Exporting ${table}...`);
      const { data, error } = await supabase.from(table).select('*');

      if (error) {
        console.error(`❌ Failed to export ${table}:`, error);
        continue;
      }

      exportData[table] = data || [];
      console.log(`✅ Exported ${data?.length || 0} records from ${table}`);

    } catch (error) {
      console.error(`❌ Error exporting ${table}:`, error);
    }
  }

  // Save to file
  const exportPath = path.join(process.cwd(), 'local-database-export.json');
  fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

  console.log(`\n💾 Local database export saved to: ${exportPath}`);
  return exportData;
}

// Import data into local database
async function importData(importData: Record<string, any[]>) {
  console.log('\n📥 Importing data into local database...\n');

  for (const table of tables) {
    const data = importData[table];

    if (!data || data.length === 0) {
      console.log(`⏭️  Skipping ${table} - no data to import`);
      continue;
    }

    try {
      console.log(`📝 Importing ${data.length} records into ${table}...`);

      // Clear existing data
      const { error: deleteError } = await supabase.from(table).delete().neq('id', 0);
      if (deleteError) {
        console.error(`❌ Failed to clear ${table}:`, deleteError);
        continue;
      }

      // Insert new data in batches
      const batchSize = 100;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const { error: insertError } = await supabase.from(table).insert(batch);

        if (insertError) {
          console.error(`❌ Failed to insert batch into ${table}:`, insertError);
          break;
        }
      }

      console.log(`✅ Successfully imported ${data.length} records into ${table}`);

    } catch (error) {
      console.error(`❌ Error importing into ${table}:`, error);
    }
  }
}

// Main function
async function main() {
  const command = process.argv[2];

  if (command === 'export') {
    await exportLocalData();
  } else if (command === 'import') {
    const importPath = process.argv[3];
    if (!importPath) {
      console.error('❌ Please provide the path to the import file');
      console.log('Usage: npx tsx manual-sync.ts import <path-to-export-file>');
      process.exit(1);
    }

    if (!fs.existsSync(importPath)) {
      console.error(`❌ Import file not found: ${importPath}`);
      process.exit(1);
    }

    try {
      const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));
      await importData(importData);
    } catch (error) {
      console.error('❌ Failed to parse import file:', error);
      process.exit(1);
    }
  } else {
    console.log('🛠️  Manual Database Sync Tool');
    console.log('');
    console.log('Usage:');
    console.log('  Export local data:    npx tsx manual-sync.ts export');
    console.log('  Import data:          npx tsx manual-sync.ts import <path-to-json-file>');
    console.log('');
    console.log('Steps to sync production data to local:');
    console.log('1. Export production data manually from admin panel');
    console.log('2. Save the exported JSON data to a file');
    console.log('3. Run: npx tsx manual-sync.ts import <path-to-your-export-file>');
  }
}

main().catch(console.error);