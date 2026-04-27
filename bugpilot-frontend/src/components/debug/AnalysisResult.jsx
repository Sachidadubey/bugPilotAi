import { useState } from "react";
import { copyToClipboard } from "../../utils/helper.js";

export default function AnalysisResult({ result }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;
  const a = result.analysis;

  const handleCopy = async (text) => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const severityColors = {
    low:      { bg: "#d1fae5", text: "#065f46", icon: "bi-shield-check" },
    medium:   { bg: "#fef3c7", text: "#92400e", icon: "bi-shield-exclamation" },
    high:     { bg: "#fee2e2", text: "#991b1b", icon: "bi-shield-x" },
    critical: { bg: "#fce7f3", text: "#831843", icon: "bi-exclamation-octagon-fill" },
  };
  const sev = severityColors[a?.severity] || severityColors.medium;

  return (
    <div className="mt-4">
      {/* Header */}
      <div className="bp-card mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          <span className="fw-bold text-dark">Analysis Complete</span>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge border small text-muted bg-light">
            <i className="bi bi-cpu me-1" />{result.tokensUsed} tokens
          </span>
          <span className="badge" style={{ background: sev.bg, color: sev.text }}>
            <i className={`bi ${sev.icon} me-1`} />
            {a?.severity?.toUpperCase()}
          </span>
          {result.language && result.language !== "unknown" && (
            <span className="badge bg-light text-dark border text-capitalize">
              {result.language}
            </span>
          )}
        </div>
      </div>

      {/* Root cause */}
      {a?.rootCause && (
        <div className="bp-card mb-3" style={{ borderLeft: "4px solid #dc2626" }}>
          <div className="small fw-bold text-uppercase text-muted mb-2">
            <i className="bi bi-crosshair text-danger me-2" />Root Cause
          </div>
          <p className="mb-0 fw-semibold text-dark">{a.rootCause}</p>
        </div>
      )}

      {/* Explanation */}
      {a?.explanation && (
        <div className="bp-card mb-3" style={{ borderLeft: "4px solid #d97706" }}>
          <div className="small fw-bold text-uppercase text-muted mb-2">
            <i className="bi bi-info-circle text-warning me-2" />Explanation
          </div>
          <p className="mb-0 text-muted" style={{ lineHeight: 1.7 }}>{a.explanation}</p>
        </div>
      )}

      {/* Solution */}
      {a?.solution && (
        <div className="bp-card mb-3" style={{ borderLeft: "4px solid #059669" }}>
          <div className="small fw-bold text-uppercase text-muted mb-2">
            <i className="bi bi-lightbulb text-success me-2" />Solution
          </div>
          <p className="mb-0 text-muted" style={{ lineHeight: 1.7 }}>{a.solution}</p>
        </div>
      )}

      {/* Code snippet */}
      {a?.codeSnippet && (
        <div className="bp-card mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="small fw-bold text-uppercase text-muted">
              <i className="bi bi-code-slash text-primary me-2" />Fixed Code
            </div>
            <button className="copy-btn" onClick={() => handleCopy(a.codeSnippet)}>
              <i className={`bi ${copied ? "bi-check-lg" : "bi-clipboard"} me-1`} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="code-block" style={{ position: "relative" }}>
            {a.codeSnippet}
          </div>
        </div>
      )}

      {/* Tags */}
      {a?.tags?.length > 0 && (
        <div className="bp-card mb-3">
          <div className="small fw-bold text-uppercase text-muted mb-2">Tags</div>
          <div className="d-flex gap-2 flex-wrap">
            {a.tags.map((tag, i) => (
              <span key={i} className="badge bg-light text-dark border px-3 py-2">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {a?.references?.filter(Boolean).length > 0 && (
        <div className="bp-card">
          <div className="small fw-bold text-uppercase text-muted mb-2">
            <i className="bi bi-link-45deg me-1" />References
          </div>
          <ul className="mb-0 ps-3">
            {a.references.filter(Boolean).map((ref, i) => (
              <li key={i}>
                <a href={ref} target="_blank" rel="noreferrer"
                  className="text-primary small text-decoration-none">
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}