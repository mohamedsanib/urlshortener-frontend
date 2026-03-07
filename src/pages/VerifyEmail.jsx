import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";
import AuthLayout from "../components/layout/AuthLayout";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }

    authApi.verifyEmail(token)
      .then((res) => { setStatus("success"); setMessage(res.message); })
      .catch((err) => { setStatus("error"); setMessage(err.message); });
  }, []);

  return (
    <AuthLayout title="Email verification" subtitle="">
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 20 }}>
        {status === "loading" && (
          <>
            <span className="spinner spinner-dark" style={{ margin: "0 auto", width: 28, height: 28 }} />
            <p style={{ color: "var(--grey-500)" }}>Verifying your email…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: "2.5rem" }}>✅</div>
            <p style={{ color: "var(--grey-700)" }}>{message}</p>
            <button className="btn btn-primary btn-full" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{ fontSize: "2.5rem" }}>❌</div>
            <div className="auth-error">{message}</div>
            <button className="btn btn-ghost btn-full" onClick={() => navigate("/login")}>
              Back to sign in
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
