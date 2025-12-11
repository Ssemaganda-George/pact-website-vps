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

async function createFooter() {
  const result = await supabase.from('footer_content').insert({
    company_description: 'PACT Consultancy (PACT), is a leading global development consulting company with core footprints in Africa, Middle East and USA.',
    address: 'https://www.pactorg.com',
    phone: '',
    email: 'info@pactorg.com',
    social_links: [],
    copyright_text: '© 2025 PACT Consultancy. All rights reserved.',
    privacy_link: '#',
    terms_link: '#',
    sitemap_link: '#',
    updated_by: 1
  });
  console.log('Footer insert result:', result);
}

createFooter();