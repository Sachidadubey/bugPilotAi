import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getPlanApi } from "../../api/user.api.js";
import { createOrderApi, verifyPaymentApi } from "../../api/payment.api.js";
import toast from "react-hot-toast";

export default function PlanPage() {
  const { user, updateUser } = useAuth();
  const [plan,    setPlan]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);

  useEffect(() => {
    getPlanApi().then(({ data }) => setPlan(data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setPaying(true);
    try {
      const { data } = await createOrderApi({ plan: "pro" });
      const order = data.data;

      const options = {
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        "BugPilot AI",
        description: order.description,
        order_id:    order.orderId,
        prefill:     { name: order.user.name, email: order.user.email },
        theme:       { color: "#4f46e5" },
        handler: async (response) => {
          try {
            await verifyPaymentApi({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            updateUser({ subscription: "pro" });
            toast.success("🎉 Pro plan activated!");
            const { data: refreshed } = await getPlanApi();
            setPlan(refreshed.data);
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create order");
      setPaying(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
    </DashboardLayout>
  );

  const isPro = user?.subscription === "pro";

  return (
    <DashboardLayout>
      {/* Usage bar */}
      {!isPro && plan && (
        <div className="bp-card mb-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Today's usage</span>
            <span className="text-muted small">{plan.todayUsage} / {plan.dailyLimit}</span>
          </div>
          <div className="progress mb-2" style={{ height: 10, borderRadius: 8 }}>
            <div className={`progress-bar ${plan.todayUsage >= plan.dailyLimit ? "bg-danger" : "bg-primary"}`}
              style={{ width: `${Math.min((plan.todayUsage/plan.dailyLimit)*100, 100)}%`, borderRadius: 8 }} />
          </div>
          <span className="text-muted small">
            {plan.remaining} sessions remaining today
          </span>
        </div>
      )}

      {/* Plan cards */}
      <div className="row g-4 justify-content-center">

        {/* Free */}
        <div className="col-md-5">
          <div className={`bp-card h-100 ${!isPro ? "border-primary border-2" : ""}`}>
            {!isPro && (
              <span className="badge bg-primary mb-3">Current Plan</span>
            )}
            <h5 className="fw-bold mb-1">Free</h5>
            <div className="display-6 fw-bold text-dark mb-1">₹0</div>
            <p className="text-muted small mb-4">Forever free</p>
            <ul className="list-unstyled mb-4">
              {(plan?.features?.free || []).map((f, i) => (
                <li key={i} className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-check-circle-fill text-success"></i>
                  <span className="small">{f}</span>
                </li>
              ))}
            </ul>
            <button className="btn btn-outline-secondary w-100" disabled>
              {isPro ? "Downgrade" : "Current Plan"}
            </button>
          </div>
        </div>

        {/* Pro */}
        <div className="col-md-5">
          <div className={`bp-card h-100 position-relative ${isPro ? "border-primary border-2" : ""}`}
            style={{ background: isPro ? "#eef2ff" : "white" }}>
            <span className="badge position-absolute top-0 end-0 m-3"
              style={{ background: "#4f46e5" }}>
              <i className="bi bi-lightning-fill me-1" />Popular
            </span>
            {isPro && <span className="badge bg-success mb-3">Active</span>}
            <h5 className="fw-bold mb-1">Pro</h5>
            <div className="display-6 fw-bold text-dark mb-1">₹499</div>
            <p className="text-muted small mb-4">per month</p>
            <ul className="list-unstyled mb-4">
              {(plan?.features?.pro || []).map((f, i) => (
                <li key={i} className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-check-circle-fill text-primary"></i>
                  <span className="small fw-semibold">{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <button className="btn btn-primary w-100" disabled>
                <i className="bi bi-check-circle me-2" />Active
              </button>
            ) : (
              <button className="btn btn-primary w-100 py-2 fw-semibold"
                onClick={handleUpgrade} disabled={paying}>
                {paying
                  ? <><span className="spinner-border spinner-border-sm me-2" />Opening checkout...</>
                  : <><i className="bi bi-lightning-fill me-2" />Upgrade to Pro</>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Load Razorpay SDK */}
      {!window.Razorpay && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      )}
    </DashboardLayout>
  );
}