import { API_URL } from "../config";

// ─────────────────────────────────────────────────────────────
// Core fetch wrapper — attaches Bearer token, handles errors
// ─────────────────────────────────────────────────────────────

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
};

const get = (path) => request(path, { method: "GET" });
const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
const patch = (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) });
const del = (path) => request(path, { method: "DELETE" });

// ─── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data) => post("/auth/register", data),
  login: (data) => post("/auth/login", data),
  google: (idToken) => post("/auth/google", { idToken }),
  verifyEmail: (token) => get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => post("/auth/resend-verification", { email }),
  forgotPassword: (email) => post("/auth/forgot-password", { email }),
  verifyOtp: (email, otp) => post("/auth/verify-otp", { email, otp }),
  resetPassword: (resetToken, newPassword) => post("/auth/reset-password", { resetToken, newPassword }),
  me: () => get("/auth/me"),
  sessions: () => get("/auth/sessions"),
  logout: () => post("/auth/logout", {}),
  logoutAll: () => post("/auth/logout-all", {}),
};

// ─── Links ─────────────────────────────────────────────────
export const linksApi = {
  list: () => get("/links"),
  create: (data) => post("/links", data),
  update: (id, data) => patch(`/links/${id}`, data),
  delete: (id) => del(`/links/${id}`),
  hits: (id, params = "") => get(`/links/${id}/hits${params}`),
};

// ─── Analytics ─────────────────────────────────────────────
export const analyticsApi = {
  summary: () => get("/analytics/summary"),
  graph: (period) => get(`/analytics/graph?period=${period}`),
  perLink: () => get("/analytics/per-link"),
  linkGraph: (id, period) => get(`/analytics/per-link/${id}/graph?period=${period}`),
};
