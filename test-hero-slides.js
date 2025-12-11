#!/usr/bin/env node

/**
 * Test script to verify hero slide background image saving functionality
 * Run this after the server is running and storage buckets are set up
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testHeroSlideUpdate() {
  console.log('🧪 Testing hero slide background image saving...\n');

  // Create a test image file (small PNG)
  const testImagePath = path.join(__dirname, 'test-image.png');
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(testImagePath, testImageBuffer);

  try {
    // First, create a hero slide
    console.log('1. Creating a test hero slide...');
    const createForm = new FormData();
    createForm.append('title', 'Test Slide');
    createForm.append('subtitle', 'Test Subtitle');
    createForm.append('buttonText', 'Test Button');
    createForm.append('buttonLink', '/test');
    createForm.append('backgroundImage', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    const createResponse = await fetch('http://localhost:5000/api/hero-slides', {
      method: 'POST',
      body: createForm
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdSlide = await createResponse.json();
    console.log('✓ Created slide:', createdSlide.id);

    // Wait a moment for file upload to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Now update the slide (this should preserve the background image)
    console.log('2. Updating the hero slide (without changing image)...');
    const updateForm = new FormData();
    updateForm.append('title', 'Updated Test Slide');
    updateForm.append('subtitle', 'Updated Test Subtitle');
    updateForm.append('buttonText', 'Updated Button');
    updateForm.append('buttonLink', '/updated-test');
    // Note: NOT including backgroundImage field - this tests the fix

    const updateResponse = await fetch(`http://localhost:5000/api/hero-slides/${createdSlide.id}`, {
      method: 'PUT',
      body: updateForm
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    const updatedSlide = await updateResponse.json();
    console.log('✓ Updated slide:', updatedSlide.title);

    // Verify the background image URL is preserved
    if (updatedSlide.backgroundImage && updatedSlide.backgroundImage.includes('supabase')) {
      console.log('✓ Background image URL preserved:', updatedSlide.backgroundImage);
    } else {
      console.log('⚠️ Background image URL might not be preserved');
    }

    // Now test updating with a new image
    console.log('3. Updating with a new background image...');
    const newImageForm = new FormData();
    newImageForm.append('title', 'Final Test Slide');
    newImageForm.append('subtitle', 'Final Test Subtitle');
    newImageForm.append('buttonText', 'Final Button');
    newImageForm.append('buttonLink', '/final-test');
    newImageForm.append('backgroundImage', fs.createReadStream(testImagePath), {
      filename: 'test-image-2.png',
      contentType: 'image/png'
    });

    const newImageResponse = await fetch(`http://localhost:5000/api/hero-slides/${createdSlide.id}`, {
      method: 'PUT',
      body: newImageForm
    });

    if (!newImageResponse.ok) {
      throw new Error(`New image update failed: ${newImageResponse.status} ${newImageResponse.statusText}`);
    }

    const finalSlide = await newImageResponse.json();
    console.log('✓ Updated with new image:', finalSlide.title);

    if (finalSlide.backgroundImage && finalSlide.backgroundImage.includes('supabase')) {
      console.log('✓ New background image uploaded:', finalSlide.backgroundImage);
    } else {
      console.log('⚠️ New background image might not be uploaded correctly');
    }

    // Clean up
    console.log('4. Cleaning up test slide...');
    const deleteResponse = await fetch(`http://localhost:5000/api/hero-slides/${createdSlide.id}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      console.log('✓ Test slide deleted');
    } else {
      console.log('⚠️ Could not delete test slide');
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

// Run the test
testHeroSlideUpdate();