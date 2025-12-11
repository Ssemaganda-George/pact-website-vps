import { JSDOM } from 'jsdom';

// Simple test to verify hero slider data fetching
async function testHeroSlider() {
  try {
    console.log('Testing hero slider API response...');

    // Test the API endpoint
    const apiResponse = await fetch('http://localhost:5000/api/hero-slides');
    const apiData = await apiResponse.json();

    console.log('API Response:', JSON.stringify(apiData, null, 2));

    if (apiData.success && apiData.data && apiData.data.length > 0) {
      const slide = apiData.data[0];
      console.log('First slide data:');
      console.log('- ID:', slide.id);
      console.log('- Title:', slide.title);
      console.log('- Background Image:', slide.background_image);
      console.log('- Action Text:', slide.action_text);
      console.log('- Action Link:', slide.action_link);

      // Test if the image URL is accessible
      if (slide.background_image) {
        const imageResponse = await fetch(slide.background_image);
        console.log('Image URL accessible:', imageResponse.ok, imageResponse.status);
      }
    } else {
      console.log('No hero slides found in API response');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testHeroSlider();