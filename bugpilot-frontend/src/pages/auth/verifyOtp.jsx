import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOtpApi, resendOtpApi } from "../../api/auth.api";
import ErrorAlert from "../../components/shared/ErrorAlert";

export default function VerifyOtp() {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  const email = state?.email || "";

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) { setError("Enter complete 6-digit OTP"); return; }
    setLoading(true); setError("");
    try {
      await verifyOtpApi({ email, otp: otpStr });
      toast.success("Email verified! You can now log in.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtpApi({ email });
      toast.success("New OTP sent to your email");
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card text-center">

        <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3"
          style={{ width: 52, height: 52, background: "#4f46e5" }}>
          <i className="bi bi-shield-lock-fill text-white fs-4"></i>
        </div>

        <h4 className="fw-bold text-dark mb-1">Verify your email</h4>
        <p className="text-muted small mb-4">
          OTP sent to <strong>{email}</strong>
        </p>

        <ErrorAlert message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          {/* OTP boxes */}
          <div className="d-flex gap-2 justify-content-center mb-4" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text" inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="form-control text-center fw-bold fs-4"
                style={{ width: 52, height: 56, border: "2px solid #e5e7eb",
                  borderRadius: 10,
                  borderColor: digit ? "#4f46e5" : "#e5e7eb" }}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold mb-3"
            disabled={loading || otp.join("").length !== 6}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</>
              : <><i className="bi bi-check-circle me-2" />Verify Email</>
            }
          </button>
        </form>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-muted small">Resend OTP in <strong>{resendTimer}s</strong></p>
          ) : (
            <button className="btn btn-link text-primary small p-0 text-decoration-none"
              onClick={handleResend}>
              <i className="bi bi-arrow-clockwise me-1" />Resend OTP
            </button>
          )}
        </div>

        <hr className="my-3" />
        <p className="text-muted small mb-0">
          Wrong email?{" "}
          <a href="/register" className="text-primary fw-semibold text-decoration-none">
            Go back
          </a>
        </p>
      </div>
    </div>
  );
}