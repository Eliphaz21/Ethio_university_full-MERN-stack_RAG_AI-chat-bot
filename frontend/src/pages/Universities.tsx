import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { University } from '../types';
import { api } from '../services/api';
import { Search, MapPin, ArrowRight, Filter, School, X, ArrowUpDown } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedUniversityContent } from '../i18n/universityLocalization';
import { SEO, buildWebSiteSchema, buildFAQSchema } from '../components/SEO';
import CustomSelect from '../components/CustomSelect';
import { useDebounce } from '../hooks/useDebounce';
import { universityFilterSchema } from '../schemas/filterSchemas';

const Universities: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL sync state initializers
  const [searchTermInput, setSearchTermInput] = useState(() => searchParams.get('search') || '');
  const debouncedSearchTerm = useDebounce(searchTermInput, 300);

  const [selectedRegion, setSelectedRegion] = useState(() => searchParams.get('region') || 'All');
  const [selectedType, setSelectedType] = useState(() => searchParams.get('type') || 'All');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'established'>(
    () => (searchParams.get('sort') as any) || 'name_asc'
  );

  const [universities, setUniversities] = useState<University[]>([]);

  const { t, language } = useLanguage();

  // Sync state to URL search parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearchTerm) params.search = debouncedSearchTerm;
    if (selectedRegion !== 'All') params.region = selectedRegion;
    if (selectedType !== 'All') params.type = selectedType;
    if (sortBy !== 'name_asc') params.sort = sortBy;
    setSearchParams(params, { replace: true });
  }, [debouncedSearchTerm, selectedRegion, selectedType, sortBy, setSearchParams]);

  useEffect(() => {
    let mounted = true;
    async function loadUniversities() {
      try {
        const data = await api.getUniversities();
        if (!mounted) return;
        setUniversities(data as University[]);
      } catch (err) {
        console.error('Failed to load universities', err);
      }
    }

    loadUniversities();
    return () => { mounted = false; };
  }, []);

  const regions = useMemo(() => ['All', ...new Set(universities.map(u => u.location.region))], [universities]);
  const types = useMemo(() => ['All', ...new Set(universities.map(u => u.type))], [universities]);

  const regionOptions = useMemo(() => {
    return regions.map((r) => ({
      value: r,
      label: r === 'All' ? t('allRegions') : r,
    }));
  }, [regions, t]);

  const typeOptions = useMemo(() => {
    return types.map((item) => ({
      value: item,
      label: item === 'All' ? t('allTypes') : item === 'Public' ? t('publicUni') : item === 'Private' ? t('privateUni') : item,
    }));
  }, [types, t]);

  const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'established', label: 'Established Date' },
  ];

  const filteredUnis = useMemo(() => {
    const parsed = universityFilterSchema.safeParse({
      searchTerm: debouncedSearchTerm,
      selectedRegion,
      selectedType,
      sortBy,
    });

    const search = parsed.success ? parsed.data.searchTerm.toLowerCase() : '';

    let result = universities.filter(u => {
      const localized = getLocalizedUniversityContent(u, language);
      const matchesSearch = localized.name.toLowerCase().includes(search) ||
        u.name.toLowerCase().includes(search) ||
        u.location.city.toLowerCase().includes(search);
      const matchesRegion = selectedRegion === 'All' || u.location.region === selectedRegion;
      const matchesType = selectedType === 'All' || u.type === selectedType;
      return matchesSearch && matchesRegion && matchesType;
    });

    return result.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'established') return (b.established || 0) - (a.established || 0);
      return 0;
    });
  }, [universities, debouncedSearchTerm, selectedRegion, selectedType, sortBy, language]);

  const activeFiltersCount = (searchTermInput ? 1 : 0) + (selectedRegion !== 'All' ? 1 : 0) + (selectedType !== 'All' ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTermInput('');
    setSelectedRegion('All');
    setSelectedType('All');
    setSortBy('name_asc');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <SEO
        title={t('navUniversities')}
        description="Explore higher education institutions across Ethiopia including Addis Ababa University, ASTU, Hawassa, Mekelle, Gondar, and Jimma."
        keywords={['Ethiopian universities directory', 'Public universities Ethiopia', 'AAU Addis Ababa', 'ASTU Adama', 'MoGE ESSLCE cutoffs']}
        structuredData={[
          buildWebSiteSchema(),
          buildFAQSchema([
            {
              question: 'How do Grade 12 students get admitted to Ethiopian public universities?',
              answer: 'Admissions are managed through the Ministry of Education (MoGE) placement based on Grade 12 ESSLCE examination cut-off scores, choice options, and institution capacities.'
            },
            {
              question: 'What languages are supported on Ethio University Portal?',
              answer: 'The portal supports Amharic (አማርኛ), Afaan Oromoo, Tigrinya (ትግርኛ), Somali (Af-Somali), and English.'
            }
          ])
        ]}
      />
      {/* Header Section */}
      <div className="bg-[#2d6a4f] pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-6">{t('navUniversities')}</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('heroSearchPlaceholder')}
                value={searchTermInput}
                onChange={(e) => setSearchTermInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-10 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium text-sm"
              />
              {searchTermInput && (
                <button
                  onClick={() => setSearchTermInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <CustomSelect
                options={regionOptions}
                value={selectedRegion}
                onChange={setSelectedRegion}
                icon={<Filter className="w-4 h-4 text-emerald-600" />}
                placeholder={t('allRegions')}
              />
            </div>

            <div>
              <CustomSelect
                options={typeOptions}
                value={selectedType}
                onChange={setSelectedType}
                icon={<School className="w-4 h-4 text-emerald-600" />}
                placeholder={t('allTypes')}
              />
            </div>
          </div>

          {/* Sort & Active Filter Pills */}
          <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider">Active Filters:</span>
              {activeFiltersCount === 0 && (
                <span className="text-slate-400 italic">None</span>
              )}
              {searchTermInput && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-200">
                  Search: "{searchTermInput}"
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-900" onClick={() => setSearchTermInput('')} />
                </span>
              )}
              {selectedRegion !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-200">
                  Region: {selectedRegion}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-900" onClick={() => setSelectedRegion('All')} />
                </span>
              )}
              {selectedType !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full border border-emerald-200">
                  Type: {selectedType}
                  <X className="w-3.5 h-3.5 cursor-pointer hover:text-emerald-900" onClick={() => setSelectedType('All')} />
                </span>
              )}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-slate-500 font-bold hover:text-red-600 underline ml-2 cursor-pointer"
                >
                  Reset all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('navUniversities')}</h2>
            <p className="text-slate-500 text-sm mt-1">
              Showing <span className="font-bold text-emerald-700">{filteredUnis.length}</span> of {universities.length} institutions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredUnis.map((u) => {
            const localized = getLocalizedUniversityContent(u, language);
            return (
              <div key={u.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
                <Link to={`/university/${u.slug}`} className="relative h-64 overflow-hidden block">
                  <img
                    src={getOptimizedImageUrl(u.image, 800)}
                    alt={localized.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-[#2d6a4f] uppercase tracking-widest shadow-sm">
                      {u.type === 'Public' ? t('publicUni') : u.type === 'Private' ? t('privateUni') : u.type}
                    </div>
                  </div>
                </Link>
                <div className="p-8 flex-1 flex flex-col">
                  <Link to={`/university/${u.slug}`}>
                    <h3 className="text-2xl font-bold text-slate-900 leading-tight hover:text-[#2d6a4f] transition-colors mb-4">{localized.name}</h3>
                  </Link>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-slate-500 text-sm gap-2.5">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {u.location.city}, {u.location.region}
                    </div>
                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-medium">
                      {localized.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('established')} {u.established}</span>
                    <Link
                      to={`/university/${u.slug}`}
                      className="flex items-center gap-2 text-[#2d6a4f] font-bold text-sm hover:gap-3 transition-all"
                    >
                      {t('viewDetails')} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredUnis.length === 0 && (
          <div className="text-center py-28 bg-white rounded-3xl border border-slate-200 mt-6 p-8">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400 w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{t('noUniversitiesFound')}</h3>
            <p className="text-slate-500 text-sm mt-2">Try adjusting your search criteria or resetting filters.</p>
            <button
              onClick={clearAllFilters}
              className="mt-6 inline-flex items-center gap-2 bg-[#2d6a4f] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1b4332] transition-all cursor-pointer shadow-md"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Universities;
