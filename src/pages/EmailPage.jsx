import { useState, useEffect } from "react";
import {
  Mail,
  Send,
  RefreshCw,
  ChevronRight,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  sendEmailCampaign,
  getCampaignHistory,
  getCampaignById,
  retryFailedEmails,
} from "../api/email";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

// Must match schema courseId = 1 → ALL
const COURSES = [
  { id: 1, name: "All Courses (Everyone)" },
  { id: 2, name: "BE" },
  { id: 3, name: "BCA" },
  { id: 4, name: "MCA" },
  { id: 5, name: "ME" },
  { id: 6, name: "BA" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SENT: {
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    label: "Sent",
    Icon: CheckCircle,
  },
  SENDING: {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    label: "Sending",
    Icon: Clock,
  },
  DRAFT: {
    color: "#6b7280",
    bg: "#f9fafb",
    border: "#e5e7eb",
    label: "Draft",
    Icon: Clock,
  },
  FAILED: {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    label: "Failed",
    Icon: XCircle,
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const { Icon, label, color, bg, border } = cfg;
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

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Campaign Detail Panel ────────────────────────────────────────────────────

function CampaignDetail({ campaignId, onClose, onRetry }) {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getCampaignById(campaignId);
        setCampaign(data);
      } catch {
        toast.error("Failed to load campaign details");
        onClose();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campaignId]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      const result = await retryFailedEmails(campaignId);
      toast.success(`Retried ${result.retried} — ${result.resent} resent`);
      onRetry();
      // Reload detail
      const data = await getCampaignById(campaignId);
      setCampaign(data);
    } catch {
      toast.error("Retry failed");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "var(--navy)" }}
        />
      </div>
    );
  }

  if (!campaign) return null;

  const failedRecipients =
    campaign.recipients?.filter((r) => r.status === "FAILED") ?? [];

  return (
    <div className="flex-1 min-w-0 overflow-y-auto">
      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 p-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="min-w-0">
          <p
            className="text-xs uppercase tracking-widest font-semibold mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            Campaign
          </p>
          <h2
            className="text-lg font-bold truncate"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: "var(--navy)",
            }}
          >
            {campaign.subject}
          </h2>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <StatusBadge status={campaign.status} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {campaign.course?.name}
            </span>
            <span className="text-xs" style={{ color: "var(--text-light)" }}>
              Sent {formatDate(campaign.sentAt)}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-xs px-2 py-1.5 rounded flex-shrink-0"
          style={{
            color: "var(--text-muted)",
            background: "none",
            border: "1px solid var(--border)",
            cursor: "pointer",
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-3 gap-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {[
          {
            label: "Total",
            value: campaign.totalRecipients,
            color: "var(--navy)",
          },
          { label: "Sent", value: campaign.sentCount, color: "#16a34a" },
          {
            label: "Failed",
            value: campaign.failedCount,
            color: campaign.failedCount > 0 ? "#dc2626" : "var(--text-muted)",
          },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            className="text-center py-4"
            style={{ borderRight: i < 2 ? "1px solid var(--border)" : "none" }}
          >
            <p
              className="text-xl font-bold"
              style={{ color, fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="p-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Email Body
        </p>
        <div
          className="rounded p-4 text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            color: "var(--text-base)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {campaign.body}
        </div>
      </div>

      {/* Retry */}
      {failedRecipients.length > 0 && (
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="btn-primary text-sm flex items-center gap-2"
          >
            {retrying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            {retrying ? "Retrying…" : `Retry ${failedRecipients.length} failed`}
          </button>
        </div>
      )}

      {/* Recipients list */}
      <div className="p-5">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Recipients ({campaign.recipients?.length ?? 0})
        </p>
        <div
          className="rounded overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {(campaign.recipients ?? []).map((r, i) => (
            <div
              key={r.id}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                borderBottom:
                  i < campaign.recipients.length - 1
                    ? "1px solid var(--border)"
                    : "none",
                background: "#fff",
              }}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "var(--navy)" }}
              >
                {r.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--text-base)" }}
                >
                  {r.user?.name ?? "—"}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--text-muted)" }}
                >
                  {r.email}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Compose Form ─────────────────────────────────────────────────────────────

function ComposeForm({ onSent }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", body: "", courseId: "1" });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.body.trim()) e.body = "Body is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setSending(true);
      const result = await sendEmailCampaign({
        subject: form.subject.trim(),
        body: form.body.trim(),
        courseId: form.courseId,
      });
      toast.success(
        `Email sent — ${result.sentCount}/${result.totalRecipients} delivered`,
      );
      setForm({ subject: "", body: "", courseId: "1" });
      onSent(result.campaignId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Mail className="w-4 h-4" style={{ color: "var(--navy)" }} />
        <h2
          className="text-base font-semibold"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: "var(--navy)",
          }}
        >
          Compose Email
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* From (read-only display) */}
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "var(--text-muted)" }}
          >
            From
          </label>
          <div
            className="px-3 py-2 rounded text-sm"
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            {user?.name} <span className="text-xs">[admin]</span>
          </div>
        </div>

        {/* Target course */}
        <div>
          <label
            className="block text-xs font-medium mb-1"
            htmlFor="email-course"
            style={{ color: "var(--text-base)" }}
          >
            Send To
          </label>
          <select
            id="email-course"
            value={form.courseId}
            onChange={set("courseId")}
            className="form-input text-sm"
          >
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label
            className="block text-xs font-medium mb-1"
            htmlFor="email-subject"
            style={{ color: "var(--text-base)" }}
          >
            Subject <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="email-subject"
            type="text"
            value={form.subject}
            onChange={set("subject")}
            placeholder="e.g. Exam Timetable — October 2025"
            className={`form-input text-sm ${errors.subject ? "error" : ""}`}
          />
          {errors.subject && (
            <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
              {errors.subject}
            </p>
          )}
        </div>

        {/* Body */}
        <div>
          <label
            className="block text-xs font-medium mb-1"
            htmlFor="email-body"
            style={{ color: "var(--text-base)" }}
          >
            Message <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <textarea
            id="email-body"
            value={form.body}
            onChange={set("body")}
            placeholder="Write your email message here…"
            rows={8}
            className={`form-input resize-y text-sm ${errors.body ? "error" : ""}`}
          />
          {errors.body && (
            <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>
              {errors.body}
            </p>
          )}
        </div>

        {/* Info */}
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded text-xs"
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
          }}
        >
          <Users className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          Emails will be sent to all students{" "}
          {form.courseId === "1"
            ? "across all courses"
            : `enrolled in the selected course`}
          .
        </div>

        <button
          type="submit"
          id="send-email-btn"
          disabled={sending}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {sending ? "Sending…" : "Send Email"}
        </button>
      </form>
    </div>
  );
}

// ─── Campaign History List ────────────────────────────────────────────────────

function CampaignList({ campaigns, loading, selectedId, onSelect }) {
  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded animate-pulse"
            style={{ background: "#f3f4f6" }}
          />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="p-6 text-center">
        <Mail
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "var(--text-light)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No campaigns yet
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-light)" }}>
          Compose and send your first email above
        </p>
      </div>
    );
  }

  return (
    <div>
      {campaigns.map((c) => {
        const isSelected = c.id === selectedId;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="w-full text-left px-4 py-3 transition-colors duration-100"
            style={{
              background: isSelected ? "var(--accent-bg)" : "#fff",
              borderLeft: `3px solid ${isSelected ? "var(--navy)" : "transparent"}`,
              borderBottom: "1px solid var(--border)",
              cursor: "pointer",
              border: "none",
              borderLeft: `3px solid ${isSelected ? "var(--navy)" : "transparent"}`,
              borderBottom: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "var(--bg)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.background = "#fff";
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className="text-sm font-medium truncate"
                style={{
                  color: isSelected ? "var(--navy)" : "var(--text-base)",
                }}
              >
                {c.subject}
              </p>
              <ChevronRight
                className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--text-light)" }}
              />
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={c.status} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {c.course?.name}
              </span>
              <span
                className="text-xs ml-auto"
                style={{ color: "var(--text-light)" }}
              >
                {formatDate(c.createdAt)}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {c.sentCount}/{c.totalRecipients} delivered
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getCampaignHistory();
      setCampaigns(data);
    } catch {
      toast.error("Failed to load email history");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSent = (newCampaignId) => {
    loadHistory();
    setSelectedCampaignId(newCampaignId);
  };

  return (
    <div className="min-h-screen pt-14" style={{ background: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div
          className="flex items-center justify-between pb-5 mb-6"
          style={{ borderBottom: "2px solid var(--navy)" }}
        >
          <div>
            <h1
              className="text-2xl font-bold flex items-center gap-2"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: "var(--navy)",
              }}
            >
              <Mail className="w-6 h-6" />
              Email Campaigns
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Send emails to students by course and track delivery
            </p>
          </div>
          <button
            onClick={loadHistory}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-sm"
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
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Compose — left */}
          <div
            className="lg:col-span-4 rounded overflow-hidden"
            style={{ background: "#fff", border: "1px solid var(--border)" }}
          >
            <ComposeForm onSent={handleSent} />
          </div>

          {/* History — middle */}
          <div
            className="lg:col-span-3 rounded overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
            }}
          >
            <div
              className="px-4 py-3 sticky top-0"
              style={{
                background: "#fff",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <h3
                className="text-sm font-semibold"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: "var(--navy)",
                }}
              >
                Sent Campaigns
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {campaigns.length} total
              </p>
            </div>
            <CampaignList
              campaigns={campaigns}
              loading={historyLoading}
              selectedId={selectedCampaignId}
              onSelect={setSelectedCampaignId}
            />
          </div>

          {/* Detail — right */}
          <div
            className="lg:col-span-5 rounded overflow-hidden flex flex-col"
            style={{
              background: "#fff",
              border: "1px solid var(--border)",
              minHeight: "400px",
              maxHeight: "calc(100vh - 200px)",
              overflowY: "auto",
            }}
          >
            {selectedCampaignId ? (
              <CampaignDetail
                key={selectedCampaignId}
                campaignId={selectedCampaignId}
                onClose={() => setSelectedCampaignId(null)}
                onRetry={loadHistory}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <Mail
                  className="w-10 h-10 mb-3"
                  style={{ color: "var(--text-light)" }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-muted)" }}
                >
                  Select a campaign
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-light)" }}
                >
                  Click any campaign from the list to see its details and
                  recipient status
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
