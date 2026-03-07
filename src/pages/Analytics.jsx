import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { analyticsApi } from "../services/api";
import "./Analytics.css";

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "This month", value: "month" },
  { label: "This year", value: "year" },
];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [graphPeriod, setGraphPeriod] = useState("month");
  const [graphData, setGraphData] = useState([]);
  const [perLink, setPerLink] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.summary(),
      analyticsApi.perLink(),
    ]).then(([sum, pl]) => {
      setSummary(sum);
      setPerLink(pl);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    analyticsApi.graph(graphPeriod).then(setGraphData).catch(() => {});
  }, [graphPeriod]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
      </div>
    );
  }

  const formatTick = (val) => {
    if (graphPeriod === "today") return val.slice(11, 16);
    if (graphPeriod === "year") return val.slice(5); // MM
    return val.slice(5); // MM-DD
  };

  return (
    <div className="analytics-page">
      <div style={{ marginBottom: 28 }}>
        <h2>Analytics</h2>
        <p style={{ fontSize: "0.88rem", marginTop: 4 }}>Overview of your link performance</p>
      </div>

      {/* Summary cards */}
      <div className="analytics-cards">
        {[
          { label: "Today", value: summary?.today ?? 0 },
          { label: "This month", value: summary?.thisMonth ?? 0 },
          { label: "This year", value: summary?.thisYear ?? 0 },
          { label: "All time", value: summary?.allTime ?? 0 },
        ].map((card) => (
          <div key={card.label} className="analytics-card">
            <span className="analytics-card-value">{card.value.toLocaleString()}</span>
            <span className="analytics-card-label">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Account-level graph */}
      <div className="analytics-section">
        <div className="analytics-section-header">
          <h3>Total hits</h3>
          <div style={{ display: "flex", gap: 6 }}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                className={`btn btn-sm ${graphPeriod === p.value ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setGraphPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {graphData.length === 0 ? (
          <div className="analytics-empty">No data for this period.</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={graphData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a0a0a" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#0a0a0a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatTick} tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e8e8e8", borderRadius: 8, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                labelFormatter={(v) => v}
                formatter={(v) => [v, "Hits"]}
              />
              <Area type="monotone" dataKey="count" stroke="#0a0a0a" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: "#0a0a0a" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Per-link bar chart */}
      {perLink.length > 0 && (
        <div className="analytics-section">
          <div className="analytics-section-header">
            <h3>Hits by link</h3>
          </div>
          <ResponsiveContainer width="100%" height={Math.max(180, perLink.length * 36)}>
            <BarChart data={perLink} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#a3a3a3" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 12, fill: "#525252" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: "1px solid #e8e8e8", borderRadius: 8, fontSize: 13 }}
                formatter={(v) => [v, "Hits"]}
              />
              <Bar dataKey="totalHits" fill="#0a0a0a" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-link table */}
      {perLink.length > 0 && (
        <div className="analytics-section">
          <div className="analytics-section-header">
            <h3>Link breakdown</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Short URL</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Hits</th>
                </tr>
              </thead>
              <tbody>
                {perLink.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.name}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>{l.slug}</td>
                    <td><span className={`badge badge-${l.status}`}>{l.status}</span></td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{l.totalHits.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
