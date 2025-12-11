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

async function checkAboutContent() {
  const { data, error } = await supabase.from('about_content').select('*').single();

  if (error) {
    console.error('Error fetching about content:', error);
    return;
  }

  console.log('About content features:', data?.features);
  console.log('Features type:', typeof data?.features);
  console.log('Is array:', Array.isArray(data?.features));

  // If features is not an array, fix it
  if (!Array.isArray(data?.features)) {
    console.log('Fixing features field...');
    const defaultFeatures = [
      {
        title: 'Expertise',
        description: 'Years of experience in development consulting',
        icon: 'users'
      },
      {
        title: 'Global Reach',
        description: 'Presence in Africa, Middle East and USA',
        icon: 'globe'
      },
      {
        title: 'Impact',
        description: 'Millions of lives impacted through our work',
        icon: 'target'
      }
    ];

    const result = await supabase
      .from('about_content')
      .update({ features: defaultFeatures })
      .eq('id', data.id);

    console.log('Update result:', result);
  }
}

checkAboutContent();