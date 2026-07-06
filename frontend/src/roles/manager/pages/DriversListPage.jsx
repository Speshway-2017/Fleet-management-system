import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Search,
  ChevronDown,
  RefreshCw,
  Eye,
  Trash2,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export default function DriversListPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [licenseFilter, setLicenseFilter] = useState("All Types");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fleet_drivers");
    if (saved) {
      setDrivers(JSON.parse(saved));
    }
  }, []);

  // Reset to first page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, licenseFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setLicenseFilter("All Types");
    setCurrentPage(1);
    setRowsPerPage(5);
    toast.success("Filters reset successfully!");
  };

  const handleDeleteDriver = () => {
    if (!selectedDriver) return;

    // Unassign driver from vehicle if assigned
    const savedVehicles = localStorage.getItem("fleet_vehicles");
    if (savedVehicles) {
      const vehiclesList = JSON.parse(savedVehicles);
      const updatedVehicles = vehiclesList.map(v => 
        v.driver === selectedDriver.name ? { ...v, driver: "Unassigned" } : v
      );
      localStorage.setItem("fleet_vehicles", JSON.stringify(updatedVehicles));
    }

    const updated = drivers.filter(d => d.id !== selectedDriver.id);
    setDrivers(updated);
    localStorage.setItem("fleet_drivers", JSON.stringify(updated));
    setDeleteModalOpen(false);
    setSelectedDriver(null);
    toast.success("Driver profile deleted successfully!");
  };

  // Compute filtered drivers list
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

  // Pagination helper calculations
  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / rowsPerPage));
  const indexOfLastRow = Math.min(currentPage * rowsPerPage, filteredDrivers.length);
  const indexOfFirstRow = Math.max(0, (currentPage - 1) * rowsPerPage);
  const currentRows = filteredDrivers.slice(indexOfFirstRow, indexOfLastRow);

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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manager/drivers")}
            className="p-2.5 bg-white border border-[#E7EAF0] hover:bg-[#F5F7FB] rounded-xl text-[#64748B] hover:text-[#1E293B] transition-all cursor-pointer"
            title="Back to Driver Management"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black font-poppins text-[#1E293B]">
              Drivers List
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Complete listing of all registered operators
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar with Filters */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full lg:w-auto lg:min-w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
            >
              <option>All Statuses</option>
              <option>Available</option>
              <option>On Trip</option>
              <option>Inactive</option>
              <option>Suspended</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

          {/* License Class Filter */}
          <div className="relative w-full lg:w-auto lg:min-w-40">
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
            >
              <option>All Types</option>
              <option>HMV</option>
              <option>LMV</option>
              <option>MCWG</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

          {/* Reset Trigger */}
          {(search || statusFilter !== "All Statuses" || licenseFilter !== "All Types") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap self-center lg:self-auto py-2.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="border-t border-[#E7EAF0]/60 mt-3 pt-3 flex items-center justify-between text-xs text-[#64748B] font-medium font-poppins">
          <span>Roster Listing</span>
          <span>Showing <strong>{currentRows.length}</strong> of {filteredDrivers.length} drivers</span>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden mt-6">
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
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium font-nunito">
                    No drivers found matching the selection.
                  </td>
                </tr>
              ) : (
                currentRows.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
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

                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{d.phone}</span>
                      </div>
                    </td>

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

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(d.status)}`}>
                        {d.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/manager/driver-profile/${d.id}`)}
                          title="View profile"
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

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

        {/* Pagination Controls */}
        {filteredDrivers.length > 0 && (
          <div className="px-6 py-4.5 border-t border-[#E7EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFDFD]">
            <div className="flex items-center gap-4 text-xs text-[#64748B] font-semibold font-poppins">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="pl-2.5 pr-8 py-1.5 bg-white border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <span>|</span>
              <span>
                Showing <span className="text-[#1E293B] font-bold">{indexOfFirstRow + 1}</span> - <span className="text-[#1E293B] font-bold">{indexOfLastRow}</span> of <span className="text-[#1E293B] font-bold">{filteredDrivers.length}</span> entries
              </span>
            </div>

            <div className="flex items-center gap-1.5 select-none font-poppins">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#B45A0A] text-white border border-[#B45A0A]"
                      : "border border-[#E7EAF0] text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

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
