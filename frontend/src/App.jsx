import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AdminProvider } from "@/roles/admin/context/AdminContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import LoginPage from "@/roles/admin/pages/LoginPage";
import ForgotPasswordPage from "@/roles/admin/pages/ForgotPasswordPage";
import OtpVerificationPage from "@/roles/admin/pages/OtpVerificationPage";
import ResetPasswordPage from "@/roles/admin/pages/ResetPasswordPage";
import UnauthorizedPage from "@/components/common/UnauthorizedPage";
import AdminDashboard from "@/roles/admin/pages/AdminDashboard";
import Dashboard from "@/roles/admin/pages/Dashboard";
import OrganizationList from "@/roles/admin/pages/OrganizationList";
import AddOrganization from "@/roles/admin/pages/AddOrganization";
import OrganizationDetails from "@/roles/admin/pages/OrganizationDetails";
import EditOrganization from "@/roles/admin/pages/EditOrganization";
import FleetManagerList from "@/roles/admin/pages/FleetManagerList";
import AddFleetManager from "@/roles/admin/pages/AddFleetManager";
import ManagerDetails from "@/roles/admin/pages/ManagerDetails";
import EditFleetManager from "@/roles/admin/pages/EditFleetManager";
import Analytics from "@/roles/admin/pages/Analytics";
import SystemHealth from "@/roles/admin/pages/SystemHealth";
import AuditLogs from "@/roles/admin/pages/AuditLogs";
import Settings from "@/roles/admin/pages/Settings";
import SecuritySettings from "@/roles/admin/pages/SecuritySettings";
import NotificationSettings from "@/roles/admin/pages/NotificationSettings";
import ProfileSettings from "@/roles/admin/pages/ProfileSettings";
import NotificationList from "@/roles/admin/pages/NotificationList";
import NotificationDetails from "@/roles/admin/pages/NotificationDetails";
import UserManagement from "@/roles/admin/pages/UserManagement";
import ManagerDashboard from "@/roles/manager/pages/ManagerDashboard";
import FleetMapPage from "@/roles/manager/pages/FleetMapPage";
import FastagDashboard from "@/roles/manager/pages/FastagDashboard";
import TollHistoryPage from "@/roles/manager/pages/TollHistoryPage";
import FastagReceiptPage from "@/roles/manager/pages/FastagReceiptPage";
import FastagRechargePage from "@/roles/manager/pages/FastagRechargePage";
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
import RouteOptimizationPage from "@/roles/manager/pages/RouteOptimizationPage";
import CreateTripPage from "@/roles/manager/pages/CreateTripPage";
import FuelManagementPage from "@/roles/manager/pages/FuelManagementPage";
import MaintenanceManagementPage from "@/roles/manager/pages/MaintenanceManagementPage";
import AnalyticsPage from "@/roles/manager/pages/AnalyticsPage";
import NotificationsPage from "@/roles/manager/pages/NotificationsPage";
import NotificationDetailsPage from "@/roles/manager/pages/NotificationDetailsPage";
import ReportsPage from "@/roles/manager/pages/ReportsPage";
import ArchivedReportsPage from "@/roles/manager/pages/ArchivedReportsPage";
import ManageSchedulesPage from "@/roles/manager/pages/ManageSchedulesPage";
import SettingsPage from "@/roles/manager/pages/SettingsPage";
import ChangePasswordPage from "@/roles/manager/pages/ChangePasswordPage";
import EWayBillsPage from "@/roles/manager/pages/EWayBillsPage";
import GenerateEWayBillPage from "@/roles/manager/pages/GenerateEWayBillPage";
import UpcomingServicesPage from "@/roles/manager/pages/UpcomingServicesPage";
import ScheduleServicePage from "@/roles/manager/pages/ScheduleServicePage";
import ServiceDetailsPage from "@/roles/manager/pages/ServiceDetailsPage";
import TripDetailsPage from "@/roles/manager/pages/TripDetailsPage";
import ProfilePage from "@/roles/manager/pages/ProfilePage";
import EditProfilePage from "@/roles/manager/pages/EditProfilePage";
import ManagerResetPasswordPage from "@/roles/manager/pages/ManagerResetPasswordPage";
import TwoFactorPage from "@/roles/manager/pages/TwoFactorPage";
import DocumentManagement from "@/roles/manager/pages/DocumentManagement";
import ViewDocument from "@/roles/manager/pages/ViewDocument";
import EditDocument from "@/roles/manager/pages/EditDocument";
import UploadDocument from "@/roles/manager/pages/UploadDocument";
import DocumentsListPage from "@/roles/manager/pages/DocumentsListPage";
import ComplianceAuditPage from "@/roles/manager/pages/ComplianceAuditPage";
// import TripsManagementPage from "@/roles/manager/pages/TripsManagementPage";
// import TripsListPage from "@/roles/manager/pages/TripsListPage";

import PublicHome from "@/pages/PublicHome";

function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <PublicHome />;
  return <Navigate to={role === "SUPER_ADMIN" || role === "admin" ? "/admin/dashboard" : "/manager"} replace />;
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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "admin"]} />}>
            <Route element={<AdminProvider><Outlet /></AdminProvider>}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/organizations" element={<OrganizationList />} />
            <Route path="/admin/organizations/add" element={<AddOrganization />} />
            <Route path="/admin/organizations/details" element={<OrganizationDetails />} />
            <Route path="/admin/organizations/edit/:id" element={<EditOrganization />} />
            <Route path="/admin/organizations/details/:id" element={<OrganizationDetails />} />
            <Route path="/admin/fleet-managers" element={<FleetManagerList />} />
            <Route path="/admin/fleet-managers/add" element={<AddFleetManager />} />
            <Route path="/admin/fleet-managers/details" element={<ManagerDetails />} />
            <Route path="/admin/fleet-managers/details/:id" element={<ManagerDetails />} />
            <Route path="/admin/fleet-managers/edit" element={<EditFleetManager />} />
            <Route path="/admin/fleet-managers/edit/:id" element={<EditFleetManager />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/system-health" element={<SystemHealth />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/settings/security" element={<SecuritySettings />} />
            <Route path="/admin/settings/notifications" element={<NotificationSettings />} />
            <Route path="/admin/settings/profile" element={<ProfileSettings />} />
            <Route path="/admin/notifications" element={<NotificationList />} />
            <Route path="/admin/notifications/:id" element={<NotificationDetails />} />
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["FLEET_MANAGER", "manager"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/vehicle-management" element={<VehicleManagement />} />
              <Route path="/manager/vehicles-list" element={<VehiclesListPage />} />
              <Route path="/manager/vehicle-details/:id" element={<VehicleDetailsPage />} />
              <Route path="/manager/vehicle-edit/:id" element={<VehicleEditPage />} />
              <Route path="/manager/add-vehicle" element={<AddVehiclePage />} />
              <Route path="/manager/map" element={<FleetMapPage />} />
              <Route path="/manager/fastag" element={<FastagDashboard />} />
              <Route path="/manager/fastag/history" element={<TollHistoryPage />} />
              <Route path="/manager/fastag/receipt/:id" element={<FastagReceiptPage />} />
              <Route path="/manager/fastag/recharge" element={<FastagRechargePage />} />
              {/* Placeholder routes for other sidebar items */}
              <Route path="/manager/vehicles" element={<div className="p-8"><h1 className="text-2xl font-bold">Vehicles Page</h1></div>} />


              <Route path="/manager/tracking" element={<div className="p-8"><h1 className="text-2xl font-bold">Live Tracking Page</h1></div>} />
              <Route path="/manager/routes" element={<div className="p-8"><h1 className="text-2xl font-bold">Route Optimization Page</h1></div>} />

              <Route path="/manager/ewaybills" element={<div className="p-8"><h1 className="text-2xl font-bold">E-Way Bills Page</h1></div>} />
              <Route path="/manager/eway" element={<EWayBillsPage />} />
              <Route path="/manager/eway/generate" element={<GenerateEWayBillPage />} />
              <Route path="/manager/settings" element={<SettingsPage />} />
              <Route path="/manager/documents" element={<DocumentManagement />} />
              <Route path="/manager/documents/list" element={<DocumentsListPage />} />
              <Route path="/manager/documents/compliance-audit" element={<ComplianceAuditPage />} />
              <Route path="/manager/documents/upload" element={<UploadDocument />} />
              <Route path="/manager/documents/view/:id" element={<ViewDocument />} />
              <Route path="/manager/documents/edit/:id" element={<EditDocument />} />
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
              <Route path="/manager/edit-driver/:id" element={<AddDriverPage />} />
              <Route path="/manager/route" element={<RouteOptimizationPage />} />
              <Route path="/manager/fuel" element={<FuelManagementPage />} />
              <Route path="/manager/analytics" element={<AnalyticsPage />} />
              <Route path="/manager/reports" element={<ReportsPage />} />
              <Route path="/manager/reports/archived" element={<ArchivedReportsPage />} />
              <Route path="/manager/reports/schedules" element={<ManageSchedulesPage />} />
              <Route path="/manager/notifications" element={<NotificationsPage />} />
              <Route path="/manager/notifications/:id" element={<NotificationDetailsPage />} />
              <Route path="/manager/change-password" element={<ChangePasswordPage />} />
              <Route path="/manager/maintenance" element={<MaintenanceManagementPage />} />
              <Route path="/manager/maintenance/upcoming" element={<UpcomingServicesPage />} />
              <Route path="/manager/maintenance/schedule" element={<ScheduleServicePage />} />
              <Route path="/manager/maintenance/details/:id" element={<ServiceDetailsPage />} />
              <Route path="/manager/profile" element={<ProfilePage />} />
              <Route path="/manager/profile/edit" element={<EditProfilePage />} />
              <Route path="/manager/profile/reset-password" element={<ManagerResetPasswordPage />} />
              <Route path="/manager/profile/2fa" element={<TwoFactorPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
