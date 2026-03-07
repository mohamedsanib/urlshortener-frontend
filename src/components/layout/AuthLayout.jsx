import { useNavigate } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({ children, title, subtitle }) {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="auth-logo" onClick={() => navigate("/")}>ln/k</div>
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
