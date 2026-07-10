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
        setWorkOrders(result.map(w => ({ ...w, id: w._id })));
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

  const inServiceCount = workOrders.filter(w => w.status === "In Progress").length;
  const overdueCount = workOrders.filter(w => new Date(w.scheduledDate) < new Date() && w.status !== "Completed").length;
  const completedCount = workOrders.filter(w => w.status === "Completed").length + 42; // baseline

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
              <h3 className="text-2xl font-extrabold text-red-600 mt-2 font-poppins">04 Vehicles</h3>
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
              <h3 className="text-2xl font-extrabold text-blue-600 mt-2 font-poppins">₹16,700.00</h3>
              <div className="mt-3 text-[10px] text-gray-400 font-medium">Auto-invoice projections</div>
            </div>

          </div>

          {/* Columns layout split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Queue lists left */}
            <div className="lg:col-span-2 space-y-4">
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

            {/* Side tools right column */}
            <div className="space-y-6">

              {/* Compliance warning banner */}
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 text-white flex flex-col space-y-4 shadow-xl select-none">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse shrink-0" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-poppins font-bold">Requires Compliance Review</span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  Vehicle <strong>MH-12-AB-5678</strong> has expired safety certification since Jul 01. Schedule general overhaul immediately.
                </p>
                <button
                  onClick={() => {
                    toast.success("Redirecting to compliance documents...");
                    navigate("/manager/documents/compliance-audit");
                  }}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                >
                  View Compliance
                </button>
              </div>

              {/* Monthly calendar visual picker */}
              <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm select-none">
                <div className="flex items-center justify-between border-b border-[#E7EAF0]/60 pb-3 mb-3">
                  <span className="text-xs font-bold text-[#1E293B] font-poppins">Select Workshop Date</span>
                  <span className="text-[10px] font-bold text-[#B45A0A] uppercase tracking-wider font-poppins">July 2026</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#64748B] mb-2 font-poppins">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium font-poppins">
                  {/* Dummy days placeholder */}
                  {Array.from({ length: 4 }).map((_, i) => <span key={`empty-${i}`} className="text-gray-200">2{7 + i}</span>)}
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

          </div>

        </div>
    );
}
