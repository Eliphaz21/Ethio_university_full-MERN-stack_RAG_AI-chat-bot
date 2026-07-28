
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { University, User } from '../types';
import { Search, GraduationCap, MapPin, BookOpen, Users, ArrowRight, Award, School, Filter, Bot, Sparkles } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

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
  const regions = useMemo(() => ['All', ...new Set(universities.map(u => u.location.region))], [universities]);
  const types = useMemo(() => ['All', ...new Set(universities.map(u => u.type))], [universities]);

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
    <div className="min-h-screen bg-[#fcfdfd]">
      {!user ? (
        <>
          <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="/assets/unionpic.jpg"
                className="w-full h-full object-cover"
                alt="Ethiopian University Campus"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-emerald-800/50"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
              <h1 className="text-5xl md:text-8xl font-serif font-medium mb-4 leading-tight">
                Academic Excellence in
              </h1>
              <h1 className="text-5xl md:text-8xl font-serif font-medium mb-8 text-[#e9c46a]">
                The Land of Origins
              </h1>

              <p className="text-lg md:text-xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                Explore Ethiopia's most prestigious institutions. From historical research centers to modern tech hubs, find your path to success.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="bg-[#e9c46a] text-emerald-950 px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#f4a261] transition-all shadow-xl group"
                >
                  Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 rounded-xl font-bold border border-white/40 hover:bg-white/10 backdrop-blur-sm transition-all text-white"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </section>

          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-serif font-bold text-slate-900 uppercase tracking-tight">Ethiopia's Academic Heritage</h2>
                <div className="h-1.5 w-24 bg-[#e9c46a] mx-auto mt-4 rounded-full"></div>
                <p className="text-slate-500 mt-6 max-w-2xl mx-auto text-lg">
                  Ethiopia has a long-standing history of higher learning, blending traditional wisdom with modern scientific advancements across the nation.
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
                  <div className="absolute -bottom-8 -right-8 bg-emerald-700 text-white p-8 rounded-3xl shadow-xl z-20 hidden lg:block">
                    <Award className="w-10 h-10 mb-2 text-[#e9c46a]" />
                    <p className="font-bold text-xl leading-tight">Leading Research<br />Centers</p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="shrink-0 bg-emerald-50 p-4 rounded-2xl h-fit text-emerald-700">
                      <School className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Historical Institutions</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Addis Ababa University and Gondar Public Health College represent the foundational pillars of education, serving the nation for over 70 years.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="shrink-0 bg-emerald-50 p-4 rounded-2xl h-fit text-emerald-700">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">STEM Innovation</h3>
                      <p className="text-slate-600 leading-relaxed">
                        Modern science and technology universities like ASTU and AAiT are driving Ethiopia's industrial transformation through specialized engineering and applied sciences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="pb-20">
          <div className="bg-[#2d6a4f] pt-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-1 bg-[#e9c46a] rounded-full"></div>
                    <span className="text-emerald-100 font-black uppercase tracking-[0.2em] text-xs">University Dashboard</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif font-medium text-white">
                    Welcome back, {user.username}
                  </h2>
                  <p className="text-emerald-100/80 mt-4 text-lg max-w-2xl">
                    Explore the comprehensive database of Ethiopia's higher learning institutions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition" />
                  <input
                    type="text"
                    placeholder="Search by name, city, or faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4.5 pl-14 pr-8 text-slate-900 placeholder-slate-500 outline-none focus:bg-white focus:border-emerald-500/20 transition-all shadow-inner text-lg"
                  />
                </div>

                <div className="relative group">
                  <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-emerald-600 transition" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4.5 pl-12 pr-6 text-slate-700 outline-none appearance-none focus:bg-white focus:border-emerald-500/20 transition-all shadow-inner text-lg font-medium cursor-pointer"
                  >
                    <option value="All">All Regions</option>
                    {regions.filter(r => r !== 'All').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="relative group">
                  <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-emerald-600 transition" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4.5 pl-12 pr-6 text-slate-700 outline-none appearance-none focus:bg-white focus:border-emerald-500/20 transition-all shadow-inner text-lg font-medium cursor-pointer"
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

          <section id="unis-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Institutions</h2>
                <p className="text-slate-500 text-sm mt-1">Found {filteredUnis.length} universities matching your criteria</p>
              </div>
              {searchTerm || selectedRegion !== 'All' || selectedType !== 'All' ? (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedRegion('All'); setSelectedType('All'); }}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                >
                  Reset Filters
                </button>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredUnis.map((u) => (
                <div key={u.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col">
                  <Link to={`/university/${u.slug}`} className="relative h-64 overflow-hidden block">
                    <img
                      src={getOptimizedImageUrl(u.image, 800)}
                      alt={u.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black text-emerald-700 uppercase tracking-widest shadow-sm">
                      {u.type}
                    </div>
                  </Link>
                  <div className="p-8 flex-1 flex flex-col">
                    <Link to={`/university/${u.slug}`}>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight hover:text-emerald-700 transition-colors mb-3">{u.name}</h3>
                    </Link>
                    <div className="flex items-center text-slate-500 text-sm mb-6 gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      {u.location.city}, {u.location.region}
                    </div>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-8 flex-1 leading-relaxed">
                      {u.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Est. {u.established}</span>
                      <Link
                        to={`/university/${u.slug}`}
                        className="flex items-center gap-2 text-emerald-700 font-bold text-sm hover:gap-3 transition-all"
                      >
                        University Details <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredUnis.length === 0 && (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="text-slate-300 w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">No institutions found</h3>
                <p className="text-slate-500 mt-2">Try adjusting your search terms or filters.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedRegion('All'); setSelectedType('All'); }}
                  className="mt-6 bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-800 transition shadow-lg"
                >
                  Show All Universities
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
