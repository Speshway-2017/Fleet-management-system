import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";

const SettingsContext = createContext();

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: "Fleet Management",
    logoUrl: "/logo.png",
  });

  const fetchPlatformSettings = async () => {
    try {
      const response = await axiosClient.get("/public/settings");
      const data = response.data?.data || response.data || {};
      setPlatformSettings({
        platformName: data.platformName || "Fleet Management",
        logoUrl: data.logoUrl || "/logo.png",
      });
    } catch (error) {
      if (error?.response?.status) {
        console.warn("Failed to fetch public platform settings:", error.response.status);
      }
      setPlatformSettings((prev) => ({
        ...prev,
        platformName: prev.platformName || "Fleet Management",
        logoUrl: prev.logoUrl || "/logo.png",
      }));
    }
  };

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ platformSettings, fetchPlatformSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
