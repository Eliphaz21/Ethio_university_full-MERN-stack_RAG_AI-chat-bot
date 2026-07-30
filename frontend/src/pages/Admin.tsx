import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditLog, User, KnowledgeDoc, University } from '../types';
import { api } from '../services/api';
import { Users, FileText, Upload, Trash2, Activity, Link, FileUp, School, Image as ImageIcon, Edit3, Plus, CheckCircle2, AlertCircle, X, ExternalLink, MapPin, Search, ShieldCheck } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import UniversityEditorModal from '../components/admin/UniversityEditorModal';

interface AdminProps {
  user: User;
  onUniversitiesChange?: (universities: University[]) => void;
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

  const [savingUni, setSavingUni] = useState(false);
  const [isUniversityEditorOpen, setIsUniversityEditorOpen] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersList, knowledgeList, uniList, auditResult] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getKnowledge().catch(() => []),
        api.getUniversities().catch(() => []),
        api.getAuditLogs({ limit: 50 }).catch(() => ({ items: [], total: 0, page: 1, pages: 1 })),
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

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleDeleteKnowledge = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this knowledge document?')) {
      try {
        await api.deleteKnowledge(docId);
        setKnowledgeDocs(prev => prev.filter(d => d.id !== docId));
      } catch (error) {
        console.error('Failed to delete knowledge document:', error);
      }
    }
  };

  const handleDeleteUniversity = async (uniId: string) => {
    if (window.confirm('Are you sure you want to delete this university? Its uploaded cover and gallery images will also be removed.')) {
      try {
        await api.deleteUniversity(uniId);
        setUniversities((current) => {
          const next = current.filter((university) => university.id !== uniId);
          onUniversitiesChange?.(next);
          return next;
        });
      } catch (error: any) {
        alert(error?.message || 'Failed to delete university');
      }
    }
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
      const res = await api.uploadAdminKnowledgePDF(formData);
      const id = (res as any)?.id;
      setKnowledgeDocs(prev => [{ id: id || String(Date.now()), title: pdfTitle || pdfFile.name, content: '', type: 'pdf', uploadedAt: new Date().toISOString() }, ...prev]);
      setUploadSuccess('PDF uploaded and indexed successfully.');
      void refreshAuditLogs();
      clearUploadState();
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
      const res = await api.postAdminKnowledge({ title, content: textContent.trim(), type: 'text' });
      const id = (res as any)?.id;
      setKnowledgeDocs(prev => [{ id: id || String(Date.now()), title, content: textContent.trim(), type: 'text', uploadedAt: new Date().toISOString() }, ...prev]);
      setUploadSuccess('Text document indexed successfully.');
      void refreshAuditLogs();
      clearUploadState();
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
      const res = await api.postAdminKnowledgeUrl({ url, title: urlTitle.trim() || undefined });
      const id = (res as any)?.id;
      const title = (res as any)?.title || url;
      setKnowledgeDocs(prev => [{ id: id || String(Date.now()), title, content: '', type: 'website', uploadedAt: new Date().toISOString() }, ...prev]);
      setUploadSuccess('Website content indexed successfully.');
      void refreshAuditLogs();
      clearUploadState();
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
      alert(error?.message || 'Failed to create university');
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-600">Manage users, knowledge documents, and complete university directory information</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('universities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'universities'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <School className="w-4 h-4" /> University List
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'knowledge'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" /> Knowledge Base
            </button>
            <button
              onClick={() => {
                setActiveTab('audit');
                void refreshAuditLogs();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" /> Audit Log
            </button>
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
                        <button
                          onClick={() => handleDeleteUniversity(uni.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete university"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Registered Scholars & Users</h3>
                <p className="text-xs text-slate-500">View registered account details, academic affiliations, and profile information stored in the database</p>
              </div>
              <span className="bg-emerald-50 text-[#059669] px-3 py-1 rounded-full text-xs font-black">
                {users.length} Total Users
              </span>
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
                  {users.map((u: any) => (
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
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {knowledgeDocs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{doc.title}</div>
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteKnowledge(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
