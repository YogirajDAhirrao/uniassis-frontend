import { useState, useEffect } from "react";
import { FileText, RefreshCw, Database, Clock } from "lucide-react";
import DocumentUpload from "../components/documents/DocumentUpload";
import DocumentList from "../components/documents/DocumentList";
import { toast } from "react-hot-toast";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load from sessionStorage if available
    const cached = sessionStorage.getItem("ua_documents");
    if (cached) {
      try {
        setDocuments(JSON.parse(cached));
      } catch {}
    }
    setLoading(false);
  }, []);

  const handleUploaded = (doc) => {
    setDocuments((prev) => {
      const updated = [doc, ...prev];
      sessionStorage.setItem("ua_documents", JSON.stringify(updated));
      return updated;
    });
  };

  const refreshStatuses = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Status refreshed");
    }, 600);
  };

  const stats = [
    {
      label: "Total Documents",
      value: documents.length,
      icon: Database,
    },
    {
      label: "Processing",
      value: documents.filter((d) => d.status === "PROCESSING").length,
      icon: Clock,
    },
    {
      label: "Ready for AI",
      value: documents.filter((d) => d.status === "READY").length,
      icon: FileText,
    },
  ];

  return (
    <div
      className="min-h-screen pt-14 pb-12 px-4"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: "2px solid var(--navy)" }}
        >
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "var(--navy)",
              }}
            >
              Document Management
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Upload and manage academic documents for the AI knowledge base
            </p>
          </div>
          <button
            onClick={refreshStatuses}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-sm transition-colors duration-150"
            style={{
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              background: "#fff",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
            }}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-3 gap-0 mt-6 mb-6 rounded overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {stats.map(({ label, value, icon: Icon }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-6 py-4"
              style={{
                background: "#fff",
                borderRight:
                  i < stats.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center rounded flex-shrink-0"
                style={{ background: "var(--navy)" }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    color: "var(--navy)",
                  }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
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
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="text-base font-semibold flex items-center gap-2"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: "var(--navy)",
                }}
              >
                <Database className="w-4 h-4" />
                Knowledge Base
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </span>
            </div>

            <DocumentList documents={documents} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
