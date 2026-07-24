import bcrypt from 'bcryptjs';
import { User } from '../models/user.js';
import { University } from '../models/university.js';
import { ADMIN_EMAILS } from './env.js';

export async function seedDatabaseIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[SEED] Database has no users. Seeding default admin user...');
      const adminEmail = ADMIN_EMAILS[0] || 'admin@ethiouni.edu.et';
      const hashedPassword = await bcrypt.hash('AdminPassword123!', 12);
      await User.create({
        username: 'System Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        institution: 'Ethio University Portal',
        bio: 'Default administrator account.',
      });
      console.log(`[SEED] Default admin user created: ${adminEmail} (Password: AdminPassword123!)`);
    }

    const uniCount = await University.countDocuments();
    if (uniCount === 0) {
      console.log('[SEED] Database has no universities. Seeding sample Ethiopian universities...');
      await University.insertMany([
        {
          name: 'Addis Ababa University',
          slug: 'addis-ababa-university',
          description: 'The oldest and largest higher education institution in Ethiopia, offering comprehensive undergraduate and postgraduate programs.',
          website: 'http://www.aau.edu.et',
          location: { city: 'Addis Ababa', region: 'Addis Ababa', coordinates: { lat: 9.0478, lng: 38.7618 } },
          established: 1950,
          type: 'Public',
          contactEmail: 'info@aau.edu.et',
          phone: '+251-11-123-9705',
          academicOverview: 'AAU hosts leading research institutes in health, technology, business, and humanities.',
        },
        {
          name: 'Jimma University',
          slug: 'jimma-university',
          description: 'Renowned for Community-Based Education (CBE) and state-of-the-art medical and engineering research.',
          website: 'http://www.ju.edu.et',
          location: { city: 'Jimma', region: 'Oromia', coordinates: { lat: 7.6756, lng: 36.835 } },
          established: 1999,
          type: 'Public',
          contactEmail: 'info@ju.edu.et',
          phone: '+251-47-111-0102',
          academicOverview: 'Jimma University is recognized as Ethiopia\'s top community-engaged research university.',
        },
        {
          name: 'Adama Science and Technology University',
          slug: 'adama-science-and-technology-university',
          description: 'Specialized technology university leading innovations in engineering, applied sciences, and industrial technology.',
          website: 'http://www.astu.edu.et',
          location: { city: 'Adama', region: 'Oromia', coordinates: { lat: 8.54, lng: 39.27 } },
          established: 1993,
          type: 'Public',
          contactEmail: 'contact@astu.edu.et',
          phone: '+251-22-111-0400',
          academicOverview: 'ASTU focuses on producing world-class engineers and technological researchers.',
        },
      ]);
      console.log('[SEED] Sample universities seeded successfully.');
    }
  } catch (err: any) {
    console.warn('[WARN] Automatic database seeding failed:', err?.message || err);
  }
}
