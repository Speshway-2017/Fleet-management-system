import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { normaliseRole } from "@/utils/roleUtils";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, user } = useAuth();

  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken");

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = role || normaliseRole(user?.role);

  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
