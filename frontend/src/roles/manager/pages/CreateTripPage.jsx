import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Route,
  ChevronDown,
  Clock,
  Calendar,
  Truck,
  User,
  MapPin,
  Compass,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Search
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

import { managerApi } from "../api/managerApi";

export default function CreateTripPage() {
  const navigate = useNavigate();

  // Lists loaded from backend
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  // Selections
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Filters
  const [filterAvailableVehicles, setFilterAvailableVehicles] = useState(false);
  const [filterAvailableDrivers, setFilterAvailableDrivers] = useState(false);

  // Form inputs
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [eta, setEta] = useState("");
  const [status, setStatus] = useState("Scheduled");
  const [description, setDescription] = useState("");

  // Load resources from backend
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [dRes, vRes] = await Promise.all([
          managerApi.getDrivers(),
          managerApi.getVehicles()
        ]);
        const driversData = (dRes.data?.data || dRes.data || []).map(d => ({ ...d, id: d._id }));
        const vehiclesData = (vRes.data?.data || vRes.data || []).map(v => ({ ...v, id: v._id }));
        setDrivers(driversData);
        setVehicles(vehiclesData);
      } catch (error) {
        toast.error("Failed to load driver/vehicle lists from database");
        console.error(error);
      }
    };
    fetchResources();
  }, []);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) {
      toast.error("Please select a driver from Driver Assignment");
      return;
    }
    if (!selectedVehicleId) {
      toast.error("Please select a vehicle from Asset Allocation");
      return;
    }
    if (!startLocation || !endLocation || !departureTime || !eta) {
      toast.error("Please fill in all route and timing specifications");
      return;
    }

    const driver = drivers.find(d => String(d.id) === String(selectedDriverId));
    const vehicle = vehicles.find(v => String(v.id) === String(selectedVehicleId));

    if (!driver || !vehicle) {
      toast.error("Invalid selection data");
      return;
    }

    try {
      const tripNum = `TRP-${Math.floor(1000 + Math.random() * 9000)}`;
      await managerApi.createTrip({
        tripNumber: tripNum,
        vehicle: vehicle._id,
        driver: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.plateNumber,
        startLocation: startLocation,
        endLocation: endLocation,
        departureTime: departureTime,
        eta: eta,
        status: status,
        description: description || "General Dispatch Cargo"
      });

      // Update vehicle status
      await managerApi.updateVehicle(vehicle._id, {
        driver: driver.name,
        status: status === "On Transit" ? "On Trip" : "Active"
      });

      // Update driver status
      await managerApi.updateDriver(driver._id, {
        assignedVehicle: vehicle.plateNumber,
        status: status === "On Transit" ? "On Trip" : "Available"
      });

      toast.success("Trip dispatched successfully!");
      navigate("/manager/trips");
    } catch (error) {
      toast.error("Failed to dispatch trip");
      console.error(error);
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Breadcrumbs & Title header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Dispatch New Trip
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">
            Configure vehicle, route details, and driver assignment.
          </p>
        </div>

        <div className="flex items-center gap-3 select-none w-full md:w-auto">
          <button
            type="button"
            onClick={() => navigate("/manager/trips")}
            className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-gray-50 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            className="flex-1 md:flex-none px-6 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer text-center"
          >
            Dispatch Trip
          </button>
        </div>
      </div>

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        
        {/* Left Column: Trip Specifications */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Trip Specifications Form Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7EAF0]">
              <Route className="w-5 h-5 text-[#B45A0A]" />
              <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Trip Specifications</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Location */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Start Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                    required
                  />
                </div>
              </div>

              {/* End Location */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Destination *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    placeholder="e.g. Pune, MH"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Departure Time */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Departure Time *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="datetime-local"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                    required
                  />
                </div>
              </div>

              {/* ETA */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Estimated Arrival (ETA) *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="datetime-local"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cargo Details */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Cargo / Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Express Deliveries"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] text-[#1E293B] font-medium"
                />
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2 font-poppins">
                  Initial Trip Status *
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full pl-3.5 pr-8 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer font-medium"
                    required
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="On Transit">On Transit</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Map Diagnostics Viewport Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <h4 className="font-poppins font-bold text-xs text-[#64748B] uppercase tracking-wider">Active Route Simulation Map</h4>
            
            <div className="relative h-[240px] bg-[#E8ECEF] border border-[#DCE2E6] rounded-xl overflow-hidden flex flex-col justify-between p-4">
              {/* Mock Map Background Details */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#64748b_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
              
              {/* Top Floating Badge */}
              <div className="z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 bg-white border border-[#E7EAF0] rounded-lg text-[9px] font-bold text-[#B45A0A] flex items-center gap-1">
                  <Compass className="w-3 h-3 animate-spin" />
                  Active Diagnostics Routing
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-[#22C55E] border border-emerald-100 rounded-lg text-[9px] font-bold">
                  Route Connected
                </span>
              </div>

              {/* Route Dot representation */}
              <div className="z-10 flex items-center justify-between max-w-[280px] mx-auto w-full relative pt-12">
                <div className="absolute left-1 right-1 top-[56px] h-0.5 border-t-2 border-dashed border-[#B45A0A]"></div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-white border-4 border-[#B45A0A] rounded-full z-10"></div>
                  <span className="text-[10px] font-bold text-[#1E293B] mt-1.5">{startLocation || "Source Point"}</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-[#B45A0A] rounded-full z-10"></div>
                  <span className="text-[10px] font-bold text-[#1E293B] mt-1.5">{endLocation || "Destination Point"}</span>
                </div>
              </div>

              {/* Bottom traffic metrics */}
              <div className="z-10 bg-white border border-[#E7EAF0] rounded-xl p-3 flex items-center justify-between text-[10px] font-semibold text-[#64748B] font-poppins">
                <span>Simulation Live</span>
                <span>Heavy Traffic Detected</span>
                <span className="text-[#B45A0A] hover:underline cursor-pointer">Fit View Route</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Asset Allocation & Driver Assignment */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Asset Allocation Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#B45A0A]" />
                <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Asset Allocation</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableVehicles(!filterAvailableVehicles)}
                className="text-[10px] font-bold text-[#B45A0A] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableVehicles ? "Show All Vehicles" : "Filter Available"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {(filterAvailableVehicles 
                ? vehicles.filter(v => v.status === "Available" || v.status === "Active")
                : vehicles
              ).length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No vehicles matching selection</p>
              ) : (
                (filterAvailableVehicles 
                  ? vehicles.filter(v => v.status === "Available" || v.status === "Active")
                  : vehicles
                ).map(v => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(String(v.id))}
                    className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      String(selectedVehicleId) === String(v.id)
                        ? "border-[#B45A0A] bg-orange-50/20 shadow-sm"
                        : "border-[#E7EAF0] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-[#1E293B]">{v.name}</p>
                      <span className="text-[10px] text-[#64748B] font-semibold block mt-0.5 uppercase">{v.plateNumber}</span>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${
                        v.status === "Active" || v.status === "Available"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {v.status}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicleId(String(v.id));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        String(selectedVehicleId) === String(v.id)
                          ? "bg-[#B45A0A] text-white shadow-sm font-poppins"
                          : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B] font-poppins"
                      }`}
                    >
                      {String(selectedVehicleId) === String(v.id) ? "Allocated" : "Allocate"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Driver Assignment Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7EAF0]">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#B45A0A]" />
                <h3 className="font-poppins font-bold text-[#1E293B] text-[16px]">Driver Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setFilterAvailableDrivers(!filterAvailableDrivers)}
                className="text-[10px] font-bold text-[#B45A0A] bg-orange-50 border border-orange-100 hover:bg-orange-100/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer select-none font-poppins"
              >
                {filterAvailableDrivers ? "Show All Drivers" : "Filter Available"}
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {(filterAvailableDrivers 
                ? drivers.filter(d => d.status === "Available")
                : drivers
              ).length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No drivers matching selection</p>
              ) : (
                (filterAvailableDrivers 
                  ? drivers.filter(d => d.status === "Available")
                  : drivers
                ).map(d => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDriverId(String(d.id))}
                    className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                      String(selectedDriverId) === String(d.id)
                        ? "border-[#B45A0A] bg-orange-50/20 shadow-sm"
                        : "border-[#E7EAF0] bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-[#1E293B]">{d.name}</p>
                      <span className="text-[10px] text-[#64748B] block mt-0.5">Exp: {d.experience}</span>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-[6px] text-[8px] font-bold uppercase ${
                        d.status === "Available"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {d.status}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDriverId(String(d.id));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        String(selectedDriverId) === String(d.id)
                          ? "bg-[#B45A0A] text-white shadow-sm font-poppins"
                          : "bg-white hover:bg-gray-50 border border-[#E7EAF0] text-[#64748B] font-poppins"
                      }`}
                    >
                      {String(selectedDriverId) === String(d.id) ? "Assigned" : "Assign"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
