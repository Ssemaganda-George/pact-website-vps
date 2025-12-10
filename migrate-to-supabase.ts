import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { config } from 'dotenv';

// Load environment variables
config();

// Neon connection (source)
const neonConnectionString = 'postgresql://neondb_owner:npg_aTqvez1r0bkA@ep-holy-sea-ahwpuzyd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const neonClient = postgres(neonConnectionString, { prepare: false });
const neonDb = drizzle(neonClient, { schema });

// Supabase connection (destination)
const supabaseConnectionString = process.env.DATABASE_URL!;
const supabaseClient = postgres(supabaseConnectionString, { prepare: false });
const supabaseDb = drizzle(supabaseClient, { schema });

async function migrateData() {
  console.log('🚀 Starting migration from Neon to Supabase...');

  try {
    // Tables to migrate (in dependency order)
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
      console.log(`📊 Migrating table: ${tableName}`);

      try {
        // Get data from Neon
        const data = await neonClient`SELECT * FROM ${neonClient(tableName)}`;
        console.log(`   Found ${data.length} records in ${tableName}`);

        if (data.length === 0) {
          console.log(`   Skipping ${tableName} - no data to migrate`);
          continue;
        }

        // Clear existing data in Supabase
        await supabaseClient`DELETE FROM ${supabaseClient(tableName)}`;

        // Insert data into Supabase using raw SQL
        for (const row of data) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
          const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

          await supabaseClient.unsafe(query, values);
        }

        console.log(`   ✅ Migrated ${data.length} records to ${tableName}`);

      } catch (error) {
        console.error(`   ❌ Error migrating ${tableName}:`, error);
        // Continue with other tables
      }
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close connections
    await neonClient.end();
    await supabaseClient.end();
  }
}

// Run migration
migrateData();
