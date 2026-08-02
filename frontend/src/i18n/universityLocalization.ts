import { University, College, Department } from '../types';
import { Language } from './translations';

export interface LocalizedUniversityContent {
  name: string;
  description: string;
  academicOverview: string;
  mission: string;
  vision: string;
  admissionOverview: string;
  tuitionOverview: string;
  admissionRequirements: string[];
  scholarships: string[];
  faculties: string[];
  facilities: string[];
  campuses: string[];
}

const UNIVERSITY_DICTIONARIES: Record<string, Partial<Record<Language, Partial<LocalizedUniversityContent>>>> = {
  'addis-ababa-university': {
    am: {
      name: 'አዲስ አበባ ዩኒቨርሲቲ (AAU)',
      description: 'አዲስ አበባ ዩኒቨርሲቲ በ1943 ዓ.ም የተመሠረተ በኢትዮጵያ ቀዳሚውና ትልቁ የከፍተኛ ትምህርት እና የምርምር ተቋም ነው። በ70+ ዓመታት ታሪኩ በርካታ መሪዎችንና ሳይንቲስቶችን አፍርቷል።',
      academicOverview: 'ተቋሙ በ10+ ኮሌጆችና የምርምር ኢንስቲትዩቶች አማካኝነት በመጀመሪያ፣ በሁለተኛና በሦስተኛ ዲግሪ ከ200 በላይ የትምህርት ፕሮግራሞችን ይሰጣል። የጥቁር አንበሳ ስፔሻላይዝድ ሆስፒታልን ጨምሮ በርካታ የህክምናና የቴክኖሎጂ ማዕከላት አሉት።',
      mission: 'በምርምር፣ በትምህርት እና በማህበረሰብ አገልግሎት ሀገራዊ ልማትን የሚያፋጥኑ ብቁና ተወዳዳሪ ዜጎችን ማፈራት።',
      vision: 'በ2025 ዓ.ም በምስራቅ አፍሪካ ቀዳሚው የምርምር ዩኒቨርሲቲ መሆን።',
      admissionOverview: 'በትምህርት ሚኒስቴር (MoGE) የ12ኛ ክፍል ESSLCE ውጤት እና በዩኒቨርሲቲው የመግቢያ ፈተና (UEE) መሠረት ተማሪዎችን ይቀበላል።',
      tuitionOverview: 'ለመንግስት ስፖንሰር ተማሪዎች ከወጪ መጋራት ፕሮግራም ጋር በነፃ የሚሰጥ ሲሆን፤ ለማታና ለትርፍ ጊዜ ተማሪዎች በተመጣጣኝ ክፍያ ይቀርባል።',
      admissionRequirements: [
        'የ12ኛ ክፍል ESSLCE ብሄራዊ ፈተና ማለፊያ ነጥብ ማሟላት',
        'የአዲስ አበባ ዩኒቨርሲቲ የመግቢያ ፈተና (UEE) ማለፍ',
        'የሁለተኛ ደረጃ ትምህርት ኦፊሴላዊ ትራንስክሪፕት ማቅረብ'
      ],
      scholarships: [
        'ለአካል ጉዳተኞችና ለሴት ተማሪዎች የሚሰጥ ልዩ የትምህርት ድጋፍ',
        'በትምህርት ሚኒስቴር የሚሰጥ የማካሻ (Remedial) ፕሮግራም ዕድል'
      ],
      faculties: ['የጤና ሳይንስ ኮሌጅ (ጥቁር አንበሳ)', 'የተፈጥሮ ሳይንስ ኮሌጅ', 'የንግድና ኤኮኖሚክስ ኮሌጅ', 'የቴክኖሎጂ ኢንስቲትዩት (AAiT)', 'የህግና ህገ-መንግስታዊ ጥናት ኮሌጅ', 'የማህበራዊ ሳይንስ ኮሌጅ'],
      facilities: ['ጥቁር አንበሳ ስፔሻላይዝድ ሆስፒታል', 'የማዕከላዊ ቤተ-መጽሐፍት (Kennedy Library)', 'የዲጂታል ምርምር ላቦራቶሪዎች', 'የተማሪዎች መኖሪያና ካፌቴሪያ', 'የስፖርት ማዕከል'],
      campuses: ['ዋናው ካምፓስ (ሲድስት ኪሎ)', 'ጥቁር አንበሳ ካምፓስ', 'አራት ኪሎ ካምፓስ', 'አምስት ኪሎ ካምፓስ', 'ንግድ ሥራ ካምፓስ']
    },
    om: {
      name: 'Yuunivarsiitii Finfinnee (AAU)',
      description: 'Yuunivarsiitiin Finfinnee bara 1950tti hunda’e dhaabbata barnoota olaanoo fi qorannoo isa duraa fi isa guddaa Itoophiyaati. Seenaa waggaa 70+ keessatti geggeessitoota fi hayyoota hedduu horateera.',
      academicOverview: 'Dhaabbatichi koolleejjiiwwan 10+ fi dhaabbilee qorannoo tiin sagantaawwan barnootaa 200 ol digirii jalqabaa, lammaffaa fi sadaffaan kenna. Dhaabbata fayyaa Tikur Anbessa dabalatee wiirtuuwwan qorannoo guddaa qaba.',
      mission: 'Qorannoo, barnoota fi tajaajila hawaasaatiin misoomasa biyyaa ariifachiisuuf barattoota dandeettii qaban gadhisuu.',
      vision: 'Bara 2025tti Afrikaa Bahaa keessatti yuunivarsiitii qorannoo isa jalqabaa ta’uu.',
      admissionOverview: 'Qabxii seensa ESSLCE kutaa 12ffaa Ministeera Barnootaa fi qormaata seensa yuunivarsiitii (UEE) irratti hundaa’ee barattoota fudhata.',
      tuitionOverview: 'Barattoota mootummaan qabamaniif kaffaltii malee baasii qooddatee kan kennamu yoo ta’u, sagantaa galgalaaf kaffaltii madaalawaan dhihaata.',
      admissionRequirements: [
        'Qabxii seensa qormaata biyyaalessaa ESSLCE kutaa 12ffaa guutuu',
        'Qormaata seensa Yuunivarsiitii Finfinnee (UEE) dabruu',
        'Waraqaa ragaa (transcript) sadarkaa 2ffaa dhiheessuu'
      ],
      scholarships: [
        'Deeggarsa barnoota addaa dubartootaa fi qaama miidhamtootaaf kennamu',
        'Carraa sagantaa maakaashaa (Remedial) Ministeera Barnootaatiin kennamu'
      ],
      faculties: ['Koolleejjii Saayinsii Fayyaa', 'Koolleejjii Saayinsii Uumamaa', 'Koolleejjii Daldalaa fi Dinagdee', 'Dhaabbata Teknoolojii (AAiT)', 'Koolleejjii Seeraa', 'Koolleejjii Saayinsii Hawaasaa'],
      facilities: ['Hospitaala Ispeeshaalaayizdii Tikur Anbessa', 'Mana Kitaaba Dhiheessaa Kennedy', 'Laaboraatoorii Qorannoo Raadiyoo', 'Dormii fi Meeshaa Barattootaa', 'Wiirtuu Ispoortii'],
      campuses: ['Kaampasii Guddaa (Sidist Kilo)', 'Kaampasii Tikur Anbessa', 'Kaampasii Arat Kilo', 'Kaampasii Amist Kilo', 'Kaampasii Daldalaa']
    },
    ti: {
      name: 'ዩኒቨርሲቲ አዲስ አበባ (AAU)',
      description: 'አዲስ አበባ ዩኒቨርሲቲ ኣብ 1950 ዝተመስረተ ኣብ ኢትዮጵያ ቀዳማይን ዝዓበየን ናይ ላዕለዋይ ትምህርትን ምርምርን ትካል እዩ። ኣብ ናይ 70+ ዓመታት ታሪኹ ብዙሓት መራሕትን ተመራመርትን ኣፍርዩ።',
      academicOverview: 'እቲ ትካል ብ10+ ኮሌጃትን ትካላት ምርምርን ኣቢሉ ካብ ቀዳማይ ክሳብ ሳልሳይ ዲግሪ ካብ 200 ንላዕሊ ናይ ትምህርቲ ፕሮግራማት ይህብ። ናይ ጥቁር አንበሳ ሆስፒታል ሓዊሱ ብዙሓት ናይ ሕክምናን ቴክኖሎጂን ማእከላት ኣለውዎ።',
      mission: 'ብምርምር፣ ትምህርትን ኣገልግሎት ማሕበረሰብን ናይ ሓደ ሃገር ዕብየት ዝደግፉ ብቑዓት ዜጋታት ምፍራይ።',
      vision: 'ኣብ 2025 ኣብ ምብራቕ ኣፍሪቃ ቀዳማይ ናይ ምርምር ዩኒቨርሲቲ ምዃን።',
      admissionOverview: 'ብመሰረት ሚኒስቴር ትምህርቲ (MoGE) ናይ 12 ክፍሊ ESSLCE ውፅኢትን ናይቲ ዩኒቨርሲቲ ናይ ምእታው ፈተናን (UEE) ተማሃሮ ይቀበል።',
      tuitionOverview: 'ንመንግስቲ ስፖንሰር ተማሃሮ ብነፃ ዝወሃብ ኮይኑ፤ ንምሸትን ወልቀ ተማሃሮን ብተመጣጣኒ ኽፍሊ ይቐርብ።',
      admissionRequirements: [
        'ናይ 12 ክፍሊ ESSLCE ሃገራዊ ፈተና ሕልፊ ነጥቢ ምምላእ',
        'ናይ አዲስ አበባ ዩኒቨርሲቲ ናይ ምእታው ፈተና (UEE) ምሕላፍ',
        'ናይ ካልኣይ ብርኪ ትምህርቲ ትራንስክሪፕት ምቕራብ'
      ],
      scholarships: [
        'ንደቂ ኣነስትዮን ንኣካል ጉዳተኛታትን ዝወሃብ ፍሉይ ናይ ትምህርቲ ሓገዝ',
        'ብሚኒስቴር ትምህርቲ ዝወሃብ ናይ ማካሻ (Remedial) ፕሮግራም ዕድል'
      ],
      faculties: ['ኮሌጅ ቪዥን ጥዕና (ጥቁር አንበሳ)', 'ኮሌጅ ተፈጥሮ ሳይንስ', 'ኮሌጅ ንግድን ኤኮኖሚክስን', 'ኢንስቲትዩት ቴክኖሎጂ (AAiT)', 'ኮሌጅ ሕጊ', 'ኮሌጅ ማሕበራዊ ሳይንስ'],
      facilities: ['ጥቁር አንበሳ ስፔሻላይዝድ ሆስፒታል', 'ናይ ማእኸል ቤተ-መፅሓፍቲ (Kennedy)', 'ናይ ዲጂታል ምርምር ላቦራቶሪታት', 'ናይ ተማሃሮ መቐመጥን ካፌን', 'ናይ ስፖርት ማእኸል'],
      campuses: ['ቀንዲ ካምፓስ (ሲድስት ኪሎ)', 'ጥቁር አንበሳ ካምፓስ', 'አራት ኪሎ ካምፓስ', 'አምስት ኪሎ ካምፓስ', 'ንግድ ሥራ ካምፓስ']
    },
    so: {
      name: 'Jaamacadda Addis Ababa (AAU)',
      description: 'Jaamacadda Addis Ababa oo la aasaasay 1950kii waa jaamacadda ugu horreysa uguna weyn ee waxbarashada sare iyo cilmi-baadhista ee Itoobiya. Waxay soo saartay hoggaamiyeyaal iyo saynisyahanno badan 70+ sano oo taariikh ah.',
      academicOverview: 'Waqtiyada ay bixiso 200+ barnaamijyo waxbarasho oo heer bachelor, master iyo PhD ah iyadoo loo marayo 10+ kulliyadood. Waxay leedahay xarumo caafimaad iyo tiknoolajiyadeed oo ay ka mid tahay Cisbitaalka Tikur Anbessa.',
      mission: 'Usoosaarida muwaadiniin karti leh oo horumariya qaranka iyada oo loo marayo cilmi-baadhis iyo adeeg bulsho.',
      vision: 'Inay noqoto jaamacadda cilmi-baadhista ee ugu horreysa Bariga Afrika marka la gaadho 2025.',
      admissionOverview: 'Waxay ardayda u aqbashaa si waafaqsan dhibcaha jarista fasalka 12aad ESSLCE ee Wasaaradda Waxbarashada iyo imtixaanka jaamacadda (UEE).',
      tuitionOverview: 'Bilaash ayay u tahay ardayda dowladda ay kafaala-qaaddo, iyadoo lacag yar oo la awoodo looga baahan yahay ardayda habeenkii.',
      admissionRequirements: [
        'Dhammaystirka dhibcaha jarista imtixaanka ESSLCE fasalka 12aad',
        'Pasaaka imtixaanka gelitaanka Jaamacadda Addis Ababa (UEE)',
        'Soo gudbinta shahaadada fasalka 12aad (transcript)'
      ],
      scholarships: [
        'Taageero waxbarasho oo loo fidiyo haweenka iyo dadka naqada ah',
        'Fursadaha barnaamijka maakaashada (Remedial) ee Wasaaradda Waxbarashada'
      ],
      faculties: ['Kulliyadda Sayniska Caafimaadka', 'Kulliyadda Sayniska Bayoolajiga', 'Kulliyadda Ganacsiga & Dhaqaalaha', 'Machadka Tiknoolajiyada (AAiT)', 'Kulliyadda Sharciga', 'Kulliyadda Sayniska Bulshada'],
      facilities: ['Cisbitaalka Tikur Anbessa Specialized Hospital', 'Maktabadda Dhexe (Kennedy Library)', 'Laboratoriyada Cilmi-baadhista', 'Hoyga Ardayda & Makhaayada', 'Xarunta Ciyaaraha'],
      campuses: ['Kaampaska Weyn (Sidist Kilo)', 'Kaampaska Tikur Anbessa', 'Kaampaska Arat Kilo', 'Kaampaska Amist Kilo', 'Kaampaska Ganacsiga']
    }
  },
  'adama-science-and-technology-university': {
    am: {
      name: 'አዳማ ሳይንስ እና ቴክኖሎጂ ዩኒቨርሲቲ (ASTU)',
      description: 'አዳማ ሳይንስ እና ቴክኖሎጂ ዩኒቨርሲቲ በኢንጂነሪንግ፣ በቴክኖሎጂ እና በተተገበሩ ሳይንሶች ላይ ያተኮረ የኢትዮጵያ ቀዳሚ የልህቀት ማዕከል ነው።',
      academicOverview: 'ASTU በSTEM ትምህርቶች፣ አርቲፊሻል ኢንተለጀንስ፣ ቁሳቁስ ሳይንስ እና ታዳሽ ኃይል ላይ ልዩ ትኩረት በመስጠት የላቁ የዲግሪ ፕሮግራሞችን ያቀርባል።',
      mission: 'በሳይንስ እና ቴክኖሎጂ ዘርፍ ሀገሪቱን ወደ ኢንዱስትሪ መር ኤኮኖሚ የሚያሸጋግሩ መሃንዲሶችን እና ተመራማሪዎችን ማፈራት።',
      vision: 'በአፍሪካ ተወዳዳሪ የሆነ የሳይንስ እና ቴክኖሎጂ የምርምር ዩኒቨርሲቲ መሆን።',
      admissionOverview: 'በ12ኛ ክፍል ESSLCE ከፍተኛ የተፈጥሮ ሳይንስና የሂሳብ ነጥብ ያመጡ ተማሪዎች በልዩ ማጣሪያ ይገባሉ።',
      tuitionOverview: 'ለመንግስት ስፖንሰር ተማሪዎች በነፃ የሚሰጥ ሲሆን፤ ለኢንዱስትሪና ለግል ተማሪዎች በተለየ ክፍያ ይስተናገዳል።',
      admissionRequirements: ['የ12ኛ ክፍል ESSLCE ከፍተኛ የተፈጥሮ ሳይንስ ነጥብ', 'የሂሳብ እና ፊዚክስ ትምህርቶች ልዩ ብቃት', 'የዩኒቨርሲቲው የሳይንስ ማጣሪያ ፈተና'],
      scholarships: ['ለላቁ የSTEM ተማሪዎች የሚሰጥ የምርምር ማበረታቻ', 'የኢንዱስትሪ ትስስር ስፖንሰርሺፕ'],
      faculties: ['የኤሌክትሪካልና ኮምፒውተር ኢንጂነሪንግ ስኩል', 'የሜካኒካልና ቁሳቁስ ኢንጂነሪንግ ስኩል', 'የሲቪልና አርክቴክቸር ስኩል', 'የተተገበሩ ተፈጥሮ ሳይንሶች ስኩል'],
      facilities: ['የላቀ የናኖቴክኖሎጂ ላቦራቶሪ', 'የሮቦቲክስና AI የምርምር ማዕከል', 'የዲጂታል ቤተ-መጽሐፍት', 'የኢኖቬሽን ኢንኩቤሽን ማዕከል'],
      campuses: ['ዋናው አዳማ ካምፓስ']
    },
    om: {
      name: 'Yuunivarsiitii Sayinsiifi Teknoologyii Adaamaa (ASTU)',
      description: 'Yuunivarsiitiin Sayinsiifi Teknoologyii Adaamaa wiirtuu milkaa’ina injiinariingii, teknoolojii fi saayinsii hojiirra oole irratti xiyyeeffatuu dha.',
      academicOverview: 'ASTU barnoota STEM, intellejensii arfiishaala, saayinsii meeshaa fi anniisaa haaromfamuu irratti xiyyeeffachuudhaan sagantaawwan digirii olaanoo dhiheessa.',
      mission: 'Sektera saayinsii fi teknoolojiitiin biyya gara dinagdee indastiriitti ceesisuuf injiinota fi qorattoota dandeettii qaban horachuu.',
      vision: 'Afrikaa keessatti yuunivarsiitii qorannoo saayinsii fi teknoolojii dorgomaa ta’uu.',
      admissionOverview: 'Barattoota kutaa 12ffaa ESSLCE irratti qabxii saayinsii uumamaa fi herregaa olaanaa fidaan calallii addaatiin fudhata.',
      tuitionOverview: 'Barattoota mootummaan qabamaniif kaffaltii malee dhihaata.',
      admissionRequirements: ['Qabxii ESSLCE saayinsii uumamaa olaanaa', 'Herrega fi Fiziiksii irratti dandeettii addaa', 'Qormaata calallii saayinsii yuunivarsiitii'],
      scholarships: ['Badhaasa qorannoo barattoota STEM olaanoof', 'Deeggarsa indastirii'],
      faculties: ['Dhaabbata Injiinariingii Elektrikaalaa fi Kompiyuutaraa', 'Dhaabbata Injiinariingii Mekaanikaalaa', 'Dhaabbata Siivilii fi Arkiitektcharaa', 'Dhaabbata Saayinsii Uumamaa Hojiirra Oole'],
      facilities: ['Laaboraatoorii Naanooteknoolojii', 'Wiirtuu Qorannoo Robootiksii fi AI', 'Mana Kitaaba Diijitaalaa', 'Wiirtuu Inkuubeeshinii'],
      campuses: ['Kaampasii Guddaa Adaamaa']
    },
    ti: {
      name: 'ዩኒቨርሲቲ ሳይንስን ቴክኖሎጂን አዳማ (ASTU)',
      description: 'ዩኒቨርሲቲ ሳይንስን ቴክኖሎጂን አዳማ ኣብ ኢንጂነሪንግ፣ ቴክኖሎጂን ተተግብሮ ሳይንስን ዝተመስረተ ናይ ኢትዮጵያ ቀዳማይ ናይ ብሉፅነት ማእኸል እዩ።',
      academicOverview: 'ASTU ኣብ STEM ትምህርትታት፣ አርቲፊሻል ኢንተለጀንስን ሓዲሽ ኃይልን ፍሉይ ቃል ብምሃብ ናይ ዲግሪ ፕሮግራማት የቕርብ።',
      mission: 'ብሳይንስን ቴክኖሎጂን ሃገር ናብ ናይ ኢንዱስትሪ መራሒ ኤኮኖሚ ዝቕይሩ መሃንዲሳትን ተመራመርትን ምፍራይ።',
      vision: 'ኣብ ኣፍሪቃ ተወዳዳሪ ዝኾነ ናይ ሳይንስን ቴክኖሎጂን ናይ ምርምር ዩኒቨርሲቲ ምዃን።',
      admissionOverview: 'ኣብ 12 ክፍሊ ESSLCE ልዑል ናይ ተፈጥሮ ሳይንስ ነጥቢ ዘመፅኡ ተማሃሮ ብፍሉይ መፅረዪ ይኣትዉ።',
      tuitionOverview: 'ንመንግስቲ ስፖንሰር ተማሃሮ ብነፃ ዝወሃብ እዩ።',
      admissionRequirements: ['ናይ 12 ክፍሊ ESSLCE ልዑል ተፈጥሮ ሳይንስ ነጥቢ', 'ኣብ ሂሳብን ፊዚክስን ፍሉይ ክእለት', 'ናይቲ ዩኒቨርሲቲ ናይ ሳይንስ መፅረዪ ፈተና'],
      scholarships: ['ንብሉፃት ናይ STEM ተማሃሮ ዝወሃብ ናይ ምርምር ሓገዝ'],
      faculties: ['ስኩል ኤሌክትሪካልን ኮምፒውተር ኢንጂነሪንግን', 'ስኩል ሜካኒካል ኢንጂነሪንግን', 'ስኩል ሲቪልን አርክቴክቸርን', 'ስኩል ተተግብሮ ተፈጥሮ ሳይንስ'],
      facilities: ['ናይ ናኖቴክኖሎጂ ላቦራቶሪ', 'ናይ ሮቦቲክስን AIን ማእኸል ምርምር', 'ዲጂታል ቤተ-መፅሓፍቲ'],
      campuses: ['ቀንዲ አዳማ ካምፓስ']
    },
    so: {
      name: 'Jaamacadda Sayniska iyo Tiknoolajiyada ee Adama (ASTU)',
      description: 'Jaamacadda Sayniska iyo Tiknoolajiyada ee Adama waa xarunta ugu horreysa ee Itoobiya ee ku takhasustay injineernimada, tiknoolajiyada iyo sayniska farsamada.',
      academicOverview: 'ASTU waxay bixisaa barnaamijyo heer sare ah oo diiradda saaraya masnoolajiyada STEM, robotikada, garaadka macmalka ah (AI) iyo tamarta la cusboonaysiin karo.',
      mission: 'Usoosaarida injineero iyo cilmi-baarayaal dalka u horseeda dhaqaale ku dhisan warshadaha.',
      vision: 'Inay noqoto jaamacad cilmi-baadhis saynis iyo tiknoolajiyad oo Afrika ku tartanta.',
      admissionOverview: 'Ardayda keenta dhibcaha ugu sareeya ee sayniska fasalka 12aad ESSLCE ayaa lagu kala saaraa imtixaan gaar ah.',
      tuitionOverview: 'Ardayda dowladda kafaala qaaddo waxay ku dhartaan bilaash.',
      admissionRequirements: ['Dhibco sare oo ESSLCE ah ee sayniska uumamaa', 'Karti gaar ah oo xisaabta iyo fiisigiska ah', 'Imtixaanka kala saarista sayniska ee jaamacadda'],
      scholarships: ['Abaalmarinta cilmi-baadhista ee ardayda STEM ee guulaysata'],
      faculties: ['Kulliyadda Injineernimada Dhismaha & Korontada', 'Kulliyadda Injineernimada Farsamada', 'Kulliyadda Naqshadeynta & Dhismaha', 'Kulliyadda Sayniska Farsamada'],
      facilities: ['Laboratoriga Nanotechnology-ga', 'Xarunta Cilmi-baadhista AI & Robotics', 'Maktabadda Diijitaalka ah'],
      campuses: ['Kaampaska Weyn ee Adama']
    }
  }
};

/** Get fully localized university content dynamically for any university */
export function getLocalizedUniversityContent(university: University, lang: Language): LocalizedUniversityContent {
  const slug = university.slug || university.id;
  const dictMatch = UNIVERSITY_DICTIONARIES[slug]?.[lang];

  if (dictMatch && dictMatch.name && dictMatch.description) {
    return {
      name: dictMatch.name || university.name,
      description: dictMatch.description || university.description,
      academicOverview: dictMatch.academicOverview || university.academicOverview || university.description,
      mission: dictMatch.mission || university.mission || '',
      vision: dictMatch.vision || university.vision || '',
      admissionOverview: dictMatch.admissionOverview || university.admissionOverview || '',
      tuitionOverview: dictMatch.tuitionOverview || university.tuitionOverview || '',
      admissionRequirements: dictMatch.admissionRequirements || university.admissionRequirements || [],
      scholarships: dictMatch.scholarships || university.scholarships || [],
      faculties: dictMatch.faculties || university.faculties || [],
      facilities: dictMatch.facilities || university.facilities || [],
      campuses: dictMatch.campuses || university.campuses || []
    };
  }

  // General fallback translations for all other universities when specific translation dict is not present
  if (lang === 'am') {
    return {
      name: university.name,
      description: `${university.name} በ${university.location.city}፣ ${university.location.region} የሚገኝ ዕውቅና ያለው የከፍተኛ ትምህርት ተቋም ነው። በመደበኛ፣ በማታና በትርፍ ጊዜ መርሃ ግብሮች የተለያየ የዲግሪ ትምህርቶችን ይሰጣል።`,
      academicOverview: university.academicOverview || `${university.name} በተለያዩ የትምህርት ክፍሎችና ኮሌጆች አማካኝነት በመጀመሪያና በሁለተኛ ዲግሪ ደረጃ ጥራት ያለው ትምህርትና ማህበረሰብ ተኮር ምርምር ያካሂዳል።`,
      mission: university.mission || 'በጥራት፣ በምርምርና በማህበረሰብ አገልግሎት ሀገራዊ ልማትን የሚደግፉ ብቁ ተማሪዎችን ማፈራት።',
      vision: university.vision || 'በኢትዮጵያና በምስራቅ አፍሪካ ታዋቂና ተወዳዳሪ የከፍተኛ ትምህርት ተቋም መሆን።',
      admissionOverview: university.admissionOverview || 'በትምህርት ሚኒስቴር (MoGE) የ12ኛ ክፍል ESSLCE ብሄራዊ የመቁረጫ ነጥብ መሠረት ተማሪዎችን ይቀበላል።',
      tuitionOverview: university.tuitionOverview || 'ለመንግስት ይመደቡ ተማሪዎች በወጪ መጋራት ፕሮግራም የሚሸፈን ሲሆን፤ ለግል ተማሪዎች በተመጣጣኝ ክፍያ ይቀርባል።',
      admissionRequirements: (university.admissionRequirements && university.admissionRequirements.length > 0)
        ? university.admissionRequirements
        : [
          'የ12ኛ ክፍል ESSLCE ብሄራዊ ፈተና ማለፊያ ነጥብ ማሟላት',
          'የሁለተኛ ደረጃ ትምህርት ቤት ኦፊሴላዊ ትራንስክሪፕት',
          'በትምህርት ሚኒስቴር የተመደበበት ደብዳቤ'
        ],
      scholarships: university.scholarships || ['የማካሻ (Remedial) ፕሮግራም ድጋፍ', 'ለሴት ተማሪዎችና ለአካል ጉዳተኞች ልዩ ድጋፍ'],
      faculties: university.faculties || ['የህክምናና ጤና ሳይንስ ኮሌጅ', 'የኢንጂነሪንግና ቴክኖሎጂ ኮሌጅ', 'የተፈጥሮ ሳይንስ ኮሌጅ', 'የንግድና ኤኮኖሚክስ ኮሌጅ', 'የህግና ማህበራዊ ሳይንስ ኮሌጅ'],
      facilities: university.facilities || ['የማዕከላዊ ቤተ-መጽሐፍት', 'የኮምፒውተርና ዲጂታል ላቦራቶሪ', 'የተማሪዎች መኖሪያ ካምፓስ', 'የስፖርት ማዕከል'],
      campuses: university.campuses || [`ዋናው ${university.location.city} ካምፓስ`]
    };
  }

  if (lang === 'om') {
    return {
      name: university.name,
      description: `${university.name} dhaabbata barnoota olaanoo beekamtii qabu kan magaalaa ${university.location.city}, naannoo ${university.location.region} keessatti argamuu dha.`,
      academicOverview: university.academicOverview || `${university.name} faakultiiwwan fi sagantaawwan barnootaa adda addaatiin barnoota qulqullina qabu fi qorannoo hawaasa irratti xiyyeeffate dhiheessa.`,
      mission: university.mission || 'Qulqullina barnootaa fi qorannootiin misoomasa biyyaa deeggaruuf barattoota dandeettii qaban horachuu.',
      vision: university.vision || 'Itoophiyaa fi Afrikaa Bahaa keessatti yuunivarsiitii beekamaa ta’uu.',
      admissionOverview: university.admissionOverview || 'Qabxii seensa ESSLCE kutaa 12ffaa Ministeera Barnootaatiin murtaa’e irratti hundaa’ee barattoota fudhata.',
      tuitionOverview: university.tuitionOverview || 'Barattoota mootummaan qabamaniif kaffaltii malee baasii qooddatee kan dhihaatuu dha.',
      admissionRequirements: (university.admissionRequirements && university.admissionRequirements.length > 0)
        ? university.admissionRequirements
        : [
          'Qabxii seensa qormaata biyyaalessaa ESSLCE kutaa 12ffaa guutuu',
          'Waraqaa ragaa (transcript) sadarkaa 2ffaa dhiheessuu',
          'Xalayaa ramaddii Ministeera Barnootaa'
        ],
      scholarships: university.scholarships || ['Carraa sagantaa maakaashaa (Remedial)', 'Deeggarsa dubartootaa fi qaama miidhamtootaa'],
      faculties: university.faculties || ['Koolleejjii Saayinsii Fayyaa', 'Koolleejjii Injiinariingii', 'Koolleejjii Saayinsii Uumamaa', 'Koolleejjii Daldalaa fi Dinagdee'],
      facilities: university.facilities || ['Mana Kitaaba Guddaa', 'Laaboraatoorii Kompiyuutaraa', 'Dormii Barattootaa', 'Wiirtuu Ispoortii'],
      campuses: university.campuses || [`Kaampasii Guddaa ${university.location.city}`]
    };
  }

  if (lang === 'ti') {
    return {
      name: university.name,
      description: `${university.name} ኣብ ከተማ ${university.location.city}፣ ክልል ${university.location.region} ዝርከብ ፍሉጥ ናይ ላዕለዋይ ትምህርቲ ትካል እዩ።`,
      academicOverview: university.academicOverview || `${university.name} ብተፈላለዩ ክፍለ ትምህርትታትን ኮሌጃትን ኣቢሉ ብቐዳማይን ካልኣይን ዲግሪ ብሉፅ ትምህርትን ምርምርን የካይድ።`,
      mission: university.mission || 'ብትምህርትን ምርምርን ሃገራዊ ዕብየት ዝደግፉ ብቑዓት ተማሃሮ ምፍራይ።',
      vision: university.vision || 'ኣብ ኢትዮጵያን ምብራቕ ኣፍሪቃን ፍሉጥ ናይ ላዕለዋይ ትምህርቲ ትካል ምዃን።',
      admissionOverview: university.admissionOverview || 'ብመሰረት ሚኒስቴር ትምህርቲ (MoGE) ናይ 12 ክፍሊ ESSLCE መቑረፂ ነጥቢ ተማሃሮ ይቀበል።',
      tuitionOverview: university.tuitionOverview || 'ንመንግስቲ ስፖንሰር ተማሃሮ ብነፃ ዝወሃብ እዩ።',
      admissionRequirements: (university.admissionRequirements && university.admissionRequirements.length > 0)
        ? university.admissionRequirements
        : [
          'ናይ 12 ክፍሊ ESSLCE ሃገራዊ ፈተና ሕልፊ ነጥቢ ምምላእ',
          'ናይ ካልኣይ ብርኪ ትምህርቲ ትራንስክሪፕት ምቕራብ',
          'ናይ ሚኒስቴር ትምህርቲ ናይ ምደባ ደብዳበ'
        ],
      scholarships: university.scholarships || ['ናይ ማካሻ (Remedial) ፕሮግራም ሓገዝ', 'ንደቂ ኣነስትዮን ንኣካል ጉዳተኛታትን ፍሉይ ሓገዝ'],
      faculties: university.faculties || ['ኮሌጅ ቪዥን ጥዕና', 'ኮሌጅ ኢንጂነሪንግ', 'ኮሌጅ ተፈጥሮ ሳይንስ', 'ኮሌጅ ንግድን ኤኮኖሚክስን'],
      facilities: university.facilities || ['ቤተ-መፅሓፍቲ', 'ኮምፒውተር ላቦራቶሪ', 'ናይ ተማሃሮ መቐመጢ', 'ናይ ስፖርት ማእኸል'],
      campuses: university.campuses || [`ቀንዲ ${university.location.city} ካምፓስ`]
    };
  }

  if (lang === 'so') {
    return {
      name: university.name,
      description: `${university.name} waa jaamacad la aqoonsan yahay oo ku taal magaalada ${university.location.city}, deegaanka ${university.location.region}.`,
      academicOverview: university.academicOverview || `${university.name} waxay bixisaa waxbarasho tayo leh oo heer bachelor iyo master ah iyada oo loo marayo kulliyado kala duwan.`,
      mission: university.mission || 'Usoosaarida muwaadiniin karti leh oo horumariya qaranka iyada oo loo marayo waxbarasho iyo adeeg bulsho.',
      vision: university.vision || 'Inay noqoto jaamacad caan ah oo ka jirta Itoobiya iyo Bariga Afrika.',
      admissionOverview: university.admissionOverview || 'Waxay ardayda u aqbashaa si waafaqsan dhibcaha jarista fasalka 12aad ESSLCE ee Wasaaradda Waxbarashada.',
      tuitionOverview: university.tuitionOverview || 'Bilaash ayay u tahay ardayda dowladda kafaala qaaddo.',
      admissionRequirements: (university.admissionRequirements && university.admissionRequirements.length > 0)
        ? university.admissionRequirements
        : [
          'Dhammaystirka dhibcaha jarista ESSLCE fasalka 12aad',
          'Soo gudbinta shahaadada fasalka 12aad (transcript)',
          'Warqadda meelaynta ee Wasaaradda Waxbarashada'
        ],
      scholarships: university.scholarships || ['Barnaamijka maakaashada (Remedial)', 'Taageero loo fidiyo haweenka iyo dadka naqada ah'],
      faculties: university.faculties || ['Kulliyadda Caafimaadka', 'Kulliyadda Injineernimada', 'Kulliyadda Sayniska', 'Kulliyadda Ganacsiga & Dhaqaalaha'],
      facilities: university.facilities || ['Maktabadda Dhexe', 'Laboratoriga Kombuyuutarka', 'Hoyga Ardayda', 'Xarunta Ciyaaraha'],
      campuses: university.campuses || [`Kaampaska Weyn ee ${university.location.city}`]
    };
  }

  // English default fallback
  return {
    name: university.name,
    description: university.description,
    academicOverview: university.academicOverview || university.description,
    mission: university.mission || 'Fostering academic excellence, innovation, and community development.',
    vision: university.vision || 'To become a globally recognized center of higher learning and research.',
    admissionOverview: university.admissionOverview || 'Admissions are conducted in accordance with MoGE Grade 12 ESSLCE cut-off criteria.',
    tuitionOverview: university.tuitionOverview || 'Government-sponsored entries are covered via cost-sharing; private entries follow published tuition rates.',
    admissionRequirements: university.admissionRequirements || ['Official Grade 12 ESSLCE transcript', 'Ministry of Education placement letter', 'Identification documents'],
    scholarships: university.scholarships || ['MoGE Remedial Entry Support', 'Gender & Special Needs Scholarship Programs'],
    faculties: university.faculties || ['Health Sciences', 'Engineering & Technology', 'Natural Sciences', 'Business & Economics', 'Law & Social Sciences'],
    facilities: university.facilities || ['Central Library', 'Digital & Computer Labs', 'Student Residence', 'Sports Complex'],
    campuses: university.campuses || [`Main ${university.location.city} Campus`]
  };
}
