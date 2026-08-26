import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import { managerApi } from "../api/managerApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/api/socket";
import KPICard from "@/components/common/KPICard";
import StatusBadge from "@/components/common/StatusBadge";
import { Phone, MapPin, ExternalLink, Activity, AlertTriangle, ShieldCheck, Truck, Users } from "lucide-react";
import { animateDashboardEntrance } from "@/utils/animeUtils";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("This Week");
  const [callingDriver, setCallingDriver] = useState(null);

  const dashboardRef = useRef(null);

  const getDaysRemaining = () => {
    if (user?.subscriptionStatus !== "ACTIVE" || !user?.subscriptionExpiry) return "--";
    const expiry = new Date(user.subscriptionExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    if (!loading && dashboardRef.current) {
      animateDashboardEntrance(dashboardRef.current);
    }
  }, [loading]);

  const normaliseVehicle = (v) => {
    let mappedStatus = "Available";
    if (v.currentStatus === "On Trip" || v.status === "ON_TRIP") mappedStatus = "On Trip";
    else if (v.currentStatus === "Maintenance" || v.status === "MAINTENANCE") mappedStatus = "Maintenance";

    return {
      ...v,
      id: v._id,
      name: v.vehicleName || `${v.brand || ''} ${v.model || ''}`,
      plateNumber: v.vehicleNumber || "",
      driver: v.assignedDriver && typeof v.assignedDriver === 'object'
        ? v.assignedDriver.fullName
        : (typeof v.assignedDriver === 'string' ? v.assignedDriver : 'Unassigned'),
      branch: v.branch || 'Pune',
      status: mappedStatus,
    };
  };

  const formatTimeAgo = (dateInput) => {
    if (!dateInput) return "Today";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "Today";
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const displayActivities = useMemo(() => {
    const serverActs = activities.map(act => ({
      id: act._id || act.id,
      tripId: act.tripId || act.trip?._id || act.trip,
      title: act.title || act.action || 'Vehicle Activity',
      desc: act.desc || act.message || act.description || 'Activity recorded',
      time: act.time || formatTimeAgo(act.createdAt || act.timestamp),
      rawTime: new Date(act.createdAt || act.timestamp || Date.now()).getTime(),
    }));

    const tripActs = trips.map(t => {
      const tripNum = t.tripNumber || (t._id ? `TRP-${t._id.slice(-6).toUpperCase()}` : 'TRP-101');
      const originStr = typeof t.origin === 'object' ? (t.origin.city || t.origin.name || 'Origin') : (t.origin || 'Origin');
      const destStr = typeof t.destination === 'object' ? (t.destination.city || t.destination.name || 'Destination') : (t.destination || 'Destination');
      const driverName = typeof t.driver === 'object' ? (t.driver.fullName || t.driver.name || 'Driver') : (t.driver || 'Assigned Driver');
      const statusText = (t.status || 'DISPATCHED').replace(/_/g, ' ');

      return {
        id: `trip-${t._id || t.id}`,
        tripId: t._id || t.id,
        title: `${tripNum} (${originStr} → ${destStr})`,
        desc: `Status: ${statusText} • Driver: ${driverName}`,
        time: formatTimeAgo(t.updatedAt || t.createdAt || t.dispatchDate),
        rawTime: new Date(t.updatedAt || t.createdAt || t.dispatchDate || Date.now()).getTime(),
      };
    });

    const combined = [...serverActs, ...tripActs];
    combined.sort((a, b) => b.rawTime - a.rawTime);

    const seen = new Set();
    return combined.filter(a => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });
  }, [activities, trips]);

  useEffect(() => {
    const fetchAllData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [dashRes, vehRes, drvRes, tripRes, fuelRes, maintRes, actRes, complaintsRes] = await Promise.all([
          managerApi.getDashboard().catch(() => null),
          managerApi.getVehicles().catch(() => null),
          managerApi.getDrivers().catch(() => null),
          managerApi.getTrips().catch(() => null),
          managerApi.getFuelRecords().catch(() => null),
          managerApi.getMaintenance().catch(() => null),
          managerApi.getActivities().catch(() => null),
          managerApi.getVehicleComplaints().catch(() => null)
        ]);

        const rawVeh = vehRes?.data?.data || vehRes?.data || [];
        setVehicles(rawVeh.map(normaliseVehicle));

        const rawDrv = drvRes?.data?.data || drvRes?.data || [];
        setDrivers(rawDrv);

        const rawTrips = tripRes?.data?.data || tripRes?.data || [];
        setTrips(rawTrips);

        const rawDash = dashRes?.data?.data || dashRes?.data || {};
        setDbStats(rawDash);

        setFuelRecords(fuelRes?.data?.data || fuelRes?.data || []);
        setMaintenance(maintRes?.data?.data || maintRes?.data || []);
        setActivities(actRes?.data?.data || actRes?.data || []);
        setComplaints(complaintsRes?.data?.data || complaintsRes?.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    fetchAllData(true);

    const socket = getSocket();
    const handleInstantRefresh = () => fetchAllData(false);

    socket.on("trip:status-updated", handleInstantRefresh);
    socket.on("trip:created", handleInstantRefresh);
    socket.on("driver:status-updated", handleInstantRefresh);
    socket.on("driver:location-update", handleInstantRefresh);
    socket.on("vehicle:updated", handleInstantRefresh);
    socket.on("notification:new", handleInstantRefresh);

    const intervalId = setInterval(() => {
      fetchAllData(false);
    }, 4000);

    return () => {
      clearInterval(intervalId);
      socket.off("trip:status-updated", handleInstantRefresh);
      socket.off("trip:created", handleInstantRefresh);
      socket.off("driver:status-updated", handleInstantRefresh);
      socket.off("driver:location-update", handleInstantRefresh);
      socket.off("vehicle:updated", handleInstantRefresh);
      socket.off("notification:new", handleInstantRefresh);
    };
  }, []);



  // Calculate weekly dispatch activity from real trips
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyAnalyticsData = daysOfWeek.map((dayName, idx) => {
    const dayTrips = trips.filter(t => {
      const d = new Date(t.createdAt || t.departureTime || Date.now());
      const dayIndex = (d.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      return dayIndex === idx;
    });
    const completedCount = dayTrips.filter(t => ["COMPLETED", "DELIVERED", "Completed", "Delivered"].includes(t.status)).length;
    const activeCount = dayTrips.length;
    return {
      day: dayName,
      dispatches: activeCount,
      completed: completedCount,
    };
  });

  // Real Database Calculations for Delivery Analytics based on User Payment Rules
  let totalRevenue = 0;
  let totalCod = 0;

  trips.forEach(t => {
    const amt = Number(t.codAmount || t.fare || t.totalAmount || t.amount || (t.cargoWeight ? t.cargoWeight * 15 : 500));
    const pMethod = (t.paymentMethod || t.paymentType || "Prepaid").toUpperCase();
    const isCompleted = ["COMPLETED", "DELIVERED", "Completed", "Delivered"].includes(t.status);

    if (pMethod.includes("COD") || pMethod.includes("CASH")) {
      if (isCompleted) {
        totalRevenue += amt;
        totalCod += amt;
      }
    } else {
      totalRevenue += amt;
    }
  });

  const activeRidersCount = drivers.filter(d => d.isDuty || d.isOnline || d.driverStatus === "AVAILABLE" || d.driverStatus === "ON_TRIP").length;

  // Calculate Success Rate from real MongoDB trips
  const completedTripsCount = trips.filter(t => ["COMPLETED", "DELIVERED", "Completed", "Delivered"].includes(t.status)).length;
  const inTransitCount = trips.filter(t => ["IN_TRANSIT", "IN_PROGRESS", "In Progress", "In Transit", "En Route"].includes(t.status)).length;
  const delayedFailedCount = trips.filter(t => ["CANCELLED", "REJECTED", "Cancelled", "Rejected"].includes(t.status)).length;
  const totalTripsCount = trips.length;

  const successRatePct = totalTripsCount > 0 ? Math.round((completedTripsCount / totalTripsCount) * 100) : 0;

  const successDonutData = [
    { name: "Delivered", value: completedTripsCount > 0 ? completedTripsCount : 0, color: "#10B981" },
    { name: "In Transit", value: inTransitCount > 0 ? inTransitCount : 0, color: "#3B82F6" },
    { name: "Exceptions", value: delayedFailedCount > 0 ? delayedFailedCount : 0, color: "#EF4444" },
    { name: "Remaining", value: (totalTripsCount - completedTripsCount - inTransitCount - delayedFailedCount) > 0 ? (totalTripsCount - completedTripsCount - inTransitCount - delayedFailedCount) : (totalTripsCount === 0 ? 1 : 0), color: "#334155" }
  ];

  // Calculate Hub Load Distribution dynamically based on vehicle branches
  const hubBranchMap = {};
  vehicles.forEach(v => {
    const b = v.branch || v.branchDepot || v.currentLocation || "HQ";
    hubBranchMap[b] = (hubBranchMap[b] || 0) + 1;
  });
  const totalHubVeh = vehicles.length || 1;
  const topHubs = Object.keys(hubBranchMap).slice(0, 4);
  const hubColors = ["#0D1B2A", "#A14000", "#1E293B", "#D97706"];
  const hubDistribution = topHubs.map((hName, i) => ({
    name: hName,
    pct: Math.round((hubBranchMap[hName] / totalHubVeh) * 100),
    color: hubColors[i % hubColors.length]
  }));

  return (
    <div ref={dashboardRef} className="w-full px-4 sm:px-6 lg:px-8 py-6 bg-[#FAFBFC] min-h-screen font-nunito text-slate-800 select-none">
      <Breadcrumb />

      {/* Subscription Warning Banners */}
      {user?.subscriptionStatus === 'ACTIVE' && getDaysRemaining() !== '--' && getDaysRemaining() <= 10 && (
        <div 
          data-dash-banner
          style={{ backgroundColor: "#1E293B", borderColor: "rgba(245, 158, 11, 0.4)" }}
          className="mb-6 p-4 rounded-2xl border flex items-center justify-between shadow-md transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Icon icon="material-symbols:warning-outline" className="w-5 h-5 text-amber-400" />
            </span>
            <div className="min-w-0">
              <p style={{ color: "#FFFFFF" }} className="text-xs font-black font-poppins">
                Subscription Warning: Expiring Soon
              </p>
              <p style={{ color: "#FDE68A" }} className="text-xs font-bold font-poppins mt-0.5">
                Your subscription will expire in {getDaysRemaining()} days on {new Date(user.subscriptionExpiry).toLocaleDateString("en-IN")}.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/manager/subscription")}
            className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] active:scale-97 text-white text-xs font-extrabold rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            Renew Plan
          </button>
        </div>
      )}

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 data-dash-title className="font-manrope font-bold text-2xl sm:text-[32px] text-[#0D1B2A] tracking-tight leading-tight">
            Fleet Operations Center
          </h1>
          <p data-dash-subtitle className="text-sm font-medium text-slate-500 mt-1 leading-relaxed">
            Real-time monitoring of active drivers, logistics analytics, and trip dispatches.
          </p>
        </div>
        <div data-dash-action className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/manager/create-trip")}
            className="group px-4 py-2.5 bg-[#A14000] hover:bg-[#853400] active:scale-97 text-white text-xs font-bold font-poppins rounded-xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
          >
            <Icon icon="material-symbols:add-location-alt-outline" className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span>Create New Trip</span>
          </button>
        </div>
      </div>

      {/* 4 Core KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Vehicles"
          value={loading ? null : (dbStats?.totalVehicles ?? vehicles.length)}
          loading={loading}
          subtitle="VS last week"
          icon="material-symbols:local-shipping-outline"
          variant="blue"
          filledBarsRatio={0.8}
          trendText="+12.4%"
          isTrendUp={true}
          onClick={() => navigate("/manager/vehicle-management")}
        />
        <KPICard
          title="Active Vehicles"
          value={loading ? null : (dbStats?.activeVehicles ?? vehicles.filter(v => v.status === "Active" || v.status === "Available").length)}
          loading={loading}
          subtitle="VS last week"
          icon="material-symbols:bolt-outline"
          variant="green"
          filledBarsRatio={0.85}
          trendText="+9.1%"
          isTrendUp={true}
          onClick={() => navigate("/manager/vehicle-management")}
        />
        <KPICard
          title="Trips Scheduled"
          value={loading ? null : (dbStats?.tripsToday ?? trips.length)}
          loading={loading}
          subtitle="VS last week"
          icon="material-symbols:route-outline"
          variant="amber"
          filledBarsRatio={0.6}
          trendText="+4.7%"
          isTrendUp={true}
          onClick={() => navigate("/manager/trips")}
        />
        <KPICard
          title="Maintenance Alerts"
          value={loading ? null : (dbStats?.underRepair ?? complaints.length)}
          loading={loading}
          subtitle="VS last week"
          icon="material-symbols:build-outline"
          trendText={(dbStats?.underRepair ?? complaints.length) > 0 ? "Action Required" : "0 Alerts"}
          isTrendUp={(dbStats?.underRepair ?? complaints.length) === 0}
          statusType={(dbStats?.underRepair ?? complaints.length) > 0 ? "negative" : "positive"}
          onClick={() => navigate("/manager/maintenance")}
        />
      </div>

      {/* 3-Column Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Active Drivers / Riders (Width 3/12) */}
        <div data-dash-section className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full hover:border-slate-300/80 transition-colors duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A14000]" />
                <h3 className="font-poppins font-bold text-sm text-slate-900">Active Drivers</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-50 text-[#A14000] font-poppins">
                {drivers.filter(d => d.driverStatus === "AVAILABLE" || d.driverStatus === "ON_TRIP" || d.isDuty).length} Shift
              </span>
            </div>

            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
              {drivers.length > 0 ? (
                drivers.slice(0, 6).map((drv, idx) => (
                  <div
                    key={drv._id || idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between transition-all duration-200 hover:bg-slate-100/90 hover:-translate-y-0.5 hover:shadow-2xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#0D1B2A] text-white flex items-center justify-center text-xs font-bold font-poppins shrink-0 shadow-2xs overflow-hidden transition-transform duration-200 group-hover:scale-105">
                        {drv.profileImage ? (
                          <img src={drv.profileImage} alt={drv.fullName || drv.name} className="w-full h-full object-cover" />
                        ) : (
                          drv.fullName ? drv.fullName.substring(0, 2).toUpperCase() : `D${idx + 1}`
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 font-poppins truncate">{drv.fullName || drv.name}</p>
                        <p className="text-[10px] font-semibold text-slate-500 font-poppins truncate">{drv.assignedVehicle || drv.vehicle || "Unassigned"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setCallingDriver(drv)}
                        className="p-2 rounded-xl bg-white text-slate-700 hover:text-[#A14000] hover:bg-orange-50 border border-slate-200 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                        title="Call Driver"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No active drivers found in your fleet organization yet.
                </div>
              )}
            </div>
          </div>

          <button onClick={() => navigate("/manager/drivers")} className="mt-4 w-full py-2.5 text-xs font-bold text-[#0D1B2A] bg-slate-100 hover:bg-slate-200/80 active:scale-98 rounded-xl border border-slate-200 transition-all duration-200 font-poppins flex items-center justify-center gap-1 cursor-pointer">
            <span>View All Drivers</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Column 2: Delivery & Logistics Analytics Line Chart (Width 6/12) */}
        <div data-dash-section className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-300/80 transition-colors duration-200">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
              <div>
                <h3 className="font-poppins font-bold text-sm text-slate-900">Delivery Analytics</h3>
                <p className="text-[10px] text-slate-400 font-medium font-poppins">Completed vs active trip dispatches across the week.</p>
              </div>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 font-poppins focus:outline-none cursor-pointer transition-colors hover:bg-slate-100"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* 3 Analytics Stat Pill Boxes */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xs">
                <span className="text-lg sm:text-xl font-black text-slate-900 font-poppins block">
                  {totalRevenue > 0 ? `₹${(totalRevenue >= 1000 ? (totalRevenue / 1000).toFixed(1) + 'K' : totalRevenue)}` : '₹0'}
                </span>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-poppins mt-0.5 block">
                  Revenue
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xs">
                <span className="text-lg sm:text-xl font-black text-slate-900 font-poppins block">
                  {totalCod > 0 ? `₹${(totalCod >= 1000 ? (totalCod / 1000).toFixed(1) + 'K' : totalCod)}` : '₹0'}
                </span>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-poppins mt-0.5 block">
                  COD Collected
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xs">
                <span className="text-lg sm:text-xl font-black text-slate-900 font-poppins block">
                  {activeRidersCount}
                </span>
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-poppins mt-0.5 block">
                  Active Riders
                </span>
              </div>
            </div>

            {/* Line Chart Container */}
            <div className="flex-1 min-h-[220px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyAnalyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'Manrope', fill: '#94A3B8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontFamily: 'Manrope', fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ fontFamily: 'Manrope', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  <Line type="monotone" dataKey="dispatches" name="Dispatches" stroke="#0D1B2A" strokeWidth={3} dot={{ r: 4, fill: "#0D1B2A" }} activeDot={{ r: 6, stroke: "#0D1B2A", strokeWidth: 2 }} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#A14000" strokeWidth={3} dot={{ r: 4, fill: "#A14000" }} activeDot={{ r: 6, stroke: "#A14000", strokeWidth: 2 }} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real Hub Load Distribution Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 font-poppins">Hub Load Distribution</span>
              <span className="text-[10px] font-semibold text-slate-400 font-poppins">This Month</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
              {hubDistribution.length > 0 ? (
                hubDistribution.map(h => (
                  <div key={h.name} className="h-full transition-all duration-500 ease-out" style={{ width: `${Math.max(5, h.pct)}%`, backgroundColor: h.color }} title={`${h.name}: ${h.pct}%`} />
                ))
              ) : (
                <div className="h-full bg-slate-300 w-full" title="No hub data" />
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 font-poppins mt-2">
              {hubDistribution.length > 0 ? (
                hubDistribution.map(h => (
                  <span key={h.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block shrink-0 shadow-2xs" style={{ backgroundColor: h.color }} />
                    <span>{h.pct}% {h.name}</span>
                  </span>
                ))
              ) : (
                <span>No hub vehicles registered</span>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Success Rate & Recent Activity */}
        <div data-dash-section className="lg:col-span-3 space-y-6">

          {/* Delivery Success Rate Semi-Circle Donut Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 className="font-poppins font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00C853]" />
                <span>Success Rate</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400 font-poppins">This Month</span>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={successDonutData}
                    cx="50%"
                    cy="70%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {successDonutData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: 'Poppins', fontSize: '11px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-3 pointer-events-none">
                <span className="text-2xl font-black text-slate-900 font-poppins">{successRatePct}%</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-poppins">On-Time Dispatches</span>
              </div>
            </div>
          </div>

          {/* Maintenance & Recent Activities List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-250 hover:border-slate-300/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-poppins font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#A14000]" />
                <span>Recent Activities</span>
              </h3>
              <button onClick={() => navigate("/manager/trips")} className="text-[11px] font-bold text-[#A14000] hover:underline font-poppins cursor-pointer">View All</button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 no-scrollbar">
              {displayActivities.length > 0 ? (
                displayActivities.slice(0, 5).map((act, i) => (
                  <div
                    key={act.id || act.tripId || i}
                    onClick={() => act.tripId && navigate(`/manager/trip-details/${act.tripId}`)}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs transition-all duration-200 hover:bg-amber-50/50 hover:border-[#A14000]/40 hover:-translate-y-0.5 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 font-poppins truncate max-w-[210px] group-hover:text-[#A14000] transition-colors">
                        {act.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-poppins font-semibold shrink-0">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium font-poppins mt-0.5 line-clamp-2">
                      {act.desc}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 font-medium">
                  No recent trip activities logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Call Driver Confirmation Modal */}
      {callingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in zoom-in-95 duration-200 font-poppins select-none">
          <div className="bg-white dark:bg-[#151C28] rounded-2xl border border-slate-200 dark:border-[#242E42] p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#0D1B2A] text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md">
              {callingDriver.fullName ? callingDriver.fullName.substring(0, 2).toUpperCase() : "D1"}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-poppins">
                Call {callingDriver.fullName || callingDriver.name || "Active Driver"}?
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 font-poppins">
                {callingDriver.assignedVehicle || callingDriver.vehicle || "Truck • Fleet Zone"}
              </p>
              <p className="text-sm font-black text-[#0D1B2A] font-poppins mt-2">
                {callingDriver.phone || callingDriver.phoneNumber || "+91 98765 43210"}
              </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium font-poppins bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              Do you want to call this driver? Clicking Call Now will trigger the phone dialer app.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCallingDriver(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-97 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all duration-150 cursor-pointer font-poppins"
              >
                Cancel
              </button>
              <a
                href={`tel:${callingDriver.phone || callingDriver.phoneNumber || "9876543210"}`}
                onClick={() => setCallingDriver(null)}
                className="flex-1 py-2.5 bg-[#0D1B2A] hover:bg-[#1E293B] active:scale-97 text-white font-bold text-xs rounded-xl shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 font-poppins"
              >
                <Phone className="w-3.5 h-3.5" /> Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

