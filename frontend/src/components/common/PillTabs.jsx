import React from "react";

export default function PillTabs({ tabs = [], activeTab, onChange, className = "" }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 dark:bg-slate-800/80 dark:border-slate-700/60 ${className}`}>
      {tabs.map((tab) => {
        const id = typeof tab === "object" ? tab.id : tab;
        const label = typeof tab === "object" ? tab.label : tab;
        const count = typeof tab === "object" ? tab.count : null;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`px-3.5 py-1.5 text-xs font-bold font-poppins rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${isActive
                ? "bg-white text-[#0D1B2A] shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/40 dark:text-slate-400 dark:hover:text-white"
              }`}
          >
            <span>{label}</span>
            {count !== null && count !== undefined && (
              <span
                className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-md ${isActive
                    ? "bg-[#A14000]/10 text-[#A14000]"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
