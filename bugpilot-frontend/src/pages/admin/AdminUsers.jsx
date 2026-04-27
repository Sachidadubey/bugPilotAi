import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  adminUsersApi,
  banUserApi,
  unbanUserApi,
  updatePlanApi,
  deleteUserApi,
} from "../../api/admin.api.js";
import { formatDate } from "../../utils/helper.js";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasPrev: false,
    hasNext: false,
  });

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    subscription: "",
    isVerified: "",
    isBanned: "",
  });

  const [reload, setReload] = useState(false);

  const [actionLoading, setActionLoading] = useState({});

  const setAction = (id, value) => {
    setActionLoading((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const fetchUsers = async (currentPage = 1) => {
    setLoading(true);

    try {
      const params = {
        page: currentPage,
        limit: 15,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const { data } = await adminUsersApi(params);

      setUsers(data?.data?.users || []);

      setPagination(
        data?.data?.pagination || {
          total: 0,
          totalPages: 0,
          hasPrev: false,
          hasNext: false,
        }
      );

      setPage(currentPage);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [filters, reload]);

  const refreshUsers = () => {
    setReload((prev) => !prev);
  };

  const handleBan = async (user) => {
    const reason = window.prompt(`Ban reason for ${user.name}:`);

    if (!reason) return;

    setAction(user._id, "ban");

    try {
      await banUserApi(user._id, { reason });

      toast.success(`${user.name} banned`);

      refreshUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setAction(user._id, null);
    }
  };

  const handleUnban = async (user) => {
    setAction(user._id, "unban");

    try {
      await unbanUserApi(user._id);

      toast.success(`${user.name} unbanned`);

      refreshUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setAction(user._id, null);
    }
  };

  const handlePlan = async (user) => {
    const newPlan =
      user.subscription === "pro" ? "free" : "pro";

    const confirmChange = window.confirm(
      `Change ${user.name} to ${newPlan}?`
    );

    if (!confirmChange) return;

    setAction(user._id, "plan");

    try {
      await updatePlanApi(user._id, {
        subscription: newPlan,
      });

      toast.success(`Plan updated`);

      refreshUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setAction(user._id, null);
    }
  };

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(
      `DELETE ${user.name}?`
    );

    if (!confirmDelete) return;

    setAction(user._id, "delete");

    try {
      await deleteUserApi(user._id);

      toast.success(`${user.name} deleted`);

      refreshUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed");
    } finally {
      setAction(user._id, null);
    }
  };

  return (
    <DashboardLayout>
      {/* Filters */}
      <div className="bp-card mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  search: e.target.value,
                })
              }
            />
          </div>

          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.subscription}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  subscription: e.target.value,
                })
              }
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={filters.isBanned}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isBanned: e.target.value,
                })
              }
            >
              <option value="">All Status</option>
              <option value="false">Active</option>
              <option value="true">Banned</option>
            </select>
          </div>

          <div className="col-md-2">
            <button
              className="btn btn-sm btn-outline-secondary w-100"
              onClick={() =>
                setFilters({
                  search: "",
                  subscription: "",
                  isVerified: "",
                  isBanned: "",
                })
              }
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bp-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border"></div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                      <br />
                      <small>{u.email}</small>
                    </td>

                    <td>{u.subscription}</td>

                    <td>
                      {u.isBanned
                        ? "Banned"
                        : u.isVerified
                        ? "Active"
                        : "Unverified"}
                    </td>

                    <td>{formatDate(u.createdAt)}</td>

                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </Link>

                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handlePlan(u)}
                          disabled={!!actionLoading[u._id]}
                        >
                          Plan
                        </button>

                        {u.isBanned ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleUnban(u)}
                            disabled={!!actionLoading[u._id]}
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleBan(u)}
                            disabled={
                              !!actionLoading[u._id] ||
                              u.role === "admin"
                            }
                          >
                            Ban
                          </button>
                        )}

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(u)}
                          disabled={
                            !!actionLoading[u._id] ||
                            u.role === "admin"
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!pagination.hasPrev}
              onClick={() => fetchUsers(page - 1)}
            >
              Prev
            </button>

            <span>
              {page} / {pagination.totalPages}
            </span>

            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!pagination.hasNext}
              onClick={() => fetchUsers(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}