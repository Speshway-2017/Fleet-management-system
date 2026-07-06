import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Plus,
  ChevronDown
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

export default function ScheduleServicePage() {
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedServiceType, setSelectedServiceType] = useState("General Service");
  const [selectedDate, setSelectedDate] = useState("2026-07-12");
  const [comments, setComments] = useState("");

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("fleet_vehicles");
    if (saved) {
      setVehicles(JSON.parse(saved));
    }
  }, []);

  // Sync first vehicle to state
  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(String(vehicles[0].id));
    }
  }, [vehicles]);

  const handleScheduleService = (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }

    const vehicleObj = vehicles.find(v => String(v.id) === String(selectedVehicleId));
    
    // Get existing work orders
    let workOrders = [];
    const savedOrders = localStorage.getItem("fleet_work_orders");
    if (savedOrders) {
      workOrders = JSON.parse(savedOrders);
    } else {
      workOrders = INITIAL_WORK_ORDERS;
    }

    const newOrder = {
      id: `wo${Date.now()}`,
      vehicleId: vehicleObj ? vehicleObj.plateNumber : "MH-12-XX-0000",
      vehicleName: vehicleObj ? vehicleObj.name : "Custom Fleet Vehicle",
      serviceType: selectedServiceType,
      scheduledDate: selectedDate,
      status: "Scheduled",
      cost: selectedServiceType === "General Service" ? "₹6,500.00" : selectedServiceType === "Engine Tune-up" ? "₹8,200.00" : selectedServiceType === "Brake Check" ? "₹2,500.00" : "₹4,800.00",
      specialist: "Dayanand M",
      garage: "G-Tech Car Care, Pune Bypass"
    };

    const updatedOrders = [newOrder, ...workOrders];
    localStorage.setItem("fleet_work_orders", JSON.stringify(updatedOrders));
    
    toast.success("New maintenance service scheduled successfully!");
    navigate("/manager/maintenance");
  };

  const getEstimatedCost = () => {
    if (selectedServiceType === "General Service") return { cost: "₹6,500.00", estDays: "1 Day" };
    if (selectedServiceType === "Engine Tune-up") return { cost: "₹8,200.00", estDays: "2 Days" };
    if (selectedServiceType === "Brake Check") return { cost: "₹2,500.00", estDays: "4 Hours" };
    return { cost: "₹4,800.00", estDays: "6 Hours" };
  };

  const costEst = getEstimatedCost();

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] font-nunito text-[#1E293B]">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} showMenuButton={true} />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar space-y-4 animate-fade-in">
          
          {/* Header block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4">
            <div>
              <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">
                Schedule Service
              </h1>
              <p className="text-sm text-[#64748B] mt-1 font-medium font-nunito">
                Select a fleet vehicle and book mechanic workshop slots.
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 select-none">
              <button
                onClick={() => navigate("/manager/maintenance")}
                className="px-4 py-2 bg-white text-[#64748B] hover:text-[#1E293B] border border-[#E7EAF0] rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                className="px-4 py-2 bg-[#B45A0A] text-white border border-[#B45A0A] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Schedule Service</span>
              </button>
            </div>
          </div>

          {/* Form grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form details left */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-6">
              <div>
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">Schedule Maintenance Service</h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium font-nunito">
                  Pick diagnostic categories and target garage logs.
                </p>
              </div>

              <form onSubmit={handleScheduleService} className="space-y-5">
                
                {/* Select Vehicle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Select Vehicle</label>
                  <div className="relative">
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                    >
                      {vehicles.length === 0 ? (
                        <option value="">No vehicles found in fleet</option>
                      ) : (
                        vehicles.map(v => (
                          <option key={v.id} value={v.id}>
                            {v.name} ({v.plateNumber})
                          </option>
                        ))
                      )}
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Service type grid selection cards */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">Service Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      "General Service",
                      "Engine Tune-up",
                      "Brake Check",
                      "Tire Change"
                    ].map(type => (
                      <div
                        key={type}
                        onClick={() => setSelectedServiceType(type)}
                        className={`p-3 border rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 select-none ${
                          selectedServiceType === type
                            ? "border-[#B45A0A] bg-orange-50/15 shadow-sm"
                            : "border-[#E7EAF0] bg-white hover:bg-gray-50/60"
                        }`}
                      >
                        <Wrench className={`w-5 h-5 ${selectedServiceType === type ? "text-[#B45A0A]" : "text-gray-400"}`} />
                        <span className={`text-[10px] font-bold block ${selectedServiceType === type ? "text-[#B45A0A]" : "text-gray-500"}`}>
                          {type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Select Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-xs text-[#1E293B] focus:outline-none focus:border-[#B45A0A]"
                  />
                </div>

                {/* Comments */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">Additional Comments</label>
                  <textarea
                    placeholder="Add any specific diagnostic complaints or mechanic instructions..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full p-3 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] h-20 resize-none"
                  />
                </div>

                {/* Submit buttons */}
                <div className="flex justify-end gap-3 pt-2 border-t border-[#E7EAF0]/60">
                  <button
                    type="button"
                    onClick={() => navigate("/manager/maintenance")}
                    className="px-4 py-2 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                  >
                    Schedule Service
                  </button>
                </div>

              </form>
            </div>

            {/* Right column details */}
            <div className="space-y-6">
              
              {/* Monthly calendar widget */}
              <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm select-none">
                <div className="flex items-center justify-between border-b border-[#E7EAF0]/60 pb-3 mb-3">
                  <span className="text-xs font-bold text-[#1E293B] font-poppins">Select Workshop Date</span>
                  <span className="text-[10px] font-bold text-[#B45A0A] uppercase tracking-wider font-poppins font-poppins">July 2026</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#64748B] mb-2 font-poppins">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium font-poppins">
                  {/* Dummy days placeholder */}
                  {Array.from({ length: 4 }).map((_, i) => <span key={`empty-${i}`} className="text-gray-200">2{7+i}</span>)}
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                  <span>6</span><span>7</span><span>8</span><span>9</span>
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-800 font-bold">10</span>
                  <span>11</span>
                  <span
                    onClick={() => setSelectedDate("2026-07-12")}
                    className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto cursor-pointer font-bold transition-all ${
                      selectedDate === "2026-07-12"
                        ? "bg-[#B45A0A] text-white font-black shadow-md shadow-[#B45A0A]/20"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    12
                  </span>
                  <span>13</span><span>14</span>
                  <span
                    onClick={() => setSelectedDate("2026-07-15")}
                    className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto cursor-pointer font-bold transition-all ${
                      selectedDate === "2026-07-15"
                        ? "bg-[#B45A0A] text-white font-black shadow-md shadow-[#B45A0A]/20"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    15
                  </span>
                  <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span>
                  <span>21</span><span>22</span><span>23</span><span>24</span><span>25</span>
                  <span>26</span><span>27</span><span>28</span><span>29</span><span>30</span>
                </div>
              </div>

              {/* Estimate cost breakdown summary box */}
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 text-white flex flex-col space-y-4 shadow-lg select-none">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-poppins">Summary & Cost Estimation</span>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Selected Service:</span>
                    <span className="font-bold text-white font-poppins">{selectedServiceType}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Estimated Duration:</span>
                    <span className="font-bold text-white font-poppins">{costEst.estDays}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/10 pt-3 text-xs">
                    <span className="text-gray-400 font-bold">Estimated Cost:</span>
                    <span className="text-sm font-black text-orange-400 font-poppins">{costEst.cost}</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-gray-400 leading-relaxed bg-white/5 rounded-lg p-2.5 border border-white/5">
                  *Cost is estimated based on baseline part swaps and standard mechanical labor rates.
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
