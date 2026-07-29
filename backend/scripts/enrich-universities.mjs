import mongoose from 'mongoose';
import '../dist/config/env.js';
import { MONGO_URI } from '../dist/config/env.js';
import { University } from '../dist/models/university.js';

const publicAdmission = 'Regular undergraduate placement is generally coordinated through Ethiopia’s Ministry of Education using the applicable national higher-education entrance results, student preferences, institutional capacity, and any program-specific screening. Continuing, extension, summer, graduate, international, transfer, and advanced-standing applicants should follow the current registrar announcement because eligibility and document requirements vary by program and intake.';
const publicTuition = 'The official portal does not publish one permanent tuition amount that applies to every student and program. Government-sponsored regular study may follow national cost-sharing rules, while self-sponsored, continuing, extension, summer, distance, graduate, and international fees vary by program, credit load, and academic year. Applicants should obtain the current written fee schedule from the registrar or finance office before payment.';
const privateAdmission = 'Applicants are admitted directly by the institution under the current national higher-education requirements and the specific program’s criteria. Applicants should submit the documents listed in the active admission notice and complete any placement, entrance, equivalency, or graduate-admission assessment required for their chosen program.';
const privateTuition = 'Tuition and service fees vary by program, delivery mode, credit load, campus, and intake. Because the institution may revise rates, applicants should request the current written fee schedule, payment deadlines, installment conditions, refund rules, and any additional registration or technology charges before enrolling.';

const profiles = {
  astu: {
    academicOverview: 'Adama Science and Technology University is a specialized public science and technology institution in Adama. Its academic profile centers on applied natural sciences, engineering, technology, graduate education, research, innovation, and industry engagement. Official program information identifies applied-science programs that are commonly four years, pharmacy at five years, and engineering/architecture programs commonly structured over five years. Major academic areas include applied natural sciences; civil engineering and architecture; electrical engineering and computing; and mechanical, chemical, and materials engineering.',
    links: [
      ['Schools and programs', 'https://www.astu.edu.et/11-admission/24-school-programs'],
      ['Academic schools', 'https://www.astu.edu.et/17-academics/schools'],
    ],
  },
  aastu: {
    academicOverview: 'Addis Ababa Science and Technology University is a specialized public university focused on engineering, technology, applied sciences, postgraduate education, research, and innovation. The official registrar lists undergraduate study in architecture, chemical, civil, electrical and computer, electromechanical, environmental, mechanical, mining, and software engineering, alongside biotechnology, food science and applied nutrition, geology, and industrial chemistry. The engineering curriculum is generally five years for regular entry and six years for extension study.',
    links: [
      ['Official program directory', 'https://www.aastu.edu.et/registrar/programs/'],
      ['Admission information', 'https://www.aastu.edu.et/registrar/admission/'],
    ],
  },
  aau: {
    academicOverview: 'Addis Ababa University is Ethiopia’s long-established flagship public university, offering broad undergraduate, graduate, professional, specialty, and doctoral education. Its academic portfolio spans humanities, social sciences, business and economics, law, natural and computational sciences, technology, architecture and planning, veterinary science, health sciences, medicine, journalism, education, performing arts, and multidisciplinary institutes. Official undergraduate listings provide program-specific descriptions, admission requirements, delivery modes, and durations; many current bachelor programs are four years, while architecture, law, and selected professional programs are five years and medicine is longer.',
    links: [['Undergraduate programs and durations', 'https://admission.aau.edu.et/UndergraduatePrograms']],
  },
  amu: {
    academicOverview: 'Arba Minch University is a comprehensive public university with a strong heritage in water technology and substantial programs in engineering, agriculture, natural sciences, business, health, social sciences, education, and graduate research. Official academic pages list undergraduate and postgraduate study in animal and plant sciences, natural resources, rural development, horticulture, forestry, food science, biology, chemistry, geology, meteorology and hydrology, mathematics, physics, statistics, sport science, and many additional professional areas.',
    links: [
      ['Programs and departments', 'https://amu.edu.et/en/programs'],
      ['Academic programs', 'https://amu.edu.et/en/academic-programs'],
    ],
  },
  arsi: {
    academicOverview: 'Arsi University is a public university based in Asella with academic activity across agriculture and environmental sciences, health sciences, business and economics, education, social sciences and humanities, natural and computational sciences, law, sport science, and related graduate fields. Its official student systems publish curricula at program level, including course sequences, credit hours, and prerequisites. Applicants should use the registrar and active intake notices for the current list of open programs and modalities.',
    links: [['Official website', 'https://www.arsiun.edu.et/']],
  },
  bdu: {
    academicOverview: 'Bahir Dar University is a large comprehensive public university formed from the former Bahir Dar Polytechnic and Bahir Dar Teachers’ College. Official information reports five colleges, five institutes, faculties, schools, and academies across science, agriculture and environmental sciences, medicine and health sciences, business and economics, education, engineering and technology, textile and fashion technology, land administration, disaster risk management, water studies, humanities, social sciences, law, earth science, sport, and maritime study. The university reports more than 100 undergraduate programs and a substantial graduate and doctoral portfolio.',
    links: [
      ['University profile and academic units', 'https://bdu.edu.et/index.php/about'],
      ['Bahir Dar Institute of Technology programs', 'https://www.bdu.edu.et/bit/node/139'],
      ['Business and economics undergraduate programs', 'https://bdu.edu.et/cobe/node/192'],
    ],
    studentPopulation: '25,970+',
  },
  ddu: {
    academicOverview: 'Dire Dawa University is a public applied-science-oriented university. Official information identifies an Institute of Technology and colleges covering natural and computational sciences, business and economics, social sciences and humanities, law, medicine and health sciences, agriculture and veterinary medicine, and education and behavioral sciences. The university reports dozens of undergraduate and graduate programs and more than 21,000 students across regular and non-regular modalities.',
    links: [
      ['University at a glance', 'https://www.ddu.edu.et/ddu-at-a-glance/'],
      ['Admission requirements', 'https://www.ddu.edu.et/admission2/'],
    ],
    studentPopulation: '21,159+',
  },
  hru: {
    academicOverview: 'Haramaya University is a comprehensive public university with a historic strength in agriculture and a wide portfolio in engineering, computing, natural sciences, business, health and medicine, veterinary medicine, law, education, social sciences, humanities, and sport. The official university directory reports more than 100 undergraduate programs and supports regular as well as continuing, distance, and summer modalities in selected fields. Program pages provide college-level admission criteria and detailed undergraduate, graduate, and doctoral listings.',
    links: [
      ['Official academic program directory', 'https://www.haramaya.edu.et/programs/'],
      ['University admission information', 'https://www.haramaya.edu.et/hit/admission/'],
    ],
  },
  hu: {
    academicOverview: 'Hawassa University is a first-generation comprehensive public university whose roots began with agricultural education in 1976. Official information describes colleges and institutes operating across seven campuses, with strengths in agriculture and life sciences, medicine and health sciences, human nutrition, engineering and technology, natural sciences, social sciences, humanities, economics, and teacher education. The university reports more than 100 undergraduate programs and extensive master’s, doctoral, medical specialty, and continuing-education study.',
    links: [
      ['University background', 'https://www.hu.edu.et/background-detail'],
      ['Registrar information', 'https://www.hu.edu.et/registrar'],
    ],
    studentPopulation: '22,430+',
    facultyCount: '2,000+ academic staff',
  },
  hope: {
    academicOverview: 'Hope University is a private higher-education institution in Addis Ababa. Its profile should be reviewed together with the institution’s current official admission notice because available programs, delivery modes, campus arrangements, and fees may change by intake. Prospective students should verify accreditation status for the exact program, the award title, duration, total credit load, internship expectations, and the complete written fee schedule before enrollment.',
    links: [['Official website', 'https://www.hope.edu.et/']],
    private: true,
  },
  jju: {
    academicOverview: 'Jigjiga University is a public university serving Ethiopia’s Somali Region. Its official academic navigation identifies colleges in education and behavioral studies, veterinary medicine, business and economics, social sciences and humanities, and natural and computational sciences, together with schools of law and psychology, graduate studies, and an institute of Somali language and literature studies. The university also supports health, referral-hospital, research, and community-engagement functions.',
    links: [['Undergraduate and academic units', 'https://jju.edu.et/index.php/undergraduate-programs/ThematicArea.php']],
  },
  ju: {
    academicOverview: 'Jimma University is a comprehensive public research university known for community-based education. Official program listings cover health sciences, medicine, dentistry, nursing, pharmacy, public health, agriculture, veterinary medicine, engineering and technology, natural sciences, business and economics, law and governance, education, social sciences, and humanities. The university operates multiple campuses and offers undergraduate, master’s, doctoral, specialty, regular, and continuing programs.',
    links: [
      ['All academic programs', 'https://ju.edu.et/list-all-programmes-jimma-university/'],
      ['Undergraduate admission', 'https://ju.edu.et/undergraduate-programs/'],
    ],
  },
  mu: {
    academicOverview: 'Mekelle University is a comprehensive public university. Its official undergraduate directory reports more than 100 programs across colleges of business and economics, dryland agriculture and natural resources, veterinary medicine, health sciences, natural and computational sciences, law and governance, and social sciences and languages, as well as engineering, technology, pedagogy, and heritage-focused institutes. The university portal supports applications and registration for active graduate and continuing-education intakes.',
    links: [
      ['Undergraduate program directory', 'https://www.mu.edu.et/index.php/undergraduate-programs'],
      ['Application and student portal', 'https://portal.mu.edu.et/'],
    ],
  },
  unity: {
    academicOverview: 'Unity University is a private Ethiopian university whose history began as a language school in 1991 and expanded into diploma, undergraduate, engineering, law, business, technology, and postgraduate education. Official institutional history identifies programs introduced over time in accounting, management, economics, marketing, management information systems, law, architecture and urban planning, civil engineering, mining, construction technology and management, business administration, and development economics. Applicants should confirm which programs and delivery modes are active for the current intake.',
    links: [
      ['Institutional history and contact', 'https://uu.edu.et/FOE/index.php/about-us/'],
      ['Application and registration guidance', 'https://uu.edu.et/FOE/index.php/how-to-apply/'],
    ],
    private: true,
  },
  uog: {
    academicOverview: 'The University of Gondar is a comprehensive public university with roots in health training dating to 1954. Official academic information identifies colleges and schools in medicine and health sciences, natural and computational sciences, law, business and economics, veterinary medicine and animal sciences, social sciences and humanities, education, informatics, agriculture and environmental sciences, technology, and biotechnology. The university reports dozens of undergraduate programs and a very large postgraduate, specialty, and doctoral portfolio.',
    links: [
      ['Undergraduate programs', 'https://uog.edu.et/studying-at-university-of-gondar/advanced-education/undergraduate/'],
      ['Undergraduate admission', 'https://registrar.uog.edu.et/undergraduate-admission/'],
      ['Application portal', 'https://portal.uog.edu.et/'],
    ],
  },
};

const academicCatalog = {
  astu: [
    ['School of Applied Natural Sciences', ['Applied Biology', 'Applied Chemistry', 'Applied Geology', 'Applied Mathematics', 'Applied Physics', 'Pharmacy']],
    ['School of Civil Engineering and Architecture', ['Architecture', 'Civil Engineering', 'Water Resources Engineering']],
    ['School of Electrical Engineering and Computing', ['Computer Science and Engineering', 'Electrical Engineering', 'Electronics and Communication Engineering']],
    ['School of Mechanical, Chemical and Materials Engineering', ['Chemical Engineering', 'Materials Science and Engineering', 'Mechanical Engineering']],
  ],
  aastu: [
    ['College of Architecture and Civil Engineering', ['Architecture', 'Civil Engineering', 'Environmental Engineering']],
    ['College of Electrical Engineering and Computing', ['Electrical and Computer Engineering', 'Software Engineering']],
    ['College of Engineering', ['Chemical Engineering', 'Electromechanical Engineering', 'Mechanical Engineering', 'Mining Engineering']],
    ['College of Applied Sciences', ['Biotechnology', 'Food Science and Applied Nutrition', 'Geology', 'Industrial Chemistry']],
  ],
  aau: [
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Earth Sciences', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management', 'Public Administration and Development Management']],
    ['College of Social Sciences', ['Geography and Environmental Studies', 'Political Science and International Relations', 'Social Anthropology', 'Sociology']],
    ['College of Humanities, Language Studies, Journalism and Communication', ['English Language and Literature', 'Foreign Languages and Literature', 'Journalism and Communication', 'Linguistics and Philology']],
    ['College of Health Sciences', ['Medicine', 'Nursing', 'Pharmacy', 'Public Health']],
    ['Addis Ababa Institute of Technology', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering', 'Software Engineering']],
    ['Ethiopian Institute of Architecture, Building Construction and City Development', ['Architecture', 'Construction Technology and Management', 'Urban and Regional Planning']],
    ['College of Law and Governance Studies', ['Law', 'Political Science and International Relations', 'Public Administration']],
  ],
  amu: [
    ['Arba Minch Institute of Technology', ['Architecture and Urban Planning', 'Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering', 'Water Resources and Irrigation Engineering']],
    ['College of Agricultural Sciences', ['Animal Sciences', 'Horticulture', 'Plant Sciences', 'Rural Development and Agricultural Extension']],
    ['College of Natural Sciences', ['Biology', 'Chemistry', 'Geology', 'Mathematics', 'Meteorology and Hydrology', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Medicine and Health Sciences', ['Medicine', 'Nursing', 'Public Health']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'Sociology']],
  ],
  arsi: [
    ['College of Agriculture and Environmental Sciences', ['Animal Sciences', 'Natural Resources Management', 'Plant Sciences', 'Rural Development and Agricultural Extension']],
    ['College of Health Sciences', ['Medicine', 'Nursing', 'Public Health']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Education and Behavioral Sciences', ['Educational Planning and Management', 'Psychology', 'Special Needs Education']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'Sociology']],
    ['School of Law', ['Law']],
    ['College of Sport Science', ['Sport Science']],
  ],
  bdu: [
    ['College of Science', ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Agriculture and Environmental Sciences', ['Animal Sciences', 'Natural Resources Management', 'Plant Sciences', 'Rural Development']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management', 'Marketing Management']],
    ['College of Education and Behavioral Sciences', ['Curriculum and Instruction', 'Educational Planning and Management', 'Psychology', 'Special Needs Education']],
    ['College of Medicine and Health Sciences', ['Medicine', 'Nursing', 'Pharmacy', 'Public Health']],
    ['Bahir Dar Institute of Technology', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering', 'Software Engineering']],
    ['Ethiopian Institute of Textile and Fashion Technology', ['Fashion Design', 'Garment Engineering', 'Textile Engineering']],
    ['Faculty of Humanities', ['Amharic Language and Literature', 'English Language and Literature', 'History']],
    ['Faculty of Social Sciences', ['Geography and Environmental Studies', 'Political Science and International Studies', 'Sociology']],
  ],
  ddu: [
    ['Institute of Technology', ['Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering', 'Software Engineering']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
    ['College of Medicine and Health Sciences', ['Medicine', 'Nursing', 'Public Health']],
    ['College of Agriculture and Veterinary Medicine', ['Animal Sciences', 'Plant Sciences', 'Veterinary Medicine']],
    ['College of Education and Behavioral Sciences', ['Educational Planning and Management', 'Psychology']],
    ['School of Law', ['Law']],
  ],
  hru: [
    ['College of Agriculture and Environmental Sciences', ['Agricultural Economics', 'Animal Sciences', 'Natural Resources Management', 'Plant Sciences', 'Rural Development and Agricultural Extension']],
    ['College of Veterinary Medicine', ['Veterinary Medicine', 'Veterinary Laboratory Technology']],
    ['College of Health and Medical Sciences', ['Medicine', 'Nursing', 'Pharmacy', 'Public Health']],
    ['College of Computing and Informatics', ['Computer Science', 'Information Science', 'Information Technology', 'Software Engineering']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Education and Behavioral Sciences', ['Educational Planning and Management', 'Psychology', 'Special Needs Education']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
    ['College of Law', ['Law']],
  ],
  hu: [
    ['College of Agriculture', ['Agricultural Economics', 'Animal and Range Sciences', 'Horticulture', 'Plant and Horticultural Sciences', 'Rural Development and Agricultural Extension']],
    ['College of Medicine and Health Sciences', ['Medicine', 'Nursing', 'Pharmacy', 'Public Health']],
    ['Institute of Technology', ['Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering', 'Software Engineering']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
    ['College of Education', ['Educational Planning and Management', 'Psychology', 'Special Needs Education']],
    ['School of Law', ['Law']],
  ],
  hope: [
    ['College of Business and Leadership', ['Accounting and Finance', 'Business Management', 'Leadership and Management']],
    ['College of Liberal Arts', ['English Language and Literature', 'Psychology', 'Social Work']],
    ['College of Science and Technology', ['Computer Science', 'Information Technology']],
  ],
  jju: [
    ['College of Education and Behavioral Studies', ['Educational Planning and Management', 'Psychology', 'Special Needs Education']],
    ['College of Veterinary Medicine', ['Animal Health', 'Veterinary Medicine']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Medicine and Health Sciences', ['Medicine', 'Nursing', 'Public Health']],
    ['School of Law', ['Law']],
    ['Institute of Somali Language and Literature Studies', ['Somali Language and Literature']],
  ],
  ju: [
    ['Institute of Health', ['Dentistry', 'Medicine', 'Nursing', 'Pharmacy', 'Public Health']],
    ['College of Agriculture and Veterinary Medicine', ['Agricultural Economics', 'Animal Sciences', 'Natural Resources Management', 'Plant Sciences', 'Veterinary Medicine']],
    ['Jimma Institute of Technology', ['Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering', 'Software Engineering']],
    ['College of Natural Sciences', ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management']],
    ['College of Education and Behavioral Sciences', ['Educational Planning and Management', 'Psychology', 'Special Needs Education']],
    ['College of Law and Governance', ['Governance and Development Studies', 'Law']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
  ],
  mu: [
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management', 'Marketing Management']],
    ['College of Dryland Agriculture and Natural Resources', ['Animal Sciences', 'Land Resources Management', 'Plant Sciences', 'Rural Development']],
    ['College of Veterinary Sciences', ['Veterinary Medicine', 'Veterinary Public Health']],
    ['College of Health Sciences', ['Medicine', 'Nursing', 'Pharmacy', 'Public Health']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Law and Governance', ['Law', 'Political Science and Strategic Studies', 'Public Administration']],
    ['College of Social Sciences and Languages', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
    ['Ethiopian Institute of Technology-Mekelle', ['Chemical Engineering', 'Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering']],
  ],
  unity: [
    ['Faculty of Business and Economics', ['Accounting and Finance', 'Business Management', 'Economics', 'Marketing Management', 'Management Information Systems']],
    ['Faculty of Engineering and Architecture', ['Architecture and Urban Planning', 'Civil Engineering', 'Construction Technology and Management', 'Mining Engineering']],
    ['Faculty of Law', ['Law']],
    ['Faculty of Technology', ['Computer Science', 'Information Technology']],
    ['School of Graduate Studies', ['Business Administration', 'Development Economics']],
  ],
  uog: [
    ['College of Medicine and Health Sciences', ['Medicine', 'Midwifery', 'Nursing', 'Pharmacy', 'Public Health']],
    ['College of Natural and Computational Sciences', ['Biology', 'Chemistry', 'Computer Science', 'Mathematics', 'Physics', 'Statistics']],
    ['College of Business and Economics', ['Accounting and Finance', 'Economics', 'Management', 'Tourism Management']],
    ['College of Social Sciences and Humanities', ['English Language and Literature', 'Geography and Environmental Studies', 'History', 'Sociology']],
    ['College of Veterinary Medicine and Animal Sciences', ['Animal Sciences', 'Veterinary Medicine']],
    ['College of Agriculture and Environmental Sciences', ['Natural Resources Management', 'Plant Sciences', 'Rural Development']],
    ['Institute of Technology', ['Civil Engineering', 'Electrical and Computer Engineering', 'Mechanical Engineering']],
    ['School of Informatics', ['Computer Science', 'Information Systems', 'Information Technology']],
    ['School of Law', ['Law']],
    ['School of Education', ['Educational Planning and Management', 'Psychology', 'Special Needs Education']],
  ],
};

const departmentProfile = (name) => ({
  name,
  description: `${name} provides teaching, practical learning, and research in its core discipline. Students should consult the official department or registrar page for the current curriculum, entry route, available award levels, and intake-specific requirements.`,
  researchAreas: [`Applied research in ${name}`, 'Community and industry problem-solving', 'Interdisciplinary research and innovation'],
  facilities: ['Teaching and practical learning facilities', 'University library and digital learning resources'],
  learningOutcomes: ['Build strong disciplinary knowledge', 'Apply theory through practical and research work', 'Communicate and solve professional problems responsibly'],
  careerPaths: [`Professional roles related to ${name}`, 'Research and postgraduate study', 'Public, private, nonprofit, or entrepreneurial work'],
  programs: [],
});

const mergeAcademicCatalog = (existingColleges, catalog) => {
  const colleges = [...(existingColleges || [])];
  for (const [collegeName, departmentNames] of catalog || []) {
    let college = colleges.find((item) => item.name.trim().toLowerCase() === collegeName.toLowerCase());
    if (!college) {
      college = {
        name: collegeName,
        description: `${collegeName} groups related academic departments, teaching, research, and student support within the university.`,
        departments: [],
      };
      colleges.push(college);
    }
    college.departments ||= [];
    for (const departmentName of departmentNames) {
      if (!college.departments.some((item) => item.name.trim().toLowerCase() === departmentName.toLowerCase())) {
        college.departments.push(departmentProfile(departmentName));
      }
    }
  }
  return colleges;
};

const publicRequirements = [
  'Meet the current national or university admission threshold for the selected intake',
  'Provide the required secondary-school, entrance-exam, transcript, and identity documents',
  'Complete any program-specific entrance examination, interview, portfolio, medical, or fitness screening',
  'Applicants with foreign credentials must obtain the required Ethiopian equivalency or authentication',
];

const privateRequirements = [
  'Completed application for the selected program and intake',
  'Official academic certificates and transcripts',
  'Identity document and passport photographs',
  'Credential equivalency for foreign qualifications where required',
  'Any program-specific entrance examination, interview, portfolio, or graduate admission test',
];

async function main() {
  if (!MONGO_URI) throw new Error('MONGO_URI is not configured');
  await mongoose.connect(MONGO_URI);

  let updated = 0;
  for (const [slug, profile] of Object.entries(profiles)) {
    const university = await University.findOne({ slug });
    if (!university) throw new Error(`University not found for slug: ${slug}`);

    const isPrivate = profile.private || university.type === 'Private';
    university.academicOverview = profile.academicOverview;
    university.admissionOverview = isPrivate ? privateAdmission : publicAdmission;
    university.tuitionOverview = isPrivate ? privateTuition : publicTuition;
    university.admissionRequirements = isPrivate ? privateRequirements : publicRequirements;
    university.studyModes = isPrivate
      ? ['Regular', 'Evening or weekend where offered', 'Online or distance where officially offered']
      : ['Regular', 'Continuing or extension where offered', 'Summer or distance where offered'];
    university.applicationDeadlines = ['Deadlines vary by intake; verify the current registrar or admission announcement'];
    university.scholarships = ['Scholarships and financial support depend on the active institutional or partner call; verify eligibility before applying'];
    university.colleges = mergeAcademicCatalog(university.colleges, academicCatalog[slug]);
    if (profile.studentPopulation) university.studentPopulation = profile.studentPopulation;
    if (profile.facultyCount) university.facultyCount = profile.facultyCount;

    const existingLinks = university.importantLinks || [];
    for (const [label, url] of profile.links) {
      if (!existingLinks.some((link) => link.url === url)) {
        existingLinks.push({ label, url, description: 'Official university source' });
      }
    }
    university.importantLinks = existingLinks;
    await university.save();
    updated += 1;
    console.log(`Updated ${slug}: ${university.name}`);
  }

  console.log(`Enriched ${updated} universities`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
