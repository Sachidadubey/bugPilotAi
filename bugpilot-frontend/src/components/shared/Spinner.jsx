export default function Spinner({ size = "md" }) {
  return (
    <div className={`spinner-border text-primary spinner-border-${size}`} role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}