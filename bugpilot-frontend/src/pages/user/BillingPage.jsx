import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getBillingApi, cancelSubApi } from "../../api/payment.api.js";
import { formatDate } from "../../utils/helper.js";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  paid:    "bg-success",
  created: "bg-warning text-dark",
  failed:  "bg-danger",
};

export default function BillingPage() {
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getBillingApi().then(({ data }) => setPayments(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!window.confirm("Cancel Pro subscription? You will be downgraded to free plan immediately.")) return;
    setCancelling(true);
    try {
      await cancelSubApi();
      toast.success("Subscription cancelled. You are now on free plan.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bp-card">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-bold mb-0">Billing History</h6>
          <button className="btn btn-sm btn-outline-danger" onClick={handleCancel}
            disabled={cancelling}>
            {cancelling
              ? <><span className="spinner-border spinner-border-sm me-1" />Cancelling...</>
              : "Cancel Subscription"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-receipt fs-2 d-block mb-2"></i>
            <p>No billing history yet</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="small text-muted fw-semibold border-0">Order ID</th>
                  <th className="small text-muted fw-semibold border-0">Plan</th>
                  <th className="small text-muted fw-semibold border-0">Amount</th>
                  <th className="small text-muted fw-semibold border-0">Status</th>
                  <th className="small text-muted fw-semibold border-0">Subscribed</th>
                  <th className="small text-muted fw-semibold border-0">Expires</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id}>
                    <td className="small font-monospace text-muted" style={{ fontSize: 11 }}>
                      {p.orderId?.slice(0, 20)}...
                    </td>
                    <td>
                      <span className="badge badge-pro text-capitalize">{p.plan}</span>
                    </td>
                    <td className="fw-semibold">₹{(p.amount / 100).toFixed(0)}</td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[p.status] || "bg-secondary"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="small text-muted">{formatDate(p.subscribedAt)}</td>
                    <td className="small text-muted">{formatDate(p.expiresAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}