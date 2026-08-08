import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Bot } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HeroVideoBackground: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 py-16 lg:py-24 text-white">
      {/* Crystal Clear, High-Definition Background Video Container */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1541339907198-e08759dfc3ef?auto=format&fit=crop&q=80&w=1600"
          className="w-full h-full object-cover object-center filter brightness-100 contrast-105 transition-all duration-700 scale-100"
        >
          <source src="/assets/landing_page_video.mp4" type="video/mp4" />
          <source src="./assets/landing_page_video.mp4" type="video/mp4" />
          <source
            src="https://assets.mixkit.co/videos/preview/mixkit-students-walking-in-a-university-campus-41440-large.mp4"
            type="video/mp4"
          />
        </video>

        {/* Minimal Gradient Mask for Maximum Video Clarity */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-transparent to-slate-950/80"></div>
      </div>

      {/* Main Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight mb-6 leading-[1.15] text-white [text-shadow:_0_2px_16px_rgba(0,0,0,0.95)]">
          {t('heroTitle')}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-100 mb-10 max-w-3xl leading-relaxed font-medium [text-shadow:_0_2px_12px_rgba(0,0,0,0.95)]">
          Explore accredited Ethiopian universities, degree & master programs, Grade 12 ESSLCE criteria, and get instant guidance with our AI Academic Advisor.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-9 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 shadow-2xl shadow-black/90 group cursor-pointer border border-emerald-400/40"
          >
            <span>{t('navRegister')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto px-9 py-4 rounded-2xl font-black text-base border border-white/50 hover:border-white/80 bg-slate-900/80 hover:bg-slate-900 transition-all text-white flex items-center justify-center cursor-pointer shadow-2xl"
          >
            {t('navLogin')}
          </Link>
        </div>

      </div>

      {/* Solid Bold Watermark Cover Badge at Bottom Right */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex items-center gap-3 bg-slate-950/95 border-2 border-emerald-500/80 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl">
          <div className="bg-emerald-500/30 p-2.5 rounded-xl text-emerald-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <p className="text-xs font-black uppercase tracking-wider text-emerald-300">RAG AI Advisor</p>
            </div>
            <p className="text-xs font-extrabold text-white">Amharic & English Support</p>
            <p className="text-[11px] font-black text-amber-400 mt-0.5">24/7 Ethiopian AI Academic Advisor</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroVideoBackground;
