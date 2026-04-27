import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/debug":     "AI Debugger",
  "/history":   "Debug History",
  "/profile":   "My Profile",
  "/plan":      "Subscription Plan",
  "/billing":   "Billing",
  "/admin":     "Admin Panel",
  "/admin/users": "User Management",
};

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "BugPilot AI";

  return (
    <div className="top-navbar d-flex align-items-center justify-content-between">
      <div>
        <h6 className="mb-0 fw-bold text-dark">{title}</h6>
      </div>
      <div className="d-flex align-items-center gap-3">
        {user?.subscription === "pro" ? (
          <span className="badge badge-pro px-3 py-2">
            <i className="bi bi-lightning-fill me-1" />Pro
          </span>
        ) : (
          <span className="badge badge-free px-3 py-2">Free Plan</span>
        )}
        <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
          style={{ width: 34, height: 34, fontSize: 14 }}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
}