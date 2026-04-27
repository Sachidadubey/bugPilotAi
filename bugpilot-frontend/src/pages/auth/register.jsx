import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerApi } from "../../api/auth.api";
import ErrorAlert from "../../components/shared/ErrorAlert";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: "", email: "", password: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow]     = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await registerApi(form);
      toast.success("Account created! Check your email for OTP.");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Logo */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
            style={{ width: 52, height: 52, background: "#4f46e5" }}>
            <i className="bi bi-bug-fill text-white fs-4"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">Create your account</h4>
          <p className="text-muted small">Start debugging smarter with AI</p>
        </div>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-3">
            <label className="form-label fw-semibold small">Full Name</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-person text-muted"></i>
              </span>
              <input
                type="text" name="name" required
                className="form-control border-start-0 ps-0"
                placeholder="Ankush Dubey"
                value={form.name} onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="mb-4">
            <label className="form-label fw-semibold small">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-lock text-muted"></i>
              </span>
              <input
                type={show ? "text" : "password"}
                name="password" required
                className="form-control border-start-0 border-end-0 ps-0"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password} onChange={handleChange}
              />
              <button type="button"
                className="input-group-text bg-light border-start-0"
                onClick={() => setShow(!show)}>
                <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
              </button>
            </div>
            <div className="mt-2 d-flex gap-2 flex-wrap">
              <span className={`badge ${form.password.length >= 8 ? "bg-success" : "bg-secondary"}`}>
                8+ chars
              </span>
              <span className={`badge ${/[A-Z]/.test(form.password) ? "bg-success" : "bg-secondary"}`}>
                Uppercase
              </span>
              <span className={`badge ${/[0-9]/.test(form.password) ? "bg-success" : "bg-secondary"}`}>
                Number
              </span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</>
              : <><i className="bi bi-person-plus me-2" />Create Account</>
            }
          </button>
        </form>

        <hr className="my-4" />
        <p className="text-center text-muted small mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-primary fw-semibold text-decoration-none">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}