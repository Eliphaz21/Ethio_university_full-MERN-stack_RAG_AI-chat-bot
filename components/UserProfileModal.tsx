import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import {
  X,
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
  ShieldCheck
} from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser
}) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    phone: user.phone || '',
    institution: user.institution || '',
    department: user.department || '',
    academicTitle: user.academicTitle || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateProfile(formData);
      const updatedUser: User = {
        ...user,
        ...res.user
      };
      onUpdateUser(updatedUser);
      setSuccessMsg('Profile updated successfully and saved to Database!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 sm:p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 flex items-center justify-center text-white shadow-xl overflow-hidden">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt={formData.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black">{formData.username.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#059669] text-white rounded-full flex items-center justify-center border-2 border-white text-xs shadow">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{user.username}</h2>
                <span className="bg-white/20 text-emerald-200 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  {user.role === 'admin' ? 'Administrator' : 'Scholar'}
                </span>
              </div>
              <p className="text-emerald-100/80 text-xs mt-1 flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="px-6 sm:px-8 pt-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[#059669] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Username */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#059669]" /> Full Name / Handle
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#059669]" /> Phone Number
              </label>
              <input
                type="text"
                placeholder="+251 91 234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition"
              />
            </div>

            {/* Affiliated Institution */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#059669]" /> Institution / Campus
              </label>
              <input
                type="text"
                placeholder="e.g. Addis Ababa University"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition"
              />
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#059669]" /> Department / Program
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science & AI"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition"
              />
            </div>

            {/* Academic Title */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#059669]" /> Academic Title / Position
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Researcher / Undergraduate Student"
                value={formData.academicTitle}
                onChange={(e) => setFormData({ ...formData, academicTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition"
              />
            </div>

            {/* Bio */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#059669]" /> Bio & Research Specialization
              </label>
              <textarea
                rows={3}
                placeholder="Write a brief overview of your academic focus or achievements..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 transition resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-xs uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile to DB</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UserProfileModal;
