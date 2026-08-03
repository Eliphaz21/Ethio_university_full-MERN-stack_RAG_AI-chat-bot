import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  BookOpen,
  Award,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';

interface ProfilePageProps {
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    institution: user?.institution || '',
    department: user?.department || '',
    academicTitle: user?.academicTitle || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [fetching, setFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadFreshProfile() {
      try {
        const res = await api.getProfile();
        if (mounted && res.user) {
          setFormData({
            username: res.user.username || '',
            email: res.user.email || '',
            phone: res.user.phone || '',
            institution: res.user.institution || '',
            department: res.user.department || '',
            academicTitle: res.user.academicTitle || '',
            bio: res.user.bio || '',
            avatarUrl: res.user.avatarUrl || ''
          });
          onUpdateUser({ ...user, ...res.user });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        if (mounted) setFetching(false);
      }
    }

    loadFreshProfile();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateProfile(formData);
      if (user && res.user) {
        const updatedUser: User = {
          ...user,
          ...res.user
        };
        onUpdateUser(updatedUser);
      }
      setSuccessMsg('Your profile has been saved to the MongoDB Database successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile changes.');
    } finally {
      setIsLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#FBF7F1]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#059669] animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading Scholar Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F1] pb-24 pt-4">
      <SEO title="My Profile" noIndex description="Private user profile." />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#059669] hover:underline bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {/* Profile Card Container */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-200/80 overflow-hidden">
          
          {/* Cover Hero Banner */}
          <div className="relative h-48 sm:h-60 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-10 text-white flex items-end">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-5 w-full">
              {/* Avatar Box */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 backdrop-blur-md border-4 border-white flex items-center justify-center text-white shadow-2xl overflow-hidden shrink-0">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt={formData.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-black">{formData.username.substring(0, 2).toUpperCase()}</span>
                )}
              </div>

              {/* Title & Badge */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">{formData.username}</h1>
                  <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'agent' ? 'Operations Agent' : 'Academic Scholar'}
                  </span>
                </div>
                <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 font-medium truncate">
                  {formData.academicTitle || 'Scholar'} {formData.institution ? `• ${formData.institution}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Alert Banners */}
          <div className="p-6 sm:p-8 pb-0">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-[#059669] text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {/* Section 1: Personal & Identity Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserIcon className="w-4 h-4 text-[#059669]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Identity</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name / Handle</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address (Account ID)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="w-full bg-slate-100 border border-slate-200/80 rounded-xl py-3 pl-10 pr-4 text-slate-500 text-sm font-medium outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="+251 91 234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition"
                    />
                  </div>
                </div>

                {/* Avatar Image URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Avatar Image Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic & Institutional Profile */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-[#059669]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Academic Affiliation</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Institution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Affiliated Institution / University</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Addis Ababa University"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department / Field of Study</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science & Artificial Intelligence"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition"
                    />
                  </div>
                </div>

                {/* Academic Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Academic Position / Title</label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Associate Professor / Senior Research Fellow / Student"
                      value={formData.academicTitle}
                      onChange={(e) => setFormData({ ...formData, academicTitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Biography & Specialization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileText className="w-4 h-4 text-[#059669]" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Bio & Research Overview</h3>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={4}
                  placeholder="Share details about your academic background, research interests, or published work..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 text-sm font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 transition resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">All profile edits persist automatically to MongoDB.</span>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#059669] hover:bg-[#047857] active:scale-[0.99] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-900/15 text-sm uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4.5 h-4.5" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;
