import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

export default function ReportsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // View tabs: "live" (Interactive Report Cockpit) or "schedules" (Delivery Schedules CRUD)
  const [activeTab, setActiveTab] = useState("live");

  // Filter States
  const [selectedReport, setSelectedReport] = useState("Utilization"); // Utilization, Performance, Fuel, Maintenance, Trips, Expenses
  const [dateRange, setDateRange] = useState("This Month"); // Today, This Week, This Month, This Year, Custom Date Range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("All");
  const [selectedDriverId, setSelectedDriverId] = useState("All");
  const [selectedBranch, setSelectedBranch] = useState("All");

  // Create Schedule Form State
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    type: "Operational",
    frequency: "Weekly",
    day: "Monday",
    time: "09:00",
    format: "PDF",
    recipients: ""
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, tRes, fRes, mRes, sRes] = await Promise.all([
        managerApi.getVehicles(),
        managerApi.getDrivers(),
        managerApi.getTrips(),
        managerApi.getFuelRecords(),
        managerApi.getMaintenance(),
        managerApi.getReports()
      ]);
      
      setVehicles(vRes.data?.data || vRes.data || []);
      setDrivers(dRes.data?.data || dRes.data || []);
      setTrips(tRes.data?.data || tRes.data || []);
      setFuelRecords(fRes.data?.data || fRes.data || []);
      setMaintenance(mRes.data?.data || mRes.data || []);
      
      const sResult = sRes.data?.data || sRes.data || [];
      if (Array.isArray(sResult)) {
        setSchedules(sResult.map(s => ({
          id: s._id,
          name: s.name,
          type: s.type || "Operational",
          frequency: s.frequency || "Weekly",
          day: s.day || "Monday",
          time: s.time || "09:00",
          format: s.format || "PDF",
          recipients: s.recipients || "",
          active: s.status === "Active"
        })));
      }
    } catch (err) {
      console.error("Failed to load reporting data", err);
      toast.error("Failed to load records from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Helper: Date filter
  const isWithinDate = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dateRange === "Today") {
      return date >= today;
    }
    if (dateRange === "This Week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      return date >= start;
    }
    if (dateRange === "This Month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return date >= start;
    }
    if (dateRange === "This Year") {
      const start = new Date(today.getFullYear(), 0, 1);
      return date >= start;
    }
    if (dateRange === "Custom Date Range") {
      if (!startDate) return true;
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      return date >= start && date <= end;
    }
    return true; // All Time fallback
  };

  // Days count for utilization
  const getDaysInRange = () => {
    if (dateRange === "Today") return 1;
    if (dateRange === "This Week") return 7;
    if (dateRange === "This Month") return 30;
    if (dateRange === "This Year") return 365;
    if (dateRange === "Custom Date Range") {
      if (!startDate) return 30;
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    }
    return 30;
  };

  // Helper: Filter matches
  const matchVehicle = (vId) => {
    if (selectedVehicleId === "All") return true;
    return String(vId) === String(selectedVehicleId);
  };

  const matchDriver = (dId) => {
    if (selectedDriverId === "All") return true;
    return String(dId) === String(selectedDriverId);
  };

  const matchBranch = (branchName) => {
    if (selectedBranch === "All") return true;
    return String(branchName || '').toLowerCase().trim() === String(selectedBranch).toLowerCase().trim();
  };

  // ==========================================
  // 1. VEHICLE UTILIZATION REPORT
  // ==========================================
  const getVehicleUtilizationData = () => {
    const totalDays = getDaysInRange();
    const rows = vehicles
      .filter(v => matchVehicle(v._id) && matchBranch(v.branch || v.branchDepot))
      .map(v => {
        const vTrips = trips.filter(t => {
          const vId = t.vehicle?._id || t.vehicle;
          const dId = t.driver?._id || t.driver;
          return String(vId) === String(v._id) && isWithinDate(t.actualStartTime || t.createdAt) && matchDriver(dId);
        });

        const totalTripsCount = vTrips.length;
        const totalDistance = vTrips.reduce((sum, t) => sum + (Number(t.actualDistance || t.estimatedDistance) || 0), 0);
        const runningHours = totalTripsCount * 3.5; // estimated 3.5 hours per trip
        const daysActive = Math.min(totalDays, Math.max(totalTripsCount > 0 ? 1 : 0, Math.round(totalTripsCount * 1.2)));
        const daysIdle = Math.max(0, totalDays - daysActive);
        const utilization = Math.min(100, Math.round((daysActive / totalDays) * 100));

        return {
          id: v._id,
          name: v.vehicleName || `${v.brand} ${v.model}`,
          plateNumber: v.vehicleNumber,
          type: v.vehicleType || "Truck",
          tripsCount: totalTripsCount,
          distance: totalDistance,
          runningHours,
          daysActive,
          daysIdle,
          utilization,
          status: v.currentStatus || "Available"
        };
      });

    // Summary Cards
    const totalVehiclesCount = rows.length;
    const activeVehicles = rows.filter(r => ["On Trip", "Assigned", "Available"].includes(r.status)).length;
    const idleVehicles = Math.max(0, totalVehiclesCount - activeVehicles);
    const avgUtilization = totalVehiclesCount > 0 
      ? Math.round(rows.reduce((sum, r) => sum + r.utilization, 0) / totalVehiclesCount)
      : 0;

    return {
      rows,
      summary: [
        { label: "Total Vehicles", value: totalVehiclesCount, icon: "mdi:truck", color: "text-gray-700 bg-gray-100" },
        { label: "Active Vehicles", value: activeVehicles, icon: "mdi:truck-check", color: "text-green-600 bg-green-50" },
        { label: "Idle Vehicles", value: idleVehicles, icon: "mdi:truck-alert", color: "text-gray-500 bg-gray-100" },
        { label: "Avg utilization", value: `${avgUtilization}%`, icon: "mdi:speedometer", color: "text-amber-700 bg-orange-50" }
      ],
      charts: {
        utilization: rows.slice(0, 5),
        status: {
          Available: rows.filter(r => r.status === "Available").length,
          "On Trip": rows.filter(r => r.status === "On Trip").length,
          Maintenance: rows.filter(r => ["Under Maintenance", "Maintenance"].includes(r.status)).length,
          Idle: rows.filter(r => ["Idle", "Out of Service", "Inactive"].includes(r.status)).length
        }
      }
    };
  };

  // ==========================================
  // 2. DRIVER PERFORMANCE REPORT
  // ==========================================
  const getDriverPerformanceData = () => {
    const rows = drivers
      .filter(d => matchDriver(d._id) && matchBranch(d.branch))
      .map(d => {
        const dTrips = trips.filter(t => {
          const dId = t.driver?._id || t.driver;
          const vId = t.vehicle?._id || t.vehicle;
          return String(dId) === String(d._id) && isWithinDate(t.actualStartTime || t.createdAt) && matchVehicle(vId);
        });

        const totalTripsCount = dTrips.length;
        const totalDistance = dTrips.reduce((sum, t) => sum + (Number(t.actualDistance || t.estimatedDistance) || 0), 0);
        const onTimeTrips = Math.round(totalTripsCount * 0.95); // 95% on-time estimate
        
        // Find assigned vehicle
        const vehicleDoc = vehicles.find(v => String(v._id) === String(d.assignedVehicle));
        const assignedVehName = vehicleDoc ? `${vehicleDoc.brand} ${vehicleDoc.model} (${vehicleDoc.vehicleNumber})` : d.assignedVehicle || "Unassigned";

        return {
          id: d._id,
          name: d.fullName,
          employeeId: d.employeeId || "N/A",
          assignedVehicle: assignedVehName,
          tripsCount: totalTripsCount,
          distance: totalDistance,
          onTimeTrips,
          status: d.driverStatus || "AVAILABLE",
          score: d.performanceScore || 90
        };
      });

    const totalDriversCount = rows.length;
    const activeDrivers = rows.filter(r => ["ON_TRIP", "ASSIGNED"].includes(r.status)).length;
    const avgScore = totalDriversCount > 0
      ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / totalDriversCount)
      : 0;
    
    const topDriver = rows.length > 0 
      ? [...rows].sort((a,b) => b.score - a.score)[0]?.name 
      : "None";

    return {
      rows,
      summary: [
        { label: "Total Drivers", value: totalDriversCount, icon: "mdi:account-group", color: "text-gray-700 bg-gray-100" },
        { label: "Active Drivers", value: activeDrivers, icon: "mdi:account-check", color: "text-green-600 bg-green-50" },
        { label: "Avg Performance", value: `${avgScore}/100`, icon: "mdi:star", color: "text-amber-700 bg-orange-50" },
        { label: "Top Performer", value: topDriver, icon: "mdi:trophy", color: "text-blue-600 bg-blue-50" }
      ],
      charts: {
        performance: rows.slice(0, 5)
      }
    };
  };

  // ==========================================
  // 3. FUEL CONSUMPTION REPORT
  // ==========================================
  const getFuelConsumptionData = () => {
    const rows = fuelRecords
      .filter(f => {
        const vId = f.vehicle?._id || f.vehicle;
        const vehicleDoc = vehicles.find(v => String(v._id) === String(vId) || v.vehicleNumber === f.vehicleId);
        const branchMatch = vehicleDoc ? matchBranch(vehicleDoc.branch || vehicleDoc.branchDepot) : true;
        
        // Find driver
        const driverDoc = drivers.find(d => d.employeeId === f.driverId || d.fullName === f.driver);
        const dId = driverDoc ? driverDoc._id : null;
        
        return isWithinDate(f.createdAt) && matchVehicle(vId) && matchDriver(dId) && branchMatch;
      })
      .map(f => {
        const vId = f.vehicle?._id || f.vehicle;
        const vehicleDoc = vehicles.find(v => String(v._id) === String(vId) || v.vehicleNumber === f.vehicleId);
        const driverDoc = drivers.find(d => d.employeeId === f.driverId || d.fullName === f.driver);

        return {
          id: f._id,
          vehicleName: vehicleDoc ? `${vehicleDoc.brand} ${vehicleDoc.model}` : f.vehicleName || "Unknown Vehicle",
          plateNumber: vehicleDoc ? vehicleDoc.vehicleNumber : f.vehicleId || "N/A",
          driverName: driverDoc ? driverDoc.fullName : f.driver || "N/A",
          quantity: Number(f.liters) || 0,
          cost: Number(f.amount) || 0,
          fuelStation: f.fuelStation || "N/A",
          date: f.createdAt ? f.createdAt.split("T")[0] : "N/A",
          tripId: f.tripId || "N/A"
        };
      });

    const totalFuel = rows.reduce((sum, r) => sum + r.quantity, 0);
    const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);

    return {
      rows,
      summary: [
        { label: "Total Fuel Consumed", value: `${totalFuel.toLocaleString()} L`, icon: "mdi:gas-station", color: "text-amber-700 bg-orange-50" },
        { label: "Total Fuel Cost", value: `₹${totalCost.toLocaleString("en-IN")}`, icon: "mdi:currency-inr", color: "text-emerald-600 bg-green-50" }
      ],
      charts: {
        trend: rows.slice(-6)
      }
    };
  };

  // ==========================================
  // 4. MAINTENANCE COST REPORT
  // ==========================================
  const getMaintenanceCostData = () => {
    const rows = maintenance
      .filter(m => {
        const vId = m.vehicle?._id || m.vehicle;
        const vehicleDoc = vehicles.find(v => String(v._id) === String(vId) || v.vehicleNumber === m.vehicleId);
        const branchMatch = vehicleDoc ? matchBranch(vehicleDoc.branch || vehicleDoc.branchDepot) : true;
        return isWithinDate(m.scheduledDate || m.createdAt) && matchVehicle(vId) && branchMatch;
      })
      .map(m => {
        const vId = m.vehicle?._id || m.vehicle;
        const vehicleDoc = vehicles.find(v => String(v._id) === String(vId) || v.vehicleNumber === m.vehicleId);

        // Extract numeric value from cost string (e.g. "₹6,500.00" -> 6500)
        const costVal = parseFloat(String(m.cost || 0).replace(/[^\d.]/g, "")) || 0;

        return {
          id: m._id,
          vehicleName: vehicleDoc ? `${vehicleDoc.brand} ${vehicleDoc.model}` : m.vehicleName || "Unknown Vehicle",
          plateNumber: vehicleDoc ? vehicleDoc.vehicleNumber : m.vehicleId || "N/A",
          serviceDate: m.scheduledDate || (m.createdAt ? m.createdAt.split("T")[0] : "N/A"),
          type: m.serviceType || "Routine",
          serviceCenter: m.garage || "N/A",
          cost: costVal,
          status: m.status || "Scheduled",
          nextServiceDue: vehicleDoc?.nextServiceDue ? new Date(vehicleDoc.nextServiceDue).toISOString().split("T")[0] : "N/A"
        };
      });

    const totalMaintCost = rows.reduce((sum, r) => sum + r.cost, 0);
    const vehiclesUnderMaint = rows.filter(r => r.status === "In Progress" || r.status === "Under Maintenance").length;
    const avgCost = rows.length > 0 ? Math.round(totalMaintCost / rows.length) : 0;
    const upcomingServices = rows.filter(r => r.status === "Scheduled").length;

    return {
      rows,
      summary: [
        { label: "Total Maint. Cost", value: `₹${totalMaintCost.toLocaleString("en-IN")}`, icon: "mdi:wrench-clock", color: "text-red-600 bg-red-50" },
        { label: "Under Maintenance", value: vehiclesUnderMaint, icon: "mdi:cog-outline", color: "text-amber-700 bg-orange-50" },
        { label: "Upcoming Services", value: upcomingServices, icon: "mdi:calendar-clock", color: "text-emerald-600 bg-green-50" }
      ],
      charts: {
        costByVehicle: rows.slice(0, 5)
      }
    };
  };

  // ==========================================
  // 5. TRIP SUMMARY REPORT
  // ==========================================
  const getTripSummaryData = () => {
    const rows = trips
      .filter(t => {
        const vId = t.vehicle?._id || t.vehicle;
        const dId = t.driver?._id || t.driver;
        const vehicleDoc = vehicles.find(v => String(v._id) === String(vId) || v.vehicleNumber === t.vehiclePlate);
        const branchMatch = vehicleDoc ? matchBranch(vehicleDoc.branch || vehicleDoc.branchDepot) : true;
        return isWithinDate(t.actualStartTime || t.createdAt) && matchVehicle(vId) && matchDriver(dId) && branchMatch;
      })
      .map(t => {
        const vId = t.vehicle?._id || t.vehicle;
        const dId = t.driver?._id || t.driver;
        const vehicleDoc = vehicles.find(v => String(v._id) === String(vId) || v.vehicleNumber === t.vehiclePlate);
        const driverDoc = drivers.find(d => String(d._id) === String(dId));

        return {
          id: t._id,
          tripId: t.tripNumber || t._id.substring(18),
          pickup: t.startLocation || "N/A",
          destination: t.endLocation || "N/A",
          driverName: driverDoc ? driverDoc.fullName : t.driverName || "N/A",
          plateNumber: vehicleDoc ? vehicleDoc.vehicleNumber : t.vehiclePlate || "N/A",
          status: t.status || "Completed",
          departure: t.actualStartTime ? new Date(t.actualStartTime).toISOString().split("T")[0] : (t.createdAt ? t.createdAt.split("T")[0] : "N/A"),
          arrival: t.actualEndTime ? new Date(t.actualEndTime).toISOString().split("T")[0] : "N/A",
          distance: Number(t.actualDistance || t.estimatedDistance) || 0,
          duration: t.departureTime && t.eta ? `${t.departureTime} - ${t.eta}` : "N/A"
        };
      });

    const totalTrips = rows.length;
    const completedTrips = rows.filter(r => r.status === "Completed").length;
    const ongoingTrips = rows.filter(r => ["Ongoing", "Active", "In Progress"].includes(r.status)).length;
    const totalDistance = rows.reduce((sum, r) => sum + r.distance, 0);

    return {
      rows,
      summary: [
        { label: "Total Trips", value: totalTrips, icon: "mdi:map-marker-distance", color: "text-gray-700 bg-gray-100" },
        { label: "Completed Trips", value: completedTrips, icon: "mdi:check-circle-outline", color: "text-green-600 bg-green-50" },
        { label: "Ongoing Trips", value: ongoingTrips, icon: "mdi:clock-fast", color: "text-blue-600 bg-blue-50" },
        { label: "Total Distance", value: `${totalDistance.toLocaleString()} km`, icon: "mdi:navigation", color: "text-amber-700 bg-orange-50" }
      ],
      charts: {
        status: {
          Completed: completedTrips,
          Ongoing: ongoingTrips,
          Cancelled: rows.filter(r => r.status === "Cancelled").length
        }
      }
    };
  };

  // ==========================================
  // 6. EXPENSE ANALYSIS REPORT
  // ==========================================
  const getExpenseAnalysisData = () => {
    const filteredVehicles = vehicles.filter(v => matchVehicle(v._id) && matchBranch(v.branch || v.branchDepot));
    
    let fuelExpenseTotal = 0;
    let maintExpenseTotal = 0;
    let tollExpenseTotal = 0;
    let permitExpenseTotal = 0;
    let miscExpenseTotal = 0;

    const rows = filteredVehicles.map(v => {
      // Fuel cost matching vehicle + date range
      const vFuel = fuelRecords.filter(f => {
        const vId = f.vehicle?._id || f.vehicle;
        return (String(vId) === String(v._id) || f.vehicleId === v.vehicleNumber) && isWithinDate(f.createdAt);
      });
      const fuelCost = vFuel.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

      // Maintenance cost matching vehicle + date range
      const vMaint = maintenance.filter(m => {
        const vId = m.vehicle?._id || m.vehicle;
        return (String(vId) === String(v._id) || m.vehicleId === v.vehicleNumber) && isWithinDate(m.scheduledDate || m.createdAt);
      });
      const maintCost = vMaint.reduce((sum, m) => sum + (parseFloat(String(m.cost || 0).replace(/[^\d.]/g, "")) || 0), 0);

      // Estimates for tolls/permits/misc
      const tollCost = vFuel.length * 350; // estimate 350 per fill trip
      const permitCost = vMaint.length > 0 ? 1200 : 0;
      const miscCost = fuelCost > 0 ? 400 : 0;

      const vehicleTotal = fuelCost + maintCost + tollCost + permitCost + miscCost;

      fuelExpenseTotal += fuelCost;
      maintExpenseTotal += maintCost;
      tollExpenseTotal += tollCost;
      permitExpenseTotal += permitCost;
      miscExpenseTotal += miscCost;

      return {
        id: v._id,
        name: v.vehicleName || `${v.brand} ${v.model}`,
        plateNumber: v.vehicleNumber,
        fuelCost,
        maintCost,
        tollCost,
        permitCost,
        miscCost,
        total: vehicleTotal
      };
    });

    const grandTotal = fuelExpenseTotal + maintExpenseTotal + tollExpenseTotal + permitExpenseTotal + miscExpenseTotal;

    return {
      rows,
      summary: [
        { label: "Total Expenses", value: `₹${grandTotal.toLocaleString("en-IN")}`, icon: "mdi:wallet", color: "text-red-600 bg-red-50" },
        { label: "Fuel Expenses", value: `₹${fuelExpenseTotal.toLocaleString("en-IN")}`, icon: "mdi:gas-station", color: "text-amber-700 bg-orange-50" },
        { label: "Maintenance", value: `₹${maintExpenseTotal.toLocaleString("en-IN")}`, icon: "mdi:wrench-clock", color: "text-blue-600 bg-blue-50" },
        { label: "Tolls & Permits", value: `₹${(tollExpenseTotal + permitExpenseTotal).toLocaleString("en-IN")}`, icon: "mdi:road-variant", color: "text-emerald-600 bg-green-50" }
      ],
      charts: {
        expenses: {
          Fuel: fuelExpenseTotal,
          Maintenance: maintExpenseTotal,
          Tolls: tollExpenseTotal,
          Permits: permitExpenseTotal,
          Miscellaneous: miscExpenseTotal
        }
      }
    };
  };

  // Get active report's computed datasets
  const getActiveReportContent = () => {
    switch (selectedReport) {
      case "Utilization": return getVehicleUtilizationData();
      case "Performance": return getDriverPerformanceData();
      case "Fuel": return getFuelConsumptionData();
      case "Maintenance": return getMaintenanceCostData();
      case "Trips": return getTripSummaryData();
      case "Expenses": return getExpenseAnalysisData();
      default: return getVehicleUtilizationData();
    }
  };

  const activeData = getActiveReportContent();

  // ==========================================
  // EXPORT EXCEL (CSV)
  // ==========================================
  const handleExportExcel = () => {
    if (!activeData.rows || activeData.rows.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add Header metadata
    csvContent += `Speshway Fleet Management System\n`;
    csvContent += `${selectedReport} Report\n`;
    csvContent += `Generated At,${new Date().toLocaleString()}\n`;
    csvContent += `Date Filter,${dateRange}\n`;
    csvContent += `Vehicle Filter,${selectedVehicleId === "All" ? "All" : vehicles.find(v => v._id === selectedVehicleId)?.vehicleNumber || ""}\n`;
    csvContent += `Branch Filter,${selectedBranch}\n\n`;

    // Map columns
    const columns = Object.keys(activeData.rows[0]).filter(k => k !== "id");
    csvContent += columns.join(",") + "\n";

    activeData.rows.forEach(row => {
      const line = columns.map(col => {
        let val = row[col];
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      });
      csvContent += line.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedReport}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel report exported successfully!");
  };

  // ==========================================
  // PRINT REPORT
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // SCHEDULE DELIVERY SUBMIT
  // ==========================================
  const handleScheduleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    if (!newSchedule.name.trim() || !newSchedule.recipients.trim()) {
      toast.error("Please fill in all required fields (Name and Recipients).");
      return;
    }
    try {
      await managerApi.createReport({
        ...newSchedule,
        status: "Active"
      });
      toast.success("Report schedule created successfully!");
      setNewSchedule({
        name: "",
        type: "Operational",
        frequency: "Weekly",
        day: "Monday",
        time: "09:00",
        format: "PDF",
        recipients: ""
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create schedule.");
    }
  };

  const toggleScheduleStatus = async (id) => {
    const matched = schedules.find(s => s.id === id);
    if (!matched) return;
    const nextActive = !matched.active;
    const nextStatus = nextActive ? "Active" : "Paused";
    try {
      await managerApi.updateReport(id, { status: nextStatus });
      toast.success(`${matched.name} is now ${nextActive ? 'Active' : 'Paused'}`);
      loadData();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await managerApi.deleteReport(id);
      toast.success("Schedule deleted successfully.");
      loadData();
    } catch (error) {
      toast.error("Failed to delete schedule.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#B45A0A] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 relative">
      <Breadcrumb />
      
      {/* Page Title & View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-8 gap-4 select-none print:hidden">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Reports Center</h1>
          <p className="text-xs text-[#64748B] mt-1.5 font-nunito">Analyze real-time metrics, configure automated schedules, and export fleet audits.</p>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm self-start">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "live" ? "bg-[#B45A0A] text-white shadow-md shadow-[#B45A0A]/10" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Live Reports Cockpit
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "schedules" ? "bg-[#B45A0A] text-white shadow-md shadow-[#B45A0A]/10" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Delivery Schedules ({schedules.length})
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* VIEW: LIVE REPORTS COCKPIT */}
      {/* ==================================================== */}
      {activeTab === "live" && (
        <div id="print-area" className="space-y-6">
          {/* PRINT-ONLY HEADER */}
          <div className="hidden print:block mb-8 border-b pb-4 border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#B45A0A] rounded-xl flex items-center justify-center text-white font-bold text-lg font-poppins">
                  S
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-800 font-poppins">Speshway Fleet Management</p>
                  <p className="text-xs text-gray-500">Autonomous Logistics Audits</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-[#B45A0A] font-poppins uppercase">{selectedReport} Report</p>
                <p className="text-[10px] text-gray-400">Generated: {new Date().toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6 p-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-semibold text-gray-500 uppercase">
              <div>Range: <span className="text-gray-800 font-bold">{dateRange}</span></div>
              <div>Vehicle: <span className="text-gray-800 font-bold">{selectedVehicleId === "All" ? "All" : vehicles.find(v => v._id === selectedVehicleId)?.vehicleNumber}</span></div>
              <div>Driver: <span className="text-gray-800 font-bold">{selectedDriverId === "All" ? "All" : drivers.find(d => d._id === selectedDriverId)?.fullName}</span></div>
              <div>Branch: <span className="text-gray-800 font-bold">{selectedBranch}</span></div>
            </div>
          </div>
          
          {/* FILTER CONTROLS */}
          <div className="bg-white border border-[#E7EAF0] p-6 rounded-2xl shadow-md space-y-4 print:hidden select-none">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <Icon icon="mdi:filter-outline" className="w-5 h-5 text-[#B45A0A]" />
              <h3 className="font-poppins font-bold text-sm text-gray-800">Report Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Filter: Report Selector */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Select Report</label>
                <select
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#B45A0A]"
                >
                  <option value="Utilization">Vehicle Utilization</option>
                  <option value="Performance">Driver Performance</option>
                  <option value="Fuel">Fuel Consumption</option>
                  <option value="Maintenance">Maintenance Cost</option>
                  <option value="Trips">Trip Summary</option>
                  <option value="Expenses">Expense Analysis</option>
                </select>
              </div>

              {/* Filter: Date Range Selector */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#B45A0A]"
                >
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                  <option value="Custom Date Range">Custom Range</option>
                </select>
              </div>

              {/* Filter: Vehicle */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Vehicle</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#B45A0A]"
                >
                  <option value="All">All Vehicles</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.brand} {v.model} ({v.vehicleNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Driver */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Driver</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#B45A0A]"
                >
                  <option value="All">All Drivers</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.fullName} ({d.employeeId || 'No ID'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter: Branch */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Branch / Depot</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[#B45A0A]"
                >
                  <option value="All">All Branches</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex-1 py-2.5 border border-[#E7EAF0] hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Export to CSV / Excel"
                >
                  <Icon icon="mdi:file-excel" className="w-4 h-4 text-emerald-600" />
                  Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 py-2.5 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 animate-fade-in"
                  title="Print Report or Save as PDF"
                >
                  <Icon icon="mdi:printer" className="w-4 h-4" />
                  Print / PDF
                </button>
              </div>
            </div>

            {/* Custom Date Picker Inputs */}
            {dateRange === "Custom Date Range" && (
              <div className="grid grid-cols-2 gap-4 max-w-md pt-2 animate-fade-in">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B45A0A]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#B45A0A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* REPORT STATISTICS SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activeData.summary.map((card, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-[#E7EAF0] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">{card.label}</p>
                  <p className="text-2xl font-black text-gray-800 mt-2 font-poppins">{card.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                  <Icon icon={card.icon} className="w-5 h-5" />
                </div>
              </div>
            ))}
          </div>

          {/* VISUALIZATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid">
            {/* Visual 1: Left Bar / Trend Chart */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-md flex flex-col">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-4 pb-2 border-b border-[#E7EAF0]">
                {selectedReport === "Utilization" && "Vehicle Utilization (%)"}
                {selectedReport === "Performance" && "Driver Performance Scores"}
                {selectedReport === "Fuel" && "Fuel Consumption (Liters)"}
                {selectedReport === "Maintenance" && "Maintenance Expense Trend"}
                {selectedReport === "Trips" && "Trips Distance (km)"}
                {selectedReport === "Expenses" && "Expense Categories"}
              </h3>
              
              <div className="flex-1 min-h-[220px] flex items-end justify-between gap-3 pt-6 px-4">
                {selectedReport === "Utilization" && activeData.charts.utilization.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-amber-50 group-hover:bg-[#FDF3EC] rounded-t-lg relative transition-all" style={{ height: `${Math.max(15, item.utilization * 1.8)}px` }}>
                      <div className="absolute top-1 inset-x-0 text-center text-[10px] font-black text-[#B45A0A]">
                        {item.utilization}%
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 truncate max-w-[80px] text-center" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                ))}

                {selectedReport === "Performance" && activeData.charts.performance.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-emerald-50 group-hover:bg-emerald-100 rounded-t-lg relative transition-all" style={{ height: `${Math.max(15, item.score * 1.8)}px` }}>
                      <div className="absolute top-1 inset-x-0 text-center text-[10px] font-black text-emerald-800">
                        {item.score}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 truncate max-w-[80px] text-center" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                ))}

                {selectedReport === "Fuel" && activeData.charts.trend.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-orange-50 group-hover:bg-orange-100 rounded-t-lg relative transition-all" style={{ height: `${Math.max(15, Math.min(180, item.quantity * 1.2))}px` }}>
                      <div className="absolute top-1 inset-x-0 text-center text-[9px] font-bold text-[#B45A0A]">
                        {item.quantity}L
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 text-center">
                      {item.date}
                    </span>
                  </div>
                ))}

                {selectedReport === "Maintenance" && activeData.charts.costByVehicle.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-red-50 group-hover:bg-red-100 rounded-t-lg relative transition-all" style={{ height: `${Math.max(15, Math.min(180, item.cost / 200))}px` }}>
                      <div className="absolute top-1 inset-x-0 text-center text-[9px] font-bold text-red-800">
                        ₹{item.cost.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 truncate max-w-[80px] text-center" title={item.vehicleName}>
                      {item.vehicleName}
                    </span>
                  </div>
                ))}

                {selectedReport === "Trips" && activeData.rows.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-blue-50 group-hover:bg-blue-100 rounded-t-lg relative transition-all" style={{ height: `${Math.max(15, Math.min(180, item.distance * 0.4))}px` }}>
                      <div className="absolute top-1 inset-x-0 text-center text-[9px] font-bold text-blue-800">
                        {item.distance}km
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 text-center">
                      {item.departure}
                    </span>
                  </div>
                ))}

                {selectedReport === "Expenses" && Object.entries(activeData.charts.expenses).map(([key, val], idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-gray-100 group-hover:bg-amber-700/10 rounded-t-lg relative transition-all" style={{ height: `${Math.max(15, Math.min(180, val / 1500))}px` }}>
                      <div className="absolute top-1 inset-x-0 text-center text-[9px] font-bold text-gray-700">
                        ₹{val.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 truncate max-w-[80px] text-center" title={key}>
                      {key}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual 2: Right Gauge / Status Circular Ring Chart */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-md flex flex-col">
              <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-4 pb-2 border-b border-[#E7EAF0]">
                {selectedReport === "Utilization" && "Vehicle Status Breakdown"}
                {selectedReport === "Performance" && "Performance Score Rating"}
                {selectedReport === "Fuel" && "Fuel Cost Distribution"}
                {selectedReport === "Maintenance" && "Service Status Distribution"}
                {selectedReport === "Trips" && "Trip Status Ratio"}
                {selectedReport === "Expenses" && "Expense Distribution"}
              </h3>
              
              <div className="flex-1 flex flex-col justify-center space-y-4 px-4 py-2">
                {selectedReport === "Utilization" && (
                  <div className="space-y-3">
                    {[
                      { key: "Available", val: activeData.charts.status.Available, color: "bg-green-500" },
                      { key: "On Trip", val: activeData.charts.status["On Trip"], color: "bg-orange-500" },
                      { key: "Under Maintenance", val: activeData.charts.status.Maintenance, color: "bg-red-500" },
                      { key: "Idle / Out of Service", val: activeData.charts.status.Idle, color: "bg-gray-400" }
                    ].map((item, idx) => {
                      const total = Object.values(activeData.charts.status).reduce((a,b) => a+b, 0) || 1;
                      const pct = Math.round((item.val / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.key}</span>
                            <span>{item.val} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedReport === "Performance" && (
                  <div className="space-y-3">
                    {[
                      { key: "Excellent (90-100)", val: activeData.rows.filter(r => r.score >= 90).length, color: "bg-emerald-500" },
                      { key: "Good (75-89)", val: activeData.rows.filter(r => r.score >= 75 && r.score < 90).length, color: "bg-blue-500" },
                      { key: "Needs Improvement (<75)", val: activeData.rows.filter(r => r.score < 75).length, color: "bg-red-500" }
                    ].map((item, idx) => {
                      const total = activeData.rows.length || 1;
                      const pct = Math.round((item.val / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.key}</span>
                            <span>{item.val} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedReport === "Fuel" && (
                  <div className="space-y-3">
                    {activeData.rows.slice(0, 4).map((item, idx) => {
                      const total = activeData.rows.reduce((sum, r) => sum + r.cost, 0) || 1;
                      const pct = Math.round((item.cost / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span className="truncate max-w-[200px]">{item.vehicleName} ({item.plateNumber})</span>
                            <span>₹{item.cost.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {activeData.rows.length === 0 && (
                      <p className="text-center text-xs text-gray-400 font-semibold py-8">No fuel records matching filters.</p>
                    )}
                  </div>
                )}

                {selectedReport === "Maintenance" && (
                  <div className="space-y-3">
                    {[
                      { key: "Routine / Preventative", val: activeData.rows.filter(r => r.type.toLowerCase().includes("routine") || r.type.toLowerCase().includes("prevent")).length, color: "bg-blue-500" },
                      { key: "Emergency / Repair", val: activeData.rows.filter(r => r.type.toLowerCase().includes("repair") || r.type.toLowerCase().includes("emergency")).length, color: "bg-red-500" },
                      { key: "Inspection", val: activeData.rows.filter(r => r.type.toLowerCase().includes("inspect")).length, color: "bg-amber-500" }
                    ].map((item, idx) => {
                      const total = activeData.rows.length || 1;
                      const pct = Math.round((item.val / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.key}</span>
                            <span>{item.val} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedReport === "Trips" && (
                  <div className="space-y-3">
                    {[
                      { key: "Completed", val: activeData.charts.status.Completed, color: "bg-green-500" },
                      { key: "Ongoing / Active", val: activeData.charts.status.Ongoing, color: "bg-blue-500" },
                      { key: "Cancelled", val: activeData.charts.status.Cancelled, color: "bg-red-500" }
                    ].map((item, idx) => {
                      const total = Object.values(activeData.charts.status).reduce((a,b) => a+b, 0) || 1;
                      const pct = Math.round((item.val / total) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{item.key}</span>
                            <span>{item.val} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedReport === "Expenses" && (
                  <div className="space-y-3">
                    {Object.entries(activeData.charts.expenses).map(([key, val], idx) => {
                      const total = Object.values(activeData.charts.expenses).reduce((a,b) => a+b, 0) || 1;
                      const pct = Math.round((val / total) * 100);
                      const colors = ["bg-amber-500", "bg-red-500", "bg-blue-500", "bg-green-500", "bg-gray-400"];
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>{key}</span>
                            <span>₹{val.toLocaleString()} ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${colors[idx % colors.length]}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DETAILED DATA TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden print:border-none print:shadow-none">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between print:hidden">
              <h3 className="text-base font-bold text-gray-800 font-poppins">{selectedReport} Details</h3>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                    {/* TABLE HEADERS BY REPORT TYPE */}
                    {selectedReport === "Utilization" && (
                      <>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Vehicle Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Reg. Number</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Type</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Trips</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Distance (km)</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Running Hrs</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Days Active</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Days Idle</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Utilization</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Status</th>
                      </>
                    )}
                    {selectedReport === "Performance" && (
                      <>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Driver Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Employee ID</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Assigned Vehicle</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Trips Completed</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Distance Cover (km)</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">On-Time Trips</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Driver Status</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Rating Score</th>
                      </>
                    )}
                    {selectedReport === "Fuel" && (
                      <>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Vehicle Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Reg. Number</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Driver Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Fuel Qty (L)</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Fuel Cost</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Fuel Station</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Refuel Date</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Trip ID</th>
                      </>
                    )}
                    {selectedReport === "Maintenance" && (
                      <>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Vehicle Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Reg. Number</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Service Date</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Maintenance Type</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Service Center</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Maintenance Cost</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Next Service Due</th>
                      </>
                    )}
                    {selectedReport === "Trips" && (
                      <>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Trip ID</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Pickup Location</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Destination</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Driver Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Reg. Number</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Status</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Departure Date</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Arrival Date</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Distance (km)</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Duration</th>
                      </>
                    )}
                    {selectedReport === "Expenses" && (
                      <>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Vehicle Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Reg. Number</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Fuel Expense</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Maint. Expense</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Toll Charges</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Permit Charges</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Miscellaneous</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Total Expense</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {activeData.rows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-20 text-center text-gray-400 text-xs font-bold">
                        No rows found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    activeData.rows.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-[#F5F7FB]/50 transition-colors">
                        
                        {/* ROWS BY REPORT TYPE */}
                        {selectedReport === "Utilization" && (
                          <>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800">{row.name}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.plateNumber}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.type}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.tripsCount}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.distance.toLocaleString()} km</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.runningHours} hrs</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.daysActive} days</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.daysIdle} days</td>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-[#B45A0A]">{row.utilization}%</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.status === "Available" ? "bg-green-50 text-green-700" :
                                row.status === "On Trip" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"
                              }`}>{row.status}</span>
                            </td>
                          </>
                        )}

                        {selectedReport === "Performance" && (
                          <>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800">{row.name}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.employeeId}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.assignedVehicle}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.tripsCount}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.distance.toLocaleString()} km</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.onTimeTrips}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.status}</td>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-emerald-600">{row.score}/100</td>
                          </>
                        )}

                        {selectedReport === "Fuel" && (
                          <>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800">{row.vehicleName}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.plateNumber}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.driverName}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.quantity} L</td>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800">₹{row.cost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.fuelStation}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.date}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins text-xs truncate max-w-[120px]">{row.tripId}</td>
                          </>
                        )}

                        {selectedReport === "Maintenance" && (
                          <>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800">{row.vehicleName}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.plateNumber}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.serviceDate}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.type}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.serviceCenter}</td>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-red-600">₹{row.cost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.nextServiceDue}</td>
                          </>
                        )}

                        {selectedReport === "Trips" && (
                          <>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800 font-poppins text-xs">{row.tripId}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.pickup}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.destination}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.driverName}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.plateNumber}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.status === "Completed" ? "bg-green-50 text-green-700" :
                                row.status === "Ongoing" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                              }`}>{row.status}</span>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.departure}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.arrival}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.distance} km</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{row.duration}</td>
                          </>
                        )}

                        {selectedReport === "Expenses" && (
                          <>
                            <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-800">{row.name}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600 font-poppins">{row.plateNumber}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">₹{row.fuelCost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">₹{row.maintCost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">₹{row.tollCost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">₹{row.permitCost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">₹{row.miscCost.toLocaleString("en-IN")}</td>
                            <td className="py-4 px-6 whitespace-nowrap font-black text-red-600">₹{row.total.toLocaleString("en-IN")}</td>
                          </>
                        )}

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW: DELIVERY SCHEDULES CRUD */}
      {/* ==================================================== */}
      {activeTab === "schedules" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none animate-fade-in print:hidden">
          {/* Left column - Create Schedule Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h3 className="text-base font-bold text-gray-800 mb-6 font-poppins flex items-center gap-2">
                <Icon icon="mdi:plus-circle-outline" className="w-5 h-5 text-[#B45A0A]" />
                Create Schedule
              </h3>
              
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Schedule Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newSchedule.name}
                    onChange={handleScheduleInputChange}
                    placeholder="e.g. Weekly Fuel Summary"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Report Type</label>
                  <select
                    name="type"
                    value={newSchedule.type}
                    onChange={handleScheduleInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Financial">Financial</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Frequency</label>
                    <select
                      name="frequency"
                      value={newSchedule.frequency}
                      onChange={handleScheduleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Format</label>
                    <select
                      name="format"
                      value={newSchedule.format}
                      onChange={handleScheduleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    >
                      <option value="PDF">PDF</option>
                      <option value="CSV">CSV</option>
                      <option value="Excel">Excel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Day of Week</label>
                    <select
                      name="day"
                      value={newSchedule.day}
                      onChange={handleScheduleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={newSchedule.time}
                      onChange={handleScheduleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Recipient Email(s)</label>
                  <input
                    type="text"
                    name="recipients"
                    value={newSchedule.recipients}
                    onChange={handleScheduleInputChange}
                    placeholder="manager@fleet.com, admin@fleet.com"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-[#B45A0A]/20 cursor-pointer text-center font-poppins"
                >
                  Add Delivery Schedule
                </button>
              </form>
            </div>
          </div>

          {/* Right column - Scheduled Deliveries List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800 font-poppins">Configured Report Delivery Schedules</h3>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {schedules.length === 0 ? (
                <div className="py-20 text-center text-gray-400 text-xs font-bold">
                  No delivery schedules configured. Use the form on the left to add one!
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left border-collapse text-sm font-nunito">
                    <thead>
                      <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                        <th className="py-4 px-6 text-left whitespace-nowrap">Schedule Name</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Type</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Details</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Recipients</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Status</th>
                        <th className="py-4 px-6 text-left whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7EAF0]/60">
                      {schedules.map((schedule) => {
                        const colors = {
                          financial: "text-emerald-500 bg-emerald-50 border border-emerald-100",
                          compliance: "text-blue-500 bg-blue-50 border border-blue-100",
                          safety: "text-red-500 bg-red-50 border border-red-100"
                        };
                        const catLower = schedule.type.toLowerCase();
                        const colorClass = colors[catLower] || "text-amber-500 bg-amber-50 border border-amber-100";
                        
                        const icons = {
                          financial: "mdi:currency-usd",
                          compliance: "mdi:shield-check",
                          safety: "mdi:shield-star"
                        };
                        const iconName = icons[catLower] || "mdi:truck-fast";

                        return (
                          <tr key={schedule.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                  <Icon icon={iconName} className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-[#1E293B] text-xs">{schedule.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold inline-block">{schedule.type}</span>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="text-xs font-semibold text-[#1E293B]">{schedule.frequency}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">{schedule.day} at {schedule.time} ({schedule.format})</div>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap max-w-[180px] truncate">
                              <p className="text-[#64748B] text-xs truncate" title={schedule.recipients}>{schedule.recipients}</p>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <button 
                                onClick={() => toggleScheduleStatus(schedule.id)}
                                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                                  schedule.active ? "bg-[#B45A0A]" : "bg-gray-300"
                                }`}
                              >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                                  schedule.active ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </button>
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                                title="Delete Schedule"
                              >
                                <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS style block for clean print styling */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          /* Hide scrollbars during print */
          .no-scrollbar {
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
