import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/components/common/LoginPage";
import UnauthorizedPage from "@/components/common/UnauthorizedPage";
import AdminDashboard from "@/roles/admin/pages/AdminDashboard";
import UserManagement from "@/roles/admin/pages/UserManagement";
import ManagerDashboard from "@/roles/manager/pages/ManagerDashboard";
import FleetMapPage from "@/roles/manager/pages/FleetMapPage";
import FastagDashboard from "@/roles/manager/pages/FastagDashboard";

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={role === "admin" ? "/admin" : "/manager"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["manager"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/map" element={<FleetMapPage />} />
              <Route path="/manager/fastag" element={<FastagDashboard />} />
              {/* Placeholder routes for other sidebar items */}
              <Route path="/manager/vehicles" element={<div className="p-8"><h1 className="text-2xl font-bold">Vehicles Page</h1></div>} />
              <Route path="/manager/drivers" element={<div className="p-8"><h1 className="text-2xl font-bold">Drivers Page</h1></div>} />
              <Route path="/manager/trips" element={<div className="p-8"><h1 className="text-2xl font-bold">Trips Page</h1></div>} />
              <Route path="/manager/tracking" element={<div className="p-8"><h1 className="text-2xl font-bold">Live Tracking Page</h1></div>} />
              <Route path="/manager/routes" element={<div className="p-8"><h1 className="text-2xl font-bold">Route Optimization Page</h1></div>} />
              <Route path="/manager/fuel" element={<div className="p-8"><h1 className="text-2xl font-bold">Fuel Management Page</h1></div>} />
              <Route path="/manager/maintenance" element={<div className="p-8"><h1 className="text-2xl font-bold">Maintenance Page</h1></div>} />
              <Route path="/manager/ewaybills" element={<div className="p-8"><h1 className="text-2xl font-bold">E-Way Bills Page</h1></div>} />
              <Route path="/manager/documents" element={<div className="p-8"><h1 className="text-2xl font-bold">Documents Page</h1></div>} />
              <Route path="/manager/analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics Page</h1></div>} />
              <Route path="/manager/reports" element={<div className="p-8"><h1 className="text-2xl font-bold">Reports Page</h1></div>} />
              <Route path="/manager/notifications" element={<div className="p-8"><h1 className="text-2xl font-bold">Notifications Page</h1></div>} />
              <Route path="/manager/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings Page</h1></div>} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
