import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

  const handleBack = () => {
    navigate("/manager/notifications");
  };

  const handleAction = (action) => {
    if (action.actionType === "navigate" && action.route) {
      navigate(action.route);
    } else {
      toast.success(`${action.label} action triggered!`);
    }
  };

  // Not found guard
  if (!notification) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 mb-8">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <Icon icon="mdi:arrow-left" className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Notification Details</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 shadow-sm text-center">
          <Icon icon="mdi:bell-off" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">Notification not found.</p>
          <button
            onClick={handleBack}
            className="mt-6 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Notifications
          </button>
        </div>
      </div>
    );
  }

  const iconColors = getIconColors(notification.type);
  const iconName = getIconName(notification.type);
  const locationLabel = getLocationLabel(notification.type);

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Notification Details</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${iconColors} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon icon={iconName} className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{notification.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 ${notification.priorityColor} text-white rounded-full text-xs font-bold`}>
                      {notification.priorityLabel}
                    </span>
                    <span className="text-sm text-gray-500">{notification.time}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Icon icon="mdi:email-outline" className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Icon icon="mdi:archive-outline" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Event Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {notification.fullDescription || notification.description}
              </p>
            </div>

            {/* Stats */}
            {notification.stats && notification.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {notification.stats.map((stat, i) => (
                  <div key={i} className="p-4 bg-blue-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">{stat.label}</p>
                    <p className={`text-xl font-extrabold ${stat.valueColor}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {notification.detailActions && notification.detailActions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {notification.detailActions.map((action, i) => {
                  let btnClass = "";
                  if (action.variant === "amber") {
                    btnClass = "bg-amber-700 text-white hover:bg-amber-800";
                  } else if (action.variant === "amber-outline") {
                    btnClass = "bg-white text-amber-700 border border-amber-700 hover:bg-amber-50";
                  } else if (action.variant === "black") {
                    btnClass = "bg-black text-white hover:bg-gray-800";
                  } else {
                    btnClass = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAction(action)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${btnClass}`}
                    >
                      <Icon icon={action.icon} className="w-5 h-5" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:map-marker-radius" className="w-5 h-5 text-amber-700" />
                {locationLabel}
              </h3>
              <span className="text-sm text-gray-500">{notification.location}</span>
            </div>
            <div className="relative h-80 bg-gray-100">
              <div ref={mapRef} className="absolute inset-0 z-0 w-full h-full" />
              <div className="absolute right-4 top-4 flex flex-col gap-2 z-[400]">
                <button
                  onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                  <Icon icon="mdi:plus" className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                  <Icon icon="mdi:minus" className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => mapInstanceRef.current?.setView([41.8781, -87.6298], 12)}
                  className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                  <Icon icon="mdi:target-variant" className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-80 space-y-6">
          {/* Vehicle Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Vehicle Details</h3>
              <button className="text-xs font-medium text-amber-700 hover:underline">Full Profile</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon icon="mdi:truck" className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{notification.meta.vehicleId || "—"}</p>
                  <p className="text-xs text-gray-500">{notification.meta.vehicleModel || "—"}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Total Mileage</span>
                  <span className="text-xs font-medium text-gray-800">{notification.meta.totalMileage || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Last Service</span>
                  <span className="text-xs font-medium text-gray-800">{notification.meta.lastService || "—"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Maintenance Health</span>
                  <span className="text-xs font-medium text-amber-700">{notification.meta.maintenanceHealth || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Details — only show when driver info is available */}
          {notification.meta.driver && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Driver Details</h3>
                <button className="text-xs font-medium text-amber-700 hover:underline">View History</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {notification.meta.driverInitials || notification.meta.driver.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{notification.meta.driver}</p>
                    <p className="text-xs text-gray-500">Emp ID: {notification.meta.driverEmpId || "—"}</p>
                  </div>
                </div>
                {(notification.meta.dailyDriveTime || notification.meta.safetyScore) && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                    {notification.meta.dailyDriveTime && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Daily Drive Time</p>
                        <p className="text-lg font-bold text-gray-800">{notification.meta.dailyDriveTime}</p>
                      </div>
                    )}
                    {notification.meta.safetyScore && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Safety Score</p>
                        <p className="text-lg font-bold text-amber-700">{notification.meta.safetyScore}</p>
                      </div>
                    )}
                  </div>
                )}
                <button className="w-full py-2 border border-amber-700 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                  <Icon icon="mdi:message-text-outline" className="w-4 h-4 inline mr-1" />
                  Message Driver
                </button>
              </div>
            </div>
          )}

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">
              Recent Alerts for {notification.meta.vehicleId || "Fleet"}
            </h3>
            <div className="space-y-3">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800 mb-1">Moderate Overspeeding</p>
                <p className="text-xs text-gray-500">Today, 08:32 AM • 72 mph</p>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 mb-1">Refuel Completed</p>
                <p className="text-xs text-gray-500">Yesterday, 04:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
