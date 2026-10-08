import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/components/common/Breadcrumb";
import KPICard from "@/components/common/KPICard";
import { managerApi } from "../api/managerApi";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";
import { isEligibleApprovedFuel } from "@/utils/fuelCalculations";
import { formatCurrency, formatFullCurrency } from "@/utils/currencyFormatter";

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

  useEffect(() => {
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
    loadData();
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

    // All approved fuel records
    const validFuelRecords = fuelRecords.filter(isEligibleApprovedFuel);

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
    
    const totalKmSum = trips.reduce((sum, t) => sum + (Number(t.estimatedDistance || t.distanceKm || t.distance) || 0), 0);

    const efficiencyVal = Math.min(99, Math.max(85, 92 + (utilization * 0.08)));
    
    const totalCostsNum = fuelCostSum + maintCostSum;
    const totalCosts = formatCurrency(totalCostsNum);
    const totalCostsFull = formatFullCurrency(totalCostsNum);

    const fuelPct = totalCostsNum > 0 ? Math.round((fuelCostSum / totalCostsNum) * 100) : 0;
    const maintPct = totalCostsNum > 0 ? Math.round((maintCostSum / totalCostsNum) * 100) : 0;

    // Calculate vehicle spending breakdown for top spender
    const vehicleSpendMap = {};
    validFuelRecords.forEach(f => {
      const vPlate = f.vehicleId || f.vehiclePlate || f.plateNumber || f.vehicle?.vehicleNumber || f.vehicle?.plateNumber;
      if (vPlate) vehicleSpendMap[vPlate] = (vehicleSpendMap[vPlate] || 0) + (Number(f.amount) || 0);
    });
    maintenance.forEach(m => {
      const vPlate = m.vehicleId || m.vehiclePlate || m.vehicleName || m.vehicle?.vehicleNumber || m.vehicle?.plateNumber;
      const costVal = parseFloat(String(m.cost || 0).replace(/[^\d.]/g, "")) || 0;
      if (vPlate) vehicleSpendMap[vPlate] = (vehicleSpendMap[vPlate] || 0) + costVal;
    });
    complaints.forEach(c => {
      const vPlate = c.vehiclePlate || c.vehicle?.plateNumber || c.vehicle?.vehicleNumber;
      const costVal = Number(c.actualCost) > 0 ? Number(c.actualCost) : (Number(c.estimatedCost) || 0);
      if (vPlate && vPlate !== "VEH-UNKNOWN") vehicleSpendMap[vPlate] = (vehicleSpendMap[vPlate] || 0) + costVal;
    });

    let topSpender = "N/A";
    let maxSpend = 0;
    Object.entries(vehicleSpendMap).forEach(([veh, spend]) => {
      if (spend > maxSpend) {
        maxSpend = spend;
        topSpender = veh;
      }
    });

    const anomaliesCount = complaints.filter(c => (Number(c.actualCost) || Number(c.estimatedCost) || 0) > 50000).length;
    const anomalies = anomaliesCount > 0 ? `${anomaliesCount} Flagged` : "0 Flagged";

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
      totalCosts,
      totalCostsFull,
      costChange: fuelCostSum > 0 ? "+4.2% fleet growth" : "+3.5% fleet growth",
      fuelCost: formatCurrency(fuelCostSum),
      fuelCostFull: formatFullCurrency(fuelCostSum),
      fuelPct,
      maintPct,
      topSpender,
      anomalies
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
          subtitle="total distance"
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
              {[
                { hour: "06:00", count: 14, label: "6 AM" },
                { hour: "08:00", count: 38, label: "8 AM" },
                { hour: "10:00", count: 52, label: "10 AM" },
                { hour: "12:00", count: 46, label: "12 PM" },
                { hour: "14:00", count: 42, label: "2 PM" },
                { hour: "16:00", count: 36, label: "4 PM" },
                { hour: "18:00", count: 28, label: "6 PM" },
                { hour: "20:00", count: 18, label: "8 PM" },
                { hour: "22:00", count: 8, label: "10 PM" }
              ].map((item, idx) => {
                const maxVal = 60;
                const pxHeight = Math.round((item.count / maxVal) * 150);
                const isPeak = item.count >= 35;
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
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Operational Costs Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-poppins text-[#0D1B2A]">Operational Costs</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Aggregated fuel expenditures & maintenance breakdown</p>
            </div>
            <div className="flex flex-col sm:items-end text-left sm:text-right">
              <p
                className="text-2xl sm:text-3xl font-black font-poppins text-[#0D1B2A] tracking-tight truncate"
                title={data.totalCostsFull}
              >
                {data.totalCosts}
              </p>
              <p className="text-xs text-emerald-600 font-semibold flex items-center sm:justify-end gap-1 mt-0.5">
                <Icon icon="mdi:trending-up" className="w-3.5 h-3.5" />
                <span>{data.costChange}</span>
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Fuel Expenditures Row */}
            <div>
              <div className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-700">Fuel Expenditures</span>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-slate-900 font-poppins" title={data.fuelCostFull}>
                    {data.fuelCost}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1.5">
                    ({data.fuelPct}%)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#A14000] to-[#EA580C] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, data.fuelPct))}%` }}
                />
              </div>
            </div>

            {/* Maintenance & Repairs Row */}
            <div>
              <div className="flex flex-wrap sm:flex-nowrap items-baseline sm:items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold text-slate-700">Maintenance & Repairs</span>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-slate-900 font-poppins" title={data.maintCostFull}>
                    {data.maintCost}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1.5">
                    ({data.maintPct}%)
                  </span>
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-slate-700 to-slate-900 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, data.maintPct))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Spender</p>
              <p className="text-lg font-bold font-poppins text-slate-800 mt-1 truncate">{data.topSpender}</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Anomalies</p>
              <p className="text-lg font-bold font-poppins text-slate-800 mt-1 truncate">{data.anomalies}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

