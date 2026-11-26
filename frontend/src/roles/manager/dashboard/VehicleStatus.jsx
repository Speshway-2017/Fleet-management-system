import { useState, useEffect } from "react";
import { CircleDot } from "lucide-react";

export default function VehicleStatus({ total = 450, active = 380, repair = 15 }) {
  // Count real vehicle states
  const totalCount = total;
  const activeCount = active;
  const repairCount = repair;
  const idleCount = totalCount - activeCount - repairCount;

  // Percentages computation
  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const repairPercent = totalCount > 0 ? Math.round((repairCount / totalCount) * 100) : 0;
  const idlePercent = totalCount > 0 ? Math.round((idleCount / totalCount) * 100) : 0;

  // SVG dimensions
  const r = 50;
  const c = 2 * Math.PI * r; // Circumference = ~314.16

  // Animated dashes on mount
  const [animatedActive, setAnimatedActive] = useState(0);
  const [animatedRepair, setAnimatedRepair] = useState(0);
  const [animatedIdle, setAnimatedIdle] = useState(0);

  useEffect(() => {
    // Delay animation to make it noticeable on mount
    const timer = setTimeout(() => {
      setAnimatedActive((activePercent / 100) * c);
      setAnimatedRepair((repairPercent / 100) * c);
      setAnimatedIdle((idlePercent / 100) * c);
    }, 150);
    return () => clearTimeout(timer);
  }, [activePercent, repairPercent, idlePercent]);

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Title */}
      <div className="flex items-center gap-2.5 shrink-0">
        <svg className="w-5 h-5 text-[#853400]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">
          Vehicle Status
        </h3>
      </div>

      {/* SVG Donut (Segmented style matching reference) */}
      <div className="relative flex items-center justify-center my-6 shrink-0" style={{ height: "160px" }}>
        <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90 select-none">
          {/* Background circle track (Light Blue/Grey) */}
          <circle cx="60" cy="60" r={r} fill="transparent" stroke="#EBF3FF" strokeWidth="12" />

          {/* Segmented Active arcs (Orange/Brown) */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="transparent"
            stroke="#853400"
            strokeWidth="12"
            strokeDasharray="40 10 40 10 40 10 40 10"
            strokeDashoffset="15"
            className="transition-all duration-1000 ease-out"
          />

          {/* Segmented Idle ticks (Black) */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="transparent"
            stroke="#1B2430"
            strokeWidth="12"
            strokeDasharray="5 73.5 5 73.5 5 73.5 5 73.5"
            strokeDashoffset="5"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center font-poppins select-none leading-none">
          <span className="text-3xl font-bold text-[#1B2430]">{totalCount || 450}</span>
          <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mt-1.5">TOTAL</span>
        </div>
      </div>

      {/* Horizontal Legend Row (separated by vertical thin lines) */}
      <div className="flex justify-between items-center w-full text-center text-xs font-nunito border-t border-gray-100 pt-4 mt-auto">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-[#6B7280] font-bold tracking-wider uppercase mb-1">ACTIVE</span>
          <span className="font-poppins font-bold text-sm text-[#853400]">{activeCount}</span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-[#6B7280] font-bold tracking-wider uppercase mb-1">IDLE</span>
          <span className="font-poppins font-bold text-sm text-[#1B2430]">{idleCount}</span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-[#6B7280] font-bold tracking-wider uppercase mb-1">OFFLINE</span>
          <span className="font-poppins font-bold text-sm text-[#DC2626]">{repairCount}</span>
        </div>
      </div>
    </div>
  );
}
