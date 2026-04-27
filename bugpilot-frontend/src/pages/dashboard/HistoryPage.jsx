import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { getUserHistoryApi } from "../../api/user.api.js";
import { formatDateTime, truncate } from "../../utils/helper.js";

const STATUS_BADGE = {
  completed:  "bg-success",
  failed:     "bg-danger",
  pending:    "bg-warning text-dark",
  processing: "bg-info text-dark",
};

const INPUT_ICON = {
  code:  "bi-code-slash",
  text:  "bi-file-text",
  image: "bi-image",
  log:   "bi-journal-text",
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [filters,  setFilters]  = useState({
    status: "", inputType: "", language: "", search: "",
  });

  const fetch = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await getUserHistoryApi(params);
      setSessions(data.data.sessions);
      setPagination(data.data.pagination);
      setPage(p);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(1); }, [filters]);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  return (
    <DashboardLayout>
      {/* Filters */}
      <div className="bp-card mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-semibold text-muted mb-1">Search</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input type="text" name="search"
                className="form-control"
                placeholder="Search errors, root causes..."
                value={filters.search}
                onChange={handleFilterChange} />
            </div>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Status</label>
            <select name="status" className="form-select form-select-sm"
              value={filters.status} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Type</label>
            <select name="inputType" className="form-select form-select-sm"
              value={filters.inputType} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="code">Code</option>
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="log">Log</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label small fw-semibold text-muted mb-1">Language</label>
            <select name="language" className="form-select form-select-sm"
              value={filters.language} onChange={handleFilterChange}>
              <option value="">All</option>
              {["javascript","typescript","python","java","go","rust","php","other"].map((l) => (
                <option key={l} value={l} className="text-capitalize">{l}</option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <button className="btn btn-sm btn-outline-secondary w-100"
              onClick={() => setFilters({ status:"", inputType:"", language:"", search:"" })}>
              <i className="bi bi-x-circle me-1" />Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bp-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-inbox fs-2 d-block mb-2"></i>
            No sessions found
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small text-muted fw-semibold border-0">Type</th>
                    <th className="small text-muted fw-semibold border-0">Input</th>
                    <th className="small text-muted fw-semibold border-0">Root Cause</th>
                    <th className="small text-muted fw-semibold border-0">Status</th>
                    <th className="small text-muted fw-semibold border-0">Tokens</th>
                    <th className="small text-muted fw-semibold border-0">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s._id}>
                      <td>
                        <span className="badge bg-light text-dark border text-capitalize">
                          <i className={`bi ${INPUT_ICON[s.inputType] || "bi-file"} me-1`}></i>
                          {s.inputType}
                        </span>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: 160 }}>
                        <span className="d-block text-truncate font-monospace" style={{ fontSize: 11 }}>
                          {s.inputType === "image" ? "Screenshot" : truncate(s.textInput, 50)}
                        </span>
                        {s.language && s.language !== "unknown" && (
                          <span className="badge bg-light text-muted border mt-1" style={{ fontSize: 10 }}>
                            {s.language}
                          </span>
                        )}
                      </td>
                      <td className="small" style={{ maxWidth: 200 }}>
                        <span className="d-block text-truncate text-dark">
                          {s.analysis?.rootCause || "—"}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[s.status] || "bg-secondary"}`}>
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3"
                style={{ borderTop: "1px solid #f1f5f9" }}>
                <span className="text-muted small">
                  {pagination.total} total sessions
                </span>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${!pagination.hasPrev ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => fetch(page - 1)}>
                        <i className="bi bi-chevron-left" />
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${page === i+1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => fetch(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${!pagination.hasNext ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => fetch(page + 1)}>
                        <i className="bi bi-chevron-right" />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}