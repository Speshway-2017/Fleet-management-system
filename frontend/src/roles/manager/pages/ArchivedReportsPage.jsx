import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Search, Filter, Download, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const ALL_REPORTS = [
  { id: 1, name: "Q3 Fuel Efficiency Audit", type: "Financial", format: "PDF", date: "Oct 24, 2023 · 14:30", size: "2.4 MB", generatedBy: "Auto-Schedule", icon: "mdi:file-chart", iconColor: "text-red-500" },
  { id: 2, name: "Weekly Driver Log Sheets", type: "Operational", format: "CSV", date: "Oct 23, 2023 · 09:12", size: "512 KB", generatedBy: "Manual", icon: "mdi:file-table", iconColor: "text-green-500" },
  { id: 3, name: "Annual Compliance Certificate", type: "Compliance", format: "PDF", date: "Oct 20, 2023 · 16:55", size: "1.8 MB", generatedBy: "Auto-Schedule", icon: "mdi:file-shield", iconColor: "text-blue-500" },
  { id: 4, name: "Monthly Maintenance Summary", type: "Operational", format: "PDF", date: "Oct 18, 2023 · 08:00", size: "3.1 MB", generatedBy: "Manual", icon: "mdi:file-cog", iconColor: "text-orange-500" },
  { id: 5, name: "Q3 Driver Safety Report", type: "Safety", format: "PDF", date: "Oct 15, 2023 · 11:30", size: "1.2 MB", generatedBy: "Auto-Schedule", icon: "mdi:file-star", iconColor: "text-purple-500" },
  { id: 6, name: "Toll & FASTag Expense Report", type: "Financial", format: "XLSX", date: "Oct 12, 2023 · 13:00", size: "890 KB", generatedBy: "Manual", icon: "mdi:file-chart", iconColor: "text-red-500" },
  { id: 7, name: "Fleet Uptime Analysis", type: "Operational", format: "PDF", date: "Oct 10, 2023 · 09:45", size: "2.7 MB", generatedBy: "Auto-Schedule", icon: "mdi:file-table", iconColor: "text-green-500" },
  { id: 8, name: "ELD Compliance Audit", type: "Compliance", format: "PDF", date: "Oct 05, 2023 · 17:20", size: "1.5 MB", generatedBy: "Auto-Schedule", icon: "mdi:file-shield", iconColor: "text-blue-500" },
  { id: 9, name: "September Fuel Cost Breakdown", type: "Financial", format: "CSV", date: "Oct 01, 2023 · 10:00", size: "430 KB", generatedBy: "Manual", icon: "mdi:file-chart", iconColor: "text-red-500" },
  { id: 10, name: "Driver Behavior Incidents Log", type: "Safety", format: "PDF", date: "Sep 28, 2023 · 14:00", size: "980 KB", generatedBy: "Manual", icon: "mdi:file-star", iconColor: "text-purple-500" },
  { id: 11, name: "Q2 Fleet Utilization Report", type: "Operational", format: "PDF", date: "Sep 25, 2023 · 09:00", size: "4.2 MB", generatedBy: "Auto-Schedule", icon: "mdi:file-table", iconColor: "text-green-500" },
  { id: 12, name: "Vehicle Insurance Renewals", type: "Compliance", format: "PDF", date: "Sep 20, 2023 · 11:15", size: "760 KB", generatedBy: "Manual", icon: "mdi:file-shield", iconColor: "text-blue-500" },
];

const TYPE_COLORS = {
  Financial: "bg-red-100 text-red-700",
  Operational: "bg-green-100 text-green-700",
  Compliance: "bg-blue-100 text-blue-700",
  Safety: "bg-purple-100 text-purple-700",
};

const PAGE_SIZE = 8;

export default function ArchivedReportsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);

  const types = ["All", "Operational", "Financial", "Compliance", "Safety"];

  const filtered = ALL_REPORTS.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDownload = (name) => toast.success(`${name} download started!`);
  const handleShare = (name) => toast.success(`Share link for "${name}" copied!`);

  return (
    <div className="w-full px-6 md:px-8 py-8 min-h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/manager/reports")}
          className="p-2 bg-white border border-[#E7EAF0] rounded-xl text-[#64748B] hover:bg-gray-50 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-poppins font-black text-2xl text-[#1E293B] tracking-tight">
            Archived Reports
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5 font-nunito">
            All generated reports — download, share or preview any entry
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by report name or type..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#B45A0A] shadow-sm"
          />
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-1 bg-white border border-[#E7EAF0] rounded-xl shadow-sm overflow-hidden">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPage(1); }}
              className={`px-3 py-2.5 text-xs font-bold transition-colors ${
                typeFilter === t ? "bg-[#1E293B] text-white" : "text-[#64748B] hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Export all */}
        <button
          onClick={() => toast.success("Exporting all reports...")}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#B45A0A] text-white rounded-xl text-xs font-bold hover:bg-[#9A4D08] transition-colors shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Export All
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0]">
                {["Report Name", "Type", "Format", "Size", "Generated By", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#94A3B8] text-sm font-medium">
                    No reports found matching your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((report) => (
                  <tr key={report.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Icon icon={report.icon} className={`w-7 h-7 shrink-0 ${report.iconColor}`} />
                        <span className="font-semibold text-sm text-[#1E293B] font-poppins">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${TYPE_COLORS[report.type] || "bg-gray-100 text-gray-600"}`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#64748B] font-medium">{report.format}</td>
                    <td className="px-5 py-4 text-xs text-[#64748B] font-medium">{report.size}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        report.generatedBy === "Auto-Schedule"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {report.generatedBy}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#64748B] whitespace-nowrap">{report.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDownload(report.name)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors"
                          title="Download"
                        >
                          <Icon icon="mdi:download" className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(report.name)}
                          className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors"
                          title="Share"
                        >
                          <Icon icon="mdi:share-variant" className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-[#E7EAF0] flex items-center justify-between bg-white">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing <span className="font-bold text-[#1E293B]">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of {filtered.length} reports
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold border transition-colors ${
                  p === page
                    ? "bg-[#1E293B] text-white border-[#1E293B]"
                    : "border-[#E7EAF0] text-[#64748B] hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
