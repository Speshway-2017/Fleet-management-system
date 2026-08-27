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
      
      const defaults = {
        platformName: "Fleet Management",
        logoUrl: "/logo.png",
        footerDescription: "A next-generation fleet management platform designed to help businesses streamline operations, improve efficiency, and drive growth.",
        contactPhone: "+91 1800 200 4567",
        contactEmail: "support@fleetmanagement.io",
        contactAddress: "Bengaluru, Karnataka, India",
        facebookUrl: "https://facebook.com",
        linkedinUrl: "https://linkedin.com",
        twitterUrl: "https://twitter.com",
        youtubeUrl: "https://youtube.com",
      };

      const cleanData = { ...defaults, ...data };
      Object.keys(defaults).forEach((key) => {
        if (!cleanData[key] || (typeof cleanData[key] === "string" && (cleanData[key].includes("jjj") || cleanData[key].includes("ujjj")))) {
          cleanData[key] = defaults[key];
        }
      });

      setPlatformSettings(cleanData);
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
