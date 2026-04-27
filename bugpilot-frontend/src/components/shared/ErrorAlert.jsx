export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2 py-2" role="alert">
      <i className="bi bi-exclamation-triangle-fill"></i>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="btn-close ms-auto" onClick={onClose} />
      )}
    </div>
  );
}