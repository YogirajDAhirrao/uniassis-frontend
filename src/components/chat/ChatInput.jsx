import { useState, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

export default function ChatInput({ onSend, isStreaming, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }, [value]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = value.trim() && !isStreaming && !disabled;

  return (
    <div
      className="px-4 sm:px-6 py-3"
      style={{ borderTop: '1px solid var(--border)', background: '#fff' }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-end gap-2 rounded p-1.5"
          style={{
            border: '1.5px solid var(--border)',
            background: disabled ? '#f9fafb' : '#fff',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Select or create a conversation to start chatting…'
                : 'Ask about your academic documents… (Shift+Enter for new line)'
            }
            disabled={disabled || isStreaming}
            rows={1}
            className="flex-1 resize-none focus:outline-none text-sm leading-relaxed px-2 py-1.5"
            style={{
              background: 'transparent',
              color: 'var(--text-base)',
              minHeight: '38px',
              maxHeight: '180px',
              fontFamily: 'Inter, sans-serif',
            }}
          />

          <button
            id="send-btn"
            type="submit"
            disabled={!canSend}
            title={isStreaming ? 'AI is responding…' : 'Send message (Enter)'}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded transition-colors duration-150"
            style={{
              background: canSend ? 'var(--navy)' : '#e5e7eb',
              color: canSend ? '#fff' : 'var(--text-light)',
              border: 'none',
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            {isStreaming
              ? <Square className="w-3.5 h-3.5" />
              : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p
          className="text-center text-xs mt-1.5"
          style={{ color: 'var(--text-light)' }}
        >
          UniAssist may make mistakes. Verify with official academic documents.
        </p>
      </form>
    </div>
  );
}
