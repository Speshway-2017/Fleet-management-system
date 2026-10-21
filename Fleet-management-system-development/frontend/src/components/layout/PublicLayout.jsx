import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import LandingHeader from "./LandingHeader";
import LandingFooter from "./LandingFooter";

export default function PublicLayout() {
  const location = useLocation();
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setShouldReduceMotion(mediaQuery.matches);

    const handleChange = (e) => setShouldReduceMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-[#A14000] selection:text-white">
      {/* Persistent, stable header locked at top across all public routes */}
      <LandingHeader />

      {/* Clean SPA route content container */}
      <div className="flex-1 flex flex-col relative w-full">
        <main className="flex-1 flex flex-col w-full">
          <Outlet />
        </main>
      </div>

      {/* Persistent, stable footer across all public routes */}
      <LandingFooter />
    </div>
  );
}
