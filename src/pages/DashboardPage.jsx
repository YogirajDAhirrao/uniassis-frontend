import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Newspaper, MessageSquare, FileText, Mail,
  BookOpen, GraduationCap, Shield, ChevronRight,
  Plus, Upload, Send, Clock, CheckCircle, ArrowRight,
  Loader2, Users, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFeed } from '../api/posts';
import { listDocuments } from '../api/documents';
import { getCampaignHistory } from '../api/email';
import { listSessions } from '../api/chat';
import { toast } from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COURSE_MAP = { 2: 'BE', 3: 'BCA', 4: 'MCA', 5: 'ME', 6: 'BA' };

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = 'var(--navy)' }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded"
      style={{ background: '#fff', border: '1px solid var(--border)' }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded flex-shrink-0"
        style={{ background: color, opacity: 1 }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p
          className="text-2xl font-bold leading-none"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", color }}
        >
          {value ?? <Loader2 className="w-5 h-5 animate-spin inline" style={{ color }} />}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--text-light)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({ to, icon: Icon, label, desc, accent = false }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 rounded transition-all duration-150"
      style={{
        background: accent ? 'var(--navy)' : '#fff',
        border: `1px solid ${accent ? 'var(--navy)' : 'var(--border)'}`,
        color: accent ? '#fff' : 'var(--text-base)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = accent ? 'var(--navy-light)' : 'var(--accent-bg)';
        e.currentTarget.style.borderColor = accent ? 'var(--navy-light)' : 'var(--navy)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = accent ? 'var(--navy)' : '#fff';
        e.currentTarget.style.borderColor = accent ? 'var(--navy)' : 'var(--border)';
      }}
    >
      <div
        className="w-8 h-8 flex items-center justify-center rounded flex-shrink-0"
        style={{ background: accent ? 'rgba(255,255,255,0.15)' : 'var(--bg)' }}
      >
        <Icon className="w-4 h-4" style={{ color: accent ? '#fff' : 'var(--navy)' }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: accent ? '#fff' : 'var(--text-base)' }}>
          {label}
        </p>
        {desc && (
          <p className="text-xs mt-0.5" style={{ color: accent ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}>
            {desc}
          </p>
        )}
      </div>
      <ArrowRight className="w-3.5 h-3.5 ml-auto flex-shrink-0" style={{ color: accent ? 'rgba(255,255,255,0.6)' : 'var(--text-light)' }} />
    </Link>
  );
}

// ─── Recent Notice Card ────────────────────────────────────────────────────────

function NoticeCard({ post }) {
  const category = post.course?.name ?? 'General';
  return (
    <Link
      to={`/posts/${post.id}`}
      className="block p-4 rounded transition-colors duration-150"
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--navy)',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--navy)' }}
            >
              {category}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-light)' }}>
              {timeAgo(post.createdAt)}
            </span>
          </div>
          <p
            className="text-sm font-semibold line-clamp-1"
            style={{ color: 'var(--text-base)' }}
          >
            {post.title}
          </p>
          <p
            className="text-xs mt-1 line-clamp-2 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            {post.content?.replace(/#/g, '').trim()}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: 'var(--text-light)' }} />
      </div>
    </Link>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2
        className="text-base font-semibold"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
      >
        {title}
      </h2>
      {to && (
        <Link
          to={to}
          className="text-xs flex items-center gap-1"
          style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--navy)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          {linkLabel ?? 'View all'} <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

// ─── Student Dashboard ─────────────────────────────────────────────────────────

function StudentDashboard({ user, posts, postsLoading, sessions }) {
  const courseName = COURSE_MAP[user?.courseId] ?? 'Student';

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div
        className="rounded px-6 py-5"
        style={{ background: 'var(--navy)', border: '1px solid var(--navy-dark)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {courseName} · Student Portal
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Newspaper}     label="Notices available"    value={posts?.length ?? null} />
        <StatCard icon={MessageSquare} label="AI chat sessions"     value={sessions?.length ?? null} />
        <StatCard icon={BookOpen}      label="Knowledge base docs"  value={null} sub="Ask your academic assistant" />
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Notices */}
        <div className="lg:col-span-2">
          <SectionHeader title="Recent Notices" to="/feed" linkLabel="All notices" />
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded animate-pulse" style={{ background: '#f3f4f6' }} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div
              className="rounded p-8 text-center"
              style={{ background: '#fff', border: '1px solid var(--border)' }}
            >
              <Newspaper className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-light)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notices yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 4).map((p) => <NoticeCard key={p.id} post={p} />)}
            </div>
          )}
        </div>

        {/* Quick Access */}
        <div>
          <SectionHeader title="Quick Access" />
          <div className="space-y-2">
            <QuickAction to="/feed"  icon={Newspaper}     label="Notice Board"    desc="University announcements" accent />
            <QuickAction to="/chat"  icon={MessageSquare} label="AI Assistant"    desc="Chat with your docs" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────

function AdminDashboard({ user, posts, postsLoading, documents, emails }) {
  const readyDocs  = documents?.filter((d) => d.status === 'READY').length ?? null;
  const failedDocs = documents?.filter((d) => d.status === 'FAILED').length ?? null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div
        className="rounded px-6 py-5"
        style={{ background: 'var(--navy)', border: '1px solid var(--navy-dark)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Administrator · University Portal
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Newspaper}     label="Total notices"      value={posts?.length ?? null} />
        <StatCard icon={FileText}      label="Documents uploaded"  value={documents?.length ?? null} sub={readyDocs !== null ? `${readyDocs} ready` : undefined} />
        <StatCard icon={Mail}          label="Email campaigns"     value={emails?.length ?? null} />
        <StatCard icon={CheckCircle}   label="Docs in knowledge base" value={readyDocs} color="#16a34a" />
      </div>

      {/* 3-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Notices */}
        <div className="lg:col-span-2">
          <SectionHeader title="Recent Notices" to="/feed" linkLabel="View all" />
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded animate-pulse" style={{ background: '#f3f4f6' }} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div
              className="rounded p-8 text-center"
              style={{ background: '#fff', border: '1px solid var(--border)' }}
            >
              <Newspaper className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-light)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notices published yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.slice(0, 4).map((p) => <NoticeCard key={p.id} post={p} />)}
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div>
          <SectionHeader title="Admin Actions" />
          <div className="space-y-2">
            <QuickAction to="/posts/new"  icon={Plus}         label="Publish Notice"     desc="Post an announcement"  accent />
            <QuickAction to="/documents"  icon={Upload}       label="Upload Document"    desc="Add to knowledge base" />
            <QuickAction to="/emails"     icon={Send}         label="Send Email"         desc="Course-targeted emails" />
            <QuickAction to="/feed"       icon={Newspaper}    label="View Notices"       desc="Manage all posts" />
          </div>

          {/* Failed docs warning */}
          {failedDocs > 0 && (
            <Link
              to="/documents"
              className="flex items-center gap-2 mt-3 px-4 py-3 rounded text-sm"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                textDecoration: 'none',
              }}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>{failedDocs} document{failedDocs > 1 ? 's' : ''} failed ingestion</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const [posts,    setPosts]    = useState([]);
  const [documents, setDocuments] = useState(null);
  const [emails,   setEmails]   = useState(null);
  const [sessions, setSessions] = useState(null);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    // Fetch notices for everyone
    getFeed()
      .then(setPosts)
      .catch(() => toast.error('Failed to load notices'))
      .finally(() => setPostsLoading(false));

    // Fetch additional data for admin
    if (isAdmin) {
      listDocuments().then(setDocuments).catch(() => {});
      getCampaignHistory().then(setEmails).catch(() => {});
    } else {
      // Students: load their chat sessions for stats
      listSessions().then(setSessions).catch(() => {});
    }
  }, [isAdmin]);

  return (
    <div className="min-h-screen pt-14 pb-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Page title bar */}
        <div
          className="flex items-center gap-3 py-5 mb-6"
          style={{ borderBottom: '2px solid var(--navy)' }}
        >
          <LayoutDashboard className="w-5 h-5" style={{ color: 'var(--navy)' }} />
          <div>
            <h1
              className="text-xl font-bold leading-none"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
            >
              Dashboard
            </h1>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              University of Pune · Academic Portal
            </p>
          </div>
        </div>

        {isAdmin ? (
          <AdminDashboard
            user={user}
            posts={posts}
            postsLoading={postsLoading}
            documents={documents}
            emails={emails}
          />
        ) : (
          <StudentDashboard
            user={user}
            posts={posts}
            postsLoading={postsLoading}
            sessions={sessions}
          />
        )}

      </div>
    </div>
  );
}
