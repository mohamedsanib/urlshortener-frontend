import { useState, useEffect, useCallback } from "react";
import { linksApi } from "../services/api";
import { SHORT_URL_BASE } from "../config";
import { useToast } from "../context/ToastContext";
import HitHistoryModal from "../components/ui/HitHistoryModal";
import LinkFormModal from "../components/ui/LinkFormModal";
import QRModal from "../components/ui/QRModal";
import "./Links.css";

export default function Links() {
  const toast = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // null | { link? }
  const [hitsModal, setHitsModal] = useState(null); // null | link
  const [qrModal, setQrModal] = useState(null);   // null | link

  const fetchLinks = useCallback(async () => {
    try {
      const data = await linksApi.list();
      setLinks(data);
    } catch { toast("Failed to load links", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLinks(); }, [fetchLinks]);

  const handleDelete = async (link) => {
    if (!window.confirm(`Delete "${link.name}"? This cannot be undone.`)) return;
    try {
      await linksApi.delete(link.id);
      setLinks((l) => l.filter((x) => x.id !== link.id));
      toast("Link deleted");
    } catch { toast("Failed to delete", "error"); }
  };

  const handleToggleStatus = async (link) => {
    const newStatus = link.status === "active" ? "inactive" : "active";
    try {
      const updated = await linksApi.update(link.id, { status: newStatus });
      setLinks((l) => l.map((x) => (x.id === link.id ? updated : x)));
      toast(`Link ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch { toast("Failed to update status", "error"); }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    toast("Copied to clipboard!");
  };

  const handleShare = (link) => {
    if (navigator.share) {
      navigator.share({ title: link.name, url: link.shortUrl });
    } else {
      handleCopy(link.shortUrl);
    }
  };

  return (
    <div className="links-page">
      <div className="links-header">
        <div>
          <h2>Links</h2>
          <p style={{ fontSize: "0.88rem", marginTop: 4 }}>{links.length} link{links.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setFormModal({})}>
          <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span> New link
        </button>
      </div>

      {loading ? (
        <div className="links-empty"><span className="spinner spinner-dark" /></div>
      ) : links.length === 0 ? (
        <div className="links-empty">
          <div className="links-empty-icon">🔗</div>
          <h3>No links yet</h3>
          <p>Create your first short link to get started.</p>
          <button className="btn btn-primary" onClick={() => setFormModal({})}>Create link</button>
        </div>
      ) : (
        <div className="links-list">
          {links.map((link) => (
            <LinkCard
              key={link.id}
              link={link}
              onEdit={() => setFormModal({ link })}
              onDelete={() => handleDelete(link)}
              onToggleStatus={() => handleToggleStatus(link)}
              onCopy={() => handleCopy(link.shortUrl)}
              onShare={() => handleShare(link)}
              onQR={() => setQrModal(link)}
              onHits={() => setHitsModal(link)}
            />
          ))}
        </div>
      )}

      {formModal !== null && (
        <LinkFormModal
          link={formModal.link}
          onClose={() => setFormModal(null)}
          onSaved={(saved) => {
            if (formModal.link) {
              setLinks((l) => l.map((x) => (x.id === saved.id ? saved : x)));
            } else {
              setLinks((l) => [saved, ...l]);
            }
            setFormModal(null);
            toast(formModal.link ? "Link updated" : "Link created!");
          }}
        />
      )}

      {hitsModal && (
        <HitHistoryModal link={hitsModal} onClose={() => setHitsModal(null)} />
      )}

      {qrModal && (
        <QRModal link={qrModal} onClose={() => setQrModal(null)} />
      )}
    </div>
  );
}

function LinkCard({ link, onEdit, onDelete, onToggleStatus, onCopy, onShare, onQR, onHits }) {
  return (
    <div className="link-card">
      <div className="link-card-main">
        <div className="link-card-info">
          <div className="link-card-top">
            <span className="link-name">{link.name}</span>
            <span className={`badge badge-${link.status}`}>{link.status}</span>
          </div>
          <a href={link.shortUrl} target="_blank" rel="noreferrer" className="link-short">
            {link.shortUrl.replace(/^https?:\/\//, "")}
          </a>
          <span className="link-original">{link.originalUrl}</span>
        </div>

        <div className="link-card-stats">
          <button className="link-hits-btn" onClick={onHits} title="View hit history">
            <span className="link-hits-count">{link.totalHits.toLocaleString()}</span>
            <span className="link-hits-label">hits</span>
          </button>
          {link.limitCount && (
            <span className="link-limit">/ {link.limitCount.toLocaleString()}</span>
          )}
        </div>
      </div>

      <div className="link-card-actions">
        <button className="btn btn-ghost btn-sm" onClick={onCopy} title="Copy link">
          <IconCopy />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onShare} title="Share">
          <IconShare />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onQR} title="QR code">
          <IconQR />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onEdit} title="Edit">
          <IconEdit />
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onToggleStatus} title={link.status === "active" ? "Deactivate" : "Activate"}>
          {link.status === "active" ? <IconPause /> : <IconPlay />}
        </button>
        <button className="btn btn-danger btn-sm" onClick={onDelete} title="Delete">
          <IconTrash />
        </button>
      </div>
    </div>
  );
}

const IconCopy = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 11V3a1 1 0 0 1 1-1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconShare = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="12" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 4l-6 3M10.5 12l-6-3" stroke="currentColor" strokeWidth="1.5"/></svg>;
const IconQR = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="10" y="1" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="1" y="10" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5"/><rect x="2.5" y="2.5" width="2" height="2" fill="currentColor"/><rect x="11.5" y="2.5" width="2" height="2" fill="currentColor"/><rect x="2.5" y="11.5" width="2" height="2" fill="currentColor"/><path d="M10 10h2v2h-2zM12 12h2v2h-2zM10 14h2" stroke="currentColor" strokeWidth="1.2"/></svg>;
const IconEdit = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>;
const IconTrash = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
const IconPause = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="3.5" height="12" rx="1" fill="currentColor"/><rect x="9.5" y="2" width="3.5" height="12" rx="1" fill="currentColor"/></svg>;
const IconPlay = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 2l10 6-10 6V2z" fill="currentColor"/></svg>;
