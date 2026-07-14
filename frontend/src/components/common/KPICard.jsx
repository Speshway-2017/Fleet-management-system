import { ArrowUpRight } from "lucide-react";

export default function KPICard({ title, value, subtitle, icon, iconBg, trendText, trendColor, isTrendUp }) {
  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="overflow-hidden">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate" title={title}>{title}</p>
          <h3 className="text-xl font-extrabold text-slate-800 truncate" title={value}>{value}</h3>
        </div>
        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-auto">
        {trendText && (
          <>
            <span className={`text-[9px] font-bold flex items-center gap-0.5 ${trendColor}`}>
              {isTrendUp ? <ArrowUpRight className="w-2.5 h-2.5" /> : null}
              {trendText}
            </span>
            <span className="text-[9px] text-slate-400 truncate" title={subtitle}>{subtitle}</span>
          </>
        )}
        {!trendText && subtitle && (
          <span className="text-[9px] text-slate-400 truncate" title={subtitle}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}
