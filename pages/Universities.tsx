
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { University } from '../types';
import { api } from '../services/api';
import { Search, MapPin, ArrowRight, Filter, Globe, School } from 'lucide-react';

const Universities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [universities, setUniversities] = useState<University[]>([]);

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

  const filteredUnis = universities.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || u.location.region === selectedRegion;
    const matchesType = selectedType === 'All' || u.type === selectedType;
    return matchesSearch && matchesRegion && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header Section */}
      <div className="bg-[#2d6a4f] pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-6">University Directory</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Browse through Ethiopia's top-tier higher education institutions and find your future campus.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-11 pr-4 text-slate-700 outline-none appearance-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              >
                <option value="All">All Regions</option>
                {regions.filter(r => r !== 'All').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-11 pr-4 text-slate-700 outline-none appearance-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              >
                <option value="All">All Types</option>
                {types.filter(t => t !== 'All').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Institutions</h2>
            <p className="text-slate-500 text-sm mt-1">Showing {filteredUnis.length} universities found</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredUnis.map((u) => (
            <div key={u.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col">
              <Link to={`/university/${u.slug}`} className="relative h-64 overflow-hidden block">
                <img
                  src={u.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80'}
                  alt={u.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                  <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-[#2d6a4f] uppercase tracking-widest shadow-sm">
                    {u.type}
                  </div>
                </div>
              </Link>
              <div className="p-8 flex-1 flex flex-col">
                <Link to={`/university/${u.slug}`}>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight hover:text-[#2d6a4f] transition-colors mb-4">{u.name}</h3>
                </Link>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center text-slate-500 text-sm gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {u.location.city}, {u.location.region}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm gap-2.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    {u.website.replace('http://', '').replace('www.', '')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">EST. {u.established}</span>
                  <Link
                    to={`/university/${u.slug}`}
                    className="flex items-center gap-2 text-[#2d6a4f] font-bold text-sm hover:gap-3 transition-all"
                  >
                    Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUnis.length === 0 && (
          <div className="text-center py-40">
            <div className="bg-slate-200/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-400 w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">No institutions found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedRegion('All'); setSelectedType('All'); }}
              className="mt-8 text-emerald-700 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Universities;
