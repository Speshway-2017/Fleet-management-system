import { requestWithRetry } from "./axios";

export const dashboardApi = {
  getDashboard: () =>
    requestWithRetry("/manager/dashboard")
      .then((res) => res.data?.data || res.data)
      .catch((err) => {
        console.warn("Dashboard stats error:", err.message);
        return {
          totalVehicles: 0,
          activeVehicles: 0,
          tripsToday: 0,
          underRepair: 0,
          driversAvailable: 0,
          fuelExpense: "₹0",
          totalEarnings: "₹0",
        };
      }),

  getVehicles: () =>
    requestWithRetry("/manager/vehicles")
      .then((res) => res.data?.data || res.data || [])
      .catch((err) => {
        console.warn("Vehicles fetch error:", err.message);
        return [];
      }),

  getLiveTracking: () =>
    requestWithRetry("/manager/vehicles")
      .then((res) => {
        const vehicles = res.data?.data || res.data || [];
        return vehicles.map(v => ({
          id: v._id || v.id,
          vehicle: v.plateNumber || v.vehicleNumber,
          lat: v.latitude || 28.6139,
          lng: v.longitude || 77.2090,
          status: v.status === "Available" ? "Running" : v.status === "Maintenance" ? "Repair" : "Running"
        }));
      })
      .catch((err) => {
        console.warn("Live tracking fetch error:", err.message);
        return [];
      }),

  getCompliance: () =>
    requestWithRetry("/manager/documents")
      .then((res) => {
        const docs = res.data?.data || res.data || [];
        return docs.map(d => {
          const isExpired = d.expiry && new Date(d.expiry) < new Date();
          return {
            id: d._id || d.id,
            vehicle: d.vehicle || "All Fleet",
            document: d.title || d.type || "Document",
            expiryDate: d.expiry ? d.expiry.split("T")[0] : "—",
            status: isExpired ? "EXPIRED" : "VALID",
            statusType: isExpired ? "danger" : "success"
          };
        });
      })
      .catch((err) => {
        console.warn("Compliance fetch error:", err.message);
        return [];
      }),

  getCostBreakdown: () =>
    Promise.all([
      requestWithRetry("/manager/fuel").catch(() => ({ data: { data: [] } })),
      requestWithRetry("/manager/maintenance").catch(() => ({ data: { data: [] } }))
    ])
      .then(([fuelRes, maintRes]) => {
        const fuelData = fuelRes.data?.data || [];
        const maintData = maintRes.data?.data || [];
        
        const fuelSum = fuelData.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
        const maintSum = maintData.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        
        const total = fuelSum + maintSum || 1;
        
        return [
          { label: "Fuel Cost", amount: `₹${fuelSum.toLocaleString('en-IN')}`, percentage: Math.round((fuelSum / total) * 100) },
          { label: "Maintenance Cost", amount: `₹${maintSum.toLocaleString('en-IN')}`, percentage: Math.round((maintSum / total) * 100) }
        ];
      })
      .catch((err) => {
        console.warn("Cost breakdown fetch error:", err.message);
        return [];
      }),
};
