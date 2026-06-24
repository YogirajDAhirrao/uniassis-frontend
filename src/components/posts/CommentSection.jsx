import { useState } from 'react';
import { Trash2, Send, Loader2 } from 'lucide-react';
import { addComment, deleteComment } from '../../api/posts';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function CommentRow({ comment, currentUser, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const isOwn = currentUser?.id === comment.user?.id || currentUser?.role === 'admin';

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      setDeleting(true);
      await deleteComment(comment.id);
      toast.success('Comment deleted');
      onDeleted(comment.id);
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="flex gap-3 py-3 group"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Avatar initial */}
      <div
        className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
        style={{ background: 'var(--navy)' }}
      >
        {comment.user?.name?.[0]?.toUpperCase() ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold" style={{ color: 'var(--navy)' }}>
            {comment.user?.name}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-light)' }}>
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-base)' }}>
          {comment.content}
        </p>
      </div>

      {isOwn && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded flex-shrink-0 transition-all duration-150"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
          title="Delete comment"
        >
          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

export default function CommentSection({ postId, initialComments = [] }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      setSubmitting(true);
      const comment = await addComment(postId, trimmed);
      setComments((prev) => [...prev, comment]);
      setText('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleted = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return (
    <div>
      {/* Header */}
      <h3
        className="text-base font-semibold mb-3"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
      >
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm py-6 text-center" style={{ color: 'var(--text-light)' }}>
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div>
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUser={user}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}

      {/* Add comment */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-start">
          <div
            className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
            style={{ background: 'var(--navy)' }}
          >
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment…"
              rows={2}
              className="form-input resize-none text-sm"
              style={{ minHeight: '64px' }}
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {submitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
