import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ErrorAlert from "../../components/shared/ErrorAlert";

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname || "/dashboard";

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]       = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      // If not verified — redirect to OTP
      if (msg.includes("not verified")) {
        setTimeout(() => navigate("/verify-otp", { state: { email: form.email } }), 1500);
      }
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
            <i className="bi bi-bug-fill text-white fs-4"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Welcome back</h4>
          <p className="text-muted small">Sign in to your BugPilot AI account</p>
        </div>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-envelope text-muted"></i>
              </span>
              <input
                type="email" name="email" required
                className="form-control border-start-0 ps-0"
                placeholder="you@gmail.com"
                value={form.email} onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="form-label fw-semibold small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type={show ? "text" : "password"}
                name="password" required
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Your password"
                value={form.password} onChange={handleChange}
              />
              <button type="button"
                className="input-group-text bg-light border-start-0"
                onClick={() => setShow(!show)}>
                <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
              </button>
            </div>
          </div>

          <div className="text-end mb-4">
            <Link to="/forgot-password"
              className="text-primary small text-decoration-none fw-semibold">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
            }
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-muted small mb-0">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary fw-semibold text-decoration-none">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}