import axiosClient from "@/api/axiosClient";

export const managerApi = {
  getVehicles: () => axiosClient.get("/manager/vehicles"),
  getDrivers: () => axiosClient.get("/manager/drivers"),
  getTrips: () => axiosClient.get("/manager/trips"),
  assignTrip: (payload) => axiosClient.post("/manager/trips", payload),
};
