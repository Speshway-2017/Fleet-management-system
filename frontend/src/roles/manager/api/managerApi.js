import { mockVehicles } from "@/data/mockVehicles";
import { mockDrivers } from "@/data/mockDrivers";
import { mockTrips } from "@/data/mockTrips";

let trips = [...mockTrips];

export const managerApi = {
  getVehicles: async () => {
    return { data: mockVehicles };
  },
  getDrivers: async () => {
    return { data: mockDrivers };
  },
  getTrips: async () => {
    return { data: trips };
  },
  assignTrip: async (payload) => {
    const newTrip = {
      id: trips.length + 1,
      ...payload,
      status: "pending",
    };
    trips.push(newTrip);
    return { data: newTrip };
  },
};
