export default function SummaryCard({ title, value, subtitle, icon: Icon, color = "amber", trend }) {
  const colorMap = {
    amber: "bg-amber-50 text-[#A14000] border-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const selectedColor = colorMap[color] || colorMap.amber;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/90 relative overflow-hidden shadow-sm hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold font-poppins text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-black font-poppins text-slate-900 mt-1 truncate whitespace-nowrap" title={String(value)}>{value}</h3>
          {subtitle && <p className="text-xs font-nunito text-slate-500 mt-1 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border shrink-0 ${selectedColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-nunito text-slate-500">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
