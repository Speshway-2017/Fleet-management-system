import axiosClient from "@/api/axiosClient";

export const driverApi = {
  // Auth
  login: async (credentials) => {
    const response = await axiosClient.post("/driver/login", credentials);
    return response.data;
  },
  logout: async () => {
    const response = await axiosClient.post("/driver/logout");
    return response.data;
  },

  // Profile & Shift
  getProfile: async () => {
    const response = await axiosClient.get("/driver/profile");
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await axiosClient.put("/driver/profile", data);
    return response.data;
  },

  // Dashboard
  getDashboard: async () => {
    const response = await axiosClient.get("/driver/dashboard");
    return response.data;
  },

  // Vehicle
  getAssignedVehicle: async () => {
    const response = await axiosClient.get("/driver/vehicle");
    return response.data;
  },

  // Maintenance summary
  getMaintenance: async () => {
    const response = await axiosClient.get("/driver/maintenance");
    return response.data;
  },

  // Trips
  getCurrentTrip: async () => {
    const response = await axiosClient.get("/driver/trips/current");
    return response.data;
  },
  getTrips: async (params = {}) => {
    const response = await axiosClient.get("/driver/trips", { params });
    return response.data;
  },
  getTripById: async (tripId) => {
    const response = await axiosClient.get(`/driver/trips/${tripId}`);
    return response.data;
  },
  respondToTripAssignment: async (tripId, action) => {
    const formattedAction = action?.toLowerCase() === "accepted" ? "accept" : action?.toLowerCase() === "rejected" ? "reject" : action;
    const response = await axiosClient.patch(`/driver/trips/${tripId}/respond`, { action: formattedAction });
    return response.data;
  },
  updateTripStatus: async (tripId, payload) => {
    const response = await axiosClient.patch(`/driver/trips/${tripId}/status`, payload);
    return response.data;
  },
  getTripInvoice: async (tripId) => {
    const response = await axiosClient.get(`/driver/trips/${tripId}/invoice`);
    return response.data;
  },
  getTripTollReceipt: async (tripId) => {
    const response = await axiosClient.get(`/driver/trips/${tripId}/toll-receipt`);
    return response.data;
  },
  toggleCustomerLocation: async (tripId, payload = { reached: true }) => {
    const response = await axiosClient.patch(`/driver/trips/${tripId}/customer-location`, payload);
    return response.data;
  },

  // Location update
  updateLocation: async (locationData) => {
    const response = await axiosClient.post("/driver/location", locationData);
    return response.data;
  },

  // POD & Weighbridge Upload
  uploadPOD: async (formData) => {
    const response = await axiosClient.post("/driver/pod", formData);
    return response.data;
  },
  uploadWeighbridge: async (formData) => {
    const response = await axiosClient.post("/driver/weighbridge", formData);
    return response.data;
  },

  // Fuel Records
  getFuelRecords: async () => {
    const response = await axiosClient.get("/driver/fuel");
    return response.data;
  },
  createFuelEntry: async (formData) => {
    const response = await axiosClient.post("/driver/fuel", formData);
    return response.data;
  },

  // Tickets / Maintenance Issues
  getTickets: async () => {
    const response = await axiosClient.get("/driver/tickets");
    return response.data;
  },
  getTicketById: async (ticketId) => {
    const response = await axiosClient.get(`/driver/tickets/${ticketId}`);
    return response.data;
  },
  createTicket: async (formData) => {
    const response = await axiosClient.post("/driver/tickets", formData);
    return response.data;
  },
  updateTicketStatus: async (ticketId, payload) => {
    if (payload instanceof FormData) {
      const response = await axiosClient.patch(`/driver/tickets/${ticketId}/status`, payload, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    }
    if (typeof payload === "string") {
      const response = await axiosClient.patch(`/driver/tickets/${ticketId}/status`, { status: payload });
      return response.data;
    }
    const response = await axiosClient.patch(`/driver/tickets/${ticketId}/status`, payload);
    return response.data;
  },
  resolveTicket: async (ticketId, formData) => {
    const response = await axiosClient.post(`/driver/tickets/${ticketId}/resolve`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  },

  // Documents
  getDocuments: async () => {
    const response = await axiosClient.get("/driver/documents");
    return response.data;
  },
  getDocumentById: async (documentId) => {
    const response = await axiosClient.get(`/driver/documents/${documentId}`);
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await axiosClient.get("/driver/notifications");
    return response.data;
  },
  markNotificationRead: async (notificationId) => {
    const response = await axiosClient.patch(`/driver/notifications/${notificationId}/read`);
    return response.data;
  },
  markAllNotificationsRead: async () => {
    const response = await axiosClient.patch("/driver/notifications/read-all");
    return response.data;
  },

  // Support
  getSupportInfo: async () => {
    const response = await axiosClient.get("/driver/support");
    return response.data;
  },
};

export default driverApi;
