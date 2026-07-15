import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, LogOut, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { adminApi } from "@/api/adminApi";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { logout, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await adminApi.getProfile();
        const user = response.data?.data || response.data;
        if (user) {
          const nameParts = (user.name || "").split(" ");
          setForm((prev) => ({
            ...prev,
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: user.phone || ""
          }));
          if (user.profileImage) {
            setProfileUrl(user.profileImage);
          }
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSave = async () => {
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
    try {
      const formData = new FormData();
      formData.append("name", `${form.firstName} ${form.lastName}`.trim());
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      
      if (form.currentPassword && form.newPassword) {
        formData.append("currentPassword", form.currentPassword);
        formData.append("newPassword", form.newPassword);
      }
      
      if (profileFile) {
        formData.append("profileImage", profileFile);
      }

      const response = await adminApi.updateProfile(formData);
      
      toast.success("Profile saved successfully!");
      setForm({...form, currentPassword: '', newPassword: '', confirmNewPassword: ''});
      setProfileFile(null); // Clear file since it's uploaded
      
      // Optionally update user context if it holds these values
      if (checkAuth) {
        await checkAuth(); // Refresh the AuthContext
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Profile" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Buttons */}
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
              <Link to="/admin/settings/profile" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                About
              </Link>
            </div>

            <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button onClick={() => { logout(); navigate('/login'); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-2 sm:px-4 py-2.5 bg-white hover:bg-[#b45309]/10 border border-[#b45309]/30 text-[#b45309] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors text-center w-full sm:w-auto truncate">
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

          <div className="space-y-6 max-w-5xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-[#f4f7f6]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#b45309] border-t-transparent rounded-full"></div>
              </div>
            )}
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
                        setProfileFile(e.target.files[0]);
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
                  <h4 className="text-lg font-bold text-slate-800">{form.firstName} {form.lastName}</h4>
                  <p className="text-sm text-slate-500 font-medium mb-1.5">{form.email}</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Change Password</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="********" 
                      className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.currentPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        placeholder="********" 
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.newPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        value={form.confirmNewPassword}
                        onChange={handleChange}
                        placeholder="********" 
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder-slate-400 ${errors.confirmNewPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmNewPassword}</p>}
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
