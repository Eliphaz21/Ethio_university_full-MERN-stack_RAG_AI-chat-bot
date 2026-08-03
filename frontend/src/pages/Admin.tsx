import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditLog, User, KnowledgeDoc, University } from '../types';
import { api } from '../services/api';
import { Users, FileText, Upload, Trash2, Activity, Link, FileUp, School, Image as ImageIcon, Edit3, Plus, CheckCircle2, AlertCircle, X, ExternalLink, MapPin, Search, ShieldCheck, UserPlus } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import UniversityEditorModal from '../components/admin/UniversityEditorModal';
import UserEditorModal, { UserEditorDraft } from '../components/admin/UserEditorModal';
import KnowledgeDetailsModal from '../components/admin/KnowledgeDetailsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import NotificationToast, { NotificationMessage } from '../components/NotificationToast';
import { SEO } from '../components/SEO';

interface AdminProps {
  user: User;
  onUniversitiesChange?: (universities: University[]) => void;
}

interface ConfirmationState {
  title: string;
  description: string;
  confirmLabel: string;
  action: () => Promise<void>;
}

const Admin: React.FC<AdminProps> = ({ user, onUniversitiesChange }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTotal, setAuditTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'users' | 'knowledge' | 'universities' | 'audit'>('universities');
  
  // Knowledge upload state
  const [uploadSection, setUploadSection] = useState<'pdf' | 'text' | 'url' | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [knowledgeCategory, setKnowledgeCategory] = useState('General');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState('All');
  const [selectedKnowledge, setSelectedKnowledge] = useState<KnowledgeDoc | null>(null);
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  const [savingUni, setSavingUni] = useState(false);
  const [isUniversityEditorOpen, setIsUniversityEditorOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null | undefined>(undefined);
  const [savingUser, setSavingUser] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersList, knowledgeList, uniList, auditResult] = await Promise.all([
        user.role === 'admin' ? api.getUsers().catch(() => []) : Promise.resolve([]),
        api.getKnowledge().catch(() => []),
        api.getUniversities().catch(() => []),
        user.role === 'admin' ? api.getAuditLogs({ limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, pages: 1 })) : Promise.resolve({ items: [], total: 0, page: 1, pages: 1 }),
      ]);
      const usersArr = Array.isArray(usersList) ? usersList : (usersList as any)?.data ?? [];
      const knowledgeArr = Array.isArray(knowledgeList) ? knowledgeList : (knowledgeList as any)?.data ?? [];
      const uniArr = Array.isArray(uniList) ? uniList : [];

      setUsers(usersArr);
      setKnowledgeDocs(knowledgeArr);
      setUniversities(uniArr);
      setAuditLogs(auditResult.items);
      setAuditTotal(auditResult.total);
      onUniversitiesChange?.(uniArr);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAuditLogs = async (search = auditSearch) => {
    const result = await api.getAuditLogs({ limit: 50, search: search.trim() || undefined });
    setAuditLogs(result.items);
    setAuditTotal(result.total);
  };

  const showNotification = (next: NotificationMessage) => {
    setNotification(next);
    window.setTimeout(() => setNotification((current) => current === next ? null : current), 5000);
  };

  const runConfirmedAction = async () => {
    if (!confirmation) return;
    setConfirming(true);
    try {
      await confirmation.action();
      setConfirmation(null);
    } catch {
      // The action displays a branded error notification and keeps the dialog open.
    } finally {
      setConfirming(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const target = users.find((item) => item.id === userId);
    setConfirmation({
      title: 'Delete user account?',
      description: `${target?.username || 'This user'} will permanently lose access to EthioUni. This action cannot be undone.`,
      confirmLabel: 'Delete user',
      action: async () => {
        try {
        await api.deleteUser(userId);
        setUsers((current) => current.filter((item) => item.id !== userId));
        void refreshAuditLogs();
        showNotification({ type: 'success', title: 'User deleted', message: `${target?.username || 'The account'} was removed successfully.` });
      } catch (error: any) {
        showNotification({ type: 'error', title: 'Unable to delete user', message: error?.message || 'The account could not be removed.' });
        throw error;
      }
      },
    });
  };

  const handleSaveUser = async (draft: UserEditorDraft) => {
    setSavingUser(true);
    setUserFormError(null);
    try {
      if (draft.id) {
        const response = await api.updateUser(draft.id, draft);
        setUsers((current) => current.map((item) => item.id === response.user.id ? response.user : item));
      } else {
        const response = await api.createUser(draft);
        setUsers((current) => [response.user, ...current]);
        if (response.temporaryPassword) {
          setCreatedCredentials({ email: response.user.email, password: response.temporaryPassword });
        }
      }
      setSelectedUser(undefined);
      void refreshAuditLogs();
    } catch (error: any) {
      setUserFormError(error?.message || 'Failed to save user');
    } finally {
      setSavingUser(false);
    }
  };

  const visibleUsers = users.filter((item) =>
    [item.username, item.email, item.institution, item.department, item.academicTitle]
      .some((value) => value?.toLowerCase().includes(userSearch.trim().toLowerCase()))
  );

  const knowledgeCategories = ['All', ...Array.from(new Set(knowledgeDocs.map((doc) => doc.category || 'General'))).sort()];
  const visibleKnowledge = knowledgeDocs.filter((doc) => {
    const matchesCategory = knowledgeCategoryFilter === 'All' || (doc.category || 'General') === knowledgeCategoryFilter;
    const query = knowledgeSearch.trim().toLowerCase();
    return matchesCategory && (!query || [doc.title, doc.category, doc.type, doc.content].some((value) => value?.toLowerCase().includes(query)));
  });

  const openKnowledgeDetails = async (document: KnowledgeDoc) => {
    try {
      setSelectedKnowledge(await api.getKnowledgeDocument(document.id));
    } catch (error: any) {
      showNotification({ type: 'error', title: 'Unable to open source', message: error?.message || 'The knowledge document could not be loaded.' });
    }
  };

  const saveKnowledgeMetadata = async (title: string, category: string) => {
    if (!selectedKnowledge) return;
    setSavingKnowledge(true);
    try {
      await api.updateKnowledgeDocument(selectedKnowledge.id, { title, category });
      setKnowledgeDocs(await api.getKnowledge());
      setSelectedKnowledge((current) => current ? { ...current, title, category } : null);
      void refreshAuditLogs();
    } catch (error: any) {
      showNotification({ type: 'error', title: 'Unable to save source', message: error?.message || 'The knowledge metadata could not be updated.' });
    } finally {
      setSavingKnowledge(false);
    }
  };

  const handleDeleteKnowledge = async (docId: string) => {
    const target = knowledgeDocs.find((item) => item.id === docId);
    setConfirmation({
      title: 'Delete knowledge source?',
      description: `${target?.title || 'This source'} and all of its RAG vector chunks will be permanently removed.`,
      confirmLabel: 'Delete source',
      action: async () => {
        try {
        await api.deleteKnowledge(docId);
        setKnowledgeDocs(prev => prev.filter(d => d.id !== docId));
        void refreshAuditLogs();
        showNotification({ type: 'success', title: 'Knowledge source deleted', message: `${target?.title || 'The source'} was removed from the RAG index.` });
      } catch (error: any) {
        showNotification({ type: 'error', title: 'Unable to delete source', message: error?.message || 'The knowledge source could not be deleted.' });
        throw error;
      }
      },
    });
  };

  const handleDeleteUniversity = async (uniId: string) => {
    const target = universities.find((item) => item.id === uniId);
    setConfirmation({
      title: 'Delete university?',
      description: `${target?.name || 'This university'}, its profile, cover image, and gallery images will be permanently removed.`,
      confirmLabel: 'Delete university',
      action: async () => {
        try {
        await api.deleteUniversity(uniId);
        setUniversities((current) => {
          const next = current.filter((university) => university.id !== uniId);
          onUniversitiesChange?.(next);
          return next;
        });
        showNotification({ type: 'success', title: 'University deleted', message: `${target?.name || 'The university'} was removed successfully.` });
      } catch (error: any) {
        showNotification({ type: 'error', title: 'Unable to delete university', message: error?.message || 'The university could not be deleted.' });
        throw error;
      }
      },
    });
  };

  const clearUploadState = () => {
    setUploadError(null);
    setUploadSuccess(null);
    setPdfFile(null);
    setPdfTitle('');
    setTextTitle('');
    setTextContent('');
    setUrlInput('');
    setUrlTitle('');
    setUploadSection(null);
  };

  const handlePdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      setUploadError('Please select a PDF file');
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', pdfFile);
      if (pdfTitle.trim()) formData.append('title', pdfTitle.trim());
      formData.append('category', knowledgeCategory.trim() || 'General');
      const res = await api.uploadAdminKnowledgePDF(formData);
      setKnowledgeDocs(await api.getKnowledge());
      setUploadSuccess(`PDF indexed into ${(res as any).chunks || 1} searchable chunk(s).`);
      void refreshAuditLogs();
      setPdfFile(null);
      setPdfTitle('');
    } catch (err: any) {
      setUploadError(err?.response?.data?.error || err?.message || 'PDF upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) {
      setUploadError('Please enter some text content');
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const title = textTitle.trim() || `Text ${new Date().toLocaleDateString()}`;
      const res = await api.postAdminKnowledge({ title, content: textContent.trim(), type: 'text', category: knowledgeCategory.trim() || 'General' });
      setKnowledgeDocs(await api.getKnowledge());
      setUploadSuccess(`Text indexed into ${res.chunks || 1} searchable chunk(s).`);
      void refreshAuditLogs();
      setTextTitle('');
      setTextContent('');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to add text document');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) {
      setUploadError('Please enter a website URL');
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const res = await api.postAdminKnowledgeUrl({ url, title: urlTitle.trim() || undefined, category: knowledgeCategory.trim() || 'General' });
      setKnowledgeDocs(await api.getKnowledge());
      setUploadSuccess(`Website indexed into ${res.chunks || 1} searchable chunk(s).`);
      void refreshAuditLogs();
      setUrlInput('');
      setUrlTitle('');
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to index website URL');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveUniversity = async (draft: Omit<University, 'id'> & { id?: string }) => {
    setSavingUni(true);
    try {
      const response = await api.createUniversity(draft);
      const saved = response.university as University;
      setUniversities((current) => {
        const next = [...current, saved].sort((a, b) => a.name.localeCompare(b.name));
        onUniversitiesChange?.(next);
        return next;
      });
      setIsUniversityEditorOpen(false);
    } catch (error: any) {
      showNotification({ type: 'error', title: 'Unable to create university', message: error?.message || 'The university could not be created.' });
    } finally {
      setSavingUni(false);
    }
  };

  const updateUniversityInLists = (updated: University) => {
    setUniversities((current) => {
      const next = current.map((university) => university.id === updated.id ? updated : university);
      onUniversitiesChange?.(next);
      return next;
    });
  };

  const handleEditorCoverUpload = async (universityId: string, file: File) => {
    const response = await api.uploadUniversityImage(universityId, file);
    updateUniversityInLists(response.university);
    return response.image;
  };

  const handleEditorGalleryUpload = async (universityId: string, files: File[]) => {
    const response = await api.uploadUniversityGalleryImages(universityId, files);
    updateUniversityInLists(response.university);
    return response.images;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1e9]">
      <SEO title="Administration" noIndex description="Private administration workspace." />
      <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:py-10">
        <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[45px] border-emerald-400/10" />
          <div className="absolute bottom-0 right-24 h-24 w-48 bg-[radial-gradient(circle,#34d399_1px,transparent_1px)] bg-[size:12px_12px] opacity-20" />
          <div className="relative max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" />Protected administration</div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">EthioUni operations workspace</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Manage the university directory, registered users, and RAG knowledge sources with accountable, auditable workflows.</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
              <span className="rounded-lg bg-white/10 px-3 py-2">{universities.length} universities</span>
              <span className="rounded-lg bg-white/10 px-3 py-2">{users.length} users</span>
              <span className="rounded-lg bg-white/10 px-3 py-2">{knowledgeDocs.length} knowledge sources</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-2 z-30 mb-6 overflow-x-auto rounded-2xl border border-white/80 bg-white/90 p-1.5 shadow-lg shadow-slate-900/5 backdrop-blur">
          <nav className="flex min-w-max gap-1">
            <button
              onClick={() => setActiveTab('universities')}
              className={`rounded-xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition ${
                activeTab === 'universities'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/15'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <School className="w-4 h-4" /> University List
            </button>
            {user.role === 'admin' && <button
              onClick={() => setActiveTab('users')}
              className={`rounded-xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition ${
                activeTab === 'users'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/15'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" /> Users
            </button>}
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`rounded-xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition ${
                activeTab === 'knowledge'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/15'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" /> Knowledge Base
            </button>
            {user.role === 'admin' && <button
              onClick={() => {
                setActiveTab('audit');
                void refreshAuditLogs();
              }}
              className={`rounded-xl px-4 py-3 font-bold text-sm flex items-center gap-2 transition ${
                activeTab === 'audit'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/15'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" /> Audit Log
            </button>}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'audit' && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                  <h2 className="text-lg font-black text-slate-900">Audit Log</h2>
                </div>
                <p className="mt-1 text-sm text-slate-500">{auditTotal} recorded administrative actions</p>
              </div>
              <form className="relative w-full sm:max-w-sm" onSubmit={(event) => { event.preventDefault(); void refreshAuditLogs(); }}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={auditSearch} onChange={(event) => setAuditSearch(event.target.value)} placeholder="Search actor, action, or resource" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-600" />
              </form>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Time', 'Actor', 'Action', 'Resource', 'Status', 'IP address'].map((heading) => <th key={heading} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">{heading}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800">{log.actorEmail || 'System'}</td>
                      <td className="px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{log.action.replaceAll('.', ' ')}</span></td>
                      <td className="px-5 py-4"><p className="text-xs font-black uppercase text-emerald-700">{log.resourceType}</p><p className="mt-1 text-sm text-slate-700">{log.resourceLabel || log.resourceId || 'Not specified'}</p></td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${log.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{log.status}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{log.ipAddress || 'Unknown'}</td>
                    </tr>
                  ))}
                  {!auditLogs.length && <tr><td colSpan={6} className="px-5 py-14 text-center text-sm text-slate-500">No audit events match this search.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* University List */}
        {activeTab === 'universities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">University List</h3>
                  <p className="text-xs text-slate-500">Add, review, edit, publish imagery, and maintain complete institution profiles</p>
                </div>
                <button
                  onClick={() => {
                    setIsUniversityEditorOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add University
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((uni) => {
                  const optimizedThumb = getOptimizedImageUrl(uni.image, 300);

                  return (
                    <div key={uni.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
                      <div>
                        <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-slate-200 group">
                          <img
                            src={optimizedThumb}
                            alt={uni.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{uni.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {uni.location?.city}, {uni.location?.region}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200/80 grid grid-cols-[1fr_auto] items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            navigate(`/admin/universities/${uni.id}/edit`);
                          }}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Edit3 className="w-4 h-4" /> Edit
                        </button>
                        {user.role === 'admin' && <button
                          onClick={() => handleDeleteUniversity(uni.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete university"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {isUniversityEditorOpen && (
          <UniversityEditorModal
            key="new-university"
            initialUniversity={null}
            saving={savingUni}
            onClose={() => {
              setIsUniversityEditorOpen(false);
            }}
            onSave={handleSaveUniversity}
            onUploadCover={handleEditorCoverUpload}
            onUploadGallery={handleEditorGalleryUpload}
          />
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {createdCredentials && (
              <div className="m-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Account created successfully</p>
                  <p className="mt-1 text-sm text-emerald-950">Temporary sign-in for <strong>{createdCredentials.email}</strong>: <code className="rounded bg-white px-2 py-1 font-black">{createdCredentials.password}</code></p>
                  <p className="mt-1 text-xs text-emerald-800">Share this securely. It is displayed only for this creation result.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => void navigator.clipboard.writeText(createdCredentials.password)} className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-black text-white">Copy password</button>
                  <button onClick={() => setCreatedCredentials(null)} className="rounded-xl border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-900">Dismiss</button>
                </div>
              </div>
            )}
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Scholars & Users</h3>
                <p className="text-xs text-slate-500">Create, inspect, update, assign roles, and safely remove registered accounts</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search users" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600 sm:w-64" />
                </label>
                <button onClick={() => setSelectedUser(null)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-800"><UserPlus className="h-4 w-4" />Add user</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Scholar / User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Institution & Department</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact & Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Title</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {visibleUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black">{u.username ? u.username.substring(0, 2).toUpperCase() : 'EU'}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{u.username}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-slate-800">{u.institution || 'Not set'}</div>
                        <div className="text-[11px] text-slate-500">{u.department || 'General'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {u.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600 font-medium max-w-xs truncate">
                        {u.academicTitle || 'Scholar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                          u.role === 'admin'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : u.role === 'agent'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                        <button onClick={() => setSelectedUser(u)} className="mr-1 p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="View and edit user"><Edit3 className="h-4 w-4" /></button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!visibleUsers.length && <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">No users match your search.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Knowledge Tab */}
        {activeTab === 'knowledge' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-900">Knowledge Documents</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setUploadSection(uploadSection === 'pdf' ? null : 'pdf')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  <FileUp className="h-4 w-4" /> Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSection(uploadSection === 'text' ? null : 'text')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" /> Add Text
                </button>
                <button
                  type="button"
                  onClick={() => setUploadSection(uploadSection === 'url' ? null : 'url')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  <Link className="h-4 w-4" /> Add Website URL
                </button>
              </div>
            </div>
            {(uploadSection === 'pdf' || uploadSection === 'text' || uploadSection === 'url') && (
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <label className="mb-4 block max-w-xl text-sm font-medium text-slate-700">
                  Category
                  <input value={knowledgeCategory} onChange={(e) => setKnowledgeCategory(e.target.value)} placeholder="Admissions, Programs, Policies, Student Services..." className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </label>
                {uploadSection === 'pdf' && (
                  <form onSubmit={handlePdfUpload} className="space-y-3 max-w-xl">
                    <label className="block text-sm font-medium text-slate-700">PDF file</label>
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-slate-200 file:text-slate-800"
                    />
                    <label className="block text-sm font-medium text-slate-700">Title (optional)</label>
                    <input
                      type="text"
                      value={pdfTitle}
                      onChange={(e) => setPdfTitle(e.target.value)}
                      placeholder="e.g. Admissions Guide 2024"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={uploading || !pdfFile} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">Upload</button>
                      <button type="button" onClick={clearUploadState} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">Cancel</button>
                    </div>
                  </form>
                )}
                {uploadSection === 'text' && (
                  <form onSubmit={handleTextSubmit} className="space-y-3 max-w-xl">
                    <label className="block text-sm font-medium text-slate-700">Title (optional)</label>
                    <input
                      type="text"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                      placeholder="e.g. FAQ 2024"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <label className="block text-sm font-medium text-slate-700">Content</label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Paste or type document text..."
                      rows={5}
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={uploading || !textContent.trim()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">Add to knowledge base</button>
                      <button type="button" onClick={clearUploadState} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">Cancel</button>
                    </div>
                  </form>
                )}
                {uploadSection === 'url' && (
                  <form onSubmit={handleUrlSubmit} className="space-y-3 max-w-xl">
                    <label className="block text-sm font-medium text-slate-700">Website URL</label>
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/page"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <label className="block text-sm font-medium text-slate-700">Title (optional)</label>
                    <input
                      type="text"
                      value={urlTitle}
                      onChange={(e) => setUrlTitle(e.target.value)}
                      placeholder="e.g. University homepage"
                      className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={uploading || !urlInput.trim()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">Fetch and index</button>
                      <button type="button" onClick={clearUploadState} className="px-4 py-2 border border-slate-300 rounded-lg text-sm">Cancel</button>
                    </div>
                  </form>
                )}
                {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
                {uploadSuccess && <p className="mt-2 text-sm text-green-600">{uploadSuccess}</p>}
              </div>
            )}
            <div className="grid gap-3 border-b border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px]">
              <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={knowledgeSearch} onChange={(e) => setKnowledgeSearch(e.target.value)} placeholder="Search indexed documents and content" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-600" /></label>
              <select value={knowledgeCategoryFilter} onChange={(e) => setKnowledgeCategoryFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600">
                {knowledgeCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">RAG index</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {visibleKnowledge.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => void openKnowledgeDetails(doc)} className="text-left text-sm font-bold text-slate-900 hover:text-emerald-700">{doc.title}</button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase text-amber-800">{doc.category || 'General'}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          doc.type === 'pdf' 
                            ? 'bg-red-100 text-red-800' 
                            : doc.type === 'text'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {doc.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600"><span className="font-black text-slate-900">{doc.chunks || 1}</span> chunk(s)<br />{(doc.contentLength || doc.content.length).toLocaleString()} characters</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => void openKnowledgeDetails(doc)} className="mr-2 text-emerald-700 hover:text-emerald-900"><Edit3 className="h-4 w-4" /></button>
                        <button
                          onClick={() => handleDeleteKnowledge(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!visibleKnowledge.length && <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">No knowledge documents match these filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {selectedUser !== undefined && (
        <UserEditorModal initialUser={selectedUser} saving={savingUser} error={userFormError} onClose={() => { setSelectedUser(undefined); setUserFormError(null); }} onSave={handleSaveUser} />
      )}
      {selectedKnowledge && (
        <KnowledgeDetailsModal document={selectedKnowledge} saving={savingKnowledge} onClose={() => setSelectedKnowledge(null)} onSave={saveKnowledgeMetadata} />
      )}
      <ConfirmDialog
        open={Boolean(confirmation)}
        title={confirmation?.title || ''}
        description={confirmation?.description || ''}
        confirmLabel={confirmation?.confirmLabel}
        busy={confirming}
        onCancel={() => { if (!confirming) setConfirmation(null); }}
        onConfirm={() => void runConfirmedAction()}
      />
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />
    </div>
  );
};

export default Admin;
