import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHeroSlides() {
  const { data, error } = await supabase.from('hero_slides').select('*');

  if (error) {
    console.error('Error fetching hero slides:', error);
    return;
  }

  console.log('Hero slides data:', JSON.stringify(data, null, 2));
}

checkHeroSlides();