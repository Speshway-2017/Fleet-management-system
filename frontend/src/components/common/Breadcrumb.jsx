import { ChevronRight, Home } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();

  // Breadcrumb configuration mapping paths to labels
  const breadcrumbConfig = {
    "/manager": { label: "Dashboard", icon: Home },
    "/manager/vehicle-management": { label: "Vehicle Management" },
    "/manager/vehicles-list": { label: "Vehicles List" },
    "/manager/vehicle-details": { label: "Vehicle Details", parent: "/manager/vehicle-management" },
    "/manager/vehicle-edit": { label: "Edit Vehicle", parent: "/manager/vehicle-management" },
    "/manager/add-vehicle": { label: "Add Vehicle", parent: "/manager/vehicle-management" },
    "/manager/map": { label: "Live Tracking" },
    "/manager/drivers": { label: "Drivers Management" },
    "/manager/drivers-list": { label: "Drivers List" },
    "/manager/driver-profile": { label: "Driver Profile", parent: "/manager/drivers" },
    "/manager/driver-assign-vehicle": { label: "Assign Vehicle", parent: "/manager/drivers" },
    "/manager/add-driver": { label: "Add Driver", parent: "/manager/drivers" },
    "/manager/trips": { label: "Trips Management" },
    "/manager/trips-list": { label: "Trips List" },
    "/manager/create-trip": { label: "Create Trip", parent: "/manager/trips" },
    "/manager/trip-details": { label: "Trip Details", parent: "/manager/trips" },
    "/manager/route": { label: "Route Optimization" },
    "/manager/fuel": { label: "Fuel Management" },
    "/manager/fastag": { label: "FASTag & Toll" },
    "/manager/fastag/history": { label: "Toll History", parent: "/manager/fastag" },
    "/manager/maintenance": { label: "Maintenance Management" },
    "/manager/maintenance/upcoming": { label: "Upcoming Services", parent: "/manager/maintenance" },
    "/manager/maintenance/schedule": { label: "Schedule Service", parent: "/manager/maintenance" },
    "/manager/maintenance/details": { label: "Service Details", parent: "/manager/maintenance" },
    "/manager/profile": { label: "My Profile" },
    "/manager/profile/edit": { label: "Edit Profile", parent: "/manager/profile" },
    "/manager/profile/reset-password": { label: "Reset Password", parent: "/manager/profile" },
    "/manager/profile/2fa": { label: "Two-Factor Authentication", parent: "/manager/profile" },
    "/manager/documents": { label: "Documents" },
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

    // Find matching breadcrumb configuration
    let matchedConfig = null;
    let matchedPath = null;

    for (const [path, config] of Object.entries(breadcrumbConfig)) {
      if (pathname.startsWith(path) && path !== "/manager") {
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
    <div className="flex items-center gap-2 mb-6 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center gap-2">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
          )}
          {breadcrumb.isActive ? (
            <span className="text-[#64748B] font-medium">
              {breadcrumb.label}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="text-[#B45A0A] hover:text-[#9A4D08] font-medium transition-colors"
            >
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
