import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  School,
  Building2,
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  Bot,
  Search,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Globe2,
  Layers,
  FileCheck,
  Send
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ScrollAnimatedSections: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'public' | 'private'>('public');

  return (
    <div className="space-y-24 py-12">
      {/* SECTION 1: Public vs Private Universities Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#059669] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <School className="w-4 h-4" />
            <span>Accredited Institutions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">
            Ethiopian Public & Private Universities
          </h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto text-base sm:text-lg">
            Whether you are aiming for government-assigned public universities or top accredited private colleges, explore comprehensive admission details.
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
              <span>Public Universities</span>
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
              <span>Private Colleges & Universities</span>
            </button>
          </div>
        </div>

        {/* Dynamic Card Display */}
        {activeTab === 'public' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-500 animate-fadeIn">
            {/* Card 1: AAU */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#059669] mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">First-Tier Public</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">Addis Ababa University (AAU)</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Ethiopia’s flagship research university offering top Medicine, Law, Engineering, Business, and Computer Science degrees with autonomous governance.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> MoGE ESSLCE Cutoff Admission</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full Campus Dormitory & Meal Services</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Master & PhD Research Programs</li>
              </ul>
            </div>

            {/* Card 2: ASTU */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">Science & Tech Hub</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">Adama Science & Tech (ASTU)</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Specialized STEM university dedicated to Applied Engineering, Software Engineering, Robotics, and Advanced Biotechnology.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> STEM Entrance Examination Criteria</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> High-Tech Labs & Innovation Hubs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Industry Partnered Placements</li>
              </ul>
            </div>

            {/* Card 3: Regional Hubs */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                  <Globe2 className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Regional Public Unis</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">Jimma, Hawassa, BDU & MU</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Premier regional public universities offering health sciences, agriculture, civil engineering, natural sciences, and humanities.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Nationwide MoGE Student Placements</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Remedial Program Allocation Support</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Community Outreach & Field Labs</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transform transition-all duration-500 animate-fadeIn">
            {/* Card 1: St. Mary's */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">Accredited Private</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">St. Mary's University</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  A pioneer private higher education institution in Addis Ababa offering accredited undergraduate and master's degree programs.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Distance & Regular Degree Modes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Business Administration & Computer Science</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-600" /> Flexible Evening & Weekend Classes</li>
              </ul>
            </div>

            {/* Card 2: Unity University */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">First Private Uni</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">Unity University</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  First private university in Ethiopia providing high-quality accounting, management, architecture, and information technology degrees.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Modern Campuses across Addis & Regional Hubs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Recognized MoGE Certification</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-600" /> Practical Internship Connections</li>
              </ul>
            </div>

            {/* Card 3: Rift Valley & Alpha */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">Expanded Access</span>
                <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">Rift Valley & Alpha Colleges</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Widespread private campus networks across Oromia, Amhara, SNNP, and Addis Ababa for affordable higher education access.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> 40+ Regional Branch Campuses</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Health Science & Nursing Diplomas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /> Direct Transfer & Extension Programs</li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: Academic Pathways for Every Student */}
      <section className="bg-emerald-950 py-20 text-white relative overflow-hidden rounded-[3rem] mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4" />
              <span>Tailored Guidance</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Higher Education Pathways in Ethiopia
            </h2>
            <p className="text-slate-300 mt-4 max-w-2xl mx-auto text-base sm:text-lg font-light">
              Whether you are preparing for Grade 12 ESSLCE, entering university, advancing to a Master's degree, or pursuing technical TVET skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pathway 1: High School to University */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 border border-emerald-400/30">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Grade 12 ESSLCE & Remedial</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Access official MoGE cut-off criteria, placement calculator, and remedial program eligibility rules across natural & social streams.
              </p>
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                Undergraduate Admissions <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pathway 2: Bachelor Degrees */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-5 border border-blue-400/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Bachelor Programs (B.Sc / B.A)</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Explore engineering, software development, medicine, law, economics, management, and agriculture curriculum across public & private unis.
              </p>
              <span className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
                500+ Fields of Study <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pathway 3: Master's & PhD */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-5 border border-amber-400/30">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Master's & PhD Degrees</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Find post-graduate programs (M.Sc, MBA, MPH, PhD) with entrance exam guidelines (NGAT), thesis advisory, and evening/extension schedules.
              </p>
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                Postgraduate Portal <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Pathway 4: TVET & Technical Colleges */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 hover:border-emerald-400 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-5 border border-purple-400/30">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">TVET & Skill Colleges</h3>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                Practical level 1-5 diplomas in Information Technology, Construction, Electrical Works, Automotive, and Business Services.
              </p>
              <span className="text-[11px] text-purple-400 font-bold flex items-center gap-1">
                Technical Diplomas <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Platform Features & AI Advisor */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-[#059669] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Bot className="w-4 h-4" />
              <span>Next-Gen RAG AI Advisor</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight mb-6">
              Ask Anything About Ethiopian Universities in Your Native Language
            </h2>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              Our AI Academic Advisor uses Retrieval-Augmented Generation (RAG) powered by Google Gemini and official Ethiopian Ministry of Education datasets to give instant, precise answers.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0 font-bold">
                  አማ
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Amharic & Multilingual RAG Search</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Chat seamlessly in Amharic (አማርኛ), Afaan Oromoo, Tigrinya, or English.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Verified Ethiopian Document Context</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Vector embeddings index official curriculum docs, cut-offs, and campus facts.</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#059669] shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Personalized Admission Scoring</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Calculates your eligibility for AAU, ASTU, Hawassa, and private institutions.</p>
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
                    <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">EthioUni AI Academic Advisor</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ONLINE • ENGLISH & AMHARIC</span>
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
                    <strong className="text-emerald-400">EthioUni AI Academic Advisor</strong> — Powered by RAG Vector Search on Ethiopian University Data & Ministry of Education Criteria.
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

                {/* Suggested Questions Chips Row */}
                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="text-[11px] bg-[#1C2541] hover:bg-[#253259] text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer transition">
                    What are the admission requirements for AAU?
                  </span>
                  <span className="text-[11px] bg-[#1C2541] hover:bg-[#253259] text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer transition hidden sm:inline-block">
                    Which public unis excel in Engineering?
                  </span>
                </div>

                {/* Chat Input Bar Preview */}
                <div className="pt-2 flex items-center gap-2 bg-[#1C2541]/90 p-2.5 rounded-2xl border border-slate-700">
                  <input
                    type="text"
                    disabled
                    placeholder="Ask about university requirements, Grade 12 cut-offs..."
                    className="bg-transparent text-xs text-slate-300 placeholder-slate-500 w-full focus:outline-none px-2"
                  />
                  <div className="w-8 h-8 rounded-xl bg-[#059669] text-white flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                </div>

              </div>

              {/* Bottom Call to Action */}
              <div className="p-4 bg-[#1C2541]/60 border-t border-slate-800 text-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] text-white px-6 py-3 rounded-xl font-extrabold text-xs transition shadow-lg w-full cursor-pointer"
                >
                  <span>Start Chatting with AI Advisor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Student Testimonials */}
      <section className="bg-white py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-slate-900">What Ethiopian Students Say</h2>
            <p className="text-slate-500 mt-2 text-sm">Hear from students who discovered their university pathway through EthioUni.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <p className="text-slate-700 text-sm italic leading-relaxed mb-6">
                "Finding accredited private universities in Addis Ababa with exact Master's schedules was so easy using EthioUni. The Amharic AI assistant answered all my admission questions!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  Y
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Yohannes Tadesse</h4>
                  <p className="text-xs text-slate-500">M.Sc Applicant, Addis Ababa</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <p className="text-slate-700 text-sm italic leading-relaxed mb-6">
                "After taking the Grade 12 ESSLCE exam, I was confused about ASTU vs AAU cut-off points. EthioUni gave me verified requirements and campus dormitory details!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  H
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Hawani Bekele</h4>
                  <p className="text-xs text-slate-500">Software Engineering Student, ASTU</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <p className="text-slate-700 text-sm italic leading-relaxed mb-6">
                "The 3D interactive campus map and AI advisor helped me transition smoothly from Hawassa high school to undergraduate studies in Public Health."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                  K
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Kibrirom Gebremedhin</h4>
                  <p className="text-xs text-slate-500">Public Health Student, Hawassa Uni</p>
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
