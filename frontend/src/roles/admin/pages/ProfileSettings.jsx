import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  
  const [form, setForm] = useState({
    firstName: "Super",
    lastName: "Admin",
    email: "admin@fleetcommand.io",
    phone: "+1 (555) 000-0000",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSave = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = "First Name is required";
    if (!form.lastName) newErrors.lastName = "Last Name is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone)) newErrors.phone = "Invalid phone format";

    if (form.currentPassword || form.newPassword || form.confirmNewPassword) {
      if (!form.currentPassword) newErrors.currentPassword = "Current Password is required";
      if (!form.newPassword) newErrors.newPassword = "New Password is required";
      else {
        if (form.newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
        else if (!/[A-Z]/.test(form.newPassword)) newErrors.newPassword = "Password must contain uppercase letter";
        else if (!/[0-9]/.test(form.newPassword)) newErrors.newPassword = "Password must contain a number";
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword)) newErrors.newPassword = "Password must contain special character";
      }
      if (form.newPassword !== form.confirmNewPassword) newErrors.confirmNewPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Profile saved successfully!");
      setForm({...form, currentPassword: '', newPassword: '', confirmNewPassword: ''});
    }, 1000);
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Profile" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Tabs */}
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <Link to="/admin/settings" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                General
              </Link>
              <Link to="/admin/settings/security" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-slate-600 hover:text-slate-900 text-[10px] sm:text-sm font-bold rounded-full transition-colors truncate">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm transition-colors truncate">
                Profile
              </Link>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button onClick={() => { logout(); toast.success("Logged out successfully"); navigate('/login'); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 bg-white hover:bg-[#b45309]/10 border border-[#b45309]/30 text-[#b45309] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors text-center w-full sm:w-auto truncate">
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden min-[360px]:inline">Logout</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-[2] sm:flex-none px-2 sm:px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait text-center w-full sm:w-auto truncate"
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
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.firstName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.lastName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
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
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    placeholder="********" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.currentPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                  />
                  {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="********" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.newPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                  />
                  {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmNewPassword"
                    value={form.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="********" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.confirmNewPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                  />
                  {errors.confirmNewPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmNewPassword}</p>}
                </div>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
