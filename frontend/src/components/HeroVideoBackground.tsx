import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Award, Sparkles, GraduationCap, Users, BookOpen, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HeroVideoBackground: React.FC = () => {
  const { t } = useLanguage();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-emerald-950 py-20 text-white">
      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=1600"
          className="w-full h-full object-cover scale-105 filter brightness-75 transition-all duration-1000"
        >
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-students-walking-in-a-university-campus-41440-large.mp4"
            type="video/mp4"
          />
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-group-of-students-studying-together-41443-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dynamic Dark Emerald Animated Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/95 via-emerald-900/80 to-slate-950/90 backdrop-blur-[2px]"></div>

        {/* Subtle Animated Glowing Grid Overlay */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.4) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      {/* Floating Animated Badges in Background */}
      <div className="hidden lg:block absolute top-24 left-10 z-10 animate-bounce duration-[3000ms]">
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-2xl shadow-2xl">
          <div className="bg-emerald-500/30 p-2 rounded-xl text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-200">Admissions Open</p>
            <p className="text-sm font-bold text-white">2026/27 Academic Year</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-28 right-10 z-10 animate-pulse duration-[4000ms]">
        <div className="flex items-center gap-3 bg-emerald-900/60 backdrop-blur-md border border-emerald-500/30 px-4 py-2.5 rounded-2xl shadow-2xl">
          <div className="bg-amber-400/20 p-2 rounded-xl text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-200">AI Powered</p>
            <p className="text-sm font-bold text-white">Amharic & English Advisor</p>
          </div>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md text-emerald-300 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-8 shadow-inner hover:border-emerald-400/60 transition-all cursor-default">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Official Ethiopian Higher Education & University Portal</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight mb-6 leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-300 drop-shadow-sm">
          {t('heroTitle')}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-200 mb-10 max-w-3xl leading-relaxed font-light drop-shadow">
          {t('heroSubtitle')}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none mb-16">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-xl shadow-emerald-950/50 group cursor-pointer border border-emerald-400/30"
          >
            <span>{t('navRegister')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base border border-white/30 hover:border-white/60 bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white flex items-center justify-center cursor-pointer shadow-lg"
          >
            {t('navLogin')}
          </Link>

          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-sm border border-emerald-500/40 hover:bg-emerald-900/50 backdrop-blur-md transition-all text-emerald-200 flex items-center justify-center gap-2.5 cursor-pointer hover:text-white"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center text-white shadow-inner">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <span>Watch Campus Video</span>
          </button>
        </div>

        {/* Quick Stat Counter Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-5xl border-t border-emerald-500/20 pt-10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <GraduationCap className="w-5 h-5 mr-1" />
              <span className="text-2xl sm:text-3xl font-black">50+</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Public & Private Unis</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <Users className="w-5 h-5 mr-1" />
              <span className="text-2xl sm:text-3xl font-black">250K+</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Active Students</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <BookOpen className="w-5 h-5 mr-1" />
              <span className="text-2xl sm:text-3xl font-black">1,200+</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Degree & Master Programs</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Award className="w-5 h-5 mr-1" />
              <span className="text-2xl sm:text-3xl font-black">24/7</span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Ethiopian AI Advisor</p>
          </div>
        </div>

      </div>

      {/* Video Modal Preview */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-emerald-950 rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl">
            <div className="flex items-center justify-between p-4 px-6 border-b border-emerald-800/50 bg-emerald-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Ethiopian Higher Education Overview</h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50 transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Ethiopian Universities Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroVideoBackground;
