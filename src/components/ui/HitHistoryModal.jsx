import { useState, useEffect } from "react";
import { linksApi } from "../../services/api";

const FILTERS = [
  { label: "All time", value: "" },
  { label: "Today", value: "today" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
  { label: "This year", value: "year" },
];

export default function HitHistoryModal({ link, onClose }) {
  const [filter, setFilter] = useState("");
  const [hits, setHits] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    const params = [];
    if (filter) params.push(`filter=${filter}`);
    params.push(`page=${page}`);
    linksApi.hits(link.id, params.length ? `?${params.join("&")}` : "")
      .then((data) => { setHits(data.hits); setPagination(data.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [link.id, filter, page]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 680, width: "100%" }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">Hit history</span>
            <p style={{ fontSize: "0.82rem", color: "var(--grey-500)", marginTop: 2 }}>{link.name}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--grey-400)", fontSize: "1.3rem", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`btn btn-sm ${filter === f.value ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <span className="spinner spinner-dark" />
          </div>
        ) : hits.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--grey-400)" }}>
            No hits in this period.
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Source</th>
                    <th>Browser / OS</th>
                    <th>Device</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {hits.map((h) => (
                    <tr key={h._id}>
                      <td style={{ whiteSpace: "nowrap" }}>{formatDate(h.hitAt)}</td>
                      <td>{[h.city, h.country].filter(Boolean).join(", ") || "—"}</td>
                      <td>{h.source || "Direct"}</td>
                      <td>{[h.browser, h.os].filter(Boolean).join(" / ") || "—"}</td>
                      <td style={{ textTransform: "capitalize" }}>{h.device || "—"}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>{h.ip || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--grey-500)" }}>
                  {pagination.total} total hits
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span style={{ padding: "7px 12px", fontSize: "0.85rem", color: "var(--grey-600)" }}>{page} / {pagination.pages}</span>
                  <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};
