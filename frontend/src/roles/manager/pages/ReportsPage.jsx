import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSchedulesModal, setShowSchedulesModal] = useState(false);
  const [schedules, setSchedules] = useState([]);

  const fetchSchedules = async () => {
    try {
      const response = await managerApi.getReports();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        setSchedules(result.map(s => ({
          id: s._id,
          name: s.name,
          freq: `${s.frequency} (${s.day} ${s.time})`,
          email: s.recipients,
          active: s.status === "Active"
        })));
      }
    } catch (error) {
      console.error("Failed to load schedules from database", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const toggleSchedule = async (id) => {
    const matched = schedules.find(s => s.id === id);
    if (!matched) return;
    const nextActive = !matched.active;
    const nextStatus = nextActive ? "Active" : "Paused";
    try {
      await managerApi.updateReport(id, { status: nextStatus });
      toast.success(`${matched.name} delivery has been ${nextActive ? 'activated' : 'paused'}!`);
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    }
  };

  const archivedReports = [
    { name: "Q2 Fuel Efficiency Audit", type: "Financial", format: "PDF", date: "Jul 15, 2023", icon: "mdi:file-chart", iconColor: "text-red-500" },
    { name: "Weekly Driver Log Sheets - Week 25", type: "Operational", format: "CSV", date: "Jun 28, 2023", icon: "mdi:file-table", iconColor: "text-green-500" },
    { name: "Q1 Compliance Health Audit", type: "Compliance", format: "PDF", date: "Apr 10, 2023", icon: "mdi:file-shield", iconColor: "text-blue-500" },
    { name: "Annual Fleet Performance Review 2022", type: "Operational", format: "PDF", date: "Dec 18, 2022", icon: "mdi:file-chart", iconColor: "text-red-500" },
    { name: "State Boundary Permit Renewals Q4", type: "Compliance", format: "PDF", date: "Nov 04, 2022", icon: "mdi:file-shield", iconColor: "text-blue-500" }
  ];

  const filteredArchives = archivedReports.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const reportCategories = [
    { title: "Operational", description: "Fleet uptime, usage, mileage", icon: "mdi:truck-fast" },
    { title: "Financial",   description: "Expenses, ROI, fuel costs",    icon: "mdi:currency-usd" },
    { title: "Compliance",  description: "ELD, audits, legal permits",   icon: "mdi:shield-check" },
    { title: "Safety",      description: "Incidents, driver behavior",   icon: "mdi:shield-star" },
  ];

  const recentReports = [
    { name: "Q3 Fuel Efficiency Audit",      type: "Financial",   format: "PDF", date: "Oct 24, 2023 · 14:30", icon: "mdi:file-chart",  iconColor: "text-red-500"  },
    { name: "Weekly Driver Log Sheets",      type: "Operational", format: "CSV", date: "Oct 23, 2023 · 09:12", icon: "mdi:file-table",  iconColor: "text-green-500" },
    { name: "Annual Compliance Certificate", type: "Compliance",  format: "PDF", date: "Oct 20, 2023 · 16:55", icon: "mdi:file-shield", iconColor: "text-blue-500"  },
  ];

  const handleDownload = (name) => toast.success(`${name} download started!`);
  const handleShare    = (name) => toast.success(`Share link for "${name}" copied!`);
  const handleExportAll = ()    => toast.success("Exporting all recent reports...");
  const handleRefresh   = ()    => toast.success("Reports refreshed!");
  const handleCategory  = (cat) => toast.success(`Filtering by ${cat} reports`);
  const handleCustomInsight = () => toast.success("Custom insight builder coming soon!");

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      <h1 className="font-poppins font-bold text-2xl text-[#1E293B] leading-none mb-6">Reports Center</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-[20px] border-l-4 border-gray-900 shadow-sm border border-gray-200/80 p-5 animate-fade-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">Total Reports Generated</p>
              <p className="text-3xl font-black text-gray-800 mt-2 mb-1.5 font-poppins">1,284</p>
              <p className="text-green-600 text-xs font-semibold flex items-center gap-1 font-poppins">
                <Icon icon="mdi:trending-up" /> +12% this month
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon="mdi:file-document-multiple" className="w-6 h-6 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border-l-4 border-amber-700 shadow-sm border border-gray-200/80 p-5 animate-fade-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold">Pending Schedules</p>
              <p className="text-3xl font-black text-gray-800 mt-2 mb-1.5 font-poppins">24</p>
              <p className="text-amber-700 text-xs font-semibold flex items-center gap-1 font-poppins">
                <Icon icon="mdi:clock-outline" /> Next delivery in 2h
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon icon="mdi:calendar-check" className="w-6 h-6 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1">
          {/* Report Categories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h3 className="text-base font-bold text-gray-800 mb-6 font-poppins">Report Categories</h3>
            <div className="space-y-3">
              {reportCategories.map((cat, i) => (
                <button
                  key={i}
                  onClick={() => handleCategory(cat.title)}
                  className="w-full p-4 bg-amber-100 rounded-xl text-left hover:bg-amber-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon icon={cat.icon} className="w-7 h-7 text-gray-700" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{cat.title}</p>
                      <p className="text-[11px] text-gray-500">{cat.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Build Custom Insight removed */}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reports table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800 font-poppins">Recent Reports</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAll}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export All
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-sm font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                    <th className="py-4 px-6 text-left whitespace-nowrap">Report Name</th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">Type</th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">Format</th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">Generated Date</th>
                    <th className="py-4 px-6 text-left whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]/60">
                  {recentReports.map((report, i) => (
                    <tr key={i} className="hover:bg-[#F5F7FB]/50 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Icon icon={report.icon} className={`w-8 h-8 ${report.iconColor}`} />
                          <span className="font-bold text-[#1E293B] text-xs">{report.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold inline-block">{report.type}</span>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="text-[#64748B] text-xs">{report.format}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <p className="text-[#64748B] text-xs">{report.date}</p>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDownload(report.name)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                            <Icon icon="mdi:download" className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleShare(report.name)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                            <Icon icon="mdi:share-variant" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* View All Archived link */}
            <div className="p-4 border-t border-gray-200 bg-amber-50 text-center">
              <button 
                onClick={() => setShowArchiveModal(true)}
                className="text-amber-700 text-xs font-medium hover:underline cursor-pointer"
              >
                View All Archived Reports
              </button>
            </div>
          </div>

          {/* Scheduled Deliveries */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:clock-outline" className="w-7 h-7 text-amber-700" />
              <p className="text-base font-bold text-gray-800 font-poppins">Scheduled Deliveries</p>
            </div>
            <button 
              onClick={() => setShowSchedulesModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              Manage Schedules
              <Icon icon="mdi:cog-outline" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manage Schedules Modal */}
      {showSchedulesModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:clock-outline" className="w-6 h-6 text-amber-500" />
                <h3 className="font-poppins font-bold text-sm text-white">Scheduled Deliveries</h3>
              </div>
              <button
                onClick={() => setShowSchedulesModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Automated reports delivered straight to your email channels:
                </p>
                <button 
                  onClick={() => toast.success("Scheduling new delivery is not supported in the demo!")}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
                  Add Schedule
                </button>
              </div>

              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl shadow-xs hover:border-amber-500/30 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${schedule.active ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                      <p className="font-bold text-[#1E293B] text-sm">{schedule.name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase">
                      <span className="text-amber-700 font-bold">{schedule.freq}</span>
                      <span>•</span>
                      <span>Email: {schedule.email}</span>
                    </div>
                  </div>
                  
                  {/* Toggle switch */}
                  <button 
                    onClick={() => toggleSchedule(schedule.id)}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 focus:outline-none ${
                      schedule.active ? "bg-amber-700" : "bg-gray-300"
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                      schedule.active ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white text-right shrink-0">
              <button 
                onClick={() => setShowSchedulesModal(false)}
                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Close Schedules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archived Reports Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:archive-outline" className="w-6 h-6 text-amber-500" />
                <h3 className="font-poppins font-bold text-sm text-white">Archived Reports</h3>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 custom-scrollbar">
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-xs mb-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search archives by name or category..." 
                  className="bg-transparent border-none text-xs text-gray-700 outline-none w-full font-nunito"
                />
                <Icon icon="mdi:magnify" className="text-gray-400 w-5 h-5" />
              </div>

              {filteredArchives.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                  No archived reports match your search query.
                </div>
              ) : (
                filteredArchives.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-2xl hover:border-amber-500/30 transition-colors shadow-xs">
                    <div className="flex items-center gap-3">
                      <Icon icon={report.icon} className={`w-8 h-8 ${report.iconColor}`} />
                      <div>
                        <p className="font-bold text-[#1E293B] text-sm">{report.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                          <span>{report.format}</span>
                          <span>•</span>
                          <span>{report.type}</span>
                          <span>•</span>
                          <span>{report.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDownload(report.name)}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        title="Download"
                      >
                        <Icon icon="mdi:download" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white text-right shrink-0">
              <button 
                onClick={() => setShowArchiveModal(false)}
                className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
