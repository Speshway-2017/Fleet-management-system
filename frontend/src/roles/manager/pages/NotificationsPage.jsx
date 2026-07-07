import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");

  const notifications = [
    {
      id: 1,
      type: "alert",
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
      title: "System Update Complete",
      description: "ELD compliance patches have been successfully pushed to all active vehicles in the fleet.",
      time: "6 hours ago",
      priority: "low",
      actions: []
    }
  ];

  const getIconColor = (type) => {
    switch(type) {
      case 'alert': return 'bg-red-100 text-red-600';
      case 'warning': return 'bg-amber-100 text-amber-700';
      case 'info': return 'bg-blue-100 text-blue-700';
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
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
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
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-700 font-medium">High Priority</span>
                </div>
                <span className="text-2xl font-bold text-red-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-gray-700 font-medium">Medium Priority</span>
                </div>
                <span className="text-2xl font-bold text-orange-700">24</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-700 font-medium">Low Priority</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">48</span>
              </div>
            </div>
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

          {/* Last Critical Location */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative h-48 bg-gray-200">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <div>
                  <p className="text-white font-semibold text-sm">Last Critical Location</p>
                  <p className="text-white/70 text-xs">41.8781° N, 87.6298° W</p>
                </div>
              </div>
              {/* Placeholder for map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon icon="mdi:map-marker-radius" className="w-24 h-24 text-amber-600 opacity-30" />
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
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications */}
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full ${getIconColor(notif.type)} flex items-center justify-center shrink-0`}>
                  <Icon icon={getIcon(notif.type)} className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{notif.title}</h4>
                    <span className="text-xs text-gray-400 font-medium">{notif.time}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{notif.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {notif.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleNotificationClick(notif.id)}
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
          ))}
        </div>
      </div>
    </div>
  );
}
