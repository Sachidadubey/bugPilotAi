import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import StatCard from "../../components/shared/StatCard";
import { getUserStatsApi } from "../../api/user.api.js";
import { formatDateTime } from "../../utils/helper.js";

function LoadingBlock() {
  return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
}

function ErrorBlock({ message }) {
  return <div className="alert alert-danger">{message}</div>;
}

function UsageCard({ stats }) {
  const percent = Math.min((stats.todayUsage / stats.dailyLimit) * 100, 100);
  const reached = stats.todayUsage >= stats.dailyLimit;
  return (
    <div className="bp-card mb-4">
      <div className="d-flex justify-content-between mb-2">
        <span className="fw-semibold small">Daily usage — Free plan</span>
        <span className="small text-muted">{stats.todayUsage} / {stats.dailyLimit} sessions</span>
      </div>
      <div className="progress" style={{ height: 8 }}>
        <div className={`progress-bar ${reached ? "bg-danger" : "bg-primary"}`} style={{ width: `${percent}%` }} />
      </div>
      {reached && <div className="small text-muted mt-2">Daily limit reached. <Link to="/plan">Upgrade to Pro</Link></div>}
    </div>
  );
}

function RecentSessions({ sessions }) {
  if (!sessions?.length) return <div className="text-center py-4 text-muted">No sessions yet.</div>;
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light"><tr><th>Type</th><th>Root Cause</th><th>Tokens</th><th>Date</th></tr></thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id || s.createdAt}>
              <td className="text-capitalize">{s.inputType}</td>
              <td>{s.analysis?.rootCause || "—"}</td>
              <td>{s.tokensUsed}</td>
              <td>{formatDateTime(s.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopLanguages({ items }) {
  if (!items?.length) return <div className="text-muted">No data yet</div>;
  const max = items[0]?.count || 1;
  return items.map((lang) => (
    <div key={lang._id} className="mb-3">
      <div className="d-flex justify-content-between small mb-1">
        <span>{lang._id}</span><span>{lang.count}</span>
      </div>
      <div className="progress" style={{ height: 6 }}>
        <div className="progress-bar bg-primary" style={{ width: `${(lang.count / max) * 100}%` }} />
      </div>
    </div>
  ));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await getUserStatsApi();
        if (mounted) setStats(data?.data || {});
      } catch (err) {
        console.log(err);
        if (mounted) setError("Failed to load dashboard data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const firstName = user?.name?.trim()?.split(" ")[0] || "User";

  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h5 className="fw-bold mb-1">Good day, {firstName} 👋</h5>
          <p className="text-muted small mb-0">Here's your debugging overview</p>
        </div>
        <Link to="/debug" className="btn btn-primary">New Debug Session</Link>
      </div>

      {user?.subscription === "free" && stats && <UsageCard stats={stats} />}
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3"><StatCard label="Total Sessions" value={stats?.totalSessions || 0} /></div>
            <div className="col-md-3"><StatCard label="Completed" value={stats?.completedSessions || 0} /></div>
            <div className="col-md-3"><StatCard label="Success Rate" value={`${stats?.successRate || 0}%`} /></div>
            <div className="col-md-3"><StatCard label="Tokens Used" value={(stats?.totalTokensUsed || 0).toLocaleString()} /></div>
          </div>

          <div className="row g-3">
            <div className="col-lg-8">
              <div className="bp-card">
                <div className="d-flex justify-content-between mb-3">
                  <h6 className="fw-bold mb-0">Recent Sessions</h6>
                  <Link to="/history">View all</Link>
                </div>
                <RecentSessions sessions={stats?.recentSessions} />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="bp-card">
                <h6 className="fw-bold mb-3">Top Languages</h6>
                <TopLanguages items={stats?.topLanguages} />
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
