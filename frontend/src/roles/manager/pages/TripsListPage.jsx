import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ChevronDown,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Route,
  X,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

export default function TripsListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fleet_trips");
    if (saved) {
      setTrips(JSON.parse(saved));
    }
  }, []);

  // Reset to first page when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setCurrentPage(1);
    setRowsPerPage(5);
    toast.success("Filters reset successfully");
  };

  const handleDeleteTrip = () => {
    if (!selectedTrip) return;
    const updated = trips.filter(t => t.id !== selectedTrip.id);
    setTrips(updated);
    localStorage.setItem("fleet_trips", JSON.stringify(updated));
    setDeleteModalOpen(false);
    setSelectedTrip(null);
    toast.success("Trip record deleted successfully");
  };

  // Compute filtered trips list
  const filteredTrips = trips.filter(t => {
    const query = search.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(query) ||
      t.driverName.toLowerCase().includes(query) ||
      t.vehicleName.toLowerCase().includes(query) ||
      t.startLocation.toLowerCase().includes(query) ||
      t.endLocation.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "All Statuses" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination helper calculations
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / rowsPerPage));
  const indexOfLastRow = Math.min(currentPage * rowsPerPage, filteredTrips.length);
  const indexOfFirstRow = Math.min((currentPage - 1) * rowsPerPage, filteredTrips.length);
  const currentRows = filteredTrips.slice(indexOfFirstRow, indexOfLastRow);

  const getStatusBadge = (status) => {
    switch (status) {
      case "On Transit":
        return "bg-[#FDF3EC] text-[#B45A0A] border border-[#FDF3EC]";
      case "Scheduled":
        return "bg-indigo-50 text-indigo-700 border border-indigo-100";
      case "Completed":
        return "bg-slate-900 text-white border border-slate-950";
      case "Delayed":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const formatDateTime = (dtString) => {
    if (!dtString) return "N/A";
    return new Date(dtString).toLocaleDateString("en-IN", {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manager/trips")}
            className="p-2.5 bg-white border border-[#E7EAF0] hover:bg-[#F5F7FB] rounded-xl text-[#64748B] hover:text-[#1E293B] transition-all cursor-pointer"
            title="Back to Trips Overview"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black font-poppins text-[#1E293B]">
              Trips List
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-medium">
              Complete listing of all registered trip dispatches
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar with Filters */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search trips by ID, driver, vehicle, or locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Scheduled</option>
              <option>On Transit</option>
              <option>Delayed</option>
              <option>Completed</option>
            </select>
            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#64748B]">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>

          {/* Reset Trigger */}
          {(search || statusFilter !== "All Statuses") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-[#EF4444] hover:underline font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap self-center py-2.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="border-t border-[#E7EAF0]/60 mt-3 pt-3 flex items-center justify-between text-xs text-[#64748B] font-medium font-poppins">
          <span>Dispatches Database</span>
          <span>Showing <strong>{currentRows.length}</strong> of {filteredTrips.length} trips</span>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6 whitespace-nowrap">Trip ID</th>
                <th className="py-4 px-6 whitespace-nowrap">Driver</th>
                <th className="py-4 px-6 whitespace-nowrap">Vehicle</th>
                <th className="py-4 px-6 whitespace-nowrap">Route</th>
                <th className="py-4 px-6 whitespace-nowrap">Departure</th>
                <th className="py-4 px-6 whitespace-nowrap">ETA</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 font-medium font-nunito">
                    No trips found matching the selection.
                  </td>
                </tr>
              ) : (
                currentRows.map((t) => (
                  <tr key={t.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                    
                    {/* Trip ID */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg w-max font-poppins">
                          {t.id}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-1 block font-semibold max-w-[150px] truncate">
                          {t.description}
                        </span>
                      </div>
                    </td>

                    {/* Driver */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-[#1E293B] font-poppins group-hover:text-[#B45A0A] transition-colors">
                          {t.driverName}
                        </span>
                        <span className="text-[10px] text-[#64748B] mt-0.5 block font-semibold">
                          {t.driverPhone}
                        </span>
                      </div>
                    </td>

                    {/* Vehicle */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#1E293B]">
                          {t.vehicleName}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-500 mt-0.5 uppercase tracking-wide block font-poppins">
                          {t.vehiclePlate}
                        </span>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-[#1E293B]">{t.startLocation}</span>
                        <div className="h-2 border-l border-dashed border-gray-300 ml-1.5 my-0.5"></div>
                        <span className="font-bold text-xs text-[#1E293B]">{t.endLocation}</span>
                      </div>
                    </td>

                    {/* Departure */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{formatDateTime(t.departureTime)}</span>
                      </div>
                    </td>

                    {/* ETA */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-[#1E293B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{formatDateTime(t.eta)}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/manager/trip-details/${t.id}`)}
                          title="View details"
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTrip(t);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete trip record"
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
        {filteredTrips.length > 0 && (
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
                Showing <span className="text-[#1E293B] font-bold">{indexOfFirstRow + 1}</span> - <span className="text-[#1E293B] font-bold">{indexOfLastRow}</span> of <span className="text-[#1E293B] font-bold">{filteredTrips.length}</span> entries
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
      {deleteModalOpen && selectedTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0] relative animate-scale-up">
            <button
              onClick={() => { setDeleteModalOpen(false); setSelectedTrip(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-poppins text-[#1E293B] flex items-center gap-2 text-[#EF4444]">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                  Cancel Trip Dispatch
                </h3>
                <p className="text-xs text-[#64748B] mt-1 font-medium">
                  Are you absolutely sure you want to cancel and delete trip logs for dispatch <strong>{selectedTrip.id}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7EAF0]">
                <button
                  onClick={() => { setDeleteModalOpen(false); setSelectedTrip(null); }}
                  className="px-4.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Keep Trip
                </button>
                <button
                  onClick={handleDeleteTrip}
                  className="px-5 py-2.5 bg-[#EF4444] hover:bg-red-700 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer"
                >
                  Cancel Trip Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
