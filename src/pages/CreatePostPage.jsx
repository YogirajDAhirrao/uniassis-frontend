import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Pin } from 'lucide-react';
import { createPost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Hardcoded courses matching the DB — courseId 1 = ALL (global), others = specific
const COURSES = [
  { id: 1,  name: 'All Courses (General Announcement)' },
  { id: 2,  name: 'BE' },
  { id: 3,  name: 'BCA' },
  { id: 4,  name: 'MCA' },
  { id: 5,  name: 'ME' },
  { id: 6,  name: 'BA' },
];

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    content: '',
    courseId: '1',
    imageUrl: '',
    documentUrl: '',
    isPinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.content.trim()) e.content = 'Content is required';
    if (!form.courseId) e.courseId = 'Please select a course';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const post = await createPost({
        title: form.title.trim() || undefined,
        content: form.content.trim(),
        courseId: Number(form.courseId),
        imageUrl: form.imageUrl.trim() || undefined,
        documentUrl: form.documentUrl.trim() || undefined,
      });
      toast.success('Post published');
      navigate(`/posts/${post.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-14 pb-16 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="py-4">
          <Link
            to="/feed"
            className="inline-flex items-center gap-1 text-sm"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Notice Board
          </Link>
        </div>

        {/* Page header */}
        <div
          className="pb-4 mb-6"
          style={{ borderBottom: '2px solid var(--navy)' }}
        >
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
          >
            New Announcement
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Posting as <span className="font-medium">{user?.name}</span>
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="post-title" style={{ color: 'var(--text-base)' }}>
                Title <span style={{ color: 'var(--text-light)' }}>(optional)</span>
              </label>
              <input
                id="post-title"
                type="text"
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Exam Schedule – October 2025"
                className="form-input"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="post-content" style={{ color: 'var(--text-base)' }}>
                Content <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Markdown is supported — **bold**, *italic*, bullet lists, etc.
              </p>
              <textarea
                id="post-content"
                value={form.content}
                onChange={set('content')}
                placeholder="Write your announcement here…"
                rows={8}
                className={`form-input resize-y text-sm ${errors.content ? 'error' : ''}`}
              />
              {errors.content && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.content}</p>
              )}
            </div>

            {/* Course selector */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="post-course" style={{ color: 'var(--text-base)' }}>
                Target Audience <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                id="post-course"
                value={form.courseId}
                onChange={set('courseId')}
                className={`form-input ${errors.courseId ? 'error' : ''}`}
              >
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.courseId && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.courseId}</p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="post-image" style={{ color: 'var(--text-base)' }}>
                Image URL <span style={{ color: 'var(--text-light)' }}>(optional)</span>
              </label>
              <input
                id="post-image"
                type="url"
                value={form.imageUrl}
                onChange={set('imageUrl')}
                placeholder="https://…"
                className="form-input"
              />
            </div>

            {/* Document URL */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="post-doc" style={{ color: 'var(--text-base)' }}>
                Document URL <span style={{ color: 'var(--text-light)' }}>(optional)</span>
              </label>
              <input
                id="post-doc"
                type="url"
                value={form.documentUrl}
                onChange={set('documentUrl')}
                placeholder="https://… (Google Drive, PDF link, etc.)"
                className="form-input"
              />
            </div>

            {/* Pin toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  id="post-pin"
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={set('isPinned')}
                  className="sr-only"
                />
                <div
                  className="w-10 h-5 rounded-full transition-colors duration-200"
                  style={{ background: form.isPinned ? 'var(--navy)' : '#d1d5db' }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform duration-200"
                    style={{ transform: form.isPinned ? 'translateX(20px)' : 'translateX(2px)' }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--text-base)' }}>
                  <Pin className="w-3.5 h-3.5" /> Pin this post
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Pinned posts appear at the top of the feed
                </p>
              </div>
            </label>

            {/* Submit */}
            <div
              className="flex items-center justify-end gap-3 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <Link
                to="/feed"
                className="btn-secondary text-sm"
                style={{ textDecoration: 'none' }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-sm flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? 'Publishing…' : 'Publish Post'}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
