import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { University, User } from '../types';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedUniversityContent } from '../i18n/universityLocalization';
import { SEO, buildWebSiteSchema } from '../components/SEO';
import HeroVideoBackground from '../components/HeroVideoBackground';
import ScrollAnimatedSections from '../components/ScrollAnimatedSections';

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
  const { t, language } = useLanguage();

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
      <SEO
        title={user ? t('navHome') : undefined}
        description={t('heroSubtitle')}
        keywords={['Ethiopian university portal', 'ESSLCE admission', 'university directory Ethiopia', 'AAU', 'ASTU', 'Private Colleges Ethiopia']}
        structuredData={buildWebSiteSchema()}
      />

      {!user ? (
        <>
          {/* 1. Ultra-Professional Video Hero Background */}
          <HeroVideoBackground />

          {/* 2. Rich Scroll Animated Sections (Public & Private Pathways, Master's, AI Guidance, Testimonials) */}
          <ScrollAnimatedSections />
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
              {filteredUnis.map((u) => {
                const localized = getLocalizedUniversityContent(u, language);
                return (
                  <div key={u.id} className="group bg-white rounded-3xl border border-slate-200/70 overflow-hidden hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 flex flex-col">
                    <Link to={`/university/${u.slug}`} className="relative h-56 overflow-hidden block">
                      <img
                        src={getOptimizedImageUrl(u.image, 800)}
                        alt={localized.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-[#059669] uppercase tracking-widest shadow-sm">
                        {u.type === 'Public' ? t('publicUni') : u.type === 'Private' ? t('privateUni') : u.type}
                      </div>
                    </Link>
                    <div className="p-6 flex-1 flex flex-col">
                      <Link to={`/university/${u.slug}`}>
                        <h3 className="text-xl font-bold text-slate-900 leading-snug hover:text-[#059669] transition-colors mb-2">{localized.name}</h3>
                      </Link>
                      <div className="flex items-center text-slate-500 text-xs mb-4 gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                        {u.location.city}, {u.location.region}
                      </div>
                      <p className="text-slate-600 text-xs line-clamp-2 mb-6 flex-1 leading-relaxed">
                        {localized.description}
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
                );
              })}
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
