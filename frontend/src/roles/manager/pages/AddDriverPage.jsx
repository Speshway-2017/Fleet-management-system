import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Award,
  Calendar,
  AlertCircle,
  Save,
  Trash2,
  FileUp
} from "lucide-react";
import toast from "react-hot-toast";
export default function AddDriverPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    licenseType: "HMV",
    licenseExpiry: "",
    status: "Available",
    assignedVehicle: "Unassigned",
    rating: 5.0,
    experience: "5 Years",
    tripsCompleted: 0,
    incidentCount: 0,
    medicalFitnessStatus: "Fit",
    joiningDate: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    if (isEditMode) {
      const savedDrivers = localStorage.getItem("fleet_drivers");
      if (savedDrivers) {
        const list = JSON.parse(savedDrivers);
        const found = list.find(d => d.id === Number(id));
        if (found) {
          setFormData(found);
        } else {
          toast.error("Driver profile not found");
          navigate("/manager/drivers");
        }
      }
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email || !formData.licenseNumber) {
      toast.error("Please fill in all required fields marked with *");
      return;
    }

    const savedDrivers = localStorage.getItem("fleet_drivers");
    let list = savedDrivers ? JSON.parse(savedDrivers) : [];

    if (isEditMode) {
      // 1. Update driver's name in vehicle assignment if name changed
      const oldDriverName = list.find(d => d.id === Number(id))?.name;
      if (oldDriverName && oldDriverName !== formData.name) {
        const savedVehicles = localStorage.getItem("fleet_vehicles");
        if (savedVehicles) {
          const vehicles = JSON.parse(savedVehicles);
          const updatedVehicles = vehicles.map(v => 
            v.driver === oldDriverName ? { ...v, driver: formData.name } : v
          );
          localStorage.setItem("fleet_vehicles", JSON.stringify(updatedVehicles));
        }
      }

      // 2. Update driver object
      const updatedList = list.map(d => d.id === Number(id) ? formData : d);
      localStorage.setItem("fleet_drivers", JSON.stringify(updatedList));
      toast.success("Driver profile updated successfully!");
    } else {
      // Create new driver object
      const newDriver = {
        ...formData,
        id: list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1,
        rating: Number(formData.rating) || 5.0,
        tripsCompleted: 0,
        incidentCount: 0,
        assignedVehicle: "Unassigned"
      };

      list.push(newDriver);
      localStorage.setItem("fleet_drivers", JSON.stringify(list));
      toast.success("New driver profile registered successfully!");
    }

    navigate("/manager/drivers");
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
          
          {/* --- HEADER --- */}
          <div className="flex items-center gap-4 border-b border-[#E7EAF0] pb-6">
            <button
              onClick={() => navigate(isEditMode ? `/manager/driver-profile/${id}` : "/manager/drivers")}
              className="p-2.5 bg-white border border-[#E7EAF0] hover:bg-[#F5F7FB] rounded-xl text-[#64748B] hover:text-[#1E293B] transition-all cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-poppins font-black text-2xl text-[#1E293B] tracking-tight">
                {isEditMode ? "Edit Driver Profile" : "Register New Driver"}
              </h1>
              <p className="text-sm text-[#64748B] mt-0.5 font-medium">
                {isEditMode ? "Modify parameters for this driver roster item." : "Create a new compliant operator identity record."}
              </p>
            </div>
          </div>

          {/* --- FORM CONTAINER --- */}
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
            
            {/* CARD 1: Personal Details */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
              <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B45A0A]" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 99988 87776"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ramesh.c@fleet.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>

                {/* Status Selection */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option>Available</option>
                    <option>On Trip</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 2: License Details */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
              <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-[#B45A0A]" />
                Driving License & Compliance Certificates
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DL Number */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-1820220011223"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>

                {/* License Class/Type */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">License Class</label>
                  <select
                    value={formData.licenseType}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option>HMV</option>
                    <option>LMV</option>
                    <option>MCWG</option>
                  </select>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.licenseExpiry}
                    onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>
              </div>

              {/* Fake Upload for Scan copy */}
              <div>
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">Driving License Scan (PDF/PNG)</label>
                <div className="border-2 border-dashed border-[#E7EAF0] hover:border-[#B45A0A] rounded-xl p-6 text-center cursor-pointer transition-colors select-none">
                  <FileUp className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
                  <span className="text-xs text-gray-500 font-bold block">Drag files here or click to upload scan documents</span>
                  <span className="text-[10px] text-gray-400 block mt-1">PDF, JPG, PNG up to 5MB</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Employment Info */}
            <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
              <h3 className="font-poppins font-bold text-[#1E293B] text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B45A0A]" />
                Professional & Roster Parameters
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Years Experience */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Driving Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 5 Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>

                {/* Joining Date */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  />
                </div>

                {/* Medical Fitness */}
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">Medical Fitness Status</label>
                  <select
                    value={formData.medicalFitnessStatus}
                    onChange={(e) => setFormData({ ...formData, medicalFitnessStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
                  >
                    <option>Fit</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(isEditMode ? `/manager/driver-profile/${id}` : "/manager/drivers")}
                className="px-6 py-3 border border-[#E7EAF0] hover:bg-gray-100 rounded-xl text-sm font-bold text-[#64748B] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-3 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-extrabold text-white transition-all shadow-md shadow-[#B45A0A]/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4.5 h-4.5" />
                <span>{isEditMode ? "Save Changes" : "Register Driver"}</span>
              </button>
            </div>

          </form>

    </div>
  );
}
