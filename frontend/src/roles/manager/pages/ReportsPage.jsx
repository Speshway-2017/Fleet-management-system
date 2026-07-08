import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("operational");

  // Check if navigated from notification to open fuel tab
  useEffect(() => {
    if (location.state?.openFuelTab) {
      setActiveTab("financial");
      toast.success("Fuel Report Opened");
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Reports Center</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border-l-4 border-gray-900 shadow-lg p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 uppercase tracking-wide text-sm mb-2">Total Reports Generated</p>
              <p className="text-5xl font-extrabold text-gray-800 mb-2">1,284</p>
              <p className="text-green-600 text-sm font-medium flex items-center gap-1">
                <Icon icon="mdi:trending-up" /> +12% this month
              </p>
            </div>
            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:file-document-multiple" className="w-8 h-8 text-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-l-4 border-amber-700 shadow-lg p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 uppercase tracking-wide text-sm mb-2">Pending Schedules</p>
              <p className="text-5xl font-extrabold text-gray-800 mb-2">24</p>
              <p className="text-amber-700 text-sm font-medium flex items-center gap-1">
                <Icon icon="mdi:clock-outline" /> Next delivery in 2h
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:calendar-check" className="w-8 h-8 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1">
          {/* Report Categories */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Report Categories</h3>
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
                      <p className="font-semibold text-gray-800">{cat.title}</p>
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Build Custom Insight */}
          <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-lg overflow-hidden relative">
            <Icon icon="mdi:wrench" className="absolute top-4 right-4 w-40 h-40 text-white/10" />
            <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Build Custom Insight</h3>
            <p className="text-gray-300 text-sm mb-6 relative z-10">
              Combine over 150+ data points to create unique reports tailored to your fleet's needs.
            </p>
            <button
              onClick={handleCustomInsight}
              className="relative z-10 px-4 py-2 bg-[#B45A0A] text-white text-xs font-bold rounded-xl hover:bg-[#9A4D08] transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reports table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Recent Reports</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportAll}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Export All
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50">
                  <tr>
                    {["Report Name", "Type", "Format", "Generated Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-sm font-medium text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentReports.map((report, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Icon icon={report.icon} className={`w-8 h-8 ${report.iconColor}`} />
                          <span className="font-semibold text-gray-800">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-amber-200 text-amber-700 rounded-full text-xs font-medium">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.format}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(report.name)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Icon icon="mdi:download" className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleShare(report.name)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Share"
                          >
                            <Icon icon="mdi:share-variant" className="w-5 h-5" />
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
                onClick={() => navigate("/manager/reports/archived")}
                className="text-amber-700 text-sm font-medium hover:underline transition-colors"
              >
                View All Archived Reports
              </button>
            </div>
          </div>

          {/* Scheduled Deliveries */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="mdi:clock-outline" className="w-7 h-7 text-amber-700" />
              <p className="text-xl font-semibold text-gray-800">Scheduled Deliveries</p>
            </div>
            <button
              onClick={() => navigate("/manager/reports/schedules")}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              Manage Schedules
              <Icon icon="mdi:cog-outline" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
