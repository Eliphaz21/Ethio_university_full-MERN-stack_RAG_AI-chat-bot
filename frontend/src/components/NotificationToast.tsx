import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface NotificationMessage {
  type: 'success' | 'error';
  title: string;
  message: string;
}

const NotificationToast: React.FC<{ notification: NotificationMessage | null; onClose: () => void }> = ({ notification, onClose }) => {
  if (!notification) return null;
  const success = notification.type === 'success';
  return (
    <div className="fixed right-4 top-20 z-[210] w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-right-4 fade-in duration-200">
      <div className={`flex gap-3 rounded-2xl border bg-white p-4 shadow-2xl ${success ? 'border-emerald-200' : 'border-red-200'}`} role="status">
        <div className={`rounded-xl p-2 ${success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}</div>
        <div className="min-w-0 flex-1"><p className="font-black text-slate-900">{notification.title}</p><p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p></div>
        <button onClick={onClose} className="self-start rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

export default NotificationToast;
