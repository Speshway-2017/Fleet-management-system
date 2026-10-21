import React from "react";

/**
 * GoldFrameCard / LayeredCard Component
 * Implements clean dual-stacked background card frames (matching input_file_1.png):
 * - Removes gold frame overlay image completely.
 * - Back Frame Layer 2 (Bottom layer): Rotates +8deg to the right on hover.
 * - Back Frame Layer 1 (Middle layer): Rotates -8deg to the left on hover.
 * - Main Front Card (Top layer): Lifts -16px on hover with deep shadow.
 * - Preserves existing card colors and inner content layout seamlessly.
 */
export default function GoldFrameCard({
  children,
  className = "",
  layer1Color = "#FFDBCC",
  layer2Color = "#E2E8F0"
}) {
  return (
    <div className={`relative group my-1.5 p-1 overflow-visible ${className}`}>
      
      {/* 1. Bottom Stacked Background Frame Layer (Rotates +3.5deg on hover) */}
      <div
        className="absolute top-[-2.5%] left-[2%] right-[2%] bottom-[1%] rounded-2xl pointer-events-none z-0 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:rotate-[3.5deg] group-hover:top-0 group-hover:left-0 group-hover:right-0 group-hover:bottom-0 group-hover:scale-[1.01] shadow-xs border border-slate-200/50"
        style={{
          backgroundColor: layer2Color,
        }}
      />

      {/* 2. Middle Stacked Background Frame Layer (Rotates -3.5deg on hover) */}
      <div
        className="absolute top-[-1.2%] left-[1%] right-[1%] bottom-[0.5%] rounded-2xl pointer-events-none z-10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:rotate-[-3.5deg] group-hover:top-0 group-hover:left-0 group-hover:right-0 group-hover:bottom-0 group-hover:scale-[1.01] shadow-xs border border-[#A14000]/15"
        style={{
          backgroundColor: layer1Color,
        }}
      />

      {/* 3. Main Front Card Container (Lifts -5px on hover with brand color highlight) */}
      <div className="relative z-20 bg-white rounded-2xl overflow-hidden h-full flex flex-col shadow-sm border border-slate-200/80 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-1.5 group-hover:border-[#A14000]/40 group-hover:shadow-lg group-hover:shadow-[#A14000]/8">
        {/* Card Content */}
        <div className="relative z-20 h-full flex flex-col">
          {children}
        </div>
      </div>

    </div>
  );
}


