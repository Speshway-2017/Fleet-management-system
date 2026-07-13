import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Breadcrumb from "@/components/common/Breadcrumb";
import DispatchWarningModal from "@/components/common/DispatchWarningModal";
import ContactDriverModal from "@/components/common/ContactDriverModal";
import { managerApi } from "../api/managerApi";

const mapTypeToTab = (type) => {
  if (type === "alert")  return "Critical";
  if (type === "info")   return "Maintenance";
  if (type === "system") return "System";
  return "All";
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await managerApi.getNotifications();
      setNotifications(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Find last critical notification
  const lastCriticalNotif = notifications.find(n => n.type === "alert" || n.type === "warning") || notifications[0];
  const coords = lastCriticalNotif?.coords || [19.0760, 72.8777];
  const locationName = lastCriticalNotif?.locationName || "Mumbai Bypass Road";

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(coords, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const pinIcon = L.divIcon({
      html: `<div class="bg-red-600 rounded-full w-7 h-7 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    L.marker(coords, { icon: pinIcon }).bindPopup(`<strong>${lastCriticalNotif?.title || 'No Incident'}</strong><br/>${locationName}`).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, notifications]);

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "Critical") return notif.type === "alert" || notif.type === "warning";
    if (activeTab === "Maintenance") return notif.type === "info";
    if (activeTab === "System") return notif.type === "success" || notif.type === "system";
    return true;
  });

  const [showDispatchWarningModal, setShowDispatchWarningModal] = useState(false);
  const [showContactDriverModal, setShowContactDriverModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const getIconColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'info': return 'bg-blue-100 text-blue-700';
      case 'success': return 'bg-green-100 text-green-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return 'mdi:alert-octagon';
      case 'warning': return 'mdi:alert-circle';
      case 'info': return 'mdi:information';
      case 'success': return 'mdi:check-circle';
      case 'system': return 'mdi:cloud-sync';
      default: return 'mdi:bell';
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const promises = notifications.filter(n => !n.isRead).map(n => managerApi.markNotificationRead(n._id || n.id));
      await Promise.all(promises);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all read");
    }
  };

  const handleActionClick = async (action, notification, e) => {
    e.stopPropagation();
    
    // Mark as read in DB
    try {
      await managerApi.markNotificationRead(notification._id || notification.id);
      setNotifications(prev =>
        prev.map(n => (n._id === notification._id || n.id === notification.id) ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }

    const actType = action.actionType;
    if (actType === "Dispatch Warning") {
      setSelectedNotification(notification);
      setShowDispatchWarningModal(true);
    } else if (actType === "Call Driver") {
      setSelectedNotification(notification);
      setShowContactDriverModal(true);
    } else if (actType === "Track Live") {
      navigate("/manager/map");
    } else if (actType === "View Analytics") {
      navigate("/manager/analytics");
    } else if (actType === "Schedule Now") {
      navigate("/manager/maintenance/schedule", {
        state: {
          vehicleNumber: notification.vehicle,
          maintenanceType: "Brake Check",
          dueMileage: "150 miles"
        }
      });
    } else if (actType === "Download PDF") {
      toast.success(`Downloading PDF for ${notification.title}...`);
    } else {
      toast.success(`${actType} action triggered!`);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      await managerApi.markNotificationRead(notif._id || notif.id);
    } catch (err) {
      console.error("Failed to mark read", err);
    }

    // Update active tab to match the category
    setActiveTab(mapTypeToTab(notif.type));
    navigate(`/manager/notifications/${notif._id || notif.id}`);
  };

  const countByPriority = (priority) => {
    return notifications.filter(n => n.priority === priority).length;
  };

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Notifications Center</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer border-none"
            >
              <Icon icon="mdi:check-all" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="whitespace-nowrap">Mark all as read</span>
            </button>
          )}
          <button 
            onClick={() => navigate("/manager/profile")}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <Icon icon="mdi:cog-outline" className="w-5 h-5" />
            Profile Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="lg:w-80 space-y-4 lg:space-y-6">
          {/* Alert Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-gray-500 font-medium mb-3 sm:mb-4 text-sm sm:text-base">Alert Overview</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">High Priority</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-red-600">{countByPriority("high")}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Medium Priority</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-orange-700">{countByPriority("medium")}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Low Priority</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-blue-700">{countByPriority("low")}</span>
              </div>
            </div>
          </div>

          {/* Last Critical Location */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative h-48 bg-gray-100">
              <div ref={mapRef} className="absolute inset-0 z-0 h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 z-10 pointer-events-none">
                <div>
                  <p className="text-white font-semibold text-sm">Incident Map Hub</p>
                  <p className="text-white/80 text-xs font-mono font-medium">{coords[0].toFixed(4)}° N, {coords[1].toFixed(4)}° E</p>
                  <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{locationName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications List */}
        <div className="flex-1 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full overflow-x-auto">
            {['All', 'Critical', 'Maintenance', 'System'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${activeTab === tab
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 bg-transparent"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Loading state / Empty state */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
              Loading alerts...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 font-medium font-poppins select-none shadow-sm">
              <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon icon="mdi:bell-off-outline" className="w-8 h-8" />
              </div>
              <h4 className="text-gray-700 font-bold">No Alerts Found</h4>
              <p className="text-xs text-gray-450 mt-1 max-w-xs mx-auto leading-relaxed">
                You have no active notifications or priority updates matching this category.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div 
                key={notif._id || notif.id} 
                onClick={() => handleNotificationClick(notif)}
                className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative ${!notif.isRead ? 'border-l-4 border-l-[#B45A0A]' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full ${getIconColor(notif.type)} flex items-center justify-center shrink-0`}>
                    <Icon icon={getIcon(notif.type)} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        {notif.title}
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B45A0A]" />
                        )}
                      </h4>
                      <span className="text-xs text-gray-400 font-medium">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{notif.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(notif.actions || []).map((action, i) => (
                        <button
                          key={i}
                          onClick={(e) => handleActionClick(action, notif, e)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${action.bg === 'bg-white'
                              ? `${action.bg} ${action.text} border-gray-300 hover:bg-gray-50`
                              : `${action.bg} text-white border-transparent ${action.hover}`
                            }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <DispatchWarningModal
        isOpen={showDispatchWarningModal}
        onClose={() => setShowDispatchWarningModal(false)}
        notification={selectedNotification?.meta}
      />
      <ContactDriverModal
        isOpen={showContactDriverModal}
        onClose={() => setShowContactDriverModal(false)}
        notification={selectedNotification?.meta}
      />
    </div>
  );
}
