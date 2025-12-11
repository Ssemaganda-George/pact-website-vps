// Browser script to extract all production data
// Run this in the browser console on https://pact-website-vps.onrender.com/admin/

async function extractAllProductionData() {
  console.log('🔍 Starting data extraction from production admin panel...');

  const data = {
    contact_messages: [],
    expertise_content: [],
    service_content: [],
    client_content: [],
    project_content: [],
    blog_articles: [],
    hero_slides: [],
    about_content: [],
    footer_content: [],
    impact_stats: [],
    team_members: [],
    locations: [],
    project_services: [],
    blog_article_services: [],
    blog_article_projects: [],
    team_member_services: []
  };

  // Base URL for API calls - updated to correct production URL
  const baseUrl = 'https://pact-website-vps.onrender.com';

  // Function to fetch data from an endpoint
  async function fetchEndpoint(endpoint) {
    try {
      const response = await fetch(`${baseUrl}/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch ${endpoint}: ${response.status}`);
        return [];
      }

      const result = await response.json();
      return result.success ? result.data || [] : [];
    } catch (error) {
      console.warn(`⚠️ Error fetching ${endpoint}:`, error);
      return [];
    }
  }

  // Extract data from each endpoint
  console.log('📊 Extracting contact messages...');
  data.contact_messages = await fetchEndpoint('/admin/contact');

  console.log('📊 Extracting expertise content...');
  data.expertise_content = await fetchEndpoint('/admin/content/expertise');

  console.log('📊 Extracting services...');
  data.service_content = await fetchEndpoint('/admin/content/service');

  console.log('📊 Extracting clients...');
  data.client_content = await fetchEndpoint('/admin/content/client');

  console.log('📊 Extracting projects...');
  data.project_content = await fetchEndpoint('/admin/content/project');

  console.log('📊 Extracting blog articles...');
  data.blog_articles = await fetchEndpoint('/admin/content/blog');

  console.log('📊 Extracting hero slides...');
  data.hero_slides = await fetchEndpoint('/admin/content/hero-slides');

  console.log('📊 Extracting about content...');
  data.about_content = await fetchEndpoint('/admin/content/about');

  console.log('📊 Extracting footer content...');
  data.footer_content = await fetchEndpoint('/admin/content/footer');

  console.log('📊 Extracting impact stats...');
  data.impact_stats = await fetchEndpoint('/admin/impact');

  console.log('📊 Extracting team members...');
  data.team_members = await fetchEndpoint('/admin/team');

  console.log('📊 Extracting locations...');
  data.locations = await fetchEndpoint('/admin/locations');

  console.log('📊 Extracting project services...');
  data.project_services = await fetchEndpoint('/admin/content/project-services');

  console.log('📊 Extracting blog article services...');
  data.blog_article_services = await fetchEndpoint('/admin/content/blog-services');

  console.log('📊 Extracting blog article projects...');
  data.blog_article_projects = await fetchEndpoint('/admin/content/blog-projects');

  console.log('📊 Extracting team member services...');
  data.team_member_services = await fetchEndpoint('/admin/content/team-services');

  // Convert to JSON string
  const jsonData = JSON.stringify(data, null, 2);

  // Create and download file
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'production-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ Data extraction complete! File downloaded as production-data.json');
  console.log('📊 Summary:');
  Object.entries(data).forEach(([key, value]) => {
    console.log(`  ${key}: ${Array.isArray(value) ? value.length : 1} records`);
  });

  return data;
}

// Auto-run the extraction
extractAllProductionData();