import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Search,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  MapPin,
  Fuel,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

export default function AssignVehiclePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch driver
        const resDriver = await managerApi.getDriverById(id);
        const found = resDriver.data?.data || resDriver.data;
        if (found) {
          setDriver(found);
        } else {
          toast.error("Driver not found");
          navigate("/manager/drivers");
          return;
        }

        // 2. Fetch vehicles
        const resVehicles = await managerApi.getVehicles();
        const resultVehicles = resVehicles.data?.data || resVehicles.data;
        if (Array.isArray(resultVehicles)) {
          setVehicles(resultVehicles);
        }
      } catch (err) {
        toast.error("Failed to load details");
        console.error(err);
        navigate("/manager/drivers");
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleAssign = async (vehicle) => {
    if (!driver || !vehicle) return;

    const vPlate = vehicle.plateNumber || vehicle.vehicleNumber;

    try {
      // A. If vehicle already has a driver, unassign that driver on the backend if they exist
      if (vehicle.driver && vehicle.driver !== "Unassigned") {
        const confirmOverride = window.confirm(
          `This vehicle is already assigned to ${vehicle.driver}. Do you want to reassign it to ${driver.name}?`
        );
        if (!confirmOverride) return;

        try {
          const resDrivers = await managerApi.getDrivers();
          const driversList = resDrivers.data?.data || resDrivers.data;
          if (Array.isArray(driversList)) {
            const prevDriver = driversList.find(d => d.assignedVehicle === vPlate);
            if (prevDriver) {
              await managerApi.updateDriver(prevDriver._id, { assignedVehicle: "Unassigned", status: "Available" });
            }
          }
        } catch (e) {
          console.error("Failed to clear previous driver's assignment", e);
        }
      }

      // B. If this driver had a vehicle previously, clear that vehicle's driver field in the backend
      if (driver.assignedVehicle && driver.assignedVehicle !== "Unassigned") {
        try {
          const resVehicles = await managerApi.getVehicles();
          const vehiclesList = resVehicles.data?.data || resVehicles.data;
          if (Array.isArray(vehiclesList)) {
            const prevVehicle = vehiclesList.find(v => (v.plateNumber || v.vehicleNumber) === driver.assignedVehicle);
            if (prevVehicle) {
              await managerApi.updateVehicle(prevVehicle._id, { driver: "Unassigned" });
            }
          }
        } catch (e) {
          console.error("Failed to clear driver's previous vehicle assignment", e);
        }
      }

      // C. Update driver's assignedVehicle and status in backend
      await managerApi.updateDriver(driver._id, { assignedVehicle: vPlate, status: "Available" });

      // D. Update vehicle's assigned driver in backend
      await managerApi.updateVehicle(vehicle._id, { driver: driver.name });

      toast.success(`Vehicle ${vehicle.name} successfully assigned to ${driver.name}!`);
      navigate(`/manager/driver-profile/${driver._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign vehicle");
      console.error(error);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setTypeFilter("All Types");
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const query = search.toLowerCase();
    const matchesSearch =
      v.name.toLowerCase().includes(query) ||
      v.plateNumber.toLowerCase().includes(query) ||
      (v.manufacturer && v.manufacturer.toLowerCase().includes(query));

    const matchesStatus = statusFilter === "All Statuses" || v.status === statusFilter;
    const matchesType = typeFilter === "All Types" || v.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-[#22C55E] border border-emerald-100";
      case "On Trip":
        return "bg-amber-50 text-[#B45A0A] border border-amber-100";
      case "Idle":
        return "bg-slate-50 text-[#64748B] border border-slate-100";
      case "Maintenance":
        return "bg-red-50 text-[#EF4444] border border-red-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center font-poppins p-6 lg:p-8">
        <p className="text-gray-500 font-semibold">Loading Assignment Context...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Assign Vehicle</h1>
            <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
              Select a fleet vehicle to assign to <strong className="text-[#1E293B]">{driver.name}</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* --- DRIVER QUICK RESUME INFO CARD --- */}
      <div className="p-5 bg-white border border-[#E7EAF0] rounded-2xl flex items-center justify-between shadow-sm select-none mt-6">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-[#FDF3EC] text-[#B45A0A] rounded-xl flex items-center justify-center font-bold text-sm font-poppins">
            {driver.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#1E293B] text-sm">{driver.name}</p>
            <span className="text-[11px] text-[#64748B] font-semibold mt-0.5 block">DL No: {driver.licenseNumber}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-gray-400 block uppercase">Current Assignment</span>
          <span className="text-sm font-extrabold text-[#EF4444] mt-0.5 block">{driver.assignedVehicle}</span>
        </div>
      </div>

      {/* --- VEHICLES SEARCH AND FILTERS --- */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Search Vehicles */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search vehicles by model, plate number, or manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
            >
              <option>All Statuses</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>Idle</option>
              <option>Maintenance</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
            >
              <option>All Types</option>
              <option>Truck</option>
              <option>Van</option>
              <option>Tipper</option>
              <option>Trailer</option>
              <option>Bus</option>
            </select>
            <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

        </div>

        <div className="flex items-center justify-between border-t border-[#E7EAF0]/60 pt-4">
          <div className="flex items-center gap-3">
            {(search || statusFilter !== "All Statuses" || typeFilter !== "All Types") && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
          <div className="text-xs text-[#64748B] font-medium font-poppins">
            Showing <span className="font-bold text-[#1E293B]">{filteredVehicles.length}</span> candidate vehicles
          </div>
        </div>
      </div>

      {/* --- VEHICLES SELECTION GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-gray-400 font-medium">
            No vehicles matching the criteria.
          </div>
        ) : (
          filteredVehicles.map((v) => (
            <div key={v._id} className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FDF3EC] text-[#B45A0A] p-2.5 rounded-xl border border-[#FDF3EC]/50 shrink-0">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-poppins font-bold text-sm text-[#1E293B]">{v.name}</h4>
                      <span className="text-[11px] text-[#64748B] font-semibold mt-0.5 block">{v.manufacturer} • {v.type}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(v.status)}`}>
                    {v.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-xs font-semibold text-gray-500 select-none">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Branch: {v.branch}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Fuel Type: {v.fuelType}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-gray-500 font-medium">Plate Number:</span>
                  <span className="font-bold text-[#1E293B] uppercase tracking-wider">{v.plateNumber || v.vehicleNumber}</span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-[#E7EAF0]/60 pt-3">
                  <span className="text-gray-500 font-medium">Current Driver:</span>
                  {v.driver && v.driver !== "Unassigned" ? (
                    <span className="font-bold text-[#1E293B]">{v.driver}</span>
                  ) : (
                    <span className="font-bold text-[#EF4444]">Unassigned</span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E7EAF0]/60">
                <button
                  onClick={() => handleAssign(v)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    v.status === "Maintenance" || v.status === "Out of Service"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-[#B45A0A] hover:text-white text-[#B45A0A] border border-[#B45A0A] shadow-sm hover:shadow-md"
                  }`}
                  disabled={v.status === "Maintenance" || v.status === "Out of Service"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Select and Assign Vehicle</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
