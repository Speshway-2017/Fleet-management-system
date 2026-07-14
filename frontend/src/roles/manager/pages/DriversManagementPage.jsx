import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, UserX, AlertTriangle, Plus,
  Search, ChevronDown, RefreshCw, Eye, Trash2,
  Phone, Award, X, Loader
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { driverApi } from "@/api/driverApi";

export default function DriversManagementPage() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [licenseFilter, setLicenseFilter] = useState("All Types");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await driverApi.list();
      setDrivers(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  // KPIs
  const totalDrivers    = drivers.length;
  const activeDrivers   = drivers.filter((d) => d.driverStatus === "AVAILABLE" || d.driverStatus === "ON_TRIP").length;
  const onTripDrivers   = drivers.filter((d) => d.driverStatus === "ON_TRIP").length;
  const suspendedDrivers = drivers.filter((d) => d.driverStatus === "SUSPENDED").length;

  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;
    try {
      setIsDeleting(true);
      await driverApi.remove(selectedDriver._id);
      toast.success("Driver deleted successfully");
      await fetchDrivers();
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) { toast.error("Driver not found."); await fetchDrivers(); }
      else toast.error(err.response?.data?.message || "Failed to delete driver.");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedDriver(null);
    }
  };

  const getStatusLabel = (s) => ({ AVAILABLE: "Available", ON_TRIP: "On Trip", ASSIGNED: "Assigned", SUSPENDED: "Suspended" }[s] || s);
  const getStatusBadge = (s) => ({
    AVAILABLE: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    ON_TRIP: "bg-amber-50 text-amber-600 border border-amber-100",
    ASSIGNED: "bg-blue-50 text-blue-600 border border-blue-100",
    SUSPENDED: "bg-rose-50 text-rose-600 border border-rose-100"
  }[s] || "bg-gray-100 text-gray-500");
  const getInitials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredDrivers = drivers.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = (d.fullName || "").toLowerCase().includes(q) || (d.phoneNumber || "").includes(q) || (d.email || "").toLowerCase().includes(q) || (d.licenseNumber || "").toLowerCase().includes(q);
    const matchStatus  = statusFilter === "All Statuses" || d.driverStatus === statusFilter;
    const matchLicense = licenseFilter === "All Types" || d.licenseType === licenseFilter;
    return matchSearch && matchStatus && matchLicense;
  });

  const displayedDrivers = filteredDrivers.slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-4 animate-fade-in">
      <Breadcrumb />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Driver Management</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Track compliance certificates, service history, and assign vehicles to active roster.</p>
        </div>
        <button onClick={() => navigate("/manager/add-driver")} className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 font-poppins cursor-pointer">
          <Plus className="w-4.5 h-4.5" /><span>Add Driver</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Drivers",  value: totalDrivers,    icon: <Users className="w-6 h-6" />,   color: "bg-[#FDF3EC] text-[#B45A0A]", sub: `${totalDrivers} active roles` },
          { label: "Active Drivers", value: activeDrivers,   icon: <UserCheck className="w-6 h-6" />, color: "bg-emerald-50 text-[#22C55E]", sub: `${Math.round((activeDrivers / (totalDrivers || 1)) * 100)}% utility rate` },
          { label: "On Trip",        value: onTripDrivers,   icon: <RefreshCw className="w-6 h-6" />, color: "bg-amber-50 text-[#B45A0A]",   sub: `${onTripDrivers} currently en route` },
          { label: "Suspended",      value: suspendedDrivers, icon: <UserX className="w-6 h-6" />,   color: "bg-red-50 text-[#EF4444]",     sub: "Requires compliance review" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase font-poppins">{kpi.label}</span>
                <h3 className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">{loading ? "—" : kpi.value}</h3>
              </div>
              <div className={`${kpi.color} p-3.5 rounded-xl transition-all group-hover:scale-110`}>{kpi.icon}</div>
            </div>
            <div className="mt-4 text-xs text-[#64748B] font-medium">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
            <input type="text" placeholder="Search drivers by name, phone, email, or DL number..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A]" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none">
              <option value="All Statuses">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={licenseFilter} onChange={(e) => setLicenseFilter(e.target.value)} className="w-full px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none">
              <option value="All Types">All Types</option>
              <option value="HMV">HMV</option>
              <option value="LMV">LMV</option>
              <option value="MCWG">MCWG</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#E7EAF0]/60 pt-4">
          {(search || statusFilter !== "All Statuses" || licenseFilter !== "All Types") && (
            <button onClick={() => { setSearch(""); setStatusFilter("All Statuses"); setLicenseFilter("All Types"); }} className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer">
              <RefreshCw className="w-3 h-3" /><span>Reset</span>
            </button>
          )}
          <div className="text-xs text-[#64748B] font-medium font-poppins ml-auto">
            Showing <strong>{displayedDrivers.length}</strong> of {filteredDrivers.length} drivers
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between">
          <h3 className="font-poppins font-black text-lg text-[#1E293B]">Drivers List</h3>
          <button onClick={() => navigate("/manager/drivers-list")} className="text-xs text-[#B45A0A] hover:underline font-bold font-poppins cursor-pointer">View All Drivers</button>
        </div>
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
                <tr><td colSpan={6} className="py-16 text-center"><div className="flex flex-col items-center gap-3"><Loader className="w-7 h-7 animate-spin text-[#B45A0A]" /><span className="text-sm font-semibold text-[#64748B]">Loading drivers...</span></div></td></tr>
              ) : displayedDrivers.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400 font-medium">{drivers.length === 0 ? "No drivers found. Add your first driver to get started." : "No drivers match the current filters."}</td></tr>
              ) : (
                displayedDrivers.map((d) => (
                  <tr key={d._id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#FDF3EC] text-[#B45A0A] rounded-xl flex items-center justify-center font-poppins font-bold text-sm">{getInitials(d.fullName)}</div>
                        <div>
                          <p className="font-bold text-[#1E293B] font-poppins text-sm group-hover:text-[#B45A0A] leading-tight">{d.fullName}</p>
                          <span className="text-[11px] text-[#64748B] font-semibold block mt-0.5">{d.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#64748B]" /><span>{d.phoneNumber}</span></div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-indigo-500" /><span className="font-bold text-xs text-[#1E293B]">{d.licenseNumber}</span><span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 rounded-md">{d.licenseType}</span></div>
                        <span className="text-[10px] text-[#64748B] mt-0.5 font-medium">Expires: {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {!d.assignedVehicle || d.assignedVehicle === "Unassigned"
                        ? <span className="text-[#EF4444] font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">Unassigned</span>
                        : <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{d.assignedVehicle}</span>}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(d.driverStatus)}`}>{getStatusLabel(d.driverStatus)}</span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/manager/driver-profile/${d._id}`)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedDriver(d); setDeleteModalOpen(true); }} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => navigate("/manager/add-driver")} className="fixed bottom-6 right-6 w-14 h-14 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-30 group cursor-pointer">
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Delete Modal */}
      {deleteModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative">
            <button onClick={() => { setDeleteModalOpen(false); setSelectedDriver(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl cursor-pointer"><X className="w-5 h-5" /></button>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins flex items-center gap-2 text-[#EF4444]"><AlertTriangle className="w-6 h-6" />Confirm Deletion</h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">This will permanently remove the driver from the fleet record.</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-[#EF4444] rounded-xl flex items-center justify-center font-bold text-sm">{getInitials(selectedDriver.fullName)}</div>
                <div>
                  <p className="font-bold text-xs text-[#EF4444]">{selectedDriver.fullName}</p>
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
