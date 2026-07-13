import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

const branchData = {
  "All Branches": {
    utilization: 78,
    strokeDash: "196 56",
    activeTrucks: 428,
    idleDepot: 112,
    safetyIndexPoints: "100,45 135,75 130,125 95,155 65,125 70,75",
    totalCosts: "₹2,48,390",
    costChange: "4.2% vs last month",
    fuelCost: "₹1,42,000",
    fuelPct: 57,
    maintCost: "₹64,500",
    maintPct: 26,
    tollCost: "₹41,890",
    tollPct: 17,
    avgKmCost: "₹ 11.4",
    topSpender: "Fleet-A",
    anomalies: "04"
  },
  "Mumbai Hub": {
    utilization: 85,
    strokeDash: "213 39",
    activeTrucks: 180,
    idleDepot: 30,
    safetyIndexPoints: "100,30 145,65 135,115 100,150 55,115 60,65",
    totalCosts: "₹1,12,450",
    costChange: "2.8% vs last month",
    fuelCost: "₹62,000",
    fuelPct: 55,
    maintCost: "₹30,200",
    maintPct: 27,
    tollCost: "₹20,250",
    tollPct: 18,
    avgKmCost: "₹ 11.1",
    topSpender: "Fleet-M1",
    anomalies: "01"
  },
  "Delhi Hub": {
    utilization: 72,
    strokeDash: "180 72",
    activeTrucks: 145,
    idleDepot: 55,
    safetyIndexPoints: "100,55 125,80 120,130 95,160 75,130 75,80",
    totalCosts: "₹88,940",
    costChange: "5.1% vs last month",
    fuelCost: "₹52,000",
    fuelPct: 58,
    maintCost: "₹21,440",
    maintPct: 24,
    tollCost: "₹15,500",
    tollPct: 18,
    avgKmCost: "₹ 11.9",
    topSpender: "Fleet-D2",
    anomalies: "02"
  },
  "Bengaluru Hub": {
    utilization: 82,
    strokeDash: "206 46",
    activeTrucks: 103,
    idleDepot: 27,
    safetyIndexPoints: "100,40 135,70 140,120 100,145 60,120 70,75",
    totalCosts: "₹47,000",
    costChange: "3.5% vs last month",
    fuelCost: "₹28,000",
    fuelPct: 59,
    maintCost: "₹12,860",
    maintPct: 27,
    tollCost: "₹6,140",
    tollPct: 14,
    avgKmCost: "₹ 10.3",
    topSpender: "Fleet-B1",
    anomalies: "01"
  }
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [branchFilter, setBranchFilter] = useState("All Branches");
  const [showInsights, setShowInsights] = useState(false);

  const handleExport = () => {
    toast.success("Analytics report exported successfully!");
  };

  const data = branchData[branchFilter] || branchData["All Branches"];

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
              <option>All Branches</option>
              <option>Mumbai Hub</option>
              <option>Delhi Hub</option>
              <option>Bengaluru Hub</option>
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
              Array.from({length:24}, (_, hi) => (
                <div
                  key={`${di}-${hi}`}
                  className="w-full aspect-square rounded"
                  style={{
                    backgroundColor: Math.random() > 0.5 ? ['#FFF3E0','#FFCC80','#FFA726','#F57C00','#E65100'][Math.floor(Math.random()*5)] : '#F9FAFB'
                  }}
                />
              ))
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Safety Index */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Driver Safety Index</h3>
          <p className="text-gray-500 text-sm mb-6">Aggregate safety performance metrics across all drivers</p>
          <div className="flex items-center justify-center h-64">
            {/* Radar Chart Placeholder */}
            <svg viewBox="0 0 200 200" className="w-full max-w-xs">
              <polygon points="100,20 160,60 160,140 100,180 40,140 40,60" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
              <polygon points="100,40 140,70 140,130 100,160 60,130 60,70" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
              <polygon points="100,60 120,80 120,120 100,140 80,120 80,80" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
              <polygon points="100,80 100,90 100,110 100,120 100,110 100,90" fill="#D4D4D4" opacity="0.3"/>
              <polygon points={data.safetyIndexPoints} fill="#C65D0E" opacity="0.2" stroke="#C65D0E" strokeWidth="2"/>
              <text x="100" y="15" textAnchor="middle" fontSize="10" fill="#374151">STABILITY</text>
              <text x="170" y="65" textAnchor="middle" fontSize="10" fill="#374151">EFFICIENCY</text>
              <text x="170" y="145" textAnchor="middle" fontSize="10" fill="#374151">PUNCTUALITY</text>
              <text x="100" y="195" textAnchor="middle" fontSize="10" fill="#374151">ALERTNESS</text>
              <text x="30" y="145" textAnchor="middle" fontSize="10" fill="#374151">COMPLIANCE</text>
              <text x="30" y="65" textAnchor="middle" fontSize="10" fill="#374151">BRAKING</text>
            </svg>
          </div>
        </div>

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
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Tolls & FASTag</span>
                <span className="text-gray-600 text-sm">{data.tollCost} ({data.tollPct}%)</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 rounded-full" style={{width: `${data.tollPct}%`}} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Avg / Km</p>
              <p className="text-lg font-bold text-gray-800">{data.avgKmCost}</p>
            </div>
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
              <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon icon="mdi:map-marker-path" className="w-5 h-5" />
                  <h4 className="font-bold text-xs uppercase tracking-wider font-poppins">Route Consolidation</h4>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Consolidating 3 active dispatches on the Mumbai-Pune corridor can save up to <strong className="text-gray-900">₹12,000</strong> in toll expenditures and decrease total fleet idle time by 1.8 hours.
                </p>
                <button onClick={() => { navigate("/manager/trips"); setShowInsights(false); }} className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                  Consolidate Dispatches →
                </button>
              </div>

              {/* Tip 2 */}
              <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon icon="mdi:steering" className="w-5 h-5" />
                  <h4 className="font-bold text-xs uppercase tracking-wider font-poppins">Safety Coaching Alert</h4>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Marcus Read logged 4 overspeeding violations in the last 24 hours. Scheduling a brief safety review is recommended to bring compliance score back to the target green range (9.0+).
                </p>
                <button onClick={() => { navigate("/manager/drivers"); setShowInsights(false); }} className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                  View Driver Profile →
                </button>
              </div>

              {/* Tip 3 */}
              <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-2 hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-2 text-amber-700">
                  <Icon icon="mdi:wrench" className="w-5 h-5" />
                  <h4 className="font-bold text-xs uppercase tracking-wider font-poppins">Brake Pad Maintenance</h4>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Brakes for vehicle <strong className="text-gray-900">#VAN-402</strong> are at 88% wear limit. Pad replacement is recommended in the next 250 km to avoid peak operational failure or breakdowns during transit.
                </p>
                <button onClick={() => { navigate("/manager/maintenance"); setShowInsights(false); }} className="text-[10px] font-bold text-amber-700 hover:underline cursor-pointer">
                  Schedule Service →
                </button>
              </div>
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
