import { useState, useEffect, useCallback, useRef } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import {
  createSession,
  listSessions,
  getSession,
  streamMessage,
} from '../api/chat';
import { toast } from 'react-hot-toast';

let msgIdCounter = 0;
const tempId = () => `temp-${++msgIdCounter}`;

export default function ChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const streamingMsgId = useRef(null);

  // Load sessions on mount
  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => toast.error('Failed to load conversations'));
  }, []);

  // Load messages when active session changes
  useEffect(() => {
    if (!activeSessionId) return;
    setLoadingSession(true);
    getSession(activeSessionId)
      .then((session) => {
        setMessages(
          session.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            streaming: false,
          }))
        );
      })
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingSession(false));
  }, [activeSessionId]);

  const handleNewSession = useCallback(async () => {
    try {
      setCreatingSession(true);
      const session = await createSession();
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.sessionId);
      setMessages([]);
    } catch {
      toast.error('Failed to create conversation');
    } finally {
      setCreatingSession(false);
    }
  }, []);

  const handleSelectSession = useCallback((sessionId) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    setMessages([]);
  }, [activeSessionId]);

  const handleSessionDeleted = useCallback((sessionId) => {
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [activeSessionId]);

  const handleSend = useCallback(async (content) => {
    if (!activeSessionId) {
      toast.error('Please select or create a conversation first');
      return;
    }
    if (isStreaming) return;

    const userMsgId = tempId();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: 'user', content, streaming: false },
    ]);

    const assistantId = tempId();
    streamingMsgId.current = assistantId;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ]);
    setIsStreaming(true);

    try {
      await streamMessage(activeSessionId, content, {
        onSources: (sources) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, sources } : m
            )
          );
        },
        onDelta: (text) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + text }
                : m
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, streaming: false } : m
            )
          );
          setIsStreaming(false);
        },
        onError: (err) => {
          toast.error(err || 'AI response failed');
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setIsStreaming(false);
        },
      });
    } catch {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      setIsStreaming(false);
    }
  }, [activeSessionId, isStreaming]);

  const handleSuggestion = useCallback((text) => {
    if (!activeSessionId) {
      handleNewSession().then(() => {
        setTimeout(() => {}, 100);
      });
    }
    handleSend(text);
  }, [activeSessionId, handleNewSession, handleSend]);

  return (
    <div
      className="fixed inset-0 flex"
      style={{ paddingTop: '56px', background: 'var(--bg)' }}
    >
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onSessionDeleted={handleSessionDeleted}
        creating={creatingSession}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0" style={{ background: 'var(--bg)' }}>
        {/* Session indicator */}
        {activeSessionId && (
          <div
            className="px-5 py-2 flex items-center gap-2"
            style={{ borderBottom: '1px solid var(--border)', background: '#fff' }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--success)' }}
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Active conversation
            </span>
            <span
              className="text-xs ml-auto font-mono"
              style={{ color: 'var(--text-light)' }}
            >
              {activeSessionId.slice(0, 8)}…
            </span>
          </div>
        )}

        {/* Messages */}
        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          isLoading={loadingSession}
          onSuggestion={(text) => {
            if (!activeSessionId) {
              toast.error('Create or select a conversation first');
              return;
            }
            handleSend(text);
          }}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          isStreaming={isStreaming}
          disabled={!activeSessionId}
        />
      </main>
    </div>
  );
}
