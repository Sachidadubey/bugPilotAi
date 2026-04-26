// Format date — "Apr 24, 2026"
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
};

// Format date + time
export const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// Severity color class
export const severityClass = (severity) => {
  const map = {
    low:      "severity-low",
    medium:   "severity-medium",
    high:     "severity-high",
    critical: "severity-critical",
  };
  return map[severity] || "severity-medium";
};

// Subscription badge class
export const planBadgeClass = (plan) =>
  plan === "pro" ? "badge-pro" : "badge-free";

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// Truncate long text
export const truncate = (str, n = 80) =>
  str?.length > n ? str.slice(0, n) + "..." : str;