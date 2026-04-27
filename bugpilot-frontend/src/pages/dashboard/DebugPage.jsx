import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DebugForm from "../../components/debug/DebugForm";
import AnalysisResult from "../../components/debug/AnalysisResult";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function DebugPage() {
  const { user } = useAuth();
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <DashboardLayout>
      {/* Pro upgrade banner */}
      {user?.subscription === "free" && (
        <div className="alert d-flex align-items-center gap-3 mb-4 py-3"
          style={{ background: "#eef2ff", border: "1px solid #c7d2fe", borderRadius: 12 }}>
          <i className="bi bi-lightning-fill text-primary fs-5"></i>
          <div className="flex-grow-1">
            <span className="fw-semibold text-dark">Free plan — 10 sessions/day.</span>
            <span className="text-muted ms-1">Upgrade for unlimited AI debugging.</span>
          </div>
          <Link to="/plan" className="btn btn-primary btn-sm px-3">Upgrade to Pro</Link>
        </div>
      )}

      <div className="row g-4">
        {/* Form */}
        <div className="col-lg-6">
          <DebugForm onResult={setResult} onLoading={setLoading} />
        </div>

        {/* Result */}
        <div className="col-lg-6">
          {loading && (
            <div className="bp-card text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
              <h6 className="fw-bold text-dark mb-1">Analyzing your code...</h6>
              <p className="text-muted small mb-0">
                Gemini AI is finding the root cause
              </p>
            </div>
          )}
          {!loading && !result && (
            <div className="bp-card text-center py-5" style={{ border: "2px dashed #e5e7eb" }}>
              <i className="bi bi-cpu-fill text-muted fs-1 d-block mb-3"></i>
              <h6 className="fw-bold text-dark mb-1">AI Analysis Result</h6>
              <p className="text-muted small mb-0">
                Submit your error or code to see the root cause, explanation, and fix
              </p>
            </div>
          )}
          {!loading && result && <AnalysisResult result={result} />}
        </div>
      </div>
    </DashboardLayout>
  );
}