import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";

export default function NotificationSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeCard, setActiveCard] = useState(null);

  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [primaryEmailAddress, setPrimaryEmailAddress] = useState("admin@fleetcommand.io");
  
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [systemAlertsSeverity, setSystemAlertsSeverity] = useState("warning");
  
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [maintenanceAlert48h, setMaintenanceAlert48h] = useState(true);
  const [maintenanceAlert1h, setMaintenanceAlert1h] = useState(true);
  
  const [inviteNotifications, setInviteNotifications] = useState(true);
  const [inviteSent, setInviteSent] = useState(true);
  const [inviteAccepted, setInviteAccepted] = useState(true);
  
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [weeklyReportDay, setWeeklyReportDay] = useState("monday");
  
  const [newOrganizationAlerts, setNewOrganizationAlerts] = useState(true);
  const [requireAdminReview, setRequireAdminReview] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await adminApi.getNotificationSettings();
      const settings = response.data?.data || response.data;
      if (settings) {
        setEmailNotifications(settings.emailNotifications ?? true);
        setPrimaryEmailAddress(settings.primaryEmailAddress || "admin@fleetcommand.io");
        
        setSystemAlerts(settings.systemAlerts ?? true);
        setSystemAlertsSeverity(settings.systemAlertsSeverity || "warning");
        
        setMaintenanceAlerts(settings.maintenanceAlerts ?? true);
        setMaintenanceAlert48h(settings.maintenanceAlert48h ?? true);
        setMaintenanceAlert1h(settings.maintenanceAlert1h ?? true);
        
        setInviteNotifications(settings.inviteNotifications ?? true);
        setInviteSent(settings.inviteSent ?? true);
        setInviteAccepted(settings.inviteAccepted ?? true);
        
        setWeeklyReports(settings.weeklyReports ?? true);
        setWeeklyReportDay(settings.weeklyReportDay || "monday");
        
        setNewOrganizationAlerts(settings.newOrganizationAlerts ?? true);
        setRequireAdminReview(settings.requireAdminReview ?? true);
      }
    } catch (error) {
      toast.error("Failed to load notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleCard = (cardId) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        emailNotifications,
        primaryEmailAddress,
        systemAlerts,
        systemAlertsSeverity,
        maintenanceAlerts,
        maintenanceAlert48h,
        maintenanceAlert1h,
        inviteNotifications,
        inviteSent,
        inviteAccepted,
        weeklyReports,
        weeklyReportDay,
        newOrganizationAlerts,
        requireAdminReview
      };
      
      await adminApi.updateNotificationSettings(payload);
      toast.success("Notification preferences saved successfully!");
      await fetchSettings();
    } catch (error) {
      toast.error("Failed to save notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Notifications" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap">
              <Link to="/admin/settings" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                About
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 shrink-0">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait text-center"
              >
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>

          {/* Settings Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 max-w-5xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#b45309] border-t-transparent rounded-full"></div>
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-[15px] font-extrabold text-slate-800">Notification Preferences</h3>
            </div>
            
            <div className="flex flex-col divide-y divide-slate-100 border-t border-slate-100">
              
              {/* Email Notifications */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('email')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Email Notifications</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Receive email for important events</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEmailNotifications(!emailNotifications); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${emailNotifications ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'email' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'email' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Primary Email Address</label>
                    <input type="email" className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all" />
                  </div>
                </div>
              </div>

              {/* System Alerts */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('system')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">System Alerts</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Critical system health notifications</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSystemAlerts(!systemAlerts); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${systemAlerts ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${systemAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'system' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'system' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Minimum Severity Level</label>
                    <select 
                      value={systemAlertsSeverity}
                      onChange={(e) => setSystemAlertsSeverity(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    >
                      <option value="all">All Events</option>
                      <option value="warning">Warnings & Critical</option>
                      <option value="critical">Critical Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Maintenance Alerts */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('maintenance')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Maintenance Alerts</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Scheduled maintenance notifications</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMaintenanceAlerts(!maintenanceAlerts); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${maintenanceAlerts ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${maintenanceAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'maintenance' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'maintenance' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={maintenanceAlert48h} onChange={(e) => setMaintenanceAlert48h(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Notify 48 hours in advance</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={maintenanceAlert1h} onChange={(e) => setMaintenanceAlert1h(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Notify 1 hour in advance</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Invite Notifications */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('invite')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Invite Notifications</h4>
                    <p className="text-[13px] text-slate-500 font-medium">When fleet managers accept invites</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setInviteNotifications(!inviteNotifications); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${inviteNotifications ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${inviteNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'invite' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'invite' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={inviteSent} onChange={(e) => setInviteSent(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Notify when invitation is sent</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={inviteAccepted} onChange={(e) => setInviteAccepted(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Notify when invitation is accepted</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Weekly Reports */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('weekly')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">Weekly Reports</h4>
                    <p className="text-[13px] text-slate-500 font-medium">Summary report every Monday morning</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setWeeklyReports(!weeklyReports); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${weeklyReports ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${weeklyReports ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'weekly' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'weekly' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2">
                    <label className="block text-[12px] font-bold text-slate-600 mb-1">Delivery Day</label>
                    <select 
                      value={weeklyReportDay}
                      onChange={(e) => setWeeklyReportDay(e.target.value)}
                      className="w-full max-w-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309] transition-all"
                    >
                      <option value="monday">Monday Morning</option>
                      <option value="friday">Friday Evening</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* New Organization Alerts */}
              <div className="flex flex-col border-b border-slate-100 last:border-b-0">
                <div 
                  className="py-5 flex items-center justify-between cursor-pointer group"
                  onClick={() => toggleCard('new_org')}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#b45309] transition-colors">New Organization Alerts</h4>
                    <p className="text-[13px] text-slate-500 font-medium">When a new organization registers</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setNewOrganizationAlerts(!newOrganizationAlerts); }}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center shrink-0 ${newOrganizationAlerts ? 'bg-green-500' : 'bg-slate-200'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${newOrganizationAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeCard === 'new_org' ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${activeCard === 'new_org' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pb-5 pt-2 pl-4 border-l-2 border-[#b45309] ml-2 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={requireAdminReview} onChange={(e) => setRequireAdminReview(e.target.checked)} className="w-4 h-4 text-[#b45309] rounded border-slate-300 focus:ring-[#b45309]" />
                      <span className="text-[13px] text-slate-600 font-medium">Require admin review for new organizations</span>
                    </label>
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
