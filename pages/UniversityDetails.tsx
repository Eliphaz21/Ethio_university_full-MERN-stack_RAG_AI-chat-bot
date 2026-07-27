
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Department, University } from '../types';
import {
  Globe, Mail, Phone, MapPin,
  ArrowLeft, GraduationCap,
  ChevronLeft, ChevronRight, Home as HomeIcon,
  ChevronRight as BreadcrumbSeparator, School,
  Layers, Map as MapIcon, BookOpen, Info,
  Clock, Sparkles
} from 'lucide-react';

interface UniversityDetailsProps {
  universities: University[];
}

const UniversityDetails: React.FC<UniversityDetailsProps> = ({ universities }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const uni = universities.find(u => u.slug === slug);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  if (!uni) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">University not found</h2>
        <Link to="/" className="text-indigo-600 mt-4 block">Back to Home</Link>
      </div>
    );
  }

  const galleryImages = [
    uni.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
  ];

  const coordinates = uni.coordinates || uni.location.coordinates || { lat: 0, lng: 0 };
  const colleges = uni.colleges || [];
  const campuses = uni.campuses || [];
  const facilities = uni.facilities || [];

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <div className="bg-white border-b border-slate-100 py-4 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-emerald-700 hover:text-white rounded-xl text-slate-700 font-bold text-sm transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <div className="hidden sm:block h-6 w-px bg-slate-200"></div>
            <nav className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Link to="/" className="flex items-center gap-1 hover:text-[#2d6a4f] transition">
                <HomeIcon className="w-3 h-3" /> Dashboard
              </Link>
              <BreadcrumbSeparator className="w-3 h-3 text-slate-300" />
              <span className="text-slate-900 font-bold">{uni.name}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">{uni.location.city}</span>
          </div>
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="relative w-full h-[50vh] md:h-[65vh] bg-slate-900 group overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            key={currentImgIndex}
            src={galleryImages[currentImgIndex]}
            className="w-full h-full object-cover transition-opacity duration-700 animate-in fade-in"
            alt={uni.name}
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">EST. {uni.established}</span>
              <span className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">{uni.type}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl">{uni.name}</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-white font-bold shadow-xl">
                <MapPin className="w-5 h-5 text-emerald-400" /> {uni.location.city}
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 text-white font-bold shadow-xl">
                <Layers className="w-5 h-5 text-emerald-400" /> {uni.colleges.length} Colleges
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-between px-4">
          <button onClick={prevImg} className="pointer-events-auto p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 shadow-2xl"><ChevronLeft className="w-8 h-8" /></button>
          <button onClick={nextImg} className="pointer-events-auto p-4 bg-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white/30 transition-all opacity-0 group-hover:opacity-100 shadow-2xl"><ChevronRight className="w-8 h-8" /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">

            {/* Overview */}
            <section>
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Info className="w-6 h-6" /></div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Academic Overview</h2>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">{uni.description}</p>
              </div>
            </section>

            {/* Campuses Section */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><MapIcon className="w-6 h-6" /></div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Campus Network</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campuses.map((campus, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4 group hover:border-emerald-200 transition-all hover:shadow-md">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{campus}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Colleges and Departments */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><School className="w-6 h-6" /></div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Colleges & Programs</h2>
              </div>
              <div className="space-y-8">
                {colleges.map((college, idx) => (
                  <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                    <div className="bg-slate-900 p-8 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-emerald-400"><Layers className="w-6 h-6" /></div>
                        <h3 className="text-white font-black text-xl tracking-tight">{college.name}</h3>
                      </div>
                      <span className="bg-white/10 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {college.departments.length} Departments
                      </span>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {college.departments.map((dept, dIdx) => (
                          <button
                            key={dIdx}
                            onClick={() => setSelectedDept(dept)}
                            className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-emerald-50 hover:border-emerald-200 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                              <span className="text-sm font-bold text-slate-700 group-hover/item:text-slate-900">{dept.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-emerald-500 group-hover/item:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Map Section */}
              <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-xl overflow-hidden">
                <div className="h-64 rounded-[2rem] overflow-hidden bg-slate-100 relative grayscale hover:grayscale-0 transition-all duration-700">
                  <iframe
                    title="Campus Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=14&output=embed`}
                    allowFullScreen
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <MapIcon className="w-3 h-3 text-emerald-600" /> Interactive Map
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><MapPin className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Coordinates</p>
                    <p className="text-sm font-bold text-slate-700">{coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E</p>
                  </div>
                </div>
              </div>

              {/* Contact Hub */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-slate-800">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-4">Communication Hub</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><Globe className="w-6 h-6 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Portal</p>
                      <p className="font-bold truncate text-sm">{uni.website.replace('http://', '')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><Mail className="w-6 h-6 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inquiries</p>
                      <p className="font-bold text-sm">{uni.contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center"><Phone className="w-6 h-6 text-emerald-400" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Office Hotline</p>
                      <p className="font-bold text-sm">{uni.phone}</p>
                    </div>
                  </div>
                </div>
                <a
                  href={uni.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-10 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all"
                >
                  Visit Portal <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Facilities */}
              <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-black uppercase tracking-tighter mb-6">Campus Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((f, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-100">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedDept && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white relative">
              <button
                onClick={() => setSelectedDept(null)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
              >
                <ChevronLeft className="w-5 h-5 rotate-90" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500 rounded-lg"><BookOpen className="w-5 h-5 text-white" /></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Department Profile</span>
              </div>
              <h3 className="text-3xl font-black tracking-tight">{selectedDept.name}</h3>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Study Period</span>
                  </div>
                  <p className="text-xl font-black text-slate-900">{selectedDept.duration}</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Entry Level</span>
                  </div>
                  <p className="text-xl font-black text-emerald-900">Undergraduate</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Academic Scope</h4>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedDept.description || `${selectedDept.name} at ${uni.name} provides comprehensive training designed to equip students with both theoretical knowledge and practical industry skills. The curriculum follows the standard national higher education framework for ${selectedDept.duration}.`}
                </p>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-xl"
              >
                Return to Directory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityDetails;
