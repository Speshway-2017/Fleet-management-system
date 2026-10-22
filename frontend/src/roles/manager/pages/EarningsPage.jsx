import React, { useState, useEffect, useMemo } from "react";
import axiosClient from "@/api/axiosClient";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Activity,
  Percent,
  Receipt,
  Truck
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatCurrency, formatFullCurrency, parseNumericValue } from "@/utils/currencyFormatter";
import { getSocket } from "@/api/socket";
import toast from "react-hot-toast";
import { validateSearchQuery } from "@/validations/common.schema.js";

export default function EarningsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" or "details"
  const [selectedTripId, setSelectedTripId] = useState("all");
  const [data, setData] = useState({
    stats: { totalRevenue: 0, totalExpenses: 0, totalNetEarnings: 0, tripCount: 0 },
    chartData: [],
    tripEarnings: []
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const err = validateSearchQuery(val, 50);
    setSearchError(err);
    setCurrentPage(1);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEarnings();

    const socket = getSocket();
    const handleInstantRefresh = () => fetchEarnings(false);

    socket.on("trip:status-updated", handleInstantRefresh);
    socket.on("trip:rejected", handleInstantRefresh);
    socket.on("trip:completed", handleInstantRefresh);
    socket.on("dashboard:refresh", handleInstantRefresh);
    socket.on("trip:created", handleInstantRefresh);
    socket.on("trip:updated", handleInstantRefresh);
    socket.on("fuel:created", handleInstantRefresh);
    socket.on("fuel:approved", handleInstantRefresh);
    socket.on("fuel:updated", handleInstantRefresh);
    socket.on("toll:created", handleInstantRefresh);

    // Auto-refresh interval every 20 seconds for continuous dynamic synchronization
    const intervalId = setInterval(() => {
      fetchEarnings(false);
    }, 20000);

    return () => {
      socket.off("trip:status-updated", handleInstantRefresh);
      socket.off("trip:rejected", handleInstantRefresh);
      socket.off("trip:completed", handleInstantRefresh);
      socket.off("dashboard:refresh", handleInstantRefresh);
      socket.off("trip:created", handleInstantRefresh);
      socket.off("trip:updated", handleInstantRefresh);
      socket.off("fuel:created", handleInstantRefresh);
      socket.off("fuel:approved", handleInstantRefresh);
      socket.off("fuel:updated", handleInstantRefresh);
      socket.off("toll:created", handleInstantRefresh);
      clearInterval(intervalId);
    };
  }, []);

  const fetchEarnings = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const { data: resData } = await axiosClient.get("/manager/earnings");
      if (resData.success) {
        setData(resData.data);
      } else {
        toast.error("Failed to load earnings data");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      if (showLoading) toast.error("Failed to connect to backend server");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Selected trip helper
  const selectedTrip = useMemo(() => {
    if (selectedTripId === "all") return null;
    return (
      data.tripEarnings.find(
        (t) =>
          String(t.tripId) === String(selectedTripId) ||
          String(t.tripNumber) === String(selectedTripId)
      ) || null
    );
  }, [data.tripEarnings, selectedTripId]);

  // Sort and filter logic
  const filteredEarnings = useMemo(() => {
    if (searchError) return [];
    return data.tripEarnings
      .filter((item) => {
        const matchesSearch =
          item.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.endLocation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "All" || item.status === statusFilter;

        const matchesTrip =
          selectedTripId === "all" ||
          String(item.tripId) === String(selectedTripId) ||
          String(item.tripNumber) === String(selectedTripId);

        return matchesSearch && matchesStatus && matchesTrip;
      })
      .sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        if (sortField === "date") {
          valueA = new Date(valueA).getTime();
          valueB = new Date(valueB).getTime();
        }

        if (typeof valueA === "string") {
          return sortDirection === "asc"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }

        return sortDirection === "asc"
          ? valueA - valueB
          : valueB - valueA;
      });
  }, [data.tripEarnings, searchTerm, searchError, statusFilter, selectedTripId, sortField, sortDirection]);

  // Paginated listings
  const paginatedEarnings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEarnings.slice(start, start + itemsPerPage);
  }, [filteredEarnings, currentPage]);

  const totalPages = Math.ceil(filteredEarnings.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredEarnings.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Trip Number",
      "Vehicle Plate",
      "Driver Name",
      "Route",
      "Status",
      "Date",
      "Distance (km)",
      "Revenue (₹)",
      "Expenses (₹)",
      "Net Earnings (₹)"
    ];

    const rows = filteredEarnings.map((item) => [
      item.tripNumber,
      item.vehiclePlate,
      item.driverName,
      `${item.startLocation} to ${item.endLocation}`,
      item.status,
      new Date(item.date).toLocaleDateString("en-IN"),
      item.distance,
      item.revenue,
      item.expenses,
      item.netEarnings
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `fleet_earnings_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Earnings CSV Export downloaded successfully");
  };

  const dynamicStats = useMemo(() => {
    const serverStats = data.stats || {};
    const isSearchingOrFiltering = Boolean(
      searchTerm.trim() ||
      statusFilter !== "All" ||
      selectedTripId !== "all"
    );

    const isCancelledOrRejected = (st) => {
      const s = String(st || '').trim().toLowerCase();
      return s.includes('reject') || s.includes('cancel');
    };

    const isCompletedStatus = (st) => {
      const s = String(st || '').trim().toLowerCase();
      return s === 'completed' || s === 'complete trip' || s === 'delivered';
    };

    // If viewing unfiltered overall state, prioritize canonical server stats from backend single source of truth
    if (!isSearchingOrFiltering && serverStats.totalRevenue !== undefined) {
      const totalRevenue = Number(serverStats.totalRevenue) || 0;
      const totalExpenses = Number(serverStats.totalExpenses) || 0;
      const totalNetEarnings = Number(serverStats.totalNetEarnings) ?? (totalRevenue - totalExpenses);
      const marginPercent = Number(serverStats.marginPercent) ?? (totalRevenue > 0 ? Math.round((totalNetEarnings / totalRevenue) * 100) : 0);
      const fuelExpenses = Number(serverStats.totalFuelExpenses) || 0;
      const tollExpenses = Number(serverStats.totalTollExpenses) || 0;
      const completedCount = Number(serverStats.completedTripCount) || 0;
      const validTripCount = Number(serverStats.tripCount) ?? data.tripEarnings.filter(t => !isCancelledOrRejected(t.status)).length;

      return {
        totalRevenue,
        totalExpenses,
        totalNetEarnings,
        marginPercent,
        fuelExpenses,
        tollExpenses,
        completedCount,
        tripCount: validTripCount,
        isFiltered: false
      };
    }

    // Dynamic aggregation for filtered view or selected trip (strictly completed & non-rejected trips only)
    let totalRevenue = 0;
    let totalExpenses = 0;
    let fuelExpenses = 0;
    let tollExpenses = 0;
    let completedCount = 0;

    const targetList = isSearchingOrFiltering ? filteredEarnings : data.tripEarnings;

    targetList.forEach((item) => {
      if (isCancelledOrRejected(item.status)) return; // Strictly ignore rejected/cancelled trips in KPI financials

      const isComp = item.isCompleted ?? isCompletedStatus(item.status);
      if (isComp) {
        completedCount++;
        const rev = Number(item.revenue) || 0;
        const exp = Number(item.expenses) || 0;
        totalRevenue += rev;
        totalExpenses += exp;
        fuelExpenses += Number(item.fuelExpense) || 0;
        tollExpenses += Number(item.tollExpense) || 0;
      }
    });

    const totalNetEarnings = totalRevenue - totalExpenses;
    const marginPercent = totalRevenue > 0
      ? Math.round((totalNetEarnings / totalRevenue) * 100)
      : 0;

    const validTripCount = targetList.filter(item => !isCancelledOrRejected(item.status)).length;

    return {
      totalRevenue,
      totalExpenses,
      totalNetEarnings,
      marginPercent,
      fuelExpenses,
      tollExpenses,
      completedCount,
      tripCount: validTripCount,
      isFiltered: isSearchingOrFiltering
    };
  }, [data.stats, data.tripEarnings, filteredEarnings, searchTerm, statusFilter, selectedTripId]);

  return (
    <div className="w-full px-6 md:px-8 py-8 overflow-x-hidden">
      <Breadcrumb />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Earnings Dashboard</h1>
          <p className="text-[14px] text-[#64748B] mt-2">Track trip revenues, operational expenses, and profit margins in real-time.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#F1F5F9] p-1.5 rounded-xl self-start md:self-auto shadow-inner border border-gray-200/50">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-poppins text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-white text-[#A14000] shadow-sm"
                : "text-[#64748B] hover:text-[#475569]"
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 rounded-lg font-poppins text-xs font-bold transition-all ${
              activeTab === "details"
                ? "bg-white text-[#A14000] shadow-sm"
                : "text-[#64748B] hover:text-[#475569]"
            }`}
          >
            Detailed Listings
          </button>
        </div>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {formatFullCurrency(dynamicStats.totalRevenue)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5 truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              {dynamicStats.completedCount > 0
                ? `From ${dynamicStats.completedCount} completed trip${dynamicStats.completedCount === 1 ? '' : 's'}`
                : "Gross freight & billing revenue"}
            </span>
          </div>
        </div>

        {/* Operational Costs / Expenses Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Operational Costs</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {formatFullCurrency(dynamicStats.totalExpenses)}
            </h3>
            <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1.5 truncate" title={`Fuel: ${formatCurrency(dynamicStats.fuelExpenses)} • Tolls: ${formatCurrency(dynamicStats.tollExpenses)}`}>
              {dynamicStats.fuelExpenses > 0 || dynamicStats.tollExpenses > 0
                ? `Fuel: ${formatCurrency(dynamicStats.fuelExpenses)} • Tolls: ${formatCurrency(dynamicStats.tollExpenses)}`
                : "Fuel, tolls & allowances"}
            </span>
          </div>
        </div>

        {/* Net Earnings Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Net Earnings</span>
            <div className="p-2 rounded-xl bg-[#FFF3E8] text-[#A14000]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {formatFullCurrency(dynamicStats.totalNetEarnings)}
            </h3>
            <span className="text-[11px] text-[#A14000] font-semibold flex items-center gap-1 mt-1.5 truncate">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              After operating deductions ({dynamicStats.marginPercent}%)
            </span>
          </div>
        </div>

        {/* Profit Margin Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Profit Margin</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {dynamicStats.marginPercent}%
            </h3>
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1.5 truncate">
              {dynamicStats.marginPercent >= 75
                ? "Optimal operational efficiency"
                : dynamicStats.marginPercent >= 50
                  ? "Healthy profitability index"
                  : "Net margin performance"}
            </span>
          </div>
        </div>
      </div>

      {/* Conditional Content based on activeTab */}
      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-6">
          {/* Monthly Trend Area Chart */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-poppins font-bold text-[#1E293B] text-base">Monthly Financial Trends</h3>
                <p className="text-xs text-[#64748B] mt-1">Comparison of gross revenues, operational expenses, and net profit margins.</p>
              </div>
            </div>

            <div className="h-[400px] w-full">
              {data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Poppins' }}
                      stroke="#E2E8F0"
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'Poppins' }}
                      stroke="#E2E8F0"
                      width={65}
                      tickFormatter={(val) => {
                        const num = Number(val) || 0;
                        if (num === 0) return "₹0k";
                        const isNegative = num < 0;
                        const absK = Math.round(Math.abs(num) / 1000);
                        return `${isNegative ? "-₹" : "₹"}${absK}k`;
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [formatFullCurrency(value), name || ""]}
                      contentStyle={{ fontFamily: 'Poppins', fontSize: 12, borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    />
                    <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 11, paddingTop: 10 }} />
                    <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" name="Expenses" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpenses)" />
                    <Area type="monotone" name="Net Profit" dataKey="netEarnings" stroke="#F59E0B" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#64748B] text-xs font-medium">
                  Not enough transaction history to draw trends. Check back after dispatching and completing trips!
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Listings Section */
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col">
          {/* Active Trip Expense Highlight Card */}
          {selectedTrip && selectedTripId !== "all" && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-red-50/70 via-orange-50/40 to-white border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100/70 text-red-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-poppins font-bold text-sm text-[#1E293B]">
                      {selectedTrip.tripNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                        selectedTrip.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : selectedTrip.status === "In Progress"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : selectedTrip.status === "Cancelled" || selectedTrip.status === "Rejected"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {selectedTrip.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedTrip.vehiclePlate} ({selectedTrip.vehicleName}) • {selectedTrip.driverName} • {selectedTrip.startLocation} &rarr; {selectedTrip.endLocation} ({selectedTrip.distance} km)
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-white/80 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-red-100">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 font-poppins block">
                    Trip Expenses
                  </span>
                  <span className="text-lg font-bold text-red-600 font-poppins pr-2">
                    {formatFullCurrency(selectedTrip.expenses)}
                  </span>
                </div>
                <div className="h-8 w-px bg-gray-200 hidden sm:block" />
                <div className="flex items-center gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Fuel</span>
                    <span className="font-semibold text-gray-700">
                      {formatFullCurrency(selectedTrip.fuelExpense || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Tolls</span>
                    <span className="font-semibold text-gray-700">
                      {formatFullCurrency(selectedTrip.tollExpense || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Allowance</span>
                    <span className="font-semibold text-gray-700">
                      {formatFullCurrency(selectedTrip.driverAllowance || 0)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedTripId("all");
                    setCurrentPage(1);
                  }}
                  className="text-xs text-[#A14000] hover:text-[#7d3200] font-semibold underline underline-offset-2 ml-2 cursor-pointer"
                >
                  View All Trips
                </button>
              </div>
            </div>
          )}

          {/* Table Toolbar / Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="flex flex-col w-full sm:w-[240px]">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={50}
                    placeholder="Search trips, drivers, routes..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={`w-full pl-10 pr-4 py-2 bg-gray-50 border rounded-xl text-xs font-medium focus:bg-white outline-none transition-all ${
                      searchError
                        ? "border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-gray-200 focus:ring-1 focus:ring-amber-500/50"
                    }`}
                  />
                </div>
                {searchError && (
                  <p className="text-xs text-red-500 mt-1 font-medium font-poppins">{searchError}</p>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="All">All Trip Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Trip Selection Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 font-poppins whitespace-nowrap">
                  Trip Selection:
                </span>
                <select
                  value={selectedTripId}
                  onChange={(e) => {
                    setSelectedTripId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white focus:border-[#A14000] outline-none transition-all cursor-pointer max-w-[240px] truncate"
                >
                  <option value="all">
                    All Trips ({data.tripEarnings.filter(t => !['rejected', 'cancelled', 'canceled'].includes(String(t.status || '').trim().toLowerCase())).length})
                  </option>
                  {data.tripEarnings.map((trip) => {
                    const isRej = ['rejected', 'cancelled', 'canceled'].includes(String(trip.status || '').trim().toLowerCase());
                    return (
                      <option key={trip.tripId} value={trip.tripId}>
                        {trip.tripNumber} ({isRej ? `${trip.status} - ₹0` : formatFullCurrency(trip.expenses)})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 text-xs font-bold font-poppins transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#A14000]" />
              Export CSV
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto scrollbar-hide border border-gray-100 rounded-xl">
            <table className="w-full text-left border-collapse text-xs font-nunito">
              <thead>
                <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                  <th
                    className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort("tripNumber")}
                  >
                    <div className="flex items-center gap-1">
                      Trip Details
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                  <th
                    className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort("vehicleName")}
                  >
                    Vehicle & Driver
                  </th>
                  <th className="py-4 px-5">Route</th>
                  <th className="py-4 px-5">Status</th>
                  <th
                    className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort("revenue")}
                  >
                    <div className="flex items-center gap-1 justify-end">
                      Revenue
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                  <th
                    className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort("expenses")}
                  >
                    <div className="flex items-center gap-1 justify-end text-red-600 font-bold">
                      Expenses
                      <ArrowUpDown className="w-3 h-3 text-red-300" />
                    </div>
                  </th>
                  <th
                    className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort("netEarnings")}
                  >
                    <div className="flex items-center gap-1 justify-end">
                      Net Profit
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0] font-medium text-[#475569]">
                {paginatedEarnings.length > 0 ? (
                  paginatedEarnings.map((item) => {
                    const isRowSelected = selectedTripId === item.tripId;
                    return (
                      <tr
                        key={item.tripId}
                        onClick={() => {
                          if (selectedTripId === item.tripId) {
                            setSelectedTripId("all");
                          } else {
                            setSelectedTripId(item.tripId);
                          }
                        }}
                        className={`transition-colors whitespace-nowrap cursor-pointer ${
                          isRowSelected
                            ? "bg-amber-50/60 ring-1 ring-[#A14000]/40"
                            : "hover:bg-gray-50/70"
                        }`}
                        title="Click to select this trip and view Expenses"
                      >
                        <td className="py-4 px-5">
                          <div className="font-bold text-[#1E293B] font-poppins flex items-center gap-1.5">
                            {item.tripNumber}
                            {isRowSelected && (
                              <span className="inline-block w-2 h-2 rounded-full bg-[#A14000]" />
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(item.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div>
                            {item.vehiclePlate} ({item.vehicleName})
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.driverName}</div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="font-semibold">
                            {item.startLocation} &rarr; {item.endLocation}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{item.distance} km</div>
                        </td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                              item.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : item.status === "In Progress"
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : item.status === "Cancelled" || item.status === "Rejected"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right font-bold text-emerald-600 font-poppins">
                          {/reject|cancel/i.test(String(item.status || ''))
                            ? "₹0"
                            : formatFullCurrency(item.revenue)}
                        </td>
                        <td className="py-4 px-5 text-right font-bold text-red-600 font-poppins text-sm pr-8 whitespace-nowrap">
                          {/reject|cancel/i.test(String(item.status || ''))
                            ? "₹0"
                            : formatFullCurrency(item.expenses)}
                        </td>
                        <td className="py-4 px-5 text-right font-bold text-[#1E293B] font-poppins">
                          {/reject|cancel/i.test(String(item.status || ''))
                            ? "₹0"
                            : formatFullCurrency(item.netEarnings)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-400 font-semibold"
                    >
                      No earnings or expenses history found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6 select-none">
              <span className="text-xs text-gray-400 font-semibold">
                Showing {Math.min(filteredEarnings.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
                {Math.min(filteredEarnings.length, currentPage * itemsPerPage)} of {filteredEarnings.length} records
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-[#A14000] text-white"
                        : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
