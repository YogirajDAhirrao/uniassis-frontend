import { FileText, Download, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { downloadDocument } from '../../api/documents';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

const statusConfig = {
  PROCESSING: {
    icon: Clock,
    label: 'Processing',
    color: 'var(--warning)',
    dot: '#fbbf24',
  },
  READY: {
    icon: CheckCircle,
    label: 'Ready',
    color: 'var(--success)',
    dot: '#22c55e',
  },
  FAILED: {
    icon: XCircle,
    label: 'Failed',
    color: 'var(--danger)',
    dot: '#ef4444',
  },
};

function StatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.PROCESSING;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded"
      style={{ color: config.color, background: `${config.dot}15`, border: `1px solid ${config.dot}40` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  );
}

function DocumentRow({ doc }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDocument(doc.id, doc.title);
      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 transition-colors duration-100"
      style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div
        className="w-8 h-8 flex items-center justify-center rounded flex-shrink-0"
        style={{ background: 'var(--navy)' }}
      >
        <FileText className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-base)' }}>
          {doc.title}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Uploaded{' '}
          {new Date(doc.createdAt).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </p>
      </div>

      <StatusBadge status={doc.status} />

      <button
        onClick={handleDownload}
        disabled={downloading}
        title="Download document"
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all duration-150"
        style={{
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: downloading ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        {downloading
          ? <RefreshCw className="w-4 h-4 animate-spin" />
          : <Download className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function DocumentList({ documents, loading }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded animate-pulse"
            style={{ background: '#f3f4f6' }}
          />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-light)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          No documents uploaded yet
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>
          Upload a PDF to get started
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded overflow-hidden"
      style={{ border: '1px solid var(--border)' }}
    >
      {documents.map((doc) => (
        <DocumentRow key={doc.id} doc={doc} />
      ))}
    </div>
  );
}
