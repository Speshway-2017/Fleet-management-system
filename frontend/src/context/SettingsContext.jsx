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
    footerDescription: "Next-generation intelligent fleet management platform. Streamlining nationwide transport operations, vehicle tracking, driver allocation, and logistics workflows with enterprise-grade reliability.",
    contactPhone: "+91 1800 200 4567",
    contactEmail: "support@fleetmanagement.io",
    contactAddress: "Logistics Hub Tower, Tech City, Bengaluru 560001, Karnataka, India",
    facebookUrl: "https://facebook.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://twitter.com",
    youtubeUrl: "https://youtube.com",
  });

  const fetchPlatformSettings = async () => {
    try {
      const response = await axiosClient.get("/public/settings");
      const data = response.data?.data || response.data || {};
      setPlatformSettings({
        platformName: data.platformName || "Fleet Management",
        logoUrl: data.logoUrl || "/logo.png",
        footerDescription: data.footerDescription || "Next-generation intelligent fleet management platform. Streamlining nationwide transport operations, vehicle tracking, driver allocation, and logistics workflows with enterprise-grade reliability.",
        contactPhone: data.contactPhone || "+91 1800 200 4567",
        contactEmail: data.contactEmail || "support@fleetmanagement.io",
        contactAddress: data.contactAddress || "Logistics Hub Tower, Tech City, Bengaluru 560001, Karnataka, India",
        facebookUrl: data.facebookUrl || "https://facebook.com",
        linkedinUrl: data.linkedinUrl || "https://linkedin.com",
        twitterUrl: data.twitterUrl || "https://twitter.com",
        youtubeUrl: data.youtubeUrl || "https://youtube.com",
        ...data
      });
    } catch (error) {
      if (error?.response?.status) {
        console.warn("Failed to fetch public platform settings:", error.response.status);
      }
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
