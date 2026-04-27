import Sidebar from "./Sidebar";
import Navbar  from "./Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}