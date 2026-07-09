import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";

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
      const response = await authApi.login(credentials);
      // The backend returns the user in data.data or data depending on response formatting
      // Our backend uses `sendSuccess` which wraps in { success: true, data: { token, user }, message }
      // Axios puts this in response.data. So it should be response.data.data.token
      const responseData = response.data.data || response.data;
      
      localStorage.setItem("token", responseData.token);
      localStorage.setItem("user", JSON.stringify(responseData.user));
      setUser(responseData.user);
      return responseData.user;
    } catch (err) {
      // Pass the error message from the backend, if available
      const message = err.response?.data?.message || err.message || "Login failed";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Clear local storage and state immediately to ensure instant UI update
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");

    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API failed", err);
    }
  };

  const storedUser = (() => {
    try {
      const stored = localStorage.getItem("user");
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
