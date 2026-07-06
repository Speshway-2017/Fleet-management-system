import { mockUsers } from "@/data/mockUsers";
import { mockFleetOverview } from "@/data/mockFleetOverview";

let users = [...mockUsers];

export const adminApi = {
  getUsers: async () => {
    return { data: users.map(({ password, ...u }) => u) };
  },
  createUser: async (payload) => {
    const newUser = {
      id: users.length + 1,
      ...payload,
    };
    users.push(newUser);
    return { data: newUser };
  },
  updateUser: async (id, payload) => {
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...payload };
      return { data: users[index] };
    }
    throw new Error("User not found");
  },
  deleteUser: async (id) => {
    users = users.filter((u) => u.id !== id);
    return { data: { id } };
  },
  getFleetOverview: async () => {
    return { data: mockFleetOverview };
  },
};
