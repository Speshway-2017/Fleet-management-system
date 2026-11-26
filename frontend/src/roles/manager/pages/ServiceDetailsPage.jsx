import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Wrench,
  CheckCircle,
  X,
  FileText,
  User,
  ArrowLeft,
  Truck,
  Battery,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";
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

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);

  // Load from database
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await managerApi.getMaintenanceById(id);
        const data = response.data?.data || response.data;
        if (data) {
          setOrder({ ...data, id: data._id });
        }
      } catch (error) {
        toast.error("Failed to load service details");
        console.error(error);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    if (!order) return;
    const fetchVehicle = async () => {
      try {
        const response = await managerApi.getVehicles();
        const list = response.data?.data || response.data || [];
        const match = list.find(v => v.plateNumber.replace(/\s+/g, "").toLowerCase() === order.vehicleId.replace(/\s+/g, "").toLowerCase());
        if (match) {
          setVehicleDetails(match);
        }
      } catch (error) {
        console.error("Failed to fetch vehicle details", error);
      }
    };
    fetchVehicle();
  }, [order]);

  const handleCompleteOrder = async () => {
    if (!order) return;
    try {
      const response = await managerApi.updateMaintenance(order._id, { status: "Completed" });
      const data = response.data?.data || response.data;
      setOrder({ ...data, id: data._id });
      toast.success("Maintenance work order completed successfully!");
    } catch (error) {
      toast.error("Failed to complete work order");
      console.error(error);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await managerApi.deleteMaintenance(order._id);
      toast.success("Maintenance work order cancelled and deleted");
      navigate("/manager/maintenance");
    } catch (error) {
      toast.error("Failed to cancel maintenance order");
      console.error(error);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-t-[#A14000] border-r-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold font-poppins">Loading Service details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
              Vehicle {order.vehicleId}
            </h1>
            <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-poppins mt-1 ${
              order.status === "Completed"
                ? "bg-emerald-50 text-[#059669] border border-emerald-100"
                : "bg-amber-50 text-[#D97706] border border-amber-100"
            }`}>
              {order.status === "Completed" ? "AVAILABLE" : "IN GARAGE"}
            </span>
          </div>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
            Comprehensive parts checklists and mechanic specialists diagnostics for {order.vehicleName}.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 select-none">
          {order.status !== "Completed" && (
            <button
              onClick={handleCompleteOrder}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Complete Order
            </button>
          )}
          <button
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            Cancel / Delete Order
          </button>
        </div>
      </div>

      {/* Metadata Cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 select-none mb-6">
            
            {/* Meta 1: Progress */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-4 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Service Progress</span>
              <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1">
                <CheckCircle className={`w-4 h-4 ${order.status === "Completed" ? "text-emerald-500" : "text-amber-500"}`} />
                {order.status}
              </p>
            </div>

            {/* Meta 2: Garage */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-4 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Garage Name</span>
              <p className="text-sm font-black text-slate-800 mt-1 truncate">{order.garage.split(",")[0]}</p>
            </div>

            {/* Meta 3: Specialist */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-4 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Specialist Mechanic</span>
              <p className="text-sm font-black text-slate-800 mt-1 flex items-center gap-1">
                <User className="w-4 h-4 text-[#A14000]" />
                {order.specialist}
              </p>
            </div>

            {/* Meta 4: Cost */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-4 shadow-sm">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total Bill Amount</span>
              <p className="text-sm font-black text-[#A14000] mt-1 font-poppins">{order.cost}</p>
            </div>

          </div>

          {/* Content Split columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
             {/* Detailed task log table left */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col p-6 space-y-4">
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">Detailed Service Log</h3>
                
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs font-nunito">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[#64748B] font-poppins font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Task Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-gray-700">
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1E293B]">10K Service Checkup</td>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-4 text-right">₹2,500.00</td>
                        <td className="py-3 px-4 text-right">₹2,500.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1E293B]">Engine Oil & Oil Filter Replacement</td>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-4 text-right">₹4,200.00</td>
                        <td className="py-3 px-4 text-right">₹4,200.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1E293B]">Brake Pad Overhaul & Clean</td>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-4 text-right">₹1,800.00</td>
                        <td className="py-3 px-4 text-right">₹1,800.00</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-[#1E293B]">Air filter swap</td>
                        <td className="py-3 px-4 text-center">1</td>
                        <td className="py-3 px-4 text-right">₹800.00</td>
                        <td className="py-3 px-4 text-right">₹800.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[#E7EAF0]/60 pt-4 flex items-center justify-between select-none">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total Estimated Service Cost:</span>
                  <span className="text-base font-black text-[#A14000] font-poppins">₹9,300.00</span>
                </div>
              </div>

              {/* Vehicle Specifications details list block */}
              <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">Vehicle Profile Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-nunito">
                  <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[#64748B] font-semibold">Model Name:</span>
                    <span className="font-bold text-[#1E293B]">{order.vehicleName}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[#64748B] font-semibold">Plate Number:</span>
                    <span className="font-bold text-[#1E293B] font-poppins">{order.vehicleId}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[#64748B] font-semibold">Assigned Driver:</span>
                    <span className="font-bold text-[#1E293B]">{vehicleDetails ? vehicleDetails.driver : "Rajesh Kumar"}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[#64748B] font-semibold">Odometer Mileage:</span>
                    <span className="font-bold text-[#1E293B]">{vehicleDetails ? `${parseInt(vehicleDetails.odometer).toLocaleString("en-IN")} km` : "42,500 km"}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[#64748B] font-semibold">Fuel Status:</span>
                    <span className="font-bold text-[#1E293B]">{vehicleDetails ? `${vehicleDetails.fuelLevel}%` : "78%"}</span>
                  </div>
                  <div className="p-3.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <span className="text-[#64748B] font-semibold">Registration Authority:</span>
                    <span className="font-bold text-[#1E293B]">MH RTO Office, Pune</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Checklist & telematics gauge right */}
            <div className="space-y-6">
              
              {/* Instructions checklist */}
              <div className="bg-slate-900 border border-slate-950 rounded-2xl p-5 text-white flex flex-col space-y-4 shadow-xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-poppins">Special Instructions Checklist</span>
                
                <div className="space-y-3.5 text-xs text-gray-200">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#A14000] rounded cursor-pointer" />
                    <span>Please check oil levels.</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#A14000] rounded cursor-pointer" />
                    <span>Brake pedal feels spongy on highways.</span>
                  </label>
                </div>

                {order.status !== "Completed" && (
                  <button
                    onClick={handleCompleteOrder}
                    className="w-full py-2.5 bg-[#A14000] hover:bg-[#853400] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#A14000]/20 cursor-pointer"
                  >
                    Complete Service
                  </button>
                )}
              </div>

              {/* Gauges */}
              <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm space-y-4 select-none">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Telematics Diagnostics</span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>Engine Temperature</span>
                    <span className="text-emerald-600">90 °C</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">Optimal Running Threshold</span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-50">
                  <div className="flex justify-between text-xs font-bold text-[#1E293B]">
                    <span>Battery voltage</span>
                    <span className="text-emerald-600">12.6V</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "90%" }} />
                  </div>
                  <span className="text-[9px] text-gray-400 font-medium">Full charge battery integrity</span>
                </div>
              </div>

            </div>

          </div>

        </div>
    );
}
