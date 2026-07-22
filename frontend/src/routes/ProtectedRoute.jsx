import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { normaliseRole } from "@/utils/roleUtils";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-[#A14000] border-t-transparent rounded-full" />
      </div>
    );
  }

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
