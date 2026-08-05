import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import L from "leaflet";
import DriverChatDrawer from "@/components/common/DriverChatDrawer";
import DispatchWarningModal from "@/components/common/DispatchWarningModal";
import ContactDriverModal from "@/components/common/ContactDriverModal";
import { managerApi } from "../api/managerApi";

const getIconColors = (type) => {
  switch (type) {
    case 'alert': return 'bg-red-100 text-red-600';
    case 'warning': return 'bg-amber-100 text-amber-700';
    case 'info': return 'bg-blue-100 text-blue-700';
    case 'success': return 'bg-green-100 text-green-600';
    case 'system': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const getIconName = (type) => {
  switch (type) {
    case 'alert': return 'mdi:alert-octagon';
    case 'warning': return 'mdi:alert-circle';
    case 'info': return 'mdi:information';
    case 'success': return 'mdi:check-circle';
    case 'system': return 'mdi:cloud-sync';
    default: return 'mdi:bell';
  }
};

const getLocationLabel = (type) => {
  if (type === 'alert' || type === 'warning') return 'Violation Location';
  return 'Event Location';
};

export default function NotificationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showDispatchWarningModal, setShowDispatchWarningModal] = useState(false);
  const [showContactDriverModal, setShowContactDriverModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const coords = notification?.coords || [18.7508, 73.4218];
  const isSubscriptionNotification = 
    notification?.type === "subscription_request" || 
    notification?.type === "SUBSCRIPTION_REQUEST" ||
    (notification?.title && notification.title.toLowerCase().includes("subscription"));

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        const res = await managerApi.getNotifications();
        const list = res.data?.data || res.data || [];
        const found = list.find(n => n._id === id || n.id === id);
        if (found) {
          setNotification(found);
          if (!found.isRead) {
            managerApi.markNotificationRead(id).catch(err => console.error("Failed to mark read", err));
            setNotification(prev => prev ? { ...prev, isRead: true } : prev);
          }
        } else {
          toast.error("Notification not found");
          navigate("/manager/notifications");
        }
      } catch (err) {
        console.error("Failed to load details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotification();
  }, [id, navigate]);

  useEffect(() => {
    if (loading || !notification || !mapRef.current || isSubscriptionNotification) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView(coords, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const pinIcon = L.divIcon({
      html: `<div class="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker(coords, { icon: pinIcon }).bindPopup(`<strong>Violation Location</strong><br/>${notification.locationName || 'Location'}`).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [id, loading, notification]);

  const handleBack = () => {
    navigate("/manager/notifications");
  };

  const handleAction = (action) => {
    const actType = typeof action === 'string' ? action : action?.actionType;
    if (actType === "Dispatch Warning") {
      setShowDispatchWarningModal(true);
    } else if (actType === "Call Driver") {
      setShowContactDriverModal(true);
    } else if (actType === "Track Live") {
      navigate("/manager/map");
    } else if (actType === "View Analytics") {
      navigate("/manager/analytics");
    } else if (actType === "Schedule Now") {
      navigate("/manager/maintenance/tickets");
    } else if (actType === "Manage Subscription" || actType === "View Subscription" || actType === "Upgrade Plan") {
      navigate("/manager/subscription");
    } else if (actType === "Download PDF") {
      toast.success(`Downloading PDF for ${notification.title}...`);
    } else {
      if (isSubscriptionNotification) {
        navigate("/manager/subscription");
      } else {
        toast.success(`${actType || 'Action'} triggered!`);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[300px]">
        <Icon icon="mdi:loading" className="w-8 h-8 animate-spin text-[#B45A0A]" />
      </div>
    );
  }

  if (!notification) return null;

  const locationLabel = getLocationLabel(notification.type);

  return (
    <div className="p-6 lg:p-8 space-y-6 w-full font-nunito">
      <Breadcrumb />
      
      {/* Top Header */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-xl font-poppins font-black text-gray-900 leading-none">Notification Details</h1>
          <p className="text-xs font-semibold text-gray-400 mt-1.5 font-poppins">ID: {notification._id || notification.id}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Main Details Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${getIconColors(notification.type)}`}>
                  <Icon icon={getIconName(notification.type)} className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{notification.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-white rounded-full text-xs font-bold uppercase ${
                      notification.priority === 'high' ? 'bg-red-600' : 
                      notification.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'
                    }`}>
                      {notification.priority} Priority
                    </span>
                    <span className="text-sm text-gray-500">{notification.time || "Just now"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Event Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {notification.description}
              </p>
            </div>

            {/* Stats */}
            {notification.stats && notification.stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                {notification.stats.map((stat, i) => (
                  <div key={i} className="p-4 bg-blue-50 rounded-xl text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">{stat.label}</p>
                    <p className={`text-xl font-extrabold ${stat.isCritical ? 'text-red-600' : 'text-gray-700'}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                {notification.actions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleAction(act.actionType)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all active:scale-95 cursor-pointer ${
                      act.bg === 'bg-white'
                        ? `${act.bg} ${act.text} border ${act.border} hover:bg-gray-50`
                        : `${act.bg} text-white ${act.hover || 'hover:bg-slate-800'}`
                    }`}
                  >
                    {act.actionType === "Call Driver" && <Icon icon="mdi:phone" className="w-5 h-5" />}
                    {act.actionType === "Track Live" && <Icon icon="mdi:map-marker-radius" className="w-5 h-5" />}
                    {act.actionType === "Dispatch Warning" && <Icon icon="mdi:alert-outline" className="w-5 h-5" />}
                    {act.actionType === "View Analytics" && <Icon icon="mdi:chart-line" className="w-5 h-5" />}
                    {act.actionType === "Schedule Now" && <Icon icon="mdi:calendar-clock" className="w-5 h-5" />}
                    {act.actionType === "Download PDF" && <Icon icon="mdi:download" className="w-5 h-5" />}
                    {act.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          {!isSubscriptionNotification && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Icon icon="mdi:map-marker-radius" className="w-5 h-5 text-amber-700" />
                  {locationLabel}
                </h3>
                <span className="text-sm text-gray-500">{notification.locationName}</span>
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
                    onClick={() => mapInstanceRef.current?.setView(coords, 12)}
                    className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                  >
                    <Icon icon="mdi:target-variant" className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        {(notification.vehicle || notification.driver || (notification.recentAlerts && notification.recentAlerts.length > 0)) && (
          <div className="lg:w-80 space-y-6">
            {/* Vehicle Details */}
            {notification.vehicle && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Vehicle Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon icon="mdi:truck" className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{notification.vehicle}</p>
                      <p className="text-xs text-gray-500">{notification.vehicleModel || 'No Model'}</p>
                    </div>
                  </div>
                  {notification.meta && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-gray-500">Total Mileage</span>
                        <span className="text-xs font-medium text-gray-800">{notification.meta?.totalMileage || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-gray-500">Last Service</span>
                        <span className="text-xs font-medium text-gray-800">{notification.meta?.lastService || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-gray-500">Maintenance Health</span>
                        <span className="text-xs font-medium text-amber-700">{notification.meta?.maintenanceHealth || "—"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Driver Details */}
            {notification.driver && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Driver Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      {notification.driver.avatar || notification.driver.name.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{notification.driver.name}</p>
                      <p className="text-xs text-gray-500">Emp ID: {notification.driver.empId}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Daily Drive Time</p>
                      <p className="text-lg font-bold text-gray-800">{notification.driver.driveTime || "—"}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Safety Score</p>
                      <p className="text-lg font-bold text-amber-700">{notification.driver.safetyScore || "—"}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-full py-2 border border-amber-700 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors cursor-pointer bg-transparent"
                  >
                    <Icon icon="mdi:message-text-outline" className="w-4 h-4 inline mr-1" />
                    Message Driver
                  </button>
                </div>
              </div>
            )}

            {/* Recent Alerts */}
            {notification.recentAlerts && notification.recentAlerts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Recent Alerts for {notification.vehicle}</h3>
                <div className="space-y-3">
                  {notification.recentAlerts.map((alert, i) => (
                    <div key={i} className={`p-3 ${i < notification.recentAlerts.length - 1 ? "border-b border-gray-100" : ""}`}>
                      <p className="text-sm font-medium text-gray-800 mb-1">{alert.title}</p>
                      <p className="text-xs text-gray-500">{alert.info}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DriverChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        driverName={notification.driver?.name}
        driverPhone={notification.driver?.phone}
        initialMessages={[
          {
            id: 1,
            sender: "driver",
            text: `Hi, I have received the warning regarding: "${notification.title}".`,
            time: "02:15 PM",
          },
          {
            id: 2,
            sender: "manager",
            text: `Hi ${notification.driver?.name.split(" ")[0]}, please address this immediately.`,
            time: "02:17 PM",
          }
        ]}
      />
      <DispatchWarningModal
        isOpen={showDispatchWarningModal}
        onClose={() => setShowDispatchWarningModal(false)}
        notification={notification.meta}
      />
      <ContactDriverModal
        isOpen={showContactDriverModal}
        onClose={() => setShowContactDriverModal(false)}
        notification={notification.meta}
      />
    </div>
  );
}
