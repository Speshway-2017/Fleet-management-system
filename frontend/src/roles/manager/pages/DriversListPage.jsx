import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Award,
  AlertTriangle,
  X,
  Loader,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { driverApi } from "@/api/driverApi";

export default function DriversListPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [licenseFilter, setLicenseFilter] = useState("All Types");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch drivers from API
  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await driverApi.list();
      setDrivers(res.data?.data || []);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(msg || "Failed to load drivers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  // Reset to first page when filters change
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

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;
    const driverId = selectedDriver._id;
    try {
      setIsDeleting(true);
      await driverApi.remove(driverId);
      toast.success("Driver deleted successfully!");
      await fetchDrivers();
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 404) {
        toast.error("Driver not found — it may already have been deleted.");
        await fetchDrivers();
      } else {
        toast.error(msg || "Failed to delete driver. Please try again.");
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedDriver(null);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "AVAILABLE": return "Available";
      case "ON_TRIP":   return "On Trip";
      case "SUSPENDED": return "Suspended";
      default:          return status;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE": return "bg-emerald-50 text-[#22C55E] border border-emerald-100";
      case "ON_TRIP":   return "bg-amber-50 text-[#B45A0A] border border-amber-100";
      case "SUSPENDED": return "bg-red-50 text-[#EF4444] border border-red-100";
      default:          return "bg-gray-100 text-gray-500";
    }
  };

  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredDrivers = drivers.filter((d) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (d.fullName || "").toLowerCase().includes(query) ||
      (d.phoneNumber || "").includes(query) ||
      (d.email || "").toLowerCase().includes(query) ||
      (d.licenseNumber || "").toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All Statuses" || d.driverStatus === statusFilter;
    const matchesLicense = licenseFilter === "All Types" || d.licenseType === licenseFilter;
    return matchesSearch && matchesStatus && matchesLicense;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDrivers.length / rowsPerPage));
  const indexOfFirstRow = (currentPage - 1) * rowsPerPage;
  const indexOfLastRow = Math.min(currentPage * rowsPerPage, filteredDrivers.length);
  const currentRows = filteredDrivers.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />

      <div className="flex items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Drivers List</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium">Complete listing of all registered operators</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manager/add-driver")}
            className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 mt-6">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or DL number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
            />
          </div>

          <div className="relative w-full lg:w-auto lg:min-w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative w-full lg:w-auto lg:min-w-40">
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none"
            >
              <option value="All Types">All Types</option>
              <option value="HMV">HMV</option>
              <option value="LMV">LMV</option>
              <option value="MCWG">MCWG</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {(search || statusFilter !== "All Statuses" || licenseFilter !== "All Types") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap self-center py-2.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="border-t border-[#E7EAF0]/60 mt-3 pt-3 flex items-center justify-between text-xs text-[#64748B] font-medium font-poppins">
          <span>Roster Listing</span>
          <span>Showing <strong>{currentRows.length}</strong> of {filteredDrivers.length} drivers</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-4 px-6 whitespace-nowrap">Driver</th>
                <th className="py-4 px-6 whitespace-nowrap">Contact Number</th>
                <th className="py-4 px-6 whitespace-nowrap">License Details</th>
                <th className="py-4 px-6 whitespace-nowrap">Assigned Vehicle</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-[#64748B]">
                      <Loader className="w-7 h-7 animate-spin text-[#B45A0A]" />
                      <span className="text-sm font-semibold">Loading drivers...</span>
                    </div>
                  </td>
                </tr>
              ) : currentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    {drivers.length === 0 ? "No drivers found. Add your first driver to get started." : "No drivers match the current filters."}
                  </td>
                </tr>
              ) : (
                currentRows.map((d) => (
                  <tr key={d._id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FDF3EC] text-[#B45A0A] rounded-xl flex items-center justify-center shrink-0 font-poppins font-bold text-sm">
                          {getInitials(d.fullName)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] font-poppins text-sm group-hover:text-[#B45A0A] transition-colors leading-tight">{d.fullName}</p>
                          <span className="text-[11px] text-[#64748B] font-semibold mt-0.5 block">{d.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{d.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold text-xs text-[#1E293B]">{d.licenseNumber}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 rounded-md shrink-0">{d.licenseType}</span>
                        </div>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block font-medium">
                          Expires: {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {!d.assignedVehicle || d.assignedVehicle === "Unassigned" ? (
                        <span className="text-[#EF4444] font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-100 inline-flex items-center gap-1">Unassigned</span>
                      ) : (
                        <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block">{d.assignedVehicle}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(d.driverStatus)}`}>
                        {getStatusLabel(d.driverStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => navigate(`/manager/driver-profile/${d._id}`)} 
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(`/manager/edit-driver/${d._id}`)} 
                          className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setSelectedDriver(d); setDeleteModalOpen(true); }} 
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredDrivers.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E7EAF0] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FDFDFD]">
            <div className="flex items-center gap-4 text-xs text-[#64748B] font-semibold font-poppins">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <div className="relative">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
              <span>| {indexOfFirstRow + 1}–{indexOfLastRow} of {filteredDrivers.length}</span>
            </div>
            <div className="flex items-center gap-1.5 select-none font-poppins">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F5F7FB] disabled:opacity-50 disabled:pointer-events-none cursor-pointer">Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${currentPage === page ? "bg-[#B45A0A] text-white border border-[#B45A0A]" : "border border-[#E7EAF0] text-[#64748B] hover:bg-[#F5F7FB]"}`}>{page}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="px-3 py-1.5 border border-[#E7EAF0] rounded-lg text-xs font-bold text-[#64748B] hover:bg-[#F5F7FB] disabled:opacity-50 disabled:pointer-events-none cursor-pointer">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative">
            <button onClick={() => { setDeleteModalOpen(false); setSelectedDriver(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6" />Confirm Deletion
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">This will permanently remove the driver from the fleet. This action cannot be undone.</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-[#EF4444] rounded-xl flex items-center justify-center font-bold text-sm font-poppins">{getInitials(selectedDriver.fullName)}</div>
                <div>
                  <p className="font-bold text-xs text-[#EF4444] font-poppins">{selectedDriver.fullName}</p>
                  <span className="text-[10px] text-red-500 font-semibold block mt-0.5">{selectedDriver.phoneNumber}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button onClick={() => { setDeleteModalOpen(false); setSelectedDriver(null); }} disabled={isDeleting} className="px-4 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] cursor-pointer disabled:opacity-50">Cancel</button>
                <button onClick={handleDeleteDriver} disabled={isDeleting} className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50">
                  {isDeleting ? <><Loader className="w-3.5 h-3.5 animate-spin" /><span>Deleting...</span></> : "Delete Driver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
