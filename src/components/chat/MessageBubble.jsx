import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CopyButton({ content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy message"
      className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all duration-150"
      style={{
        color: 'var(--text-muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
    >
      {copied
        ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const isStreaming = message.streaming;

  return (
    <div className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>

      {/* Avatar */}
      <div
        className="w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{
          background: isUser ? 'var(--navy)' : '#e5e7eb',
          border: '1px solid var(--border)',
        }}
      >
        {isUser
          ? <User className="w-3.5 h-3.5" />
          : <Bot className="w-3.5 h-3.5" style={{ color: 'var(--navy)' }} />}
      </div>

      {/* Bubble */}
      <div
        className="relative max-w-[80%]"
        style={{
          background: isUser ? 'var(--navy)' : '#ffffff',
          border: isUser ? 'none' : '1px solid var(--border)',
          borderRadius: isUser ? '12px 2px 12px 12px' : '2px 12px 12px 12px',
          padding: '10px 14px',
          boxShadow: isUser ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {isUser ? (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: '#ffffff' }}
          >
            {message.content}
          </p>
        ) : (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || ''}
            </ReactMarkdown>
            {isStreaming && (
              <span
                className="inline-block w-2 h-4 rounded-sm ml-0.5 align-middle"
                style={{
                  background: 'var(--navy)',
                  opacity: 0.7,
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              />
            )}
          </div>
        )}

        {/* Copy button for assistant messages */}
        {!isUser && !isStreaming && message.content && (
          <div className="absolute top-2 right-2">
            <CopyButton content={message.content} />
          </div>
        )}
      </div>
    </div>
  );
}
