import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, University } from '../types';
import {
  LayoutDashboard,
  User as UserIcon,
  ChevronDown,
  Mail,
  LogOut,
  Shield,
  UserPlus,
  LogIn,
  Search,
  MapPin,
  GraduationCap,
  Sparkles,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  universities?: University[];
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  selectedRegion?: string;
  setSelectedRegion?: (val: string) => void;
  selectedType?: string;
  setSelectedType?: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  universities = [],
  searchTerm = '',
  setSearchTerm,
  selectedRegion = 'All',
  setSelectedRegion,
  selectedType = 'All',
  setSelectedType
}) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();
  const isActive = (path: string) => location.pathname === path;
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isDashboardPage = location.pathname === '/';

  const regions = useMemo(() => ['All', ...new Set(universities.map(u => u.location.region))], [universities]);
  const types = useMemo(() => ['All', ...new Set(universities.map(u => u.type))], [universities]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-[#f8fafc]/95 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300 py-1.5">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18 gap-4">
          
          {/* Top-Left Logo & Title Container */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40 rounded-2xl py-1 transition-all"
              aria-label="Ethio University Portal Home"
            >
              {/* Prominent Large Logo Image */}
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-2 rounded-2xl bg-[#059669]/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src="/assets/logo.png?v=3"
                  alt="Ethio University Logo"
                  loading="eager"
                  className="block h-20 md:h-24 lg:h-28 w-auto min-w-[84px] object-contain max-h-[140px] drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  style={{ imageRendering: 'auto' }}
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.onerror = null;
                    el.style.display = 'none';
                    const fallback = el.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  style={{ display: 'none' }}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-[#059669] via-amber-500 to-rose-600 items-center justify-center p-0.5 shadow-md"
                >
                  <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                    <span className="bg-gradient-to-br from-[#059669] to-amber-600 bg-clip-text text-transparent text-2xl font-black tracking-tight">EU</span>
                  </div>
                </div>
              </div>

              {/* Standard Brand Text */}
              <div className="flex flex-col justify-center">
                <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 leading-tight group-hover:text-[#059669] transition-colors">
                  Ethio <span className="text-[#059669] font-extrabold">University</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none mt-1">
                  Higher Education Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Sleek Perfectly-Proportioned Integrated Filter Toolbar */}
          {user && isDashboardPage && setSearchTerm && setSelectedRegion && setSelectedType && (
            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-4 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
              {/* Search Field */}
              <div className="relative flex-1 flex items-center h-10 bg-white rounded-xl px-3 border border-slate-200/60 focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-[#059669]/10 transition-all shadow-sm">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholderNav')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 outline-none"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Region Filter */}
              <div className="relative flex items-center h-10 bg-white rounded-xl px-3 border border-slate-200/60 shrink-0 w-36 focus-within:border-[#059669] shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-[#059669] shrink-0 mr-2 pointer-events-none" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer pr-4"
                >
                  <option value="All">{t('allRegions')}</option>
                  {regions.filter(r => r !== 'All').map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>

              {/* Type Filter */}
              <div className="relative flex items-center h-10 bg-white rounded-xl px-3 border border-slate-200/60 shrink-0 w-32 focus-within:border-[#059669] shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-[#059669] shrink-0 mr-2 pointer-events-none" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none appearance-none cursor-pointer pr-4"
                >
                  <option value="All">{t('allTypes')}</option>
                  {types.filter(item => item !== 'All').map(item => (
                    <option key={item} value={item}>{item === 'Public' ? t('publicUni') : item === 'Private' ? t('privateUni') : item}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Right Navigation & User Actions (Top-Right) */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-sm font-bold text-slate-700 shrink-0">
            {/* Ethiopian Language Switcher */}
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-4 sm:gap-6 relative" ref={dropdownRef}>
                <Link to="/" className={`hidden sm:flex items-center gap-2 hover:text-[#059669] transition ${isActive('/') ? 'text-[#059669]' : ''}`}>
                  <LayoutDashboard className="w-4 h-4" /> {t('navHome')}
                </Link>

                <Link to="/hub" className={`hidden sm:flex items-center gap-2 hover:text-[#059669] transition ${isActive('/hub') ? 'text-[#059669]' : ''}`}>
                  <Sparkles className="w-4 h-4" /> {t('navHub')}
                </Link>

                {['admin', 'agent'].includes(user.role) && (
                  <Link to="/admin" className={`hidden sm:flex hover:text-[#059669] transition items-center gap-2 ${isActive('/admin') ? 'text-[#059669]' : ''}`}>
                    <Shield className="w-4 h-4" /> {t('navAdmin')}
                  </Link>
                )}

                <div className="h-4 w-px bg-slate-200"></div>

                {/* Top-Right User Profile Trigger */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 group focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="flex flex-col items-end leading-none">
                    <span className="text-slate-900 font-black tracking-tight group-hover:text-[#059669] transition-colors">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      {user.role === 'admin' ? 'Administrator' : user.role === 'agent' ? 'Operations Agent' : 'My Profile'}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-[#059669]' : ''}`} />
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${isProfileOpen ? 'bg-[#059669] text-white shadow-lg ring-2 ring-[#059669]/30' : 'bg-emerald-50 text-[#059669] group-hover:bg-[#059669] group-hover:text-white'}`}>
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-5 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-[#059669] rounded-2xl flex items-center justify-center text-white shadow-md">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <span className="text-base font-black">{user.username.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-slate-900 font-black truncate text-sm">{user.username}</h4>
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
                      {/* My Profile Link */}
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-2xl transition font-bold text-xs uppercase tracking-wider shadow-sm"
                      >
                        <UserIcon className="w-4 h-4" /> {t('navProfile')}
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-red-600 hover:bg-red-50 rounded-2xl transition border border-slate-200 font-black text-[10px] uppercase tracking-widest shadow-sm cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> {t('navLogout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Unauthenticated Actions */
              <div className="flex items-center gap-3">
                <Link to="/hub" className={`hidden sm:flex items-center gap-2 hover:text-[#059669] transition mr-2 ${isActive('/hub') ? 'text-[#059669]' : ''}`}>
                  <Sparkles className="w-4 h-4" /> {t('navHub')}
                </Link>
                {isLoginPage ? (
                  <Link
                    to="/register"
                    className="bg-[#059669] hover:bg-[#047857] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-900/10 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t('navRegister')}</span>
                  </Link>
                ) : isRegisterPage ? (
                  <Link
                    to="/login"
                    className="bg-[#059669] hover:bg-[#047857] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-900/10 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{t('navLogin')}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      to="/login"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{t('navLogin')}</span>
                    </Link>
                    <Link
                      to="/register"
                      className="bg-[#059669] hover:bg-[#047857] active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-emerald-900/10 flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{t('navRegister')}</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
