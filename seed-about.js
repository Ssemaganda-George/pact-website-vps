import { db } from './server/db.js';
import { aboutContent } from './shared/schema.js';

async function seedAboutContent() {
  try {
    console.log('Seeding about content...');

    // Check if about content already exists
    const existing = await db.select().from(aboutContent);
    if (existing.length > 0) {
      console.log('About content already exists, updating...');
      await db.update(aboutContent).set({
        title: 'About PACT Consultancy',
        subtitle: 'Who We Are',
        description: 'PACT Consultancy is a leading development consulting firm specializing in poverty reduction, MSME development, agriculture, peace building, and public health. With over a decade of experience, we partner with governments, NGOs, and international organizations to design and implement sustainable development solutions across Africa and beyond.',
        vision: 'To leverage our global synergy and expertise to provide leading, innovative and distinctive development consulting and technical assistance.',
        mission: 'To empower communities socially and economically through evidence-based development interventions and capacity building.',
        core_values: ['Expertise', 'Integrity', 'Excellence', 'Sustainable Transformation & Empowerment', 'Respect'],
        updated_by: 1
      });
    } else {
      console.log('Creating new about content...');
      await db.insert(aboutContent).values({
        title: 'About PACT Consultancy',
        subtitle: 'Who We Are',
        description: 'PACT Consultancy is a leading development consulting firm specializing in poverty reduction, MSME development, agriculture, peace building, and public health. With over a decade of experience, we partner with governments, NGOs, and international organizations to design and implement sustainable development solutions across Africa and beyond.',
        vision: 'To leverage our global synergy and expertise to provide leading, innovative and distinctive development consulting and technical assistance.',
        mission: 'To empower communities socially and economically through evidence-based development interventions and capacity building.',
        core_values: ['Expertise', 'Integrity', 'Excellence', 'Sustainable Transformation & Empowerment', 'Respect'],
        updated_by: 1
      });
    }

    console.log('About content seeded successfully!');
  } catch (error) {
    console.error('Error seeding about content:', error);
  }
}

seedAboutContent();