import { useState } from "react";
import { Link } from "react-router-dom";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function NotificationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(false);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(false);
  const [inviteNotifications, setInviteNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [newOrganizationAlerts, setNewOrganizationAlerts] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Notifications" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Link to="/admin/settings" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-6 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-bold rounded-full transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm transition-colors">
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
              {isSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-5xl">
            <div className="mb-6">
              <h3 className="text-[15px] font-extrabold text-slate-800">Notification Preferences</h3>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100 border-t border-slate-100">
              
              {/* Email Notifications */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Email Notifications</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Receive email for important events</p>
                </div>
                <button 
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${emailNotifications ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* System Alerts */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">System Alerts</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Critical system health notifications</p>
                </div>
                <button 
                  onClick={() => setSystemAlerts(!systemAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${systemAlerts ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${systemAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Maintenance Alerts */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Maintenance Alerts</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Scheduled maintenance notifications</p>
                </div>
                <button 
                  onClick={() => setMaintenanceAlerts(!maintenanceAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${maintenanceAlerts ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${maintenanceAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Invite Notifications */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Invite Notifications</h4>
                  <p className="text-[13px] text-slate-500 font-medium">When fleet managers accept invites</p>
                </div>
                <button 
                  onClick={() => setInviteNotifications(!inviteNotifications)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${inviteNotifications ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${inviteNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Weekly Reports */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Weekly Reports</h4>
                  <p className="text-[13px] text-slate-500 font-medium">Summary report every Monday morning</p>
                </div>
                <button 
                  onClick={() => setWeeklyReports(!weeklyReports)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${weeklyReports ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${weeklyReports ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* New Organization Alerts */}
              <div className="py-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">New Organization Alerts</h4>
                  <p className="text-[13px] text-slate-500 font-medium">When a new organization registers</p>
                </div>
                <button 
                  onClick={() => setNewOrganizationAlerts(!newOrganizationAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${newOrganizationAlerts ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${newOrganizationAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
