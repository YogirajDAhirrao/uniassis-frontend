import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={`animate-spin ${sizes[size]} ${className}`}
      style={{ color: 'var(--navy)' }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'var(--bg)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 flex items-center justify-center rounded"
          style={{ background: 'var(--navy)' }}
        >
          <span className="text-white text-xl font-bold" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            U
          </span>
        </div>
        <Spinner size="lg" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading UniAssist…</p>
      </div>
    </div>
  );
}
