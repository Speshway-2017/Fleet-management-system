import { createContext, useContext, useState } from "react";
import axiosClient from "@/api/axiosClient";

const AuthContext = createContext(null);

// Backend roles → frontend short roles used by ProtectedRoute
const ROLE_MAP = {
  SUPER_ADMIN:   "admin",
  FLEET_MANAGER: "manager",
};

function normalizeUser(backendUser) {
  return {
    ...backendUser,
    role: ROLE_MAP[backendUser.role] ?? backendUser.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("user") || localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  /**
   * Calls POST /api/auth/login
   * Backend response shape: { success, message, data: { token, user: { id, name, email, role } } }
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data: body } = await axiosClient.post("/auth/login", {
        email:    credentials.email,
        password: credentials.password,
      });

      const { token, user: backendUser } = body.data;
      const normalizedUser = normalizeUser(backendUser);

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(normalizedUser));
      sessionStorage.setItem("authToken", token);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      localStorage.setItem("authToken", token);

      setUser(normalizedUser);
      return normalizedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch {
      // clear session regardless of server response
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("authToken");

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      setUser(null);
    }
  };

  const value = {
    user,
    role:            user?.role ?? null,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
