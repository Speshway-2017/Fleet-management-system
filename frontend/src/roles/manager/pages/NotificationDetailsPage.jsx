import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import L from "leaflet";
import DriverChatDrawer from "@/components/common/DriverChatDrawer";
import { mockNotifications } from "@/data/mockNotifications";

export default function NotificationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const notification = mockNotifications.find(n => n.id === parseInt(id)) || mockNotifications[0];

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const coords = notification.coords || [18.7508, 73.4218];

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

    L.marker(coords, { icon: pinIcon }).bindPopup(`<strong>Violation Location</strong><br/>${notification.locationName}`).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [id]);

  const handleBack = () => {
    navigate("/manager/notifications");
  };

  const handleAction = (action) => {
    toast.success(`${action} action triggered!`);
  };

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
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${notification.bgClass}`}>
                  <Icon icon={notification.iconName} className="w-8 h-8" />
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

            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Event Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {notification.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {notification.stats.map((stat, i) => (
                <div key={i} className="p-4 bg-blue-50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">{stat.label}</p>
                  <p className={`text-xl font-extrabold ${stat.isCritical ? 'text-red-600' : 'text-gray-700'}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
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
          </div>

          {/* Violation Location */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:map-marker-radius" className="w-5 h-5 text-amber-700" />
                Violation Location
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
                  onClick={() => mapInstanceRef.current?.setView(notification.coords, 12)}
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
                  <p className="font-semibold text-gray-800">{notification.vehicle}</p>
                  <p className="text-xs text-gray-500">{notification.vehicleModel}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Total Mileage</span>
                  <span className="text-xs font-medium text-gray-800">42,850 mi</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Last Service</span>
                  <span className="text-xs font-medium text-gray-800">12 Oct 2025</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Maintenance Health</span>
                  <span className="text-xs font-medium text-amber-700">Good</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Driver Details</h3>
              <button className="text-xs font-medium text-amber-700 hover:underline">View History</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {notification.driver.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{notification.driver.name}</p>
                  <p className="text-xs text-gray-500">Emp ID: {notification.driver.empId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Daily Drive Time</p>
                  <p className="text-lg font-bold text-gray-800">{notification.driver.driveTime}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Safety Score</p>
                  <p className="text-lg font-bold text-amber-700">{notification.driver.safetyScore}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-full py-2 border border-amber-700 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <Icon icon="mdi:message-text-outline" className="w-4 h-4 inline mr-1" />
                Message Driver
              </button>
            </div>
          </div>

          {/* Recent Alerts */}
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
        </div>
      </div>

      <DriverChatDrawer 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        driverName={notification.driver.name}
        driverPhone={notification.driver.phone}
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
            text: `Hi ${notification.driver.name.split(" ")[0]}, please address this immediately.`,
            time: "02:17 PM",
          }
        ]}
      />
    </div>
  );
}
