import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  Award,
  Calendar,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Activity,
  History,
  FileCheck,
  Shield,
  Edit,
  Plus,
  Loader
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { formatDisplayLocation } from "@/utils/locationFormatter";
import { formatEmployeeId } from "@/utils/employeeIdFormatter";
import { driverApi } from "@/api/driverApi";
import { vehicleApi } from "@/api/vehicleApi";
import { managerApi } from "../api/managerApi";

const CITY_COORDINATES = {
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  hyderabad: [17.3850, 78.4867],
  delhi: [28.7041, 77.1025],
  chennai: [13.0827, 80.2707],
  kolhapur: [16.7050, 74.2433],
  satara: [17.6805, 73.9918],
  anantapur: [14.6819, 77.6006],
  goa: [15.2993, 74.1240],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462]
};

const getCoordinates = (cityName) => {
  if (!cityName) return [18.5204, 73.8567];
  const norm = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (norm.includes(key)) return coords;
  }
  return [18.5204, 73.8567];
};

const calculateDistance = (startCity, endCity) => {
  const startCoords = getCoordinates(startCity);
  const endCoords = getCoordinates(endCity);

  if (startCoords[0] === 18.5204 && startCoords[1] === 73.8567 && 
      endCoords[0] === 18.5204 && endCoords[1] === 73.8567) {
    return 350;
  }

  const R = 6371;
  const dLat = (endCoords[0] - startCoords[0]) * Math.PI / 180;
  const dLon = (endCoords[1] - startCoords[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(startCoords[0] * Math.PI / 180) * Math.cos(endCoords[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d);
};

export default function DriverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [tripsError, setTripsError] = useState("");
  const [showAllTrips, setShowAllTrips] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      setLoadingTrips(true);
      setTripsError("");
      const res = await managerApi.getTrips({ driver: id });
      const fetchedTrips = res.data?.data ?? [];
      const driverTrips = fetchedTrips.filter(t => {
        const tripDriverId = typeof t.driver === 'object' ? t.driver?._id : t.driver;
        return String(tripDriverId) === String(id);
      });
      const sorted = driverTrips.sort(
        (a, b) => new Date(b.departureTime || b.createdAt) - new Date(a.departureTime || a.createdAt)
      );
      setTrips(sorted);
    } catch (err) {
      console.error("Failed to load driver trips:", err);
      setTripsError("Failed to load trips for this driver.");
    } finally {
      setLoadingTrips(false);
    }
  }, [id]);

  const normaliseVehicle = (v) => ({
    ...v,
    id:           v._id,
    name:         `${v.brand} ${v.model}`,
    manufacturer: v.brand,
    plateNumber:  v.vehicleNumber,
    type:         v.type         || 'Truck',
    driver:       v.driver       || 'Unassigned',
    fuelLevel:    v.fuelLevel    ?? 50,
    fastagBalance:v.fastagBalance ?? 0,
    branch:       v.branch       || '',
    dateAdded:    v.createdAt ? v.createdAt.split('T')[0] : '',
    status: {
      ACTIVE:          'Available',
      IDLE:            'Idle',
      MAINTENANCE:     'Maintenance',
      ON_TRIP:         'On Trip',
      OUT_OF_SERVICE:  'Out of Service',
    }[v.status] ?? v.status,
  });

  const fetchDriverData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Get driver
      const res = await driverApi.getById(id);
      const foundDriver = res.data?.data;
      if (!foundDriver) {
        toast.error("Driver not found");
        navigate("/manager/drivers");
        return;
      }
      setDriver(foundDriver);

      // 2. Fetch corresponding vehicle details if assigned
      if (foundDriver.assignedVehicle && foundDriver.assignedVehicle !== "Unassigned") {
        try {
          const vehRes = await vehicleApi.list();
          const rawVehicles = vehRes.data?.data ?? [];
          const foundVehicle = rawVehicles.find(v => v.vehicleNumber === foundDriver.assignedVehicle);
          if (foundVehicle) {
            setVehicle(normaliseVehicle(foundVehicle));
          } else {
            setVehicle(null);
          }
        } catch (err) {
          console.error("Failed to load vehicle details:", err);
        }
      } else {
        setVehicle(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load driver profile.");
      navigate("/manager/drivers");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDriverData();
    fetchTrips();
  }, [fetchDriverData, fetchTrips]);

  const handleUnassignVehicle = async () => {
    if (!driver || !vehicle) return;

    try {
      // 1. Update driver's assignedVehicle to "Unassigned"
      await driverApi.update(driver._id, { assignedVehicle: "Unassigned" });

      // 2. Update vehicle's assigned driver to "Unassigned"
      await vehicleApi.update(vehicle.id, { driver: "Unassigned" });

      toast.success("Vehicle unassigned successfully from driver!");
      fetchDriverData();
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unassign vehicle.");
    }
  };



  if (!driver) return null;

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

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusLabel = (s) => ({ AVAILABLE: "Available", ON_TRIP: "On Trip", SUSPENDED: "Suspended" }[s] || s);

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* --- TOP PROFILE HEADER WITH BACK BUTTON --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div className="flex items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FDF3EC] text-[#A14000] rounded-2xl flex items-center justify-center border border-[#FDF3EC] font-poppins font-black text-xl select-none overflow-hidden shrink-0">
              {driver.profileImage ? (
                <img src={driver.profileImage} alt={driver.fullName} className="w-full h-full object-cover" />
              ) : (
                getInitials(driver.fullName)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">{driver.fullName}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  driver.driverStatus === "AVAILABLE" ? "bg-emerald-50 text-[#22C55E]" :
                  driver.driverStatus === "ON_TRIP" ? "bg-amber-50 text-[#A14000]" :
                  "bg-red-50 text-[#EF4444]"
                }`}>
                  {getStatusLabel(driver.driverStatus)}
                </span>
              </div>
              <p className="text-sm text-[#64748B] mt-0.5 font-medium font-poppins"><strong className="text-[#1E293B]">{formatEmployeeId(driver.employeeId)}</strong> • {driver.email} • {driver.phoneNumber}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/manager/edit-driver/${driver._id}`)}
            className="px-4.5 py-2.5 border border-[#E7EAF0] bg-white hover:bg-gray-50 rounded-xl text-xs font-bold text-[#64748B] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* --- DRIVER QUICK STATS OVERVIEW --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Completed Trips</span>
              <p className="text-xl font-extrabold text-[#1E293B] mt-0.5 font-poppins">
                {trips.filter(t => t.status === "Completed").length} <span className="text-xs text-gray-500 font-normal">({trips.length} Total)</span>
              </p>
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
              <p className="text-xl font-extrabold text-[#1E293B] mt-0.5 font-poppins">{driver.incidentCount ?? 0}</p>
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
              <p className={`text-xl font-extrabold mt-0.5 font-poppins ${
                String(driver.medicalFitnessStatus).includes("Unfit") ? "text-red-500" :
                String(driver.medicalFitnessStatus).includes("Review") ? "text-amber-500" :
                "text-emerald-600"
              }`}>{driver.medicalFitnessStatus || "✅ Fit"}</p>
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

              <div 
                className="p-2 -m-2 rounded-xl border border-transparent"
              >
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Expiry Date</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">
                  {driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString("en-IN", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : "—"}
                </span>
              </div>

              <div 
                className="p-2 -m-2 rounded-xl border border-transparent"
              >
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">License Compliance</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1.5 ${complianceColor}`}>
                  {complianceStatus}
                </span>
              </div>
            </div>

            {driver.licenseDocument ? (
              <div className="p-4 bg-gray-50 border border-[#E7EAF0] rounded-xl flex items-center justify-between text-xs mt-2">
                <div>
                  <p className="font-bold text-[#1E293B]">Driving License scan copy</p>
                  <span className="text-gray-400 block mt-0.5 truncate max-w-[200px]">{driver.licenseDocument.split("/").pop()}</span>
                </div>
                <a 
                  href={driver.licenseDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A14000] hover:underline font-bold"
                >
                  View Document
                </a>
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-medium italic mt-2">No license document uploaded.</p>
            )}
          </div>

        </div>

        {/* --- RIGHT COLUMN: PERSONAL INFO & TRIP LOGS --- */}
        <div className="lg:col-span-6 space-y-6">

          {/* Personal Details */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] border-b border-[#E7EAF0]/60 pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Employment & Personal Information
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Experience</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">{driver.experience || "—"}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Joining Date</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">
                  {driver.joiningDate ? new Date(driver.joiningDate).toLocaleDateString("en-IN", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }) : "—"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Employment Type</span>
                <span className="text-sm font-semibold text-[#1E293B] mt-1 block">Full-Time Staff</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-300 uppercase tracking-wider block">Current Location</span>
                <span className="text-sm font-semibold text-[#1E293B] dark:text-white mt-1 block">
                  {driver.driverLocation || driver.currentLocation || driver.city || driver.address || (driver.branch && driver.branch !== "Pune" ? driver.branch : null) || "Not Specified"}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Trips timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] border-b border-[#E7EAF0]/60 pb-3 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Recent Trip Log
            </h3>

            <div className="space-y-4">
              {loadingTrips ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                  ))}
                </div>
              ) : tripsError ? (
                <div className="text-center py-6 text-red-500 font-medium text-xs font-poppins">
                  {tripsError}
                </div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8 text-[#64748B] font-medium text-xs font-nunito">
                  No trips assigned yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {(showAllTrips ? trips : trips.slice(0, 5)).map((trip) => (
                    <div
                      key={trip._id}
                      onClick={() => navigate(`/manager/trip-details/${trip._id}`)}
                      className="flex items-center justify-between p-3.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all cursor-pointer hover:border-[#A14000]"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#1E293B] font-poppins">{trip.tripNumber}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            trip.status === "Completed" ? "text-emerald-700 bg-emerald-50 border border-emerald-200" :
                            trip.status === "On Transit" || trip.status === "In Progress" || trip.status === "Ongoing" ? "text-blue-700 bg-blue-50 border border-blue-200" :
                            trip.status === "Cancelled" ? "text-red-700 bg-red-50 border border-red-200" :
                            "text-amber-700 bg-amber-50 border border-amber-200"
                          }`}>
                            {trip.status === "Completed" ? "Completed" : trip.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium font-nunito">
                          {trip.startLocation} to {trip.endLocation}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold mt-0.5">
                          <span>Reg: <strong className="text-gray-600 uppercase">{trip.vehiclePlate || (trip.vehicle && trip.vehicle.vehicleNumber) || "—"}</strong></span>
                          <span>•</span>
                          <span>Dist: <strong className="text-gray-600">{trip.estimatedDistance || calculateDistance(trip.startLocation, trip.endLocation)} km</strong></span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block font-poppins">
                          {trip.departureTime ? new Date(trip.departureTime).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                  {trips.length > 5 && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => setShowAllTrips(!showAllTrips)}
                        className="px-4 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                      >
                        {showAllTrips ? "View Less" : `View All (${trips.length})`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
