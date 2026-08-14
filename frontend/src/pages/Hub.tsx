import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  Upload,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  Video,
  Send,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { User, University, EventItem, EventComment, EventCategoryType } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import CustomSelect from '../components/CustomSelect';
import AuthRequiredModal from '../components/AuthRequiredModal';

interface HubProps {
  user: User | null;
  universities?: University[];
}

export const Hub: React.FC<HubProps> = ({ user, universities = [] }) => {
  const { t } = useLanguage();

  // Feed state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalActionText, setAuthModalActionText] = useState<string>('post community events');

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventCategoryType>('university_event');
  const [universityId, setUniversityId] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Active Comment Drawer state
  const [activeEventComments, setActiveEventComments] = useState<EventItem | null>(null);
  const [comments, setComments] = useState<EventComment[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);

  // Fetch events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEvents({
        eventType: selectedCategory,
        universityId: selectedUniversity,
        search: searchTerm,
      });
      setEvents(res.events || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, selectedUniversity]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Like Toggle
  const handleToggleLike = async (eventId: string) => {
    if (!user) {
      setAuthModalActionText('like community events');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      // Optimistic update
      setEvents((prev) =>
        prev.map((item) => {
          if (item.id === eventId) {
            const nextIsLiked = !item.isLiked;
            return {
              ...item,
              isLiked: nextIsLiked,
              likesCount: nextIsLiked ? item.likesCount + 1 : Math.max(0, item.likesCount - 1),
            };
          }
          return item;
        })
      );
      await api.toggleLikeEvent(eventId);
    } catch (err) {
      // Revert on error
      fetchEvents();
    }
  };

  // Handle Event Deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event posting?')) return;
    try {
      await api.deleteEvent(eventId);
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
      if (activeEventComments?.id === eventId) {
        setActiveEventComments(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete event');
    }
  };

  // Image Selection Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormError('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  // Submit Event Form
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!title.trim()) {
      setFormError('Event title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError('Event description is required.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('eventType', eventType);
      if (universityId) formData.append('universityId', universityId);
      if (universityName) formData.append('universityName', universityName);
      if (eventDate) formData.append('eventDate', eventDate);
      if (location) formData.append('location', location);
      if (link) formData.append('link', link);
      if (imageFile) formData.append('image', imageFile);

      const res = await api.createEvent(formData);

      setFormSuccess(res.message || 'Event published successfully!');
      // Reset Form
      setTitle('');
      setDescription('');
      setEventType('university_event');
      setUniversityId('');
      setUniversityName('');
      setEventDate('');
      setLocation('');
      setLink('');
      setImageFile(null);
      setImagePreview(null);

      setTimeout(() => {
        setIsCreateOpen(false);
        setFormSuccess(null);
        fetchEvents();
      }, 1000);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Comment Drawer
  const handleOpenComments = async (eventItem: EventItem) => {
    setActiveEventComments(eventItem);
    setComments([]);
    try {
      setLoadingComments(true);
      const res = await api.getEventComments(eventItem.id);
      setComments(res.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventComments || !commentText.trim() || !user) return;
    try {
      setCommentSubmitting(true);
      const res = await api.createEventComment(activeEventComments.id, commentText);
      setComments((prev) => [...prev, res.comment]);
      setCommentText('');

      // Update comments count on feed event card
      setEvents((prev) =>
        prev.map((ev) => (ev.id === activeEventComments.id ? { ...ev, commentsCount: ev.commentsCount + 1 } : ev))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!activeEventComments) return;
    try {
      await api.deleteEventComment(activeEventComments.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === activeEventComments.id ? { ...ev, commentsCount: Math.max(0, ev.commentsCount - 1) } : ev
        )
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to delete comment');
    }
  };

  // Helper Badge Color
  const getCategoryBadgeClass = (type: EventCategoryType) => {
    switch (type) {
      case 'course':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'workshop':
        return 'bg-emerald-50 text-[#059669] border-emerald-200/80';
      case 'university_event':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'seminar':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'conference':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryLabel = (type: EventCategoryType) => {
    switch (type) {
      case 'course':
        return t('hubFilterCourse');
      case 'workshop':
        return t('hubFilterWorkshop');
      case 'university_event':
        return t('hubFilterUniEvent');
      case 'seminar':
        return t('hubFilterSeminar');
      case 'conference':
        return t('hubFilterConference');
      default:
        return t('hubFilterOther');
    }
  };

  const categoriesList: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: t('hubFilterAll'), icon: <Filter className="w-3.5 h-3.5" /> },
    { key: 'university_event', label: t('hubFilterUniEvent'), icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { key: 'workshop', label: t('hubFilterWorkshop'), icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'course', label: t('hubFilterCourse'), icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'seminar', label: t('hubFilterSeminar'), icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'conference', label: t('hubFilterConference'), icon: <Video className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F1] pb-24">
      {/* Dynamic Header Banner */}
      <header className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(5,150,105,0.18),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Community & Events</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              {t('hubTitle')}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
              {t('hubSubtitle')}
            </p>
          </div>

          {/* Create Event CTA */}
          <button
            onClick={() => {
              if (!user) {
                setAuthModalActionText('post community events');
                setIsAuthModalOpen(true);
                return;
              }
              setIsCreateOpen(true);
            }}
            className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#059669] to-emerald-500 hover:from-[#047857] hover:to-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 transition-all duration-300 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
            <span>{t('hubCreateEventBtn')}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter & Toolbar Row */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('hubSearchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* University Filter Select */}
            <div className="w-full md:w-72">
              <CustomSelect
                options={[
                  { value: 'all', label: t('hubFormUniversitySelect') },
                  ...universities.map((u) => ({ value: u.id, label: u.name, sublabel: `${u.location?.city || ''}, ${u.location?.region || ''}` })),
                ]}
                value={selectedUniversity}
                onChange={setSelectedUniversity}
                placeholder={t('hubFormUniversitySelect')}
                icon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar scroll-smooth">
            {categoriesList.map((cat) => {
              const active = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                    active
                      ? 'bg-[#059669] text-white border-[#059669] shadow-md shadow-emerald-900/10'
                      : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Loading community events...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center max-w-xl mx-auto my-12 shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="font-bold text-sm">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center max-w-xl mx-auto my-12 shadow-sm space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-[#059669] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">{t('hubEmptyEventsTitle')}</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              {t('hubEmptyEventsSub')}
            </p>
            {user && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#059669] text-white font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#047857] transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>{t('hubCreateEventBtn')}</span>
              </button>
            )}
          </div>
        )}

        {/* Events Feed Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const canDelete =
                user && (user.id === ev.authorId || ['admin', 'agent'].includes(user.role));

              return (
                <article
                  key={ev.id}
                  className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Card Media Header if present */}
                  {ev.imageUrl && (
                    <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border backdrop-blur-md shadow-md ${getCategoryBadgeClass(
                          ev.eventType
                        )}`}
                      >
                        {getCategoryLabel(ev.eventType)}
                      </span>
                    </div>
                  )}

                  {/* Content Container */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Category Badge if no image */}
                      {!ev.imageUrl && (
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${getCategoryBadgeClass(
                              ev.eventType
                            )}`}
                          >
                            {getCategoryLabel(ev.eventType)}
                          </span>
                          {ev.universityName && (
                            <span className="text-[11px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg truncate max-w-[180px]">
                              {ev.universityName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      <h2 className="text-lg font-black text-slate-900 group-hover:text-[#059669] transition-colors leading-snug line-clamp-2">
                        {ev.title}
                      </h2>

                      {/* University Tag if cover image exists */}
                      {ev.imageUrl && ev.universityName && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-xl w-fit">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[220px]">{ev.universityName}</span>
                        </div>
                      )}

                      {/* Event Date & Location Info */}
                      {(ev.eventDate || ev.location) && (
                        <div className="space-y-1.5 text-xs text-slate-600 font-semibold pt-1">
                          {ev.eventDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                              <span>{new Date(ev.eventDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                          {ev.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3">
                        {ev.description}
                      </p>

                      {/* External Link */}
                      {ev.link && (
                        <a
                          href={ev.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:underline pt-1"
                        >
                          <span>Event details & registration</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Author & Footer Bar */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500">
                      {/* Author */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#059669] font-black text-xs flex items-center justify-center shrink-0 border border-emerald-200 overflow-hidden">
                          {ev.authorAvatar ? (
                            <img src={ev.authorAvatar} alt={ev.authorName} className="w-full h-full object-cover" />
                          ) : (
                            ev.authorName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-extrabold text-slate-900 truncate">{ev.authorName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {new Date(ev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {/* Like Button */}
                        <button
                          onClick={() => handleToggleLike(ev.id)}
                          className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                            ev.isLiked ? 'text-rose-600' : 'text-slate-400 hover:text-rose-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${ev.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                          <span>{ev.likesCount}</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          onClick={() => handleOpenComments(ev)}
                          className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-[#059669] transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{ev.commentsCount}</span>
                        </button>

                        {/* Delete Button */}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE EVENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{t('hubPostModalTitle')}</h3>
                  <p className="text-xs text-slate-500 font-medium">Share upcoming events with students and faculty across Ethiopia</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Messages */}
            {formError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('hubFormTitle')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('hubFormTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:border-[#059669]"
                />
              </div>

              {/* Category & University Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    {t('hubFormType')} *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventCategoryType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#059669]/30"
                  >
                    <option value="university_event">{t('hubFilterUniEvent')}</option>
                    <option value="workshop">{t('hubFilterWorkshop')}</option>
                    <option value="course">{t('hubFilterCourse')}</option>
                    <option value="seminar">{t('hubFilterSeminar')}</option>
                    <option value="conference">{t('hubFilterConference')}</option>
                    <option value="other">{t('hubFilterOther')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    {t('hubFormUniversity')}
                  </label>
                  <CustomSelect
                    options={[
                      { value: '', label: t('hubFormUniversitySelect') },
                      ...universities.map((u) => ({ value: u.id, label: u.name, sublabel: u.location?.city })),
                    ]}
                    value={universityId}
                    onChange={(val) => {
                      setUniversityId(val);
                      const uni = universities.find((u) => u.id === val);
                      if (uni) setUniversityName(uni.name);
                    }}
                    placeholder={t('hubFormUniversitySelect')}
                    icon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
                  />
                </div>
              </div>

              {/* Date & Location Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    {t('hubFormDate')}
                  </label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                    {t('hubFormLocation')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('hubFormLocationPlaceholder')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                  />
                </div>
              </div>

              {/* External Registration Link */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('hubFormLink')}
                </label>
                <input
                  type="url"
                  placeholder={t('hubFormLinkPlaceholder')}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('hubFormDescription')} *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={t('hubFormDescriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                />
              </div>

              {/* Cover Image Upload Dropzone */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                  {t('hubFormCoverImage')} (Cloudinary Storage)
                </label>
                {imagePreview ? (
                  <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 bg-slate-950/80 text-white rounded-xl hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-[#059669] bg-slate-50 hover:bg-emerald-50/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#059669] mb-2 transition-colors" />
                    <span className="text-xs font-bold text-slate-700">{t('hubFormImageDrag')}</span>
                    <span className="text-[10px] font-semibold text-slate-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('hubFormPublishing')}</span>
                    </>
                  ) : (
                    <span>{t('hubFormSubmit')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMMUNITY COMMENTS DRAWER / MODAL */}
      {activeEventComments && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 truncate max-w-[260px]">
                    {activeEventComments.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-semibold">{t('hubCommentsTitle')}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveEventComments(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List (Chronological Order) */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingComments ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-xs font-bold text-slate-400">Loading feedback...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">{t('hubNoComments')}</p>
                </div>
              ) : (
                comments.map((c) => {
                  const canDeleteComment =
                    user &&
                    (user.id === c.authorId ||
                      user.id === activeEventComments.authorId ||
                      ['admin', 'agent'].includes(user.role));

                  return (
                    <div
                      key={c.id}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#059669] font-black text-xs flex items-center justify-center border border-emerald-200">
                            {c.authorAvatar ? (
                              <img src={c.authorAvatar} alt={c.authorName} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              c.authorName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="text-xs font-black text-slate-900">{c.authorName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {canDeleteComment && (
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="text-slate-400 hover:text-red-600 transition p-0.5"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed pl-9">{c.content}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Input Footer */}
            <div className="p-4 border-t border-slate-100 bg-white">
              {user ? (
                <form onSubmit={handlePostComment} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t('hubAddCommentPlaceholder')}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#059669]/30"
                  />
                  <button
                    type="submit"
                    disabled={commentSubmitting || !commentText.trim()}
                    className="p-2.5 bg-[#059669] text-white rounded-2xl hover:bg-[#047857] transition disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <button
                    onClick={() => {
                      setAuthModalActionText('leave comments');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-xs font-bold text-[#059669] hover:underline cursor-pointer bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 transition-colors"
                  >
                    {t('hubLoginToPost')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authentication Prompt Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionText={authModalActionText}
      />
    </div>
  );
};

export default Hub;
