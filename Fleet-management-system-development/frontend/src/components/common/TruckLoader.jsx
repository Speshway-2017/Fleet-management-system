import React from "react";

/**
 * TruckLoader Component
 * Sleek, modern animated vehicle truck loader for fleet management web application.
 */
export default function TruckLoader({ text = "Loading Fleet Data...", fullScreen = false, size = "md" }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md"
    : "w-full py-16 flex flex-col items-center justify-center";

  const scaleClass = size === "sm" ? "scale-75" : size === "lg" ? "scale-125" : "scale-100";

  return (
    <div className={containerClasses}>
      <div className={`relative flex flex-col items-center justify-center ${scaleClass}`}>
        {/* Animated Background Glow */}
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/10 via-[#A14000]/15 to-orange-500/10 rounded-full blur-xl animate-pulse" />

        {/* Truck & Road Container */}
        <div className="relative w-48 h-24 flex flex-col items-center justify-end overflow-hidden">
          {/* Animated Truck Vector */}
          <div className="relative z-10 animate-bounce transition-all duration-300" style={{ animationDuration: '1.2s' }}>
            <svg
              width="80"
              height="48"
              viewBox="0 0 100 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              {/* Truck Cabin & Cargo Body */}
              <path
                d="M10 20C10 16.6863 12.6863 14 16 14H60V42H10V20Z"
                fill="#A14000"
              />
              <path
                d="M60 22H75C77.2091 22 79.227 22.8954 80.6863 24.3547L88.6464 32.3148C89.5108 33.1792 90 34.3512 90 35.572V42H60V22Z"
                fill="#0B1B3D"
              />
              {/* Windshield */}
              <path
                d="M64 25H73L81 33H64V25Z"
                fill="#38BDF8"
                fillOpacity="0.85"
              />
              {/* Headlight Beam Effect */}
              <polygon
                points="88,36 98,34 98,40 88,38"
                fill="#FBBF24"
                className="animate-pulse"
              />
              {/* Side Accent Stripe */}
              <rect x="14" y="28" width="40" height="3" rx="1.5" fill="#A14000" />

              {/* Rear Wheel Container */}
              <g className="animate-spin" style={{ transformOrigin: "26px 44px", animationDuration: "0.8s" }}>
                <circle cx="26" cy="44" r="8" fill="#1E293B" />
                <circle cx="26" cy="44" r="4" fill="#94A3B8" />
                <line x1="26" y1="36" x2="26" y2="52" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="18" y1="44" x2="34" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
              </g>

              {/* Front Wheel Container */}
              <g className="animate-spin" style={{ transformOrigin: "74px 44px", animationDuration: "0.8s" }}>
                <circle cx="74" cy="44" r="8" fill="#1E293B" />
                <circle cx="74" cy="44" r="4" fill="#94A3B8" />
                <line x1="74" y1="36" x2="74" y2="52" stroke="#FFFFFF" strokeWidth="1.5" />
                <line x1="66" y1="44" x2="82" y2="44" stroke="#FFFFFF" strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* Animated Road Lines */}
          <div className="w-full h-1.5 bg-slate-200 rounded-full relative overflow-hidden mt-1">
            <div className="absolute inset-0 flex gap-4 animate-[slideRoad_0.6s_linear_infinite]">
              <div className="w-6 h-full bg-[#A14000] rounded-full" />
              <div className="w-6 h-full bg-[#A14000] rounded-full" />
              <div className="w-6 h-full bg-[#A14000] rounded-full" />
              <div className="w-6 h-full bg-[#A14000] rounded-full" />
              <div className="w-6 h-full bg-[#A14000] rounded-full" />
            </div>
          </div>
        </div>

        {/* Loading Label */}
        {text && (
          <p className="mt-4 text-xs sm:text-sm font-bold tracking-wider text-[#0B1B3D] uppercase animate-pulse">
            {text}
          </p>
        )}
      </div>

      <style>{`
        @keyframes slideRoad {
          0% { transform: translateX(0); }
          100% { transform: translateX(-24px); }
        }
      `}</style>
    </div>
  );
}
