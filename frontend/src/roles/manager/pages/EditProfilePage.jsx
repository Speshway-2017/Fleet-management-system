import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Camera,
  Key,
  Shield,
  LogOut,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  Building
} from "lucide-react";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State fields
  const [fullName, setFullName] = useState(user?.name || "Alex Thompson");
  const [email, setEmail] = useState(user?.email || "alex.thompson@fleet.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [jobTitle, setJobTitle] = useState("Senior Fleet Manager");
  const [primaryHub, setPrimaryHub] = useState("Mumbai HQ - Central Logistics");
  
  // Notification states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [browserNotif, setBrowserNotif] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
    navigate("/manager/profile");
  };

  const handleCancel = () => {
    navigate("/manager/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in font-nunito text-gray-800">
      
      {/* ── HEADER BACK NAVIGATION ── */}
      <div className="space-y-1.5">
        <button
          onClick={() => navigate("/manager/profile")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#B45A0A] hover:text-[#9A4D08] transition-colors border-none bg-transparent cursor-pointer p-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </button>
        <div>
          <h1 className="font-poppins font-black text-2xl text-gray-900 tracking-tight leading-none mt-1">
            Edit Profile
          </h1>
          <p className="text-xs font-semibold text-gray-505 mt-1 font-nunito">
            Manage your account settings and executive preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ── LEFT COLUMN: PHOTO & SECURITY ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Photo Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&auto=format&fit=crop"
                alt="Alex Thompson"
                className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm"
              />
              <div className="absolute bottom-0 right-0 p-1.5 bg-[#B45A0A] text-white rounded-full border-2 border-white shadow">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <h3 className="font-poppins font-black text-base text-gray-900 mt-4 leading-none">
              {fullName}
            </h3>
            <p className="text-xs font-medium text-gray-400 mt-1 truncate max-w-full">
              {email}
            </p>

            <div className="w-full space-y-2 mt-5">
              <button
                type="button"
                onClick={() => toast.success("Photo upload triggered")}
                className="w-full py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
              >
                Change Photo
              </button>
              <button
                type="button"
                onClick={() => toast.success("Photo removed")}
                className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Remove Photo
              </button>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">
              Security
            </h4>
            
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate("/manager/profile/reset-password")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border-none bg-transparent"
              >
                <Key className="w-4 h-4 text-gray-400" />
                <span>Reset Password</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/manager/profile/2fa")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border-none bg-transparent"
              >
                <Shield className="w-4 h-4 text-gray-400" />
                <span>2FA Settings</span>
              </button>
            </div>
          </div>


        </div>

        {/* ── RIGHT COLUMN: INPUTS & SETTINGS ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Personal Information */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-orange-50/30 px-6 py-3 border-b border-gray-100">
              <h3 className="font-poppins font-black text-xs text-[#B45A0A] uppercase tracking-wider">
                Personal Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Operational Details */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-orange-50/30 px-6 py-3 border-b border-gray-100">
              <h3 className="font-poppins font-black text-xs text-[#B45A0A] uppercase tracking-wider">
                Operational Details
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Assigned Region</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none bg-gray-50 text-gray-500 cursor-not-allowed appearance-none"
                    disabled
                  >
                    <option>India - West Zone</option>
                  </select>
                </div>
                <p className="text-[10px] font-medium text-gray-400 italic mt-1 pl-1">
                  Locked by system administrator.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Primary Hub</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={primaryHub}
                    onChange={(e) => setPrimaryHub(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#B45A0A] bg-white text-gray-800 appearance-none font-nunito"
                  >
                    <option>Mumbai HQ - Central Logistics</option>
                    <option>Delhi Depot - North Hub</option>
                    <option>Chennai Terminal - South Sector</option>
                    <option>Kolkata Depot - East Hub</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Notification Preferences */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-orange-50/30 px-6 py-3 border-b border-gray-100">
              <h3 className="font-poppins font-black text-xs text-[#B45A0A] uppercase tracking-wider">
                Notification Preferences
              </h3>
            </div>
            <div className="p-6 space-y-3 font-nunito">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="rounded border-gray-300 text-[#B45A0A] focus:ring-[#B45A0A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-700">Email Notifications for system reports</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={smsNotif}
                  onChange={(e) => setSmsNotif(e.target.checked)}
                  className="rounded border-gray-300 text-[#B45A0A] focus:ring-[#B45A0A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-700">SMS Alerts for urgent critical compliance events</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserNotif}
                  onChange={(e) => setBrowserNotif(e.target.checked)}
                  className="rounded border-gray-300 text-[#B45A0A] focus:ring-[#B45A0A] w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-700">In-app browser push updates for active route changes</span>
              </label>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-250 rounded-xl text-xs font-bold transition-all cursor-pointer text-gray-700"
            >
              Cancel Changes
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none"
            >
              Save Profile Changes
            </button>
          </div>
          
        </div>

      </form>

    </div>
  );
}
