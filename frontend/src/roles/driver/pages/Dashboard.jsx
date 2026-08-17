import { useState, useEffect } from "react";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";
import { Link } from "react-router-dom";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import KPICard from "@/components/common/KPICard";
import TripCard from "../components/TripCard";
import VehicleCard from "../components/VehicleCard";
import NotificationCard from "../components/NotificationCard";
import { useDriverSocket } from "../hooks/useDriverSocket";
import { toast } from "react-hot-toast";
import {
  Navigation,
  Truck,
  Fuel,
  Wrench,
  Bell,
  CheckCircle2,
  Clock,
  Headphones,
  Calendar,
  RefreshCw
} from "lucide-react";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Socket updates
  useDriverSocket({
    onTripAssigned: () => {
      toast.success("New Trip Assigned!");
      fetchData();
    },
    onTripStatusUpdated: () => {
      fetchData();
    },
    onNotification: (newNotif) => {
      toast(newNotif.title || "New Notification", { icon: "🔔" });
      fetchData();
    }
  });

  const [driverProfile, setDriverProfile] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, vehRes, tripRes, notifRes, profRes] = await Promise.allSettled([
        driverApi.getDashboard(),
        driverApi.getAssignedVehicle(),
        driverApi.getCurrentTrip(),
        driverApi.getNotifications(),
        driverApi.getProfile()
      ]);

      if (profRes.status === "fulfilled" && profRes.value?.success) {
        setDriverProfile(profRes.value.data);
      }

      if (dashRes.status === "fulfilled" && dashRes.value?.success) {
        setDashboardData(dashRes.value.data);
      }

      if (vehRes.status === "fulfilled" && vehRes.value?.success) {
        const rawVeh = vehRes.value.data;
        setAssignedVehicle(rawVeh?.vehicle || (rawVeh?.registrationNumber ? rawVeh : null));
      }

      if (tripRes.status === "fulfilled" && tripRes.value?.success) {
        setCurrentTrip(tripRes.value.data);
      }

      if (notifRes.status === "fulfilled" && notifRes.value?.success) {
        setRecentNotifications(Array.isArray(notifRes.value.data) ? notifRes.value.data.slice(0, 4) : []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleTripRespond = async (tripId, status) => {
    try {
      const res = await driverApi.respondToTripAssignment(tripId, status);
      if (res?.success) {
        toast.success(`Trip ${status.toLowerCase()} successfully`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond to trip");
    }
  };

  const handleTripStatusUpdate = async (tripId, newStatus) => {
    try {
      const res = await driverApi.updateTripStatus(tripId, { status: newStatus });
      if (res?.success) {
        toast.success(`Trip status updated to ${newStatus}`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update trip status");
    }
  };

  const handleMarkNotifRead = async (id) => {
    try {
      const res = await driverApi.markNotificationRead(id);
      if (res?.success) {
        setRecentNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };



  const driverName = driverProfile?.fullName || driverProfile?.name || user?.fullName || user?.name || dashboardData?.driver?.fullName || dashboardData?.driver?.name || (user?.email ? user.email.split('@')[0] : "Driver");
  const stats = dashboardData?.stats || dashboardData || {};

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Top Banner Greeting & Quick Summary */}
      <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200/80 text-slate-800 shadow-2xs relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#A14000]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#A14000] text-xs font-bold font-poppins uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold font-poppins text-slate-900 mt-2">
              {getTimeGreeting()}, <span className="text-[#A14000]">{driverName}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Here is your shift status, assigned vehicle, and trip overview for today.
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/driver/fuel"
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold font-poppins rounded-xl flex items-center gap-2 transition"
            >
              <Fuel className="w-4 h-4 text-amber-600" />
              <span>Log Fuel</span>
            </Link>
            <Link
              to="/driver/maintenance"
              className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold font-poppins rounded-xl flex items-center gap-2 transition"
            >
              <Wrench className="w-4 h-4 text-rose-600" />
              <span>Raise Issue</span>
            </Link>
            <Link
              to="/driver/support"
              className="px-4 py-2.5 bg-[#A14000] hover:bg-[#853400] text-white text-xs font-bold font-poppins rounded-xl flex items-center gap-2 transition shadow-xs"
            >
              <Headphones className="w-4 h-4" />
              <span>Contact Dispatcher</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards with KPICard Capsule Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Active & Scheduled Trips"
          value={loading ? null : (stats.activeTrips ?? stats.upcomingTrips ?? (currentTrip ? 1 : 0))}
          loading={loading}
          subtitle="Assigned to your queue"
          icon="material-symbols:route-outline"
          variant="amber"
          filledBarsRatio={0.7}
        />
        <KPICard
          title="Completed Trips"
          value={loading ? null : (stats.completedTrips ?? 0)}
          loading={loading}
          subtitle="Lifetime completed"
          icon="material-symbols:check-circle-outline"
          variant="green"
          filledBarsRatio={0.85}
        />
        <KPICard
          title="Assigned Vehicle"
          value={loading ? null : (assignedVehicle?.registrationNumber || assignedVehicle?.vehicleNumber || "Unassigned")}
          loading={loading}
          subtitle={[assignedVehicle?.brand || assignedVehicle?.make, assignedVehicle?.model].filter(Boolean).join(" ") || (assignedVehicle ? "Assigned Vehicle" : "No Vehicle")}
          icon="material-symbols:local-shipping-outline"
          variant="blue"
          filledBarsRatio={assignedVehicle ? 0.9 : 0}
        />
        <KPICard
          title="Pending Notifications"
          value={loading ? null : recentNotifications.filter(n => !n.isRead).length}
          loading={loading}
          subtitle="Requires attention"
          icon="material-symbols:notifications-outline"
          variant="rose"
          filledBarsRatio={recentNotifications.filter(n => !n.isRead).length > 0 ? 0.6 : 0}
        />
      </div>

      {/* Main Grid: Current Trip + Assigned Vehicle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Current Active / Assigned Trip */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#A14000]" />
              Current Trip Focus
            </h2>
            <Link to="/driver/trips" className="text-xs font-semibold font-poppins text-[#A14000] dark:text-amber-400 hover:underline">
              View All Trips →
            </Link>
          </div>

          {currentTrip ? (
            <TripCard
              trip={currentTrip}
              onRespond={handleTripRespond}
              onStatusUpdate={handleTripStatusUpdate}
            />
          ) : (
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
              <Clock className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
              <h3 className="text-slate-800 dark:text-white font-bold font-poppins text-base">No Active Trip Right Now</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-md mx-auto">
                You currently have no active or pending trips assigned. New trip dispatches will appear here automatically in real-time.
              </p>
            </div>
          )}

          {/* Recent Notifications */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#A14000]" />
                Recent Notifications
              </h2>
              <Link to="/driver/notifications" className="text-xs font-semibold font-poppins text-[#A14000] dark:text-amber-400 hover:underline">
                View Inbox →
              </Link>
            </div>

            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map((notif) => (
                  <NotificationCard
                    key={notif._id || notif.id}
                    notification={notif}
                    onMarkRead={handleMarkNotifRead}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm">
                <p className="text-slate-500 dark:text-slate-400 text-xs">No recent notifications</p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Assigned Vehicle Details */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#A14000]" />
            Assigned Vehicle
          </h2>
          <VehicleCard vehicle={assignedVehicle} />
        </div>
      </div>
    </div>
  );
}
