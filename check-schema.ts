import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkSchema() {
  // Check hero_slides table schema
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Hero slides table exists');
    if (data && data.length > 0) {
      console.log('Sample row:', JSON.stringify(data[0], null, 2));
    }
  }

  // Try to get table info using RPC if available
  try {
    const { data: info, error: infoError } = await supabase.rpc('get_table_info', { table_name: 'hero_slides' });
    if (!infoError) {
      console.log('Table info:', info);
    }
  } catch (e) {
    console.log('RPC not available');
  }
}

checkSchema();