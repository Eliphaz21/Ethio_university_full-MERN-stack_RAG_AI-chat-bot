import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { University, User } from '../types';
import { Search, MapPin, BookOpen, ArrowRight, Award, School } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';

interface HomeProps {
  user: User | null;
  universities: University[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedRegion: string;
  setSelectedRegion: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
}

const Home: React.FC<HomeProps> = ({
  user,
  universities,
  searchTerm,
  setSearchTerm,
  selectedRegion,
  setSelectedRegion,
  selectedType,
  setSelectedType
}) => {
  const { t } = useLanguage();

  const filteredUnis = useMemo(() => {
    return universities.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.faculties || []).some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRegion = selectedRegion === 'All' || u.location.region === selectedRegion;
      const matchesType = selectedType === 'All' || u.type === selectedType;
      return matchesSearch && matchesRegion && matchesType;
    });
  }, [searchTerm, selectedRegion, selectedType, universities]);

  return (
    <div className="min-h-screen bg-[#FBF7F1]">
      {!user ? (
        <>
          {/* Public Landing Hero for Unauthenticated Visitors */}
          <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=1600"
                className="w-full h-full object-cover"
                alt="Ethiopian University Campus"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-800/50"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
              <h1 className="text-4xl md:text-7xl font-serif font-bold mb-4 leading-tight">
                {t('heroTitle')}
              </h1>

              <p className="text-lg md:text-xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="bg-[#059669] text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#047857] transition-all shadow-xl group cursor-pointer"
                >
                  {t('navRegister')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 rounded-xl font-bold border border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all text-white cursor-pointer"
                >
                  {t('navLogin')}
                </Link>
              </div>
            </div>
          </section>

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-serif font-bold text-slate-900 uppercase tracking-tight">{t('whyChooseTitle')}</h2>
                <div className="h-1.5 w-24 bg-[#059669] mx-auto mt-4 rounded-full"></div>
                <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-lg">
                  {t('whyChooseSub')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-emerald-50 rounded-full z-0"></div>
                  <img
                    src="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=1200"
                    alt="Campus Library"
                    className="relative z-10 rounded-[3rem] shadow-2xl border-8 border-white"
                  />
                  <div className="absolute -bottom-8 -right-8 bg-[#059669] text-white p-8 rounded-3xl shadow-xl z-20 hidden lg:block">
                    <Award className="w-10 h-10 mb-2 text-[#e9c46a]" />
                    <p className="font-bold text-xl leading-tight">{t('heroStatAI')}</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="shrink-0 bg-emerald-50 p-4 rounded-2xl h-fit text-[#059669]">
                      <School className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('feature1Title')}</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {t('feature1Desc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="shrink-0 bg-emerald-50 p-4 rounded-2xl h-fit text-[#059669]">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('feature2Title')}</h3>
                      <p className="text-slate-600 leading-relaxed">
                        {t('feature2Desc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Authenticated Dashboard View */
        <div className="pb-16 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top-Left Welcome Title Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('loginTitle')}, <span className="text-[#059669]">{user.username}</span>
              </h1>
            </div>

            {(searchTerm || selectedRegion !== 'All' || selectedType !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedRegion('All'); setSelectedType('All'); }}
                className="text-[#059669] font-bold text-xs hover:underline bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('clearFilters')}</span>
              </button>
            )}
          </div>

          {/* Universities Grid Section */}
          <section id="unis-grid">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredUnis.map((u) => (
                <div key={u.id} className="group bg-white rounded-3xl border border-slate-200/70 overflow-hidden hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 flex flex-col">
                  <Link to={`/university/${u.slug}`} className="relative h-56 overflow-hidden block">
                    <img
                      src={getOptimizedImageUrl(u.image, 800)}
                      alt={u.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#059669] uppercase tracking-widest shadow-sm">
                      {u.type === 'Public' ? t('publicUni') : u.type === 'Private' ? t('privateUni') : u.type}
                    </div>
                  </Link>
                  <div className="p-6 flex-1 flex flex-col">
                    <Link to={`/university/${u.slug}`}>
                      <h3 className="text-xl font-bold text-slate-900 leading-snug hover:text-[#059669] transition-colors mb-2">{u.name}</h3>
                    </Link>
                    <div className="flex items-center text-slate-500 text-xs mb-4 gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                      {u.location.city}, {u.location.region}
                    </div>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-6 flex-1 leading-relaxed">
                      {u.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('established')} {u.established}</span>
                      <Link
                        to={`/university/${u.slug}`}
                        className="flex items-center gap-1.5 text-[#059669] font-bold text-xs hover:gap-2 transition-all"
                      >
                        {t('viewDetails')} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredUnis.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search className="text-slate-400 w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('noUniversitiesFound')}</h3>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedRegion('All'); setSelectedType('All'); }}
                  className="mt-5 bg-[#059669] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#047857] transition shadow-md cursor-pointer"
                >
                  {t('clearFilters')}
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Home;
