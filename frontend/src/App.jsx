import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/roles/admin/pages/LoginPage";
import SignupPage from "@/roles/admin/pages/SignupPage";
import Signup1 from "@/roles/admin/pages/Signup1";
import ForgotPasswordPage from "@/roles/admin/pages/ForgotPasswordPage";
import OtpVerificationPage from "@/roles/admin/pages/OtpVerificationPage";
import ResetPasswordPage from "@/roles/admin/pages/ResetPasswordPage";
import UnauthorizedPage from "@/components/common/UnauthorizedPage";
import AdminDashboard from "@/roles/admin/pages/AdminDashboard";
import UserManagement from "@/roles/admin/pages/UserManagement";
import ManagerDashboard from "@/roles/manager/pages/ManagerDashboard";
import FleetMapPage from "@/roles/manager/pages/FleetMapPage";
import VehicleManagement from "@/roles/manager/pages/VehicleManagement";
import AddVehiclePage from "@/roles/manager/pages/AddVehiclePage";
import VehiclesListPage from "@/roles/manager/pages/VehiclesListPage";
import VehicleDetailsPage from "@/roles/manager/pages/VehicleDetailsPage";
import VehicleEditPage from "@/roles/manager/pages/VehicleEditPage";
import DriversManagementPage from "@/roles/manager/pages/DriversManagementPage";
import DriversListPage from "@/roles/manager/pages/DriversListPage";
import DriverProfilePage from "@/roles/manager/pages/DriverProfilePage";
import AssignVehiclePage from "@/roles/manager/pages/AssignVehiclePage";
import AddDriverPage from "@/roles/manager/pages/AddDriverPage";
import TripsManagementPage from "@/roles/manager/pages/TripsManagementPage";
import TripsListPage from "@/roles/manager/pages/TripsListPage";
import CreateTripPage from "@/roles/manager/pages/CreateTripPage";
import TripDetailsPage from "@/roles/manager/pages/TripDetailsPage";
// import TripsManagementPage from "@/roles/manager/pages/TripsManagementPage";
// import TripsListPage from "@/roles/manager/pages/TripsListPage";

import PublicHome from "@/pages/PublicHome";

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <PublicHome />;
  return <Navigate to={role === "admin" ? "/admin" : "/manager"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup1" element={<Signup1 />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
              <Route path="/manager/vehicle-management" element={<VehicleManagement />} />
              <Route path="/manager/vehicles-list" element={<VehiclesListPage />} />
              <Route path="/manager/vehicle-details/:id" element={<VehicleDetailsPage />} />
              <Route path="/manager/vehicle-edit/:id" element={<VehicleEditPage />} />
              <Route path="/manager/add-vehicle" element={<AddVehiclePage />} />
              <Route path="/manager/map" element={<FleetMapPage />} />
              <Route path="/manager/drivers" element={<DriversManagementPage />} />
              <Route path="/manager/drivers-list" element={<DriversListPage />} />
              <Route path="/manager/trips" element={<TripsManagementPage />} />
              <Route path="/manager/trips-list" element={<TripsListPage />} />
              <Route path="/manager/create-trip" element={<CreateTripPage />} />
              <Route path="/manager/trip-details/:id" element={<TripDetailsPage />} />
              {/* <Route path="/manager/trips" element={<TripsManagementPage />} />
              <Route path="/manager/trips-list" element={<TripsListPage />} /> */}
              <Route path="/manager/driver-profile/:id" element={<DriverProfilePage />} />
              <Route path="/manager/driver-assign-vehicle/:id" element={<AssignVehiclePage />} />
              <Route path="/manager/add-driver" element={<AddDriverPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
