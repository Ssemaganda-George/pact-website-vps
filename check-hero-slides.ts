import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { config } from 'dotenv';

config();

const supabaseConnectionString = process.env.DATABASE_URL;
if (!supabaseConnectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const supabaseClient = postgres(supabaseConnectionString, { prepare: false });
const supabaseDb = drizzle(supabaseClient, { schema });

async function checkHeroSlides() {
  console.log('🔍 Checking hero slides data...\n');

  try {
    const data = await supabaseDb
      .select()
      .from(schema.heroSlides)
      .orderBy(schema.heroSlides.order_index);

    if (!data || data.length === 0) {
      console.log('❌ No hero slides found in database');
      return;
    }

    console.log(`Found ${data.length} hero slides:`);
    data.forEach((slide: any, index: number) => {
      console.log(`${index + 1}. ID: ${slide.id}`);
      console.log(`   Title: ${slide.title}`);
      console.log(`   Background Image: ${slide.backgroundImage}`);
      console.log(`   Image URL starts with: ${slide.backgroundImage.substring(0, 50)}...`);
      console.log('');
    });

    // Test if the URL is accessible
    if (data.length > 0 && data[0].backgroundImage) {
      console.log('🧪 Testing first image URL...');
      try {
        const response = await fetch(data[0].backgroundImage, { method: 'HEAD' });
        console.log(`   Status: ${response.status} ${response.statusText}`);
        if (response.status === 200) {
          console.log('   ✅ Image URL is accessible');
        } else {
          console.log('   ❌ Image URL returned error');
        }
      } catch (err) {
        console.log(`   ❌ Error accessing image URL: ${(err as Error).message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching hero slides:', error);
  }
}

checkHeroSlides();