import { mockUsers } from "@/data/mockUsers";

export const authApi = {
  login: async (credentials) => {
    const user = mockUsers.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const { password, ...userWithoutPassword } = user;
    return {
      data: {
        token: "fake-jwt-token-" + user.id,
        user: userWithoutPassword,
      },
    };
  },
  logout: async () => {},
  getProfile: async () => {},
};
