import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function Settings() {
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="General Settings" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Link to="/admin/settings" className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                Profile
              </Link>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Platform Settings</h3>
            
            <div className="space-y-6 max-w-4xl">
              {/* Platform Name */}
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-slate-600">Platform Name</label>
                <input 
                  type="text" 
                  placeholder="FleetCommand" 
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                />
              </div>

              {/* Timezone & Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Timezone</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Language</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                  />
                </div>
              </div>

              {/* Platform Logo */}
              <div className="space-y-3 pt-2">
                <label className="block text-[13px] font-bold text-slate-600">Platform Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
                    <img src={logoUrl} alt="Platform Logo" className="w-full h-full object-contain" />
                  </div>
                  
                  <input 
                    type="file" 
                    id="logo-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setLogoUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }} 
                  />
                  
                  <button 
                    onClick={() => document.getElementById('logo-upload').click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Upload New Logo
                  </button>
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
