import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import { authApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("email"); // email | otp | reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep("otp");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      setResetToken(res.resetToken);
      setStep("reset");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await authApi.resetPassword(resetToken, newPassword);
      login(res.token, res.user);
      navigate("/dashboard");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const titles = { email: "Forgot password", otp: "Enter OTP", reset: "Set new password" };
  const subs = {
    email: "We'll send a one-time code to your email.",
    otp: `Enter the 6-digit code sent to ${email}`,
    reset: "Choose a new password for your account.",
  };

  return (
    <AuthLayout title={titles[step]} subtitle={subs[step]}>
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      {step === "email" && (
        <form className="auth-form" onSubmit={handleEmailSubmit}>
          <div className="input-group">
            <label className="input-label">Email address</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Send OTP"}
          </button>
          <div className="auth-footer">
            <button type="button" onClick={() => navigate("/login")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--grey-500)", fontSize: "0.85rem" }}>
              ← Back to sign in
            </button>
          </div>
        </form>
      )}

      {step === "otp" && (
        <form className="auth-form" onSubmit={handleOtpSubmit}>
          <div className="input-group">
            <label className="input-label">6-digit OTP</label>
            <input
              className="input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="000000"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              style={{ fontSize: "1.5rem", letterSpacing: "0.3em", textAlign: "center" }}
            />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading || otp.length !== 6}>
            {loading ? <span className="spinner" /> : "Verify OTP"}
          </button>
          <div className="auth-footer">
            <button type="button" onClick={() => setStep("email")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--grey-500)", fontSize: "0.85rem" }}>
              ← Use different email
            </button>
          </div>
        </form>
      )}

      {step === "reset" && (
        <form className="auth-form" onSubmit={handleReset}>
          <div className="input-group">
            <label className="input-label">New password</label>
            <input className="input" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} autoFocus />
          </div>
          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : "Save new password"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
