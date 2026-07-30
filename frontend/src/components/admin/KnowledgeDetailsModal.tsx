import React, { useState } from 'react';
import { ExternalLink, FileText, Save, X } from 'lucide-react';
import type { KnowledgeDoc } from '../../types';

interface Props {
  document: KnowledgeDoc;
  saving: boolean;
  onClose: () => void;
  onSave: (title: string, category: string) => Promise<void>;
}

const KnowledgeDetailsModal: React.FC<Props> = ({ document, saving, onClose, onSave }) => {
  const [title, setTitle] = useState(document.title);
  const [category, setCategory] = useState(document.category || 'General');
  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto my-5 max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-slate-950 px-6 py-5 text-white">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300"><FileText className="h-5 w-5" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">RAG source details</p><h2 className="text-xl font-black">{document.title}</h2></div></div>
          <button onClick={onClose} className="rounded-xl bg-white/10 p-2 hover:bg-white/20"><X className="h-5 w-5" /></button>
        </header>
        <div className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Source type" value={document.type.toUpperCase()} />
            <Fact label="Vector chunks" value={String(document.chunks || 1)} />
            <Fact label="Characters" value={(document.contentLength || document.content.length).toLocaleString()} />
            <Fact label="Indexed" value={new Date(document.uploadedAt).toLocaleString()} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document title"><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600" /></Field>
            <Field label="Category"><input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600" placeholder="Admissions, Programs, Policies..." /></Field>
          </div>
          {(document.sourceUrl || document.originalFilename) && <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950"><p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Original source</p>{document.sourceUrl ? <a href={document.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 break-all font-bold">{document.sourceUrl}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-1 font-bold">{document.originalFilename}</p>}</div>}
          <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Extracted and indexed content</p><div className="mt-2 max-h-[45vh] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">{document.content || 'No preview is available.'}</div></div>
        </div>
        <footer className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold">Close</button>
          <button disabled={saving || !title.trim() || !category.trim()} onClick={() => void onSave(title.trim(), category.trim())} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-black text-white disabled:opacity-50"><Save className="h-4 w-4" />Save metadata</button>
        </footer>
      </div>
    </div>
  );
};

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-2xl bg-slate-50 p-4"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-black text-slate-800">{value}</p></div>;
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</span>{children}</label>;

export default KnowledgeDetailsModal;
