import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordApi } from "../../api/auth.api";
import ErrorAlert from "../../components/shared/ErrorAlert";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await forgotPasswordApi({ email });
      setSent(true);
      toast.success("If this email exists, OTP has been sent");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card text-center">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
            style={{ width: 64, height: 64, background: "#d1fae5" }}>
            <i className="bi bi-envelope-check-fill text-success fs-3"></i>
          </div>
          <h4 className="fw-bold mb-2">Check your email</h4>
          <p className="text-muted small mb-4">
            OTP sent to <strong>{email}</strong>.<br />
            Use it to reset your password.
          </p>
          <Link to="/reset-password"
            state={{ email }}
            className="btn btn-primary w-100 py-2 fw-semibold">
            <i className="bi bi-arrow-right me-2" />Enter OTP & Reset Password
          </Link>
          <Link to="/login" className="btn btn-light w-100 py-2 mt-2">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{ width: 52, height: 52, background: "#4f46e5" }}>
            <i className="bi bi-key-fill text-white fs-4"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Forgot password?</h4>
          <p className="text-muted small">
            Enter your email — we'll send an OTP to reset your password
          </p>
        </div>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label fw-semibold small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email" required
                className="form-control border-start-0 ps-0"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Sending OTP...</>
              : <><i className="bi bi-send me-2" />Send OTP</>
            }
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-muted small mb-0">
          Remember your password?{" "}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}