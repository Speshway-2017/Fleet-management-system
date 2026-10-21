import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Icon } from "@iconify/react";
import StatCardSkeleton from "@/components/common/StatCardSkeleton";

export default function KPICard({
  title,
  value,
  loading = false,
  subtitle = "VS last week",
  icon,
  trendText,
  isTrendUp = true,
  statusType, // "positive" | "negative" | "warning" | "neutral"
  trendColor,
  onClick,
  className = ""
}) {
  if (loading) {
    return <StatCardSkeleton className={className} />;
  }

  const isLoading = value === null || value === undefined;
  const isZero = value === 0 || value === "0" || value === "0.00" || value === "₹0" || value === "—";

  const strValue = (!isLoading && value !== "—") ? String(value).trim() : "—";

  const resolvedStatus = statusType || (isZero ? "neutral" : isTrendUp ? "positive" : "negative");

  const getBadgeStyle = () => {
    if (trendColor) return trendColor;
    switch (resolvedStatus) {
      case "positive":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200/70";
      case "negative":
        return "bg-rose-50 text-rose-600 border border-rose-200/70";
      case "warning":
        return "bg-amber-50 text-amber-600 border border-amber-200/70";
      case "neutral":
      default:
        return "bg-slate-100 text-slate-500 border border-slate-200/60";
    }
  };

  const renderIcon = () => {
    if (!icon) return null;
    const iconColor = isZero ? "text-slate-400" : "text-[#A14000]";
    if (typeof icon === "string") {
      return <Icon icon={icon} className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${iconColor}`} />;
    }
    return <span className={`w-4 h-4 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconColor}`}>{icon}</span>;
  };

  return (
    <div
      data-dash-kpi
      onClick={onClick}
      className={`group bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200/80 dark:border-[#242E42] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full min-h-[128px] overflow-hidden transition-all duration-250 ease-out hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Top Row: Icon + Title */}
      <div className="flex items-center gap-2 mb-2 select-none min-w-0 overflow-hidden">
        {renderIcon()}
        <span className="text-[13px] sm:text-[14px] md:text-[15px] font-semibold text-slate-700 dark:text-slate-200 font-poppins truncate min-w-0" title={title}>
          {title}
        </span>
      </div>

      {/* Middle Row: Large Prominent KPI Value + Positive/Negative Trend Badge */}
      <div className="flex flex-wrap sm:flex-nowrap items-baseline justify-between gap-x-2 gap-y-1 my-1 min-w-0 overflow-hidden">
        {isLoading ? (
          <span className="inline-block w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse my-0.5" />
        ) : (
          <span
            className={`font-extrabold font-poppins tracking-tight leading-none truncate min-w-0 max-w-full ${
              strValue.length > 12
                ? "text-[16px] sm:text-[18px] lg:text-[20px]"
                : strValue.length > 8
                ? "text-[19px] sm:text-[21px] lg:text-[23px]"
                : strValue.length > 5
                ? "text-[22px] sm:text-[25px] lg:text-[28px]"
                : "text-[25px] sm:text-[28px] lg:text-[30px]"
            } ${isZero ? "text-slate-400" : "text-[#0D1B2A] dark:text-white"}`}
            title={strValue}
          >
            {strValue}
          </span>
        )}

        {trendText && !isLoading ? (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-poppins inline-flex items-center gap-0.5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${getBadgeStyle()}`}>
            {isTrendUp ? <ArrowUpRight className="w-3 h-3 shrink-0" /> : <ArrowDownRight className="w-3 h-3 shrink-0" />}
            {trendText}
          </span>
        ) : null}
      </div>

      {/* Bottom Row: Subtitle label */}
      <div className="text-xs text-slate-400 font-poppins mt-1 truncate min-w-0" title={subtitle}>
        {subtitle}
      </div>
    </div>
  );
}
