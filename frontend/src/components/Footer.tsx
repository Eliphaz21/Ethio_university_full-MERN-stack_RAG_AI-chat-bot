import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Globe,
  ExternalLink,
  Heart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-emerald-900/40 relative overflow-hidden">
      {/* Background Decorative Radial Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-60"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand & Overview (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#059669] to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-2xl font-serif font-black text-white tracking-tight">
                Ethio<span className="text-[#059669]">Uni</span>
              </span>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-light">
              Ethiopia’s comprehensive higher education portal. Explore 50+ public and accredited private universities, degree programs, entrance criteria, and chat with our 24/7 RAG AI Assistant.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[11px] font-bold px-3 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Official MoGE Criteria Aligned
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Explore Portal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/universities" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  All Universities Directory
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Student & Admin Portal Log In
                </Link>
              </li>
              <li>
                <a href="#unis-grid" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Grade 12 Cutoff Points
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Programs */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Institutions & Degrees
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <span className="text-slate-300 font-semibold">Public Universities</span> (AAU, ASTU, JU, BDU)
              </li>
              <li>
                <span className="text-slate-300 font-semibold">Accredited Private Colleges</span> (St. Mary's, Unity)
              </li>
              <li>
                <span className="text-slate-300 font-semibold">Postgraduate Programs</span> (Master's & PhD)
              </li>
              <li>
                <span className="text-slate-300 font-semibold">TVET Diplomas</span> (Level 1-5 Technical)
              </li>
              <li>
                <span className="text-slate-300 font-semibold">Remedial Programs</span> (MoGE Direct Entries)
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Ethiopian Hotline */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Bole Sub-City, Ward 03, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-emerald-300">+251 911 000 000 / +251 116 000 000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:support@ethiouni.edu.et" className="hover:underline text-slate-300">
                  support@ethiouni.edu.et
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mon - Sat: 8:30 AM - 5:30 PM (EAT)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © {currentYear} <span className="text-slate-300 font-semibold">EthioUni Portal</span>. All rights reserved. Empowering Ethiopian Students Across Public & Private Higher Education.
          </p>

          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Accessibility</span>
            <span className="flex items-center gap-1 text-emerald-400">
              Made with <Heart className="w-3 h-3 fill-current text-rose-500" /> for Ethiopia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
