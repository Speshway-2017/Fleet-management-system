import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Edit2, Trash2, MapPin, AlertTriangle, Download, Eye, FileText, 
  Phone, Mail, X, Loader, Search, Calendar, Fuel, Wrench, UserPlus, UserMinus, Plus, Check
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";
import { vehicleApi } from "@/api/vehicleApi";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { managerApi } from "../api/managerApi";
import { getSocket } from "@/api/socket";

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

const getDocumentUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");
  return `${baseUrl}${path}`;
};

export default function VehicleDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isViewOnly = user?.subscriptionStatus !== "ACTIVE" && !import.meta.env.DEV;
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const gpsMapRef = useRef(null);
  const gpsMapInstanceRef = useRef(null);

  const [vehicle, setVehicle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingVehicle, setIsDeletingVehicle] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  // Tab & sub-sections state
  const [activeTab, setActiveTab] = useState("info");

  // Maintenance states
  const [maintenances, setMaintenances] = useState([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [maintenanceSearch, setMaintenanceSearch] = useState("");
  const [maintenancePage, setMaintenancePage] = useState(1);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);

  // Fuel states
  const [fuels, setFuels] = useState([]);
  const [fuelLoading, setFuelLoading] = useState(false);

  // GPS/Trips states
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Location coordinates for different branches (mock data)
  const branchCoordinates = {
    "Pune": [18.5204, 73.8567],
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.7041, 77.1025],
    "Bangalore": [12.9716, 77.5946],
    "Hyderabad": [17.3850, 78.4867],
    "Chennai": [13.0827, 80.2707],
    "Kolkata": [22.5726, 88.3639],
    "Ahmedabad": [23.0225, 72.5714]
  };

  const isObjectIdString = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

  const normaliseVehicle = (v) => {
    if (!v) return null;

    const isAvailableStatus = v.currentStatus === 'Available' || v.status === 'Available' || v.currentStatus === 'Under Maintenance' || v.currentStatus === 'Out of Service';

    let resolvedDriver = null;
    if (!isAvailableStatus) {
      if (v.assignedDriver && typeof v.assignedDriver === 'object') {
        resolvedDriver = v.assignedDriver.fullName || v.assignedDriver.name || v.assignedDriver.email;
      } else if (v.assignedDriverName || v.driverName) {
        resolvedDriver = v.assignedDriverName || v.driverName;
      } else if (typeof v.assignedDriver === 'string' && !isObjectIdString(v.assignedDriver)) {
        resolvedDriver = v.assignedDriver;
      }
    }

    if (isObjectIdString(resolvedDriver)) {
      resolvedDriver = null;
    }

    return {
      ...v,
      id:           v._id,
      name:         v.vehicleName || (v.manufacturer ? `${v.manufacturer} ${v.model}` : (v.brand ? `${v.brand} ${v.model}` : v.model)),
      manufacturer: v.manufacturer || v.brand || "",
      plateNumber:  v.vehicleNumber || "",
      type:         v.vehicleType || "Truck",
      driver:       resolvedDriver || 'Unassigned',
      manager:      v.assignedManager && typeof v.assignedManager === 'object'
        ? v.assignedManager.name || v.assignedManager.fullName || v.assignedManager.email
        : (typeof v.assignedManager === 'string' ? v.assignedManager : 'N/A'),
      createdByVal: v.createdBy && typeof v.createdBy === 'object'
        ? v.createdBy.name || v.createdBy.fullName || v.createdBy.email
        : (typeof v.createdBy === 'string' ? v.createdBy : 'N/A'),
      updatedByVal: v.updatedBy && typeof v.updatedBy === 'object'
        ? v.updatedBy.name || v.updatedBy.fullName || v.updatedBy.email
        : (typeof v.updatedBy === 'string' ? v.updatedBy : 'N/A'),
      fuelLevel:    v.fuelCapacity ? Math.round((v.odometer % v.fuelCapacity) || 50) : 50,
      fastagBalance: v.fastagBalance ?? 0,
      branch:       v.branch || v.branchDepot || "Pune",
      dateAdded:    v.createdAt ? v.createdAt.split('T')[0] : '',
      status:       v.currentStatus || 'Available',
      transmission: v.transmission || v.transmissionType || "Manual",
      ownership:    v.ownership || v.ownershipType || "Owned",
      lastService:  v.lastService || v.lastServiceDate || "",
      nextService:  v.nextService || v.nextServiceDue || "",
    };
  };

  const loadVehicleData = async () => {
    try {
      setLoading(true);
      const res = await vehicleApi.getById(id);
      const found = res.data?.data;
      if (found) {
        const norm = normaliseVehicle(found);
        const isAvailableStatus = found.currentStatus === 'Available' || found.status === 'Available' || found.currentStatus === 'Under Maintenance' || found.currentStatus === 'Out of Service';

        let activeTrip = null;
        try {
          const tripsRes = await managerApi.getTrips({ vehicle: id });
          const tripsData = tripsRes.data?.data || [];
          activeTrip = tripsData.find(t => {
            const status = t.status?.toLowerCase() || "";
            const isTripActive = status !== "completed" && status !== "cancelled" && status !== "rejected";
            const matchesVehicle = String(t.vehicle?._id || t.vehicle) === String(id) || 
                                   (found.vehicleNumber && String(t.vehiclePlate).toLowerCase() === String(found.vehicleNumber).toLowerCase());
            return isTripActive && matchesVehicle;
          });
          setHasActiveTrip(!!activeTrip);
        } catch (err) {
          console.error("Failed to load trips for active trip check:", err);
        }

        if (isAvailableStatus) {
          norm.driver = 'Unassigned';
        } else if (!norm.driver || norm.driver === 'Unassigned' || norm.driver === 'N/A' || isObjectIdString(norm.driver)) {
          try {
            const rawDriverId = found.assignedDriver?._id || found.assignedDriver;
            if (rawDriverId && isObjectIdString(String(rawDriverId))) {
              const driverRes = await managerApi.getDrivers();
              const driversList = driverRes.data?.data || driverRes.data || [];
              const matchedDriver = driversList.find(d => String(d._id || d.id) === String(rawDriverId));
              if (matchedDriver) {
                norm.driver = matchedDriver.fullName || matchedDriver.name || matchedDriver.email;
              }
            }
          } catch (_) {}

          if ((!norm.driver || norm.driver === 'Unassigned' || norm.driver === 'N/A' || isObjectIdString(norm.driver)) && activeTrip) {
            if (activeTrip.driverName || activeTrip.driver?.fullName || activeTrip.driver?.name) {
              norm.driver = activeTrip.driverName || activeTrip.driver?.fullName || activeTrip.driver?.name;
            }
          }
        }

        if (isAvailableStatus || isObjectIdString(norm.driver)) {
          norm.driver = 'Unassigned';
        }
        setVehicle(norm);
      } else {
        toast.error("Vehicle not found");
        navigate("/manager/vehicles-list");
      }
    } catch (err) {
      console.error("Failed to load vehicle:", err);
      toast.error("Failed to load vehicle details from server.");
      navigate("/manager/vehicles-list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicleData();
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleTripStatusUpdated = (updatedTrip) => {
        if (updatedTrip && (String(updatedTrip.vehicle) === String(id) || (updatedTrip.vehicle && String(updatedTrip.vehicle._id) === String(id)))) {
          loadVehicleData();
        }
      };

      socket.on("trip:status-updated", handleTripStatusUpdated);
      return () => {
        socket.off("trip:status-updated", handleTripStatusUpdated);
      };
    }
  }, [id]);
  const getCoordinates = (cityName) => {
    if (!cityName) return [18.5204, 73.8567]; // default Pune
    const norm = cityName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (norm.includes(key)) return coords;
    }
    return [18.5204, 73.8567]; // default Pune
  };

  const calculateRemainingDays = (expiryDate) => {
    if (!expiryDate) return null;
    const diffTime = new Date(expiryDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const parseCost = (costVal) => {
    if (costVal === null || costVal === undefined) return 0;
    if (typeof costVal === 'number') return costVal;
    const cleaned = String(costVal).replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  useEffect(() => {
    if (!id) return;
    
    if (activeTab === "service") {
      const fetchMaintenance = async () => {
        try {
          setMaintenanceLoading(true);
          const res = await managerApi.getMaintenance({ vehicle: id });
          setMaintenances(res.data?.data || []);
        } catch (err) {
          console.error("Failed to load maintenance:", err);
        } finally {
          setMaintenanceLoading(false);
        }
      };
      fetchMaintenance();
    }

    if (activeTab === "fuel") {
      const fetchFuel = async () => {
        try {
          setFuelLoading(true);
          const res = await managerApi.getFuelRecords({ vehicle: id });
          setFuels(res.data?.data || []);
        } catch (err) {
          console.error("Failed to load fuel records:", err);
        } finally {
          setFuelLoading(false);
        }
      };
      fetchFuel();
    }

    if (activeTab === "gps") {
      const fetchTrips = async () => {
        try {
          setTripsLoading(true);
          const res = await managerApi.getTrips({ vehicle: id });
          const rawTrips = (res.data?.data || []).filter(t => {
            const vId = t.vehicle?._id || t.vehicle;
            return String(vId) === String(id) || (vehicle && t.vehiclePlate === vehicle.plateNumber);
          });
          setTrips(rawTrips);
          if (rawTrips.length > 0) {
            setSelectedTrip(rawTrips[0]);
          } else {
            setSelectedTrip(null);
          }
        } catch (err) {
          console.error("Failed to load trips:", err);
        } finally {
          setTripsLoading(false);
        }
      };
      fetchTrips();
    }
  }, [activeTab, id]);

  // GPS Map rendering hook
  useEffect(() => {
    if (activeTab !== "gps") {
      if (gpsMapInstanceRef.current) {
        gpsMapInstanceRef.current.remove();
        gpsMapInstanceRef.current = null;
      }
      return;
    }

    const timer = setTimeout(() => {
      if (!gpsMapRef.current) return;

      if (!gpsMapInstanceRef.current) {
        gpsMapInstanceRef.current = L.map(gpsMapRef.current).setView([20.5937, 78.9629], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18
        }).addTo(gpsMapInstanceRef.current);
      }

      const map = gpsMapInstanceRef.current;
      map.invalidateSize();

      // Clear previous polylines/markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      if (selectedTrip) {
        const startC = getCoordinates(selectedTrip.startLocation);
        const endC = getCoordinates(selectedTrip.endLocation);

        L.marker(startC).addTo(map).bindPopup(`<strong>Start:</strong> ${selectedTrip.startLocation}`);
        L.marker(endC).addTo(map).bindPopup(`<strong>End:</strong> ${selectedTrip.endLocation}`);

        const routeLine = L.polyline([startC, endC], {
          color: '#A14000',
          weight: 5,
          opacity: 0.8,
          dashArray: '5, 10'
        }).addTo(map);

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [activeTab, selectedTrip]);


  // Prevent body scrolling when document preview or management modals are open
  useEffect(() => {
    const isAnyModalOpen = !!previewDocument || showDeleteConfirm || showAssignModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewDocument, showDeleteConfirm, showAssignModal]);

  const handleDelete = async () => {
    try {
      setIsDeletingVehicle(true);
      const vehicleId = vehicle._id || vehicle.id;
      
      // Call API to delete the vehicle
      await vehicleApi.remove(vehicleId);
      
      toast.success("Vehicle deleted successfully!");
      navigate("/manager/vehicle-management");
    } catch (err) {
      // Handle different HTTP error responses
      if (!err.response) {
        toast.error("Unable to connect to the server. Please try again.");
      } else {
        const statusCode = err.response.status;
        const message = err.response?.data?.message;

        switch (statusCode) {
          case 400:
            toast.error(message || "Invalid request. Please check the vehicle details.");
            break;
          case 401:
            toast.error("You are not authenticated. Please log in again.");
            break;
          case 403:
            toast.error("You do not have permission to delete this vehicle.");
            break;
          case 404:
            toast.error("Vehicle not found. It may have been already deleted.");
            navigate("/manager/vehicle-management");
            break;
          case 500:
            toast.error("Server error. Please try again later.");
            break;
          default:
            toast.error(message || "Failed to delete vehicle.");
        }
      }
    } finally {
      setIsDeletingVehicle(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 lg:p-8 bg-[#F5F7FB]">
        <p className="text-[#64748B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Vehicle Details
          </h1>
        </div>
      </div>

      {/* Top Vehicle Info Card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left side - Vehicle Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4 mb-6">
              {vehicle.vehicleImage?.secure_url || vehicle.image ? (
                <img
                  src={vehicle.vehicleImage?.secure_url || vehicle.image}
                  alt={vehicle.name}
                  loading="lazy"
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                />
              ) : (
                <div className="bg-[#FDF3EC] p-4 rounded-xl border border-[#A14000]/20 flex items-center justify-center shrink-0">
                  <FileText className="w-8 h-8 text-[#A14000]" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-[#1E293B]">{vehicle.name}</h2>
                  <span className="px-3 py-1 bg-orange-100 text-[#A14000] rounded-full text-xs font-bold">
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-sm text-[#64748B]">{vehicle.manufacturer}</p>
                <p className="text-lg font-bold text-[#1E293B] mt-2 uppercase">{vehicle.plateNumber || vehicle.vehicleNumber}</p>
              </div>
            </div>

            {/* Quick Info Row */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E7EAF0]">
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Registration</p>
                <p className="text-sm font-bold text-[#1E293B] mt-2">{vehicle.registrationNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Type</p>
                <p className="text-sm font-bold text-[#1E293B] mt-2">{vehicle.type}</p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] font-bold uppercase">Driver</p>
                <p className="text-sm font-bold text-[#1E293B] mt-2">{vehicle.driver && vehicle.driver !== 'Unassigned' ? vehicle.driver : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 md:ml-auto">

            <button
              onClick={() => navigate(`/manager/vehicle-edit/${vehicle._id}`)}
              disabled={isViewOnly}
              title={isViewOnly ? "This feature is available after activating a subscription." : "Edit Vehicle"}
              className={`px-6 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Edit2 className="w-4 h-4" />
              EDIT
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isViewOnly}
              title={isViewOnly ? "This feature is available after activating a subscription." : "Delete Vehicle"}
              className={`px-4 py-2.5 border border-red-300 hover:bg-red-50 rounded-lg text-sm font-bold text-red-600 transition-all flex items-center gap-2 cursor-pointer ${isViewOnly ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Trash2 className="w-4 h-4" />
              DELETE
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#E7EAF0] mb-6 overflow-x-auto whitespace-nowrap bg-white p-2 rounded-xl shadow-sm">
        {[
          { id: "info", label: "Vehicle Information" },
          { id: "service", label: "Service History" },
          { id: "gps", label: "GPS Tracking History" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-xs font-bold font-poppins transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#A14000] text-white shadow-md shadow-[#A14000]/10"
                : "text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "info" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* General Information */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
                General Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Vehicle Name</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Manufacturer</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.manufacturer}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Model</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.model || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Year of Manufacture</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.manufactureYear || vehicle.year || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Chassis Number</p>
                  <p className="text-sm font-semibold text-[#1E293B] font-poppins tracking-wider">{vehicle.chassisNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Vehicle Type</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Ownership Type</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.ownership || vehicle.ownershipType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Branch / Location</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Assigned Manager</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.manager || "N/A"}</p>
                </div>

              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Fuel Type</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.fuelType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Transmission</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.transmission || vehicle.transmissionType || "Manual"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Engine (CC)</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.engineCC || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Fuel Capacity</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.fuelCapacity ? `${vehicle.fuelCapacity} Liters` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Load Capacity</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.loadCapacity ? `${vehicle.loadCapacity} Tons` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">FASTag Balance</p>
                  <p className="text-sm font-bold text-[#1E293B]">₹{vehicle.fastagBalance?.toLocaleString("en-IN") ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Last Service</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString("en-IN") : "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] font-bold uppercase mb-1">Next Service Due</p>
                  <p className="text-sm font-semibold text-[#1E293B]">{vehicle.nextService ? new Date(vehicle.nextService).toLocaleDateString("en-IN") : "N/A"}</p>
                </div>
              </div>
            </div>



            {/* Documents Section */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
                Vehicle Documents
              </h3>
              {vehicle.documents && (Array.isArray(vehicle.documents) ? vehicle.documents.length > 0 : Object.keys(vehicle.documents).some(k => vehicle.documents[k])) ? (
                <div className="space-y-3">
                  {Array.isArray(vehicle.documents) ? (
                    vehicle.documents.map((doc) => (
                      <div key={doc.id || doc._id} className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <FileText className="w-5 h-5 text-[#A14000] flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#1E293B] truncate">{doc.name}</p>
                            <p className="text-[10px] text-[#64748B]">{doc.size} KB • {doc.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            onClick={() => setPreviewDocument({ name: doc.name, data: getDocumentUrl(doc.fileUrl || doc.data), type: doc.mimeType || doc.fileType || "application/pdf", size: doc.fileSize || doc.size, uploadDate: doc.uploadDate })}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="View Document"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <a
                            href={getDocumentUrl(doc.fileUrl || doc.data)}
                            download={doc.name || "document"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4 text-green-600" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    Object.entries(vehicle.documents)
                      .filter(([_, doc]) => doc && doc.fileUrl)
                      .map(([key, doc]) => {
                        const docLabels = {
                          rc: "RC (Registration Certificate)",
                          insurance: "Insurance Certificate",
                          puc: "Pollution Under Control (PUC)",
                          fitness: "Fitness Certificate",
                          permit: "Permit Document",
                          roadTax: "Road Tax Receipt"
                        };
                        return (
                          <div key={key} className="flex items-center justify-between p-3 bg-[#F5F7FB] border border-[#E7EAF0] rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-[#A14000] flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-[#1E293B] truncate">{docLabels[key] || key}</p>
                                <p className="text-[10px] text-[#64748B] truncate">{doc.originalName || "document"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => setPreviewDocument({ name: docLabels[key] || key, data: getDocumentUrl(doc.fileUrl), type: doc.mimeType || "application/pdf", size: doc.fileSize, uploadDate: new Date(doc.uploadDate).toLocaleDateString("en-IN") })}
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title="View Document"
                              >
                                <Eye className="w-4 h-4 text-blue-600" />
                              </button>
                              <a
                                href={getDocumentUrl(doc.fileUrl)}
                                download={doc.originalName || `${key}_document`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-green-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title="Download Document"
                              >
                                <Download className="w-4 h-4 text-green-600" />
                              </a>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#F5F7FB] rounded-lg border border-dashed border-[#E7EAF0]">
                  <FileText className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[#64748B]">No documents uploaded</p>
                </div>
              )}
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-[#0F172A] dark:to-[#1E293B] rounded-2xl border border-orange-200 dark:border-slate-800 p-6">
              <h3 className="text-sm font-bold text-[#1E293B] dark:text-white uppercase mb-4">Vehicle Summary</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-[#64748B] dark:text-slate-300 font-medium">Registration No.</p>
                  <p className="font-bold text-[#1E293B] dark:text-white mt-1 uppercase">{vehicle.plateNumber}</p>
                </div>
                <div className="border-t border-orange-200 dark:border-slate-800 pt-4">
                  <p className="text-xs text-[#64748B] dark:text-slate-300 font-medium">FASTag Balance</p>
                  <p className="font-bold text-[#1E293B] dark:text-white mt-1">₹{vehicle.fastagBalance?.toLocaleString("en-IN") || "0"}</p>
                </div>
                <div className="border-t border-orange-200 dark:border-slate-800 pt-4">
                  <p className="text-xs text-[#64748B] dark:text-slate-300 font-medium">Branch</p>
                  <p className="font-bold text-[#1E293B] dark:text-white mt-1">{vehicle.branch}</p>
                </div>
                <div className="border-t border-orange-200 dark:border-slate-800 pt-4">
                  <p className="text-xs text-[#64748B] dark:text-slate-300 font-medium">Date Added</p>
                  <p className="font-bold text-[#1E293B] dark:text-white mt-1">
                    {vehicle.dateAdded ? new Date(vehicle.dateAdded).toLocaleDateString("en-IN") : "N/A"}
                  </p>
                </div>
              </div>
            </div>
        </div>
      )}



      {activeTab === "service" && (
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7EAF0] pb-4">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase">
              Service History
            </h3>
            
            {/* Search filter */}
            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by service type..."
                value={maintenanceSearch}
                onChange={(e) => {
                  setMaintenanceSearch(e.target.value);
                  setMaintenancePage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 border border-[#E7EAF0] rounded-lg text-xs focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
              />
            </div>
          </div>

          {maintenanceLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#A14000] mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Loading service history...</p>
            </div>
          ) : (() => {
            const filteredMaintenances = maintenances
              .filter(m => m.serviceType.toLowerCase().includes(maintenanceSearch.toLowerCase()))
              .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
            
            const serviceItemsPerPage = 5;
            const totalServicePages = Math.ceil(filteredMaintenances.length / serviceItemsPerPage);
            const paginatedServices = filteredMaintenances.slice(
              (maintenancePage - 1) * serviceItemsPerPage,
              maintenancePage * serviceItemsPerPage
            );

            if (filteredMaintenances.length === 0) {
              return (
                <div className="text-center py-12 max-w-sm mx-auto select-none">
                  <Wrench className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                  <h4 className="font-bold text-sm text-[#1E293B] mb-1">No Service History</h4>
                  <p className="text-xs text-[#64748B]">There are no recorded maintenance logs matching your query.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Service Type</th>
                        <th className="py-3 px-4">Service Center</th>
                        <th className="py-3 px-4">Cost</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedServices.map((m) => (
                        <tr key={m._id} className="border-b border-[#E7EAF0]/60 hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-medium text-[#1E293B]">
                            {new Date(m.scheduledDate).toLocaleDateString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-[#1E293B] font-semibold">{m.serviceType}</td>
                          <td className="py-3 px-4 text-[#64748B]">{m.garage || "N/A"}</td>
                          <td className="py-3 px-4 text-[#1E293B] font-bold">₹{parseCost(m.cost).toLocaleString("en-IN")}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              m.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              m.status === "In Progress" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                              "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedMaintenance(m)}
                              className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 border border-transparent rounded-lg font-semibold cursor-pointer transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalServicePages > 1 && (
                  <div className="flex items-center justify-between border-t border-[#E7EAF0] pt-4 select-none">
                    <p className="text-[10px] text-[#64748B]">
                      Showing Page {maintenancePage} of {totalServicePages}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={maintenancePage === 1}
                        onClick={() => setMaintenancePage(p => Math.max(p - 1, 1))}
                        className="px-2.5 py-1 border border-[#E7EAF0] rounded-md hover:bg-gray-50 text-[10px] font-semibold text-[#64748B] disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={maintenancePage === totalServicePages}
                        onClick={() => setMaintenancePage(p => Math.min(p + 1, totalServicePages))}
                        className="px-2.5 py-1 border border-[#E7EAF0] rounded-md hover:bg-gray-50 text-[10px] font-semibold text-[#64748B] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}


      {activeTab === "gps" && (
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-[#1E293B] uppercase border-b border-[#E7EAF0] pb-4">
            GPS Tracking History
          </h3>
          {tripsLoading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-[#A14000] mx-auto mb-2" />
              <p className="text-xs text-[#64748B]">Loading GPS tracking trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-12 max-w-sm mx-auto select-none">
              <MapPin className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
              <h4 className="font-bold text-sm text-[#1E293B] mb-1">No Travel History</h4>
              <p className="text-xs text-[#64748B]">There are no recorded trips or GPS logs for this vehicle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div 
                  ref={gpsMapRef}
                  className="w-full h-[400px] rounded-xl border border-[#E7EAF0] bg-gray-50"
                  style={{ zIndex: 1 }}
                />
                
                {selectedTrip && (
                  <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-2 select-none">
                    <h4 className="text-xs font-bold text-[#A14000] uppercase">Trip Timeline</h4>
                    <div className="flex items-center justify-between text-xs text-[#1E293B]">
                      <div>
                        <p className="font-bold">{selectedTrip.startLocation}</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">Departed: {selectedTrip.departureTime}</p>
                      </div>
                      <div className="h-0.5 flex-1 bg-dashed border-t border-[#A14000]/40 mx-4" />
                      <div className="text-right">
                        <p className="font-bold">{selectedTrip.endLocation}</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">ETA/Arrived: {selectedTrip.eta}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trips List Panel */}
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar select-none">
                <h4 className="text-xs font-bold text-[#64748B] uppercase mb-1">Trip Log</h4>
                {trips.map((t) => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTrip(t)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedTrip?._id === t._id
                        ? "bg-orange-50 border-[#A14000]"
                        : "bg-white hover:bg-gray-50 border-[#E7EAF0]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold text-[#A14000] font-poppins">{t.tripNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        t.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        t.status === "On Transit" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {t.status === "Completed" ? "Complete" : t.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1E293B]">{t.startLocation} to {t.endLocation}</p>
                    <p className="text-[10px] text-[#64748B] mt-1">Date: {t.departureTime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7EAF0] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E7EAF0] bg-[#F5F7FB]">
              <h3 className="text-lg font-bold text-[#1E293B] truncate">
                {previewDocument.name}
              </h3>
              <button
                onClick={() => setPreviewDocument(null)}
                className="p-2 hover:bg-[#E7EAF0] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {previewDocument.type === "application/pdf" ? (
                <div className="space-y-4">
                  <embed
                    src={previewDocument.data}
                    type="application/pdf"
                    className="w-full h-[500px] rounded-lg border border-[#E7EAF0]"
                  />
                  <p className="text-xs text-[#94A3B8] text-center">PDF Preview</p>
                </div>
              ) : previewDocument.type?.startsWith("image/") ? (
                <div className="space-y-4">
                  <img
                    src={previewDocument.data}
                    alt={previewDocument.name}
                    loading="lazy"
                    className="w-full rounded-lg border border-[#E7EAF0] object-contain max-h-[500px]"
                  />
                  <p className="text-xs text-[#94A3B8] text-center">Image Preview</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-[#64748B] mb-2">Preview not available for this file type</p>
                  <p className="text-xs text-[#94A3B8] mb-6">{previewDocument.type}</p>
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = previewDocument.data;
                      link.download = previewDocument.name;
                      link.click();
                    }}
                    className="px-4 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-lg text-sm font-bold text-white transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Document
                  </button>
                </div>
              )}

              {/* Document Info */}
              <div className="mt-6 p-4 bg-[#F5F7FB] rounded-lg border border-[#E7EAF0]">
                <h4 className="text-xs font-bold text-[#64748B] uppercase mb-3">Document Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[#64748B] font-medium">File Name</p>
                    <p className="text-[#1E293B] font-semibold mt-1 truncate">{previewDocument.name}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium">File Size</p>
                    <p className="text-[#1E293B] font-semibold mt-1">{previewDocument.size} KB</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium">Upload Date</p>
                    <p className="text-[#1E293B] font-semibold mt-1">{previewDocument.uploadDate}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-medium">File Type</p>
                    <p className="text-[#1E293B] font-semibold mt-1">{previewDocument.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E7EAF0] bg-[#F5F7FB]">
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = previewDocument.data;
                  link.download = previewDocument.name;
                  link.click();
                }}
                className="px-6 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#A14000]/20"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => setPreviewDocument(null)}
                className="px-6 py-2.5 border border-[#E7EAF0] rounded-lg text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && vehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1E293B]">Confirm Deletion</h3>
            </div>

            <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
              <p className="text-sm text-red-800">
                Are you sure you want to delete <strong>{vehicle.name}</strong> ({vehicle.plateNumber})? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeletingVehicle}
                className="px-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeletingVehicle}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeletingVehicle ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Vehicle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Maintenance Details Modal */}
      {selectedMaintenance && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative">
            <button
              onClick={() => setSelectedMaintenance(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins text-[#1E293B]">Service Record Details</h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">Recorded Maintenance Event Info</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#64748B] font-bold uppercase">Service Type</p>
                    <p className="text-sm font-bold text-[#1E293B] mt-1">{selectedMaintenance.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-bold uppercase">Status</p>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block mt-1 uppercase tracking-wider ${
                      selectedMaintenance.status === "Completed" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      selectedMaintenance.status === "In Progress" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {selectedMaintenance.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[#E7EAF0] pt-3">
                  <div>
                    <p className="text-[#64748B] font-bold uppercase">Service Date</p>
                    <p className="font-semibold text-[#1E293B] mt-1">{new Date(selectedMaintenance.scheduledDate).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-bold uppercase">Cost</p>
                    <p className="font-bold text-[#1E293B] mt-1">₹{parseCost(selectedMaintenance.cost).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[#E7EAF0] pt-3">
                  <div>
                    <p className="text-[#64748B] font-bold uppercase">Garage / Center</p>
                    <p className="font-semibold text-[#64748B] mt-1">{selectedMaintenance.garage || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[#64748B] font-bold uppercase">Specialist</p>
                    <p className="font-semibold text-[#64748B] mt-1">{selectedMaintenance.specialist || "N/A"}</p>
                  </div>
                </div>

                {selectedMaintenance.comments && (
                  <div className="border-t border-[#E7EAF0] pt-3">
                    <p className="text-[#64748B] font-bold uppercase">Description / Comments</p>
                    <p className="text-[#64748B] mt-1 leading-relaxed">{selectedMaintenance.comments}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => setSelectedMaintenance(null)}
                  className="px-4.5 py-2.5 bg-[#A14000] text-white rounded-xl text-xs font-semibold hover:bg-[#853400] transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
