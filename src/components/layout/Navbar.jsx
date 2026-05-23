import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import { toast } from 'react-hot-toast';
import { MessageSquare, FileText, LogOut, GraduationCap, Shield, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logoutUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore logout API errors
    } finally {
      logoutUser();
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const navLinks = [
    { to: '/chat',      label: 'Chat',      icon: MessageSquare, show: isAuthenticated },
    { to: '/documents', label: 'Documents',  icon: FileText,      show: isAdmin },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border)',
        height: '56px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-base"
          style={{ color: 'var(--navy)', textDecoration: 'none' }}
        >
          <BookOpen className="w-5 h-5" style={{ color: 'var(--navy)' }} />
          <span style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>UniAssist</span>
        </Link>

        {/* Nav Links + User Area */}
        <div className="flex items-center gap-1">
          {/* Page links */}
          {navLinks
            .filter((l) => l.show)
            .map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors duration-100"
                style={{
                  color: isActive(to) ? 'var(--navy)' : 'var(--text-muted)',
                  borderBottom: isActive(to) ? '2px solid var(--navy)' : '2px solid transparent',
                  textDecoration: 'none',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}

          {/* Divider */}
          {isAuthenticated && navLinks.some((l) => l.show) && (
            <div
              className="mx-2 h-5 w-px"
              style={{ background: 'var(--border)' }}
            />
          )}

          {isAuthenticated ? (
            <>
              {/* User badge */}
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded text-xs"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {isAdmin ? (
                  <Shield className="w-3.5 h-3.5" style={{ color: 'var(--navy)' }} />
                ) : (
                  <GraduationCap className="w-3.5 h-3.5" style={{ color: 'var(--navy)' }} />
                )}
                <span className="font-medium max-w-28 truncate" style={{ color: 'var(--text-base)' }}>
                  {user?.name}
                </span>
                <span
                  className="font-semibold uppercase tracking-wide"
                  style={{ fontSize: '10px', color: 'var(--navy)' }}
                >
                  [{user?.role}]
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                id="logout-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 ml-1 rounded text-sm transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--danger)';
                  e.currentTarget.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm"
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm px-4 py-1.5"
                style={{ textDecoration: 'none' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
