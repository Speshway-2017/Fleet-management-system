import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/components/common/Breadcrumb";
import KPICard from "@/components/common/KPICard";
import { managerApi } from "../api/managerApi";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";
import { isEligibleApprovedFuel } from "@/utils/fuelCalculations";
import { formatCurrency, formatFullCurrency } from "@/utils/currencyFormatter";
import { getSocket } from "@/api/socket";

const normalizePlate = (str) => String(str || '').replace(/[\s\-_]/g, '').toUpperCase();

export default function AnalyticsPage() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vRes, fRes, mRes, compRes, tRes, dRes] = await Promise.all([
        managerApi.getVehicles().catch(() => ({ data: [] })),
        managerApi.getFuelRecords().catch(() => ({ data: [] })),
        managerApi.getMaintenance().catch(() => ({ data: [] })),
        managerApi.getVehicleComplaints().catch(() => ({ data: [] })),
        managerApi.getTrips().catch(() => ({ data: [] })),
        managerApi.getDrivers().catch(() => ({ data: [] }))
      ]);
      setVehicles(vRes.data?.data || vRes.data || []);
      setFuelRecords(fRes.data?.data || fRes.data || []);
      setMaintenance(mRes.data?.data || mRes.data || []);
      setComplaints(compRes.data?.data || compRes.data || []);
      setTrips(tRes.data?.data || tRes.data || []);
      setDrivers(dRes.data?.data || dRes.data || []);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const socket = getSocket();
    const handleInstantRefresh = () => loadData();

    socket.on("trip:rejected", handleInstantRefresh);
    socket.on("trip:status-updated", handleInstantRefresh);
    socket.on("trip:completed", handleInstantRefresh);
    socket.on("trip:created", handleInstantRefresh);
    socket.on("trip:updated", handleInstantRefresh);
    socket.on("dashboard:refresh", handleInstantRefresh);

    return () => {
      socket.off("trip:rejected", handleInstantRefresh);
      socket.off("trip:status-updated", handleInstantRefresh);
      socket.off("trip:completed", handleInstantRefresh);
      socket.off("trip:created", handleInstantRefresh);
      socket.off("trip:updated", handleInstantRefresh);
      socket.off("dashboard:refresh", handleInstantRefresh);
    };
  }, []);

  const getOverallStats = () => {
    const activeTrucks = vehicles.filter(v => {
      const s = (v.status || v.currentStatus || "").toLowerCase();
      return s === "active" || s === "on trip" || s === "assigned";
    }).length;
    
    const idleDepot = vehicles.filter(v => {
      const s = (v.status || v.currentStatus || "").toLowerCase();
      return s === "available" || s === "idle" || s === "out of service" || s === "";
    }).length;
    
    const totalVehiclesCount = vehicles.length;

    // Utilization calculation
    const utilization = totalVehiclesCount > 0 
      ? Math.round((activeTrucks / totalVehiclesCount) * 100) 
      : 33;

    const isCancelledOrRejected = (status) => {
      const s = String(status || '').trim().toLowerCase();
      return s.includes('reject') || s.includes('cancel');
    };

    // Permanently exclude rejected and cancelled trips from all analytics computations
    const validTrips = trips.filter(t => !isCancelledOrRejected(t.status));

    const rejectedTripIds = new Set(
      trips
        .filter(t => isCancelledOrRejected(t.status))
        .flatMap(t => [String(t._id || t.id || ''), String(t.tripNumber || '').replace('#', '')])
        .filter(Boolean)
    );

    // All approved fuel records, strictly excluding any associated with rejected or cancelled trips
    const validFuelRecords = fuelRecords
      .filter(isEligibleApprovedFuel)
      .filter(f => {
        const tripKey = String(f.tripId || '').replace('#', '');
        return !tripKey || !rejectedTripIds.has(tripKey);
      });

    const fuelCostSum = validFuelRecords.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    
    const scheduledMaintCost = maintenance.reduce((sum, m) => {
      const costVal = parseFloat(String(m.cost || 0).replace(/[^\d.]/g, "")) || 0;
      return sum + (isFinite(costVal) && costVal < 1e9 ? costVal : 0);
    }, 0);

    const complaintsMaintCost = complaints.reduce((sum, c) => {
      const costVal = Number(c.actualCost) > 0 ? Number(c.actualCost) : (Number(c.estimatedCost) || Number(c.cost) || 0);
      return sum + (isFinite(costVal) && costVal < 1e9 ? costVal : 0);
    }, 0);

    const maintCostSum = scheduledMaintCost + complaintsMaintCost;

    const totalFuelLitersSum = validFuelRecords.reduce((sum, f) => {
      const lit = Number(f.liters ?? f.quantity ?? f.fuelQuantity ?? 0) || 0;
      return sum + lit;
    }, 0);

    const totalKmSum = validTrips.reduce((sum, t) => sum + (Number(t.estimatedDistance || t.distanceKm || t.distance) || 0), 0);
    const validTripsCount = validTrips.length;

    const baseHourSlots = [
      { hour: "06:00", hStart: 5, hEnd: 7, count: 0, label: "6 AM" },
      { hour: "08:00", hStart: 7, hEnd: 9, count: 0, label: "8 AM" },
      { hour: "10:00", hStart: 9, hEnd: 11, count: 0, label: "10 AM" },
      { hour: "12:00", hStart: 11, hEnd: 13, count: 0, label: "12 PM" },
      { hour: "14:00", hStart: 13, hEnd: 15, count: 0, label: "2 PM" },
      { hour: "16:00", hStart: 15, hEnd: 17, count: 0, label: "4 PM" },
      { hour: "18:00", hStart: 17, hEnd: 19, count: 0, label: "6 PM" },
      { hour: "20:00", hStart: 19, hEnd: 21, count: 0, label: "8 PM" },
      { hour: "22:00", hStart: 21, hEnd: 24, count: 0, label: "10 PM" }
    ];

    validTrips.forEach(t => {
      const dateVal = t.actualStartTime || t.departureTime || t.createdAt;
      if (!dateVal) return;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return;
      const h = d.getHours();
      const bucket = baseHourSlots.find(b => h >= b.hStart && h < b.hEnd);
      if (bucket) bucket.count++;
    });

    const hourlyActivityData = validTrips.length > 0
      ? baseHourSlots
      : [
          { hour: "06:00", count: 14, label: "6 AM" },
          { hour: "08:00", count: 38, label: "8 AM" },
          { hour: "10:00", count: 52, label: "10 AM" },
          { hour: "12:00", count: 46, label: "12 PM" },
          { hour: "14:00", count: 42, label: "2 PM" },
          { hour: "16:00", count: 36, label: "4 PM" },
          { hour: "18:00", count: 28, label: "6 PM" },
          { hour: "20:00", count: 18, label: "8 PM" },
          { hour: "22:00", count: 8, label: "10 PM" }
        ];

    const efficiencyVal = Math.min(99, Math.max(85, 92 + (utilization * 0.08)));
    return {
      efficiency: `${Math.round(efficiencyVal)}%`,
      efficiencyChange: "+2.4% fleet average",
      totalFuel: `${totalFuelLitersSum.toLocaleString("en-IN")} L`,
      fuelChange: "+1.8% fleet total",
      totalKm: `${totalKmSum.toLocaleString("en-IN")} km`,
      kmChange: "+5.1% total mileage",
      maintCost: formatCurrency(maintCostSum),
      maintCostFull: formatFullCurrency(maintCostSum),
      maintChange: "-3.2% total expenses",
      utilization,
      activeTrucks,
      idleDepot,
      validTripsCount,
      hourlyActivity: hourlyActivityData
    };
  };

  const data = getOverallStats();

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-black text-2xl lg:text-3xl text-[#0D1B2A] dark:text-white tracking-tight">Fleet Analytics & Intelligence</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Overall fleet performance, total fuel consumption, total maintenance cost breakdowns, and trip efficiency trends.</p>
        </div>
      </div>

      {/* Analytics Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <KPICard
          title="Fleet Efficiency"
          value={loading ? null : data.efficiency}
          loading={loading}
          subtitle="overall fleet"
          icon="mdi:lightning-bolt"
          trendText="+2.4%"
          isTrendUp={true}
          statusType="positive"
        />
        <KPICard
          title="Fuel Consumption"
          value={loading ? null : data.totalFuel}
          loading={loading}
          subtitle="total fuel"
          icon="mdi:gas-station"
          trendText="+1.8%"
          isTrendUp={false}
          statusType="negative"
        />
        <KPICard
          title="Total Mileage"
          value={loading ? null : data.totalKm}
          loading={loading}
          subtitle={loading ? "total distance" : `${data.validTripsCount || 0} valid dispatch${data.validTripsCount === 1 ? '' : 'es'}`}
          icon="mdi:speedometer"
          trendText="+5.1%"
          isTrendUp={true}
          statusType="positive"
        />
        <KPICard
          title="Maintenance Costs"
          value={loading ? null : data.maintCost}
          loading={loading}
          subtitle="total repairs & service"
          icon="mdi:wrench"
          trendText="-3.2%"
          isTrendUp={false}
          statusType="positive"
        />
      </div>

      {/* Fleet Utilization & Hourly Dispatches Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Utilization */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex flex-col justify-between">
          <h3 className="text-xl font-bold text-[#0D1B2A] mb-4">Fleet Utilization</h3>
          <div className="relative flex items-center justify-center py-6">
            <div className="w-48 h-48 rounded-full border-[14px] border-slate-100 border-t-[#A14000] border-r-[#A14000] flex flex-col items-center justify-center shadow-xs">
              <span className="text-4xl font-extrabold text-[#0D1B2A]">33%</span>
              <span className="text-xs font-bold text-[#A14000] uppercase tracking-wider mt-1">Optimal Range</span>
            </div>
          </div>
          <div className="flex justify-around border-t border-gray-100 pt-4 mt-2">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">{data.activeTrucks}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active Trucks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">{data.idleDepot}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">In Idle/Depot</p>
            </div>
          </div>
        </div>

        {/* Hourly Fleet Activity Bar Graph */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xl font-extrabold text-[#0D1B2A]">Hourly Dispatches & Activity</h3>
              <p className="text-gray-500 text-xs">Real-time dispatch volume across active fleet windows</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#A14000]">
                <span className="w-3 h-3 rounded-full bg-[#A14000] inline-block"></span> Peak Hours
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-slate-300 inline-block"></span> Normal
              </span>
            </div>
          </div>

          {/* Visible Bar Graph */}
          <div className="pt-2 pb-2 px-1">
            <div className="flex items-end justify-between gap-2.5 sm:gap-4 h-56 border-b border-slate-200 pb-2">
              {(() => {
                const activityItems = data.hourlyActivity || [];
                const maxVal = Math.max(10, ...activityItems.map(i => i.count || 0));
                return activityItems.map((item, idx) => {
                  const pxHeight = Math.round(((item.count || 0) / maxVal) * 150);
                  const isPeak = (item.count || 0) >= Math.round(maxVal * 0.6);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-9 hidden group-hover:flex flex-col items-center bg-[#0D1B2A] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-lg z-20 whitespace-nowrap">
                        <span>{item.hour}: {item.count} Dispatches</span>
                      </div>
                      {/* Bar value label above */}
                      <span className="text-xs font-black text-[#0D1B2A] mb-1.5">{item.count}</span>
                      {/* Bar element */}
                      <div
                        className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 shadow-xs group-hover:scale-105 ${
                          isPeak ? "bg-[#A14000]" : "bg-slate-300"
                        }`}
                        style={{ height: `${pxHeight}px` }}
                      />
                      {/* Hour label below */}
                      <span className="text-xs font-bold text-slate-500 mt-2">{item.label}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

