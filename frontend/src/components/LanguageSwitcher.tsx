import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '../i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { language, setLanguage, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-slate-700 hover:text-[#059669] text-xs sm:text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 cursor-pointer"
        aria-expanded={isOpen}
        aria-label="Select Language / ቋንቋ ይምረጡ"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{currentLanguageOption.flag}</span>
          <span className="font-bold tracking-wide">{currentLanguageOption.nativeName}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#059669]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl border border-slate-100/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-[#059669]" /> Select Language
            </span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Ethiopia 🇪🇹
            </span>
          </div>

          <div className="space-y-0.5 px-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#059669] font-bold shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg leading-none shrink-0">{lang.flag}</span>
                    <div className="truncate flex flex-col">
                      <span className="font-semibold text-slate-800 group-hover:text-[#059669] transition-colors">
                        {lang.nativeName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {lang.name} • {lang.script}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#059669] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
