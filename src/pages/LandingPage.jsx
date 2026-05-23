import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Brain, Search, FileText, Shield, Zap, MessageSquare, GraduationCap, BookOpen,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'RAG-Powered Responses',
    description:
      'Answers grounded in your actual academic documents — not generic internet knowledge.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description:
      'Find relevant content across all uploaded documents using natural language queries.',
  },
  {
    icon: FileText,
    title: 'Multi-Document Support',
    description:
      'Syllabi, question papers, lab manuals — all indexed and searchable from one place.',
  },
  {
    icon: MessageSquare,
    title: 'Streaming Responses',
    description:
      'Watch answers appear in real-time as the AI reasons over your academic material.',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Students chat and learn; administrators manage the academic document library.',
  },
  {
    icon: Zap,
    title: 'Instant Answers',
    description:
      'No more scrolling through 100-page PDFs. Surface the exact answer in seconds.',
  },
];

const stats = [
  { value: 'RAG',    label: 'Powered Responses' },
  { value: 'LLaMA', label: '3.3 70B Model' },
  { value: '∞',     label: 'Documents Supported' },
  { value: '24/7',  label: 'Available' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="pt-24 pb-16 px-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start gap-12">

            {/* Left: Copy */}
            <div className="flex-1 pt-4">
              {/* Kicker */}
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'var(--navy)' }}
              >
                LLM-Based Academic Intelligence · SPPU
              </p>

              <h1
                className="text-4xl sm:text-5xl font-bold leading-tight mb-5"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: 'var(--navy)',
                }}
              >
                Your Academic<br />
                AI Assistant
              </h1>

              <p
                className="text-base leading-relaxed mb-8 max-w-md"
                style={{ color: 'var(--text-muted)' }}
              >
                Ask questions about your syllabi, question papers, and lab
                manuals. Get instant, accurate answers powered by
                Retrieval-Augmented Generation.
              </p>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <Link
                    to="/chat"
                    className="btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Go to Chat
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      id="hero-get-started"
                      className="btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      <GraduationCap className="w-4 h-4" />
                      Get Started
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary"
                      style={{ textDecoration: 'none' }}
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right: Demo card */}
            <div
              className="w-full lg:w-80 xl:w-96 flex-shrink-0 rounded"
              style={{
                background: '#fff',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center gap-2 px-4 py-3"
                style={{
                  background: 'var(--navy)',
                  color: '#fff',
                }}
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">UniAssist AI</span>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  Online
                </span>
              </div>

              {/* Chat preview */}
              <div className="p-4 space-y-3">
                {/* User */}
                <div className="flex justify-end">
                  <div
                    className="text-sm px-3 py-2 rounded max-w-xs text-white"
                    style={{ background: 'var(--navy)', borderRadius: '12px 12px 2px 12px' }}
                  >
                    What are the important topics in Data Structures for SPPU?
                  </div>
                </div>
                {/* Assistant */}
                <div
                  className="text-sm px-3 py-2.5 rounded max-w-xs"
                  style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px 12px 12px 2px',
                    color: 'var(--text-base)',
                  }}
                >
                  <p className="mb-1.5">Based on the SPPU syllabus, key topics are:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <li>Arrays, Stacks &amp; Queues</li>
                    <li>Linked Lists (Singly, Doubly, Circular)</li>
                    <li>Trees: BST, AVL, B-Trees</li>
                    <li>Graph algorithms: BFS, DFS, Dijkstra</li>
                  </ul>
                  <p
                    className="mt-2 text-xs"
                    style={{ color: 'var(--accent)' }}
                  >
                    📄 Source: Data Structures Syllabus, Unit 1–4
                  </p>
                </div>
              </div>

              {/* Input bar */}
              <div
                className="px-4 py-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded text-xs"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-light)' }}
                >
                  <span className="flex-1">Ask about your academic documents…</span>
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: 'var(--navy)' }}
                  >
                    <MessageSquare className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-10 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-0">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className="text-center py-6"
              style={{
                borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <p
                className="text-3xl font-bold mb-1"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: 'var(--navy)',
                }}
              >
                {value}
              </p>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
            >
              Platform Capabilities
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              UniAssist combines state-of-the-art AI with your university's academic content.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className="p-6"
                style={{
                  borderTop: i >= 3 || (i > 0 && i < 3) ? '1px solid var(--border)' : 'none',
                  borderTop: '1px solid var(--border)',
                  borderLeft: i % 3 !== 0 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center rounded mb-3"
                  style={{ background: 'var(--navy)', color: '#fff' }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h3
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: 'var(--navy)' }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--navy)' }} />
          <h2
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
          >
            Start studying smarter
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Join SPPU students who are already using UniAssist to understand their
            academic content faster.
          </p>
          {isAuthenticated ? (
            <Link to="/chat" className="btn-primary" style={{ textDecoration: 'none' }}>
              <MessageSquare className="w-4 h-4" />
              Open Chat
            </Link>
          ) : (
            <Link
              to="/register"
              id="cta-register"
              className="btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <GraduationCap className="w-4 h-4" />
              Create Account
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer
        className="py-6 px-4"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: 'var(--navy)' }} />
            <span
              className="font-semibold text-sm"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
            >
              UniAssist
            </span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-light)' }}>
            © 2025 UniAssist · LLM-Based Academic Intelligence for SPPU Students
          </p>
        </div>
      </footer>

    </div>
  );
}
