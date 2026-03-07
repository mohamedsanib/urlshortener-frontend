import { useEffect, useRef } from "react";

// Minimal QR code display using a Google Charts API (free, no key needed)
// Alternative: use the qrcode.js library if offline support is needed

export default function QRModal({ link, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link.shortUrl)}`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(link.shortUrl)}`;
    a.download = `${link.slug}-qr.png`;
    a.target = "_blank";
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link.shortUrl);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 340, textAlign: "center" }}>
        <div className="modal-header">
          <span className="modal-title">QR Code</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--grey-400)", fontSize: "1.3rem", lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--grey-500)", marginBottom: 20 }}>{link.name}</p>

        <div style={{
          background: "var(--grey-50)",
          border: "1px solid var(--grey-200)",
          borderRadius: "var(--radius)",
          padding: 20,
          display: "inline-block",
          marginBottom: 20,
        }}>
          <img
            src={qrUrl}
            alt="QR code"
            width={220}
            height={220}
            style={{ display: "block" }}
          />
        </div>

        <p style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--grey-500)", marginBottom: 20, wordBreak: "break-all" }}>
          {link.shortUrl}
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={handleCopy}>Copy URL</button>
          <button className="btn btn-primary" onClick={handleDownload}>Download QR</button>
        </div>
      </div>
    </div>
  );
}
