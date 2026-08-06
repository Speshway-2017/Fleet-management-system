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

  getAvailableVehicles: async (params) => {
    return await axiosClient.get("/vehicles/available", { params });
  },

  getAvailableDrivers: async (params) => {
    return await axiosClient.get("/drivers/available", { params });
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
  getDrivers: async (params) => {
    return await axiosClient.get("/manager/drivers", { params });
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
  getTrips: async (params) => {
    return await axiosClient.get("/manager/trips", { params });
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

  approveTripCompletion: async (id) => {
    return await axiosClient.post(`/manager/trips/${id}/approve-completion`);
  },

  rejectTripDocuments: async (id, data) => {
    return await axiosClient.post(`/manager/trips/${id}/reject-documents`, data);
  },

  getInvoiceByTripId: async (tripId) => {
    return await axiosClient.get(`/manager/invoices/trip/${tripId}`);
  },

  getTollsByTripId: async (tripId) => {
    return await axiosClient.get(`/manager/trips/${tripId}/tolls`);
  },

  // Trip Communication
  getTripChat: async (tripId, markRead = false) => {
    return await axiosClient.get(`/manager/trips/${tripId}/chat`, { params: { markRead } });
  },

  sendTripMessage: async (tripId, messageData) => {
    return await axiosClient.post(`/manager/trips/${tripId}/chat`, messageData);
  },

  markTripMessagesRead: async (tripId) => {
    return await axiosClient.patch(`/manager/trips/${tripId}/chat/read`);
  },

  getTripCallHistory: async (tripId) => {
    return await axiosClient.get(`/manager/trips/${tripId}/calls`);
  },

  saveTripCallLog: async (tripId, callData) => {
    return await axiosClient.post(`/manager/trips/${tripId}/calls`, callData);
  },

  getUnreadChatCounts: async () => {
    return await axiosClient.get("/manager/trips/unread-chat-counts");
  },

  // Vehicle Complaints
  createVehicleComplaint: async (complaintData) => {
    return await axiosClient.post("/manager/vehicle-complaints", complaintData);
  },

  getVehicleComplaintsByTripId: async (tripId) => {
    return await axiosClient.get("/manager/vehicle-complaints", { params: { tripId } });
  },

  getVehicleComplaints: async () => {
    return await axiosClient.get("/manager/vehicle-complaints");
  },

  updateVehicleComplaint: async (id, complaintData) => {
    return await axiosClient.put(`/manager/vehicle-complaints/${id}`, complaintData);
  },

  // Fuel Management
  getFuelRecords: async (params) => {
    return await axiosClient.get("/manager/fuel", { params });
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
  getMaintenance: async (params) => {
    return await axiosClient.get("/manager/maintenance", { params });
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

  getActivities: async () => {
    return await axiosClient.get("/manager/activities");
  },

  getNotifications: async () => {
    localStorage.removeItem("local_complaints_notifications");
    return await axiosClient.get("/manager/notifications");
  },

  markNotificationRead: async (id) => {
    localStorage.removeItem("local_complaints_notifications");
    return await axiosClient.patch(`/manager/notifications/${id}/read`);
  },

  markAllNotificationsRead: async () => {
    localStorage.removeItem("local_complaints_notifications");
    return await axiosClient.patch("/manager/notifications/read-all");
  },

  // Trip Milestone Reviews
  getPendingMilestone: async () => {
    return await axiosClient.get("/manager/reviews/pending-milestone");
  },

  submitReview: async (reviewData) => {
    return await axiosClient.post("/manager/reviews", reviewData);
  },

  maybeLater: async (milestone) => {
    return await axiosClient.post("/manager/reviews/maybe-later", { milestone });
  },

  getProfile: async () => {
    return await axiosClient.get("/auth/profile");
  },

  updateProfile: async (profileData) => {
    return await axiosClient.put("/auth/profile", profileData);
  },

  // Proof of Delivery
  getPODByTripId: async (tripId) => {
    return await axiosClient.get(`/manager/pod/trip/${tripId}`);
  },

  updatePODStatus: async (podId, statusData) => {
    return await axiosClient.put(`/manager/pod/${podId}/status`, statusData);
  },

  simulateDriverUploadPOD: async (tripId) => {
    return await axiosClient.post(`/manager/pod/trip/${tripId}/simulate-upload`);
  },

  // Weighbridge Slip
  getWeighbridgeSlipByTripId: async (tripId) => {
    return await axiosClient.get(`/manager/weighbridge/trip/${tripId}`);
  },

  updateWeighbridgeSlipStatus: async (id, statusData) => {
    return await axiosClient.put(`/manager/weighbridge/${id}/status`, statusData);
  },

  simulateDriverUploadWeighbridgeSlip: async (tripId) => {
    return await axiosClient.post(`/manager/weighbridge/trip/${tripId}/simulate-upload`);
  },

  // Toll Receipts
  getTollReceiptsByTripId: async (tripId) => {
    return await axiosClient.get(`/manager/toll/trip/${tripId}`);
  },

  updateTollReceiptsStatus: async (id, statusData) => {
    return await axiosClient.put(`/manager/toll/${id}/status`, statusData);
  },
};