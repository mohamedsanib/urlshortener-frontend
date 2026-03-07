import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="dash">
      {/* Sidebar */}
      <aside className={`dash-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="dash-logo" onClick={() => navigate("/dashboard")}>ln/k</div>

        <nav className="dash-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => `dash-nav-item ${isActive ? "active" : ""}`}>
            <IconLinks /> Links
          </NavLink>
          <NavLink to="/dashboard/analytics" className={({ isActive }) => `dash-nav-item ${isActive ? "active" : ""}`}>
            <IconChart /> Analytics
          </NavLink>
        </nav>

        <div className="dash-sidebar-footer">
          <div className="dash-user">
            <div className="dash-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div className="dash-user-info">
              <span className="dash-user-name">{user?.name}</span>
              <span className="dash-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm dash-logout" onClick={handleLogout}>
            <IconLogout /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && <div className="dash-overlay" onClick={() => setMenuOpen(false)} />}

      {/* Main content */}
      <main className="dash-main">
        <header className="dash-header">
          <button className="dash-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <IconMenu />
          </button>
          <span className="dash-header-logo">ln/k</span>
        </header>

        <div className="dash-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const IconLinks = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.536 3.536 0 0 0-5-5l-1 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.536 3.536 0 0 0 5 5l1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 12l4-4 3 3 4-5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
