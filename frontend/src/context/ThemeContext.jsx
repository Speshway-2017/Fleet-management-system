import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

const isPublicPath = (pathname = window.location.pathname) => {
  const publicRoutes = ["/login", "/register", "/forgot-password", "/otp-verification", "/reset-password", "/unauthorized"];
  if (pathname === "/") return true;
  return publicRoutes.some(route => pathname.startsWith(route));
};

const getUserThemeKey = () => {
  try {
    const rawUser = localStorage.getItem("user") || localStorage.getItem("fleet_user");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      const uid = u._id || u.id || u.email;
      const role = u.role || u.userType || "user";
      if (uid) return `fleet_theme_${role}_${uid}`;
    }
  } catch (e) {
    // fallback
  }
  return "fleet_theme_guest";
};

export function ThemeProvider({ children }) {
  const [theme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
  }, []);

  const toggleTheme = () => {};
  const setTheme = () => {};

  return (
    <ThemeContext.Provider value={{ theme: "light", isDark: false, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
