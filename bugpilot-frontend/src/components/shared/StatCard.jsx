export default function StatCard({ icon, label, value, color = "#4f46e5", sub }) {
  return (
    <div className="bp-card h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: 42, height: 42, background: color + "18" }}>
          <i className={`bi ${icon}`} style={{ color, fontSize: 20 }}></i>
        </div>
      </div>
      <div className="fs-3 fw-bold text-dark mb-1">{value ?? "—"}</div>
      <div className="text-muted small fw-semibold">{label}</div>
      {sub && <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}