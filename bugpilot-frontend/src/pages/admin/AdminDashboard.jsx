import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { adminStatsApi, adminRevenueApi, adminAiUsageApi } from "../../api/admin.api";

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="bp-card h-100">
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="d-flex align-items-center justify-content-center rounded-3"
        style={{ width: 42, height: 42, background: color + "18" }}>
        <i className={`bi ${icon}`} style={{ color, fontSize: 20 }}></i>
      </div>
    </div>
    <div className="fs-3 fw-bold text-dark mb-1">{value ?? "—"}</div>
    <div className="text-muted small fw-semibold">{label}</div>
    {sub && <div className="text-muted" style={{ fontSize: 11 }}>{sub}</div>}
  </div>
);

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminStatsApi(), adminRevenueApi(), adminAiUsageApi()])
      .then(([s, r, a]) => {
        setStats(s.data.data);
        setRevenue(r.data.data);
        setAiUsage(a.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-bold mb-1">Admin Dashboard</h5>
          <p className="text-muted small mb-0">Platform overview</p>
        </div>
        <Link to="/admin/users" className="btn btn-primary px-4">
          <i className="bi bi-people me-2" />Manage Users
        </Link>
      </div>

      {/* User stats */}
      <div className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: 1 }}>
        Users
      </div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-people-fill" label="Total Users"
            value={stats?.users?.total} color="#4f46e5"
            sub={`+${stats?.users?.newToday} today`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-lightning-fill" label="Pro Users"
            value={stats?.users?.pro} color="#d97706"
            sub={`${stats?.users?.free} free`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-shield-check-fill" label="Verified"
            value={stats?.users?.verified} color="#059669" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-slash-circle-fill" label="Banned"
            value={stats?.users?.banned} color="#dc2626" />
        </div>
      </div>

      {/* Debug stats */}
      <div className="small fw-bold text-muted text-uppercase mb-2" style={{ letterSpacing: 1 }}>
        AI Debug Sessions
      </div>
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-collection-fill" label="Total Sessions"
            value={stats?.debug?.total} color="#0891b2"
            sub={`${stats?.debug?.today} today`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-check-circle-fill" label="Completed"
            value={stats?.debug?.completed} color="#059669"
            sub={`${stats?.debug?.successRate}% success rate`} />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-x-circle-fill" label="Failed"
            value={stats?.debug?.failed} color="#dc2626" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon="bi-cpu-fill" label="Total Tokens"
            value={(stats?.debug?.totalTokensUsed || 0).toLocaleString()} color="#7c3aed" />
        </div>
      </div>

      {/* Revenue + AI usage */}
      <div className="row g-3 mb-4">
        <div className="col-lg-4">
          <div className="bp-card h-100">
            <h6 className="fw-bold mb-3">Revenue</h6>
            <div className="fs-2 fw-bold text-dark mb-1">
              ₹{(stats?.revenue?.total || 0).toLocaleString()}
            </div>
            <p className="text-muted small mb-3">Total revenue</p>
            <div className="d-flex justify-content-between small py-2"
              style={{ borderTop: "1px solid #f1f5f9" }}>
              <span className="text-muted">This month</span>
              <span className="fw-semibold">₹{(stats?.revenue?.thisMonth || 0).toLocaleString()}</span>
            </div>
            <div className="d-flex justify-content-between small py-2"
              style={{ borderTop: "1px solid #f1f5f9" }}>
              <span className="text-muted">Total payments</span>
              <span className="fw-semibold">{stats?.revenue?.totalPayments}</span>
            </div>
          </div>
        </div>

        {/* Monthly revenue table */}
        <div className="col-lg-4">
          <div className="bp-card h-100">
            <h6 className="fw-bold mb-3">Monthly Revenue</h6>
            {revenue?.monthlyRevenue?.slice(-5).map((m, i) => (
              <div key={i} className="d-flex justify-content-between align-items-center small py-2"
                style={{ borderBottom: "1px solid #f1f5f9" }}>
                <span className="text-muted">{m.month}</span>
                <div className="text-end">
                  <div className="fw-semibold">₹{m.revenue.toLocaleString()}</div>
                  <div className="text-muted" style={{ fontSize: 10 }}>{m.payments} payments</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI usage by type */}
        <div className="col-lg-4">
          <div className="bp-card h-100">
            <h6 className="fw-bold mb-3">AI Usage by Type</h6>
            {aiUsage?.byInputType?.map((t, i) => {
              const total = aiUsage.byInputType.reduce((a, b) => a + b.count, 0);
              const pct   = Math.round((t.count / total) * 100);
              return (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold text-capitalize">{t._id}</span>
                    <span className="text-muted">{t.count} ({pct}%)</span>
                  </div>
                  <div className="progress" style={{ height: 6, borderRadius: 6 }}>
                    <div className="progress-bar bg-primary"
                      style={{ width: `${pct}%`, borderRadius: 6 }} />
                  </div>
                </div>
              );
            })}

            <div className="mt-3 pt-3" style={{ borderTop: "1px solid #f1f5f9" }}>
              <div className="small text-muted mb-1">Total tokens used</div>
              <div className="fw-bold">{(aiUsage?.totalTokensUsed || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}