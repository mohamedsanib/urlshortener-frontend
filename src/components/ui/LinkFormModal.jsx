import { useState } from "react";
import { linksApi } from "../../services/api";

export default function LinkFormModal({ link, onClose, onSaved }) {
  const editing = !!link;
  const [form, setForm] = useState({
    name: link?.name || "",
    originalUrl: link?.originalUrl || "",
    limitCount: link?.limitCount || "",
    status: link?.status || "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const payload = {
        name: form.name,
        originalUrl: form.originalUrl,
        limitCount: form.limitCount ? parseInt(form.limitCount) : null,
        status: form.status,
      };
      const saved = editing
        ? await linksApi.update(link.id, payload)
        : await linksApi.create(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{editing ? "Edit link" : "New link"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--grey-400)", fontSize: "1.3rem", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {error && <div className="auth-error">{error}</div>}

          <div className="input-group">
            <label className="input-label">Name</label>
            <input className="input" placeholder="My awesome link" value={form.name} onChange={set("name")} required />
          </div>

          {!editing && (
            <div className="input-group">
              <label className="input-label">Destination URL</label>
              <input className="input" type="url" placeholder="https://example.com/very/long/url" value={form.originalUrl} onChange={set("originalUrl")} required />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Hit limit <span style={{ color: "var(--grey-400)", fontWeight: 400 }}>(optional)</span></label>
            <input className="input" type="number" min="1" placeholder="Unlimited" value={form.limitCount} onChange={set("limitCount")} />
          </div>

          {editing && (
            <div className="input-group">
              <label className="input-label">Status</label>
              <select className="input" value={form.status} onChange={set("status")} style={{ cursor: "pointer" }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : editing ? "Save changes" : "Create link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
