import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import OrganizationTabs from "@/components/admin/OrganizationTabs";

export default function AddOrganization() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    industry: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    plan: "",
    status: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    navigate("/admin/organizations");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Add Organization" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          <form onSubmit={handleSubmit}>
            {/* Tabs & Action Buttons */}
            <div className="flex items-center justify-between gap-6 mb-8 border-b border-slate-200 pb-4 flex-wrap">
              <OrganizationTabs activeTab="add" />
              
              <div className="flex items-center gap-3">
                <Link to="/admin/organizations" className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 hover:text-slate-700 transition-colors">
                  Cancel
                </Link>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors">
                  Create Organization
                </button>
              </div>
            </div>

            {/* Organization Information Section */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Organization Information</h3>
              <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Organization Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Organization Name</label>
                    <input 
                      type="text" 
                      name="name"
                      placeholder="e.g. ABC Logistics" 
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="contact@organization.com" 
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                      required
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Industry</label>
                    <select 
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 appearance-none"
                    >
                      <option value="" disabled className="text-slate-400">Select industry</option>
                      <option value="Freight">Freight</option>
                      <option value="Logistics">Logistics</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Courier">Courier</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="+1 (555) 000-0000" 
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* Address (Full Width) */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block">Address</label>
                    <input 
                      type="text" 
                      name="address"
                      placeholder="Street address" 
                      value={form.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">City</label>
                    <input 
                      type="text" 
                      name="city"
                      placeholder="City" 
                      value={form.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">State</label>
                    <input 
                      type="text" 
                      name="state"
                      placeholder="State" 
                      value={form.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Country</label>
                    <input 
                      type="text" 
                      name="country"
                      placeholder="Country" 
                      value={form.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50"
                    />
                  </div>

                  {/* Subscription Plan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Subscription Plan</label>
                    <select 
                      name="plan"
                      value={form.plan}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 appearance-none"
                    >
                      <option value="" disabled className="text-slate-400">Select plan</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Professional">Professional</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Status</label>
                    <select 
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 appearance-none"
                    >
                      <option value="" disabled className="text-slate-400">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending Approval</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Logo Upload</h3>
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
                
                <label className="w-full max-w-2xl border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#A14000]/50 transition-colors cursor-pointer group relative">
                  <input type="file" accept="image/png, image/jpeg" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="" />
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#A14000]/10 transition-colors pointer-events-none">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#A14000]" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1 pointer-events-none">
                    Drag & drop logo here or <span className="text-[#A14000]">browse</span>
                  </p>
                  <p className="text-xs text-slate-400 pointer-events-none">
                    PNG, JPG up to 5MB
                  </p>
                </label>

              </div>
            </div>

          </form>
          
        </main>
      </div>
    </div>
  );
}
