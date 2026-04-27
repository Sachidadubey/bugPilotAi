import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { adminUserDetailApi } from "../../api/admin.api.js";
import { formatDate, formatDateTime } from "../../utils/helper.js";

export default function AdminUserDetail() {
  const { id } = useParams();
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminUserDetailApi(id)
      .then(({ data }) => setDetail(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </DashboardLayout>
  );

  const { user, debugStats, payments, recentSessions } = detail;

  return (
    <DashboardLayout>
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/admin/users" className="btn btn-sm btn-outline-secondary">
          <i className="bi bi-arrow-left me-1" />Back
        </Link>
        <h5 className="fw-bold mb-0">User Detail</h5>
      </div>

      <div className="row g-4">
        {/* User info */}
        <div className="col-lg-4">
          <div className="bp-card text-center mb-3">
            <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold mx-auto mb-3"
              style={{ width: 72, height: 72, fontSize: 28 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h5 className="fw-bold mb-1">{user?.name}</h5>
            <p className="text-muted small mb-2">{user?.email}</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <span className={`badge ${user?.subscription === "pro" ? "badge-pro" : "badge-free"}`}>
                {user?.subscription}
              </span>
              {user?.isBanned && <span className="badge bg-danger">Banned</span>}
              {user?.isVerified && <span className="badge bg-success">Verified</span>}
              {user?.role === "admin" && <span className="badge bg-danger">Admin</span>}
            </div>
            <hr className="my-3" />
            <div className="text-start small">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Joined</span>
                <span>{formatDate(user?.createdAt)}</span>
              </div>
              {user?.isBanned && (
                <div className="mt-2 p-2 rounded" style={{ background: "#fee2e2" }}>
                  <div className="text-danger fw-semibold small">Ban reason:</div>
                  <div className="text-danger small">{user?.banReason}</div>
                </div>
              )}
            </div>
          </div>

          {/* Debug stats */}
          <div className="bp-card">
            <h6 className="fw-bold mb-3">Debug Stats</h6>
            {[
              { label: "Total sessions", value: debugStats?.total },
              { label: "Completed",      value: debugStats?.completed },
              { label: "Failed",         value: debugStats?.failed },
              { label: "Tokens used",    value: (debugStats?.totalTokens || 0).toLocaleString() },
            ].map((s, i) => (
              <div key={i} className="d-flex justify-content-between small py-2"
                style={{ borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                <span className="text-muted">{s.label}</span>
                <span className="fw-semibold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-8">
          {/* Payments */}
          <div className="bp-card mb-4">
            <h6 className="fw-bold mb-3">Payment History</h6>
            {payments?.length === 0 ? (
              <p className="text-muted small mb-0">No payments yet</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small text-muted border-0">Order ID</th>
                      <th className="small text-muted border-0">Amount</th>
                      <th className="small text-muted border-0">Status</th>
                      <th className="small text-muted border-0">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.map((p) => (
                      <tr key={p._id}>
                        <td className="font-monospace text-muted" style={{ fontSize: 10 }}>
                          {p.orderId?.slice(0, 18)}...
                        </td>
                        <td className="fw-semibold small">₹{(p.amount/100).toFixed(0)}</td>
                        <td>
                          <span className={`badge ${p.status === "paid" ? "bg-success" : "bg-danger"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="small text-muted">{formatDate(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent debug sessions */}
          <div className="bp-card">
            <h6 className="fw-bold mb-3">Recent Debug Sessions</h6>
            {recentSessions?.length === 0 ? (
              <p className="text-muted small mb-0">No sessions yet</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="small text-muted border-0">Type</th>
                      <th className="small text-muted border-0">Status</th>
                      <th className="small text-muted border-0">Tokens</th>
                      <th className="small text-muted border-0">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions?.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <span className="badge bg-light text-dark border text-capitalize">
                            {s.inputType}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${s.status === "completed" ? "bg-success" : "bg-danger"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="small text-muted">{s.tokensUsed}</td>
                        <td className="small text-muted">{formatDateTime(s.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}