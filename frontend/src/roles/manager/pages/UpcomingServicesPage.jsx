import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Plus,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Truck,
  ArrowLeft
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";
import "../dashboard/manager.css";

export default function UpcomingServicesPage() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getMaintenance();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        setWorkOrders(
          result
            .map(w => ({ ...w, id: w._id }))
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        );
      } else {
        setWorkOrders([]);
      }
    } catch (error) {
      toast.error("Failed to load work orders from database");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load from database
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleStartService = async (orderId) => {
    try {
      await managerApi.updateMaintenance(orderId, { status: "In Progress" });
      toast.success("Service started at garage!");
      fetchWorkOrders();
    } catch (error) {
      toast.error("Failed to start service");
      console.error(error);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await managerApi.updateMaintenance(orderId, { status: "Completed" });
      toast.success("Maintenance work order completed successfully!");
      fetchWorkOrders();
    } catch (error) {
      toast.error("Failed to complete service");
      console.error(error);
    }
  };

  const filteredOrders = workOrders.filter(w => {
    const q = search.toLowerCase();
    return (
      w.vehicleId.toLowerCase().includes(q) ||
      w.vehicleName.toLowerCase().includes(q) ||
      w.serviceType.toLowerCase().includes(q)
    );
  });

  const inServiceCount = workOrders.filter(w => {
    if (w.status === "Completed") return false;
    if (w.status === "In Progress") return true;
    if (w.status === "Scheduled") {
      const target = new Date(w.scheduledDate);
      target.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return target <= today;
    }
    return false;
  }).length;
  const completedCount = workOrders.filter(w => w.status === "Completed").length;

  const dueIn7DaysCount = workOrders.filter(w => {
    if (w.status === "Completed") return false;
    const target = new Date(w.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const totalEstimatedCost = workOrders
    .filter(w => w.status !== "Completed")
    .reduce((sum, w) => {
      if (!w.cost) return sum;
      const val = parseFloat(w.cost.replace(/[^\d.]/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  const formattedCost = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(totalEstimatedCost);

  const getDaysUntil = (dateStr) => {
    const today = new Date();
    const target = new Date(dateStr);
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `In ${days} days` : `Overdue`;
  };

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4 mb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Upcoming Services
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
            Visual pipeline showing vehicle queue lists due for servicing or compliance audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 select-none">
          <button
            onClick={() => navigate("/manager/maintenance")}
            className="px-4 py-2 bg-white text-[#64748B] hover:text-[#1E293B] border border-[#E7EAF0] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Overview
          </button>
          <button
            onClick={() => navigate("/manager/maintenance/upcoming")}
            className="px-4 py-2 bg-[#B45A0A] text-white border border-[#B45A0A] rounded-xl text-xs font-bold transition-all cursor-pointer"
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

          {/* Metrics summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Completed Services</span>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-2 font-poppins">{completedCount} Units</h3>
              <div className="mt-3 text-[10px] text-gray-400 font-medium">All compliance cleared</div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Due in 7 Days</span>
              <h3 className="text-2xl font-extrabold text-red-600 mt-2 font-poppins">{String(dueIn7DaysCount).padStart(2, '0')} Vehicles</h3>
              <div className="mt-3 text-[10px] text-red-500 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Overdue alerts active
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">In Service</span>
              <h3 className="text-2xl font-extrabold text-[#B45A0A] mt-2 font-poppins">{inServiceCount} Services</h3>
              <div className="mt-3 text-[10px] text-gray-400 font-medium">Active in workshop</div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger">
              <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Estimated Cost</span>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-2 font-poppins">{formattedCost}</h3>
              <div className="mt-3 text-[10px] text-gray-400 font-medium">Auto-invoice projections</div>
            </div>

          </div>

          {/* Queue lists (Full Width) */}
          <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">Schedule Garage Queue</h3>

                <div className="relative select-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search queue..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 pr-4 py-1.5 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium w-[180px] bg-white"
                  />
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs bg-white rounded-2xl border border-[#E7EAF0] shadow-sm">
                  No upcoming workshop orders found.
                </div>
              ) : (
                filteredOrders.map(w => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`/manager/maintenance/details/${w.id}`)}
                    className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm hover:border-[#B45A0A] transition-all cursor-pointer flex items-center justify-between select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-[#FDF3EC] text-[#B45A0A] p-3 rounded-xl shrink-0">
                        <Truck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-gray-400 font-poppins uppercase tracking-wider">{w.vehicleId}</p>
                        <h4 className="font-bold text-base text-[#1E293B] font-poppins mt-0.5">{w.vehicleName} • {w.serviceType}</h4>
                        <span className="text-xs text-[#64748B] font-medium block mt-1">
                          Garage: {w.garage}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-[#64748B] uppercase block">Timeline due</span>
                        <span className="text-xs font-black text-red-500 mt-1 inline-block">{getDaysUntil(w.scheduledDate)}</span>
                      </div>

                      {w.status === "Scheduled" ? (
                        <button
                          onClick={(e) => handleStartService(w.id, e)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                        >
                          Start Service
                        </button>
                      ) : w.status === "In Progress" ? (
                        <button
                          onClick={() => navigate(`/manager/maintenance/details/${w.id}`)}
                          className="px-4 py-2 bg-white border border-gray-200 text-[#B45A0A] hover:bg-gray-50 rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                        >
                          View Details
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 select-none">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
          </div>

        </div>
    );
}
