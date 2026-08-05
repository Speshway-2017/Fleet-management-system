import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { User, Save, RefreshCw } from "lucide-react";

export default function DriverProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(user?.fullName || user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.phoneNumber || user?.phoneNo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || "");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getProfile();
      if (res?.success && res.data) {
        const d = res.data;
        setName(d.fullName || d.name || user?.fullName || user?.name || "");
        setPhoneNumber(d.phone || d.phoneNumber || user?.phone || user?.phoneNumber || user?.phoneNo || "");
        setEmail(d.email || user?.email || "");
        setLicenseNumber(d.licenseNumber || user?.licenseNumber || "");
      }
    } catch (err) {
      console.error("Error fetching driver profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await driverApi.updateProfile({
        fullName: name,
        name,
        phone: phoneNumber,
        phoneNumber,
        email,
        licenseNumber
      });

      if (res?.success) {
        toast.success("Profile updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-poppins">
        <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-nunito pb-12 max-w-4xl mx-auto">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-[#B45A0A]" />
          Driver Profile Details
        </h1>
        <p className="text-slate-500 text-xs mt-1">
          Manage your personal contact details, license numbers, and shift preferences.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#B45A0A] flex items-center justify-center font-bold font-poppins text-xl">
              {name ? name.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <h2 className="text-lg font-bold font-poppins text-slate-900">{name || "Driver Name"}</h2>
              <p className="text-xs text-slate-500">Role: Registered Fleet Driver</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-poppins uppercase text-slate-700">Driving License Number</label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="mt-2 block w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs flex items-center gap-2 transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
