import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { Plus, Trash2, Save } from "lucide-react";

export default function SettingsAbout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // About Content State
  const [aboutData, setAboutData] = useState({
    storyTitle: "",
    storyContentText: "",
    missionTitle: "",
    missionContentText: "",
    missionQuote: "",
    statsFounded: "",
    statsEnterprises: "",
    statsVehicles: "",
    statsSavings: "",
  });

  const [timeline, setTimeline] = useState([]);
  const [newTimelineItem, setNewTimelineItem] = useState({ year: "", text: "" });

  const loadAboutData = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAbout();
      const data = res.data?.data || res.data;
      if (data) {
        setAboutData({
          storyTitle: data.storyTitle || "Built for Fleet Operators, by Logistics Experts",
          storyContentText: Array.isArray(data.storyContent) ? data.storyContent.join("\n\n") : "",
          missionTitle: data.missionTitle || "Eliminating Blind Spots in Fleet Operations",
          missionContentText: Array.isArray(data.missionContent) ? data.missionContent.join("\n\n") : "",
          missionQuote: data.missionQuote || "The only way to run a fleet well is to see it clearly.",
          statsFounded: data.statsFounded || "2018",
          statsEnterprises: data.statsEnterprises || "340+",
          statsVehicles: data.statsVehicles || "1.2M+",
          statsSavings: data.statsSavings || "$180M+",
        });
        setTimeline(data.timeline || []);
      }
    } catch (error) {
      toast.error("Failed to load About settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAboutData();
  }, []);

  const handleAddTimelineItem = () => {
    if (!newTimelineItem.year || !newTimelineItem.text) {
      toast.error("Please fill both year and text for timeline item.");
      return;
    }
    setTimeline(prev => [...prev, { ...newTimelineItem }]);
    setNewTimelineItem({ year: "", text: "" });
  };

  const handleDeleteTimelineItem = (index) => {
    setTimeline(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const storyContent = aboutData.storyContentText.split("\n").map(p => p.trim()).filter(Boolean);
    const missionContent = aboutData.missionContentText.split("\n").map(p => p.trim()).filter(Boolean);

    const payload = {
      storyTitle: aboutData.storyTitle,
      storyContent,
      missionTitle: aboutData.missionTitle,
      missionContent,
      missionQuote: aboutData.missionQuote,
      statsFounded: aboutData.statsFounded,
      statsEnterprises: aboutData.statsEnterprises,
      statsVehicles: aboutData.statsVehicles,
      statsSavings: aboutData.statsSavings,
      timeline
    };

    try {
      await adminApi.updateAbout(payload);
      toast.success("About Us content saved successfully!");
      loadAboutData();
    } catch (error) {
      toast.error("Failed to save About details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Platform About Us Settings" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap">
              <Link to="/admin/settings" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                About
              </Link>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#a14000] hover:bg-[#853500] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-75"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save About Settings"}
            </button>
          </div>

          {/* About Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative space-y-8">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#a14000] border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {/* Story Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Our Story Section</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Story Title</label>
                  <input
                    type="text"
                    value={aboutData.storyTitle}
                    onChange={(e) => setAboutData(prev => ({ ...prev, storyTitle: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    placeholder="Built for Fleet Operators, by Logistics Experts"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Story Content Paragraphs (Separate paragraphs with newlines)</label>
                  <textarea
                    rows="4"
                    value={aboutData.storyContentText}
                    onChange={(e) => setAboutData(prev => ({ ...prev, storyContentText: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Mission Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Our Mission Section</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mission Title</label>
                  <input
                    type="text"
                    value={aboutData.missionTitle}
                    onChange={(e) => setAboutData(prev => ({ ...prev, missionTitle: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    placeholder="Eliminating Blind Spots in Fleet Operations"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mission Content Paragraphs (Separate paragraphs with newlines)</label>
                  <textarea
                    rows="4"
                    value={aboutData.missionContentText}
                    onChange={(e) => setAboutData(prev => ({ ...prev, missionContentText: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mission Quote</label>
                  <input
                    type="text"
                    value={aboutData.missionQuote}
                    onChange={(e) => setAboutData(prev => ({ ...prev, missionQuote: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    placeholder="The only way to run a fleet well is to see it clearly."
                  />
                </div>
              </div>
            </div>

            {/* Stats Cards Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Facts & Stats Numbers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Year Founded</label>
                  <input
                    type="text"
                    value={aboutData.statsFounded}
                    onChange={(e) => setAboutData(prev => ({ ...prev, statsFounded: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Enterprises Clients</label>
                  <input
                    type="text"
                    value={aboutData.statsEnterprises}
                    onChange={(e) => setAboutData(prev => ({ ...prev, statsEnterprises: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vehicles Tracked</label>
                  <input
                    type="text"
                    value={aboutData.statsVehicles}
                    onChange={(e) => setAboutData(prev => ({ ...prev, statsVehicles: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer Savings</label>
                  <input
                    type="text"
                    value={aboutData.statsSavings}
                    onChange={(e) => setAboutData(prev => ({ ...prev, statsSavings: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300 text-center font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Milestone Timeline</h3>
              
              <div className="space-y-3">
                {timeline.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-extrabold text-xs text-[#a14000] w-14 shrink-0">{item.year}</span>
                    <p className="text-xs font-semibold text-slate-600 flex-1">{item.text}</p>
                    <button
                      onClick={() => handleDeleteTimelineItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Timeline Item Form */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Timeline Milestone</span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="e.g. 2026"
                      value={newTimelineItem.year}
                      onChange={(e) => setNewTimelineItem(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full sm:w-28 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Describe the milestone..."
                      value={newTimelineItem.text}
                      onChange={(e) => setNewTimelineItem(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none flex-1"
                    />
                    <button
                      onClick={handleAddTimelineItem}
                      type="button"
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
