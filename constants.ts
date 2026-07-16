
import { University, Program } from './types';

export const UNIVERSITIES: University[] = [
  {
    id: 'u1',
    name: 'Addis Ababa University',
    slug: 'aau',
    location: { city: 'Addis Ababa', region: 'Addis Ababa' },
    established: 1950,
    type: 'Public',
    description: 'Addis Ababa University is Ethiopia’s oldest and most prestigious public university located in the capital where the weather is generally mild, sunny, and comfortable ☀️🌤️, admitting undergraduates through the national placement system and handling registration with a modern student portal while teaching blends lectures, labs, fieldwork, research projects and community engagement to build both academic knowledge and practical skills; AAU offers a very wide range of undergraduate programs through its major colleges — including Natural & Computational Sciences, Business & Economics, Social Sciences & Humanities, Law & Governance, Engineering & Technology, Education & Behavioral Sciences, Health Sciences (Medicine, Nursing, Pharmacy & Public Health), Humanities & Language Studies and more — with strong academic support services like libraries and research centers, and overall academic rigor is high with a ★★★★★ rating for quality and competitiveness, making it especially known across Ethiopia for producing top graduates in Medicine & Health Sciences, Engineering & Technology, and Law due to its long history of excellence and influential alumni 👩‍⚕️📐⚖️.',
    website: 'http://www.aau.edu.et',
    contactEmail: 'info@aau.edu.et',
    phone: '+251 11 123 2435',
    coordinates: { lat: 9.0478, lng: 38.7618 },
    faculties: ['Natural Sciences', 'Medicine', 'Engineering', 'Social Sciences'],
    campuses: ['Main Campus (6 Kilo)', 'Science Campus (4 Kilo)', 'Technology Campus (5 Kilo)', 'Black Lion Health Campus', 'Business & Economics (9 Kilo)', 'FBE Campus', 'EiABC Campus'],
    colleges: [
      {
        name: 'Addis Ababa Institute of Technology (AAiT)',
        departments: [
          { name: 'Software Engineering', duration: '5 Years', description: 'Comprehensive training in software lifecycle, AI, and systems design.' },
          { name: 'Electrical & Computer Engineering', duration: '5 Years', description: 'Specializations in Power, Control, and Communication systems.' },
          { name: 'Civil Engineering', duration: '5 Years', description: 'Structural, transport, and geotechnical engineering focus.' },
          { name: 'Mechanical Engineering', duration: '5 Years' },
          { name: 'Chemical Engineering', duration: '5 Years' }
        ]
      },
      {
        name: 'College of Health Sciences',
        departments: [
          { name: 'Doctor of Medicine (MD)', duration: '6.5 Years', description: 'Intensive clinical and practical medical training at Black Lion Hospital.' },
          { name: 'School of Pharmacy', duration: '5 Years' },
          { name: 'School of Nursing', duration: '4 Years' },
          { name: 'Medical Laboratory Sciences', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Natural & Computational Sciences',
        departments: [
          { name: 'Computer Science', duration: '4 Years', description: 'Foundational computing, data structures, and algorithmic theory.' },
          { name: 'Mathematics', duration: '4 Years' },
          { name: 'Physics', duration: '4 Years' },
          { name: 'Biology', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Kennedy Library', 'Ethnological Museum', 'ICT Innovation Hub', 'Olympic Swimming Pool', 'Main Stadium'],
    image: '/assets/aau6.png'
  },
  {
    id: 'u17',
    name: 'Addis Ababa Science & Technology University',
    slug: 'aastu',
    location: { city: 'Addis Ababa', region: 'Addis Ababa' },
    established: 2011,
    type: 'Public',
    description: 'Addis Ababa Science and Technology University is a modern public science‑and‑technology focused university in Addis Ababa where the weather is typically mild and sunny ☀️🌤️ and undergraduate students are admitted through the national placement system with registration done via the university’s digital portal; the teaching approach emphasizes practical, hands‑on learning combining lectures, laboratories, industry‑linked projects and innovation labs to build highly applied technical skills 📚🔧💡, offering programs in core areas such as Engineering (Civil, Mechanical, Electrical & Computer), Natural & Applied Sciences, Applied Informatics & Software Engineering and Industrial Technology so students graduate ready for real‑world challenges. The academic environment is competitive with a ★★★★☆ rating for quality and relevance, and the university is especially known in Ethiopia for excellence in Software Engineering, Electrical Engineering, and Mechanical Engineering as the standout undergraduate strengths.',
    website: 'http://www.aastu.edu.et',
    contactEmail: 'info@aastu.edu.et',
    phone: '+251 11 869 6052',
    coordinates: { lat: 8.8900, lng: 38.8000 },
    faculties: ['Engineering', 'Computing', 'Applied Sciences'],
    campuses: ['Kilinto Main Campus'],
    colleges: [
      {
        name: 'College of Electrical & Mechanical Engineering',
        departments: [
          { name: 'Software Engineering', duration: '5 Years', description: 'Advanced studies in system architecture, AI, and enterprise software.' },
          { name: 'Electrical & Computer Engineering', duration: '5 Years' },
          { name: 'Mechanical Engineering', duration: '5 Years' },
          { name: 'Electromechanical Engineering', duration: '5 Years' }
        ]
      },
      {
        name: 'College of Biological & Chemical Engineering',
        departments: [
          { name: 'Chemical Engineering', duration: '5 Years' },
          { name: 'Biotechnology', duration: '4 Years' },
          { name: 'Environmental Engineering', duration: '5 Years' }
        ]
      },
      {
        name: 'College of Applied Sciences',
        departments: [
          { name: 'Industrial Chemistry', duration: '4 Years' },
          { name: 'Geology', duration: '4 Years' },
          { name: 'Food Science & Applied Nutrition', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Center of Excellence in ICT', 'Material Science Lab', 'Business Incubation Center', 'Standard Sports Fields', 'Modern Research Center'],
    image: '/assets/aastu.jpg'
  },
  {
    id: 'u2',
    name: 'Adama Science & Technology University',
    slug: 'astu',
    location: { city: 'Adama', region: 'Oromia' },
    established: 1993,
    type: 'Public',
    description: 'Adama Science and Technology University is a well‑established public technical university in Adama (Nazret) where the climate is typically warm and sunny ☀️🌡️, and undergraduates are admitted through Ethiopia’s national placement system with registration managed by the university registrar and online student services; its teaching philosophy strongly emphasizes practice‑oriented and industry‑linked learning, combining classroom lectures, laboratories, fieldwork, workshops and real‑world projects to equip students with hands‑on skills in science and technology 📚🔧💡. ASTU offers undergraduate programs in key areas such as Civil, Electrical & Computer, Mechanical and Industrial Engineering, Natural & Applied Sciences, Business & Economics, Humanities & Social Sciences, and Applied Technologies, supported by research initiatives, innovation labs and partnerships that connect students to employers and development sectors. The academic environment is competitive with a ★★★★☆ rating for quality and graduate readiness, and the university is especially recognized in Ethiopia for producing strong graduates in Civil Engineering, Electrical & Computer Engineering, and Mechanical Engineering, making it a go‑to choice for technology‑focused students.',
    website: 'http://www.astu.edu.et',
    contactEmail: 'info@astu.edu.et',
    phone: '+251 22 110 0001',
    coordinates: { lat: 8.5667, lng: 39.2667 },
    faculties: ['Engineering', 'Applied Science', 'Computing'],
    campuses: ['Main Adama Campus'],
    colleges: [
      {
        name: 'School of Electrical Engineering & Computing',
        departments: [
          { name: 'Computer Science & Engineering', duration: '5 Years' },
          { name: 'Electronics & Communication', duration: '5 Years' },
          { name: 'Power Engineering', duration: '5 Years' }
        ]
      },
      {
        name: 'School of Civil Engineering & Architecture',
        departments: [
          { name: 'Architecture', duration: '5 Years', description: 'Focus on urban planning and sustainable design.' },
          { name: 'Civil Engineering', duration: '5 Years' }
        ]
      },
      {
        name: 'School of Applied Natural Sciences',
        departments: [
          { name: 'Applied Chemistry', duration: '4 Years' },
          { name: 'Applied Physics', duration: '4 Years' },
          { name: 'Applied Biology', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Robotics Center', 'Advanced Nanotechnology Lab', 'Digital Resource Center', 'Research Farm'],
    image: '/assets/Astu.png'
  },
  {
    id: 'u3',
    name: 'Jimma University',
    slug: 'ju',
    location: { city: 'Jimma', region: 'Oromia' },
    established: 1952,
    type: 'Public',
    description: 'Jimma University is a respected public university in Jimma where the climate is generally warm and mild with seasonal rains ☀️🌦️, admitting undergraduates through the national placement system and managing registration with an organized student portal while teaching blends lectures, labs, community fieldwork, research projects and service‑learning to connect academic knowledge with real‑world impact; it offers a wide range of undergraduate programs across key colleges such as Health Sciences (Medicine, Nursing, Public Health), Agriculture & Veterinary Medicine, Engineering & Technology, Natural & Computational Sciences, Business & Economics, Social Sciences & Humanities, and Education & Behavioral Sciences, supported by strong research centers and community engagement initiatives that enrich learning 📚🔬🌍. Jimma University’s academic environment is competitive with a ★★★★☆ rating for quality and relevance, and it is especially known across Ethiopia for excellence in Medicine & Health Sciences, Public Health & Community Medicine, and Agriculture & Veterinary Sciences.',
    website: 'http://www.ju.edu.et',
    contactEmail: 'info@ju.edu.et',
    phone: '+251 47 111 2233',
    coordinates: { lat: 7.675, lng: 36.835 },
    faculties: ['Health Sciences', 'Technology', 'Agriculture', 'Business'],
    campuses: ['Main Campus', 'Agriculture Campus (JUCAVM)', 'Technology Campus (JiT)', 'Business Campus'],
    colleges: [
      {
        name: 'Jimma Institute of Technology (JiT)',
        departments: [
          { name: 'Biomedical Engineering', duration: '5 Years', description: 'Healthcare tech innovation.' },
          { name: 'Water Resources Engineering', duration: '5 Years' },
          { name: 'Information Technology', duration: '4 Years' }
        ]
      },
      {
        name: 'Institute of Health',
        departments: [
          { name: 'Medicine', duration: '6.5 Years' },
          { name: 'Public Health', duration: '4 Years' },
          { name: 'Dentistry', duration: '5 Years' }
        ]
      }
    ],
    facilities: ['Jimma Specialized Hospital', 'Coffee Research Center', 'Community Radio Station'],
    image: '/assets/jimma4.png'
  },
  {
    id: 'u4',
    name: 'Bahir Dar University',
    slug: 'bdu',
    location: { city: 'Bahir Dar', region: 'Amhara' },
    established: 1953,
    type: 'Public',
    description: 'Bahir Dar University is a major public university in Bahir Dar, a lakeside city with generally mild to warm weather and refreshing breezes ☀️🌤️, where undergraduate students are placed through Ethiopia’s national placement exam and register via streamlined online systems while learning through a balanced mix of lectures, labs, fieldwork, research projects, community engagement and industry‑linked practical training that prepares them for real‑world careers 📚🔬💼; the university offers a broad range of undergraduate programs in areas such as Science, Engineering & Technology (including Civil, Electrical, Mechanical and Water Resources), Medicine & Health Sciences, Agriculture & Environmental Sciences, Business & Economics, Humanities & Social Sciences, Law, Education & Behavioral Sciences, Textile & Fashion Technology and various institutes, supported by modern libraries, student support services and innovation centers that enrich academic life. Bahir Dar University’s academic rigor is strong with a ★★★★☆ rating for quality and competitiveness, and it is especially recognized in Ethiopia for excellence in Engineering & Water Technology, Medicine & Health Sciences, and Business & Economics.',
    website: 'http://www.bdu.edu.et',
    contactEmail: 'info@bdu.edu.et',
    phone: '+251 58 220 5927',
    coordinates: { lat: 11.5936, lng: 37.3908 },
    faculties: ['Maritime', 'Engineering', 'Textile', 'Medicine'],
    campuses: ['Poly Campus', 'Peda Campus', 'Lake Shore Campus', 'Wisdom Campus', 'Yibab Campus'],
    colleges: [
      {
        name: 'Bahir Dar Institute of Technology (BiT)',
        departments: [
          { name: 'Textile Engineering', duration: '5 Years', description: 'Leader in garment and fiber technology.' },
          { name: 'Chemical Engineering', duration: '5 Years' },
          { name: 'Sustainable Energy', duration: '5 Years' }
        ]
      },
      {
        name: 'Maritime Academy',
        departments: [
          { name: 'Marine Engineering', duration: '4 Years', description: 'International standard maritime officer training.' },
          { name: 'Nautical Science', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Maritime Simulator', 'Lake Tana Research Center', 'Modern Sports Complex'],
    image: '/assets/bahirdar1.png'
  },
  {
    id: 'u5',
    name: 'Hawassa University',
    slug: 'hu',
    location: { city: 'Hawassa', region: 'Sidama' },
    established: 1976,
    type: 'Public',
    description: 'Hawassa University is a well‑established public university in Hawassa, a city with a pleasant mild‑tropical climate and beautiful lake views that offer students a comfortable study environment ☀️🌦️, where undergraduates are admitted through the national placement system and register using the university’s modern student portal, then learn through a mix of lectures, labs, research projects, community‑based fieldwork and industry partnerships that prepare them with both academic knowledge and practical skills 📚🔬🌍; it offers a broad selection of undergraduate programs including medicine and health sciences, engineering and technology, natural and computational sciences, agriculture and environmental sciences, business and economics, law and governance, social sciences and humanities, and education, all supported by active research centers, AGORA digital library resources and opportunities for internships and innovation. Hawassa University’s academic quality and competitiveness earn a ★★★★☆ rating, and it is especially known across Ethiopia for excellence in Medicine & Health Sciences, Engineering & Technology, and Agriculture & Environmental Studies.',
    website: 'http://www.hu.edu.et',
    contactEmail: 'info@hu.edu.et',
    phone: '+251 46 220 5311',
    coordinates: { lat: 7.0494, lng: 38.4849 },
    faculties: ['Agriculture', 'Forestry', 'Medicine', 'Law'],
    campuses: ['Main Campus', 'Awada Campus', 'Wondo Genet Campus', 'Medicine Campus'],
    colleges: [
      {
        name: 'Wondo Genet College of Forestry',
        departments: [
          { name: 'Forestry', duration: '4 Years', description: 'Excellence in environmental and ecosystem management.' },
          { name: 'Wildlife Management', duration: '4 Years' },
          { name: 'Natural Resources', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Medicine & Health Sciences',
        departments: [
          { name: 'Medicine', duration: '6.5 Years' },
          { name: 'Nursing', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Referral Hospital', 'Botanical Garden (Wondo Genet)', 'Lakeside Recreation Area'],
    image: '/assets/hawasau.png'
  },
  {
    id: 'u6',
    name: 'Gondar University',
    slug: 'uog',
    location: { city: 'Gondar', region: 'Amhara' },
    established: 1954,
    type: 'Public',
    description: 'University of Gondar, founded in 1954 as Ethiopia’s oldest medical training institution and now a large comprehensive public university in the historic city of Gondar (which has a mild, warm temperate climate averaging ~20 °C year‑round ☀️🌤️), offers a rich undergraduate experience through diverse units including College of Medicine & Health Sciences, Natural & Computational Sciences, Business & Economics, Social Sciences & Humanities, Agriculture & Environmental Sciences, Veterinary Medicine & Animal Sciences, College of Education, College of Informatics, Institute of Technology, Institute of Biotechnology and the School of Law, all admitting students via the national placement system with teaching that blends lectures, labs, fieldwork, clinics and research projects to build practical skills, supported by a modern automated Student Information System for registration and academic tracking; students enjoy active community engagement, research opportunities and industry links, and overall academic rigor is strong with a ★★★★☆ rating for competitiveness and quality, especially standing out nationally in Medicine & Health Sciences, Engineering & Technology, and Law due to sustained excellence and graduate impact 👩‍⚕️⚖️🛠️.',
    website: 'http://www.uog.edu.et',
    contactEmail: 'info@uog.edu.et',
    phone: '+251 58 111 0123',
    coordinates: { lat: 12.6078, lng: 37.4571 },
    faculties: ['Medicine', 'Public Health', 'Veterinary', 'Informatics'],
    campuses: ['Maraki Campus', 'Tewodros Campus', 'Atse Fasil Campus', 'Meda Campus'],
    colleges: [
      {
        name: 'College of Medicine & Health Sciences',
        departments: [
          { name: 'Public Health Officer', duration: '4 Years', description: 'Core medical and health management.' },
          { name: 'Medicine', duration: '6.5 Years' },
          { name: 'Physiotherapy', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Informatics',
        departments: [
          { name: 'Information Systems', duration: '4 Years' },
          { name: 'Computer Science', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Gondar Referral Hospital', 'Specialized Eye Clinic', 'Community Service Center'],
    image: '/assets/gonder.png'
  },
  {
    id: 'u7',
    name: 'Mekelle University',
    slug: 'mu',
    location: { city: 'Mekelle', region: 'Tigray' },
    established: 1993,
    type: 'Public',
    description: 'Mekelle University sits proudly in Mekelle in northern Ethiopia, serving over 30,000 undergraduates in a vibrant teaching and research environment where students enter through the national placement system and register online via the university portal with a mix of regular, evening, extension, and distance study options; the university offers about 122 undergraduate programs across 7 colleges (including Business & Economics, Dryland Agriculture & Natural Resources, Health Sciences, Natural & Computational Sciences, Law & Governance, Social Sciences & Languages, and Veterinary Medicine) plus multiple institutes like the Ethiopian Institute of Technology and Pedagogical Sciences, using a blend of lectures, labs, community fieldwork, research projects and industry collaborations to build real‑world skills 🧪📚, and while Mekelle’s weather is generally semi‑arid with warm sunny days ideal for study ☀️, its academic rigor is strong with a ★★★★☆ rating for competitiveness and quality, and it’s especially well‑known in Ethiopia for Health Sciences (Medicine, Nursing & Pharmacy), Dryland Agriculture & Natural Resources, and Technology & Engineering disciplines.',
    website: 'http://www.mu.edu.et',
    contactEmail: 'info@mu.edu.et',
    phone: '+251 34 440 7608',
    coordinates: { lat: 13.4967, lng: 39.4682 },
    faculties: ['Dryland Agriculture', 'Law', 'Engineering', 'Business'],
    campuses: ['Arid Campus', 'Adi Haki Campus', 'Ayder Health Campus', 'Quiha Campus', 'Ainlem Campus'],
    colleges: [
      {
        name: 'College of Law & Governance',
        departments: [
          { name: 'Law', duration: '5 Years', description: 'Top-tier judicial and constitutional training.' }
        ]
      },
      {
        name: 'Ethiopian Institute of Technology - Mekelle (EiT-M)',
        departments: [
          { name: 'Industrial Engineering', duration: '5 Years' },
          { name: 'Electrical Engineering', duration: '5 Years' }
        ]
      }
    ],
    facilities: ['Ayder Referral Hospital', 'MIT Campus Research Center', 'Dryland Research Site'],
    image: '/assets/mekelle.jpg'
  },
  {
    id: 'u8',
    name: 'Arba Minch University',
    slug: 'amu',
    location: { city: 'Arba Minch', region: 'SNNP' },
    established: 1986,
    type: 'Public',
    description: 'Arba Minch University is a large and diverse national public university in Arba Minch, Southern Ethiopia, known for its strong mix of science, technology, agriculture and social sciences education and a vibrant campus life supported by multiple campuses and community engagement; undergraduate students are admitted through the national placement system and can study in regular, evening, summer, extension, and distance programs where teaching blends classroom lectures, hands‑on labs, fieldwork, research projects and partnership‑linked practical training to enhance real‑world skills 🧪📚 (including innovative initiatives like the “Student Science” research‑led learning approach). AMU offers key undergraduate disciplines through units like the Institute of Technology (Civil, Electrical & Computer, Mechanical, Architecture & Urban Planning, IT/Software), Water Technology Institute (Hydraulic, Water Resources & Environmental Engineering), College of Natural Sciences (Biology, Chemistry, Physics, Environmental Science), College of Medicine & Health Sciences (Medicine, Nursing, Public Health), College of Business & Economics, College of Social Sciences & Humanities, and a strong College of Agricultural Sciences with programs from Animal & Plant Sciences to Agribusiness and Fisheries, reflecting the region’s semi‑arid, warm climate ideal for agricultural innovation ☀️🌿; the university’s academic quality and competitiveness earn it about a ★★★★☆ rating nationally, with particularly notable strengths in Engineering & Technology, Water Resources & Environmental Studies, and Agricultural & Natural Sciences.',
    website: 'http://www.amu.edu.et',
    contactEmail: 'info@amu.edu.et',
    phone: '+251 46 881 4986',
    coordinates: { lat: 6.0333, lng: 37.5500 },
    faculties: ['Water Technology', 'Natural Science', 'Engineering', 'Agriculture'],
    campuses: ['Main Campus', 'Abaya Campus', 'Chamo Campus', 'Kulfo Campus'],
    colleges: [
      {
        name: 'Institute of Water Technology',
        departments: [
          { name: 'Hydraulic Engineering', duration: '5 Years', description: 'Expertise in dams and water channels.' },
          { name: 'Water Resources Management', duration: '5 Years' },
          { name: 'Irrigation Engineering', duration: '5 Years' }
        ]
      }
    ],
    facilities: ['Hydraulic Research Lab', 'Student Guest House', 'University Museum'],
    image: '/assets/arbaminch.png'
  },
  {
    id: 'u9',
    name: 'Haramaya University',
    slug: 'hru',
    location: { city: 'Haramaya', region: 'Oromia' },
    established: 1954,
    type: 'Public',
    description: 'Haramaya University is a historic and expansive public university in the Oromia Region of Ethiopia, founded in 1954 and located about 510 km east of Addis Ababa between Harar and Dire Dawa, where undergraduates are mainly admitted through the national placement system and can also join continuing, part‑time, summer and distance programs; the teaching mixes lectures, labs, fieldwork, research and community engagement with modern online systems for registration and student services, supported by multiple campuses including a dedicated Health Sciences campus linked to Hiwot Fana Teaching Hospital, and students benefit from a temperate highland climate with warm days and cool nights that’s generally comfortable ☀️🌦️. The university offers a broad range of undergraduate study across colleges such as Agriculture & Environmental Sciences, Business & Economics, Computing & Informatics, Education & Behavioural Sciences, Health & Medical Sciences, Law, Natural & Computational Sciences and Veterinary Medicine, building practical, research‑based learning on a large 350‑hectare campus and engaging widely in outreach and innovation; overall academic quality and competitiveness earn a ★★★★☆ rating, and Haramaya is especially known nationally for strong programs in Agriculture & Environmental Sciences, Health & Medical Sciences, and Natural & Computational Sciences that help drive Ethiopia’s development 🧪🌱🏥',
    website: 'http://www.haramaya.edu.et',
    contactEmail: 'info@haramaya.edu.et',
    phone: '+251 25 553 0324',
    coordinates: { lat: 9.4000, lng: 42.0167 },
    faculties: ['Agriculture', 'Veterinary', 'Health', 'Education'],
    campuses: ['Main Haramaya Campus', 'Harar Health Campus'],
    colleges: [
      {
        name: 'College of Agriculture & Environmental Sciences',
        departments: [
          { name: 'Animal Science', duration: '4 Years' },
          { name: 'Plant Science', duration: '4 Years' },
          { name: 'Agribusiness Management', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Veterinary Medicine',
        departments: [
          { name: 'Doctor of Veterinary Medicine (DVM)', duration: '6 Years' }
        ]
      }
    ],
    facilities: ['Research Farm', 'Harar Hiwot Fana Hospital', 'Central Library'],
    image: '/assets/haremeya1.png'
  },
  {
    id: 'u12',
    name: 'Dire Dawa University',
    slug: 'ddu',
    location: { city: 'Dire Dawa', region: 'Dire Dawa' },
    established: 2007,
    type: 'Public',
    description: 'Dire Dawa University is a vibrant public university in the industrial and commercial city of Dire Dawa (about 515 km east of Addis Ababa) established in 2007 and known for its strong blend of academic learning and community‑linked research that prepares undergraduates for real‑world challenges; students are admitted mainly through Ethiopia’s national placement exam system with registration done via the university registrar, and teaching combines structured lectures, seminars, labs, fieldwork, practical projects and industry/partner collaborations that enrich learning 📚🔬🌍. The university offers a wide range of undergraduate programs across its College of Medicine & Health Sciences (Medicine, Nursing, Midwifery, Anesthesia, Psychiatry Nursing, Medical Laboratory) and Natural & Computational Sciences (Physics, Biology, Chemistry, Mathematics, Statistics, Geology), College of Business & Economics (Accounting, Banking & Finance, Economics, Management, Marketing, Public Administration, Logistics & Real Property), College of Social Sciences & Humanities (Languages, Geography, Psychology, History, Political Science & IR, Sociology & Journalism), College of Law, plus an Institute of Technology covering Engineering and IT disciplines (Software, Computer & Information Technology, Electrical & Computer, Mechanical, Civil & Industrial Engineering, Architecture, Textile & Fashion Design, Food & Chemical Engineering) — all designed to build both theoretical and practical skills 🌟🌐; the city’s climate is semi‑arid with warm sunny days and cooler nights ☀️🌙, academic rigor is high with a ★★★★☆ rating reflecting solid competitiveness, and the university is especially recognized in Ethiopia for Health Sciences (Medicine & Nursing), Engineering & Technology, and Business & Economics excellence.',
    website: 'http://www.ddu.edu.et',
    contactEmail: 'info@ddu.edu.et',
    phone: '+251 25 112 0123',
    coordinates: { lat: 9.6000, lng: 41.8667 },
    faculties: ['Business', 'Engineering', 'Social Science', 'Law'],
    campuses: ['Main Campus'],
    colleges: [
      {
        name: 'College of Business & Economics',
        departments: [
          { name: 'Accounting & Finance', duration: '4 Years' },
          { name: 'Management', duration: '4 Years' },
          { name: 'Marketing', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Engineering',
        departments: [
          { name: 'Computer Science', duration: '4 Years' },
          { name: 'Civil Engineering', duration: '5 Years' }
        ]
      }
    ],
    facilities: ['Eastern ICT Hub', 'Modern Student Plaza', 'Language Lab'],
    image: '/assets/diredewa.png'
  },
  {
    id: 'u13',
    name: 'Arsi University',
    slug: 'arsi',
    location: { city: 'Asella', region: 'Oromia' },
    established: 2014,
    type: 'Public',
    description: 'Arsi University is a dynamic applied‑science public university in Asella, Oromia Region established in 2014 that admits undergraduates primarily through Ethiopia’s national placement system and blends traditional lectures 🧑‍🏫 with hands‑on labs, community engagement, research & practical projects to ensure real‑world readiness, supported by modern e‑learning and library services 📚; located in a pleasant highland climate with warm days and cool nights ☀️🌥️, it comprises five colleges — including Agriculture & Environmental Sciences, Health Sciences (Medicine, Nursing, Pharmacy, Public Health), Business & Economics, Social Sciences & Humanities, and Education & Behavioral Sciences — plus a School of Law and various institutes that together deliver over 48 undergraduate programs meeting national needs and global relevance through problem‑solving research and industry collaboration . Its academic rigor is generally strong with a ★★★★☆ competitiveness rating, and it’s particularly known in Ethiopia for excellence in Agriculture & Environmental Sciences, Health Sciences, and Business & Economics.',
    website: 'http://www.arsiun.edu.et',
    contactEmail: 'info@arsiun.edu.et',
    phone: '+251 22 331 1122',
    coordinates: { lat: 7.9500, lng: 39.1200 },
    faculties: ['Health Sciences', 'Agriculture', 'Business', 'Law', 'Engineering'],
    campuses: ['Main Campus', 'Health Science Campus', 'Agriculture Campus'],
    colleges: [
      {
        name: 'College of Health Sciences',
        departments: [
          { name: 'Doctor of Medicine', duration: '6.5 Years', description: 'Premier medical training at Asella Referral Hospital.' },
          { name: 'Nursing', duration: '4 Years' },
          { name: 'Public Health', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Agriculture & Environmental Science',
        departments: [
          { name: 'Animal Science', duration: '4 Years' },
          { name: 'Plant Science', duration: '4 Years' },
          { name: 'Agribusiness', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Business & Economics',
        departments: [
          { name: 'Accounting & Finance', duration: '4 Years' },
          { name: 'Management', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Asella Teaching and Referral Hospital', 'Agricultural Research Center', 'Modern Digital Library', 'Student Innovation Lab'],
    image: '/assets/arsi.jpg'
  },
  {
    id: 'u14',
    name: 'Jijiga University',
    slug: 'jju',
    location: { city: 'Jijiga', region: 'Somali' },
    established: 2007,
    type: 'Public',
    description: 'Jijiga University is a growing public university in Jijiga, Somali Region (a city with a hot semi‑arid climate and mostly sunny weather with average temperatures around 21 °C ☀️🌵), established in 2007 and admitting undergraduates through Ethiopia’s national placement system with registration handled by the university registrar and modern student portal systems; it offers undergraduate programs across major applied and academic areas including Institute of Technology, Medicine & Health Science, Dryland Agriculture, Natural & Computational Sciences, Business & Economics, Social Sciences & Humanities, Veterinary Medicine, Education & Behavioural Studies, School of Law, and School of Psychology along with the Somali Language & Literature Institute, delivering practical‑oriented teaching via lectures, labs, fieldwork, community‑linked projects and a peaceful, green campus that enriches learning 📚🔬, and while academic rigor is solid with a ★★★★☆ rating for quality and competitiveness, the university is particularly recognized nationwide for Health Sciences (Medicine & Nursing), Engineering & Technology, and Business & Economics as standout undergraduate strengths.',
    website: 'http://www.jju.edu.et',
    contactEmail: 'info@jju.edu.et',
    phone: '+251 25 775 5971',
    coordinates: { lat: 9.3500, lng: 42.8000 },
    faculties: ['Dryland Agriculture', 'Medicine', 'Law', 'Business'],
    campuses: ['Main Campus'],
    colleges: [
      {
        name: 'College of Dryland Agriculture',
        departments: [
          { name: 'Range Management', duration: '4 Years' },
          { name: 'Dryland Crop Science', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Medicine',
        departments: [
          { name: 'Medicine', duration: '6.5 Years' },
          { name: 'Public Health', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Pastoralist Research Center', 'Community Radio', 'Modern Cafeteria'],
    image: '/assets/jijga1.png'
  },
  {
    id: 'u15',
    name: 'Unity University',
    slug: 'unity',
    location: { city: 'Addis Ababa', region: 'Addis Ababa' },
    established: 1991,
    type: 'Private',
    description: 'Unity University is Ethiopia’s pioneering private university founded in 1991 and based in Gerji, Addis Ababa (with other campuses in Burayu, Adama and Dessie), where undergraduates can join through direct admission channels with registration handled by the registrar and online student portal, studying in Regular, Extension and Distance modes 🧑‍💻📚 that mix lectures, practical assignments, projects and modern e‑learning systems to fit diverse student needs; Unity’s weather in Addis is typically mild and sunny most of the year ☀️🌤️, its academic environment is moderately competitive with a ★★★☆☆ rating reflecting accessible but business‑oriented teaching, and it offers about 13 undergraduate programs including Accounting & Finance, Economics, Management, Marketing, Business Administration, Computer Science, Architecture & Urban Planning, Civil Engineering and Nursing that combine theory with practical windows into industry and technology, making it known especially in Ethiopia for Business & Management, Computer Science & IT, and Architecture & Urban Planning as standout areas.',
    website: 'http://www.uu.edu.et',
    contactEmail: 'info@uu.edu.et',
    phone: '+251 11 629 8151',
    coordinates: { lat: 9.0062, lng: 38.7735 },
    faculties: ['Business', 'Engineering', 'Social Science', 'Graduate Studies'],
    campuses: ['Gerji Main Campus', 'Adama Campus', 'Mekelle Campus'],
    colleges: [
      {
        name: 'College of Engineering & Computing',
        departments: [
          { name: 'Information Technology', duration: '4 Years' },
          { name: 'Computer Science', duration: '4 Years' }
        ]
      },
      {
        name: 'College of Business & Economics',
        departments: [
          { name: 'Accounting & Finance', duration: '4 Years' },
          { name: 'Management', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Modern Labs', 'Student Lounge', 'Legal Clinic'],
    image: '/assets/unity1.jpg'
  },
  {
    id: 'u16',
    name: 'Hope University',
    slug: 'hope',
    location: { city: 'Addis Ababa', region: 'Addis Ababa' },
    established: 2003,
    type: 'Private',
    description: 'Hope University College is a private higher‑education institution in Addis Ababa that offers undergraduate degrees in a blend of business, science and technology fields designed for practical and professional careers, where students can enroll through direct admission with academic registration handled by the registrar and enjoy regular and part‑time study modes 📚; located in Ethiopia’s generally mild and sunny capital climate ☀️, teaching mixes classroom lectures, labs and applied projects with an emphasis on leadership, digital skills and real‑world problem‑solving, and academic rigor is moderate with a ★★★☆☆ rating balancing accessibility with quality for students aiming to enter the workforce quickly. Undergraduate programs typically include Business Management & Entrepreneurship (marketing, accountancy, management, business administration), Information & Communications Technology (IT, computer science) and Science & Technology areas such as food science, architecture and other applied sciences, preparing graduates with industry‑relevant skills and modern business perspectives, making the university known locally for Business & Management, Computer Science & IT, and Applied Sciences strengths.',
    website: 'http://www.hope.edu.et',
    contactEmail: 'info@hope.edu.et',
    phone: '+251 11 348 2433',
    coordinates: { lat: 9.0033, lng: 38.7061 },
    faculties: ['Architecture', 'Business', 'Environmental Engineering'],
    campuses: ['Lideta Campus'],
    colleges: [
      {
        name: 'Architecture & Engineering',
        departments: [
          { name: 'Architecture', duration: '5 Years', description: 'Sustainable urban design focus.' },
          { name: 'Environmental Engineering', duration: '5 Years' }
        ]
      },
      {
        name: 'Business & Economics',
        departments: [
          { name: 'Management', duration: '4 Years' },
          { name: 'Accounting', duration: '4 Years' }
        ]
      }
    ],
    facilities: ['Modern Architecture Studios', 'Leadership Center', 'Lush Green Campus'],
    image: '/assets/hope.jpg'
  }
];

export const PROGRAMS: Program[] = [];
