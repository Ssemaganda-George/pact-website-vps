import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseConnectionString = process.env.DATABASE_URL!;
const supabaseClient = postgres(supabaseConnectionString, { prepare: false });
const supabaseDb = drizzle(supabaseClient, { schema });

async function checkMigrationStatus() {
  console.log('🔍 Checking migration status from Neon to Supabase...\n');

  const tables = [
    'users',
    'contact_messages',
    'expertise_content',
    'service_content',
    'client_content',
    'project_content',
    'project_services',
    'blog_articles',
    'blog_article_services',
    'blog_article_projects',
    'locations',
    'about_content',
    'footer_content',
    'team_members',
    'team_member_services',
    'hero_slides',
    'impact_stats'
  ];

  for (const tableName of tables) {
    try {
      const result = await supabaseClient`SELECT COUNT(*) as count FROM ${supabaseClient(tableName)}`;
      const count = parseInt(result[0].count);
      console.log(`${tableName}: ${count} records`);
    } catch (error) {
      console.error(`❌ Error checking ${tableName}:`, error.message);
    }
  }

  // Close connection
  await supabaseClient.end();
}

// Run check
checkMigrationStatus();