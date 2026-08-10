import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();

  // Breadcrumb configuration mapping paths to labels
  const breadcrumbConfig = {
    "/manager/vehicle-management": { label: "Vehicle Management" },
    "/manager/vehicles-list": { label: "Vehicles List", parent: "/manager/vehicle-management" },
    "/manager/vehicle-details": { label: "Vehicle Details", parent: "/manager/vehicle-management" },
    "/manager/vehicle-edit": { label: "Edit Vehicle", parent: "/manager/vehicle-management" },
    "/manager/add-vehicle": { label: "Add Vehicle", parent: "/manager/vehicle-management" },
    "/manager/map": { label: "Live Tracking" },
    "/manager/drivers": { label: "Drivers" },
    "/manager/drivers-list": { label: "Drivers List", parent: "/manager/drivers" },
    "/manager/driver-profile": { label: "Driver Profile", parent: "/manager/drivers" },
    "/manager/driver-assign-vehicle": { label: "Assign Vehicle", parent: "/manager/drivers" },
    "/manager/add-driver": { label: "Add Driver", parent: "/manager/drivers" },
    "/manager/edit-driver": { label: "Edit Driver", parent: "/manager/drivers" },
    "/manager/trips": { label: "Trips" },
    "/manager/trips-list": { label: "Trips List", parent: "/manager/trips" },
    "/manager/create-trip": { label: "Dispatch New Trip", parent: "/manager/trips" },
    "/manager/trip-details": { label: "Trip Details", parent: "/manager/trips" },

    "/manager/fuel": { label: "Fuel Management" },
    "/manager/analytics": { label: "Analytics" },
    "/manager/reports": { label: "Reports" },
    "/manager/reports/archived": { label: "Archived Reports", parent: "/manager/reports" },
    "/manager/reports/schedules": { label: "Report Schedules", parent: "/manager/reports" },
    "/manager/notifications": { label: "Notifications" },
    "/manager/notifications/": { label: "Notification Details", parent: "/manager/notifications" },
    "/manager/settings": { label: "Settings" },
    "/manager/change-password": { label: "Change Password", parent: "/manager/settings" },
    "/manager/subscription": { label: "Subscription" },
    "/manager/earnings": { label: "Earnings" },
    "/manager/help-support": { label: "Help & Support" },

    "/manager/maintenance": { label: "Maintenance" },
    "/manager/maintenance/upcoming": { label: "Upcoming Services", parent: "/manager/maintenance" },
    "/manager/maintenance/schedule": { label: "Schedule Service", parent: "/manager/maintenance" },
    "/manager/maintenance/details": { label: "Service Details", parent: "/manager/maintenance" },
    "/manager/maintenance/tickets": { label: "Vehicle Issue Tickets", parent: "/manager/maintenance" },
    "/manager/profile": { label: "Profile" },
    "/manager/profile/edit": { label: "Edit Profile", parent: "/manager/profile" },
    "/manager/profile/reset-password": { label: "Reset Password", parent: "/manager/profile" },
    "/manager/profile/2fa": { label: "Two-Factor Authentication", parent: "/manager/profile" },
  };

  const generateBreadcrumbs = () => {
    const pathname = location.pathname;
    const breadcrumbs = [];

    // Always add Dashboard as first breadcrumb
    breadcrumbs.push({
      label: "Dashboard",
      path: "/manager",
      isActive: pathname === "/manager",
    });

    if (pathname === "/manager") {
      return breadcrumbs;
    }

    // Find matching breadcrumb configuration
    let matchedConfig = null;
    let matchedPath = null;

    for (const [path, config] of Object.entries(breadcrumbConfig)) {
      if (pathname.startsWith(path)) {
        if (!matchedPath || path.length > matchedPath.length) {
          matchedPath = path;
          matchedConfig = config;
        }
      }
    }

    if (matchedConfig && matchedPath) {
      // Add parent breadcrumb if exists
      if (matchedConfig.parent) {
        const parentConfig = breadcrumbConfig[matchedConfig.parent];
        if (parentConfig) {
          breadcrumbs.push({
            label: parentConfig.label,
            path: matchedConfig.parent,
            isActive: false,
          });
        }
      }

      // Add current breadcrumb
      breadcrumbs.push({
        label: matchedConfig.label,
        path: matchedPath,
        isActive: true,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center flex-wrap font-poppins text-[14px] font-medium leading-[20px] mb-[16px] text-left select-none gap-x-2">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center gap-x-2">
          {index > 0 && (
            <span className="text-[#CBD5E1] font-poppins text-[14px] font-medium leading-[20px]">&gt;</span>
          )}
          {breadcrumb.isActive ? (
            <span className="text-[#475569] font-medium">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="text-[#C46A1A] hover:text-[#A15412] transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
