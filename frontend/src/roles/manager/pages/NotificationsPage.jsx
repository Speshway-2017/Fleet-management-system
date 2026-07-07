import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState(null);

  // Leaflet map refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
    }).setView([41.8781, -87.6298], 13);

    // CartoDB Positron — clean light/grayscale tiles, professional look
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Pulsing red marker for critical incident location
    const redIcon = L.divIcon({
      html: `
        <div style="position:relative;width:20px;height:20px;">
          <div style="
            position:absolute;inset:0;
            background:rgba(239,68,68,0.25);
            border-radius:50%;
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;top:3px;left:3px;
            width:14px;height:14px;
            background:#EF4444;
            border:2px solid white;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(239,68,68,0.6);
          "></div>
        </div>
        <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0}}</style>
      `,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([41.8781, -87.6298], { icon: redIcon })
      .addTo(map);

    // Draw a small route line around the incident
    L.polyline([
      [41.870, -87.640],
      [41.878, -87.630],
      [41.885, -87.620],
    ], {
      color: "#B45A0A",
      weight: 3,
      opacity: 0.8,
      dashArray: "6, 6",
    }).addTo(map);

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const notifications = [
    {
      id: 1,
      type: "alert",
      tab: "Critical",
      title: "Critical Overspeeding Alert",
      description: "Vehicle #TRK-8821 detected traveling at 95 mph in a 65 mph zone on I-90 Expressway. Immediate intervention recommended.",
      time: "2 mins ago",
      priority: "high",
      actions: [
        { label: "Dispatch Warning", bg: "bg-red-600", hover: "hover:bg-red-700" },
        { label: "View Analytics", bg: "bg-white", text: "text-gray-700", border: "border-gray-300" }
      ]
    },
    {
      id: 2,
      type: "warning",
      tab: "Critical",
      title: "Geofence Violation",
      description: "Driver Marcus Read has exited the designated delivery zone for the Northeast region. Route optimization required.",
      time: "15 mins ago",
      priority: "medium",
      actions: [
        { label: "Call Driver", bg: "bg-amber-700", hover: "hover:bg-amber-800" },
        { label: "Track Live", bg: "bg-white", text: "text-gray-700", border: "border-gray-300" }
      ]
    },
    {
      id: 3,
      type: "info",
      tab: "Maintenance",
      title: "Maintenance Required",
      description: "Vehicle #VAN-402 scheduled for brake pad replacement in 150 miles. Currently active on trip #4492.",
      time: "1 hour ago",
      priority: "medium",
      actions: [
        { label: "Schedule Now", bg: "bg-amber-700", hover: "hover:bg-amber-800" }
      ]
    },
    {
      id: 4,
      type: "success",
      tab: "System",
      title: "Fuel Report Ready",
      description: "Weekly fuel efficiency report for the Southern Fleet has been generated and is ready for review.",
      time: "3 hours ago",
      priority: "low",
      actions: [
        { label: "Download PDF", bg: "bg-black", hover: "hover:bg-gray-800" }
      ]
    },
    {
      id: 5,
      type: "system",
      tab: "System",
      title: "System Update Complete",
      description: "ELD compliance patches have been successfully pushed to all active vehicles in the fleet.",
      time: "6 hours ago",
      priority: "low",
      actions: []
    },
    {
      id: 6,
      type: "alert",
      tab: "Critical",
      title: "Hard Braking Event Detected",
      description: "Driver Amit Sharma performed an abrupt stop on NH-48 near Khopoli. Safety score has been updated.",
      time: "45 mins ago",
      priority: "high",
      actions: [
        { label: "Call Driver", bg: "bg-amber-700", hover: "hover:bg-amber-800" },
        { label: "View Analytics", bg: "bg-white", text: "text-gray-700", border: "border-gray-300" }
      ]
    },
    {
      id: 7,
      type: "info",
      tab: "Maintenance",
      title: "Oil Change Due",
      description: "Vehicle #TRK-1102 is overdue for engine oil change by 800 km. Service scheduling recommended.",
      time: "2 hours ago",
      priority: "medium",
      actions: [
        { label: "Schedule Now", bg: "bg-amber-700", hover: "hover:bg-amber-800" }
      ]
    },
    {
      id: 8,
      type: "info",
      tab: "Maintenance",
      title: "Tyre Pressure Alert",
      description: "Front left tyre pressure on Vehicle #VAN-311 dropped to 28 PSI. Recommended level is 35 PSI.",
      time: "3 hours ago",
      priority: "medium",
      actions: [
        { label: "Schedule Now", bg: "bg-amber-700", hover: "hover:bg-amber-800" },
        { label: "Track Live", bg: "bg-white", text: "text-gray-700", border: "border-gray-300" }
      ]
    },
    {
      id: 9,
      type: "system",
      tab: "System",
      title: "ELD Device Disconnected",
      description: "Electronic Logging Device on Vehicle #TRK-5542 went offline. Reconnection attempt in progress.",
      time: "4 hours ago",
      priority: "high",
      actions: [
        { label: "Track Live", bg: "bg-white", text: "text-gray-700", border: "border-gray-300" }
      ]
    },
    {
      id: 10,
      type: "warning",
      tab: "Critical",
      title: "Driver Fatigue Warning",
      description: "Driver Vijay Kumar has been on duty for 9+ hours without a break. Regulatory rest period required.",
      time: "5 hours ago",
      priority: "high",
      actions: [
        { label: "Call Driver", bg: "bg-amber-700", hover: "hover:bg-amber-800" },
        { label: "Dispatch Warning", bg: "bg-red-600", hover: "hover:bg-red-700" }
      ]
    }
  ];

  const getIconColor = (type) => {
    switch(type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'info': return 'bg-amber-100 text-amber-700';
      case 'success': return 'bg-green-100 text-green-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return 'mdi:alert-octagon';
      case 'warning': return 'mdi:alert-circle';
      case 'info': return 'mdi:information';
      case 'success': return 'mdi:check-circle';
      case 'system': return 'mdi:cloud-sync';
      default: return 'mdi:bell';
    }
  };

  const handleMarkAllAsRead = () => {
    toast.success("All notifications marked as read!");
  };

  const handleNotificationClick = (id) => {
    navigate(`/manager/notifications/${id}`);
  };

  const handleActionClick = (e, label, notif) => {
    e.stopPropagation();
    switch (label) {
      case "Track Live":
        navigate("/manager/map", { state: { vehicleId: notif.id, fromNotifications: true } });
        break;
      case "Call Driver":
        navigate("/manager/driver-profile/1", { state: { notificationId: notif.id } });
        break;
      case "Schedule Now":
        navigate("/manager/maintenance/schedule", { state: { notificationId: notif.id, fromNotifications: true } });
        break;
      case "Download PDF":
        toast.success("Downloading fuel efficiency report PDF...");
        break;
      case "Dispatch Warning":
        toast.success("Warning dispatched to driver!");
        break;
      case "View Analytics":
        navigate("/manager/analytics", { state: { vehicleId: notif.id } });
        break;
      default:
        navigate(`/manager/notifications/${notif.id}`);
    }
  };

  const handlePriorityClick = (priority) => {
    // Toggle: clicking same priority again clears it
    setPriorityFilter(prev => prev === priority ? null : priority);
    setActiveTab("All");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setPriorityFilter(null);
  };

  // Apply tab + priority filters
  const filteredNotifications = notifications.filter(n => {
    const tabMatch = activeTab === "All" || n.tab === activeTab;
    const priorityMatch = !priorityFilter || n.priority === priorityFilter;
    return tabMatch && priorityMatch;
  });

  // Counts per priority
  const highCount = notifications.filter(n => n.priority === "high").length;
  const mediumCount = notifications.filter(n => n.priority === "medium").length;
  const lowCount = notifications.filter(n => n.priority === "low").length;

  // Count per tab
  const tabCounts = {
    All: notifications.length,
    Critical: notifications.filter(n => n.tab === "Critical").length,
    Maintenance: notifications.filter(n => n.tab === "Maintenance").length,
    System: notifications.filter(n => n.tab === "System").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications Center</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <Icon icon="mdi:check-all" className="w-5 h-5" />
            Mark all as read
          </button>
          <button
            onClick={() => navigate("/manager/settings")}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:cog-outline" className="w-5 h-5" />
            Notification Settings
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="lg:w-80 space-y-6">
          {/* Alert Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-gray-500 font-medium mb-4">Alert Overview</h3>
            <div className="space-y-3">
              <button
                onClick={() => handlePriorityClick("high")}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  priorityFilter === "high" ? "bg-red-100 ring-2 ring-red-400" : "bg-red-50 hover:bg-red-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-700 font-medium">High Priority</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{highCount}</span>
              </button>
              <button
                onClick={() => handlePriorityClick("medium")}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  priorityFilter === "medium" ? "bg-amber-100 ring-2 ring-amber-500" : "bg-amber-50 hover:bg-amber-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-700" />
                  <span className="text-gray-700 font-medium">Medium Priority</span>
                </div>
                <span className="text-2xl font-bold text-amber-700">{mediumCount}</span>
              </button>
              <button
                onClick={() => handlePriorityClick("low")}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  priorityFilter === "low" ? "bg-blue-100 ring-2 ring-blue-400" : "bg-blue-50 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-700 font-medium">Low Priority</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">{lowCount}</span>
              </button>
            </div>
            {priorityFilter && (
              <button
                onClick={() => setPriorityFilter(null)}
                className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
              >
                <Icon icon="mdi:close-circle-outline" className="w-3.5 h-3.5" />
                Clear filter
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="bg-black rounded-2xl p-6 shadow-sm">
            <h3 className="text-gray-300 font-medium mb-4">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              {['Last 24h', 'Fleet A-J', 'Fuel Usage', 'Night Shift', 'Geofence'].map((tag, i) => (
                <button key={i} className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Last Critical Location — Leaflet Map */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative h-48">
              <div ref={mapRef} className="w-full h-full" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
                <p className="text-white font-semibold text-sm">Last Critical Location</p>
                <p className="text-white/70 text-xs">41.8781° N, 87.6298° W</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications List */}
        <div className="flex-1 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit">
            {['All', 'Critical', 'Maintenance', 'System'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? "bg-amber-100 text-amber-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? "bg-amber-200 text-amber-800" : "bg-gray-100 text-gray-500"
                }`}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Active filter indicator */}
          {priorityFilter && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Icon icon="mdi:filter" className="w-3.5 h-3.5" />
              Showing{" "}
              <span className={`font-bold ${
                priorityFilter === "high" ? "text-red-600" :
                priorityFilter === "medium" ? "text-amber-700" : "text-blue-600"
              }`}>
                {priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)} Priority
              </span>{" "}
              notifications ({filteredNotifications.length})
            </div>
          )}

          {/* Notifications */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <Icon icon="mdi:bell-off-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No notifications in this category</p>
              <p className="text-gray-400 text-sm mt-1">Try selecting a different tab or filter</p>
              {(activeTab !== "All" || priorityFilter) && (
                <button
                  onClick={() => { setActiveTab("All"); setPriorityFilter(null); }}
                  className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id)}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full ${getIconColor(notif.type)} flex items-center justify-center shrink-0`}>
                    <Icon icon={getIcon(notif.type)} className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                          notif.priority === "high" ? "bg-red-100 text-red-600" :
                          notif.priority === "medium" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-600"
                        }`}>
                          {notif.priority}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium shrink-0 ml-2">{notif.time}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{notif.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {notif.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={(e) => handleActionClick(e, action.label, notif)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            action.bg === 'bg-white'
                              ? `${action.bg} ${action.text} border ${action.border} hover:bg-gray-50`
                              : `${action.bg} text-white ${action.hover}`
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
    </div>
  );
}
