import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: "bi-grid-1x2-fill",    label: "Dashboard"  },
  { to: "/debug",     icon: "bi-bug-fill",          label: "Debug"      },
  { to: "/history",   icon: "bi-clock-history",     label: "History"    },
  { to: "/profile",   icon: "bi-person-circle",     label: "Profile"    },
  { to: "/plan",      icon: "bi-lightning-fill",    label: "Plan"       },
  { to: "/billing",   icon: "bi-receipt",           label: "Billing"    },
];

const adminItems = [
  { to: "/admin",       icon: "bi-speedometer2",   label: "Admin Panel" },
  { to: "/admin/users", icon: "bi-people-fill",    label: "Users"       },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="sidebar d-flex flex-column py-3">
      {/* Logo */}
      <div className="px-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 36, height: 36, background: "#6366f1" }}>
            <i className="bi bi-bug-fill text-white" style={{ fontSize: 16 }}></i>
          </div>
          <div>
            <div className="text-white fw-bold" style={{ fontSize: 14 }}>BugPilot AI</div>
            <div style={{ fontSize: 10, color: "#a5b4fc" }}>
              {user?.subscription === "pro"
                ? <><i className="bi bi-lightning-fill me-1" />Pro Plan</>
                : "Free Plan"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 px-1">
        <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: 1, padding: "0 12px", marginBottom: 6 }}>
          Main
        </div>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`}>
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </NavLink>
        ))}

        {user?.role === "admin" && (
          <>
            <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: 1,
              padding: "12px 12px 6px", marginTop: 8 }}>
              Admin
            </div>
            {adminItems.map((item) => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`}>
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-3 mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
            style={{ width: 32, height: 32, fontSize: 13, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div className="text-white fw-semibold text-truncate" style={{ fontSize: 13 }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: "#a5b4fc" }} className="text-truncate">
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="btn btn-sm w-100 text-start sidebar-link"
          style={{ border: "none", background: "none", padding: "8px 12px" }}>
          <i className="bi bi-box-arrow-left"></i> Logout
        </button>
      </div>
    </div>
  );
}