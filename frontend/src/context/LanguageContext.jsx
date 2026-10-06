import React, { createContext, useContext, useState, useEffect } from "react";
import { LANGUAGE_OPTIONS, applyApplicationLanguage, getLanguageName, getLanguageCode } from "@/utils/languageUtils";

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem("app_language") || "English";
  });

  const setLanguage = (langNameOrCode, reloadIfNecessary = false) => {
    const validName = getLanguageName(langNameOrCode);
    setCurrentLanguage(validName);
    applyApplicationLanguage(validName, reloadIfNecessary);
  };

  useEffect(() => {
    // Initial mount apply language from stored admin preference or default English
    const saved = localStorage.getItem("app_language") || "English";
    applyApplicationLanguage(saved);

    const handleLanguageEvent = (e) => {
      if (e.detail?.language) {
        setCurrentLanguage(e.detail.language);
      }
    };

    window.addEventListener("app:language-changed", handleLanguageEvent);
    return () => {
      window.removeEventListener("app:language-changed", handleLanguageEvent);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, languageOptions: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  );
}
