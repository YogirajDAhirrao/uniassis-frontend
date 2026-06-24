import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Newspaper, RefreshCw } from 'lucide-react';
import { getFeed } from '../api/posts';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/posts/PostCard';
import Spinner from '../components/ui/Spinner';
import { toast } from 'react-hot-toast';

function SkeletonCard() {
  return (
    <div
      className="rounded p-5 animate-pulse"
      style={{ background: '#fff', border: '1px solid var(--border)', borderLeft: '4px solid var(--border)' }}
    >
      <div className="h-3 w-24 rounded mb-3" style={{ background: '#e5e7eb' }} />
      <div className="h-4 w-3/4 rounded mb-2" style={{ background: '#e5e7eb' }} />
      <div className="h-3 w-full rounded mb-1" style={{ background: '#f3f4f6' }} />
      <div className="h-3 w-2/3 rounded" style={{ background: '#f3f4f6' }} />
    </div>
  );
}

export default function FeedPage() {
  const { isAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const data = await getFeed();
      setPosts(data);
    } catch {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const pinned = posts.filter((p) => p.isPinned);
  const regular = posts.filter((p) => !p.isPinned);

  return (
    <div className="min-h-screen pt-14 pb-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Page Header */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: '2px solid var(--navy)' }}
        >
          <div>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
            >
              <Newspaper className="w-6 h-6" />
              Notice Board
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              University updates and announcements for your course
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPosts(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded text-sm transition-colors duration-150"
              style={{
                color: 'var(--text-muted)', border: '1px solid var(--border)',
                background: '#fff', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {isAdmin && (
              <Link
                to="/posts/new"
                className="btn-primary text-sm flex items-center gap-1.5"
                style={{ textDecoration: 'none' }}
              >
                <Plus className="w-4 h-4" />
                New Post
              </Link>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mt-6 space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => <SkeletonCard key={i} />)
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-light)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                No posts yet
              </p>
              {isAdmin && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
                  Create the first announcement using the "New Post" button above.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Pinned section */}
              {pinned.length > 0 && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Pinned
                  </p>
                  <div className="space-y-2">
                    {pinned.map((post) => <PostCard key={post.id} post={post} />)}
                  </div>
                  {regular.length > 0 && (
                    <div className="my-4" style={{ borderTop: '1px solid var(--border)' }} />
                  )}
                </div>
              )}

              {/* Regular posts */}
              {regular.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <p
                      className="text-xs font-semibold uppercase tracking-widest mb-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Recent
                    </p>
                  )}
                  <div className="space-y-2">
                    {regular.map((post) => <PostCard key={post.id} post={post} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
