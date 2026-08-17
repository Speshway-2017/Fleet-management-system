import React from "react";

export default function StatCardSkeleton({ className = "" }) {
  return (
    <div
      className={`bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-[#242E42] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between select-none animate-pulse ${className}`}
    >
      {/* Top Row: Icon + Title */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 shrink-0" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="w-3.5 h-3.5 bg-slate-100 dark:bg-slate-800 rounded shrink-0" />
      </div>

      {/* Middle Row: Large Value + Trend Badge */}
      <div className="flex items-center gap-2 my-1.5 flex-wrap">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded-full shrink-0" />
      </div>

      {/* Bottom Row: Subtitle label */}
      <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded mt-1" />
    </div>
  );
}
