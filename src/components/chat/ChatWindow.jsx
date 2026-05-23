import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import Spinner from '../ui/Spinner';
import { BookOpen, Search, FileText, Zap } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Search,   text: 'Explain the syllabus for Data Structures' },
  { icon: FileText, text: 'What are the important topics in OS unit 3?' },
  { icon: Zap,      text: 'Summarize the key concepts of DBMS' },
  { icon: BookOpen, text: 'Give me practice questions for Computer Networks' },
];

function EmptyState({ onSuggestion }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
      {/* Icon */}
      <div
        className="w-14 h-14 flex items-center justify-center rounded mb-5"
        style={{ background: 'var(--navy)' }}
      >
        <BookOpen className="w-7 h-7 text-white" />
      </div>

      <h2
        className="text-xl font-semibold mb-1.5"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
      >
        UniAssist
      </h2>
      <p className="text-sm text-center max-w-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Ask me anything about your academic documents — syllabi, question papers, lab manuals, and more.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => onSuggestion(text)}
            className="flex items-start gap-3 p-3 rounded text-left transition-colors duration-150"
            style={{
              background: '#fff',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--navy)';
              e.currentTarget.style.background = 'var(--accent-bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = '#fff';
            }}
          >
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--navy)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-base)' }}>
              {text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isStreaming, isLoading, onSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyState onSuggestion={onSuggestion} />;
  }

  return (
    <div
      className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-5"
      style={{ background: 'var(--bg)' }}
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
