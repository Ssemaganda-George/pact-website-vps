import { db } from './server/db.js';
import { clientContent } from './shared/schema.js';

async function checkClients() {
  try {
    const clients = await db.select().from(clientContent);
    console.log('Clients:', clients.map(c => ({ name: c.name, logo: c.logo })));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkClients();