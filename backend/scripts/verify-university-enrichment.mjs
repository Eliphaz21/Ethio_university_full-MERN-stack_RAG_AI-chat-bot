import mongoose from 'mongoose';
import { MONGO_URI } from '../dist/config/env.js';
import { University } from '../dist/models/university.js';

async function main() {
  if (!MONGO_URI) throw new Error('MONGO_URI is not configured');
  await mongoose.connect(MONGO_URI);
  const universities = await University.find(
    {},
    {
      name: 1,
      slug: 1,
      academicOverview: 1,
      admissionOverview: 1,
      tuitionOverview: 1,
      admissionRequirements: 1,
      importantLinks: 1,
      image: 1,
      galleryImages: 1,
      videos: 1,
      colleges: 1,
    }
  ).lean();

  for (const university of universities) {
    console.log(JSON.stringify({
      slug: university.slug,
      overview: Boolean(university.academicOverview),
      admission: Boolean(university.admissionOverview),
      tuition: Boolean(university.tuitionOverview),
      requirements: university.admissionRequirements?.length || 0,
      links: university.importantLinks?.length || 0,
      images: (university.image ? 1 : 0) + (university.galleryImages?.length || 0),
      videos: university.videos?.length || 0,
      colleges: university.colleges?.length || 0,
      departments: (university.colleges || []).reduce(
        (total, college) => total + (college.departments?.length || 0),
        0
      ),
    }));
  }
  console.log(`Verified ${universities.length} universities`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
