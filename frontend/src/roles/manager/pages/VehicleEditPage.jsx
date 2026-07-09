import { useState, useEffect } from "react";
import { ArrowLeft, Save, FileText, Calendar, Zap } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import VehicleDocuments from "../vehicle-management/components/VehicleDocuments";

export default function VehicleEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
    const found = vehicles.find((v) => v.id === parseInt(id));
    if (found) {
      setVehicle(found);
      setFormData({ ...found });
    } else {
      toast.error("Vehicle not found");
      navigate("/manager/vehicles-list");
    }
    setLoading(false);
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fastagBalance" ? Number(value) : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.plateNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      const vehicles = JSON.parse(localStorage.getItem("fleet_vehicles") || "[]");
      const updated = vehicles.map((v) => (v.id === vehicle.id ? formData : v));
      localStorage.setItem("fleet_vehicles", JSON.stringify(updated));
      toast.success("Vehicle updated successfully!");
      setSaving(false);
      navigate(`/manager/vehicle-details/${vehicle.id}`);
    }, 500);
  };

  if (loading || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 lg:p-8 bg-[#F5F7FB]">
        <p className="text-[#64748B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-[#F5F7FB] font-nunito text-[#1E293B] min-h-screen">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Edit Vehicle Details
          </h1>
        </div>
      </div>

      {/* Top Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Vehicle Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">VEHICLE</p>
          <div className="flex items-start gap-3">
            <div className="bg-[#FDF3EC] p-2 rounded flex-shrink-0">
              <FileText className="w-5 h-5 text-[#B45A0A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1E293B]">{formData.name}</p>
              <p className="text-xs text-[#64748B] mt-1 uppercase truncate">{formData.plateNumber}</p>
            </div>
          </div>
        </div>

        {/* Insurance Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">Insurance Expiry</p>
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded flex-shrink-0">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-600">
                {formData.insuranceExpiry ? new Date(formData.insuranceExpiry).toLocaleDateString("en-IN") : "N/A"}
              </p>
              <p className="text-xs text-[#64748B] mt-1">✓ Valid and Active</p>
            </div>
          </div>
        </div>

        {/* FASTag Card */}
        <div className="bg-white rounded-xl border border-[#E7EAF0] p-4">
          <p className="text-xs text-[#64748B] font-bold uppercase mb-2">FASTag Balance</p>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded flex-shrink-0">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1E293B]">₹{formData.fastagBalance?.toLocaleString("en-IN") || "0"}</p>
              <p className="text-xs text-[#64748B] mt-1">Balance Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Plate Badge */}
      <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="bg-[#FDF3EC] px-4 py-2 rounded-lg border-2 border-[#B45A0A]">
              <p className="text-lg font-bold text-[#B45A0A] uppercase">{formData.plateNumber}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-bold uppercase">Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  formData.status === "Available" ? "bg-green-100 text-green-700" :
                  formData.status === "On Trip" ? "bg-orange-100 text-orange-700" :
                  formData.status === "Maintenance" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {formData.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => navigate(`/manager/vehicle-details/${vehicle.id}`)}
              className="px-4 py-2 border border-[#E7EAF0] rounded-lg text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  SAVING
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  SAVE CHANGES
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - General Information */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              General Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Vehicle Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Model Name</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year || ""}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Fuel Type</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType || "Diesel"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                  >
                    <option>Diesel</option>
                    <option>Petrol</option>
                    <option>CNG</option>
                    <option>Electric</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Manufacturer Details</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer || ""}
                  onChange={handleChange}
                  placeholder="Enter manufacturer name or details"
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Registration & Legal */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Registration & Legal
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Plate No.</label>
                <input
                  type="text"
                  name="plateNumber"
                  value={formData.plateNumber || ""}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] uppercase bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status || "Available"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                  >
                    <option>Available</option>
                    <option>On Trip</option>
                    <option>Maintenance</option>
                    <option>Idle</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Ownership</label>
                  <select
                    name="ownership"
                    value={formData.ownership || "Owned"}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                  >
                    <option>Owned</option>
                    <option>Leased</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Driver Assigned</label>
                <input
                  type="text"
                  name="driver"
                  value={formData.driver || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Last Service Date</label>
                <input
                  type="date"
                  name="lastService"
                  value={formData.lastService || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Insurance & Dates Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Insurance Information */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Insurance Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Insurance Expiry Date</label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">FASTag Balance</label>
                <input
                  type="number"
                  name="fastagBalance"
                  value={formData.fastagBalance || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Service Schedule */}
          <div className="bg-white rounded-xl border border-[#E7EAF0] p-6">
            <h3 className="text-sm font-bold text-[#1E293B] uppercase mb-6 pb-4 border-b border-[#E7EAF0]">
              Service Schedule
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Next Service Due</label>
                <input
                  type="date"
                  name="nextService"
                  value={formData.nextService || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch || ""}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-lg text-sm focus:outline-none focus:border-[#B45A0A] bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Documents Section */}
      <div className="mt-8">
        <VehicleDocuments vehicleId={vehicle.id} />
      </div>
    </div>
  );
}
