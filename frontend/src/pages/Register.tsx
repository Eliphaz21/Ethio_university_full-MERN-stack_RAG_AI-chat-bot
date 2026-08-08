import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/SEO';

interface RegisterProps {
  onRegister: (user: any) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must include at least one letter and one number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = formData.email.trim().toLowerCase();
      await api.postRegister({
        username: formData.username.trim(),
        email,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err: any) {
      setError(err.message || 'An error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] bg-[#f4f6f9] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-50 text-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#0f172a] mb-2">{t('registerTitle')}</h1>
          <p className="text-slate-500 text-sm mb-6">{t('registerSubtitle')}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#059669] h-full animate-[progress_1.8s_linear]"></div>
          </div>
        </div>
        <style>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#FBF7F1] flex flex-col">
      <SEO
        title="Create Account"
        description="Register for a free EthioUni Portal account to chat with the AI assistant and explore Ethiopian university admissions guidance."
        keywords={['EthioUni register', 'Ethiopian university portal account']}
      />

      {/* Top-Left Back to Home Button directly aligned below navbar logo */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#059669] hover:text-[#047857] bg-white hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t('backToHome')}</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 p-8 sm:p-10 transition-all">
        
        {/* Header matching Login page styling */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-[#059669] shrink-0 stroke-[2.5]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">{t('registerTitle')}</h1>
          </div>
          <p className="text-slate-500 text-sm font-normal">{t('registerSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name / Username */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('fullName')}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-[#f1f5f9] border border-slate-200/60 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                placeholder="Abebe Bikila"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('emailAddress')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#f1f5f9] border border-slate-200/60 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[#f1f5f9] border border-slate-200/60 rounded-xl py-3 pl-10 pr-10 text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[#f1f5f9] border border-slate-200/60 rounded-xl py-3 pl-10 pr-4 text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Green Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/15 flex items-center justify-center gap-2 text-base transition-all disabled:opacity-60 disabled:pointer-events-none mt-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('loading')}</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 stroke-[2.5]" />
                <span>{t('navRegister')}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-[#059669] font-bold hover:underline">
            {t('navLogin')}
          </Link>
        </div>
      </div>
    </div>
  </div>
);
};

export default Register;
