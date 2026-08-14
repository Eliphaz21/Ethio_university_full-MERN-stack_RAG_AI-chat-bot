import React from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  tone?: 'danger' | 'primary';
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  busy = false,
  tone = 'danger',
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;
  const actionClass = tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/20'
    : 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-500/20';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
      <section className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
          <div className="flex gap-4">
            <div className={`rounded-2xl p-3 ${tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ethio University confirmation</p><h2 id="confirm-dialog-title" className="mt-1 text-xl font-black text-slate-950">{title}</h2></div>
          </div>
          <button disabled={busy} onClick={onCancel} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50" aria-label="Close confirmation"><X className="h-5 w-5" /></button>
        </header>
        <p className="px-6 py-5 text-sm leading-7 text-slate-600">{description}</p>
        <footer className="flex justify-end gap-3 bg-slate-50 p-5">
          <button disabled={busy} onClick={onCancel} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50">Cancel</button>
          <button disabled={busy} onClick={onConfirm} className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-sm focus:ring-4 disabled:opacity-60 ${actionClass}`}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? 'Working...' : confirmLabel}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ConfirmDialog;
