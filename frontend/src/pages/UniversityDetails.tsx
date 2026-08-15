import React, { useDeferredValue, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CircleDollarSign,
  GraduationCap,
  Globe2,
  Mail,
  MapPin,
  Maximize2,
  Play,
  Phone,
  Search,
  Sparkles,
  Video,
  X,
  Users,
  Star,
  MessageSquare,
  Send
} from 'lucide-react';
import type { Department, Program, University, UniversityVideo, User, UniversityReviewItem } from '../types';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedUniversityContent } from '../i18n/universityLocalization';
import { SEO, buildUniversitySchema } from '../components/SEO';
import { api } from '../services/api';
import AuthRequiredModal from '../components/AuthRequiredModal';

interface UniversityDetailsProps {
  universities: University[];
  user?: User | null;
}

interface DepartmentEntry {
  collegeName: string;
  department: Department;
}

function coordinatesFromGoogleMapsUrl(mapUrl?: string): { lat: number; lng: number } | null {
  if (!mapUrl) return null;
  const match = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match && match[1] && match[2]) {
    return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
}

function displayUrl(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function phoneHref(phone: string): string {
  return phone.replace(/[^0-9+]/g, '');
}

const UniversityDetails: React.FC<UniversityDetailsProps> = ({ universities, user }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const university = universities.find((item) => item.slug === slug);
  const [currentImage, setCurrentImage] = useState(0);
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const deferredQuery = useDeferredValue(departmentQuery.trim().toLowerCase());

  // Reviews state
  const [reviews, setReviews] = useState<UniversityReviewItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const fetchReviews = async () => {
    if (!slug) return;
    try {
      setLoadingReviews(true);
      const res = await api.getUniversityReviews(slug);
      setReviews(res.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [slug]);

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!commentInput.trim()) {
      setReviewError('Please write your experience or review');
      return;
    }
    try {
      setReviewSubmitting(true);
      setReviewError(null);
      const res = await api.createUniversityReview(slug || '', {
        rating: ratingInput,
        comment: commentInput,
      });
      setReviewSuccess(res.message || 'Review submitted successfully!');
      setCommentInput('');
      setRatingInput(5);
      setTimeout(() => setReviewSuccess(null), 3000);
      fetchReviews();
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (!university) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
        <SEO title="University Not Found" noIndex description="The requested university page could not be found." />
        <Building2 className="mb-5 h-12 w-12 text-slate-300" />
        <h1 className="text-3xl font-black text-slate-900">University not found</h1>
        <p className="mt-3 text-slate-500">This institution may have been removed or its address may have changed.</p>
        <Link to="/universities" className="mt-7 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Browse universities</Link>
      </main>
    );
  }

  const { t, language } = useLanguage();
  const localized = getLocalizedUniversityContent(university, language);

  const images = Array.from(new Set(
    [university.image, ...(university.galleryImages || [])].filter((image): image is string => Boolean(image?.trim()))
  ));
  if (images.length === 0) images.push(getOptimizedImageUrl(undefined, 1800));

  const linkedCoordinates = coordinatesFromGoogleMapsUrl(university.mapUrl);
  const coordinates = linkedCoordinates || university.location.coordinates || university.coordinates;
  const hasCoordinates = Number.isFinite(coordinates?.lat) && Number.isFinite(coordinates?.lng)
    && !(coordinates?.lat === 0 && coordinates?.lng === 0);
  const locationText = [university.address, university.location.city, university.location.region].filter(Boolean).join(', ');
  const mapsUrl = university.mapUrl
    || (hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${coordinates?.lat},${coordinates?.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${localized.name}, ${locationText}`)}`);
  const embedMapUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${coordinates?.lat},${coordinates?.lng}&z=15&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(`${localized.name}, ${locationText}`)}&z=14&output=embed`;

  const departments: DepartmentEntry[] = (university.colleges || []).flatMap((college) =>
    (college.departments || []).map((department) => ({ collegeName: college.name, department }))
  );
  const filteredDepartments = departments.filter(({ collegeName, department }) => {
    if (!deferredQuery) return true;
    const programs = (department.programs || []).map((program) => typeof program === 'string' ? program : program.name);
    return [collegeName, department.name, department.description, ...(department.researchAreas || []), ...(department.careerPaths || []), ...programs]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(deferredQuery));
  });
  const programCount = departments.reduce((total, entry) => total + (entry.department.programs?.length || 0), 0);
  const hasAdmissionsInformation = Boolean(
    localized.admissionOverview
    || localized.tuitionOverview
    || localized.admissionRequirements?.length
    || localized.scholarships?.length
    || university.applicationDeadlines?.length
    || university.studyModes?.length
  );

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-slate-900">
      <SEO
        title={localized.name}
        description={localized.description || `${localized.name} — degree programs, ESSLCE entrance cutoffs, faculties, and official campus details in Ethiopia.`}
        keywords={[localized.name, university.location.city, university.location.region, university.type, 'Ethiopian university', 'Grade 12 ESSLCE']}
        image={university.image || undefined}
        type="college"
        structuredData={buildUniversitySchema(university, localized.name, localized.description)}
      />
      
      {/* Top Bar Navigation */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> {t('close')}
          </button>
          <div className="hidden min-w-0 items-center gap-2 text-xs font-bold text-slate-400 sm:flex">
            <Link to="/" className="hover:text-emerald-700">{t('navUniversities')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-slate-700">{localized.name}</span>
          </div>
        </div>
      </div>

      {/* Prominent Hero Gallery & Upward Contact Info Header */}
      <header className="relative overflow-hidden bg-[#10231d]">
        <div className="absolute inset-0">
          <img src={getOptimizedImageUrl(images[currentImage], 1800)} alt="" aria-hidden="true" className="h-full w-full scale-110 object-cover opacity-30 blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10231d] via-[#10231d]/80 to-[#10231d]/40" />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-10 lg:py-12">
          
          {/* Left Album / Photo Gallery Slider (7 Cols) */}
          <div className="lg:col-span-7 relative min-h-[380px] overflow-hidden rounded-[2rem] border border-white/15 bg-black/25 shadow-2xl sm:min-h-[480px]">
            <img
              key={images[currentImage]}
              src={getOptimizedImageUrl(images[currentImage], 1800)}
              alt={`${localized.name} campus ${currentImage + 1}`}
              className="absolute inset-0 h-full w-full object-contain p-2 sm:p-4"
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            {images.length > 1 && (
              <>
                <button onClick={() => setCurrentImage((index) => (index - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-3 text-white backdrop-blur transition hover:bg-emerald-600 cursor-pointer" aria-label="Previous image">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={() => setCurrentImage((index) => (index + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-3 text-white backdrop-blur transition hover:bg-emerald-600 cursor-pointer" aria-label="Next image">
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/45 px-3 py-2 backdrop-blur">
                  {images.map((_, index) => (
                    <button key={index} onClick={() => setCurrentImage(index)} className={`h-2 rounded-full transition-all cursor-pointer ${index === currentImage ? 'w-7 bg-emerald-400' : 'w-2 bg-white/55'}`} aria-label={`Show image ${index + 1}`} />
                  ))}
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => setLightboxIndex(currentImage)}
              className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl bg-black/65 px-3 py-2 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-emerald-600 cursor-pointer"
            >
              <Maximize2 className="h-4 w-4" /> {t('tabGallery')}
            </button>
          </div>

          {/* Right Column: Name, Description, Map Location, & Upward Contact Info Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between text-white space-y-5">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {university.type && <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-300/20">{university.type === 'Public' ? t('publicUni') : university.type === 'Private' ? t('privateUni') : university.type}</span>}
                {university.established && <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white/80 ring-1 ring-white/15">{t('established')} {university.established}</span>}
              </div>
              <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">{localized.name}</h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-200 line-clamp-3">{localized.description}</p>
            </div>

            {/* Prominent Contact Info Card moved Upward right next to Album Photo */}
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 space-y-2.5 backdrop-blur shadow-lg">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Official Contacts & Links
                </span>
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> {locationText}
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href={university.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition truncate">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{displayUrl(university.website)}</span>
                </a>
                {university.studentPortal && (
                  <a href={university.studentPortal} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Student Portal</span>
                  </a>
                )}
                {university.contactEmail && (
                  <a href={`mailto:${university.contactEmail}`} className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition truncate">
                    <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{university.contactEmail}</span>
                  </a>
                )}
                {(university.phone || university.contactPhone) && (
                  <a href={`tel:${phoneHref(university.phone || university.contactPhone || '')}`} className="flex items-center gap-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition truncate">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{university.phone || university.contactPhone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Fact Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <Fact icon={GraduationCap} label={t('tabPrograms')} value={String(university.colleges?.length || localized.faculties.length || 0)} />
              <Fact icon={BookOpen} label={t('keyStats')} value={String(programCount || 12)} />
              {university.studentPopulation && <Fact icon={Users} label="Students" value={university.studentPopulation} />}
              {university.facultyCount && <Fact icon={Sparkles} label="Faculty" value={university.facultyCount} />}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="mx-auto max-w-[1440px] space-y-12 px-4 py-10 sm:px-6 lg:px-10">
        
        {/* Full-Width Overview Section */}
        <section className="w-full">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <SectionEyebrow>{t('tabOverview')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{localized.name} Academic Profile</h2>
            <div className="mt-6 whitespace-pre-line text-[16px] leading-8 text-slate-600">
              {localized.academicOverview}
            </div>
            {(localized.mission || localized.vision) && (
              <div className="mt-9 grid gap-4 md:grid-cols-2">
                {localized.mission && <NarrativeCard title="Mission" text={localized.mission} />}
                {localized.vision && <NarrativeCard title="Vision" text={localized.vision} />}
              </div>
            )}
          </article>
        </section>

        {/* Student Reviews & Community Feedback Section */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Student Community Feedback</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Reviews & Experiences for {localized.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Authentic feedback, admission cutoffs advice, and campus life experiences shared by students & alumni
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 shrink-0">
              <div className="text-center px-2">
                <span className="text-2xl font-black text-slate-900">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : '4.8'}
                </span>
                <div className="flex items-center gap-0.5 justify-center text-amber-400 mt-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3 h-3 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 font-bold">{reviews.length} community reviews</span>
              </div>
            </div>
          </div>

          {/* Post a Review Form */}
          <form onSubmit={handlePostReview} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Add Your Experience / Rating for Applicants
              </span>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-slate-600 mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRatingInput(star)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratingInput
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={`Share authentic feedback about ${localized.name}'s campus life, dormitories, academic departments, or admission cutoff advice...`}
              className="w-full bg-white rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition"
            />

            {reviewError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                {reviewError}
              </p>
            )}

            {reviewSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                {reviewSuccess}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{reviewSubmitting ? 'Posting...' : 'Submit Student Feedback'}</span>
              </button>
            </div>
          </form>

          {/* Existing Reviews List */}
          <div className="space-y-4 pt-2">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-xs flex items-center justify-center overflow-hidden">
                      {rev.authorAvatar ? (
                        <img src={rev.authorAvatar} alt={rev.authorName} className="w-full h-full object-cover" />
                      ) : (
                        rev.authorName.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.authorName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-700 font-medium whitespace-pre-line pl-11">
                  {rev.comment}
                </p>
              </div>
            ))}

            {!reviews.length && !loadingReviews && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No student reviews posted yet. Be the first to share your experience with applicants!
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="h-[380px] bg-slate-100">
              <iframe title={`${localized.name} map`} src={embedMapUrl} className="h-full w-full border-0" loading="lazy" allowFullScreen />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">{t('mapLocation')}</p>
                <p className="mt-1 font-bold text-slate-800">{locationText}</p>
              </div>
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700">
                Google Maps <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <SectionEyebrow>{t('tabGallery')}</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight">{t('campusPhotos')}</h2>
            {(localized.campuses.length > 0) && (
              <div className="mt-6">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">{t('locationLabel')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {localized.campuses.map((campus) => (
                    <div key={campus} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 font-bold text-slate-700">
                      <MapPin className="h-4 w-4 shrink-0 text-emerald-600" /> {campus}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(localized.facilities.length > 0) && (
              <div className="mt-7">
                <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">{t('keyStats')}</p>
                <div className="flex flex-wrap gap-2">
                  {localized.facilities.map((facility) => (
                    <span key={facility} className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!university.campuses?.length && !university.facilities?.length && (
              <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">Campus and facility information has not been published yet.</p>
            )}
          </div>
        </section>

        {hasAdmissionsInformation && (
          <section className="rounded-[2rem] border border-amber-200 bg-[#fffaf0] p-6 shadow-sm sm:p-9">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <SectionEyebrow>{t('tabAdmission')}</SectionEyebrow>
                <h2 className="mt-3 text-3xl font-black tracking-tight">{t('admissionRequirements')}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('esslceNote')}</p>
              </div>
              {university.applicationUrl && (
                <a href={university.applicationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
                  {t('tabAdmission')} <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {localized.admissionOverview && <InformationPanel icon={GraduationCap} title={t('admissionRequirements')} text={localized.admissionOverview} />}
              {localized.tuitionOverview && <InformationPanel icon={CircleDollarSign} title={t('keyStats')} text={localized.tuitionOverview} />}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <InformationList title={t('tabAdmission')} items={localized.admissionRequirements} />
              <InformationList title="Scholarships / Remedial" items={localized.scholarships} icon={Award} />
              <InformationList title="Intakes and deadlines" items={university.applicationDeadlines || []} />
              <InformationList title="Study modes" items={university.studyModes || []} />
            </div>
          </section>
        )}

        <section id="academics">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <SectionEyebrow>{t('tabPrograms')}</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t('programsOffered')}</h2>
              <p className="mt-2 text-slate-500">{t('heroSearchPlaceholder')}</p>
            </div>
            <label className="relative block w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input value={departmentQuery} onChange={(event) => setDepartmentQuery(event.target.value)} placeholder={t('heroSearchPlaceholder')} className="w-full rounded-2xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
            </label>
          </div>

          <div className="mt-7 space-y-4">
            {filteredDepartments.map(({ collegeName, department }, index) => {
              const key = `${collegeName}-${department.name}-${index}`;
              const isExpanded = expandedDepartment === key;
              return (
                <article key={key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200">
                  <button onClick={() => setExpandedDepartment(isExpanded ? null : key)} className="flex w-full items-center gap-4 p-5 text-left sm:p-6">
                    <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700"><BookOpen className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">{collegeName}</p>
                      <h3 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">{department.name}</h3>
                    </div>
                    {department.duration && <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 sm:block">{department.duration}</span>}
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-6 sm:px-6">
                      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                          <p className="text-sm leading-7 text-slate-600">{department.description || 'Detailed department information will be published soon.'}</p>
                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                            {department.duration && <span className="rounded-lg bg-slate-100 px-3 py-2">Duration: {department.duration}</span>}
                            {department.head && <span className="rounded-lg bg-slate-100 px-3 py-2">Head: {department.head}</span>}
                          </div>
                          {(department.contactEmail || department.website) && (
                            <div className="mt-4 flex flex-wrap gap-3">
                              {department.contactEmail && <a href={`mailto:${department.contactEmail}`} className="inline-flex items-center gap-2 text-xs font-black text-emerald-700">Email department <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                              {department.website && <a href={department.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-emerald-700">Official department page <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                            </div>
                          )}
                          <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <DepartmentList title="Research areas" items={department.researchAreas || []} />
                            <DepartmentList title="Facilities" items={department.facilities || []} />
                            <DepartmentList title="What students learn" items={department.learningOutcomes || []} />
                            <DepartmentList title="Career paths" items={department.careerPaths || []} />
                          </div>
                        </div>
                        <div>
                          <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">Available programs</p>
                          {(department.programs?.length || 0) > 0 ? (
                            <div className="space-y-3">
                              {department.programs?.map((program, programIndex) => (
                                <ProgramCard key={programIndex} program={program} />
                              ))}
                            </div>
                          ) : (
                            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Program listings have not been added for this department.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            {filteredDepartments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 font-bold text-slate-700">{departments.length ? 'No matching department or program' : 'Academic listings are coming soon'}</p>
                <p className="mt-1 text-sm text-slate-500">{departments.length ? 'Try a broader search term.' : 'The university has not published departments through the portal yet.'}</p>
              </div>
            )}
          </div>
        </section>

        {(university.videos?.length || 0) > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <SectionEyebrow>Watch and discover</SectionEyebrow>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">University videos</h2>
                <p className="mt-2 text-slate-500">Campus tours, academic introductions, student stories, and official presentations.</p>
              </div>
              <Video className="hidden h-10 w-10 text-emerald-700 sm:block" />
            </div>
            <div className="mt-7 grid gap-6 lg:grid-cols-2">
              {university.videos?.map((video, index) => (
                <VideoCard key={`${video.url}-${index}`} video={video} />
              ))}
            </div>
          </section>
        )}

        {(university.importantLinks?.length || university.accreditation) && (
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-9">
            <SectionEyebrow light>Explore further</SectionEyebrow>
            <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black">Official resources</h2>
                {university.accreditation && <p className="mt-2 text-sm text-slate-400">Accreditation: {university.accreditation}</p>}
              </div>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {university.importantLinks?.map((link) => (
                <a key={`${link.label}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/40 hover:bg-emerald-400/10">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black">{link.label}</h3>
                    <ArrowUpRight className="h-5 w-5 text-emerald-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                  {link.description && <p className="mt-2 text-sm leading-6 text-slate-400">{link.description}</p>}
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Campus image viewer">
          <button type="button" onClick={() => setLightboxIndex(null)} className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20" aria-label="Close image viewer">
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <button type="button" onClick={() => setLightboxIndex((index) => index === null ? 0 : (index - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-emerald-600 sm:left-6" aria-label="Previous gallery image">
              <ChevronLeft className="h-7 w-7" />
            </button>
          )}
          <img src={getOptimizedImageUrl(images[lightboxIndex], 2000)} alt={`${university.name} full-screen image ${lightboxIndex + 1}`} className="max-h-full max-w-full object-contain" />
          {images.length > 1 && (
            <button type="button" onClick={() => setLightboxIndex((index) => index === null ? 0 : (index + 1) % images.length)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-emerald-600 sm:right-6" aria-label="Next gallery image">
              <ChevronRight className="h-7 w-7" />
            </button>
          )}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionText="leave student reviews & comments"
      />
    </div>
  );
};

const SectionEyebrow: React.FC<{ children: React.ReactNode; light?: boolean }> = ({ children, light }) => (
  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${light ? 'text-emerald-300' : 'text-emerald-700'}`}>{children}</p>
);

const Fact: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
    <Icon className="h-5 w-5 text-emerald-300" />
    <p className="mt-3 text-xl font-black">{value}</p>
    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
  </div>
);

const NarrativeCard: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="rounded-2xl bg-emerald-50 p-5">
    <h3 className="font-black text-emerald-950">{title}</h3>
    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-emerald-950/70">{text}</p>
  </div>
);

const ContactAction: React.FC<{ icon: React.ElementType; label: string; value: string; href: string; external?: boolean }> = ({ icon: Icon, label, value, href, external }) => (
  <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-300/35 hover:bg-white/10">
    <div className="rounded-xl bg-white/10 p-2.5 text-emerald-300"><Icon className="h-5 w-5" /></div>
    <span className="min-w-0 flex-1">
      <span className="block text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <span className="mt-1 block truncate text-sm font-bold">{value}</span>
    </span>
    <ArrowUpRight className="h-4 w-4 text-white/35 transition group-hover:text-emerald-300" />
  </a>
);

const ProgramCard: React.FC<{ program: string | Program }> = ({ program }) => {
  const detail: Program = typeof program === 'string' ? { name: program } : program;
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h4 className="font-black text-slate-800">{detail.name}</h4>
        <div className="flex gap-2">
          {detail.level && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">{detail.level}</span>}
          {detail.duration && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{detail.duration}</span>}
        </div>
      </div>
      {detail.description && <p className="mt-2 text-sm leading-6 text-slate-500">{detail.description}</p>}
      {(detail.tuitionAmount || detail.registrationFee || detail.studyMode || detail.intake) && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {detail.tuitionAmount && (
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-[9px] font-black uppercase tracking-wider text-amber-700">Tuition</p>
              <p className="mt-1 font-black text-slate-900">
                {[detail.tuitionCurrency, detail.tuitionAmount].filter(Boolean).join(' ')}
                {detail.tuitionPeriod && <span className="ml-1 text-xs font-bold text-slate-500">/ {detail.tuitionPeriod}</span>}
              </p>
            </div>
          )}
          {detail.registrationFee && <ProgramFact label="Registration fee" value={`${detail.tuitionCurrency || ''} ${detail.registrationFee}`.trim()} />}
          {detail.studyMode && <ProgramFact label="Study mode" value={detail.studyMode} />}
          {detail.intake && <ProgramFact label="Intake" value={detail.intake} />}
        </div>
      )}
      {(detail.requirements?.length || 0) > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Entry requirements</p>
          <ul className="mt-2 space-y-1.5">
            {detail.requirements?.map((requirement) => <li key={requirement} className="flex gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{requirement}</li>)}
          </ul>
        </div>
      )}
      {(detail.scholarships?.length || 0) > 0 && (
        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900">
          <span className="font-black">Financial support: </span>{detail.scholarships?.join(' • ')}
        </div>
      )}
      {detail.applicationUrl && <a href={detail.applicationUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-emerald-700">Program information <ArrowUpRight className="h-3.5 w-3.5" /></a>}
    </div>
  );
};

const InformationPanel: React.FC<{ icon: React.ElementType; title: string; text: string }> = ({ icon: Icon, title, text }) => (
  <div className="rounded-2xl border border-amber-100 bg-white p-5">
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700"><Icon className="h-5 w-5" /></div>
      <h3 className="font-black text-slate-900">{title}</h3>
    </div>
    <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{text}</p>
  </div>
);

const InformationList: React.FC<{ title: string; items: string[]; icon?: React.ElementType }> = ({ title, items, icon: Icon = CheckCircle2 }) => {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5">
      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-slate-600"><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}</li>)}
      </ul>
    </div>
  );
};

const ProgramFact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
  </div>
);

const DepartmentList: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  if (!items.length) return null;
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => <li key={item} className="flex gap-2 text-xs leading-5 text-slate-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />{item}</li>)}
      </ul>
    </div>
  );
};

const VideoCard: React.FC<{ video: UniversityVideo }> = ({ video }) => {
  const source = videoSource(video.url);
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video bg-slate-950">
        {source.kind === 'embed' && (
          <iframe
            src={source.url}
            title={video.title || 'University video'}
            className="h-full w-full border-0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )}
        {source.kind === 'direct' && (
          <video src={source.url} controls preload="metadata" className="h-full w-full bg-black object-contain">
            Your browser does not support embedded video.
          </video>
        )}
        {source.kind === 'external' && (
          <a href={source.url} target="_blank" rel="noreferrer" className="group flex h-full flex-col items-center justify-center p-6 text-center text-white">
            <div className="rounded-full bg-emerald-600 p-5 transition group-hover:scale-110"><Play className="h-8 w-8 fill-current" /></div>
            <span className="mt-4 text-sm font-black">Watch on the official video page</span>
            <span className="mt-1 text-xs text-slate-400">Opens in a new tab</span>
          </a>
        )}
        {source.kind === 'invalid' && (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm font-bold text-slate-400">This video link is unavailable.</div>
        )}
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-lg font-black text-slate-900">{video.title || 'University video'}</h3>
        {video.description && <p className="mt-2 text-sm leading-6 text-slate-500">{video.description}</p>}
      </div>
    </article>
  );
};

type VideoSource =
  | { kind: 'embed' | 'direct' | 'external'; url: string }
  | { kind: 'invalid'; url?: undefined };

const videoSource = (value: string): VideoSource => {
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) return { kind: 'invalid' };
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id ? { kind: 'embed', url: `https://www.youtube.com/embed/${encodeURIComponent(id)}` } : { kind: 'invalid' };
    }
    if (host.endsWith('youtube.com')) {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = url.searchParams.get('v')
        || (['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : undefined);
      return id ? { kind: 'embed', url: `https://www.youtube.com/embed/${encodeURIComponent(id)}` } : { kind: 'external', url: url.toString() };
    }
    if (host.endsWith('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
      return id ? { kind: 'embed', url: `https://player.vimeo.com/video/${id}` } : { kind: 'external', url: url.toString() };
    }
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { kind: 'direct', url: url.toString() };
    return { kind: 'external', url: url.toString() };
  } catch {
    return { kind: 'invalid' };
  }
};

export default UniversityDetails;
