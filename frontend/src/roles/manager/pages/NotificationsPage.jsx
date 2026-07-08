import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import DispatchWarningModal from "@/components/common/DispatchWarningModal";
import ContactDriverModal from "@/components/common/ContactDriverModal";
import { notifications } from "@/roles/manager/data/notificationsData";

const mapTypeToTab = (type) => {
  if (type === "alert")  return "Critical";
  if (type === "info")   return "Maintenance";
  if (type === "system") return "System";
  return "All";
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All");
  const [showDispatchWarningModal, setShowDispatchWarningModal] = useState(false);
  const [showContactDriverModal, setShowContactDriverModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadNotifs, setUnreadNotifs] = useState(new Set([1, 2, 3]));

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

  const handleMarkAllAsRead = () => {
    setUnreadNotifs(new Set());
    toast.success("All notifications marked as read!");
  };

  const handleActionClick = (action, notification, e) => {
    e.stopPropagation();
    
    // Mark as read
    setUnreadNotifs(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });

    if (action.actionType === "modal") {
      if (action.modalType === "dispatch") {
        setSelectedNotification(notification);
        setShowDispatchWarningModal(true);
      } else if (action.modalType === "contact") {
        setSelectedNotification(notification);
        setShowContactDriverModal(true);
      }
    } else if (action.actionType === "navigate") {
      // Show loading feedback
      if (action.route === "/manager/reports") {
        toast.success("Fuel Report Opened");
      } else if (action.route === "/manager/maintenance") {
        toast.success("Maintenance Scheduled");
      }
      
      navigate(action.route, action.state ? { state: action.state } : undefined);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    setUnreadNotifs(prev => {
      const newSet = new Set(prev);
      newSet.delete(notification.id);
      return newSet;
    });

    // Update active tab to match the notification's category
    setActiveTab(mapTypeToTab(notification.type));

    navigate(`/manager/notifications/${notification.id}`);
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
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer"
          >
            <Icon icon="mdi:check-all" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="whitespace-nowrap">Mark all as read</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto cursor-pointer">
            <Icon icon="mdi:cog-outline" className="w-5 h-5" />
            Notification Settings
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
                <span className="text-xl sm:text-2xl font-bold text-red-600">12</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Medium Priority</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-orange-700">24</span>
              </div>
              <div className="flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Low Priority</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-blue-700">48</span>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="bg-black rounded-2xl p-4 sm:p-6 shadow-sm">
            <h3 className="text-gray-300 font-medium mb-3 sm:mb-4 text-sm sm:text-base">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              {['Last 24h', 'Fleet A-J', 'Fuel Usage', 'Night Shift', 'Geofence'].map((tag, i) => (
                <button key={i} className="px-2.5 sm:px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Last Critical Location - Hidden on mobile */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
          <div className="flex items-center gap-1 sm:gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full overflow-x-auto">
            {['All', 'Critical', 'Maintenance', 'System'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications */}

                  </div>
                </div>
              );
            });
          })()}
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
