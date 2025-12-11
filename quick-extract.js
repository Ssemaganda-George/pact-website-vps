// One-click data extraction and download script
// Run this in the browser console on https://pact-website-vps.onrender.com/admin/

(async () => {
  console.log('🚀 Starting automatic data extraction...');

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

  const baseUrl = 'https://pact-website-vps.onrender.com';

  // Get auth token from localStorage/sessionStorage
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (!token) {
    alert('❌ Please login to the admin panel first!');
    console.error('❌ No auth token found. Please login to the admin panel first.');
    return;
  }

  async function fetchData(endpoint) {
    try {
      const response = await fetch(`${baseUrl}/api${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ ${endpoint}: ${response.status}`);
        return [];
      }

      const result = await response.json();
      return result.success ? result.data || [] : [];
    } catch (error) {
      console.warn(`⚠️ ${endpoint}:`, error.message);
      return [];
    }
  }

  console.log('📊 Extracting data from all tables...');

  // Extract all data
  data.contact_messages = await fetchData('/admin/contact');
  data.expertise_content = await fetchData('/admin/content/expertise');
  data.service_content = await fetchData('/admin/content/service');
  data.client_content = await fetchData('/admin/content/client');
  data.project_content = await fetchData('/admin/content/project');
  data.blog_articles = await fetchData('/admin/content/blog');
  data.hero_slides = await fetchData('/admin/content/hero-slides');
  data.about_content = await fetchData('/admin/content/about');
  data.footer_content = await fetchData('/admin/content/footer');
  data.impact_stats = await fetchData('/admin/impact');
  data.team_members = await fetchData('/admin/team');
  data.locations = await fetchData('/admin/locations');
  data.project_services = await fetchData('/admin/content/project-services');
  data.blog_article_services = await fetchData('/admin/content/blog-services');
  data.blog_article_projects = await fetchData('/admin/content/blog-projects');
  data.team_member_services = await fetchData('/admin/content/team-services');

  // Show summary
  console.log('📊 Extraction Summary:');
  Object.entries(data).forEach(([key, value]) => {
    const count = Array.isArray(value) ? value.length : 1;
    console.log(`  ${key}: ${count} records`);
  });

  // Download the file
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'production-data.json';
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ Data extraction complete!');
  console.log('📁 File downloaded: production-data.json');
  console.log('📝 Next step: Run this command in your terminal:');
  console.log('   npx tsx manual-sync.ts import production-data.json');

  alert('✅ Data extracted successfully! Check your Downloads folder for production-data.json, then run: npx tsx manual-sync.ts import production-data.json');

})();