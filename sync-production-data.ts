#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const PRODUCTION_URL = 'https://pact-website-vps.onrender.com';
const ADMIN_USERNAME = 'pact';
const ADMIN_PASSWORD = 'pact123';

// Local Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Login to production admin
async function loginToProduction(): Promise<string> {
  console.log('🔐 Logging into production admin...');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: AuthResponse = await response.json();

    if (!data.success || !data.token) {
      throw new Error(`Login failed: ${data.message}`);
    }

    console.log('✅ Successfully logged into production admin');
    return data.token;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Login request timed out - production server may be unreachable');
    }
    throw error;
  }
}

// Fetch data from production API
async function fetchProductionData(endpoint: string, token: string): Promise<any[]> {
  console.log(`📥 Fetching ${endpoint} from production...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${PRODUCTION_URL}/api${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      console.warn(`⚠️  Failed to fetch ${endpoint}: ${data.message}`);
      return [];
    }

    console.log(`✅ Fetched ${data.data?.length || 0} records from ${endpoint}`);
    return data.data || [];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`⚠️  Request to ${endpoint} timed out`);
      return [];
    }
    console.warn(`⚠️  Failed to fetch ${endpoint}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

// Clear local database table
async function clearLocalTable(tableName: string) {
  console.log(`🗑️  Clearing local ${tableName} table...`);

  const { error } = await supabase.from(tableName).delete().neq('id', 0);

  if (error) {
    console.error(`❌ Failed to clear ${tableName}:`, error);
    throw error;
  }

  console.log(`✅ Cleared ${tableName} table`);
}

// Insert data into local database
async function insertLocalData(tableName: string, data: any[]) {
  if (data.length === 0) {
    console.log(`⏭️  Skipping ${tableName} - no data to insert`);
    return;
  }

  console.log(`📝 Inserting ${data.length} records into local ${tableName}...`);

  // Insert in batches to avoid payload size limits
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const { error } = await supabase.from(tableName).insert(batch);

    if (error) {
      console.error(`❌ Failed to insert batch into ${tableName}:`, error);
      throw error;
    }
  }

  console.log(`✅ Successfully inserted ${data.length} records into ${tableName}`);
}

// Main sync function
async function syncDatabase() {
  try {
    console.log('🚀 Starting database sync from production to local...\n');

    // Login to production
    const token = await loginToProduction();

    // Define all the admin endpoints to sync
    const endpoints = [
      { endpoint: '/admin/contact', table: 'contact_messages' },
      { endpoint: '/admin/content/expertise', table: 'expertise_content' },
      { endpoint: '/admin/content/service', table: 'service_content' },
      { endpoint: '/admin/content/client', table: 'client_content' },
      { endpoint: '/admin/content/project', table: 'project_content' },
      { endpoint: '/admin/content/blog', table: 'blog_articles' },
      { endpoint: '/admin/content/hero-slides', table: 'hero_slides' },
      { endpoint: '/admin/content/about', table: 'about_content' },
      { endpoint: '/admin/content/footer', table: 'footer_content' },
      { endpoint: '/admin/impact', table: 'impact_stats' },
      { endpoint: '/admin/team', table: 'team_members' },
      { endpoint: '/admin/locations', table: 'locations' },
    ];

    // Sync each endpoint
    for (const { endpoint, table } of endpoints) {
      try {
        console.log(`\n📋 Processing ${table}...`);

        // Fetch data from production
        const data = await fetchProductionData(endpoint, token);

        // Clear local table
        await clearLocalTable(table);

        // Insert data into local table
        await insertLocalData(table, data);

      } catch (error) {
        console.error(`❌ Failed to sync ${table}:`, error);
        // Continue with other tables
      }
    }

    // Handle many-to-many relationships
    console.log('\n📋 Processing many-to-many relationships...');

    // Project services
    try {
      const projectServices = await fetchProductionData('/admin/content/project-services', token);
      await clearLocalTable('project_services');
      await insertLocalData('project_services', projectServices);
    } catch (error) {
      console.error('❌ Failed to sync project_services:', error);
    }

    // Blog article services
    try {
      const blogServices = await fetchProductionData('/admin/content/blog-services', token);
      await clearLocalTable('blog_article_services');
      await insertLocalData('blog_article_services', blogServices);
    } catch (error) {
      console.error('❌ Failed to sync blog_article_services:', error);
    }

    // Blog article projects
    try {
      const blogProjects = await fetchProductionData('/admin/content/blog-projects', token);
      await clearLocalTable('blog_article_projects');
      await insertLocalData('blog_article_projects', blogProjects);
    } catch (error) {
      console.error('❌ Failed to sync blog_article_projects:', error);
    }

    // Team member services
    try {
      const teamServices = await fetchProductionData('/admin/content/team-services', token);
      await clearLocalTable('team_member_services');
      await insertLocalData('team_member_services', teamServices);
    } catch (error) {
      console.error('❌ Failed to sync team_member_services:', error);
    }

    console.log('\n🎉 Database sync completed successfully!');
    console.log('📊 All production data has been synced to your local database.');

  } catch (error) {
    console.error('❌ Database sync failed:', error);
    process.exit(1);
  }
}

// Run the sync
syncDatabase();