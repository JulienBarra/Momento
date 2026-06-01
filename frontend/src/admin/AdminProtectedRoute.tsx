import { Navigate, Outlet } from "react-router-dom";
import { adminAuth } from "./adminApi";

export default function AdminProtectedRoute() {
  if (!adminAuth.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
