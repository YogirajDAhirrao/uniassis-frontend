import api from './axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Sessions ────────────────────────────────────────────────────────────────

export const createSession = async () => {
  const { data } = await api.post('/api/chat/sessions');
  return data;
};

export const listSessions = async () => {
  const { data } = await api.get('/api/chat/sessions');
  return data;
};

export const getSession = async (sessionId) => {
  const { data } = await api.get(`/api/chat/sessions/${sessionId}`);
  return data;
};

export const deleteSession = async (sessionId) => {
  await api.delete(`/api/chat/sessions/${sessionId}`);
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const sendMessage = async (sessionId, content) => {
  const { data } = await api.post(`/api/chat/sessions/${sessionId}/messages`, { content });
  return data;
};

/**
 * Stream a message using Server-Sent Events.
 * Calls onDelta(text) for each streamed chunk.
 * Calls onSources(sources) when document citations are available.
 * Calls onDone() when streaming is complete.
 * Calls onError(msg) on error.
 */
export const streamMessage = async (sessionId, content, { onDelta, onSources, onDone, onError }) => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(
    `${BASE_URL}/api/chat/sessions/${sessionId}/messages/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Stream failed' }));
    onError?.(err.error || 'Failed to start stream');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;
        try {
          const chunk = JSON.parse(jsonStr);
          if (chunk.type === 'sources' && chunk.sources) {
            onSources?.(chunk.sources);
          } else if (chunk.type === 'delta' && chunk.content) {
            onDelta?.(chunk.content);
          } else if (chunk.type === 'done') {
            onDone?.();
            return;
          } else if (chunk.type === 'error') {
            onError?.(chunk.error || 'Unknown error');
            return;
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  }

  onDone?.();
};
