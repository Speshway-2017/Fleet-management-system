import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import {
  Download,
  Share2,
  FileText,
  FileSpreadsheet,
  ShieldCheck,
  Truck,
  Archive,
  Clock,
  Plus,
  X,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";

const ARCHIVED_REPORTS = [
  { name: "Q2 Fleet Performance Report", type: "Operational", format: "PDF", date: "Sep 15, 2023 · 10:00", icon: FileText, iconColor: "text-[#B45A0A]" },
  { name: "Annual Fuel Audit 2022", type: "Financial", format: "PDF", date: "Jan 5, 2023 · 09:00", icon: FileText, iconColor: "text-red-500" },
  { name: "H1 Driver Safety Compliance", type: "Safety", format: "PDF", date: "Jul 1, 2023 · 14:00", icon: ShieldCheck, iconColor: "text-blue-500" },
  { name: "March Maintenance Summary", type: "Operational", format: "CSV", date: "Apr 1, 2023 · 11:30", icon: FileSpreadsheet, iconColor: "text-green-500" },
  { name: "Q1 Toll & FASTag Report", type: "Financial", format: "PDF", date: "Apr 10, 2023 · 16:00", icon: FileText, iconColor: "text-purple-500" },
];

const SCHEDULED_DELIVERIES = [
  { name: "Weekly Fleet Status Report", frequency: "Every Monday, 08:00 AM", recipient: "manager@fleet.com", format: "PDF", status: "Active" },
  { name: "Monthly Fuel Efficiency Report", frequency: "1st of every month", recipient: "ops@fleet.com", format: "CSV", status: "Active" },
  { name: "Daily Driver Log Summary", frequency: "Daily, 06:00 PM", recipient: "manager@fleet.com", format: "PDF", status: "Paused" },
];

const REPORT_CATEGORIES = [
  { title: "Operational", description: "Fleet uptime, usage, mileage", icon: Truck },
  { title: "Financial", description: "Expenses, ROI, fuel costs", icon: FileText },
  { title: "Compliance", description: "ELD, audits, legal permits", icon: ShieldCheck },
  { title: "Safety", description: "Incidents, driver behavior", icon: ShieldCheck },
];

const RECENT_REPORTS = [
  { name: "Q3 Fuel Efficiency Audit", type: "Financial", format: "PDF", date: "Oct 24, 2023 · 14:30", icon: FileText, iconColor: "text-red-500" },
  { name: "Weekly Driver Log Sheets", type: "Operational", format: "CSV", date: "Oct 23, 2023 · 09:12", icon: FileSpreadsheet, iconColor: "text-green-500" },
  { name: "Annual Compliance Certificate", type: "Compliance", format: "PDF", date: "Oct 20, 2023 · 16:55", icon: ShieldCheck, iconColor: "text-blue-500" },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [showArchivedModal, setShowArchivedModal] = useState(false);
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);

  const handleDownload = (name) => toast.success(`${name} download started!`);
  const handleShare = (name) => toast.success(`${name} share link copied!`);

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#F5F7FB] min-h-full font-nunito text-[#1E293B]">
      <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">Reports Center</h1>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border-l-4 border-l-[#1E293B] border border-[#E7EAF0] shadow-sm p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-xs font-bold font-poppins mb-2">Total Reports Generated</p>
              <p className="text-5xl font-black text-[#1E293B] mb-2 font-poppins">1,284</p>
              <p className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                <Icon icon="mdi:trending-up" className="w-4 h-4" /> +12% this month
              </p>
            </div>
            <div className="w-14 h-14 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#64748B]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-l-[#B45A0A] border border-[#E7EAF0] shadow-sm p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-xs font-bold font-poppins mb-2">Pending Schedules</p>
              <p className="text-5xl font-black text-[#1E293B] mb-2 font-poppins">24</p>
              <p className="text-[#B45A0A] text-sm font-semibold flex items-center gap-1">
                <Icon icon="mdi:clock-outline" className="w-4 h-4" /> Next delivery in 2h
              </p>
            </div>
            <div className="w-14 h-14 bg-[#FDF3EC] border border-orange-100 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:calendar-check" className="w-7 h-7 text-[#B45A0A]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Report Categories + Custom Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
            <h3 className="font-poppins font-black text-lg text-[#1E293B] mb-5">Report Categories</h3>
            <div className="space-y-3">
              {REPORT_CATEGORIES.map((cat, i) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={i}
                    onClick={() => toast.success(`Opening ${cat.title} reports...`)}
                    className="w-full p-4 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl text-left hover:bg-[#FDF3EC] hover:border-[#B45A0A]/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-[#E7EAF0] rounded-lg group-hover:bg-[#FDF3EC] group-hover:border-[#B45A0A]/20 transition-colors">
                        <CatIcon className="w-5 h-5 text-[#64748B] group-hover:text-[#B45A0A]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1E293B] text-sm font-poppins">{cat.title}</p>
                        <p className="text-xs text-[#64748B]">{cat.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Report Card */}
          <div className="bg-[#0F172A] rounded-2xl p-8 shadow-sm overflow-hidden relative">
            <Icon icon="mdi:wrench" className="absolute top-4 right-4 w-32 h-32 text-white/5" />
            <h3 className="text-xl font-black text-white mb-3 font-poppins relative z-10">Build Custom Insight</h3>
            <p className="text-[#94A3B8] text-sm mb-5 relative z-10 leading-relaxed">
              Combine over 150+ data points to create unique reports tailored to your fleet's needs.
            </p>
            <button
              onClick={() => toast.success("Custom report builder coming soon!")}
              className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer relative z-10"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right — Recent Reports + Scheduled */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reports Table */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Recent Reports</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success("All reports exported!")}
                  className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export All
                </button>
                <button
                  onClick={() => toast.success("Reports refreshed!")}
                  className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-colors cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider">
                    <th className="text-left px-6 py-4">Report Name</th>
                    <th className="text-left px-6 py-4">Type</th>
                    <th className="text-left px-6 py-4">Format</th>
                    <th className="text-left px-6 py-4">Generated Date</th>
                    <th className="text-left px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {RECENT_REPORTS.map((report, i) => {
                    const RIcon = report.icon;
                    return (
                      <tr key={i} className="hover:bg-[#F5F7FB]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#FDF3EC] rounded-lg">
                              <RIcon className={`w-5 h-5 ${report.iconColor}`} />
                            </div>
                            <span className="font-semibold text-[#1E293B] text-sm">{report.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-[#FDF3EC] text-[#B45A0A] border border-orange-100 rounded-full text-[10px] font-bold uppercase tracking-wide">
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-[#64748B] font-medium">{report.format}</td>
                        <td className="px-6 py-4 text-xs text-[#64748B]">{report.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(report.name)}
                              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleShare(report.name)}
                              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors cursor-pointer"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#E7EAF0] bg-[#F5F7FB] text-center">
              <button
                onClick={() => setShowArchivedModal(true)}
                className="text-[#B45A0A] text-sm font-bold hover:underline cursor-pointer"
              >
                View All Archived Reports
              </button>
            </div>
          </div>

          {/* Scheduled Deliveries */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#FDF3EC] rounded-xl">
                <Clock className="w-5 h-5 text-[#B45A0A]" />
              </div>
              <p className="font-poppins font-black text-lg text-[#1E293B]">Scheduled Deliveries</p>
            </div>
            <button
              onClick={() => setShowSchedulesModal(true)}
              className="px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-colors cursor-pointer flex items-center gap-2"
            >
              Manage Schedules
              <Icon icon="mdi:cog-outline" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Archived Reports Modal */}
      {showArchivedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
              <h3 className="font-poppins font-black text-lg text-[#1E293B] flex items-center gap-2">
                <Archive className="w-5 h-5 text-[#B45A0A]" />
                Archived Reports
              </h3>
              <button onClick={() => setShowArchivedModal(false)} className="p-2 hover:bg-[#F5F7FB] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider">
                    <th className="text-left px-4 py-3">Report Name</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Format</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {ARCHIVED_REPORTS.map((r, i) => {
                    const RIcon = r.icon;
                    return (
                      <tr key={i} className="hover:bg-[#F5F7FB]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <RIcon className={`w-5 h-5 ${r.iconColor}`} />
                            <span className="font-medium text-[#1E293B] text-sm">{r.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-[#FDF3EC] text-[#B45A0A] rounded-full text-[10px] font-bold">{r.type}</span>
                        </td>
                        <td className="px-4 py-3 text-[#64748B] text-xs">{r.format}</td>
                        <td className="px-4 py-3 text-[#64748B] text-xs">{r.date}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toast.success(`Downloading ${r.name}...`)}
                            className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manage Schedules Modal */}
      {showSchedulesModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
              <h3 className="font-poppins font-black text-lg text-[#1E293B] flex items-center gap-2">
                <Icon icon="mdi:calendar-clock" className="w-5 h-5 text-[#B45A0A]" />
                Manage Report Schedules
              </h3>
              <button onClick={() => setShowSchedulesModal(false)} className="p-2 hover:bg-[#F5F7FB] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="space-y-3">
              {SCHEDULED_DELIVERIES.map((s, i) => (
                <div key={i} className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E7EAF0] flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-[#1E293B] text-sm font-poppins">{s.name}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{s.frequency} · {s.recipient}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    s.status === "Active"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-gray-100 text-[#64748B] border border-gray-200"
                  }`}>
                    {s.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toast.success(`${s.status === "Active" ? "Paused" : "Activated"}: ${s.name}`)}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-[#E7EAF0] rounded-lg hover:bg-[#F5F7FB] text-[#64748B] hover:text-[#1E293B] cursor-pointer"
                    >
                      {s.status === "Active" ? "Pause" : "Activate"}
                    </button>
                    <button
                      onClick={() => toast.success(`Deleted schedule: ${s.name}`)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-[#E7EAF0]">
              <button
                onClick={() => toast.success("New schedule creation coming soon!")}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md shadow-[#B45A0A]/20"
              >
                <Plus className="w-4 h-4" />
                Add New Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
