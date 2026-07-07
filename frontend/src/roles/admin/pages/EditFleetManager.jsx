import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function EditFleetManager() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "James Carter",
    email: "j.carter@abclogistics.com",
    phone: "+1 555-0101",
    organization: "ABC Logistics",
    role: "Fleet Manager",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting:", formData);
    navigate("/admin/fleet-managers");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Edit Fleet Manager" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/fleet-managers" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Fleet Manager List</Link>
            <Link to="/admin/fleet-managers/add" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Add Fleet Manager</Link>
            <Link to="/admin/fleet-managers/details" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Manager Details</Link>
            <button className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm">Edit Manager</button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Link to="/admin/fleet-managers" className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </Link>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-[#B45A0A] border border-[#B45A0A] rounded-lg shadow-sm hover:bg-[#8a4406] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-[15px] font-extrabold text-slate-800 mb-8 tracking-wide">Fleet Manager Information</h2>
              
              <div className="space-y-6 max-w-4xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                    placeholder="e.g. James Carter"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                      placeholder="manager@organization.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Assign Organization</label>
                    <select 
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all text-slate-700"
                    >
                      <option value="" disabled>Select Organization</option>
                      <option value="ABC Logistics">ABC Logistics</option>
                      <option value="XYZ Transport">XYZ Transport</option>
                      <option value="VRL Freight">VRL Freight</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Role</label>
                    <select 
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all text-slate-700"
                    >
                      <option value="" disabled>Select Role</option>
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Confirm Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              
            </div>
          </form>
          
        </main>
      </div>
    </div>
  );
}
