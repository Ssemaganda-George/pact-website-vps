import { db } from './server/db.js';
import { locations } from './shared/schema.js';

async function checkLocations() {
  try {
    const result = await db.select().from(locations);
    console.log('Locations data:');
    result.forEach(loc => {
      console.log(`${loc.city}, ${loc.country}: ${loc.image}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkLocations();