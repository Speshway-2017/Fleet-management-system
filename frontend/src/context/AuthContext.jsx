import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("API login failed, checking local seed credentials:", err.message);
        const email = credentials.email?.toLowerCase();
        const password = credentials.password;

        if (email === "manager@fleet.com" && password === "manager123") {
          const mockUser = {
            name: "Alex Thompson",
            role: "manager",
            email: "manager@fleet.com"
          };
          localStorage.setItem("token", "mock_dev_session_token_3b0569d8");
          setUser(mockUser);
          return mockUser;
        } else if (email === "admin@fleet.com" && password === "admin123") {
          const mockUser = {
            name: "Super Admin",
            role: "admin",
            email: "admin@fleet.com"
          };
          localStorage.setItem("token", "mock_dev_session_token_3b0569d8");
          setUser(mockUser);
          return mockUser;
        }
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    role: user?.role ?? null,
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
