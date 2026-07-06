import { ArrowUpRight } from "lucide-react";

export default function KPICard({ title, value, subtitle, icon, iconBg, trendText, trendColor, isTrendUp }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-36 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-auto">
        {trendText && (
          <>
            <span className={`text-[11px] font-bold flex items-center gap-0.5 ${trendColor}`}>
              {isTrendUp ? <ArrowUpRight className="w-3 h-3" /> : null}
              {trendText}
            </span>
            <span className="text-[11px] text-slate-400">{subtitle}</span>
          </>
        )}
        {!trendText && subtitle && (
          <span className="text-[11px] text-slate-400">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
