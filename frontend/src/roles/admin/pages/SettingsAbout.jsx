import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { Plus, Trash2, Save, Edit2, Check, X } from "lucide-react";
import { aboutSchema, timelineItemSchema, validateField, validateForm } from "@/validations";

export default function SettingsAbout() {
  const [isLoading, setIsLoading] = useState(false);
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
  const [timelineErrors, setTimelineErrors] = useState({});
  const [editingTimelineIndex, setEditingTimelineIndex] = useState(null);
  const [editTimelineItem, setEditTimelineItem] = useState({ year: "", text: "" });
  const [editTimelineErrors, setEditTimelineErrors] = useState({});
  const [errors, setErrors] = useState({});

  const loadAboutData = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAbout();
      const data = res.data?.data || res.data;
      if (data) {
        setAboutData({
          storyTitle: data.storyTitle || "Built for Fleet Operators, by Logistics Experts",
          storyContentText: Array.isArray(data.storyContent) && data.storyContent.length > 0
            ? data.storyContent.join("\n\n")
            : (typeof data.storyContent === "string" ? data.storyContent : "Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.\n\nOur team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface."),
          missionTitle: data.missionTitle || "Eliminating Blind Spots in Fleet Operations",
          missionContentText: Array.isArray(data.missionContent) && data.missionContent.length > 0
            ? data.missionContent.join("\n\n")
            : (typeof data.missionContent === "string" ? data.missionContent : "Every year, inefficient fleet management costs businesses billions in wasted resources, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.\n\nFleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork."),
          missionQuote: data.missionQuote || "The only way to run a fleet well is to see it clearly.",
          statsFounded: data.statsFounded || "2018",
          statsEnterprises: data.statsEnterprises || "340+",
          statsVehicles: data.statsVehicles || "1.2M+",
          statsSavings: data.statsSavings || "$180M+",
        });
        setTimeline(data.timeline && data.timeline.length > 0 ? data.timeline : [
          { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
          { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
          { year: "2021", text: "Series A — ₹200 Cr. Expanded to reporting & analytics and driver management." },
          { year: "2023", text: "Surpassed 1M vehicles tracked. Launched performance monitoring cloud platform." },
          { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." }
        ]);
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

  const handleFieldChange = (field, value) => {
    let cleanValue = value;
    let customError = "";

    if (field === "storyTitle" || field === "missionTitle") {
      cleanValue = value.replace(/[^a-zA-Z\s,.'\-&!?:;]/g, "").slice(0, 100);
      if (value !== cleanValue && value.length > 0) {
        customError = `${field === "storyTitle" ? "Story title" : "Mission title"} must contain alphabets and punctuation only (numbers are not allowed).`;
      }
    } else if (field === "storyContentText" || field === "missionContentText") {
      cleanValue = value.slice(0, 3000);
    } else if (field === "missionQuote") {
      cleanValue = value.slice(0, 200);
    } else if (field === "statsFounded") {
      cleanValue = value.replace(/\D/g, "").slice(0, 4);
      if (value !== cleanValue && value.length > 0) {
        customError = "Year founded must contain numbers only (letters are not allowed).";
      }
    } else if (field === "statsEnterprises" || field === "statsVehicles" || field === "statsSavings") {
      cleanValue = value.slice(0, 10);
    }

    const updated = { ...aboutData, [field]: cleanValue };
    setAboutData(updated);

    if (customError) {
      setErrors(prev => ({ ...prev, [field]: customError }));
    } else {
      const fieldError = validateField(aboutSchema, field, cleanValue, updated);
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleBlur = (field) => {
    const fieldError = validateField(aboutSchema, field, aboutData[field], aboutData);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleTextKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[a-zA-Z\s,.'\-&!?:;]$/.test(e.key)) {
      e.preventDefault();
      const fieldName = e.target.name;
      const label = fieldName === "storyTitle" ? "Story title" : "Mission title";
      setErrors(prev => ({ ...prev, [fieldName]: `${label} must contain alphabets and punctuation only (numbers are not allowed).` }));
    } else {
      if (errors[e.target.name]?.includes("numbers are not allowed")) {
        setErrors(prev => ({ ...prev, [e.target.name]: "" }));
      }
    }
  };

  const handleStatsFoundedKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, statsFounded: "Year founded must contain numbers only (letters are not allowed)." }));
    } else {
      if (errors.statsFounded?.includes("must contain numbers only")) {
        setErrors(prev => ({ ...prev, statsFounded: "" }));
      }
    }
  };

  const handleTimelineYearKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[0-9\s\-/Q]$/i.test(e.key)) {
      e.preventDefault();
      setTimelineErrors(prev => ({ ...prev, year: "Please enter a valid milestone year (e.g. 2026)." }));
    } else {
      if (timelineErrors.year?.includes("valid milestone year")) {
        setTimelineErrors(prev => ({ ...prev, year: "" }));
      }
    }
  };

  const handleNewTimelineFieldChange = (field, value) => {
    const updated = { ...newTimelineItem, [field]: value };
    setNewTimelineItem(updated);
    const fieldError = validateField(timelineItemSchema, field, value, updated);
    setTimelineErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleAddTimelineItem = () => {
    const { isValid, errors: validationErrors } = validateForm(timelineItemSchema, newTimelineItem);
    if (!isValid) {
      setTimelineErrors(validationErrors);
      const firstErr = Object.values(validationErrors)[0];
      toast.error(firstErr || "Please fill valid milestone details.");
      return;
    }
    setTimeline(prev => [...prev, { year: newTimelineItem.year.trim(), text: newTimelineItem.text.trim() }]);
    setNewTimelineItem({ year: "", text: "" });
    setTimelineErrors({});
  };

  const handleStartEditTimeline = (index) => {
    setEditingTimelineIndex(index);
    setEditTimelineItem({ ...timeline[index] });
    setEditTimelineErrors({});
  };

  const handleCancelEditTimeline = () => {
    setEditingTimelineIndex(null);
    setEditTimelineItem({ year: "", text: "" });
    setEditTimelineErrors({});
  };

  const handleEditTimelineFieldChange = (field, value) => {
    const updated = { ...editTimelineItem, [field]: value };
    setEditTimelineItem(updated);
    const fieldError = validateField(timelineItemSchema, field, value, updated);
    setEditTimelineErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSaveEditTimeline = (index) => {
    const { isValid, errors: validationErrors } = validateForm(timelineItemSchema, editTimelineItem);
    if (!isValid) {
      setEditTimelineErrors(validationErrors);
      const firstErr = Object.values(validationErrors)[0];
      toast.error(firstErr || "Please resolve milestone errors before saving.");
      return;
    }
    setTimeline(prev => {
      const copy = [...prev];
      copy[index] = { year: editTimelineItem.year.trim(), text: editTimelineItem.text.trim() };
      return copy;
    });
    setEditingTimelineIndex(null);
    setEditTimelineItem({ year: "", text: "" });
    setEditTimelineErrors({});
    toast.success("Milestone updated!");
  };

  const handleDeleteTimelineItem = (index) => {
    if (editingTimelineIndex === index) {
      handleCancelEditTimeline();
    }
    setTimeline(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    // 1. Validate About Main Form
    const { isValid, errors: validationErrors } = validateForm(aboutSchema, aboutData);
    if (!isValid) {
      setErrors(validationErrors);
      const firstErr = Object.values(validationErrors)[0];
      toast.error(firstErr || "Please resolve all errors before saving.");
      return;
    }

    // 2. Validate Timeline Items
    for (let i = 0; i < timeline.length; i++) {
      const itemValidation = validateForm(timelineItemSchema, timeline[i]);
      if (!itemValidation.isValid) {
        toast.error(`Milestone #${i + 1} is invalid: ${Object.values(itemValidation.errors)[0]}`);
        return;
      }
    }

    // 3. Check if an item is currently being edited with errors
    if (editingTimelineIndex !== null) {
      const editValidation = validateForm(timelineItemSchema, editTimelineItem);
      if (!editValidation.isValid) {
        setEditTimelineErrors(editValidation.errors);
        toast.error("Please finish or cancel editing milestone before saving.");
        return;
      }
    }

    setIsSaving(true);
    const storyContent = aboutData.storyContentText.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const missionContent = aboutData.missionContentText.split(/\n+/).map(p => p.trim()).filter(Boolean);

    const payload = {
      storyTitle: aboutData.storyTitle.trim(),
      storyContent,
      missionTitle: aboutData.missionTitle.trim(),
      missionContent,
      missionQuote: aboutData.missionQuote.trim(),
      statsFounded: aboutData.statsFounded.trim(),
      statsEnterprises: aboutData.statsEnterprises.trim(),
      statsVehicles: aboutData.statsVehicles.trim(),
      statsSavings: aboutData.statsSavings.trim(),
      timeline
    };

    try {
      await adminApi.updateAbout(payload);
      toast.success("About Us content saved successfully!");
      setErrors({});
      loadAboutData();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save About details";
      toast.error(msg);
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
              <Link to="/admin/settings/reviews" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Reviews
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
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Story Title *</label>
                    <span className="text-[10px] text-slate-400">{aboutData.storyTitle.length}/100</span>
                  </div>
                  <input
                    type="text"
                    name="storyTitle"
                    maxLength={100}
                    value={aboutData.storyTitle}
                    onKeyDown={handleTextKeyDown}
                    onChange={(e) => handleFieldChange("storyTitle", e.target.value)}
                    onBlur={() => handleBlur("storyTitle")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                      errors.storyTitle ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="Built for Fleet Operators, by Logistics Experts (3-100 chars)"
                  />
                  {errors.storyTitle && <p className="text-[11px] text-red-500 font-medium">{errors.storyTitle}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Story Content Paragraphs * (Separate paragraphs with newlines)</label>
                    <span className="text-[10px] text-slate-400">{aboutData.storyContentText.length}/3000</span>
                  </div>
                  <textarea
                    rows="4"
                    maxLength={3000}
                    value={aboutData.storyContentText}
                    onChange={(e) => handleFieldChange("storyContentText", e.target.value)}
                    onBlur={() => handleBlur("storyContentText")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                      errors.storyContentText ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="Write story paragraphs here (20-3000 chars)..."
                  />
                  {errors.storyContentText && <p className="text-[11px] text-red-500 font-medium">{errors.storyContentText}</p>}
                </div>
              </div>
            </div>

            {/* Mission Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Our Mission Section</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mission Title *</label>
                    <span className="text-[10px] text-slate-400">{aboutData.missionTitle.length}/100</span>
                  </div>
                  <input
                    type="text"
                    name="missionTitle"
                    maxLength={100}
                    value={aboutData.missionTitle}
                    onKeyDown={handleTextKeyDown}
                    onChange={(e) => handleFieldChange("missionTitle", e.target.value)}
                    onBlur={() => handleBlur("missionTitle")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                      errors.missionTitle ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="Eliminating Blind Spots in Fleet Operations (3-100 chars)"
                  />
                  {errors.missionTitle && <p className="text-[11px] text-red-500 font-medium">{errors.missionTitle}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mission Content Paragraphs * (Separate paragraphs with newlines)</label>
                    <span className="text-[10px] text-slate-400">{aboutData.missionContentText.length}/3000</span>
                  </div>
                  <textarea
                    rows="4"
                    maxLength={3000}
                    value={aboutData.missionContentText}
                    onChange={(e) => handleFieldChange("missionContentText", e.target.value)}
                    onBlur={() => handleBlur("missionContentText")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                      errors.missionContentText ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="Write mission paragraphs here (20-3000 chars)..."
                  />
                  {errors.missionContentText && <p className="text-[11px] text-red-500 font-medium">{errors.missionContentText}</p>}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Mission Quote *</label>
                    <span className="text-[10px] text-slate-400">{aboutData.missionQuote.length}/200</span>
                  </div>
                  <input
                    type="text"
                    maxLength={200}
                    value={aboutData.missionQuote}
                    onChange={(e) => handleFieldChange("missionQuote", e.target.value)}
                    onBlur={() => handleBlur("missionQuote")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                      errors.missionQuote ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="The only way to run a fleet well is to see it clearly (5-200 chars)."
                  />
                  {errors.missionQuote && <p className="text-[11px] text-red-500 font-medium">{errors.missionQuote}</p>}
                </div>
              </div>
            </div>

            {/* Stats Cards Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Facts & Stats Numbers</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Year Founded *</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={aboutData.statsFounded}
                    onKeyDown={handleStatsFoundedKeyDown}
                    onChange={(e) => handleFieldChange("statsFounded", e.target.value)}
                    onBlur={() => handleBlur("statsFounded")}
                    placeholder="2018"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none text-center font-bold transition-all ${
                      errors.statsFounded ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                  />
                  {errors.statsFounded && <p className="text-[11px] text-red-500 font-medium text-center">{errors.statsFounded}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Enterprise Clients *</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={aboutData.statsEnterprises}
                    onChange={(e) => handleFieldChange("statsEnterprises", e.target.value)}
                    onBlur={() => handleBlur("statsEnterprises")}
                    placeholder="340+"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none text-center font-bold transition-all ${
                      errors.statsEnterprises ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                  />
                  {errors.statsEnterprises && <p className="text-[11px] text-red-500 font-medium text-center">{errors.statsEnterprises}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Vehicles Tracked *</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={aboutData.statsVehicles}
                    onChange={(e) => handleFieldChange("statsVehicles", e.target.value)}
                    onBlur={() => handleBlur("statsVehicles")}
                    placeholder="1.2M+"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none text-center font-bold transition-all ${
                      errors.statsVehicles ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                  />
                  {errors.statsVehicles && <p className="text-[11px] text-red-500 font-medium text-center">{errors.statsVehicles}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer Savings *</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={aboutData.statsSavings}
                    onChange={(e) => handleFieldChange("statsSavings", e.target.value)}
                    onBlur={() => handleBlur("statsSavings")}
                    placeholder="$180M+"
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none text-center font-bold transition-all ${
                      errors.statsSavings ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                  />
                  {errors.statsSavings && <p className="text-[11px] text-red-500 font-medium text-center">{errors.statsSavings}</p>}
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2">Milestone Timeline</h3>
              
              <div className="space-y-3">
                {timeline.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 min-w-0 transition-all">
                    {editingTimelineIndex === idx ? (
                      /* Edit Milestone Mode */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#a14000] uppercase tracking-wider">Editing Milestone #{idx + 1}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveEditTimeline(idx)}
                              type="button"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEditTimeline}
                              type="button"
                              className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="w-full sm:w-32">
                            <input
                              type="text"
                              maxLength={10}
                              placeholder="Year (e.g. 2026)"
                              value={editTimelineItem.year}
                              onChange={(e) => handleEditTimelineFieldChange("year", e.target.value.slice(0, 10))}
                              className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none ${
                                editTimelineErrors.year ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200"
                              }`}
                            />
                            {editTimelineErrors.year && <p className="text-[10px] text-red-500 font-medium mt-1">{editTimelineErrors.year}</p>}
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              maxLength={200}
                              placeholder="Milestone description (5-200 chars)..."
                              value={editTimelineItem.text}
                              onChange={(e) => handleEditTimelineFieldChange("text", e.target.value.slice(0, 200))}
                              className={`w-full bg-white border rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none ${
                                editTimelineErrors.text ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200"
                              }`}
                            />
                            {editTimelineErrors.text && <p className="text-[10px] text-red-500 font-medium mt-1">{editTimelineErrors.text}</p>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-xs text-[#a14000] w-14 shrink-0 truncate" title={item.year}>{item.year}</span>
                        <p className="text-xs font-semibold text-slate-600 flex-1 break-words break-all sm:break-words">{item.text}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEditTimeline(idx)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                            title="Edit Milestone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTimelineItem(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Timeline Item Form */}
                <div className="border border-dashed border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/20">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Timeline Milestone</span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full sm:w-32">
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 2026"
                        value={newTimelineItem.year}
                        onKeyDown={handleTimelineYearKeyDown}
                        onChange={(e) => handleNewTimelineFieldChange("year", e.target.value.slice(0, 10))}
                        className={`w-full bg-white border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none ${
                          timelineErrors.year ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200"
                        }`}
                      />
                      {timelineErrors.year && <p className="text-[10px] text-red-500 font-medium mt-1">{timelineErrors.year}</p>}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        maxLength={200}
                        placeholder="Describe the milestone (5-200 chars)..."
                        value={newTimelineItem.text}
                        onChange={(e) => handleNewTimelineFieldChange("text", e.target.value.slice(0, 200))}
                        className={`w-full bg-white border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none ${
                          timelineErrors.text ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200"
                        }`}
                      />
                      {timelineErrors.text && <p className="text-[10px] text-red-500 font-medium mt-1">{timelineErrors.text}</p>}
                    </div>
                    <button
                      onClick={handleAddTimelineItem}
                      type="button"
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer h-[38px]"
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
