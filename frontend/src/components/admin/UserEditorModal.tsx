import React, { useState } from 'react';
import { Save, Shield, UserRound, X } from 'lucide-react';
import type { User, UserRole } from '../../types';

export type UserEditorDraft = Omit<User, 'id' | 'createdAt'> & { id?: string; password?: string };

interface UserEditorModalProps {
  initialUser?: User | null;
  saving: boolean;
  onClose: () => void;
  onSave: (draft: UserEditorDraft) => Promise<void>;
}

const emptyDraft = (): UserEditorDraft => ({
  username: '',
  email: '',
  password: '',
  role: 'user',
  phone: '',
  institution: '',
  department: '',
  bio: '',
  academicTitle: '',
  avatarUrl: '',
});

const UserEditorModal: React.FC<UserEditorModalProps> = ({ initialUser, saving, onClose, onSave }) => {
  const [draft, setDraft] = useState<UserEditorDraft>({ ...emptyDraft(), ...initialUser, password: '' });
  const field = <K extends keyof UserEditorDraft>(key: K, value: UserEditorDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10';

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <form
        onSubmit={(event) => { event.preventDefault(); void onSave(draft); }}
        className="mx-auto my-6 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-slate-50 shadow-2xl"
      >
        <header className="flex items-center justify-between bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300"><UserRound className="h-5 w-5" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Account management</p><h2 className="text-xl font-black">{initialUser ? 'Edit user profile' : 'Create user account'}</h2></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-white/10 p-2 hover:bg-white/20"><X className="h-5 w-5" /></button>
        </header>
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Full name *"><input required className={inputClass} value={draft.username} onChange={(e) => field('username', e.target.value)} /></Field>
          <Field label="Email *"><input required type="email" className={inputClass} value={draft.email} onChange={(e) => field('email', e.target.value)} /></Field>
          <Field label={initialUser ? 'New password (leave blank to keep)' : 'Temporary password *'}>
            <input required={!initialUser} minLength={8} type="password" className={inputClass} value={draft.password || ''} onChange={(e) => field('password', e.target.value)} placeholder="Minimum 8 characters" />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={draft.role} onChange={(e) => field('role', e.target.value as UserRole)}>
              <option value="user">User</option><option value="admin">Administrator</option>
            </select>
          </Field>
          <Field label="Phone"><input className={inputClass} value={draft.phone || ''} onChange={(e) => field('phone', e.target.value)} /></Field>
          <Field label="Academic title"><input className={inputClass} value={draft.academicTitle || ''} onChange={(e) => field('academicTitle', e.target.value)} placeholder="Student, Lecturer, Researcher..." /></Field>
          <Field label="Institution"><input className={inputClass} value={draft.institution || ''} onChange={(e) => field('institution', e.target.value)} /></Field>
          <Field label="Department"><input className={inputClass} value={draft.department || ''} onChange={(e) => field('department', e.target.value)} /></Field>
          <Field label="Avatar URL" className="md:col-span-2"><input type="url" className={inputClass} value={draft.avatarUrl || ''} onChange={(e) => field('avatarUrl', e.target.value)} /></Field>
          <Field label="Biography" className="md:col-span-2"><textarea rows={5} className={inputClass} value={draft.bio || ''} onChange={(e) => field('bio', e.target.value)} /></Field>
          <div className="md:col-span-2 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            <Shield className="mt-0.5 h-4 w-4 shrink-0" /> Administrator accounts can manage users, universities, knowledge documents, and audit records. Assign this role only when required.
          </div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-200 bg-white p-5">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700">Cancel</button>
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save user'}</button>
        </footer>
      </form>
    </div>
  );
};

const Field: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className = '', children }) => (
  <label className={className}><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>{children}</label>
);

export default UserEditorModal;
