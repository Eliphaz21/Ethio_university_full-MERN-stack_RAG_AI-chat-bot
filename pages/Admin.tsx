import React, { useState, useEffect } from 'react';
import { User, KnowledgeDoc, University } from '../types';
import { api } from '../services/api';
import { Users, FileText, Upload, Trash2, Activity, Link, FileUp, School, Image as ImageIcon, UploadCloud, Edit3, Plus, CheckCircle2, AlertCircle, X, ExternalLink, MapPin } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

interface AdminStats {
  totalUsers: number;
  totalKnowledge: number;
  totalUniversities: number;
  recentUploads: KnowledgeDoc[];
}

const Admin: React.FC<{ user: User }> = ({ user }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'knowledge' | 'universities'>('overview');
  
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

  // University Cloudinary upload & management state
  const [selectedUniForImage, setSelectedUniForImage] = useState<University | null>(null);
  const [imageFileToUpload, setImageFileToUpload] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uniImageUploading, setUniImageUploading] = useState(false);
  const [uniImageError, setUniImageError] = useState<string | null>(null);
  const [uniImageSuccess, setUniImageSuccess] = useState<string | null>(null);

  // New University Form State
  const [showAddUniModal, setShowAddUniModal] = useState(false);
  const [newUniData, setNewUniData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    city: '',
    region: '',
    established: 2000,
    type: 'Public' as 'Public' | 'Private',
  });
  const [savingUni, setSavingUni] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [usersList, knowledgeList, uniList] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getKnowledge().catch(() => []),
        api.getUniversities().catch(() => []),
      ]);
      const usersArr = Array.isArray(usersList) ? usersList : (usersList as any)?.data ?? [];
      const knowledgeArr = Array.isArray(knowledgeList) ? knowledgeList : (knowledgeList as any)?.data ?? [];
      const uniArr = Array.isArray(uniList) ? uniList : [];

      setUsers(usersArr);
      setKnowledgeDocs(knowledgeArr);
      setUniversities(uniArr);

      setStats({
        totalUsers: usersArr.length,
        totalKnowledge: knowledgeArr.length,
        totalUniversities: uniArr.length,
        recentUploads: knowledgeArr.slice(-5)
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
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
    if (window.confirm('Are you sure you want to delete this university? All associated Cloudinary cover images will also be cleaned up.')) {
      try {
        await api.deleteUniversity(uniId);
        setUniversities(prev => prev.filter(u => u.id !== uniId));
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
      if (stats) setStats({ ...stats, totalKnowledge: stats.totalKnowledge + 1, recentUploads: [{ id: id || '', title: pdfTitle || pdfFile.name, content: '', type: 'pdf', uploadedAt: new Date().toISOString() }, ...stats.recentUploads.slice(0, 4)] });
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
      if (stats) setStats({ ...stats, totalKnowledge: stats.totalKnowledge + 1, recentUploads: [{ id: id || '', title, content: '', type: 'text', uploadedAt: new Date().toISOString() }, ...stats.recentUploads.slice(0, 4)] });
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
      if (stats) setStats({ ...stats, totalKnowledge: stats.totalKnowledge + 1, recentUploads: [{ id: id || '', title, content: '', type: 'website', uploadedAt: new Date().toISOString() }, ...stats.recentUploads.slice(0, 4)] });
      clearUploadState();
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to index website URL');
    } finally {
      setUploading(false);
    }
  };

  // Cloudinary Image Selection & Upload Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUniImageError('Please select a valid image file (JPEG, PNG, WebP, GIF)');
      return;
    }

    setImageFileToUpload(file);
    setUniImageError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImageToCloudinary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniForImage || !imageFileToUpload) {
      setUniImageError('Please select an image file to upload');
      return;
    }

    setUniImageUploading(true);
    setUniImageError(null);
    setUniImageSuccess(null);

    try {
      const res = await api.uploadUniversityImage(selectedUniForImage.id, imageFileToUpload);
      const newImageUrl = res.image || res.university?.image;

      setUniversities(prev => prev.map(u => u.id === selectedUniForImage.id ? { ...u, image: newImageUrl } : u));
      setUniImageSuccess('Image successfully uploaded to Cloudinary & assigned to university!');
      
      setTimeout(() => {
        setSelectedUniForImage(null);
        setImageFileToUpload(null);
        setImagePreview(null);
        setUniImageSuccess(null);
      }, 1500);
    } catch (err: any) {
      setUniImageError(err?.message || 'Failed to upload image to Cloudinary');
    } finally {
      setUniImageUploading(false);
    }
  };

  const handleCreateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniData.name || !newUniData.description || !newUniData.website || !newUniData.city) {
      alert('Please fill in required fields (Name, Description, Website, City)');
      return;
    }

    setSavingUni(true);
    try {
      const payload = {
        name: newUniData.name.trim(),
        slug: newUniData.slug.trim() || undefined,
        description: newUniData.description.trim(),
        website: newUniData.website.trim(),
        location: {
          city: newUniData.city.trim(),
          region: newUniData.region.trim() || newUniData.city.trim(),
        },
        established: Number(newUniData.established) || 2000,
        type: newUniData.type,
      };

      const res = await api.createUniversity(payload);
      const created = res.university;
      setUniversities(prev => [...prev, created]);
      setShowAddUniModal(false);
      setNewUniData({
        name: '',
        slug: '',
        description: '',
        website: '',
        city: '',
        region: '',
        established: 2000,
        type: 'Public',
      });
    } catch (err: any) {
      alert(err?.message || 'Failed to create university');
    } finally {
      setSavingUni(false);
    }
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
            <p className="text-slate-600">Manage users, knowledge base documents, and university Cloudinary assets</p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Knowledge Docs</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalKnowledge}</p>
                </div>
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Universities</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUniversities}</p>
                </div>
                <School className="h-8 w-8 text-slate-400" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Recent Activity</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.recentUploads.length}</p>
                </div>
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('universities')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'universities'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <School className="w-4 h-4" /> Universities & Cloudinary Images
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
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Knowledge Base Uploads</h3>
              <div className="space-y-3">
                {stats.recentUploads.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">{doc.title}</h4>
                      <p className="text-sm text-slate-600">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Universities & Cloudinary Tab */}
        {activeTab === 'universities' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">University Assets & Cloudinary Management</h3>
                  <p className="text-xs text-slate-500">Upload university cover images directly to Cloudinary for fast WebP/AVIF delivery</p>
                </div>
                <button
                  onClick={() => setShowAddUniModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add University
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {universities.map((uni) => {
                  const optimizedThumb = getOptimizedImageUrl(uni.image, 300);
                  const isCloudinary = uni.image?.includes('res.cloudinary.com');

                  return (
                    <div key={uni.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-all">
                      <div>
                        <div className="relative h-44 rounded-xl overflow-hidden mb-4 bg-slate-200 group">
                          <img
                            src={optimizedThumb}
                            alt={uni.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            {isCloudinary ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Cloudinary Hosted
                              </span>
                            ) : (
                              <span className="text-amber-300">Default Image</span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{uni.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {uni.location?.city}, {uni.location?.region}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedUniForImage(uni);
                            setImageFileToUpload(null);
                            setImagePreview(null);
                            setUniImageError(null);
                            setUniImageSuccess(null);
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          <UploadCloud className="w-4 h-4 text-emerald-400" /> Upload Image
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

        {/* Modal / Dialog for Uploading Cloudinary Image */}
        {selectedUniForImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-lg">Upload Cover to Cloudinary</h3>
                </div>
                <button
                  onClick={() => setSelectedUniForImage(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadImageToCloudinary} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target University</label>
                  <p className="text-base font-bold text-slate-900">{selectedUniForImage.name}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select New Image File</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageFileChange}
                    className="block w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-slate-100 file:text-slate-800 file:font-bold hover:file:bg-slate-200 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, WebP up to 10MB. Images are automatically converted to optimized WebP format on Cloudinary.</p>
                </div>

                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Image Preview</p>
                    <div className="h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                {uniImageError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uniImageError}</span>
                  </div>
                )}

                {uniImageSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{uniImageSuccess}</span>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedUniForImage(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uniImageUploading || !imageFileToUpload}
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {uniImageUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading to Cloudinary...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" /> Upload Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal / Dialog for Add University */}
        {showAddUniModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg">Add New University</h3>
                <button onClick={() => setShowAddUniModal(false)} className="text-slate-400 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUniversity} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University Name *</label>
                  <input
                    type="text"
                    required
                    value={newUniData.name}
                    onChange={(e) => setNewUniData({ ...newUniData, name: e.target.value })}
                    placeholder="e.g. Hawassa University"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newUniData.city}
                      onChange={(e) => setNewUniData({ ...newUniData, city: e.target.value, region: e.target.value })}
                      placeholder="e.g. Hawassa"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                    <select
                      value={newUniData.type}
                      onChange={(e) => setNewUniData({ ...newUniData, type: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official Website *</label>
                  <input
                    type="url"
                    required
                    value={newUniData.website}
                    onChange={(e) => setNewUniData({ ...newUniData, website: e.target.value })}
                    placeholder="https://hu.edu.et"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Academic Overview / Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={newUniData.description}
                    onChange={(e) => setNewUniData({ ...newUniData, description: e.target.value })}
                    placeholder="Brief history and research focus..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddUniModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingUni}
                    className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold transition disabled:opacity-50"
                  >
                    {savingUni ? 'Saving...' : 'Create Institution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Users Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {user.username.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900">{user.username}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
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
