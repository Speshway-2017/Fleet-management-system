import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";
import { getSocket, disconnectSocket } from "@/api/socket";

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

  // Sync user profile on mount
  useEffect(() => {
    const syncProfile = async () => {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      if (token) {
        try {
          const { data: body } = await axiosClient.get("/auth/profile");
          const backendUser = body.data;
          const normalized = normalizeUser(backendUser);
          setUser(normalized);
          sessionStorage.setItem("user", JSON.stringify(normalized));
          localStorage.setItem("user", JSON.stringify(normalized));
        } catch (err) {
          console.error("Error synchronizing profile on mount:", err);
          if (err.response && err.response.status === 401) {
            // Token is invalid/expired
            logout();
          }
        }
      }
    };
    syncProfile();
  }, []);

  const refreshProfile = async () => {
    try {
      const { data: body } = await axiosClient.get("/auth/profile");
      const backendUser = body.data;
      const normalized = normalizeUser(backendUser);
      setUser(normalized);
      sessionStorage.setItem("user", JSON.stringify(normalized));
      localStorage.setItem("user", JSON.stringify(normalized));
      return normalized;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
      throw err;
    }
  };

  // Socket.IO global integration for real-time updates (e.g. subscription approval/rejection)
  useEffect(() => {
    const loggedInUserId = user?._id || user?.id || null;
    const userRole = user?.role || null;
    const userOrg = user?.organizationId || user?.organization || null;

    if (loggedInUserId && userRole) {
      const socket = getSocket();

      // Join manager or admin-specific rooms depending on role
      if (userRole === "manager" || userRole === "FLEET_MANAGER") {
        socket.emit("joinManagerRoom", loggedInUserId);
        socket.emit("joinRoleRoom", "FLEET_MANAGER");
        if (userOrg) {
          socket.emit("joinOrganizationRoom", userOrg);
        }
      } else if (userRole === "admin" || userRole === "SUPER_ADMIN") {
        socket.emit("joinAdminRoom", loggedInUserId);
        socket.emit("joinRoleRoom", "SUPER_ADMIN");
      }

      // Refresh user profile if a notification related to subscription is received
      const handleNewNotification = (notification) => {
        const title = notification?.title?.toLowerCase() || "";
        const message = notification?.message?.toLowerCase() || "";
        if (title.includes("subscription") || message.includes("subscription")) {
          refreshProfile().catch((err) => {
            console.error("Failed to refresh profile from socket notification:", err);
          });
        }
      };

      socket.on("notification:new", handleNewNotification);

      return () => {
        socket.off("notification:new", handleNewNotification);
      };
    } else {
      disconnectSocket();
    }
  }, [user?._id, user?.id, user?.role, user?.organizationId, user?.organization]);

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
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
