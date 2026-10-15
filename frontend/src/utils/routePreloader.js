// Intelligent background route preloader
// Loads module chunks into browser memory in idle time so page clicks are instantaneous (< 50ms)

const preloadedMap = new Set();

const safePreload = (factory, key) => {
  if (preloadedMap.has(key)) return;
  preloadedMap.add(key);
  try {
    factory();
  } catch (e) {
    // Silently ignore prefetch errors
  }
};

export const preloadAdminRoutes = () => {
  const adminRoutes = [
    [() => import("@/roles/admin/pages/OrganizationList"), "org_list"],
    [() => import("@/roles/admin/pages/Analytics"), "admin_analytics"],
    [() => import("@/roles/admin/pages/SubscriptionRequests"), "sub_requests"],
    [() => import("@/roles/admin/pages/Settings"), "admin_settings"],
    [() => import("@/roles/admin/pages/AuditLogs"), "audit_logs"],
    [() => import("@/roles/admin/pages/SystemHealth"), "system_health"],
    [() => import("@/roles/admin/pages/ContactRequests"), "contact_requests"],
    [() => import("@/roles/admin/pages/NotificationList"), "admin_notifications"],
    [() => import("@/roles/admin/pages/AddOrganization"), "add_org"]
  ];

  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
  adminRoutes.forEach(([fn, key], idx) => {
    schedule(() => safePreload(fn, key), { timeout: 1000 + idx * 150 });
  });
};

export const preloadManagerRoutes = () => {
  const managerRoutes = [
    [() => import("@/roles/manager/pages/VehiclesListPage"), "mgr_vehicles"],
    [() => import("@/roles/manager/pages/TripsManagementPage"), "mgr_trips"],
    [() => import("@/roles/manager/pages/DriversListPage"), "mgr_drivers"],
    [() => import("@/roles/manager/pages/FuelManagementPage"), "mgr_fuel"],
    [() => import("@/roles/manager/pages/MaintenanceManagementPage"), "mgr_maintenance"],
    [() => import("@/roles/manager/pages/AnalyticsPage"), "mgr_analytics"],
    [() => import("@/roles/manager/pages/ReportsPage"), "mgr_reports"],
    [() => import("@/roles/manager/pages/ProfilePage"), "mgr_profile"],
    [() => import("@/roles/manager/pages/SettingsPage"), "mgr_settings"],
    [() => import("@/roles/manager/pages/FleetMapPage"), "mgr_map"],
    [() => import("@/roles/manager/pages/CreateTripPage"), "mgr_create_trip"],
    [() => import("@/roles/manager/pages/AddVehiclePage"), "mgr_add_vehicle"],
    [() => import("@/roles/manager/pages/AddDriverPage"), "mgr_add_driver"]
  ];

  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
  managerRoutes.forEach(([fn, key], idx) => {
    schedule(() => safePreload(fn, key), { timeout: 1000 + idx * 150 });
  });
};

export const preloadDriverRoutes = () => {
  const driverRoutes = [
    [() => import("@/roles/driver/pages/Trips"), "drv_trips"],
    [() => import("@/roles/driver/pages/Vehicles"), "drv_vehicles"],
    [() => import("@/roles/driver/pages/Fuel"), "drv_fuel"],
    [() => import("@/roles/driver/pages/Maintenance"), "drv_maintenance"],
    [() => import("@/roles/driver/pages/Documents"), "drv_documents"],
    [() => import("@/roles/driver/pages/Profile"), "drv_profile"],
    [() => import("@/roles/driver/pages/Settings"), "drv_settings"],
    [() => import("@/roles/driver/pages/Support"), "drv_support"],
    [() => import("@/roles/driver/pages/Notifications"), "drv_notifications"]
  ];

  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));
  driverRoutes.forEach(([fn, key], idx) => {
    schedule(() => safePreload(fn, key), { timeout: 1000 + idx * 150 });
  });
};

export const preloadPublicRoutes = () => {
  const publicRoutes = [
    [() => import("@/roles/admin/pages/Features"), "pub_features"],
    [() => import("@/roles/admin/pages/Pricing"), "pub_pricing"],
    [() => import("@/roles/admin/pages/Blogs"), "pub_blogs"],
    [() => import("@/roles/admin/pages/Security"), "pub_security"],
    [() => import("@/roles/admin/pages/LoginPage"), "pub_login"]
  ];

  const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
  publicRoutes.forEach(([fn, key], idx) => {
    schedule(() => safePreload(fn, key), { timeout: 2000 + idx * 200 });
  });
};
