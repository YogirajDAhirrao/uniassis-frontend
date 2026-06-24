import { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, Database, Clock, CheckCircle, Loader2, Download, Trash2, XCircle } from 'lucide-react';
import DocumentUpload from '../components/documents/DocumentUpload';
import { listDocuments, deleteDocument, downloadDocument, getDocumentStatus } from '../api/documents';
import { toast } from 'react-hot-toast';

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CFG = {
  PROCESSING: { icon: Clock,        label: 'Processing', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  READY:      { icon: CheckCircle,  label: 'Ready',      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  FAILED:     { icon: XCircle,      label: 'Failed',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PROCESSING;
  const { icon: Icon, label, color, bg, border } = cfg;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Document row ──────────────────────────────────────────────────────────────

function DocumentRow({ doc, onDeleted, onRefreshStatus }) {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [polling, setPolling] = useState(false);

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

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${doc.title}"? This also removes it from the AI knowledge base.`)) return;
    try {
      setDeleting(true);
      await deleteDocument(doc.id);
      toast.success('Document deleted');
      onDeleted(doc.id);
    } catch {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setPolling(true);
      const updated = await getDocumentStatus(doc.id);
      onRefreshStatus(updated);
    } catch {
      toast.error('Could not refresh status');
    } finally {
      setPolling(false);
    }
  };

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 transition-colors duration-100"
      style={{ borderBottom: '1px solid var(--border)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 flex items-center justify-center rounded flex-shrink-0"
        style={{ background: 'var(--navy)' }}
      >
        <FileText className="w-4 h-4 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-base)' }}>
          {doc.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Date(doc.createdAt).toLocaleDateString('en-GB', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
          {doc._count?.chunks > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              · {doc._count.chunks} chunks
            </span>
          )}
          {doc.uploadedBy?.name && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              · {doc.uploadedBy.name}
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <StatusBadge status={doc.status} />

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {/* Refresh status — useful while PROCESSING */}
        {doc.status === 'PROCESSING' && (
          <button
            onClick={handleRefresh}
            disabled={polling}
            title="Refresh status"
            className="p-1.5 rounded"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${polling ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          title="Download document"
          className="p-1.5 rounded"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          {downloading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Download className="w-3.5 h-3.5" />}
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete document"
          className="p-1.5 rounded"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#fef2f2'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}
        >
          {deleting
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocuments = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const docs = await listDocuments();
      setDocuments(docs);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploaded = (doc) => {
    // Prepend newly uploaded document
    setDocuments((prev) => [doc.document ?? doc, ...prev]);
  };

  const handleDeleted = (documentId) => {
    setDocuments((prev) => prev.filter((d) => d.id !== documentId));
  };

  const handleRefreshStatus = (updated) => {
    setDocuments((prev) => prev.map((d) => d.id === updated.id ? updated : d));
  };

  const stats = [
    { label: 'Total Documents', value: documents.length,                                                  icon: Database },
    { label: 'Processing',       value: documents.filter((d) => d.status === 'PROCESSING').length,        icon: Clock },
    { label: 'Ready for AI',     value: documents.filter((d) => d.status === 'READY').length,             icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen pt-14 pb-12 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: '2px solid var(--navy)' }}
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
            >
              Document Management
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Upload and manage academic documents for the AI knowledge base
            </p>
          </div>
          <button
            onClick={() => fetchDocuments(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-sm transition-colors duration-150"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-3 gap-0 mt-6 mb-6 rounded overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {stats.map(({ label, value, icon: Icon }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-6 py-4"
              style={{ background: '#fff', borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded flex-shrink-0"
                style={{ background: 'var(--navy)' }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Upload Panel */}
          <div className="lg:col-span-2">
            <DocumentUpload onUploaded={handleUploaded} />
          </div>

          {/* Documents List */}
          <div className="lg:col-span-3 card">
            <div
              className="flex items-center justify-between mb-4 pb-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <h3
                className="text-base font-semibold flex items-center gap-2"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
              >
                <Database className="w-4 h-4" />
                Knowledge Base
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded animate-pulse" style={{ background: '#f3f4f6' }} />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-light)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No documents uploaded yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>Upload a PDF to get started</p>
              </div>
            ) : (
              <div className="rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {documents.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onDeleted={handleDeleted}
                    onRefreshStatus={handleRefreshStatus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
