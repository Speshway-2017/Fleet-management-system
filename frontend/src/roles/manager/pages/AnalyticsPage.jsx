import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("Last 7 Days");

  const handleExport = () => {
    toast.success("Analytics report exported successfully!");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {["Last 7 Days", "30 Days", "Year to Date"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-amber-700 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
            <span className="text-sm font-medium text-gray-700">All Branches</span>
            <Icon icon="mdi:chevron-down" className="w-5 h-5 ml-2 text-gray-500" />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
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
                <circle cx="50" cy="50" r="40" fill="none" stroke="#C65D0E" strokeWidth="10" strokeDasharray="196 56" strokeDashoffset="0" className="transform -rotate-90" style={{ transformOrigin: "50px 50px" }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-extrabold text-gray-800">78%</span>
                <span className="text-xs text-gray-500 font-semibold">Optimal Range</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">428</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active Trucks</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">112</p>
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
              <polygon points="100,45 135,75 130,125 95,155 65,125 70,75" fill="#C65D0E" opacity="0.2" stroke="#C65D0E" strokeWidth="2"/>
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
              <p className="text-2xl font-extrabold text-gray-800">₹2,48,390</p>
              <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                <Icon icon="mdi:trending-up" /> 4.2% vs last month
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Fuel Expenditures</span>
                <span className="text-gray-600 text-sm">₹1,42,000 (57%)</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-black rounded-full" style={{width: '57%'}} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Maintenance & Repairs</span>
                <span className="text-gray-600 text-sm">₹64,500 (26%)</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-700 rounded-full" style={{width: '26%'}} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Tolls & FASTag</span>
                <span className="text-gray-600 text-sm">₹41,890 (17%)</span>
              </div>
              <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-600 rounded-full" style={{width: '17%'}} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Avg / Mile</p>
              <p className="text-lg font-bold text-gray-800">₹ 18.4</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Top Spender</p>
              <p className="text-lg font-bold text-gray-800">Fleet-A</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase">Anomalies</p>
              <p className="text-lg font-bold text-gray-800">04</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-amber-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-800 transition-all">
        <Icon icon="mdi:lightbulb-on-outline" className="w-8 h-8" />
      </button>
    </div>
  );
}
