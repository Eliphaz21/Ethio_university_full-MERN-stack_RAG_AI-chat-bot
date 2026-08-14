import React, { useState } from 'react';
import { User, AuditLog } from '../../types';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  BookOpen,
  Award,
  Calendar,
  ShieldCheck,
  FileText,
  Activity,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';

export interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  userLogs?: AuditLog[];
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  userLogs = [],
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');

  if (!isOpen || !user) return null;

  const filteredLogs = userLogs.filter(
    (log) => log.actorEmail === user.email || log.resourceId === user.id || log.resourceLabel === user.email
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Hero Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 p-6 sm:p-8 text-white overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Profile Overview */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/30 flex items-center justify-center text-white shadow-xl overflow-hidden shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black">{user.username ? user.username.substring(0, 2).toUpperCase() : 'EU'}</span>
              )}
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">{user.username}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                    : user.role === 'agent'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200/90 font-medium truncate">{user.email}</p>
              <p className="text-[11px] text-slate-400 font-normal">
                {user.academicTitle || 'Scholar'} • Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" /> Full Profile Details
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" /> Audit Activity ({filteredLogs.length})
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Personal & Academic Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-emerald-600" /> Full Name / Handle
                  </span>
                  <p className="text-sm font-bold text-slate-900">{user.username}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" /> Email Address
                  </span>
                  <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Contact Phone
                  </span>
                  <p className="text-sm font-bold text-slate-900">{user.phone || 'Not provided'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" /> Academic Title
                  </span>
                  <p className="text-sm font-bold text-slate-900">{user.academicTitle || 'Academic Scholar'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Affiliated Institution
                  </span>
                  <p className="text-sm font-bold text-slate-900">{user.institution || 'Not set'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Department / Field
                  </span>
                  <p className="text-sm font-bold text-slate-900">{user.department || 'General Education'}</p>
                </div>
              </div>

              {/* Bio & Research Interests */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Biography & Research Focus
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {user.bio || 'No biography or research summary provided yet.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-3">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                          log.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{log.resourceLabel || log.resourceType}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {new Date(log.createdAt).toLocaleString()} • IP: {log.ipAddress || 'Internal'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      {log.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  No explicit audit activity logged for this user yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition"
          >
            Close Window
          </button>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(user.id);
                }}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Delete user"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetailModal;
