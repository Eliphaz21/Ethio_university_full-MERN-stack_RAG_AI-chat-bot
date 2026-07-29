import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import UniversityEditorModal from '../../components/admin/UniversityEditorModal';
import { api } from '../../services/api';
import type { University } from '../../types';

interface UniversityEditProps {
  onUniversityChange?: (university: University) => void;
}

const UniversityEdit: React.FC<UniversityEditProps> = ({ onUniversityChange }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('University ID is missing.');
      setLoading(false);
      return;
    }
    api.getAdminUniversityById(id)
      .then(setUniversity)
      .catch((requestError) => setError(requestError?.message || 'Failed to load university'))
      .finally(() => setLoading(false));
  }, [id]);

  const publishUpdate = (updated: University) => {
    setUniversity(updated);
    onUniversityChange?.(updated);
  };

  const handleSave = async (draft: Omit<University, 'id'> & { id?: string }) => {
    if (!id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.updateUniversity(id, draft);
      publishUpdate(response.university);
      setSuccess('University information published successfully.');
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to update university');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverUpload = async (universityId: string, file: File) => {
    const response = await api.uploadUniversityImage(universityId, file);
    publishUpdate(response.university);
    return response.image;
  };

  const handleGalleryUpload = async (universityId: string, files: File[]) => {
    const response = await api.uploadUniversityGalleryImages(universityId, files);
    publishUpdate(response.university);
    return response.images;
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f4ef]">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-emerald-700" />
          <p className="mt-3 text-sm font-bold text-slate-500">Loading university editor...</p>
        </div>
      </div>
    );
  }

  if (!university || error && !university) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f6f4ef] px-4">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-xl font-black text-slate-900">Unable to open university</h1>
          <p className="mt-2 text-sm text-slate-500">{error || 'University not found.'}</p>
          <Link to="/admin" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
            <ArrowLeft className="h-4 w-4" /> Return to admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {(success || error) && (
        <div className={`fixed right-4 top-24 z-[120] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold shadow-xl ${
          error ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900'
        }`}>
          {error ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
          {error || success}
        </div>
      )}
      <UniversityEditorModal
        key={university.id}
        initialUniversity={university}
        saving={saving}
        standalone
        onClose={() => navigate('/admin')}
        onSave={handleSave}
        onUploadCover={handleCoverUpload}
        onUploadGallery={handleGalleryUpload}
      />
    </div>
  );
};

export default UniversityEdit;
