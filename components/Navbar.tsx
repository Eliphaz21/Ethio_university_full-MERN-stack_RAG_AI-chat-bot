
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
import {
  LayoutDashboard,
  User as UserIcon,
  ChevronDown,
  Mail,
  LogOut,
  Shield
} from 'lucide-react';

const LOGO_URL = encodeURI(
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional Ethiopian university education AI logo: stylized Ethiopia map colored with the Ethiopian flag green yellow red horizontal stripes with blue circle and yellow star of David in the center, black graduation cap mortarboard on top of the map, open book below with pages colored in green yellow red and Ethiopian flag rainbow curve arc, friendly smiling AI robot head to the right with blue digital network nodes connecting lines, historical Ethiopian obelisk obelisks and university building dome towers to the left, white background, vibrant modern flat illustration style, academic excellence theme, clean vector logo quality, symmetrical composition'
);

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

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
    <nav className="sticky top-0 z-50 bg-[#f8fafc]/95 backdrop-blur-xl border-b border-slate-200/80 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded-xl pr-2"
              aria-label="EthioUni Portal Home"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-amber-400/20 to-rose-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-110"></div>
                <img
                  src={LOGO_URL + '&image_size=square_hd'}
                  alt="EthioUni Portal Logo"
                  loading="eager"
                  decoding="async"
                  className="h-14 w-auto object-contain drop-shadow-[0_8px_20px_rgba(45,106,79,0.25)] group-hover:scale-[1.03] group-hover:drop-shadow-[0_10px_28px_rgba(45,106,79,0.35)] transition-all duration-300 ease-out"
                  draggable={false}
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.onerror = null;
                    el.style.display = 'none';
                    const sib = el.nextElementSibling as HTMLElement | null;
                    if (sib) sib.style.display = 'flex';
                  }}
                />
                <div
                  style={{ display: 'none' }}
                  className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 via-amber-500 to-rose-600 items-center justify-center p-1 shadow-lg"
                >
                  <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                    <span className="bg-gradient-to-br from-emerald-700 to-amber-600 bg-clip-text text-transparent text-lg font-black tracking-tight">EU</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-10 text-sm font-bold text-slate-600">
            {user && (
              <Link to="/" className={`flex items-center gap-2 hover:text-[#2d6a4f] transition ${isActive('/') ? 'text-[#2d6a4f]' : ''}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-8 relative" ref={dropdownRef}>
                {user.role === 'admin' && (
                  <Link to="/admin" className={`hover:text-[#2d6a4f] transition flex items-center gap-2 ${isActive('/admin') ? 'text-[#2d6a4f]' : ''}`}>
                    <Shield className="w-4 h-4" /> Admin Panel
                  </Link>
                )}

                <div className="h-4 w-px bg-slate-200"></div>

                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-4 group focus:outline-none"
                >
                  <div className="flex flex-col items-end leading-none">
                    <span className="text-slate-900 font-black tracking-tight group-hover:text-[#2d6a4f] transition-colors">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      {user.role === 'admin' ? 'Administrator' : 'Scholar Profile'}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isProfileOpen ? 'rotate-180 text-[#2d6a4f]' : ''}`} />
                    </span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isProfileOpen ? 'bg-[#2d6a4f] text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'}`}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-4 w-72 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-6 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#2d6a4f] rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <span className="text-lg font-black">{user.username.substring(0, 2).toUpperCase()}</span>
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

                    <div className="p-3 bg-slate-50 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white text-red-600 hover:bg-red-50 rounded-2xl transition border border-slate-200 font-black text-[10px] uppercase tracking-widest shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <Link to="/login" className="text-slate-700 hover:text-[#2d6a4f] transition uppercase tracking-widest text-[11px] font-black">Sign In</Link>
                <Link to="/register" className="bg-[#2d6a4f] text-white px-8 py-3 rounded-xl hover:bg-[#1b4332] transition shadow-lg text-[11px] font-black uppercase tracking-widest">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
