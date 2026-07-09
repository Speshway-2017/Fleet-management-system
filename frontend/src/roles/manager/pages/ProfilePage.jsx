import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Truck,
  Edit3,
  FileDown,
  LogOut,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAction = (actionName) => {
    toast.success(`Action triggered: ${actionName}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in font-nunito text-gray-800">
      <Breadcrumb />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Profile</h1>
        <p className="text-[18px] text-[#64748B] mt-[12px]">Manage your account details and profile information.</p>
      </div>

      {/* ── PROFILE HEADER CARD ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm relative overflow-hidden">
        {/* Background accent curve graphic (subtle design polish) */}
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-orange-50/20 rounded-l-full pointer-events-none hidden lg:block" style={{ transform: "translateX(50px)" }} />

        {/* Profile Image */}
        <img
          src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=250&auto=format&fit=crop"
          alt="Alex Thompson Profile"
          className="w-24 h-24 rounded-lg object-cover border border-gray-200 shadow-sm"
        />

        {/* Text Area */}
        <div className="flex-1 text-center md:text-left space-y-3 z-10">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-start">
              <h2 className="font-poppins font-black text-2xl text-gray-900 leading-none">
                {user?.name || "Alex Thompson"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-orange-50 text-[#B45A0A] border border-orange-100 uppercase">
                Active
              </span>
            </div>
            <p className="text-sm font-semibold text-gray-500 font-poppins">
              Fleet Manager • North India Sector
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <button
              onClick={() => navigate("/manager/profile/edit")}
              className="px-4 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer border-none"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => handleAction("Export Credentials")}
              className="px-4 py-2.5 bg-white hover:bg-gray-50 text-[#B45A0A] border border-gray-250 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Credentials</span>
            </button>


          </div>
        </div>
      </div>

      {/* ── ROW 2: PERSONAL INFO, PERFORMANCE, DISPATCHES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Card A: Personal Info */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-6 border-b border-gray-100 pb-3">
            <User className="w-4 h-4 text-[#B45A0A]" />
            <h3 className="font-poppins font-black text-sm text-gray-900">Personal Info</h3>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Email Address</span>
              <p className="text-xs font-bold text-gray-700 mt-1 font-poppins truncate">
                {user?.email || "a.thompson@primefleetlogistics.com"}
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Phone Number</span>
              <p className="text-xs font-bold text-gray-700 mt-1 font-poppins">
                +91 98765 43210
              </p>
            </div>

            <div>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Location Base</span>
              <p className="text-xs font-bold text-gray-700 mt-1 font-poppins">
                Mumbai Corporate Hub, India
              </p>
            </div>
          </div>
        </div>

        {/* Card C: Total Dispatches */}
        <div className="lg:col-span-5 bg-[#1A1A1E] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start z-10">
            <div className="p-3 bg-white/10 rounded-xl">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded">
              Annual
            </span>
          </div>

          <div className="mt-8 z-10">
            <h4 className="text-4xl font-black font-poppins leading-none">1,248</h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2.5 font-poppins">
              Total Dispatches
            </p>
          </div>

          {/* Decorative background circle */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
        </div>

      </div>

      {/* ── ROW 3: OPERATIONAL OVERVIEW, MAP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Operational Overview Column */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
            <h3 className="font-poppins font-black text-sm text-gray-900">Operational Overview</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Real-Time Data</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Metrics Cards */}
            <div className="space-y-4">
              {/* Metric 1 */}
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-orange-100 rounded-lg text-[#B45A0A]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block leading-none">Managed Vehicles</span>
                  <p className="text-sm font-black text-[#B45A0A] mt-1.5 font-poppins">43 Units</p>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block leading-none">Assigned Region</span>
                  <p className="text-sm font-black text-blue-800 mt-1.5 font-poppins">Delhi-Mumbai Corridor</p>
                </div>
              </div>
            </div>

            {/* Right KPI Progress Bar */}
            <div className="flex flex-col justify-center space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1">
                  <span className="font-poppins uppercase tracking-wider text-[10px]">Efficiency KPI</span>
                  <span className="text-[#B45A0A]">92%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#B45A0A] rounded-full transition-all duration-1000" style={{ width: "92%" }} />
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Currently 4% above the regional average for high-density logistics management.
              </p>
            </div>
          </div>
        </div>

        {/* Map Column */}
        <div className="lg:col-span-5 bg-[#102A43] rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[250px]">
          {/* US Map Background Image/Mock */}
          <div className="absolute inset-0 bg-cover bg-center opacity-30 select-none pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102A43] via-transparent to-transparent pointer-events-none" />

          {/* Top text or empty space */}
          <div className="z-10" />

          {/* Bottom Row info */}
          <div className="flex justify-between items-end mt-auto z-10 w-full">
            <div>
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-wider block">Primary Sector</span>
              <h4 className="text-lg font-black font-poppins mt-1">Mumbai Sector Hub</h4>
            </div>

            <button
              onClick={() => handleAction("Open Sector Chat")}
              className="p-3 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-full shadow-lg shadow-[#B45A0A]/30 transition-all cursor-pointer border-none flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
