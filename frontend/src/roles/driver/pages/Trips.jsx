import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import TripCard from "../components/TripCard";
import { useDriverSocket } from "../hooks/useDriverSocket";
import { toast } from "react-hot-toast";
import { Navigation, RefreshCw } from "lucide-react";

export default function DriverTripsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetchTrips();
  }, []);

  useDriverSocket({
    onTripAssigned: () => {
      toast.success("🔔 New Trip Assigned!");
      fetchTrips();
    },
    onTripStatusUpdated: () => fetchTrips(),
    on15MinReminder: (data) => {
      toast.success(data?.message || "🔔 Your trip starts in 15 minutes! Start button is now unlocked.", { duration: 6000 });
      fetchTrips();
    }
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getTrips();
      if (res?.success && Array.isArray(res.data)) {
        setTrips(res.data);
      }
    } catch (err) {
      console.error("Error fetching driver trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (tripId, action) => {
    try {
      const res = await driverApi.respondToTripAssignment(tripId, action);
      if (res?.success) {
        const isAccept = action?.toLowerCase() === "accept" || action?.toLowerCase() === "accepted";
        toast.success(isAccept ? "Trip accepted successfully! Shifted to Upcoming Trips." : "Trip rejected successfully.");
        if (isAccept) {
          setActiveTab("upcoming");
        }
        fetchTrips();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleStatusUpdate = async (tripId, status) => {
    try {
      const res = await driverApi.updateTripStatus(tripId, { status });
      if (res?.success) {
        toast.success(`🚀 Trip started! Shifted to Active Trips.`);
        setActiveTab("active");
        fetchTrips();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    }
  };

  // Filter logic for tabs: Pending, Upcoming, Active, Completed
  const pendingTrips = trips.filter(t => ["ASSIGNED", "PENDING"].includes(t.status?.toUpperCase()));
  const upcomingTrips = trips.filter(t => ["ACCEPTED", "SCHEDULED", "UPCOMING"].includes(t.status?.toUpperCase()));
  const activeTrips = trips.filter(t => ["DISPATCHED", "STARTED", "EN_ROUTE", "IN_TRANSIT", "IN PROGRESS", "ON TRANSIT"].includes(t.status?.toUpperCase()));
  const completedTrips = trips.filter(t => ["DELIVERED", "COMPLETED", "REJECTED", "CANCELLED"].includes(t.status?.toUpperCase()));

  const getDisplayTrips = () => {
    switch (activeTab) {
      case "pending": return pendingTrips;
      case "upcoming": return upcomingTrips;
      case "active": return activeTrips;
      case "completed": return completedTrips;
      default: return trips;
    }
  };

  const filteredTrips = getDisplayTrips();

  const tabs = [
    { key: "all", label: "All Trips", count: trips.length },
    { key: "pending", label: "Pending Response", count: pendingTrips.length, highlight: pendingTrips.length > 0 },
    { key: "upcoming", label: "Upcoming", count: upcomingTrips.length },
    { key: "active", label: "Active", count: activeTrips.length },
    { key: "completed", label: "Completed / History", count: completedTrips.length },
  ];

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-[#B45A0A]" />
            My Trips Management
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Accept pending dispatches, launch upcoming trips, and manage active deliveries.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-poppins whitespace-nowrap transition flex items-center gap-2 ${
              activeTab === tab.key
                ? "bg-amber-50 text-[#B45A0A] border border-amber-200 shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                tab.highlight
                  ? "bg-[#B45A0A] text-white animate-pulse"
                  : activeTab === tab.key
                  ? "bg-amber-100 text-[#B45A0A]"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
        </div>
      ) : filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, idx) => (
            <TripCard
              key={trip._id || trip.id || trip.tripId || `trip-${idx}`}
              trip={trip}
              onRespond={handleRespond}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Navigation className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-800 font-semibold font-poppins text-base">No Trips Found</h3>
          <p className="text-slate-500 text-xs mt-1">There are no trips matching the selected status tab.</p>
        </div>
      )}
    </div>
  );
}

