import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Pin, FileText, Image, Trash2, Loader2, ExternalLink,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostById, deletePost } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/posts/CommentSection';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId);
        setPost(data);
      } catch {
        toast.error('Post not found');
        navigate('/feed');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [postId]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      setDeleting(true);
      await deletePost(postId);
      toast.success('Post deleted');
      navigate('/feed');
    } catch {
      toast.error('Failed to delete post');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '56px' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) return null;

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

        {/* Post card */}
        <div className="card">

          {/* Badges row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {post.isPinned && (
                <span
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: 'var(--navy)', color: '#fff' }}
                >
                  <Pin className="w-3 h-3" /> Pinned
                </span>
              )}
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{
                  background: 'var(--accent-bg)', color: 'var(--navy)',
                  border: '1px solid #bfdbfe',
                }}
              >
                {post.course?.name ?? 'All Courses'}
              </span>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/posts/${postId}/edit`}
                  className="btn-secondary text-xs px-3 py-1.5"
                  style={{ textDecoration: 'none' }}
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          {post.title && (
            <h1
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
            >
              {post.title}
            </h1>
          )}

          {/* Meta */}
          <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
            Posted by{' '}
            <span className="font-medium" style={{ color: 'var(--text-base)' }}>
              {post.author?.name}
            </span>
            {' · '}{formatDate(post.createdAt)}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <div className="mb-5 rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <img
                src={post.imageUrl}
                alt={post.title || 'Post image'}
                className="w-full object-cover"
                style={{ maxHeight: '320px' }}
              />
            </div>
          )}

          {/* Content — markdown */}
          <div
            className="prose-chat pb-5 mb-5"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Document link */}
          {post.documentUrl && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded mb-5"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--navy)' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--navy)' }}>Attached Document</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {post.documentUrl}
                </p>
              </div>
              <a
                href={post.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs btn-secondary px-2 py-1.5"
                style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </a>
            </div>
          )}

          {/* Comments */}
          <CommentSection postId={post.id} initialComments={post.comments ?? []} />
        </div>

      </div>
    </div>
  );
}
