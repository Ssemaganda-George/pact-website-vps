import postgres from 'postgres';
import { config } from 'dotenv';

config();

async function checkClientLogos() {
  const sql = postgres(process.env.DATABASE_URL!);

  try {
    console.log('Checking client logos in Supabase...');
    const clients = await sql`SELECT id, name, logo FROM client_content LIMIT 5`;
    console.log('Client data:', JSON.stringify(clients, null, 2));
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkClientLogos();