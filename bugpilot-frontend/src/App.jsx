import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/layout/ProtectedRoute";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/"              element={<Navigate to="/dashboard" replace />} />
          <Route path="/register"      element={<GuestRoute><Placeholder title="Register" /></GuestRoute>} />
          <Route path="/login"         element={<GuestRoute><Placeholder title="Login" /></GuestRoute>} />
          <Route path="/verify-otp"    element={<Placeholder title="Verify OTP" />} />
          <Route path="/forgot-password" element={<GuestRoute><Placeholder title="Forgot Password" /></GuestRoute>} />
          <Route path="/reset-password"  element={<GuestRoute><Placeholder title="Reset Password" /></GuestRoute>} />
          <Route path="/dashboard"     element={<ProtectedRoute><Placeholder title="Dashboard" /></ProtectedRoute>} />
          <Route path="/debug"         element={<ProtectedRoute><Placeholder title="Debug" /></ProtectedRoute>} />
          <Route path="/history"       element={<ProtectedRoute><Placeholder title="History" /></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Placeholder title="Profile" /></ProtectedRoute>} />
          <Route path="/plan"          element={<ProtectedRoute><Placeholder title="Plan" /></ProtectedRoute>} />
          <Route path="/billing"       element={<ProtectedRoute><Placeholder title="Billing" /></ProtectedRoute>} />
          <Route path="/admin"         element={<AdminRoute><Placeholder title="Admin Dashboard" /></AdminRoute>} />
          <Route path="/admin/users"   element={<AdminRoute><Placeholder title="Admin Users" /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><Placeholder title="User Detail" /></AdminRoute>} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}