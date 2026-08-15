import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, X, ShieldAlert, Sparkles } from 'lucide-react';

export interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionText?: string;
}

export const AuthRequiredModal: React.FC<AuthRequiredModalProps> = ({
  isOpen,
  onClose,
  title = 'Authentication Required',
  message = 'Sign in or register an account to post events, leave comments, and participate in the Ethio University academic community.',
  actionText = 'Post Events & Leave Comments',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-center overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-100 to-teal-50 text-[#059669] rounded-3xl flex items-center justify-center mx-auto mb-5 border border-emerald-200/60 shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#059669]" />
        </div>

        {/* Title & Subtitle */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-[#059669]" />
          <span>Community Access</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <Link
            to="/login"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-[#059669] to-emerald-600 hover:from-[#047857] hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to Account</span>
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-2xl transition active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Register New Account</span>
          </Link>
        </div>

        {/* Footer info */}
        <p className="mt-5 text-[11px] text-slate-400 font-medium">
          Only logged-in and registered users can {actionText.toLowerCase()}.
        </p>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
