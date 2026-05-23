import { useState } from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { deleteSession } from '../../api/chat';
import { toast } from 'react-hot-toast';

function formatSessionDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onSessionDeleted,
  creating,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      setDeletingId(sessionId);
      await deleteSession(sessionId);
      toast.success('Conversation deleted');
      onSessionDeleted(sessionId);
    } catch {
      toast.error('Failed to delete session');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside
      className="flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '56px' : '260px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        {!collapsed && (
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Conversations
          </span>
        )}
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded transition-colors duration-150 ml-auto"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* New Chat */}
      <div className={`p-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <Button
          id="new-chat-btn"
          onClick={onNewSession}
          loading={creating}
          variant="primary"
          className={collapsed ? '!w-9 !h-9 !px-0 !py-0 justify-center' : 'w-full'}
          title="New conversation"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-1.5 pb-4 space-y-0.5">
        {sessions.length === 0 && !collapsed && (
          <div className="text-center py-10 px-3">
            <MessageSquare
              className="w-7 h-7 mx-auto mb-2"
              style={{ color: 'var(--text-light)' }}
            />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No conversations yet
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-light)' }}>
              Start a new chat above
            </p>
          </div>
        )}

        {sessions.map((session) => {
          const isActive = session.sessionId === activeSessionId;
          const isDeleting = deletingId === session.sessionId;

          return (
            <div
              key={session.sessionId}
              className={`group relative flex items-center gap-2 w-full text-left px-2 py-2 rounded text-sm transition-colors duration-100 cursor-pointer ${collapsed ? 'justify-center' : ''}`}
              style={{
                background: isActive ? 'var(--accent-bg)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--navy)' : '3px solid transparent',
                color: isActive ? 'var(--navy)' : 'var(--text-base)',
              }}
              onClick={() => onSelectSession(session.sessionId)}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <MessageSquare
                className="w-4 h-4 flex-shrink-0"
                style={{ color: isActive ? 'var(--navy)' : 'var(--text-muted)' }}
              />

              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate font-medium">Conversation</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-light)' }}>
                      {formatSessionDate(session.createdAt)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, session.sessionId)}
                    disabled={isDeleting}
                    title="Delete conversation"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded flex-shrink-0 transition-all duration-150"
                    style={{
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--danger)';
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
