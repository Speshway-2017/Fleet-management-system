import { useState } from "react";
import {
  Fuel,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  Download,
  CreditCard,
  Gauge,
  CheckCircle,
  FileText,
  X,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_FUEL_LOGS = [
  {
    id: "l1",
    vehicleId: "MH-12-AB-5678",
    vehicleName: "Ashok Leyland 3118",
    driver: "Rajesh Kumar",
    timestamp: "Jul 06, 11:30 AM",
    fuelStation: "Shell Station, Pune Bypass",
    qty: "82.5 L",
    total: "₹7,837.50",
    status: "normal",
    hasReceipt: true
  },
  {
    id: "l2",
    vehicleId: "KA-02-AB-1456",
    vehicleName: "Tata Ace Gold",
    driver: "Ram Kumar",
    timestamp: "Jul 06, 09:15 AM",
    fuelStation: "IndianOil, Talegaon Toll Plaza",
    qty: "45.0 L",
    total: "₹4,275.00",
    status: "normal",
    hasReceipt: true
  },
  {
    id: "l3",
    vehicleId: "AP-39-EP-9465",
    vehicleName: "Bharat Benz 211",
    driver: "Eshwar Singh",
    timestamp: "Jul 05, 10:45 PM",
    fuelStation: "HP Fuel, Lonavala Expressway",
    qty: "114.2 L",
    total: "₹10,849.00",
    status: "normal",
    hasReceipt: true
  },
  {
    id: "l4",
    vehicleId: "MH-12-PQ-8011",
    vehicleName: "Scania Model X",
    driver: "Abhijeet Rao",
    timestamp: "Jul 05, 04:20 PM",
    fuelStation: "Anomalous Drain Detected",
    qty: "-15.0 L",
    total: "N/A",
    status: "anomaly",
    hasReceipt: false
  }
];

export default function FuelManagementPage() {
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState(INITIAL_FUEL_LOGS);
  const [selectedLog, setSelectedLog] = useState(null);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionComment, setResolutionComment] = useState("");

  const filteredLogs = logs.filter(l => {
    const q = search.toLowerCase();
    return (
      l.vehicleId.toLowerCase().includes(q) ||
      l.driver.toLowerCase().includes(q) ||
      l.fuelStation.toLowerCase().includes(q)
    );
  });

  const totalSpend = logs
    .filter(l => l.status === "normal")
    .reduce((sum, l) => sum + parseFloat(l.total.replace(/[^\d.]/g, "")), 0);

  const anomaliesCount = logs.filter(l => l.status === "anomaly").length;

  const handleResolveAnomaly = (log) => {
    setSelectedLog(log);
    setResolutionModalOpen(true);
  };

  const submitResolution = (e) => {
    e.preventDefault();
    if (!resolutionComment.trim()) {
      toast.error("Please enter a resolution note.");
      return;
    }

    setLogs(prev =>
      prev.map(l =>
        l.id === selectedLog.id
          ? {
              ...l,
              status: "resolved",
              fuelStation: `Resolved: ${selectedLog.fuelStation}`,
              total: "Resolved",
              qty: "0.0 L"
            }
          : l
      )
    );

    setResolutionModalOpen(false);
    setSelectedLog(null);
    setResolutionComment("");
    toast.success("Fuel siphoning anomaly marked as resolved!");
  };

  const handleDownloadReceipt = (log) => {
    // Generate text content for receipt invoice
    const receiptContent = `===========================================
               FLEET FUEL RECEIPT
===========================================
Invoice ID:      INV-${log.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}
Date:            July 06, 2026
Timestamp:       ${log.timestamp}
-------------------------------------------
VEHICLE DETAILS
Vehicle Plate:   ${log.vehicleId}
Model:           ${log.vehicleName}
Driver Assigned: ${log.driver}
-------------------------------------------
TRANSACTION DETAILS
Station Name:    ${log.fuelStation}
Fuel Type:       Diesel
Quantity:        ${log.qty}
Price per Liter: ₹95.00
Total Amount:    ${log.total}
-------------------------------------------
Payment Mode:    FASTag Fleet Wallet Auto-Pay
Status:          PAID & VERIFIED
===========================================
        THANK YOU FOR REFUELLING WITH US!
===========================================`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Fuel_Receipt_${log.vehicleId.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Receipt for ${log.vehicleId} downloaded!`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">
          Fuel Management
        </h1>
        <p className="text-sm text-[#64748B] mt-1 font-medium font-nunito">
          Monitor diesel logs, average fleet efficiency, and resolve fuel siphoning alerts.
        </p>
      </div>

      {/* --- KPI SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Fuel Spend */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Total Fuel Spend</span>
              <h3 className="text-2xl font-extrabold text-[#1E293B] mt-2 font-poppins">
                ₹{totalSpend.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-[#FDF3EC] text-[#B45A0A] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-[#22C55E] gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+22.4% vs last month</span>
          </div>
        </div>

        {/* KPI 2: Mileage */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Avg Fleet Mileage</span>
              <h3 className="text-2xl font-extrabold text-[#1E293B] mt-2 font-poppins">4.2 km/l</h3>
            </div>
            <div className="bg-emerald-50 text-[#22C55E] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
              <Gauge className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 text-xs text-[#22C55E] font-medium">
            Optimized consumption: <span className="font-bold">-0.8% drop</span>
          </div>
        </div>

        {/* KPI 3: Anomalies */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Theft & Anomalies</span>
              <h3 className="text-2xl font-extrabold text-red-600 mt-2 font-poppins">
                {anomaliesCount < 10 ? `0${anomaliesCount}` : anomaliesCount}
              </h3>
            </div>
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-500 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{anomaliesCount} High Priority Alerts</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col">
        {/* Table Header Filter controls */}
        <div className="px-6 py-5 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white">
          <h3 className="font-poppins font-black text-lg text-[#1E293B]">Recent Fuel Entries</h3>

          <div className="flex items-center gap-3">
            {/* Search field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search vehicle or driver..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium w-[220px]"
              />
            </div>

            {/* Filter option */}
            <button className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all flex items-center gap-2 cursor-pointer">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6">Vehicle ID</th>
                <th className="py-4 px-6">Driver</th>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Fuel Station</th>
                <th className="py-4 px-6">Qty (Liters)</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6 text-right">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium font-nunito">
                    No fuel logs found matching filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(l => (
                  <tr
                    key={l.id}
                    className={`hover:bg-[#F5F7FB]/50 transition-colors ${l.status === "anomaly" ? "bg-red-50/30" : ""}`}
                  >
                    {/* Vehicle ID cell */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {/* Accent indicator line */}
                        <div className={`w-1 h-8 rounded-full ${l.status === "anomaly" ? "bg-red-500" : l.status === "resolved" ? "bg-emerald-500" : "bg-[#B45A0A]"}`} />
                        <div>
                          <p className="font-bold text-[#1E293B] font-poppins text-xs">{l.vehicleId}</p>
                          <span className="text-[10px] text-[#64748B] block mt-0.5">{l.vehicleName}</span>
                        </div>
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="py-4 px-6 font-semibold text-xs text-[#1E293B] whitespace-nowrap">
                      {l.driver}
                    </td>

                    {/* Timestamp */}
                    <td className={`py-4 px-6 text-xs whitespace-nowrap ${l.status === "anomaly" ? "text-red-500 font-bold" : "text-gray-500"}`}>
                      {l.timestamp}
                    </td>

                    {/* Station */}
                    <td className={`py-4 px-6 text-xs whitespace-nowrap ${l.status === "anomaly" ? "text-red-600 font-bold" : "text-gray-700"}`}>
                      {l.fuelStation}
                    </td>

                    {/* Quantity */}
                    <td className={`py-4 px-6 text-xs font-black whitespace-nowrap ${l.status === "anomaly" ? "text-red-600" : "text-gray-900"}`}>
                      {l.qty}
                    </td>

                    {/* Total Spend */}
                    <td className="py-4 px-6 text-xs font-black text-gray-900 whitespace-nowrap">
                      {l.total}
                    </td>

                    {/* Receipt/Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {l.status === "anomaly" ? (
                        <button
                          onClick={() => handleResolveAnomaly(l)}
                          className="px-3.5 py-1.5 bg-[#EF4444] hover:bg-red-700 text-white rounded-lg text-[10px] font-black shadow-sm transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      ) : l.status === "resolved" ? (
                        <span className="text-emerald-600 text-xs font-bold flex items-center justify-end gap-1 select-none">
                          <CheckCircle className="w-4 h-4" />
                          Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDownloadReceipt(l)}
                          title="Download slip receipt"
                          className="p-2 text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer inline-flex"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="px-6 py-4 border-t border-[#E7EAF0]/60 flex items-center justify-between shrink-0 bg-white select-none">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing <span className="font-bold text-[#1E293B]">{filteredLogs.length}</span> of {logs.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button disabled className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 font-bold opacity-60">Prev</button>
            <button disabled className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 font-bold opacity-60">Next</button>
          </div>

      </div>

      {/* Resolution Modal */}
      {resolutionModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-[#0F0F10]/40 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] select-none animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-2xl p-6 w-full max-w-md flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-3">
              <h4 className="font-poppins font-black text-sm text-[#1E293B] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Resolve Theft Anomaly
              </h4>
              <button
                onClick={() => setResolutionModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#64748B] space-y-1">
              <p><strong>Vehicle:</strong> {selectedLog.vehicleId} ({selectedLog.vehicleName})</p>
              <p><strong>Driver:</strong> {selectedLog.driver}</p>
              <p><strong>Reported Event:</strong> {selectedLog.fuelStation} ({selectedLog.qty} siphoned)</p>
            </div>

            <form onSubmit={submitResolution} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Resolution Action / Comments</label>
                <textarea
                  placeholder="Describe resolution (e.g. Sourced driver logs, fuel loss reimbursed by vendor, sensor recalibrated...)"
                  value={resolutionComment}
                  onChange={(e) => setResolutionComment(e.target.value)}
                  className="w-full p-3 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] h-24 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResolutionModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
