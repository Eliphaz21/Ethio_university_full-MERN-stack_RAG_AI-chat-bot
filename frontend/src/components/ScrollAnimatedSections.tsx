import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  Building2,
  BookOpen,
  Award,
  Search,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Layers,
  FileCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PUBLIC_UNIS_LIST = [
  {
    name: 'Addis Ababa University (AAU)',
    badge: 'First-Tier Public',
    city: 'Addis Ababa',
    desc: 'Ethiopia’s flagship research university offering top Medicine, Law, Engineering, Business, and Computer Science degrees with autonomous governance.',
    bullets: ['MoGE ESSLCE Cutoff Admission', 'Full Campus Dormitory & Meal Services', 'Master & PhD Research Programs']
  },
  {
    name: 'Adama Science & Tech (ASTU)',
    badge: 'Science & Tech Hub',
    city: 'Adama, Oromia',
    desc: 'Specialized STEM university dedicated to Applied Engineering, Software Engineering, Robotics, and Advanced Biotechnology.',
    bullets: ['STEM Entrance Examination Criteria', 'High-Tech Labs & Innovation Hubs', 'Industry Partnered Placements']
  },
  {
    name: 'Hawassa University (HU)',
    badge: 'Health & Agriculture',
    city: 'Hawassa, Sidama',
    desc: 'Premier Sidama regional university leading in Medicine, Health Sciences, Agriculture, and Natural Resource Management.',
    bullets: ['State-of-the-Art Referral Hospital', 'Agricultural Research Center', 'Over 80 Degree Programs']
  },
  {
    name: 'Bahir Dar University (BDU)',
    badge: 'Maritime & Tech',
    city: 'Bahir Dar, Amhara',
    desc: 'Renowned university featuring Ethiopia’s Maritime Academy, Civil Engineering, Textile Engineering, and Law faculties.',
    bullets: ['Ethiopian Maritime Academy', 'Textile & Fashion Institute', 'Lake Tana Research Center']
  },
  {
    name: 'Jimma University (JU)',
    badge: 'Community Health',
    city: 'Jimma, Oromia',
    desc: 'Famous for Community-Based Education (CBE), top Medical School, Bio-Medical Engineering, and Agricultural Sciences.',
    bullets: ['Community-Based Medical Model', 'Institute of Technology (JIT)', 'Nationwide Placement Leader']
  },
  {
    name: 'Mekelle University (MU)',
    badge: 'Technology & Law',
    city: 'Mekelle, Tigray',
    desc: 'Pioneer center for Dryland Agriculture, Veterinary Medicine, Law, Health Sciences, and Computer Engineering.',
    bullets: ['Dryland Resource Management', 'Top Ranked Law Faculty', 'Ayder Comprehensive Hospital']
  }
];

const PRIVATE_UNIS_LIST = [
  {
    name: "St. Mary's University",
    badge: 'Accredited Private',
    city: 'Addis Ababa',
    desc: 'A pioneer private higher education institution in Addis Ababa offering accredited undergraduate and master’s degree programs.',
    bullets: ['Distance & Regular Degree Modes', 'Business Administration & Computer Science', 'Flexible Evening & Weekend Classes']
  },
  {
    name: 'Unity University',
    badge: 'First Private Uni',
    city: 'Addis Ababa & Regions',
    desc: 'First private university in Ethiopia providing high-quality Accounting, Management, Architecture, and Information Technology degrees.',
    bullets: ['Modern Campuses across Regional Hubs', 'Recognized MoGE Certification', 'Practical Internship Connections']
  },
  {
    name: 'Rift Valley University',
    badge: '40+ Regional Hubs',
    city: 'Oromia, SNNP & Addis',
    desc: 'Widespread private campus networks across Oromia, Amhara, SNNP, and Addis Ababa for affordable higher education access.',
    bullets: ['40+ Regional Branch Campuses', 'Health Science & Nursing Diplomas', 'Direct Transfer & Extension Programs']
  },
  {
    name: 'Alpha University College',
    badge: 'Distance Leader',
    city: 'Addis Ababa & Amhara',
    desc: 'Leader in distance higher education, flexible evening degree programs, leadership management, and accounting degrees.',
    bullets: ['Nationwide Distance Centers', 'Flexible Extension Degrees', 'Business & Leadership Programs']
  },
  {
    name: 'CPU College',
    badge: 'Computer Science Hub',
    city: 'Addis Ababa',
    desc: 'Specialized IT and Business College focusing on hands-on Software Engineering, Database Administration, and Marketing Management.',
    bullets: ['Practical Software Development', 'Cisco & Tech Certifications', 'Accredited Degree Programs']
  },
  {
    name: 'Microlink Information Tech',
    badge: 'IT & Software Diploma',
    city: 'Addis Ababa',
    desc: 'Focused technical college providing accredited Bachelor of Science in Information Technology and TVET Level 1-5 diplomas.',
    bullets: ['Networking & Software Diplomas', 'Practical IT Lab Training', 'Flexible Admission Schedules']
  }
];

export const ScrollAnimatedSections: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');
  const [publicPage, setPublicPage] = useState(0);
  const [privatePage, setPrivatePage] = useState(0);

  const pageSize = 3;
  const currentPublicList = PUBLIC_UNIS_LIST.slice(publicPage * pageSize, (publicPage + 1) * pageSize);
  const currentPrivateList = PRIVATE_UNIS_LIST.slice(privatePage * pageSize, (privatePage + 1) * pageSize);

  const totalPublicPages = Math.ceil(PUBLIC_UNIS_LIST.length / pageSize);
  const totalPrivatePages = Math.ceil(PRIVATE_UNIS_LIST.length / pageSize);

  return (
    <div className="space-y-24 py-12">
      {/* SECTION 1: Public vs Private Universities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            {t('publicPrivateHeadline')}
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg">
            {t('publicPrivateSubtitle')}
          </p>

          {/* Toggle Tab Switcher */}
          <div className="mt-8 inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/60 shadow-inner">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-[#059669] text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <School className="w-4 h-4" />
              <span>{t('publicUniversitiesTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('private')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === 'private'
                  ? 'bg-[#059669] text-white shadow-lg shadow-emerald-900/20'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('privateUniversitiesTab')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Card Display */}
        {activeTab === 'public' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-500 animate-fadeIn">
              {currentPublicList.map((uni, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {uni.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{uni.city}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{uni.name}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed mb-6">
                      {uni.desc}
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 pt-4 border-t border-slate-100">
                    {uni.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Public Unis Left (<) & Right (>) Navigation Controls */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                disabled={publicPage === 0}
                onClick={() => setPublicPage(prev => Math.max(prev - 1, 0))}
                aria-label="Previous Page"
                className="w-11 h-11 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-[#059669] hover:text-white hover:border-[#059669] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:border-slate-300 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                {publicPage + 1} / {totalPublicPages}
              </span>

              <button
                disabled={publicPage >= totalPublicPages - 1}
                onClick={() => setPublicPage(prev => Math.min(prev + 1, totalPublicPages - 1))}
                aria-label="Next Page"
                className="w-11 h-11 rounded-2xl bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-30 disabled:hover:bg-[#059669] disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shadow-md"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-500 animate-fadeIn">
              {currentPrivateList.map((uni, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        {uni.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{uni.city}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{uni.name}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed mb-6">
                      {uni.desc}
                    </p>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700 pt-4 border-t border-slate-100">
                    {uni.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Private Unis Left (<) & Right (>) Navigation Controls */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                disabled={privatePage === 0}
                onClick={() => setPrivatePage(prev => Math.max(prev - 1, 0))}
                aria-label="Previous Page"
                className="w-11 h-11 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-[#059669] hover:text-white hover:border-[#059669] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:hover:border-slate-300 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
              </button>

              <span className="text-xs font-extrabold text-slate-600 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                {privatePage + 1} / {totalPrivatePages}
              </span>

              <button
                disabled={privatePage >= totalPrivatePages - 1}
                onClick={() => setPrivatePage(prev => Math.min(prev + 1, totalPrivatePages - 1))}
                aria-label="Next Page"
                className="w-11 h-11 rounded-2xl bg-[#059669] text-white hover:bg-[#047857] disabled:opacity-30 disabled:hover:bg-[#059669] disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer shadow-md"
              >
                <ChevronRight className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Academic Pathways for Every Student */}
      <section className="bg-emerald-950 py-20 text-white relative overflow-hidden rounded-[3rem] mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              {t('pathwaysHeadline')}
            </h2>
            <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-base sm:text-lg font-light">
              {t('pathwaysSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pathway 1: High School to University */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 border border-emerald-400/30">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('pathway1Title')}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {t('pathway1Desc')}
              </p>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                {t('pathway1Link')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pathway 2: Bachelor Degrees */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5 border border-blue-400/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('pathway2Title')}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {t('pathway2Desc')}
              </p>
              <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
                {t('pathway2Link')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pathway 3: Master's & PhD */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-5 border border-amber-400/30">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('pathway3Title')}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {t('pathway3Desc')}
              </p>
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                {t('pathway3Link')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pathway 4: TVET & Technical Colleges */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-5 border border-purple-400/30">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('pathway4Title')}</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {t('pathway4Desc')}
              </p>
              <span className="text-[11px] text-purple-400 font-bold flex items-center gap-1">
                {t('pathway4Link')} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Platform Features & AI Advisor */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight mb-6">
              {t('aiSectionTitle')}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              {t('aiSectionDesc')}
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0 font-bold">
                  አማ
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('aiFeature1Title')}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{t('aiFeature1Desc')}</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('aiFeature2Title')}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{t('aiFeature2Desc')}</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{t('aiFeature3Title')}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{t('aiFeature3Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-emerald-500/20 rounded-full filter blur-2xl z-0"></div>
            
            {/* Real ChatWidget Replica Window */}
            <div className="relative z-10 bg-[#0B132B] rounded-3xl overflow-hidden text-white shadow-2xl border border-slate-800">
              
              {/* Chat Window Top Bar Header */}
              <div className="bg-[#1C2541] px-5 py-4 flex items-center justify-between border-b border-slate-700/60">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src="/assets/ai_bot_avatar.svg" alt="EthioUni Bot" className="w-10 h-10 object-contain rounded-full shadow-lg" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#1C2541] rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">{t('aiTitle')}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t('ragAiLangs')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 font-bold">RAG Live</span>
                </div>
              </div>

              {/* Chat Simulation Area */}
              <div className="p-5 sm:p-6 space-y-4 font-sans text-xs sm:text-sm bg-[#0B132B]/90">
                
                {/* 1. Welcome RAG Context Banner */}
                <div className="bg-[#1C2541]/80 p-3.5 rounded-2xl border border-slate-700/60 text-slate-300 text-xs flex items-center gap-2.5">
                  <img src="/assets/ai_bot_avatar.svg" alt="Bot Avatar" className="w-7 h-7 object-contain shrink-0" />
                  <p className="leading-snug">
                    <strong className="text-emerald-400">{t('aiTitle')}</strong> — {t('aiSubtitle')}
                  </p>
                </div>

                {/* 2. User Message (Right Aligned) */}
                <div className="flex justify-end">
                  <div className="bg-slate-800/90 text-slate-100 p-3.5 px-4 rounded-2xl rounded-tr-sm max-w-[85%] border border-slate-700/80 shadow-sm">
                    <p className="font-semibold text-[#34d399] text-[11px] mb-1">Student Inquiry:</p>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      "ለአዲስ አበባ ዩኒቨርሲቲ (AAU) ሶፍትዌር ኢንጂነሪንግ የመግቢያ ነጥብ ስንት ነው?"
                    </p>
                  </div>
                </div>

                {/* 3. AI Assistant Response (Left Aligned with Avatar) */}
                <div className="flex items-start gap-3">
                  <img src="/assets/ai_bot_avatar.svg" alt="EthioUni Bot" className="w-8 h-8 object-contain shrink-0 mt-1 shadow-md" />
                  <div className="bg-[#059669]/20 border border-[#059669]/50 text-emerald-100 p-4 rounded-2xl rounded-tl-sm max-w-[90%] shadow-inner">
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-emerald-400 font-bold">
                      <span>EthioUni AI Assistant:</span>
                    </div>
                    <p className="leading-relaxed text-xs sm:text-sm">
                      በ2016/17 የትምህርት ዘመን የትምህርት ሚኒስቴር (MoGE) መስፈርት መሠረት ለአዲስ አበባ ዩኒቨርሲቲ የሶፍትዌር ኢንጂነሪንግ ፕሮግራም የመግቢያ ነጥብ እንደ ተፈጥሮ ሳይንስ ተማሪነቶ እና እንደ ክልሎ ይለያያል። አጠቃላይ የተፈጥሮ ሳይንስ ወንዶች 415+፣ ሴቶች 395+፣ እና ለታዳጊ ክልሎች ልዩ ነጥብ ተቀምጧል...
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollAnimatedSections;
