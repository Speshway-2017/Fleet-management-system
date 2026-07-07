import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import "../dashboard/manager.css";

const INITIAL_WORK_ORDERS = [
  {
    id: "wo1",
    vehicleId: "MH-12-AB-5678",
    vehicleName: "Ashok Leyland 3118",
    serviceType: "Tire Rotation",
    scheduledDate: "2026-07-10",
    status: "Scheduled",
    cost: "₹4,500.00",
    specialist: "Dayanand M",
    garage: "G-Tech Car Care, Pune Bypass"
  },
  {
    id: "wo2",
    vehicleId: "KA-02-AB-1456",
    vehicleName: "Tata Ace Gold",
    serviceType: "Engine Oil Change",
    scheduledDate: "2026-07-12",
    status: "In Progress",
    cost: "₹3,200.00",
    specialist: "Karan Singh",
    garage: "HP garage hub, Mumbai Corridor"
  },
  {
    id: "wo3",
    vehicleId: "AP-39-EP-9465",
    vehicleName: "Bharat Benz 211",
    serviceType: "Brake Inspection",
    scheduledDate: "2026-07-15",
    status: "Scheduled",
    cost: "₹2,800.00",
    specialist: "Ramesh P",
    garage: "Speedway Center, Bangalore road"
  }
];

export default function MaintenanceManagementPage() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("fleet_work_orders");
    if (saved) {
      setWorkOrders(JSON.parse(saved));
    } else {
      localStorage.setItem("fleet_work_orders", JSON.stringify(INITIAL_WORK_ORDERS));
      setWorkOrders(INITIAL_WORK_ORDERS);
    }
  }, []);

  const handleStartService = (orderId, e) => {
    e.stopPropagation();
    const updated = workOrders.map(w =>
      w.id === orderId ? { ...w, status: "In Progress" } : w
    );
    setWorkOrders(updated);
    localStorage.setItem("fleet_work_orders", JSON.stringify(updated));
    toast.success("Service started at garage!");
  };

  const handleCompleteOrder = (orderId, e) => {
    e.stopPropagation();
    const updated = workOrders.map(w =>
      w.id === orderId ? { ...w, status: "Completed" } : w
    );
    setWorkOrders(updated);
    localStorage.setItem("fleet_work_orders", JSON.stringify(updated));
    toast.success("Maintenance work order completed successfully!");
  };

  const filteredOrders = workOrders.filter(w => {
    const q = search.toLowerCase();
    return (
      w.vehicleId.toLowerCase().includes(q) ||
      w.vehicleName.toLowerCase().includes(q) ||
      w.serviceType.toLowerCase().includes(q)
    );
  });

  const inServiceCount = workOrders.filter(w => w.status === "In Progress").length;
  const overdueCount = workOrders.filter(w => new Date(w.scheduledDate) < new Date() && w.status !== "Completed").length;

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] font-nunito text-[#1E293B]">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} showMenuButton={true} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-4 animate-fade-in">
          
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4">
            <div>
              <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">
                Maintenance Management
              </h1>
              <p className="text-sm text-[#64748B] mt-1 font-medium font-nunito">
                Manage vehicle servicing, schedule garage work orders, and track mechanics logs.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 select-none">
              <button
                onClick={() => navigate("/manager/maintenance")}
                className="px-4 py-2 bg-[#B45A0A] text-white border border-[#B45A0A] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Overview
              </button>
              <button
                onClick={() => navigate("/manager/maintenance/upcoming")}
                className="px-4 py-2 bg-white text-[#64748B] hover:text-[#1E293B] border border-[#E7EAF0] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Upcoming Services
              </button>
              <button
                onClick={() => navigate("/manager/maintenance/schedule")}
                className="px-4 py-2 bg-white text-[#64748B] border border-[#E7EAF0] hover:text-[#1E293B] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Service</span>
              </button>
            </div>
          </div>

          {/* Stats left columns & Calendar right */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between hover-card-trigger">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Vehicles In Service</span>
                    <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">
                      {inServiceCount < 10 ? `0${inServiceCount}` : inServiceCount}
                    </h3>
                  </div>
                  <div className="bg-orange-50 text-[#B45A0A] p-3.5 rounded-xl">
                    <Wrench className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#64748B] font-medium">
                  Active garage logs: <span className="text-[#B45A0A] font-bold">{inServiceCount} Work Orders</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between hover-card-trigger">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Overdue Service</span>
                    <h3 className="text-3xl font-extrabold text-red-600 mt-2 font-poppins">
                      {overdueCount < 10 ? `0${overdueCount}` : overdueCount}
                    </h3>
                  </div>
                  <div className="bg-red-50 text-red-500 p-3.5 rounded-xl">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-red-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Requires immediate scheduling action</span>
                </div>
              </div>

            </div>

            {/* Calendar widget */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm select-none">
              <div className="flex items-center justify-between border-b border-[#E7EAF0]/60 pb-3 mb-3">
                <span className="text-xs font-bold text-[#1E293B] font-poppins">Service Calendar</span>
                <span className="text-[10px] font-bold text-[#B45A0A] uppercase tracking-wider font-poppins">July 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#64748B] mb-2 font-poppins">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium font-poppins">
                {/* Dummy days */}
                {Array.from({ length: 4 }).map((_, i) => <span key={`empty-${i}`} className="text-gray-200">2{7+i}</span>)}
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                <span>6</span><span>7</span><span>8</span><span>9</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-800 font-bold">10</span>
                <span>11</span>
                <span className="w-6 h-6 rounded-full bg-[#B45A0A] text-white flex items-center justify-center mx-auto font-black shadow-md shadow-[#B45A0A]/20">12</span>
                <span>13</span><span>14</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-800 font-bold">15</span>
                <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
                <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span>
                <span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
              </div>
            </div>
          </div>

          {/* Table list */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[#E7EAF0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Upcoming & Recent Work Orders</h3>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search work orders..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium w-[220px]"
                  />
                </div>
                
                <button className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] flex items-center gap-2 cursor-pointer">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                    <th className="py-4 px-6">Vehicle ID</th>
                    <th className="py-4 px-6">Vehicle Name</th>
                    <th className="py-4 px-6">Service Type</th>
                    <th className="py-4 px-6">Scheduled Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium font-nunito">
                        No work orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(w => (
                      <tr
                        key={w.id}
                        className="hover:bg-[#F5F7FB]/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/manager/maintenance/details/${w.id}`)}
                      >
                        <td className="py-4 px-6 font-bold text-xs text-[#1E293B] font-poppins whitespace-nowrap">
                          {w.vehicleId}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#64748B] font-medium whitespace-nowrap">
                          {w.vehicleName}
                        </td>
                        <td className="py-4 px-6 text-xs text-[#1E293B] font-semibold whitespace-nowrap">
                          {w.serviceType}
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(w.scheduledDate).toLocaleDateString("en-IN", {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            w.status === "In Progress"
                              ? "bg-amber-50 text-[#B45A0A] border border-amber-100"
                              : w.status === "Completed"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-blue-50 text-blue-600 border border-blue-100"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                          {w.status === "Scheduled" ? (
                            <button
                              onClick={(e) => handleStartService(w.id, e)}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-black shadow-sm transition-colors cursor-pointer"
                            >
                              Start Service
                            </button>
                          ) : w.status === "In Progress" ? (
                            <button
                              onClick={(e) => handleCompleteOrder(w.id, e)}
                              className="px-3.5 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-lg text-[10px] font-black shadow-sm transition-colors cursor-pointer"
                            >
                              Complete
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-bold text-xs flex items-center justify-end gap-1 select-none">
                              <CheckCircle className="w-4 h-4" />
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-[#E7EAF0]/60 flex items-center justify-between bg-white shrink-0 select-none">
              <span className="text-xs text-[#64748B] font-medium font-poppins">
                Showing <span className="font-bold text-[#1E293B]">{filteredOrders.length}</span> of {workOrders.length} entries
              </span>
              <div className="flex items-center gap-1.5">
                <button disabled className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 font-bold opacity-60">Prev</button>
                <button disabled className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-400 font-bold opacity-60">Next</button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
