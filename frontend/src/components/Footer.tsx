import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-emerald-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-800">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#059669] to-emerald-400 flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-2xl font-serif font-extrabold text-white tracking-tight">
                Ethio <span className="text-[#059669]">University</span>
              </span>
            </Link>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-light">
              {t('footerTagline')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link to="/universities" className="hover:text-emerald-400 transition-colors">
                  {t('navUniversities')}
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-400 transition-colors">
                  {t('navRegister')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  {t('navLogin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Direct Contact Information */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              {t('directContact')}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+251975384819" className="font-mono hover:text-emerald-400 transition">
                  +251 975 384 819
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:eliphazyab@gmail.com" className="hover:text-emerald-400 transition">
                  eliphazyab@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Addis Ababa, Ethiopia</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © {currentYear} <span className="text-slate-300 font-semibold">Ethio University</span>. {t('allRightsReserved')}
          </p>

          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span className="hover:text-slate-200 transition cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-200 transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
