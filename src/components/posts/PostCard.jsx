import { useNavigate } from 'react-router-dom';
import { Pin, MessageSquare, FileText, Image } from 'lucide-react';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function PostCard({ post }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/posts/${post.id}`)}
      className="cursor-pointer transition-colors duration-150"
      style={{
        background: '#fff',
        border: `1px solid ${post.isPinned ? 'var(--navy)' : 'var(--border)'}`,
        borderLeft: `4px solid ${post.isPinned ? 'var(--navy)' : 'var(--border)'}`,
        borderRadius: '4px',
        padding: '16px 20px',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.isPinned && (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--navy)', color: '#fff' }}
            >
              <Pin className="w-3 h-3" /> Pinned
            </span>
          )}
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--navy)',
              border: '1px solid #bfdbfe',
            }}
          >
            {post.course?.name ?? 'All Courses'}
          </span>
        </div>

        {/* Attachment indicators */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {post.imageUrl && (
            <Image className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          )}
          {post.documentUrl && (
            <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <h3
          className="text-base font-semibold mb-1"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
        >
          {post.title}
        </h3>
      )}

      {/* Content preview */}
      <p
        className="text-sm leading-relaxed line-clamp-2 mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-light)' }}>
        <span>
          By <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{post.author?.name}</span>
          {' · '}{formatDate(post.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {post.comments?.length ?? 0} comment{(post.comments?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
