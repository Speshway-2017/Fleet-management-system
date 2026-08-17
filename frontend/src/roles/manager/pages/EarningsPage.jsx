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
  Percent
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
import toast from "react-hot-toast";

export default function EarningsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview or details
  const [data, setData] = useState({
    stats: { totalRevenue: 0, totalExpenses: 0, totalNetEarnings: 0, tripCount: 0 },
    chartData: [],
    tripEarnings: []
  });

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const { data: resData } = await axiosClient.get("/manager/earnings");
      if (resData.success) {
        setData(resData.data);
      } else {
        toast.error("Failed to load earnings data");
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      toast.error("Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter logic
  const filteredEarnings = useMemo(() => {
    return data.tripEarnings
      .filter((item) => {
        const matchesSearch = 
          item.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.endLocation.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
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
  }, [data.tripEarnings, searchTerm, statusFilter, sortField, sortDirection]);

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

    const rows = filteredEarnings.map(item => [
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
      [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fleet_earnings_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Export downloaded successfully");
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const dynamicStats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalNetEarnings = 0;

    filteredEarnings.forEach(item => {
      totalRevenue += item.revenue;
      totalExpenses += item.expenses;
      totalNetEarnings += item.netEarnings;
    });

    const marginPercent = totalRevenue > 0
      ? Math.round((totalNetEarnings / totalRevenue) * 100)
      : 0;

    return {
      totalRevenue,
      totalExpenses,
      totalNetEarnings,
      marginPercent
    };
  }, [filteredEarnings]);



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
        {/* Revenue Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {formatCurrency(dynamicStats.totalRevenue)}
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Gross earnings
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Operational Costs</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {formatCurrency(dynamicStats.totalExpenses)}
            </h3>
            <span className="text-[11px] text-red-500 font-semibold flex items-center gap-1 mt-1.5">
              Fuel, tolls & allowances
            </span>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-5 hover:-translate-y-0.5 transition-transform duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Net Earnings</span>
            <div className="p-2 rounded-xl bg-[#FFF3E8] text-[#A14000]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold font-poppins text-[#1E293B]">
              {formatCurrency(dynamicStats.totalNetEarnings)}
            </h3>
            <span className="text-[11px] text-[#A14000] font-semibold flex items-center gap-1 mt-1.5">
              After operating deductions
            </span>
          </div>
        </div>

        {/* ROI / Margin Card */}
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
            <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-1.5">
              Efficiency index
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
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01}/>
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
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), ""]}
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
        /* Detailed Listings Tab */
        <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 flex flex-col">
          {/* Table Toolbar / Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trips, drivers, routes..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full sm:w-[260px] pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value="All">All Trip Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Cancelled">Cancelled</option>
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
                  <th className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort("tripNumber")}>
                    <div className="flex items-center gap-1">
                      Trip Details
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                  <th className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort("vehicleName")}>
                    Vehicle & Driver
                  </th>
                  <th className="py-4 px-5">Route</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort("revenue")}>
                    <div className="flex items-center gap-1 justify-end">
                      Revenue
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                  <th className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort("expenses")}>
                    <div className="flex items-center gap-1 justify-end">
                      Expenses
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                  <th className="py-4 px-5 cursor-pointer hover:bg-gray-100/50 transition-colors" onClick={() => handleSort("netEarnings")}>
                    <div className="flex items-center gap-1 justify-end">
                      Net Profit
                      <ArrowUpDown className="w-3 h-3 text-[#CBD5E1]" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EAF0] font-medium text-[#475569]">
                {paginatedEarnings.length > 0 ? (
                  paginatedEarnings.map((item) => (
                    <tr key={item.tripId} className="hover:bg-gray-50/50 transition-colors whitespace-nowrap">
                      <td className="py-4 px-5">
                        <div className="font-bold text-[#1E293B] font-poppins">{item.tripNumber}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(item.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div>{item.vehiclePlate} ({item.vehicleName})</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.driverName}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold">{item.startLocation} &rarr; {item.endLocation}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.distance} km</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase border ${
                          item.status === 'Completed' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : item.status === 'In Progress' 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : item.status === 'Cancelled' 
                            ? 'bg-red-50 text-red-700 border-red-100' 
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-emerald-600 font-poppins">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-red-500 font-poppins">
                        {formatCurrency(item.expenses)}
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-[#1E293B] font-poppins">
                        {formatCurrency(item.netEarnings)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 font-semibold">
                      No earnings history found matching the filters.
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
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
