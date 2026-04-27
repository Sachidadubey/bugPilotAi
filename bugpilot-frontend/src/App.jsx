import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthProvider from "./context/AuthContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/layout/ProtectedRoute";

// Auth
import Register       from "./pages/auth/Register";
import Login          from "./pages/auth/Login";
import VerifyOtp      from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword  from "./pages/auth/ResetPassword";

// Dashboard
import Dashboard   from "./pages/dashboard/Dashboard";
import DebugPage   from "./pages/dashboard/DebugPage";
import HistoryPage from "./pages/dashboard/HistoryPage";

// User — ACTUAL pages, placeholder nahi
import ProfilePage from "./pages/user/ProfilePage";
import PlanPage    from "./pages/user/PlanPage";
import BillingPage from "./pages/user/BillingPage";

// Admin — placeholder abhi
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Guest */}
          <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/verify-otp"      element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password"  element={<GuestRoute><ResetPassword /></GuestRoute>} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/debug"     element={<ProtectedRoute><DebugPage /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/plan"      element={<ProtectedRoute><PlanPage /></ProtectedRoute>} />
          <Route path="/billing"   element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}