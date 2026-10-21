import React from "react";

export default function DashboardCard({ title, value, icon: Icon, color = "orange", darkTheme = false }) {
  // Define border accent colors
  const borderColors = {
    orange: "border-[#A14000]",
    red: "border-[#DC2626]",
    green: "border-[#16A34A]",
    warning: "border-[#F59E0B]",
  };

  const iconColors = {
    orange: "text-[#A14000]",
    red: "text-[#DC2626]",
    green: "text-[#16A34A]",
    warning: "text-[#F59E0B]",
    dark: "text-slate-400"
  };

  const borderClass = borderColors[color] || borderColors.orange;
  const iconColorClass = color === "dark" ? iconColors.dark : (iconColors[color] || iconColors.orange);

  if (darkTheme) {
    return (
      <div className="bg-[#0D0D0D] text-white px-3 py-4 xl:px-4 xl:py-4.5 2xl:px-5 2xl:py-5 rounded-2xl flex flex-col justify-between hover-card-trigger shadow-sm select-none border border-gray-900 cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-orange-500/10 hover:border-[#A14000]/40">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-poppins font-semibold">
          {title}
        </span>
        <div className="flex items-end justify-between gap-1 mt-3">
          <span className="text-xl xl:text-2xl 2xl:text-3xl font-poppins font-medium text-white leading-none whitespace-nowrap">
            {value}
          </span>
          {Icon && (
            <div className={`${iconColorClass} shrink-0 pb-0.5 transition-transform duration-350 group-hover:scale-110 group-hover:rotate-3`}>
              <Icon className="w-5.5 h-5.5 xl:w-6.5 xl:h-6.5 2xl:w-8 2xl:h-8 shrink-0" strokeWidth={1.8} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-l-[5px] ${borderClass} px-3 py-4 xl:px-4 xl:py-4.5 2xl:px-5 2xl:py-5 rounded-2xl flex flex-col justify-between hover-card-trigger shadow-sm select-none cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-gray-200/80`}>
      <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-poppins font-semibold">
        {title}
      </span>
      <div className="flex items-end justify-between gap-1 mt-3">
        <span className="text-xl xl:text-2xl 2xl:text-3xl font-poppins font-medium text-[#1B2430] leading-none whitespace-nowrap">
          {value}
        </span>
        {Icon && (
          <div className={`${iconColorClass} shrink-0 pb-0.5 transition-transform duration-350 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="w-5.5 h-5.5 xl:w-6.5 xl:h-6.5 2xl:w-8 2xl:h-8 shrink-0" strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}
