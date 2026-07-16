import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import { managerApi } from "../api/managerApi";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/context/AuthContext";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [dbStats, setDbStats] = useState(null);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  const getDaysRemaining = () => {
    if (user?.subscriptionStatus !== "ACTIVE" || !user?.subscriptionExpiry) return "--";
    const expiry = new Date(user.subscriptionExpiry);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatTotalEarnings = (val) => {
    if (val === null || val === undefined) return "₹0";

    // If already pre-formatted containing units
    if (typeof val === 'string' && (val.includes('L') || val.includes('Cr') || val.includes('cr') || val.includes('l'))) {
      let cleanVal = val.trim();
      const match = cleanVal.match(/(\d+\.\d)(\d+)\s*(L|Cr|cr|l)/);
      if (match) {
        cleanVal = cleanVal.replace(/(\d+\.\d)\d+(\s*(L|Cr|cr|l))/, '$1 $3');
      }
      return cleanVal;
    }

    let num = 0;
    if (typeof val === 'number') {
      num = val;
    } else {
      const clean = val.toString().replace(/[^\d.]/g, '');
      num = parseFloat(clean);
      if (isNaN(num)) num = 0;
    }

    if (num >= 10000000) {
      const formatted = (num / 10000000).toFixed(1);
      const clean = parseFloat(formatted);
      return `₹${clean} Cr`;
    }
    if (num >= 100000) {
      const formatted = (num / 100000).toFixed(1);
      const clean = parseFloat(formatted);
      return `₹${clean} L`;
    }
    if (num >= 1000) {
      const formatted = (num / 1000).toFixed(1);
      const clean = parseFloat(formatted);
      return `₹${clean} K`;
    }
    return `₹${num}`;
  };

  const normaliseVehicle = (v) => ({
    ...v,
    id:           v._id,
    name:         v.vehicleName || `${v.brand} ${v.model}`,
    plateNumber:  v.vehicleNumber || "",
    driver:       v.assignedDriver && typeof v.assignedDriver === 'object'
      ? v.assignedDriver.fullName
      : (typeof v.assignedDriver === 'string' ? v.assignedDriver : 'Unassigned'),
    branch:       v.branch       || 'Pune',
    status:       v.currentStatus || 'Available',
  });

  useEffect(() => {
    const fetchAllData = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        const [dashRes, vehRes, fuelRes, maintRes, actRes] = await Promise.all([
          managerApi.getDashboard(),
          managerApi.getVehicles(),
          managerApi.getFuelRecords(),
          managerApi.getMaintenance(),
          managerApi.getActivities()
        ]);
        
        const rawVeh = vehRes.data?.data || vehRes.data || [];
        setVehicles(rawVeh.map(normaliseVehicle));
        
        const rawDash = dashRes.data?.data || dashRes.data || {};
        setDbStats(rawDash);

        setFuelRecords(fuelRes.data?.data || fuelRes.data || []);
        setMaintenance(maintRes.data?.data || maintRes.data || []);
        setActivities(actRes.data?.data || actRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        if (isInitial) setLoading(false);
      }
    };
    fetchAllData(true);

    const intervalId = setInterval(() => {
      fetchAllData(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);



  const dashboardStats = [
    {
      label: "Total Vehicles",
      value: dbStats?.totalVehicles ?? 0,
      icon: "material-symbols:local-shipping-outline",
      color: "bg-white",
    },
    {
      label: "Active",
      value: dbStats?.activeVehicles ?? 0,
      icon: "material-symbols:bolt-outline",
      color: "bg-white",
    },
    {
      label: "Trips Today",
      value: dbStats?.tripsToday ?? 0,
      icon: "material-symbols:route-outline",
      color: "bg-white",
    },
    {
      label: "Under Repair",
      value: dbStats?.underRepair ?? 0,
      icon: "material-symbols:build-outline",
      color: "bg-white",
    },
    {
      label: "Drivers Available",
      value: dbStats?.driversAvailable ?? 0,
      icon: "material-symbols:person-outline",
      color: "bg-white",
    },
    {
      label: "Total Earnings",
      value: formatTotalEarnings(dbStats?.totalEarnings),
      icon: "material-symbols:payments-outline",
      color: "bg-black",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#B45A0A] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 overflow-x-hidden">
      <Breadcrumb />

      {/* Subscription Warnings */}
      {user?.subscriptionStatus === 'INACTIVE' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Icon icon="material-symbols:warning-outline" className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-amber-900 font-poppins">Subscription Status: INACTIVE (View-Only Mode)</p>
              <p className="text-[11px] text-amber-700 font-medium font-poppins mt-0.5">Your subscription is currently inactive. You have view-only access. Please choose a subscription plan to unlock all platform features.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/manager/subscription")}
            className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Choose Plan
          </button>
        </div>
      )}

      {user?.subscriptionStatus === 'EXPIRED' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-red-100 text-red-800 shrink-0">
              <Icon icon="material-symbols:gpp-bad-outline" className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-red-900 font-poppins">Subscription Status: EXPIRED (View-Only Mode)</p>
              <p className="text-[11px] text-red-700 font-medium font-poppins mt-0.5">Your subscription has expired. Please renew your subscription.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/manager/subscription")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Renew Plan
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Dashboard</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Overview of your fleet operations, active status, compliance and costs.</p>
        </div>
      </div>

      {/* Stats Grid Container - Single Row Without Scroll */}
      <div
        className="mb-8"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'visible'
        }}
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-[12px] w-full box-border"
        >
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
                boxSizing: 'border-box'
              }}
            >
              {/* Card Title at Top-Left */}
              <p
                className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis font-poppins ${stat.color === "bg-black"
                    ? "text-gray-400"
                    : "text-gray-600"
                  }`}
                style={{ marginBottom: '10px' }}
              >
                {stat.label}
              </p>

                {/* Value with Icon */}
                <div className="flex items-end justify-between" style={{ marginTop: 'auto', gap: '8px' }}>
                  <span
                    className={`font-black font-poppins flex-1 ${stat.color === "bg-black" ? "text-white" : "text-gray-900"}`}
                    style={{ 
                      fontSize: stat.value.toString().length > 8 
                        ? '14px' 
                        : stat.value.toString().length > 6 
                          ? '17px' 
                          : '20px', 
                      lineHeight: '1', 
                      minWidth: '0' 
                    }}
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

      </div>



      {/* Bottom Section */}
      <div className="space-y-6">
        {/* Row 1: 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Status */}
          {(() => {
            const totalVehiclesCount = vehicles.length;
            const activeCount = vehicles.filter(v => v.status === "Active").length;
            const availableCount = vehicles.filter(v => v.status === "Available").length;
            const inServiceCount = vehicles.filter(v => v.status === "On Trip" || v.status === "Assigned").length;
            const maintenanceCount = vehicles.filter(v => v.status === "Maintenance").length;
            const outOfServiceCount = vehicles.filter(v => v.status === "Inactive" || v.status === "Idle").length;

            const chartData = [
              { name: "Active", value: activeCount, color: "#C65D0E" },
              { name: "Available", value: availableCount, color: "#10B981" },
              { name: "In Service", value: inServiceCount, color: "#3B82F6" },
              { name: "Under Maintenance", value: maintenanceCount, color: "#EF4444" },
              { name: "Out of Service", value: outOfServiceCount, color: "#6B7280" }
            ];

            return (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 flex flex-col h-[380px]">
                <div className="flex items-center gap-2 mb-4 shrink-0">
                  <svg className="w-5 h-5 text-[#C65D0E]" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                  </svg>
                  <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Vehicle Status</h3>
                </div>

                <div className="flex-1 min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => {
                          const pct = totalVehiclesCount > 0 ? ((value / totalVehiclesCount) * 100).toFixed(1) : 0;
                          return [`${value} (${pct}%)`, name];
                        }}
                        contentStyle={{
                          fontFamily: 'Poppins',
                          fontSize: '12px',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-10px' }}>
                    <span className="text-3xl font-black text-[#1B2430] font-poppins">{totalVehiclesCount}</span>
                    <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Vehicles</span>
                  </div>
                </div>

                {/* Legend Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 shrink-0">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-poppins text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="truncate">{item.name}</span>
                      <span className="font-bold ml-auto text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Maintenance Alerts */}
          {(() => {
            const getPriorityBadge = (type) => {
              const lowerType = (type || "").toLowerCase();
              if (lowerType.includes("engine") || lowerType.includes("brake") || lowerType.includes("transmission") || lowerType.includes("gearbox") || lowerType.includes("clutch")) {
                return { label: "High", className: "bg-red-50 text-red-700 border-red-100" };
              }
              if (lowerType.includes("oil") || lowerType.includes("tyre") || lowerType.includes("tire") || lowerType.includes("battery") || lowerType.includes("coolant") || lowerType.includes("filter")) {
                return { label: "Medium", className: "bg-amber-50 text-amber-700 border-amber-100" };
              }
              return { label: "Low", className: "bg-green-50 text-green-700 border-green-100" };
            };

            const alerts = maintenance
              .filter(m => m.status !== "Completed")
              .map(m => {
                const due = new Date(m.scheduledDate);
                const now = new Date();
                due.setHours(0,0,0,0);
                now.setHours(0,0,0,0);
                const isOverdue = due < now;
                const badge = getPriorityBadge(m.serviceType);
                
                return {
                  id: m._id || m.id,
                  vehicle: m.vehicleName || m.vehicleId || "Unassigned",
                  type: m.serviceType,
                  dueDate: m.scheduledDate,
                  isOverdue,
                  badge
                };
              })
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            const displayedAlerts = alerts.slice(0, 5);

            return (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col h-[380px]">
                <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB] shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon icon="material-symbols:warning-outline" className="w-5 h-5 text-[#C65D0E]" />
                    <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Maintenance Alerts</h3>
                  </div>
                  <button
                    onClick={() => navigate("/manager/maintenance")}
                    className="text-[#C65D0E] text-xs font-bold hover:underline font-poppins cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {displayedAlerts.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-300 hover:shadow-sm ${
                        alert.isOverdue 
                          ? "bg-red-50/40 border-red-100 hover:border-red-200" 
                          : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-poppins font-bold text-gray-900 text-xs truncate">
                            {alert.vehicle}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide border ${alert.badge.className}`}>
                            {alert.badge.label}
                          </span>
                          {alert.isOverdue && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-600 text-white shadow-sm">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium font-poppins mt-1 truncate">
                          {alert.type}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-poppins font-bold ${alert.isOverdue ? "text-red-600" : "text-gray-600"}`}>
                          {new Date(alert.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {displayedAlerts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <Icon icon="material-symbols:check-circle-outline" className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-xs font-semibold text-gray-500 font-poppins">No pending maintenance alerts.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Recent Activities */}
          {(() => {
            const getActivityIcon = (type) => {
              switch (type) {
                case "VEHICLE_ADDED":
                  return { icon: "material-symbols:local-shipping-outline", bg: "bg-green-50 text-green-600 border-green-100" };
                case "VEHICLE_UPDATED":
                  return { icon: "material-symbols:edit-note-outline", bg: "bg-blue-50 text-blue-600 border-blue-100" };
                case "VEHICLE_DELETED":
                  return { icon: "material-symbols:delete-outline", bg: "bg-red-50 text-red-600 border-red-100" };
                case "DRIVER_ASSIGNED":
                  return { icon: "material-symbols:person-outline", bg: "bg-purple-50 text-purple-600 border-purple-100" };
                case "MAINTENANCE_COMPLETED":
                  return { icon: "material-symbols:build-circle-outline", bg: "bg-amber-50 text-amber-600 border-amber-100" };
                case "FUEL_ENTRY_ADDED":
                  return { icon: "material-symbols:local-gas-station-outline", bg: "bg-orange-50 text-orange-600 border-orange-100" };
                case "DOCUMENT_UPLOADED":
                  return { icon: "material-symbols:upload-file-outline", bg: "bg-teal-50 text-teal-600 border-teal-100" };
                case "TRIP_DISPATCHED":
                  return { icon: "material-symbols:route-outline", bg: "bg-blue-50 text-blue-600 border-blue-100" };
                case "TRIP_COMPLETED":
                  return { icon: "material-symbols:check-circle-outline", bg: "bg-emerald-50 text-emerald-600 border-emerald-100" };
                default:
                  return { icon: "material-symbols:info-outline", bg: "bg-gray-50 text-gray-600 border-gray-100" };
              }
            };

            const getRelativeTime = (dateStr) => {
              const date = new Date(dateStr);
              const now = new Date();
              const diffMs = now - date;
              const diffMins = Math.floor(diffMs / 60000);
              if (diffMins < 1) return "Just now";
              if (diffMins < 60) return `${diffMins}m ago`;
              const diffHours = Math.floor(diffMins / 60);
              if (diffHours < 24) return `${diffHours}h ago`;
              const diffDays = Math.floor(diffHours / 24);
              if (diffDays === 1) return "Yesterday";
              return `${diffDays}d ago`;
            };

            return (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col h-[380px]">
                <div className="p-5 flex items-center border-b border-[#E5E7EB] shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon icon="material-symbols:history" className="w-5 h-5 text-[#C65D0E]" />
                    <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Recent Activities</h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  {activities.map((act) => {
                    const iconStyle = getActivityIcon(act.activityType);
                    return (
                      <div key={act._id} className="flex gap-3 items-start">
                        <div className={`p-2 rounded-xl border shrink-0 flex items-center justify-center ${iconStyle.bg}`}>
                          <Icon icon={iconStyle.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-poppins font-bold text-gray-900 text-xs truncate">
                              {act.title}
                            </span>
                            <span className="text-[9px] font-poppins text-gray-400 font-semibold shrink-0">
                              {getRelativeTime(act.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium font-poppins mt-0.5 leading-relaxed">
                            {act.description}
                          </p>
                          <span className="text-[9px] font-bold text-[#C65D0E] font-poppins block mt-1">
                            by {act.user}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {activities.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <Icon icon="material-symbols:history" className="w-12 h-12 text-gray-300 mb-2" />
                      <p className="text-xs font-semibold text-gray-500 font-poppins">No recent activities found.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Row 2: 2 Column Layout (Upcoming Renewals & Subscription Information) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Renewals */}
          {(() => {
            const renewals = [];
            vehicles.forEach(v => {
              const checkExpiry = (dateVal, typeLabel) => {
                if (!dateVal) return;
                const exp = new Date(dateVal);
                const now = new Date();
                exp.setHours(0,0,0,0);
                now.setHours(0,0,0,0);
                const diffTime = exp.getTime() - now.getTime();
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                renewals.push({
                  vehicleNumber: v.plateNumber || v.vehicleNumber,
                  type: typeLabel,
                  expiryDate: dateVal,
                  daysRemaining: days
                });
              };

              checkExpiry(v.insuranceExpiry, "Insurance");
              checkExpiry(v.rcExpiry, "Registration");
              checkExpiry(v.pollutionExpiry, "PUC");
              checkExpiry(v.fitnessExpiry, "Fitness Certificate");
              checkExpiry(v.permitExpiry, "Permit");
            });

            renewals.sort((a, b) => a.daysRemaining - b.daysRemaining);

            const displayedRenewals = renewals.slice(0, 5);

            const getStatusBadge = (days) => {
              if (days < 7) {
                return { label: days < 0 ? "Expired" : `${days}d left`, className: "bg-red-500 text-white" };
              }
              if (days <= 30) {
                return { label: `${days}d left`, className: "bg-amber-500 text-white" };
              }
              return { label: `${days}d left`, className: "bg-green-600 text-white" };
            };

            return (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col h-[380px]">
                <div className="p-5 flex items-center justify-between border-b border-[#E5E7EB] shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon icon="material-symbols:event-repeat" className="w-5 h-5 text-[#C65D0E]" />
                    <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Upcoming Renewals</h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {displayedRenewals.map((renewal, idx) => {
                    const badge = getStatusBadge(renewal.daysRemaining);
                    return (
                      <div key={idx} className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl flex items-center justify-between transition-all duration-300 hover:border-gray-200 hover:shadow-sm">
                        <div className="min-w-0">
                          <span className="font-poppins font-bold text-gray-900 text-xs block truncate">
                            {renewal.vehicleNumber}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider font-poppins">
                            {renewal.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] text-gray-600 font-medium font-poppins">
                            {new Date(renewal.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold font-poppins shadow-sm min-w-[65px] text-center ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {displayedRenewals.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-12">
                      <Icon icon="material-symbols:check-circle-outline" className="w-12 h-12 text-green-500 mb-2" />
                      <p className="text-xs font-semibold text-gray-500 font-poppins">No upcoming renewals.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Subscription Information Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col h-[380px] justify-between p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Icon icon="material-symbols:credit-card-outline" className="w-5 h-5 text-[#C65D0E]" />
                <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Subscription Information</h3>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider font-poppins">Current Plan</span>
                  <span className="text-xs font-black text-gray-900 font-poppins">
                    {user?.subscriptionPlan && typeof user.subscriptionPlan === 'object' 
                      ? user.subscriptionPlan.name 
                      : (user?.subscriptionPlan ? "Active Plan" : "None")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider font-poppins">Status</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold font-poppins uppercase tracking-wider ${
                    user?.subscriptionStatus === 'ACTIVE' 
                      ? 'bg-green-100 text-green-700' 
                      : user?.subscriptionStatus === 'EXPIRED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user?.subscriptionStatus || "Inactive"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider font-poppins">Expiry Date</span>
                  <span className="text-xs font-bold text-gray-700 font-poppins">
                    {user?.subscriptionExpiry 
                      ? new Date(user.subscriptionExpiry).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })
                      : "--"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider font-poppins">Days Remaining</span>
                  <span className="text-xs font-extrabold text-gray-800 font-poppins">
                    {getDaysRemaining()}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/manager/subscription")}
              className="w-full py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer text-center"
            >
              {user?.subscriptionStatus === "ACTIVE" ? "Manage Subscription" : "Choose Plan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
