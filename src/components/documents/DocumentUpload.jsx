import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { uploadDocument } from '../../api/documents';
import { toast } from 'react-hot-toast';

export default function DocumentUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.pdf$/i, ''));
    } else {
      toast.error('Only PDF files are supported');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error('Please select a PDF and enter a title');
      return;
    }
    try {
      setUploading(true);
      const result = await uploadDocument(file, title.trim());
      toast.success('Document uploaded! Processing started…');
      onUploaded?.(result.document);
      setFile(null);
      setTitle('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      {/* Header */}
      <div
        className="flex items-center gap-2 mb-5 pb-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <Upload className="w-4 h-4" style={{ color: 'var(--navy)' }} />
        <h3
          className="text-base font-semibold"
          style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: 'var(--navy)' }}
        >
          Upload Academic Document
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="relative p-8 text-center cursor-pointer rounded transition-colors duration-150"
          style={{
            border: `2px dashed ${
              dragOver
                ? 'var(--navy)'
                : file
                  ? 'var(--success)'
                  : 'var(--border)'
            }`,
            background: dragOver
              ? 'var(--accent-bg)'
              : file
                ? '#f0fdf4'
                : 'var(--bg)',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
            id="document-file-input"
          />

          {file ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-10 h-10" style={{ color: 'var(--success)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
                {file.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(''); }}
                className="text-xs flex items-center gap-1 mt-1"
                style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-12 h-12 flex items-center justify-center rounded"
                style={{ background: 'var(--navy)' }}
              >
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-base)' }}>
                  Drop your PDF here or{' '}
                  <span style={{ color: 'var(--accent)' }}>browse</span>
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  PDF files only, max 50 MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="doc-title"
            style={{ color: 'var(--text-base)' }}
          >
            Document Title
          </label>
          <input
            id="doc-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Structures Syllabus SY 2024"
            className="form-input"
            required
          />
        </div>

        {/* Info notice */}
        <div
          className="flex items-start gap-2 p-3 rounded"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
          <p className="text-xs" style={{ color: '#92400e' }}>
            After upload, the document will be processed for AI search. This may take a minute.
          </p>
        </div>

        <Button
          type="submit"
          loading={uploading}
          disabled={!file || !title.trim()}
          className="w-full"
          id="upload-submit-btn"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading…' : 'Upload Document'}
        </Button>
      </form>
    </div>
  );
}
