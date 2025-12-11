import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function checkHeroSlide() {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Hero slide data:', JSON.stringify(data, null, 2));
  }
}

checkHeroSlide();