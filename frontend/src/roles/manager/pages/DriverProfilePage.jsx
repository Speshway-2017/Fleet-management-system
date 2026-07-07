import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Award,
  Calendar,
  AlertTriangle,
  UserCheck,
  Star,
  MapPin,
  TrendingUp,
  Activity,
  History,
  FileCheck,
  Shield,
  Edit,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";

const MOCK_TRIPS_ROSTER = [
  { id: "T-9081", route: "Pune Depot to Mumbai Depot", date: "2026-07-04", status: "Completed", fuelUsed: "45L" },
  { id: "T-8942", route: "Mumbai Port to Pune Chinchwad", date: "2026-06-29", status: "Completed", fuelUsed: "48L" },
  { id: "T-8711", route: "Pune Depot to Hyderabad Depot", date: "2026-06-15", status: "Completed", fuelUsed: "120L" },
  { id: "T-8521", route: "Local Delivery Pune City", date: "2026-06-10", status: "Completed", fuelUsed: "15L" }
];

export default function DriverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    // Load drivers
    const savedDrivers = localStorage.getItem("fleet_drivers");
    if (savedDrivers) {
      const driversList = JSON.parse(savedDrivers);
      const foundDriver = driversList.find(d => d.id === Number(id));
      if (foundDriver) {
        setDriver(foundDriver);

        // Load corresponding vehicle details if assigned
        if (foundDriver.assignedVehicle && foundDriver.assignedVehicle !== "Unassigned") {
          const savedVehicles = localStorage.getItem("fleet_vehicles");
          if (savedVehicles) {
            const vehiclesList = JSON.parse(savedVehicles);
            const foundVehicle = vehiclesList.find(v => v.plateNumber === foundDriver.assignedVehicle);
            if (foundVehicle) {
              setVehicle(foundVehicle);
            }
          }
        }
      } else {
        toast.error("Driver not found");
        navigate("/manager/drivers");
      }
    }
  }, [id, navigate]);

  const handleUnassignVehicle = () => {
    if (!driver || !vehicle) return;

    // 1. Update driver's assignedVehicle to "Unassigned"
    const savedDrivers = localStorage.getItem("fleet_drivers");
    let updatedDriver = { ...driver, assignedVehicle: "Unassigned", status: "Available" };
    if (savedDrivers) {
      const driversList = JSON.parse(savedDrivers);
      const updatedDrivers = driversList.map(d => d.id === driver.id ? updatedDriver : d);
      localStorage.setItem("fleet_drivers", JSON.stringify(updatedDrivers));
    }

    // 2. Update vehicle's assigned driver to "Unassigned"
    const savedVehicles = localStorage.getItem("fleet_vehicles");
    if (savedVehicles) {
      const vehiclesList = JSON.parse(savedVehicles);
      const updatedVehicles = vehiclesList.map(v => 
        v.plateNumber === vehicle.plateNumber ? { ...v, driver: "Unassigned" } : v
      );
      localStorage.setItem("fleet_vehicles", JSON.stringify(updatedVehicles));
    }

    setDriver(updatedDriver);
    setVehicle(null);
    toast.success("Vehicle unassigned successfully from driver!");
  };

  if (!driver) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center font-poppins p-6 lg:p-8">
        <p className="text-gray-500 font-semibold">Loading Driver Details...</p>
      </div>
    );
  }

  // Calculate compliance health
  const expiryDate = new Date(driver.licenseExpiry);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let complianceStatus = "Valid";
  let complianceColor = "text-[#22C55E] bg-emerald-50 border-emerald-100";
  if (diffDays < 0) {
    complianceStatus = "Expired";
    complianceColor = "text-[#EF4444] bg-red-50 border-red-100";
  } else if (diffDays <= 30) {
    complianceStatus = "Expiring Soon";
    complianceColor = "text-[#F59E0B] bg-amber-50 border-amber-100";
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      {/* --- TOP PROFILE HEADER WITH BACK BUTTON --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/manager/drivers")}
            className="p-2.5 bg-white border border-[#E7EAF0] hover:bg-[#F5F7FB] rounded-xl text-[#64748B] hover:text-[#1E293B] transition-all cursor-pointer"
            title="Back to Roster"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FDF3EC] text-[#B45A0A] rounded-2xl flex items-center justify-center border border-[#FDF3EC] font-poppins font-black text-xl select-none">
              {getInitials(driver.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-poppins font-black text-2xl text-[#1E293B] tracking-tight">{driver.name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  driver.status === "Available" ? "bg-emerald-50 text-[#22C55E]" :
                  driver.status === "On Trip" ? "bg-amber-50 text-[#B45A0A]" :
                  "bg-red-50 text-[#EF4444]"
                }`}>
                  {driver.status}
                </span>
              </div>
              <p className="text-sm text-[#64748B] mt-0.5 font-medium">{driver.email} • {driver.phone}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {driver.assignedVehicle === "Unassigned" && (
            <button
              onClick={() => navigate(`/manager/driver-assign-vehicle/${driver.id}`)}
              className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 font-poppins cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Assign Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* --- DRIVER QUICK STATS OVERVIEW --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total Trips</span>
              <p className="text-xl font-extrabold text-[#1E293B] mt-0.5 font-poppins">{driver.tripsCompleted}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 text-amber-500 p-2.5 rounded-xl">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Driver Rating</span>
              <p className="text-xl font-extrabold text-[#1E293B] mt-0.5 font-poppins">{driver.rating} / 5.0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-50 text-[#EF4444] p-2.5 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Safety Incidents</span>
              <p className="text-xl font-extrabold text-[#1E293B] mt-0.5 font-poppins">{driver.incidentCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Medical Fitness</span>
              <p className="text-xl font-extrabold text-[#22C55E] mt-0.5 font-poppins">{driver.medicalFitnessStatus}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        
        {/* --- LEFT COLUMN: COMPLIANCE & PERSONAL DETAILS --- */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Compliance & License Certificate */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] border-b border-[#E7EAF0]/60 pb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              License & Compliance
            </h3>

            <div className="grid grid-cols-2 gap-4 select-none">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">License Number</span>
                <span className="text-sm font-bold text-[#1E293B] mt-1 block">{driver.licenseNumber}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">License Type</span>
                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block mt-1 font-poppins">
                  {driver.licenseType}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Expiry Date</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">
                  {new Date(driver.licenseExpiry).toLocaleDateString("en-IN", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">License Compliance</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5 ${complianceColor}`}>
                  {complianceStatus}
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-[#E7EAF0] rounded-xl flex items-center justify-between text-xs mt-2">
              <div>
                <p className="font-bold text-[#1E293B]">Driving License scan copy</p>
                <span className="text-gray-400 block mt-0.5">Uploaded: DL_scan_pdf.pdf</span>
              </div>
              <button 
                onClick={() => toast.success("Opening driving license document preview...")}
                className="text-[#B45A0A] hover:underline font-bold"
              >
                View Document
              </button>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] border-b border-[#E7EAF0]/60 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Employment & Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Experience</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{driver.experience}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Joining Date</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">
                  {new Date(driver.joiningDate).toLocaleDateString("en-IN", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Employment Type</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">Full-Time Staff</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Terminal Branch</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">Pune Hub Depot</span>
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: VEHICLE DETAILS & TRIP LOGS --- */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Vehicle details */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] border-b border-[#E7EAF0]/60 pb-3 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-500" />
              Current Vehicle Assignment
            </h3>

            {vehicle ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center gap-3 select-none">
                  <div className="bg-[#FDF3EC] text-[#B45A0A] p-2.5 rounded-xl border border-[#FDF3EC]/50 shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1E293B] font-poppins">{vehicle.name}</p>
                    <span className="text-[11px] text-[#64748B] font-semibold tracking-wider block mt-0.5">{vehicle.plateNumber}</span>
                  </div>
                  <span className="ml-auto bg-[#FDF3EC] text-[#B45A0A] border border-[#FDF3EC] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {vehicle.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 p-1">
                  <div>
                    <span>Branch Depot:</span>
                    <span className="text-[#1E293B] block font-bold text-sm mt-0.5">{vehicle.branch}</span>
                  </div>
                  <div>
                    <span>Fuel Configuration:</span>
                    <span className="text-[#1E293B] block font-bold text-sm mt-0.5">{vehicle.fuelType} ({vehicle.fuelLevel}%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleUnassignVehicle}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-100 cursor-pointer"
                  >
                    Unassign Vehicle
                  </button>
                  <button
                    onClick={() => navigate(`/manager/driver-assign-vehicle/${driver.id}`)}
                    className="w-full py-2 bg-white hover:bg-gray-50 text-[#64748B] hover:text-[#1E293B] rounded-xl text-xs font-bold transition-all border border-[#E7EAF0] cursor-pointer"
                  >
                    Change Vehicle
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-gray-400 text-xs font-medium">No vehicle assigned to this driver currently.</p>
                <button
                  onClick={() => navigate(`/manager/driver-assign-vehicle/${driver.id}`)}
                  className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Assign Vehicle Now
                </button>
              </div>
            )}
          </div>

          {/* Recent Trips timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] border-b border-[#E7EAF0]/60 pb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Recent Trip Log
            </h3>

            <div className="space-y-4">
              {MOCK_TRIPS_ROSTER.map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#1E293B] font-poppins">{trip.id}</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1">{trip.route}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 block font-poppins">{trip.date}</span>
                    <span className="text-[10px] text-[#64748B] font-semibold block mt-0.5">Cons: {trip.fuelUsed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
