import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(credentials);
      sessionStorage.setItem("token", data.token);
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
          sessionStorage.setItem("token", "mock_dev_session_token_3b0569d8");
          sessionStorage.setItem("user", JSON.stringify(mockUser));
          setUser(mockUser);
          return mockUser;
        } else if (email === "admin@fleet.com" && password === "admin123") {
          const mockUser = {
            name: "Super Admin",
            role: "admin",
            email: "admin@fleet.com"
          };
          sessionStorage.setItem("token", "mock_dev_session_token_3b0569d8");
          sessionStorage.setItem("user", JSON.stringify(mockUser));
          setUser(mockUser);
          return mockUser;
        }
      }
      throw err;
      if (import.meta.env.DEV) {
        try {
          const { data } = await authApi.login(credentials);
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          return data.user;
        } catch (apiError) {
          console.warn("API login failed, falling back to mock login in development mode:", apiError);
          const { email, password } = credentials;
          if (email === "admin@fleet.com" && password === "password") {
            const mockUser = { name: "Admin User", email: "admin@fleet.com", role: "admin" };
            sessionStorage.setItem("token", "dev-mock-token");
            sessionStorage.setItem("user", JSON.stringify(mockUser));
            setUser(mockUser);
            return mockUser;
          } else if (email === "manager@fleet.com" && password === "password") {
            const mockUser = { name: "Manager User", email: "manager@fleet.com", role: "manager" };
            sessionStorage.setItem("token", "dev-mock-token");
            sessionStorage.setItem("user", JSON.stringify(mockUser));
            setUser(mockUser);
            return mockUser;
          } else {
            throw new Error("Invalid credentials");
          }
        }
      } else {
        const { data } = await authApi.login(credentials);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  const storedUser = (() => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();
  const currentUser = user || storedUser;

  const value = {
    user: currentUser,
    role: currentUser?.role ?? null,
    isAuthenticated: !!currentUser,
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
