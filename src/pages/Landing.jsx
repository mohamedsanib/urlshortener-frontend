import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Landing.css";

const WORDS = ["memorable.", "trackable.", "powerful.", "yours."];

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  // Cycle through animated words
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <span className="landing-logo">ln/k</span>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/signup")}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="landing-eyebrow">URL Shortener</div>

        <h1 className="landing-headline">
          <span className="display">Links that are</span>
          <br />
          <span className={`landing-word display ${visible ? "word-in" : "word-out"}`}>
            {WORDS[wordIndex]}
          </span>
        </h1>

        <p className="landing-sub">
          Shorten, track, and analyse every link you share.
          <br />
          Clean URLs. Deep insights. Zero friction.
        </p>

        <div className="landing-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/signup")}
          >
            Start for free
            <ArrowRight />
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
        </div>

        {/* Decorative stats strip */}
        <div className="landing-stats">
          {[
            { label: "Links shortened", value: "—" },
            { label: "Total clicks tracked", value: "—" },
            { label: "Countries reached", value: "—" },
          ].map((s) => (
            <div key={s.label} className="landing-stat">
              <span className="landing-stat-value">{s.value}</span>
              <span className="landing-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Features */}
      <section className="landing-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="landing-feature">
            <div className="landing-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2 className="display">Ready to get started?</h2>
        <p>Create your free account in seconds.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("/signup")}>
          Create free account
        </button>
      </section>

      <footer className="landing-footer">
        <span>ln/k — URL Shortener</span>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: "⚡", title: "Instant shortening", desc: "Paste any URL and get a clean short link in one click." },
  { icon: "📊", title: "Deep analytics", desc: "Track hits, locations, devices, and referrers in real time." },
  { icon: "🔒", title: "Full control", desc: "Set hit limits, toggle links on/off, and delete any time." },
  { icon: "📱", title: "QR codes", desc: "Every link gets a QR code, ready to share anywhere." },
];

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
