import axiosClient from "@/api/axiosClient";

export const managerApi = {
  // Dashboard
  getDashboard: async () => {
    return await axiosClient.get("/manager/dashboard");
  },

  // Vehicles
  getVehicles: async () => {
    return await axiosClient.get("/manager/vehicles");
  },

  getLiveTracking: async () => {
    return await axiosClient.get("/manager/live-tracking");
  },

  getAvailableVehicles: async () => {
    return await axiosClient.get("/vehicles/available");
  },

  getAvailableDrivers: async () => {
    return await axiosClient.get("/drivers/available");
  },

  getVehicleById: async (id) => {
    return await axiosClient.get(`/manager/vehicles/${id}`);
  },

  createVehicle: async (vehicleData) => {
    return await axiosClient.post("/manager/vehicles", vehicleData);
  },

  updateVehicle: async (id, vehicleData) => {
    return await axiosClient.put(`/manager/vehicles/${id}`, vehicleData);
  },

  deleteVehicle: async (id) => {
    return await axiosClient.delete(`/manager/vehicles/${id}`);
  },

  // Drivers
  getDrivers: async () => {
    return await axiosClient.get("/manager/drivers");
  },

  getDriverById: async (id) => {
    return await axiosClient.get(`/manager/drivers/${id}`);
  },

  createDriver: async (driverData) => {
    return await axiosClient.post("/manager/drivers", driverData);
  },

  updateDriver: async (id, driverData) => {
    return await axiosClient.put(`/manager/drivers/${id}`, driverData);
  },

  deleteDriver: async (id) => {
    return await axiosClient.delete(`/manager/drivers/${id}`);
  },

  // Trips
  getTrips: async () => {
    return await axiosClient.get("/manager/trips");
  },

  getTripById: async (id) => {
    return await axiosClient.get(`/manager/trips/${id}`);
  },

  createTrip: async (tripData) => {
    return await axiosClient.post("/manager/trips", tripData);
  },

  updateTrip: async (id, tripData) => {
    return await axiosClient.put(`/manager/trips/${id}`, tripData);
  },

  deleteTrip: async (id) => {
    return await axiosClient.delete(`/manager/trips/${id}`);
  },

  // Fuel Management
  getFuelRecords: async () => {
    return await axiosClient.get("/manager/fuel");
  },

  getFuelRecordById: async (id) => {
    return await axiosClient.get(`/manager/fuel/${id}`);
  },

  createFuelRecord: async (fuelData) => {
    return await axiosClient.post("/manager/fuel", fuelData);
  },

  updateFuelRecord: async (id, fuelData) => {
    return await axiosClient.put(`/manager/fuel/${id}`, fuelData);
  },

  deleteFuelRecord: async (id) => {
    return await axiosClient.delete(`/manager/fuel/${id}`);
  },

  // Maintenance
  getMaintenance: async () => {
    return await axiosClient.get("/manager/maintenance");
  },

  getMaintenanceById: async (id) => {
    return await axiosClient.get(`/manager/maintenance/${id}`);
  },

  createMaintenance: async (maintenanceData) => {
    return await axiosClient.post("/manager/maintenance", maintenanceData);
  },

  updateMaintenance: async (id, maintenanceData) => {
    return await axiosClient.put(`/manager/maintenance/${id}`, maintenanceData);
  },

  deleteMaintenance: async (id) => {
    return await axiosClient.delete(`/manager/maintenance/${id}`);
  },

  // Documents
  getDocuments: async () => {
    return await axiosClient.get("/manager/documents");
  },

  getDocumentById: async (id) => {
    return await axiosClient.get(`/manager/documents/${id}`);
  },

  createDocument: async (documentData) => {
    return await axiosClient.post("/manager/documents", documentData);
  },

  updateDocument: async (id, documentData) => {
    return await axiosClient.put(`/manager/documents/${id}`, documentData);
  },

  deleteDocument: async (id) => {
    return await axiosClient.delete(`/manager/documents/${id}`);
  },

  // Reports
  getReports: async () => {
    return await axiosClient.get("/manager/reports");
  },

  getReportById: async (id) => {
    return await axiosClient.get(`/manager/reports/${id}`);
  },

  createReport: async (reportData) => {
    return await axiosClient.post("/manager/reports", reportData);
  },

  updateReport: async (id, reportData) => {
    return await axiosClient.put(`/manager/reports/${id}`, reportData);
  },

  deleteReport: async (id) => {
    return await axiosClient.delete(`/manager/reports/${id}`);
  },

  // E-Way Bills
  getEWayBills: async () => {
    return await axiosClient.get("/manager/eway");
  },

  createEWayBill: async (ewayData) => {
    return await axiosClient.post("/manager/eway", ewayData);
  },

  extendEWayBill: async (id) => {
    return await axiosClient.put(`/manager/eway/${id}/extend`);
  },

  updateEWayBill: async (id, ewayData) => {
    return await axiosClient.put(`/manager/eway/${id}`, ewayData);
  },

  deleteEWayBill: async (id) => {
    return await axiosClient.delete(`/manager/eway/${id}`);
  },
};