import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { managerApi } from "../api/managerApi";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [zone, setZone] = useState("All Zones");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Live database states
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenanceOrders, setMaintenanceOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all dashboard data from DB
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, tRes, fRes, mRes] = await Promise.all([
        managerApi.getVehicles(),
        managerApi.getDrivers(),
        managerApi.getTrips(),
        managerApi.getFuelRecords(),
        managerApi.getMaintenance()
      ]);

      const vList = vRes.data?.data || vRes.data || [];
      const dList = dRes.data?.data || dRes.data || [];
      const tList = tRes.data?.data || tRes.data || [];
      const fList = fRes.data?.data || fRes.data || [];
      const mList = mRes.data?.data || mRes.data || [];

      // Map backend vehicles to frontend formats
      const branchesList = ["Pune", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Ahmedabad"];
      const enrichedVehicles = vList.map((v, idx) => ({
        ...v,
        id: v._id,
        name: v.vehicleName || "Fleet Vehicle",
        plateNumber: v.vehicleNumber,
        status: v.currentStatus || "Available",
        driver: v.assignedDriver ? (v.assignedDriver.fullName || v.assignedDriver.name) : "Unassigned",
        branch: branchesList[idx % branchesList.length]
      }));

      setVehicles(enrichedVehicles);
      setDrivers(dList);
      setTrips(tList);
      setFuelRecords(fList);
      setMaintenanceOrders(mList);
    } catch (error) {
      toast.error("Failed to load dashboard data from database");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter vehicles by zone
  const getZoneVehicles = () => {
    if (zone === "All Zones") return vehicles;

    const zoneMap = {
      "North": ["Delhi", "Punjab"],
      "South": ["Chennai", "Hyderabad", "Bengaluru"],
      "East": ["Kolkata"],
      "West": ["Mumbai", "Pune", "Ahmedabad", "Gujarat"]
    };

    const branches = zoneMap[zone] || [];
    return vehicles.filter(v => branches.includes(v.branch));
  };

  const filteredVehicles = getZoneVehicles();

  // Get marker color based on status
  const getMarkerColor = (status) => {
    switch (status) {
      case "Available":
        return "#22c55e"; // green
      case "On Trip":
      case "Active":
        return "#B45A0A"; // orange
      case "Maintenance":
        return "#ef4444"; // red
      case "Idle":
      case "Inactive":
        return "#6b7280"; // gray
      default:
        return "#6b7280";
    }
  };

  // Get coordinates for vehicles
  const getVehicleCoordinates = (branch, index) => {
    const locations = {
      "Pune": [18.5204, 73.8567],
      "Mumbai": [19.076, 72.8777],
      "Delhi": [28.7041, 77.1025],
      "Bengaluru": [12.9716, 77.5946],
      "Chennai": [13.0827, 80.2707],
      "Hyderabad": [17.3850, 78.4867],
      "Kolkata": [22.5726, 88.3639],
      "Ahmedabad": [23.0225, 72.5714],
      "Gujarat": [22.2587, 71.1924],
      "Punjab": [31.1471, 75.3412]
    };

    const baseCoord = locations[branch] || [20.5937, 78.9629];
    const offset = (index % 5) * 0.04;
    return [baseCoord[0] + offset, baseCoord[1] + offset];
  };

  // Initialize and update map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center of India

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each vehicle
    filteredVehicles.forEach((vehicle, idx) => {
      const coordinates = getVehicleCoordinates(vehicle.branch, idx);
      const color = getMarkerColor(vehicle.status);
      const marker = L.circleMarker(coordinates, {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<div class="font-bold text-sm">${vehicle.name}</div>
           <div class="text-xs text-gray-600">${vehicle.plateNumber}</div>
           <div class="text-xs text-gray-600">Status: ${vehicle.status}</div>
           <div class="text-xs text-gray-600">Driver: ${vehicle.driver}</div>
           <div class="text-xs text-gray-600">Branch: ${vehicle.branch}</div>`
        );

      markersRef.current.push(marker);
    });
  }, [filteredVehicles]);

  // Compute stats dynamically from database
  const totalVehiclesCount = vehicles.length;
  const activeCount = vehicles.filter(v => v.status === "Active" || v.status === "On Trip").length;
  const tripsCount = trips.length;
  const maintenanceCount = vehicles.filter(v => v.status === "Maintenance").length;
  const driversAvailableCount = drivers.filter(d => d.driverStatus === "AVAILABLE").length;

  const totalFuelCost = fuelRecords.reduce((sum, f) => sum + (f.amount || 0), 0);
  const formattedFuelExpense = totalFuelCost >= 100000 
    ? `₹${(totalFuelCost / 100000).toFixed(1)}L` 
    : `₹${(totalFuelCost / 1000).toFixed(0)}K`;

  const totalEarnings = trips.filter(t => t.status === "Completed").length * 15000;
  const formattedEarnings = totalEarnings >= 100000 
    ? `₹${(totalEarnings / 100000).toFixed(1)}L` 
    : `₹${(totalEarnings / 1000).toFixed(0)}K`;

  const dashboardStats = [
    { label: "Total Vehicles", value: totalVehiclesCount, icon: "mdi:truck-delivery", color: "bg-black" },
    { label: "Active", value: activeCount, icon: "mdi:flash", color: "bg-white border border-gray-200" },
    { label: "Trips Today", value: tripsCount, icon: "mdi:map-marker-path", color: "bg-white border border-gray-200" },
    { label: "Under Repair", value: maintenanceCount, icon: "mdi:wrench", color: "bg-white border border-gray-200" },
    { label: "Drivers Available", value: driversAvailableCount, icon: "mdi:account-group", color: "bg-white border border-gray-200" },
    { label: "Fuel Expense", value: formattedFuelExpense, icon: "mdi:gas-station", color: "bg-white border border-gray-200" },
    { label: "Total Earnings", value: formattedEarnings, icon: "mdi:cash", color: "bg-black" },
  ];

  // Circle progress calculation
  const totalCount = totalVehiclesCount || 1;
  const inactiveCount = totalVehiclesCount - activeCount - maintenanceCount;
  const activeDash = (activeCount / totalCount) * 282.7;
  const inactiveDash = (inactiveCount / totalCount) * 282.7;
  const maintenanceDash = (maintenanceCount / totalCount) * 282.7;

  // Compute compliance expiries dynamically
  const getComplianceExpiryList = () => {
    const list = [];
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    vehicles.forEach((v, index) => {
      const docs = [
        { name: "Insurance", date: v.insuranceExpiry },
        { name: "Pollution", date: v.pollutionExpiry },
        { name: "Permit", date: v.permitExpiry },
        { name: "Fitness", date: v.fitnessExpiry },
        { name: "RC", date: v.rcExpiry }
      ];

      docs.forEach(d => {
        if (!d.date) return;
        const expDate = new Date(d.date);
        if (expDate < now) {
          list.push({
            id: `${v.id}-${d.name}-${index}`,
            vehicle: v.plateNumber,
            document: d.name,
            status: "Expired",
            date: expDate
          });
        } else if (expDate < thirtyDaysLater) {
          list.push({
            id: `${v.id}-${d.name}-${index}`,
            vehicle: v.plateNumber,
            document: d.name,
            status: "Expiring Soon",
            date: expDate
          });
        }
      });
    });

    return list.sort((a, b) => a.date - b.date).slice(0, 3);
  };

  const complianceExpiryList = getComplianceExpiryList();

  // Compute cost breakdown dynamically
  const getCostBreakdown = () => {
    const salariesCost = drivers.length * 25000;
    const insuranceCost = vehicles.length * 12000;
    const permitsCost = vehicles.length * 5000;

    const maintenanceSum = maintenanceOrders.reduce((sum, m) => {
      const costNum = parseFloat((m.cost || "").replace(/[^0-9.]/g, "") || 0);
      return sum + costNum;
    }, 0);

    const total = salariesCost + insuranceCost + permitsCost + maintenanceSum + totalFuelCost;

    const formatL = (val) => {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
      return `₹${val.toLocaleString("en-IN")}`;
    };

    const getPct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

    return [
      { category: "Maintenance", amount: formatL(maintenanceSum), percentage: getPct(maintenanceSum) || 20 },
      { category: "Fuel", amount: formatL(totalFuelCost), percentage: getPct(totalFuelCost) || 25 },
      { category: "Salaries", amount: formatL(salariesCost), percentage: getPct(salariesCost) || 40 },
      { category: "Insurance", amount: formatL(insuranceCost), percentage: getPct(insuranceCost) || 10 },
      { category: "Permits & Tolls", amount: formatL(permitsCost), percentage: getPct(permitsCost) || 5 },
    ];
  };

  const costBreakdown = getCostBreakdown();

  return (
    <div className="w-full px-6 md:px-8 py-8 overflow-x-hidden">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Dashboard</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Overview of your fleet operations, active status, compliance and costs.</p>
        </div>
      </div>

      {/* Stats Grid Container */}
      <div className="mb-8" style={{ width: '100%', boxSizing: 'border-box', overflow: 'visible' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-7 gap-[12px] w-full box-border">
            {dashboardStats.map((stat, index) => (
              <div
                key={index}
                className={`rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 ${
                  stat.color === "bg-black"
                    ? "bg-[#0D0D0D] border border-gray-900 hover:border-[#C65D0E]/50 hover:shadow-lg hover:shadow-[#C65D0E]/10 text-white"
                    : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/80"
                }`}
                style={{
                  padding: '16px',
                  height: '120px',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              >
                {/* Card Title */}
                <p
                  className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis font-poppins ${
                    stat.color === "bg-black" ? "text-gray-400" : "text-gray-600"
                  }`}
                  style={{ marginBottom: '10px' }}
                >
                  {stat.label}
                </p>

                {/* Value with Icon */}
                <div className="flex items-end justify-between" style={{ marginTop: 'auto', gap: '8px' }}>
                  <span
                    className={`font-black font-poppins flex-1 ${stat.color === "bg-black" ? "text-white" : "text-gray-900"}`}
                    style={{ fontSize: '20px', lineHeight: '1', minWidth: '0' }}
                  >
                    {stat.value}
                  </span>
                  <div
                    className={`flex items-center justify-center flex-shrink-0 transition-transform duration-350 group-hover:scale-110 group-hover:rotate-3 ${
                      stat.color === "bg-black" ? "text-gray-600 group-hover:text-[#C65D0E]" : "text-gray-400 group-hover:text-[#C65D0E]"
                    }`}
                    style={{ width: '20px', height: '20px' }}
                  >
                    <Icon icon={stat.icon} width="20" height="20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 flex items-center gap-4 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <span className="w-3 h-3 bg-amber-700 rounded-full animate-ping"></span>
            <span className="text-sm font-medium text-gray-700">{filteredVehicles.length} Vehicles Online</span>
          </div>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:border-[#B45A0A] cursor-pointer"
          >
            <option>All Zones</option>
            <option>North</option>
            <option>South</option>
            <option>East</option>
            <option>West</option>
          </select>
        </div>
        <div ref={mapRef} className="h-[400px] bg-gray-50 relative z-10" style={{ width: "100%" }} />

        {/* Map Legend */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-center gap-6 text-xs font-medium flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#B45A0A' }}></div>
            <span className="text-gray-600">On Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span className="text-gray-600">Idle / Inactive</span>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 shrink-0">
            <svg className="w-5 h-5 text-[#C65D0E]" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" fill="currentColor" />
            </svg>
            <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Vehicle Status</h3>
          </div>

          <div className="flex-1 flex items-center justify-center py-6">
            <div className="relative w-56 h-56">
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                {/* Active - Orange */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#C65D0E"
                  strokeWidth="16"
                  strokeDasharray={`${activeDash} 282.7`}
                />
                {/* Inactive - Light Gray */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="16"
                  strokeDasharray={`${inactiveDash} 282.7`}
                  strokeDashoffset={`${activeDash}`}
                />
                {/* Maintenance - Red */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="16"
                  strokeDasharray={`${maintenanceDash} 282.7`}
                  strokeDashoffset={`${activeDash + inactiveDash}`}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[#1B2430] font-poppins">{totalVehiclesCount}</span>
                <span className="text-[11px] text-[#6B7280] font-bold uppercase tracking-widest mt-2">Total</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#C65D0E' }}></div>
              <span className="text-[#6B7280]">Active ({activeCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
              <span className="text-[#6B7280]">Maintenance ({maintenanceCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E5E7EB' }}></div>
              <span className="text-[#6B7280]">Inactive ({inactiveCount})</span>
            </div>
          </div>
        </div>

        {/* Compliance Expiry List */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-[#E5E7EB] shrink-0">
            <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Compliance Expiry</h3>
            <button
              onClick={() => navigate("/manager/documents")}
              className="text-[#C65D0E] text-xs font-bold hover:underline font-poppins cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-x-auto custom-scrollbar">
            {complianceExpiryList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 text-xs">
                <Icon icon="mdi:checkbox-marked-circle-outline" className="w-8 h-8 text-green-500 mb-2" />
                No documents expiring soon!
              </div>
            ) : (
              <table className="w-full text-left text-xs font-nunito whitespace-nowrap">
                <thead className="bg-[#F5F7FA]">
                  <tr>
                    <th className="px-4 py-3 text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">Vehicle</th>
                    <th className="px-4 py-3 text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">Document</th>
                    <th className="px-4 py-3 text-[#6B7280] font-bold uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceExpiryList.map((row) => (
                    <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors border-b border-[#F0F1F3]">
                      <td className="px-4 py-4 font-poppins font-bold text-[#1B2430] text-[13px]">{row.vehicle}</td>
                      <td className="px-4 py-4 text-[#6B7280] font-medium text-[13px]">{row.document}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider font-poppins whitespace-nowrap ${
                          row.status === "Expired" ? "bg-red-600 text-white shadow-md shadow-red-200" : "bg-amber-500 text-white shadow-md shadow-amber-200"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Cost Breakdown List */}
        <div className="bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6 shrink-0">
            <svg className="w-5 h-5 text-[#C65D0E]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
            <h3 className="font-poppins font-bold text-white text-[16px]">Cost Breakdown</h3>
          </div>

          <div className="flex-1 space-y-4">
            {costBreakdown.map((cost, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#9CA3AF]">{cost.category}</span>
                  <span className="text-sm font-bold text-white">{cost.amount}</span>
                </div>
                <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#C65D0E] to-[#D97706] rounded-full transition-all duration-1000"
                    style={{ width: `${cost.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
