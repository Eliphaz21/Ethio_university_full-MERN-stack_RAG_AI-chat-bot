import React, { useState } from 'react';
import {
  Building2,
  CircleDollarSign,
  ExternalLink,
  GraduationCap,
  ImagePlus,
  Link as LinkIcon,
  MapPin,
  Plus,
  Save,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import type { College, Department, Program, University, UniversityLink, UniversityVideo } from '../../types';

type UniversityDraft = Omit<University, 'id'> & { id?: string };

interface UniversityEditorModalProps {
  initialUniversity?: University | null;
  saving: boolean;
  onClose: () => void;
  onSave: (university: UniversityDraft) => Promise<void>;
  onUploadCover: (universityId: string, file: File) => Promise<string>;
  onUploadGallery: (universityId: string, files: File[]) => Promise<string[]>;
  standalone?: boolean;
}

const emptyUniversity = (): UniversityDraft => ({
  name: '',
  slug: '',
  description: '',
  academicOverview: '',
  website: '',
  studentPortal: '',
  applicationUrl: '',
  mapUrl: '',
  address: '',
  contactEmail: '',
  phone: '',
  admissionsEmail: '',
  admissionsPhone: '',
  established: new Date().getFullYear(),
  type: 'Public',
  studentPopulation: '',
  facultyCount: '',
  mission: '',
  vision: '',
  accreditation: '',
  admissionOverview: '',
  tuitionOverview: '',
  admissionRequirements: [],
  scholarships: [],
  applicationDeadlines: [],
  studyModes: [],
  image: '',
  galleryImages: [],
  location: { city: '', region: '' },
  campuses: [],
  facilities: [],
  colleges: [],
  importantLinks: [],
});

const asDetailedProgram = (program: string | Program): Program =>
  typeof program === 'string' ? { name: program } : program;

const UniversityEditorModal: React.FC<UniversityEditorModalProps> = ({
  initialUniversity,
  saving,
  onClose,
  onSave,
  onUploadCover,
  onUploadGallery,
  standalone = false,
}) => {
  const [draft, setDraft] = useState<UniversityDraft>(() => ({
    ...emptyUniversity(),
    ...initialUniversity,
    location: {
      ...emptyUniversity().location,
      ...initialUniversity?.location,
      coordinates: initialUniversity?.location.coordinates || initialUniversity?.coordinates,
    },
    colleges: initialUniversity?.colleges || [],
    galleryImages: initialUniversity?.galleryImages || [],
    videos: initialUniversity?.videos || [],
    importantLinks: initialUniversity?.importantLinks || [],
    campuses: initialUniversity?.campuses || [],
    facilities: initialUniversity?.facilities || [],
  }));
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [galleryMessage, setGalleryMessage] = useState<string | null>(null);

  const setField = <K extends keyof UniversityDraft>(key: K, value: UniversityDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const setLocation = (key: 'city' | 'region', value: string) => {
    setDraft((current) => ({
      ...current,
      location: { ...current.location, [key]: value },
    }));
  };

  const updateCollege = (collegeIndex: number, patch: Partial<College>) => {
    setField('colleges', (draft.colleges || []).map((college, index) =>
      index === collegeIndex ? { ...college, ...patch } : college
    ));
  };

  const updateDepartment = (collegeIndex: number, departmentIndex: number, patch: Partial<Department>) => {
    const college = (draft.colleges || [])[collegeIndex];
    const departments = (college.departments || []).map((department, index) =>
      index === departmentIndex ? { ...department, ...patch } : department
    );
    updateCollege(collegeIndex, { departments });
  };

  const updateProgram = (
    collegeIndex: number,
    departmentIndex: number,
    programIndex: number,
    patch: Partial<Program>
  ) => {
    const department = ((draft.colleges || [])[collegeIndex].departments || [])[departmentIndex];
    const programs = (department.programs || []).map((program, index) =>
      index === programIndex ? { ...asDetailedProgram(program), ...patch } : program
    );
    updateDepartment(collegeIndex, departmentIndex, { programs });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave({
      ...draft,
      slug: draft.slug?.trim() || undefined,
      coordinates: draft.location.coordinates,
    });
  };

  const handleGalleryUpload = async () => {
    if (!draft.id || !galleryFiles.length) return;
    setUploadingGallery(true);
    setGalleryMessage(null);
    try {
      const uploadedUrls = await onUploadGallery(draft.id, galleryFiles);
      setField('galleryImages', [...(draft.galleryImages || []), ...uploadedUrls]);
      setGalleryFiles([]);
      setGalleryMessage(`${uploadedUrls.length} image${uploadedUrls.length === 1 ? '' : 's'} added to the gallery.`);
    } catch (error: any) {
      setGalleryMessage(error?.message || 'Gallery upload failed');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleCoverUpload = async () => {
    if (!draft.id || !coverFile) return;
    setUploadingCover(true);
    setGalleryMessage(null);
    try {
      const imageUrl = await onUploadCover(draft.id, coverFile);
      setField('image', imageUrl);
      setCoverFile(null);
      setGalleryMessage('Primary cover image updated.');
    } catch (error: any) {
      setGalleryMessage(error?.message || 'Cover upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10';
  return (
    <div className={standalone
      ? 'min-h-screen bg-[#f6f4ef] px-3 py-6 sm:px-6 lg:py-10'
      : 'fixed inset-0 z-[100] overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6'
    }>
      <div className={`mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-slate-50 shadow-2xl ${standalone ? '' : 'my-4'}`}>
        <div className="sticky top-0 z-20 flex items-center justify-between bg-slate-950 px-6 py-5 text-white sm:px-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">University directory</p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              {initialUniversity ? `Edit ${initialUniversity.name}` : 'Add a university'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl bg-white/10 p-2.5 transition hover:bg-white/20" aria-label="Close editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-5 sm:p-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <SectionTitle icon={Building2} title="Institution identity" subtitle="Core information shown throughout the directory." />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="University name *" className="md:col-span-2">
                <input required className={inputClass} value={draft.name} onChange={(e) => setField('name', e.target.value)} />
              </Field>
              <Field label="URL slug">
                <input className={inputClass} value={draft.slug || ''} onChange={(e) => setField('slug', e.target.value)} placeholder="generated-from-name" />
              </Field>
              <Field label="Institution type">
                <select className={inputClass} value={draft.type || 'Public'} onChange={(e) => setField('type', e.target.value as 'Public' | 'Private')}>
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </Field>
              <Field label="Established">
                <input type="number" min="1800" max="2100" className={inputClass} value={draft.established || ''} onChange={(e) => setField('established', Number(e.target.value))} />
              </Field>
              <Field label="Accreditation">
                <input className={inputClass} value={draft.accreditation || ''} onChange={(e) => setField('accreditation', e.target.value)} placeholder="Accrediting body or status" />
              </Field>
              <Field label="Short summary *" className="md:col-span-2">
                <textarea required rows={4} className={inputClass} value={draft.description} onChange={(e) => setField('description', e.target.value)} placeholder="A concise introduction used on cards and overview pages." />
              </Field>
              <Field label="Detailed academic overview" className="md:col-span-2">
                <textarea rows={8} className={inputClass} value={draft.academicOverview || ''} onChange={(e) => setField('academicOverview', e.target.value)} placeholder="Add a detailed history, academic strengths, research profile, teaching approach, partnerships, and student opportunities." />
              </Field>
              <Field label="Mission">
                <textarea rows={4} className={inputClass} value={draft.mission || ''} onChange={(e) => setField('mission', e.target.value)} />
              </Field>
              <Field label="Vision">
                <textarea rows={4} className={inputClass} value={draft.vision || ''} onChange={(e) => setField('vision', e.target.value)} />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <SectionTitle icon={MapPin} title="Location and contact" subtitle="Add the institution address and its shareable Google Maps link for exact directions." />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Field label="City *"><input required className={inputClass} value={draft.location.city} onChange={(e) => setLocation('city', e.target.value)} /></Field>
              <Field label="Region *"><input required className={inputClass} value={draft.location.region} onChange={(e) => setLocation('region', e.target.value)} /></Field>
              <Field label="Full address"><input className={inputClass} value={draft.address || ''} onChange={(e) => setField('address', e.target.value)} /></Field>
              <Field label="Google Maps link">
                <input
                  type="url"
                  className={inputClass}
                  value={draft.mapUrl || ''}
                  onChange={(e) => setField('mapUrl', e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </Field>
              <Field label="General email"><input type="email" className={inputClass} value={draft.contactEmail || ''} onChange={(e) => setField('contactEmail', e.target.value)} /></Field>
              <Field label="General phone"><input className={inputClass} value={draft.phone || ''} onChange={(e) => setField('phone', e.target.value)} /></Field>
              <Field label="Admissions email"><input type="email" className={inputClass} value={draft.admissionsEmail || ''} onChange={(e) => setField('admissionsEmail', e.target.value)} /></Field>
              <Field label="Admissions phone"><input className={inputClass} value={draft.admissionsPhone || ''} onChange={(e) => setField('admissionsPhone', e.target.value)} /></Field>
              <Field label="Student population"><input className={inputClass} value={draft.studentPopulation || ''} onChange={(e) => setField('studentPopulation', e.target.value)} placeholder="e.g. 24,000+" /></Field>
              <Field label="Faculty count"><input className={inputClass} value={draft.facultyCount || ''} onChange={(e) => setField('facultyCount', e.target.value)} placeholder="e.g. 1,200+" /></Field>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <SectionTitle icon={CircleDollarSign} title="Admissions, tuition and scholarships" subtitle="Publish transparent costs and enrollment information, especially for private colleges." />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Admissions overview">
                <textarea rows={6} className={inputClass} value={draft.admissionOverview || ''} onChange={(event) => setField('admissionOverview', event.target.value)} placeholder="Explain the application process, eligibility, entrance assessment, selection, and enrollment steps." />
              </Field>
              <Field label="General tuition and fee overview">
                <textarea rows={6} className={inputClass} value={draft.tuitionOverview || ''} onChange={(event) => setField('tuitionOverview', event.target.value)} placeholder="Explain tuition policy, payment plans, included services, and whether costs vary by program." />
              </Field>
              <Field label="General admission requirements (one per line)">
                <textarea rows={5} className={inputClass} value={(draft.admissionRequirements || []).join('\n')} onChange={(event) => setField('admissionRequirements', lines(event.target.value))} placeholder={'Completed application\nAcademic transcripts\nEntrance examination'} />
              </Field>
              <Field label="Scholarships and financial aid (one per line)">
                <textarea rows={5} className={inputClass} value={(draft.scholarships || []).join('\n')} onChange={(event) => setField('scholarships', lines(event.target.value))} placeholder={'Merit scholarship\nNeed-based assistance\nInstallment payment plan'} />
              </Field>
              <Field label="Application deadlines or intakes (one per line)">
                <textarea rows={4} className={inputClass} value={(draft.applicationDeadlines || []).join('\n')} onChange={(event) => setField('applicationDeadlines', lines(event.target.value))} placeholder={'September intake: applications close July 30\nFebruary intake: applications close December 15'} />
              </Field>
              <Field label="Available study modes (one per line)">
                <textarea rows={4} className={inputClass} value={(draft.studyModes || []).join('\n')} onChange={(event) => setField('studyModes', lines(event.target.value))} placeholder={'Regular\nEvening\nWeekend\nDistance'} />
              </Field>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <SectionTitle icon={ExternalLink} title="Web links and media" subtitle="Manage official destinations, the primary cover, image gallery, and university videos." />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Official website *"><input required type="url" className={inputClass} value={draft.website} onChange={(e) => setField('website', e.target.value)} /></Field>
              <Field label="Student portal"><input type="url" className={inputClass} value={draft.studentPortal || ''} onChange={(e) => setField('studentPortal', e.target.value)} /></Field>
              <Field label="Application portal"><input type="url" className={inputClass} value={draft.applicationUrl || ''} onChange={(e) => setField('applicationUrl', e.target.value)} /></Field>
              <Field label="Primary image URL"><input type="url" className={inputClass} value={draft.image || ''} onChange={(e) => setField('image', e.target.value)} /></Field>
              <Field label="Gallery image URLs (one per line)" className="md:col-span-2">
                <textarea rows={4} className={inputClass} value={(draft.galleryImages || []).join('\n')} onChange={(e) => setField('galleryImages', lines(e.target.value))} />
              </Field>
              <Field label="Campuses (one per line)"><textarea rows={4} className={inputClass} value={(draft.campuses || []).join('\n')} onChange={(e) => setField('campuses', lines(e.target.value))} /></Field>
              <Field label="Facilities and services (one per line)"><textarea rows={4} className={inputClass} value={(draft.facilities || []).join('\n')} onChange={(e) => setField('facilities', lines(e.target.value))} /></Field>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 text-emerald-700 shadow-sm"><ImagePlus className="h-5 w-5" /></div>
                <div>
                  <h4 className="font-black text-slate-900">Main university image slider</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    The cover and every additional gallery image appear together in the large image area beside the university name, type, established year, directions, colleges, and programs.
                  </p>
                </div>
              </div>
              {draft.id ? (
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-emerald-100 bg-white p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-600">Primary cover</p>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} className="w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:font-bold file:text-white" />
                    <button type="button" disabled={!coverFile || uploadingCover} onClick={handleCoverUpload} className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">
                      {uploadingCover ? 'Uploading cover...' : 'Upload cover image'}
                    </button>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-white p-4">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-600">Additional slider images</p>
                    <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setGalleryFiles(Array.from(event.target.files || []))} className="w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:px-3 file:py-2 file:font-bold file:text-white" />
                    <button type="button" disabled={!galleryFiles.length || uploadingGallery} onClick={handleGalleryUpload} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">
                      <ImagePlus className="h-4 w-4" /> {uploadingGallery ? 'Uploading images...' : `Add ${galleryFiles.length || ''} image${galleryFiles.length === 1 ? '' : 's'} to slider`}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-xl bg-white p-3 text-xs font-bold text-amber-700">
                  Create the university first, then reopen Edit to upload gallery files.
                </p>
              )}
              {galleryMessage && <p className="mt-3 text-xs font-bold text-slate-700">{galleryMessage}</p>}
              {(draft.galleryImages?.length || 0) > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {draft.galleryImages?.map((image, index) => (
                    <div key={`${image}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img src={image} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setField('galleryImages', (draft.galleryImages || []).filter((_, itemIndex) => itemIndex !== index))}
                        className="absolute right-2 top-2 rounded-lg bg-red-600 p-1.5 text-white opacity-100 shadow-lg sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label={`Remove gallery image ${index + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <VideoEditor videos={draft.videos || []} onChange={(videos) => setField('videos', videos)} inputClass={inputClass} />
            <LinkEditor links={draft.importantLinks || []} onChange={(links) => setField('importantLinks', links)} inputClass={inputClass} />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionTitle icon={GraduationCap} title="Colleges, departments and programs" subtitle="Build a searchable academic directory with detailed program information." />
              <button type="button" onClick={() => setField('colleges', [...(draft.colleges || []), { name: '', description: '', departments: [] }])} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-800">
                <Plus className="h-4 w-4" /> Add college
              </button>
            </div>

            <div className="space-y-5">
              {(draft.colleges || []).map((college, collegeIndex) => (
                <div key={collegeIndex} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_2fr_auto]">
                    <input className={inputClass} value={college.name} onChange={(e) => updateCollege(collegeIndex, { name: e.target.value })} placeholder="College name" />
                    <input className={inputClass} value={college.description || ''} onChange={(e) => updateCollege(collegeIndex, { description: e.target.value })} placeholder="College summary" />
                    <button type="button" onClick={() => setField('colleges', (draft.colleges || []).filter((_, index) => index !== collegeIndex))} className="rounded-xl p-3 text-red-600 hover:bg-red-50" aria-label="Remove college"><Trash2 className="h-5 w-5" /></button>
                    <input type="url" className={`${inputClass} md:col-span-2 lg:col-span-3`} value={college.website || ''} onChange={(e) => updateCollege(collegeIndex, { website: e.target.value })} placeholder="Official college or school page (optional)" />
                  </div>

                  <div className="mt-4 space-y-4">
                    {(college.departments || []).map((department, departmentIndex) => (
                      <div key={departmentIndex} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                          <input className={inputClass} value={department.name} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { name: e.target.value })} placeholder="Department name" />
                          <input className={inputClass} value={department.duration || ''} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { duration: e.target.value })} placeholder="Typical duration" />
                          <input className={inputClass} value={department.head || ''} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { head: e.target.value })} placeholder="Department head" />
                          <button type="button" onClick={() => updateCollege(collegeIndex, { departments: (college.departments || []).filter((_, index) => index !== departmentIndex) })} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Remove</button>
                          <textarea rows={3} className={`${inputClass} md:col-span-2 lg:col-span-4`} value={department.description || ''} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { description: e.target.value })} placeholder="Detailed department scope, teaching and research focus" />
                          <input type="email" className={`${inputClass} md:col-span-1 lg:col-span-2`} value={department.contactEmail || ''} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { contactEmail: e.target.value })} placeholder="Department contact email" />
                          <input type="url" className={`${inputClass} md:col-span-1 lg:col-span-2`} value={department.website || ''} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { website: e.target.value })} placeholder="Official department page" />
                          <textarea rows={3} className={`${inputClass} md:col-span-1 lg:col-span-2`} value={(department.researchAreas || []).join('\n')} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { researchAreas: lines(e.target.value) })} placeholder={'Research areas (one per line)\nArtificial intelligence\nData science'} />
                          <textarea rows={3} className={`${inputClass} md:col-span-1 lg:col-span-2`} value={(department.facilities || []).join('\n')} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { facilities: lines(e.target.value) })} placeholder={'Department facilities (one per line)\nTeaching laboratory\nResearch center'} />
                          <textarea rows={3} className={`${inputClass} md:col-span-1 lg:col-span-2`} value={(department.learningOutcomes || []).join('\n')} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { learningOutcomes: lines(e.target.value) })} placeholder={'Learning outcomes (one per line)\nDesign practical solutions\nConduct applied research'} />
                          <textarea rows={3} className={`${inputClass} md:col-span-1 lg:col-span-2`} value={(department.careerPaths || []).join('\n')} onChange={(e) => updateDepartment(collegeIndex, departmentIndex, { careerPaths: lines(e.target.value) })} placeholder={'Career paths (one per line)\nEngineer\nResearcher\nConsultant'} />
                        </div>

                        <div className="mt-4 space-y-3 border-l-2 border-emerald-200 pl-4">
                          {(department.programs || []).map((program, programIndex) => {
                            const detail = asDetailedProgram(program);
                            return (
                              <div key={programIndex} className="grid gap-3 rounded-xl bg-emerald-50/60 p-3 md:grid-cols-2 lg:grid-cols-4">
                                <input className={inputClass} value={detail.name} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { name: e.target.value })} placeholder="Program name" />
                                <input className={inputClass} value={detail.level || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { level: e.target.value })} placeholder="Level (BSc, MSc, PhD)" />
                                <input className={inputClass} value={detail.duration || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { duration: e.target.value })} placeholder="Duration" />
                                <button type="button" onClick={() => updateDepartment(collegeIndex, departmentIndex, { programs: (department.programs || []).filter((_, index) => index !== programIndex) })} className="rounded-xl text-xs font-bold text-red-600 hover:bg-red-50">Remove program</button>
                                <textarea rows={2} className={`${inputClass} md:col-span-2 lg:col-span-4`} value={detail.description || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { description: e.target.value })} placeholder="Program outcomes, curriculum focus, and career pathways" />
                                <input className={inputClass} value={detail.tuitionAmount || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { tuitionAmount: e.target.value })} placeholder="Tuition amount (e.g. 18,500)" />
                                <input className={inputClass} value={detail.tuitionCurrency || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { tuitionCurrency: e.target.value })} placeholder="Currency (ETB, USD)" />
                                <input className={inputClass} value={detail.tuitionPeriod || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { tuitionPeriod: e.target.value })} placeholder="Per semester / year / credit" />
                                <input className={inputClass} value={detail.registrationFee || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { registrationFee: e.target.value })} placeholder="Registration fee" />
                                <input className={inputClass} value={detail.studyMode || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { studyMode: e.target.value })} placeholder="Study mode" />
                                <input className={inputClass} value={detail.intake || ''} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { intake: e.target.value })} placeholder="Intake (September, February)" />
                                <textarea rows={3} className={`${inputClass} md:col-span-2`} value={(detail.requirements || []).join('\n')} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { requirements: lines(e.target.value) })} placeholder={'Program requirements (one per line)\nGrade 12 certificate\nEntrance exam'} />
                                <textarea rows={3} className={`${inputClass} md:col-span-2`} value={(detail.scholarships || []).join('\n')} onChange={(e) => updateProgram(collegeIndex, departmentIndex, programIndex, { scholarships: lines(e.target.value) })} placeholder={'Program scholarships (one per line)\nTop achiever award'} />
                              </div>
                            );
                          })}
                          <button type="button" onClick={() => updateDepartment(collegeIndex, departmentIndex, { programs: [...(department.programs || []), { name: '', level: '', duration: '', description: '' }] })} className="inline-flex items-center gap-2 text-xs font-black text-emerald-700"><Plus className="h-4 w-4" /> Add program</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateCollege(collegeIndex, { departments: [...(college.departments || []), { name: '', duration: '', description: '', head: '', contactEmail: '', website: '', researchAreas: [], facilities: [], learningOutcomes: [], careerPaths: [], programs: [] }] })} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 px-4 py-2.5 text-xs font-black text-emerald-700 hover:bg-emerald-50">
                      <Plus className="h-4 w-4" /> Add department
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="sticky bottom-3 flex justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
            <button disabled={saving} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : initialUniversity ? 'Save changes' : 'Create university'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const lines = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);

const Field: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className = '', children }) => (
  <label className={className}>
    <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wider text-slate-500">{label}</span>
    {children}
  </label>
);

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; subtitle: string }> = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-6 flex items-start gap-3">
    <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700"><Icon className="h-5 w-5" /></div>
    <div>
      <h3 className="font-black text-slate-900">{title}</h3>
      <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);

const LinkEditor: React.FC<{ links: UniversityLink[]; onChange: (links: UniversityLink[]) => void; inputClass: string }> = ({ links, onChange, inputClass }) => (
  <div className="mt-6 border-t border-slate-100 pt-6">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-800"><LinkIcon className="h-4 w-4 text-emerald-600" /> Additional useful links</div>
      <button type="button" onClick={() => onChange([...links, { label: '', url: '', description: '' }])} className="inline-flex items-center gap-1 text-xs font-black text-emerald-700"><Plus className="h-4 w-4" /> Add link</button>
    </div>
    <div className="space-y-3">
      {links.map((link, index) => (
        <div key={index} className="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_1.5fr_2fr_auto]">
          <input className={inputClass} value={link.label} onChange={(e) => onChange(links.map((item, i) => i === index ? { ...item, label: e.target.value } : item))} placeholder="Label" />
          <input type="url" className={inputClass} value={link.url} onChange={(e) => onChange(links.map((item, i) => i === index ? { ...item, url: e.target.value } : item))} placeholder="https://..." />
          <input className={inputClass} value={link.description || ''} onChange={(e) => onChange(links.map((item, i) => i === index ? { ...item, description: e.target.value } : item))} placeholder="Short description" />
          <button type="button" onClick={() => onChange(links.filter((_, i) => i !== index))} className="rounded-xl p-3 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  </div>
);

const VideoEditor: React.FC<{ videos: UniversityVideo[]; onChange: (videos: UniversityVideo[]) => void; inputClass: string }> = ({ videos, onChange, inputClass }) => (
  <div className="mt-6 border-t border-slate-100 pt-6">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm font-black text-slate-800"><Video className="h-4 w-4 text-emerald-600" /> University videos</div>
      <button type="button" onClick={() => onChange([...videos, { title: '', url: '', description: '' }])} className="inline-flex items-center gap-1 text-xs font-black text-emerald-700"><Plus className="h-4 w-4" /> Add video</button>
    </div>
    <p className="mb-4 text-xs text-slate-500">Supports YouTube, Vimeo, and direct MP4/WebM video links. Other links open on their original website.</p>
    <div className="space-y-3">
      {videos.map((video, index) => (
        <div key={index} className="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_1.5fr_2fr_auto]">
          <input className={inputClass} value={video.title} onChange={(event) => onChange(videos.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item))} placeholder="Video title" />
          <input type="url" className={inputClass} value={video.url} onChange={(event) => onChange(videos.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="https://youtube.com/..." />
          <input className={inputClass} value={video.description || ''} onChange={(event) => onChange(videos.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} placeholder="What viewers will learn" />
          <button type="button" onClick={() => onChange(videos.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl p-3 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
    </div>
  </div>
);

export default UniversityEditorModal;
