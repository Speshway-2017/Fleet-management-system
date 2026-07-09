import { createContext, useContext, useState } from "react";
import { authApi } from "@/api/authApi";

const AuthContext = createContext(null);

/**
 * Normalise backend role values to the short form used by frontend route guards.
 *   SUPER_ADMIN   → "admin"
 *   FLEET_MANAGER → "manager"
 * Any other value is returned as-is so future roles don't hard-crash.
 */
function normaliseRole(backendRole) {
  const map = {
    SUPER_ADMIN: "admin",
    FLEET_MANAGER: "manager",
  };
  return map[backendRole] ?? backendRole?.toLowerCase() ?? null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  /**
   * Login — calls POST /api/auth/login, stores token + normalised user.
   * Returns the normalised user object so callers can redirect by role.
   * Throws on failure so the login page can display the error.
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      // Backend wraps data: { success, data: { token, user } }
      const { token, user: backendUser } = response.data.data;

      // Normalise the role so route guards work without changes
      const normalisedUser = {
        ...backendUser,
        role: normaliseRole(backendUser.role),
      };

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(normalisedUser));
      setUser(normalisedUser);
      return normalisedUser;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout — clears session storage and resets state.
   * Also notifies the backend (fire-and-forget, no await needed).
   */
  const logout = () => {
    authApi.logout().catch(() => {}); // fire-and-forget
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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
