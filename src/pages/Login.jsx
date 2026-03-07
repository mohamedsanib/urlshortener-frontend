import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { GOOGLE_CLIENT_ID } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setNeedsVerify(false); setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerify(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendVerification(form.email);
      toast("Verification email sent!");
    } catch {
      toast("Failed to resend email", "error");
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}

        {needsVerify && (
          <div className="auth-info">
            Your email isn't verified yet.{" "}
            <button type="button" style={{ color: "var(--black)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={handleResend}>
              Resend verification email
            </button>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required autoFocus />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} required />
        </div>

        <div style={{ textAlign: "right", marginTop: -8 }}>
          <Link to="/forgot-password" style={{ fontSize: "0.83rem", color: "var(--grey-500)" }}>
            Forgot password?
          </Link>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? <span className="spinner" /> : "Sign in"}
        </button>

        <div className="divider">or</div>

        <GoogleButton />
      </form>

      <div className="auth-footer">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </AuthLayout>
  );
}

// Shared Google button (inline here for now)
function GoogleButton() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  // Initialize once on mount — not on every click
  useEffect(() => {
    if (!window.google || initialized.current) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        setLoading(true);
        try {
          const res = await authApi.google(response.credential);
          login(res.token, res.user);
          navigate("/dashboard");
        } catch (err) {
          toast(err.message || "Google sign-in failed", "error");
        } finally {
          setLoading(false);
        }
      },
    });

    initialized.current = true;
  }, []);

  const handleGoogle = () => {
    if (!window.google) {
      toast("Google script not loaded yet, try again", "error");
      return;
    }
    window.google.accounts.id.prompt();
  };

  return (
    <button
      type="button"
      className="btn btn-google"
      onClick={handleGoogle}
      disabled={loading}
    >
      {loading ? <span className="spinner spinner-dark" /> : <GoogleIcon />}
      Continue with Google
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);
