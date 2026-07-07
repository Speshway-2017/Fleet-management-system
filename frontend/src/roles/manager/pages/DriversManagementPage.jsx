import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Plus,
  Search,
  ChevronDown,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Award,
  Calendar,
  X
} from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_DRIVERS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@fleet.com",
    licenseNumber: "DL-1420180098765",
    licenseType: "HMV",
    licenseExpiry: "2028-12-15",
    status: "On Trip",
    assignedVehicle: "MH 12 AB 5678",
    rating: 4.8,
    experience: "8 Years",
    tripsCompleted: 142,
    incidentCount: 0,
    medicalFitnessStatus: "Fit",
    joiningDate: "2024-03-10"
  },
  {
    id: 2,
    name: "Ram Kumar",
    phone: "+91 87654 32109",
    email: "ram.kumar@fleet.com",
    licenseNumber: "DL-1520190012345",
    licenseType: "LMV",
    licenseExpiry: "2029-06-20",
    status: "Available",
    assignedVehicle: "KA 02 AB 1456",
    rating: 4.5,
    experience: "4 Years",
    tripsCompleted: 88,
    incidentCount: 1,
    medicalFitnessStatus: "Fit",
    joiningDate: "2025-01-15"
  },
  {
    id: 3,
    name: "Eshwar Singh",
    phone: "+91 76543 21098",
    email: "eshwar.singh@fleet.com",
    licenseNumber: "DL-1220160087654",
    licenseType: "HMV",
    licenseExpiry: "2026-10-05",
    status: "Available",
    assignedVehicle: "AP 39 EP 9465",
    rating: 4.9,
    experience: "12 Years",
    tripsCompleted: 230,
    incidentCount: 0,
    medicalFitnessStatus: "Fit",
    joiningDate: "2023-05-20"
  },
  {
    id: 4,
    name: "Manish Patel",
    phone: "+91 65432 10987",
    email: "manish.patel@fleet.com",
    licenseNumber: "DL-1320170023456",
    licenseType: "HMV",
    licenseExpiry: "2026-09-15",
    status: "On Trip",
    assignedVehicle: "TN 07 EQ 2312",
    rating: 4.2,
    experience: "6 Years",
    tripsCompleted: 104,
    incidentCount: 2,
    medicalFitnessStatus: "Fit",
    joiningDate: "2024-08-01"
  },
  {
    id: 5,
    name: "Ramana",
    phone: "+91 54321 09876",
    email: "ramana.k@fleet.com",
    licenseNumber: "DL-1120150034567",
    licenseType: "HMV",
    licenseExpiry: "2026-08-25",
    status: "Suspended",
    assignedVehicle: "MH 12 AB 5679",
    rating: 3.9,
    experience: "10 Years",
    tripsCompleted: 180,
    incidentCount: 4,
    medicalFitnessStatus: "Pending",
    joiningDate: "2023-11-12"
  },
  {
    id: 6,
    name: "Vijay Kumar",
    phone: "+91 99887 76655",
    email: "vijay.kumar@fleet.com",
    licenseNumber: "DL-1620200045678",
    licenseType: "LMV",
    licenseExpiry: "2027-11-15",
    status: "Available",
    assignedVehicle: "DL 03 EC 9876",
    rating: 4.7,
    experience: "5 Years",
    tripsCompleted: 95,
    incidentCount: 0,
    medicalFitnessStatus: "Fit",
    joiningDate: "2024-11-10"
  },
  {
    id: 7,
    name: "Sanjay Singh",
    phone: "+91 88776 65544",
    email: "sanjay.singh@fleet.com",
    licenseNumber: "DL-1020140056789",
    licenseType: "LMV",
    licenseExpiry: "2026-07-20",
    status: "Inactive",
    assignedVehicle: "MH 14 EU 1122",
    rating: 4.4,
    experience: "7 Years",
    tripsCompleted: 120,
    incidentCount: 1,
    medicalFitnessStatus: "Fit",
    joiningDate: "2024-02-12"
  },
  {
    id: 8,
    name: "Amit Sharma",
    phone: "+91 77665 54433",
    email: "amit.sharma@fleet.com",
    licenseNumber: "DL-1720210067890",
    licenseType: "LMV",
    licenseExpiry: "2030-04-18",
    status: "Available",
    assignedVehicle: "Unassigned",
    rating: 4.6,
    experience: "3 Years",
    tripsCompleted: 45,
    incidentCount: 0,
    medicalFitnessStatus: "Fit",
    joiningDate: "2025-04-10"
  }
];

export default function DriversManagementPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState(() => {
    const saved = localStorage.getItem("fleet_drivers");
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [licenseFilter, setLicenseFilter] = useState("All Types");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("fleet_drivers", JSON.stringify(drivers));
  }, [drivers]);

  // KPIs calculations
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === "On Trip" || d.status === "Available").length;
  const onTripDrivers = drivers.filter(d => d.status === "On Trip").length;
  const suspendedDrivers = drivers.filter(d => d.status === "Suspended").length;

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setLicenseFilter("All Types");
    const saved = localStorage.getItem("fleet_drivers");
    if (saved) {
      setDrivers(JSON.parse(saved));
    } else {
      setDrivers(INITIAL_DRIVERS);
    }
    toast.success("Showing top drivers");
  };

  const handleDeleteDriver = () => {
    if (!selectedDriver) return;
    
    // Update local vehicle state to unassign this driver if assigned
    const savedVehicles = localStorage.getItem("fleet_vehicles");
    if (savedVehicles) {
      const vehicles = JSON.parse(savedVehicles);
      const updatedVehicles = vehicles.map(v => 
        v.driver === selectedDriver.name ? { ...v, driver: "Unassigned" } : v
      );
      localStorage.setItem("fleet_vehicles", JSON.stringify(updatedVehicles));
    }

    const updated = drivers.filter(d => d.id !== selectedDriver.id);
    setDrivers(updated);
    setDeleteModalOpen(false);
    setSelectedDriver(null);
    toast.success("Driver profile deleted successfully");
  };

  const filteredDrivers = drivers.filter(d => {
    const query = search.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(query) ||
      d.phone.includes(query) ||
      d.email.toLowerCase().includes(query) ||
      d.licenseNumber.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "All Statuses" || d.status === statusFilter;
    const matchesLicense = licenseFilter === "All Types" || d.licenseType === licenseFilter;

    return matchesSearch && matchesStatus && matchesLicense;
  });

  const displayedDrivers = filteredDrivers.slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-50 text-[#22C55E] border border-emerald-100";
      case "On Trip":
        return "bg-amber-50 text-[#B45A0A] border border-amber-100";
      case "Inactive":
        return "bg-slate-50 text-[#64748B] border border-slate-100";
      case "Suspended":
        return "bg-red-50 text-[#EF4444] border border-red-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // Helper for generating custom avatar styling / letters
  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-6 lg:p-8 space-y-4 animate-fade-in">
          
          {/* --- KPI CARDS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Total Drivers</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{totalDrivers}</h3>
                </div>
                <div className="bg-[#FDF3EC] text-[#B45A0A] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-[#64748B] font-medium">
                Registered personnel: <span className="font-bold text-[#1E293B]">{totalDrivers} active roles</span>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Active Drivers</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{activeDrivers}</h3>
                </div>
                <div className="bg-emerald-50 text-[#22C55E] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-[#64748B] font-medium">
                Active utility rate: <span className="text-emerald-600 font-bold">{Math.round((activeDrivers / totalDrivers) * 100) || 0}%</span>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">On Trip</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{onTripDrivers}</h3>
                </div>
                <div className="bg-amber-50 text-[#B45A0A] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <RefreshCw className="w-6 h-6 animate-spin-slow" />
                </div>
              </div>
              <div className="mt-4 text-xs text-[#64748B] font-medium">
                Currently en route: <span className="text-amber-600 font-bold">{onTripDrivers} drivers</span>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">Suspended</span>
                  <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{suspendedDrivers}</h3>
                </div>
                <div className="bg-red-50 text-[#EF4444] p-3.5 rounded-xl transition-all duration-300 group-hover:scale-110">
                  <UserX className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-xs text-red-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Requires compliance review</span>
              </div>
            </div>

          </div>

          {/* --- PAGE HEADER --- */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4">
            <div>
              <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">
                Driver Management
              </h1>
              <p className="text-sm text-[#64748B] mt-1 font-medium">
                Track compliance certificates, service history, and assign vehicles to active roster.
              </p>
            </div>

            <button
              onClick={() => navigate("/manager/add-driver")}
              className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 font-poppins cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Add Driver</span>
            </button>
          </div>

          {/* --- ADVANCED FILTER SECTION --- */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Bar */}
              <div className="md:col-span-2 relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Search className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search drivers by name, phone, email, or DL number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
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
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>

              {/* License Type Filter */}
              <div className="relative">
                <select
                  value={licenseFilter}
                  onChange={(e) => setLicenseFilter(e.target.value)}
                  className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
                >
                  <option>All Types</option>
                  <option>HMV</option>
                  <option>LMV</option>
                  <option>MCWG</option>
                </select>
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <ChevronDown className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E7EAF0]/60 pt-4">
              <div className="flex items-center gap-3">
                {(search || statusFilter !== "All Statuses" || licenseFilter !== "All Types") && (
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
                Showing <span className="font-bold text-[#1E293B]">{displayedDrivers.length}</span> of {filteredDrivers.length} drivers
              </div>
            </div>
          </div>

          {/* --- DRIVERS LIST TABLE --- */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between shrink-0">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Drivers List</h3>
              <button
                onClick={() => navigate("/manager/drivers-list")}
                className="text-xs text-[#B45A0A] hover:text-[#9A4D08] hover:underline font-bold font-poppins flex items-center gap-1 cursor-pointer"
              >
                <span>View All Drivers</span>
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                    <th className="py-4 px-6 whitespace-nowrap">Driver</th>
                    <th className="py-4 px-6 whitespace-nowrap">Contact Number</th>
                    <th className="py-4 px-6 whitespace-nowrap">License Details</th>
                    <th className="py-4 px-6 whitespace-nowrap">Assigned Vehicle</th>
                    <th className="py-4 px-6 whitespace-nowrap">Status</th>
                    <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {displayedDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 font-medium font-nunito">
                        No drivers found matching the filters.
                      </td>
                    </tr>
                  ) : (
                    displayedDrivers.map((d) => (
                      <tr key={d.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                        {/* Driver Info Cell */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FDF3EC] text-[#B45A0A] rounded-xl flex items-center justify-center shrink-0 border border-[#FDF3EC]/50 font-poppins font-bold text-sm">
                              {getInitials(d.name)}
                            </div>
                            <div>
                              <p className="font-bold text-[#1E293B] font-poppins text-sm group-hover:text-[#B45A0A] transition-colors leading-tight">
                                {d.name}
                              </p>
                              <span className="text-[11px] text-[#64748B] font-semibold mt-0.5 block">{d.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                            <span>{d.phone}</span>
                          </div>
                        </td>

                        {/* License Info */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="font-bold text-xs text-[#1E293B]">{d.licenseNumber}</span>
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded-md shrink-0">
                                {d.licenseType}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#64748B] mt-0.5 block font-medium">
                              Expires: {new Date(d.licenseExpiry).toLocaleDateString("en-IN", {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Assigned Vehicle */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          {d.assignedVehicle === "Unassigned" ? (
                            <span className="text-[#EF4444] font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 inline-flex items-center gap-1 select-none">
                              Unassigned
                            </span>
                          ) : (
                            <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block font-poppins tracking-wide">
                              {d.assignedVehicle}
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(d.status)}`}>
                            {d.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Driver Profile */}
                            <button
                              onClick={() => navigate(`/manager/driver-profile/${d.id}`)}
                              title="View profile"
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Delete Driver */}
                            <button
                              onClick={() => {
                                setSelectedDriver(d);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete driver"
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* Floating Add Driver Button */}
      <button
        onClick={() => navigate("/manager/add-driver")}
        title="Add new driver"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-[#B45A0A]/35 hover:scale-108 transition-all z-30 group cursor-pointer"
      >
        <Plus className="w-7 h-7 transition-transform group-hover:rotate-90" />
      </button>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => { setDeleteModalOpen(false); setSelectedDriver(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins text-[#1E293B] flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  Confirm Deletion
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Are you absolutely sure you want to remove this driver from the fleet record? This will also unassign them from any active vehicle.
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 select-none">
                <div className="w-10 h-10 bg-red-100 text-[#EF4444] rounded-xl flex items-center justify-center shrink-0 font-bold">
                  {getInitials(selectedDriver.name)}
                </div>
                <div>
                  <p className="font-bold text-xs text-[#EF4444] font-poppins">{selectedDriver.name}</p>
                  <span className="text-[10px] text-red-500 font-semibold tracking-wider block mt-0.5">{selectedDriver.phone}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => { setDeleteModalOpen(false); setSelectedDriver(null); }}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDriver}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Delete Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
