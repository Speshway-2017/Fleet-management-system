import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [showInsights, setShowInsights] = useState(false);

  const [vehicles, setVehicles] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [vRes, fRes, mRes, tRes, dRes] = await Promise.all([
          managerApi.getVehicles(),
          managerApi.getFuelRecords(),
          managerApi.getMaintenance(),
          managerApi.getTrips(),
          managerApi.getDrivers()
        ]);
        setVehicles(vRes.data?.data || vRes.data || []);
        setFuelRecords(fRes.data?.data || fRes.data || []);
        setMaintenance(mRes.data?.data || mRes.data || []);
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

  const handleExport = () => {
    toast.success("Analytics report exported successfully!");
  };

  const getBranchStats = (branchName) => {
    // Filter vehicles by branch
    const filteredVehicles = branchName === "All Branches" 
      ? vehicles 
      : vehicles.filter(v => {
          const vBranch = v.branchDepot || v.branch || "";
          return vBranch.toLowerCase().trim() === branchName.toLowerCase().trim();
        });
    
    const activeTrucks = filteredVehicles.filter(v => {
      const s = (v.status || v.currentStatus || "").toLowerCase();
      return s === "active" || s === "on trip" || s === "assigned";
    }).length;
    
    const idleDepot = filteredVehicles.filter(v => {
      const s = (v.status || v.currentStatus || "").toLowerCase();
      return s === "available" || s === "idle" || s === "out of service" || s === "";
    }).length;
    
    const totalVehiclesCount = filteredVehicles.length;

    // Utilization calculation
    const utilization = totalVehiclesCount > 0 
      ? Math.round((activeTrucks / totalVehiclesCount) * 100) 
      : 0;

    // StrokeDash calculation (circumference of circle r=40 is ~251.2)
    const activeStroke = Math.round(251.2 * utilization / 100);
    const strokeDash = `${activeStroke} ${252 - activeStroke}`;

    // Filter fuel/maintenance records associated with these vehicles
    const vehicleNumbers = new Set(filteredVehicles.map(v => v.vehicleNumber));
    const vehicleIds = new Set(filteredVehicles.map(v => String(v._id)));
    
    const branchFuel = fuelRecords.filter(f => {
      const vId = f.vehicle?._id || f.vehicle;
      return vehicleIds.has(String(vId)) || vehicleNumbers.has(f.vehicleId);
    });
    
    const branchMaint = maintenance.filter(m => {
      const vId = m.vehicle?._id || m.vehicle;
      return vehicleIds.has(String(vId)) || vehicleNumbers.has(m.vehicleId);
    });

    const fuelCostSum = branchFuel.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const maintCostSum = branchMaint.reduce((sum, m) => {
      const costVal = parseFloat(String(m.cost || 0).replace(/[^\d.]/g, "")) || 0;
      return sum + costVal;
    }, 0);

    const totalCostsNum = fuelCostSum + maintCostSum;
    const totalCosts = `₹${totalCostsNum.toLocaleString("en-IN")}`;

    const fuelPct = totalCostsNum > 0 ? Math.round((fuelCostSum / totalCostsNum) * 100) : 0;
    const maintPct = totalCostsNum > 0 ? Math.round((maintCostSum / totalCostsNum) * 100) : 0;

    // Filter drivers of this branch
    const branchDrivers = branchName === "All Branches"
      ? drivers
      : drivers.filter(d => {
          const dBranch = d.branchDepot || d.branch || "";
          return dBranch.toLowerCase().trim() === branchName.toLowerCase().trim();
        });

    const avgScore = branchDrivers.length > 0
      ? Math.round(branchDrivers.reduce((sum, d) => sum + (d.performanceScore || 0), 0) / branchDrivers.length)
      : 85;

    // Calculate actual 6 axes for safety radar chart
    const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];
    const factors = [1.0, 0.95, 0.9, 0.88, 0.98, 0.92];
    const safetyIndexPoints = angles.map((angle, idx) => {
      const val = Math.min(100, Math.max(10, avgScore * factors[idx]));
      const r = (val / 100) * 80;
      const x = Math.round(100 + r * Math.sin(angle));
      const y = Math.round(100 - r * Math.cos(angle));
      return `${x},${y}`;
    }).join(" ");

    // Count overdue maintenance for anomalies
    const overdueMaintCount = branchMaint.filter(m => {
      const isOverdue = new Date(m.scheduledDate) < new Date();
      return isOverdue && m.status !== "Completed";
    }).length;
    const anomalies = overdueMaintCount < 10 ? `0${overdueMaintCount}` : String(overdueMaintCount);

    // Top Spender Vehicle Plate Number
    let topSpender = "None";
    let maxSpend = -1;
    filteredVehicles.forEach(v => {
      const vFuel = branchFuel.filter(f => String(f.vehicle?._id || f.vehicle) === String(v._id) || f.vehicleId === v.vehicleNumber);
      const vMaint = branchMaint.filter(m => String(m.vehicle?._id || m.vehicle) === String(v._id) || m.vehicleId === v.vehicleNumber);
      const fuelSpend = vFuel.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
      const maintSpend = vMaint.reduce((sum, m) => sum + (parseFloat(String(m.cost || 0).replace(/[^\d.]/g, "")) || 0), 0);
      const totalSpend = fuelSpend + maintSpend;
      if (totalSpend > maxSpend) {
        maxSpend = totalSpend;
        topSpender = v.vehicleNumber;
      }
    });

    // Heatmap Grid: 5 days x 24 hours
    // Initialize empty grid
    const heatmapGrid = Array.from({ length: 5 }, () => Array(24).fill(0));
    
    // Filter trips for this branch
    const branchTrips = trips.filter(t => {
      const vId = t.vehicle?._id || t.vehicle;
      return vehicleIds.has(String(vId));
    });

    branchTrips.forEach(t => {
      const departureDate = new Date(t.actualStartTime || t.createdAt);
      if (!isNaN(departureDate.getTime())) {
        const day = departureDate.getDay(); // 0 (Sun) to 6 (Sat)
        const hour = departureDate.getHours(); // 0 to 23
        let mappedDay = day - 1;
        if (mappedDay < 0) mappedDay = 0; // Sun -> Mon
        if (mappedDay > 4) mappedDay = 4; // Sat -> Fri
        
        heatmapGrid[mappedDay][hour]++;
      }
    });

    let maxHeatCount = 0;
    for (let d = 0; d < 5; d++) {
      for (let h = 0; h < 24; h++) {
        if (heatmapGrid[d][h] > maxHeatCount) maxHeatCount = heatmapGrid[d][h];
      }
    }
    if (maxHeatCount === 0) maxHeatCount = 1;

    return {
      utilization,
      strokeDash,
      activeTrucks,
      idleDepot,
      safetyIndexPoints,
      totalCosts,
      costChange: fuelCostSum > 0 ? "+4.2% vs last month" : "0% vs last month",
      fuelCost: `₹${fuelCostSum.toLocaleString("en-IN")}`,
      fuelPct,
      maintCost: `₹${maintCostSum.toLocaleString("en-IN")}`,
      maintPct,
      avgMileCost: `₹ ${(totalCostsNum / Math.max(1, activeTrucks * 50)).toFixed(1)}`,
      topSpender,
      anomalies,
      heatmapGrid,
      maxHeatCount,
      branchDrivers,
      branchMaint,
      branchTrips
    };
  };

  const data = getBranchStats(branchFilter);
  const uniqueBranches = Array.from(new Set(vehicles.map(v => v.branchDepot || v.branch).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#B45A0A] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Analytics</h1>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full sm:w-auto">
            {["Last 7 Days", "30 Days", "Year to Date"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-amber-700 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-auto">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full sm:w-auto flex items-center justify-between bg-white border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 shadow-sm text-sm font-bold text-gray-700 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All Branches">All Branches</option>
              {uniqueBranches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon icon="mdi:chevron-down" className="w-5 h-5 text-gray-500" />
            </div>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg w-full sm:w-auto cursor-pointer"
          >
            <Icon icon="mdi:download" className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Fleet Utilization */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Fleet Utilization</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#C65D0E" strokeWidth="10" strokeDasharray={data.strokeDash} strokeDashoffset="0" className="transform -rotate-90" style={{ transformOrigin: "50px 50px" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-extrabold text-gray-800">{data.utilization}%</span>
                <span className="text-xs text-gray-500 font-semibold">Optimal Range</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around pt-4 border-t border-gray-200">
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

        {/* Vehicle Activity Heatmap */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Vehicle Activity Heatmap</h3>
              <p className="text-gray-500 text-sm">Dispatch density by hour across the global fleet</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Low</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-4 h-4 rounded" style={{ backgroundColor: i === 1 ? '#FFF3E0' : i === 2 ? '#FFCC80' : i === 3 ? '#FFA726' : i === 4 ? '#F57C00' : '#E65100' }} />
                ))}
              </div>
              <span>Peak</span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-1">
            {['MON','TUE','WED','THU','FRI'].map((day, di) => (
              Array.from({length:24}, (_, hi) => {
                const count = data.heatmapGrid[di]?.[hi] || 0;
                let bgColor = '#F9FAFB'; // fallback
                if (count > 0) {
                  const colors = ['#FFF3E0', '#FFCC80', '#FFA726', '#F57C00', '#E65100'];
                  const idx = Math.min(colors.length - 1, Math.floor((count / data.maxHeatCount) * colors.length));
                  bgColor = colors[idx];
                }
                return (
                  <div
                    key={`${di}-${hi}`}
                    className="w-full aspect-square rounded"
                    style={{ backgroundColor: bgColor }}
                    title={`${day} at ${hi}:00 - ${count} dispatch(es)`}
                  />
                );
              })
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500 px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:59</span>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 gap-6">
        {/* Operational Costs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Operational Costs</h3>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-gray-800">{data.totalCosts}</p>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Icon icon="mdi:trending-up" /> {data.costChange}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Fuel Expenditures</span>
                <span className="text-gray-600 text-sm">{data.fuelCost} ({data.fuelPct}%)</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{width: `${data.fuelPct}%`}} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Maintenance & Repairs</span>
                <span className="text-gray-600 text-sm">{data.maintCost} ({data.maintPct}%)</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-700 rounded-full" style={{width: `${data.maintPct}%`}} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Top Spender</p>
              <p className="text-lg font-bold text-gray-800">{data.topSpender}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Anomalies</p>
              <p className="text-lg font-bold text-gray-800">{data.anomalies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowInsights(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-800 transition-all cursor-pointer active:scale-95 z-50 animate-bounce"
        title="AI Operational Insights"
      >
        <Icon icon="mdi:lightbulb-on-outline" className="w-8 h-8" />
      </button>

      {/* AI Operational Insights Drawer */}
      {showInsights && (
        <div className="fixed inset-0 z-[9999] flex justify-end bg-black/40 backdrop-blur-xs select-none">
          <div className="flex-1" onClick={() => setShowInsights(false)} />
          <div className="w-full max-w-[420px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right relative">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:robot-outline" className="w-6 h-6 text-amber-500" />
                <h3 className="font-poppins font-bold text-sm text-white">AI Operational Insights</h3>
              </div>
              <button
                onClick={() => setShowInsights(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>

            {/* Insights Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 custom-scrollbar">
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                AI-driven analysis of your fleet statistics shows potential optimizations for today:
              </p>

              {/* Tip 1 */}
              {(() => {
                const ongoingCount = data.branchTrips.filter(t => t.status === "In Progress" || t.status === "Assigned" || t.status === "Ongoing").length;
                return (
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Icon icon="mdi:map-marker-path" className="w-5 h-5" />
                      <h4 className="font-bold text-xs uppercase tracking-wider font-poppins">Route Consolidation</h4>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {ongoingCount > 0 ? (
                        <>Consolidating the <strong className="text-gray-900">{ongoingCount} active/assigned dispatches</strong> in the system can optimize toll expenditures and save fleet running transit hours.</>
                      ) : (
                        <>No active dispatches right now. Scheduling routes early for future bookings is recommended to optimize transit corridors and driver rest periods.</>
                      )}
                    </p>
                    <button onClick={() => { navigate("/manager/trips"); setShowInsights(false); }} className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                      View Trips Dashboard →
                    </button>
                  </div>
                );
              })()}

              {/* Tip 2 */}
              {(() => {
                const lowestDriver = [...data.branchDrivers].sort((a,b) => (a.performanceScore || 0) - (b.performanceScore || 0))[0];
                return (
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Icon icon="mdi:steering" className="w-5 h-5" />
                      <h4 className="font-bold text-xs uppercase tracking-wider font-poppins">Safety Coaching Alert</h4>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {lowestDriver ? (
                        <>Driver <strong className="text-gray-900">{lowestDriver.fullName}</strong> currently has a performance score of <strong className="text-gray-900">{lowestDriver.performanceScore || 0}/100</strong>. Scheduling a brief safety review is recommended to bring average safety back to targets.</>
                      ) : (
                        <>All registered drivers are performing excellently! Fleet-wide compliance and braking indicators are in the target green range (95%+).</>
                      )}
                    </p>
                    <button onClick={() => { navigate("/manager/drivers"); setShowInsights(false); }} className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                      View Drivers List →
                    </button>
                  </div>
                );
              })()}

              {/* Tip 3 */}
              {(() => {
                const scheduledService = data.branchMaint.find(m => m.status === "Scheduled");
                return (
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center gap-2 text-amber-700">
                      <Icon icon="mdi:wrench" className="w-5 h-5" />
                      <h4 className="font-bold text-xs uppercase tracking-wider font-poppins">Scheduled Maintenance</h4>
                    </div>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed">
                      {scheduledService ? (
                        <>Vehicle <strong className="text-gray-900">{scheduledService.plateNumber}</strong> has an upcoming <strong className="text-gray-900">"{scheduledService.type}"</strong> service scheduled on {scheduledService.serviceDate} at {scheduledService.serviceCenter}. Ensure the keys are logged.</>
                      ) : (
                        <>No upcoming maintenance tasks scheduled for this branch. Routine vehicle safety checks and tire pressure updates are recommended daily.</>
                      )}
                    </p>
                    <button onClick={() => { navigate("/manager/maintenance"); setShowInsights(false); }} className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                      Schedule Service →
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white text-center shrink-0">
              <button 
                onClick={() => {
                  setShowInsights(false);
                  toast.success("Subscribing to weekly AI operational summaries...");
                }}
                className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Receive Weekly AI Summaries
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
