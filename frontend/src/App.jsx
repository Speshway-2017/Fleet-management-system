import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AdminProvider } from "@/roles/admin/context/AdminContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ScrollToTop from "@/components/common/ScrollToTop";
import ProtectedRoute from "@/routes/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import AuthLayout from "@/components/layout/AuthLayout";
import DriverLayout from "@/roles/driver/layouts/DriverLayout";
import { ErrorBoundary } from "@/ErrorBoundary";
import SmartSkeletonFallback from "@/components/common/SmartSkeletonFallback";

// 1. Direct Static Imports (Critical Initial Experience - No Lazy Loading)
import Home from "@/roles/admin/pages/Home";
import Performance from "@/roles/admin/pages/Performance";
import About from "@/roles/admin/pages/About";
import Contact from "@/roles/admin/pages/Contact";
import LoginPage from "@/roles/admin/pages/LoginPage";
import Dashboard from "@/roles/admin/pages/Dashboard";
import AdminDashboard from "@/roles/admin/pages/AdminDashboard";
import ManagerDashboard from "@/roles/manager/pages/ManagerDashboard";
import DriverDashboard from "@/roles/driver/pages/Dashboard";
import UnauthorizedPage from "@/components/common/UnauthorizedPage";

// 2. Secondary Public & Auth Pages (Lazy Loaded)
const Security = lazy(() => import("@/roles/admin/pages/Security"));
const Features = lazy(() => import("@/roles/admin/pages/Features"));
const Blogs = lazy(() => import("@/roles/admin/pages/Blogs"));
const Pricing = lazy(() => import("@/roles/admin/pages/Pricing"));

const ForgotPasswordPage = lazy(() => import("@/roles/admin/pages/ForgotPasswordPage"));
const OtpVerificationPage = lazy(() => import("@/roles/admin/pages/OtpVerificationPage"));
const ResetPasswordPage = lazy(() => import("@/roles/admin/pages/ResetPasswordPage"));

// 3. Secondary Admin Pages (Lazy Loaded)
const OrganizationList = lazy(() => import("@/roles/admin/pages/OrganizationList"));
const AddOrganization = lazy(() => import("@/roles/admin/pages/AddOrganization"));
const OrganizationDetails = lazy(() => import("@/roles/admin/pages/OrganizationDetails"));
const EditOrganization = lazy(() => import("@/roles/admin/pages/EditOrganization"));
const Analytics = lazy(() => import("@/roles/admin/pages/Analytics"));
const ContactRequests = lazy(() => import("@/roles/admin/pages/ContactRequests"));
const SystemHealth = lazy(() => import("@/roles/admin/pages/SystemHealth"));
const AuditLogs = lazy(() => import("@/roles/admin/pages/AuditLogs"));
const Settings = lazy(() => import("@/roles/admin/pages/Settings"));
const SecuritySettings = lazy(() => import("@/roles/admin/pages/SecuritySettings"));
const NotificationSettings = lazy(() => import("@/roles/admin/pages/NotificationSettings"));
const ProfileSettings = lazy(() => import("@/roles/admin/pages/ProfileSettings"));
const ReviewsSettings = lazy(() => import("@/roles/admin/pages/ReviewsSettings"));
const SettingsBlogs = lazy(() => import("@/roles/admin/pages/SettingsBlogs"));
const SettingsAbout = lazy(() => import("@/roles/admin/pages/SettingsAbout"));
const NotificationList = lazy(() => import("@/roles/admin/pages/NotificationList"));
const NotificationDetails = lazy(() => import("@/roles/admin/pages/NotificationDetails"));
const SubscriptionRequests = lazy(() => import("@/roles/admin/pages/SubscriptionRequests"));
const UserManagement = lazy(() => import("@/roles/admin/pages/UserManagement"));

// 4. Secondary Fleet Manager Pages (Lazy Loaded)
const VehicleManagement = lazy(() => import("@/roles/manager/pages/VehicleManagement"));
const VehiclesListPage = lazy(() => import("@/roles/manager/pages/VehiclesListPage"));
const VehicleDetailsPage = lazy(() => import("@/roles/manager/pages/VehicleDetailsPage"));
const VehicleEditPage = lazy(() => import("@/roles/manager/pages/VehicleEditPage"));
const AddVehiclePage = lazy(() => import("@/roles/manager/pages/AddVehiclePage"));
const FleetMapPage = lazy(() => import("@/roles/manager/pages/FleetMapPage"));
const AnalyticsPage = lazy(() => import("@/roles/manager/pages/AnalyticsPage"));
const DriversManagementPage = lazy(() => import("@/roles/manager/pages/DriversManagementPage"));
const DriversListPage = lazy(() => import("@/roles/manager/pages/DriversListPage"));
const DriverProfilePage = lazy(() => import("@/roles/manager/pages/DriverProfilePage"));
const AssignVehiclePage = lazy(() => import("@/roles/manager/pages/AssignVehiclePage"));
const AddDriverPage = lazy(() => import("@/roles/manager/pages/AddDriverPage"));
const TripsManagementPage = lazy(() => import("@/roles/manager/pages/TripsManagementPage"));
const TripsListPage = lazy(() => import("@/roles/manager/pages/TripsListPage"));
const CreateTripPage = lazy(() => import("@/roles/manager/pages/CreateTripPage"));
const TripDetailsPage = lazy(() => import("@/roles/manager/pages/TripDetailsPage"));
const FuelManagementPage = lazy(() => import("@/roles/manager/pages/FuelManagementPage"));
const MaintenanceManagementPage = lazy(() => import("@/roles/manager/pages/MaintenanceManagementPage"));
const UpcomingServicesPage = lazy(() => import("@/roles/manager/pages/UpcomingServicesPage"));
const ScheduleServicePage = lazy(() => import("@/roles/manager/pages/ScheduleServicePage"));
const ServiceDetailsPage = lazy(() => import("@/roles/manager/pages/ServiceDetailsPage"));
const ViewTicketsPage = lazy(() => import("@/roles/manager/pages/ViewTicketsPage"));
const ReportsPage = lazy(() => import("@/roles/manager/pages/ReportsPage"));
const ArchivedReportsPage = lazy(() => import("@/roles/manager/pages/ArchivedReportsPage"));
const ManageSchedulesPage = lazy(() => import("@/roles/manager/pages/ManageSchedulesPage"));
const NotificationsPage = lazy(() => import("@/roles/manager/pages/NotificationsPage"));
const NotificationDetailsPage = lazy(() => import("@/roles/manager/pages/NotificationDetailsPage"));
const SettingsPage = lazy(() => import("@/roles/manager/pages/SettingsPage"));
const ChangePasswordPage = lazy(() => import("@/roles/manager/pages/ChangePasswordPage"));
const ProfilePage = lazy(() => import("@/roles/manager/pages/ProfilePage"));
const EditProfilePage = lazy(() => import("@/roles/manager/pages/EditProfilePage"));
const ManagerResetPasswordPage = lazy(() => import("@/roles/manager/pages/ManagerResetPasswordPage"));
const TwoFactorPage = lazy(() => import("@/roles/manager/pages/TwoFactorPage"));
const SubscriptionPage = lazy(() => import("@/roles/manager/pages/SubscriptionPage"));
const EarningsPage = lazy(() => import("@/roles/manager/pages/EarningsPage"));

// 5. Secondary Driver Pages (Lazy Loaded)
const DriverTripsPage = lazy(() => import("@/roles/driver/pages/Trips"));
const DriverTripDetailsPage = lazy(() => import("@/roles/driver/pages/TripDetails"));
const DriverVehiclesPage = lazy(() => import("@/roles/driver/pages/Vehicles"));
const DriverFuelPage = lazy(() => import("@/roles/driver/pages/Fuel"));
const DriverMaintenancePage = lazy(() => import("@/roles/driver/pages/Maintenance"));
const DriverNotificationsPage = lazy(() => import("@/roles/driver/pages/Notifications"));
const DriverSupportPage = lazy(() => import("@/roles/driver/pages/Support"));
const DriverSelfProfilePage = lazy(() => import("@/roles/driver/pages/Profile"));
const DriverSettingsPage = lazy(() => import("@/roles/driver/pages/Settings"));
const DriverDocumentsPage = lazy(() => import("@/roles/driver/pages/Documents"));

function PublicRoute({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    if (role === "SUPER_ADMIN" || role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (role === "DRIVER" || role === "driver") return <Navigate to="/driver/dashboard" replace />;
    return <Navigate to="/manager" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Toaster position="top-right" />
            <ErrorBoundary>
              <Suspense fallback={<SmartSkeletonFallback variant="dashboard" />}>
                <Routes>
                  {/* Public Landing Pages */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                    <Route path="/performance" element={<PublicRoute><Performance /></PublicRoute>} />
                    <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
                    <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
                    <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
                    <Route path="/security" element={<PublicRoute><Security /></PublicRoute>} />
                    <Route path="/pricing" element={<PublicRoute><Pricing /></PublicRoute>} />
                    <Route path="/blogs" element={<PublicRoute><Blogs /></PublicRoute>} />
                  </Route>

                  {/* Auth Routes */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/otp-verification" element={<OtpVerificationPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                  </Route>
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Super Admin Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "admin"]} />}>
                    <Route element={<AdminProvider><Outlet /></AdminProvider>}>
                      <Route path="/admin/dashboard" element={<Dashboard />} />
                      <Route path="/admin/organizations" element={<OrganizationList />} />
                      <Route path="/admin/organizations/add" element={<AddOrganization />} />
                      <Route path="/admin/organizations/details" element={<OrganizationDetails />} />
                      <Route path="/admin/organizations/edit" element={<EditOrganization />} />
                      <Route path="/admin/organizations/edit/:id?" element={<EditOrganization />} />
                      <Route path="/admin/organizations/details/:id?" element={<OrganizationDetails />} />

                      <Route path="/admin/analytics" element={<Analytics />} />
                      <Route path="/admin/contact-requests" element={<ContactRequests />} />
                      <Route path="/admin/system-health" element={<SystemHealth />} />
                      <Route path="/admin/audit-logs" element={<AuditLogs />} />
                      <Route path="/admin/settings" element={<Settings />} />
                      <Route path="/admin/settings/security" element={<SecuritySettings />} />
                      <Route path="/admin/settings/notifications" element={<NotificationSettings />} />
                      <Route path="/admin/settings/profile" element={<ProfileSettings />} />
                      <Route path="/admin/settings/blogs" element={<SettingsBlogs />} />
                      <Route path="/admin/settings/about" element={<SettingsAbout />} />
                      <Route path="/admin/settings/reviews" element={<ReviewsSettings />} />
                      <Route path="/admin/notifications" element={<NotificationList />} />
                      <Route path="/admin/notifications/:id" element={<NotificationDetails />} />
                      <Route path="/admin/subscription-plans" element={<SubscriptionRequests />} />
                      <Route path="/admin/subscription-requests" element={<SubscriptionRequests />} />
                      <Route element={<AppLayout />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/users" element={<UserManagement />} />
                      </Route>
                    </Route>
                  </Route>

                  {/* Fleet Manager Protected Routes */}
                  <Route element={<ProtectedRoute allowedRoles={["FLEET_MANAGER", "manager"]} />}>
                    <Route element={<AppLayout />}>
                      <Route path="/manager" element={<ManagerDashboard />} />
                      <Route path="/manager/vehicle-management" element={<VehicleManagement />} />
                      <Route path="/manager/vehicles-list" element={<VehiclesListPage />} />
                      <Route path="/manager/vehicle-details/:id" element={<VehicleDetailsPage />} />
                      <Route path="/manager/vehicle-edit/:id" element={<VehicleEditPage />} />
                      <Route path="/manager/add-vehicle" element={<AddVehiclePage />} />
                      <Route path="/manager/map" element={<FleetMapPage />} />

                      <Route path="/manager/vehicles" element={<VehicleManagement />} />
                      <Route path="/manager/drivers" element={<DriversManagementPage />} />
                      <Route path="/manager/drivers-list" element={<DriversListPage />} />
                      <Route path="/manager/driver-profile/:id" element={<DriverProfilePage />} />
                      <Route path="/manager/driver-assign-vehicle/:id" element={<AssignVehiclePage />} />
                      <Route path="/manager/add-driver" element={<AddDriverPage />} />
                      <Route path="/manager/edit-driver/:id" element={<AddDriverPage />} />

                      <Route path="/manager/tracking" element={<FleetMapPage />} />
                      <Route path="/manager/settings" element={<SettingsPage />} />
                      <Route path="/manager/trips" element={<TripsManagementPage />} />
                      <Route path="/manager/trips-list" element={<TripsListPage />} />
                      <Route path="/manager/create-trip" element={<CreateTripPage />} />
                      <Route path="/manager/trip-details/:id" element={<TripDetailsPage />} />

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
                      <Route path="/manager/maintenance/tickets" element={<ViewTicketsPage />} />
                      <Route path="/manager/profile" element={<ProfilePage />} />
                      <Route path="/manager/profile/edit" element={<EditProfilePage />} />
                      <Route path="/manager/profile/reset-password" element={<ManagerResetPasswordPage />} />
                      <Route path="/manager/profile/2fa" element={<TwoFactorPage />} />
                      <Route path="/manager/subscription" element={<SubscriptionPage />} />
                      <Route path="/manager/earnings" element={<EarningsPage />} />
                    </Route>
                  </Route>

                  {/* Driver Protected Routes */}
                  <Route path="/driver/login" element={<Navigate to="/login" replace />} />
                  <Route element={<ProtectedRoute allowedRoles={["DRIVER", "driver"]} />}>
                    <Route element={<DriverLayout />}>
                      <Route path="/driver" element={<Navigate to="/driver/dashboard" replace />} />
                      <Route path="/driver/dashboard" element={<DriverDashboard />} />
                      <Route path="/driver/trips" element={<DriverTripsPage />} />
                      <Route path="/driver/trips/:id" element={<DriverTripDetailsPage />} />
                      <Route path="/driver/vehicles" element={<DriverVehiclesPage />} />
                      <Route path="/driver/fuel" element={<DriverFuelPage />} />
                      <Route path="/driver/maintenance" element={<DriverMaintenancePage />} />
                      <Route path="/driver/documents" element={<DriverDocumentsPage />} />
                      <Route path="/driver/notifications" element={<DriverNotificationsPage />} />
                      <Route path="/driver/support" element={<DriverSupportPage />} />
                      <Route path="/driver/profile" element={<DriverSelfProfilePage />} />
                      <Route path="/driver/settings" element={<DriverSettingsPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
