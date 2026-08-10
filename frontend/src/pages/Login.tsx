import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/SEO';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const lowerEmail = email.trim().toLowerCase();
      if (!lowerEmail || !password) {
        throw new Error('Please enter both email address and password.');
      }

      const res = await api.postLogin({ email: lowerEmail, password });
      const { user: backendUser } = res;
      const role = ['admin', 'agent'].includes(backendUser.role) ? backendUser.role : 'user';
      onLogin({
        id: String(backendUser.id),
        username: backendUser.username,
        email: backendUser.email,
        role,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#FBF7F1] flex flex-col">
      <SEO
        title="Sign In"
        description="Sign in to EthioUni Portal to access the AI university assistant, save chat history, and explore personalized university guidance."
        keywords={['EthioUni login', 'Ethiopian university portal sign in']}
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
        
        {/* Header matching screenshot */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-[#059669] shrink-0 stroke-[2.5]" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">{t('loginTitle')}</h1>
          </div>
          <p className="text-slate-500 text-sm font-normal">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t('emailAddress')}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                <span>{t('navLogin')}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="text-[#059669] font-bold hover:underline">
            {t('navRegister')}
          </Link>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;
