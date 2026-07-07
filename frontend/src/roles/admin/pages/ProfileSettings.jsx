import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload, LogOut } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function ProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Profile" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto">
              <Link to="/admin/settings" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors whitespace-nowrap">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors whitespace-nowrap">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors whitespace-nowrap">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm transition-colors whitespace-nowrap">
                Profile
              </Link>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-lg shadow-sm transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          <div className="space-y-6 max-w-5xl">
            {/* Admin Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Admin Profile</h3>
              
              {/* Profile Header */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xl font-bold overflow-hidden shadow-sm">
                    {profileUrl ? (
                      <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      "SA"
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProfileUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }} 
                  />
                  <button 
                    onClick={() => document.getElementById('profile-upload').click()}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#b45309] hover:bg-[#92400e] text-white rounded-full flex items-center justify-center border-2 border-white transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Super Admin</h4>
                  <p className="text-sm text-slate-500 font-medium mb-1.5">admin@fleetcommand.io</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-600">
                    Super Admin
                  </span>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">First Name</label>
                    <input 
                      type="text" 
                      defaultValue="Super" 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Last Name</label>
                    <input 
                      type="text" 
                      defaultValue="Admin" 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="admin@fleetcommand.io" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Phone Number</label>
                  <input 
                    type="tel" 
                    defaultValue="+1 (555) 000-0000" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Change Password</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="********" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">New Password</label>
                  <input 
                    type="password" 
                    placeholder="********" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Confirm New Password</label>
                  <input 
                    type="password" 
                    placeholder="********" 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all placeholder-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
