import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordApi } from "../../api/auth.api";
import ErrorAlert from "../../components/shared/ErrorAlert";

export default function ResetPassword() {
  const navigate  = useNavigate();
  const { state } = useLocation();

  const [form, setForm]       = useState({ email: state?.email || "", otp: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]       = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await resetPasswordApi(form);
      toast.success("Password reset successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{ width: 52, height: 52, background: "#4f46e5" }}>
            <i className="bi bi-shield-check-fill text-white fs-4"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Reset password</h4>
          <p className="text-muted small">Enter OTP from email and your new password</p>
        </div>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email Address</label>
            <input
              type="email" name="email" required
              className="form-control"
              value={form.email}
              onChange={handleChange}
              placeholder="you@gmail.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">OTP from Email</label>
            <input
              type="text" name="otp" required
              className="form-control text-center fw-bold fs-5 letter-spacing-wide"
              maxLength={6}
              placeholder="••••••"
              value={form.otp}
              onChange={handleChange}
              style={{ letterSpacing: "0.3em" }}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">New Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type={show ? "text" : "password"}
                name="password" required
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange}
              />
              <button type="button"
                className="input-group-text bg-light border-start-0"
                onClick={() => setShow(!show)}>
                <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
              </button>
            </div>
            <div className="mt-2 d-flex gap-2">
              <span className={`badge ${form.password.length >= 8 ? "bg-success" : "bg-secondary"}`}>8+ chars</span>
              <span className={`badge ${/[A-Z]/.test(form.password) ? "bg-success" : "bg-secondary"}`}>Uppercase</span>
              <span className={`badge ${/[0-9]/.test(form.password) ? "bg-success" : "bg-secondary"}`}>Number</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Resetting...</>
              : <><i className="bi bi-check-circle me-2" />Reset Password</>
            }
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-muted small mb-0">
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            <i className="bi bi-arrow-left me-1" />Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}