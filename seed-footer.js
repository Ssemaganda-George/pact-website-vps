import { storage } from './server/storage.ts';

async function seedFooterContent() {
  try {
    console.log('Checking for existing footer content...');

    const existing = await storage.getFooterContent();
    if (existing) {
      console.log('Footer content already exists, updating...');
      // Update existing content
      await storage.updateFooterContent(existing.id, {
        company_description: 'PACT Consultancy is a leading development consulting firm specializing in poverty reduction, MSME development, agriculture, peace building, and public health. With over a decade of experience, we partner with governments, NGOs, and international organizations to design and implement sustainable development solutions across Africa and beyond.',
        address: 'Multiple Locations: Doha, Qatar; Khartoum, Sudan; Kampala, Uganda; Richmond VA, USA; Juba, South Sudan; Kigali, Rwanda; Canonniers Point, Mauritius',
        phone: '+1 (555) 123-4567',
        email: 'info@pactconsultancy.com',
        social_links: [
          { name: 'LinkedIn', url: 'https://linkedin.com/company/pact-consultancy', icon: 'fab fa-linkedin' },
          { name: 'Twitter', url: 'https://twitter.com/pactconsultancy', icon: 'fab fa-twitter' },
          { name: 'Facebook', url: 'https://facebook.com/pactconsultancy', icon: 'fab fa-facebook' },
          { name: 'Instagram', url: 'https://instagram.com/pactconsultancy', icon: 'fab fa-instagram' }
        ],
        copyright_text: '© 2025 PACT Consultancy. All rights reserved.',
        privacy_link: '#',
        terms_link: '#',
        sitemap_link: '#',
        updated_by: 1
      });
    } else {
      console.log('Creating new footer content...');
      await storage.createFooterContent({
        company_description: 'PACT Consultancy is a leading development consulting firm specializing in poverty reduction, MSME development, agriculture, peace building, and public health. With over a decade of experience, we partner with governments, NGOs, and international organizations to design and implement sustainable development solutions across Africa and beyond.',
        address: 'Multiple Locations: Doha, Qatar; Khartoum, Sudan; Kampala, Uganda; Richmond VA, USA; Juba, South Sudan; Kigali, Rwanda; Canonniers Point, Mauritius',
        phone: '+1 (555) 123-4567',
        email: 'info@pactconsultancy.com',
        social_links: [
          { name: 'LinkedIn', url: 'https://linkedin.com/company/pact-consultancy', icon: 'fab fa-linkedin' },
          { name: 'Twitter', url: 'https://twitter.com/pactconsultancy', icon: 'fab fa-twitter' },
          { name: 'Facebook', url: 'https://facebook.com/pactconsultancy', icon: 'fab fa-facebook' },
          { name: 'Instagram', url: 'https://instagram.com/pactconsultancy', icon: 'fab fa-instagram' }
        ],
        copyright_text: '© 2025 PACT Consultancy. All rights reserved.',
        privacy_link: '#',
        terms_link: '#',
        sitemap_link: '#',
        updated_by: 1
      });
    }

    console.log('Footer content seeded successfully!');
  } catch (error) {
    console.error('Error seeding footer content:', error);
  }
}

seedFooterContent();