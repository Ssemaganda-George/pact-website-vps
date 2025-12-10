import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';
import { config } from 'dotenv';

config();

async function checkLocations() {
  const db = drizzle(postgres(process.env.DATABASE_URL!), { schema });

  const locations = await db.select().from(schema.locations);

  console.log('Location Images:');
  locations.forEach(loc => {
    if (loc.image) {
      console.log(`${loc.city}, ${loc.country}: ${loc.image}`);
    } else {
      console.log(`${loc.city}, ${loc.country}: No image`);
    }
  });

  process.exit(0);
}

checkLocations();