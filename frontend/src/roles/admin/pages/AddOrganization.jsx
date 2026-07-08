import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function AddOrganization() {
  const navigate = useNavigate();
  const { addOrganization } = useAdmin();
  const [form, setForm] = useState({
    name: "", industry: "", email: "", phone: "", address: "",
    city: "", state: "", country: "", plan: "", status: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = "Organization Name is required";
    if (!form.industry) newErrors.industry = "Industry is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone)) newErrors.phone = "Invalid phone format";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addOrganization(form);
    toast.success("Organization created successfully!");
    navigate("/admin/organizations");
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organizations" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/organizations" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Organization List</Link>
            <button className="px-6 py-2.5 bg-[#0f172a] text-white text-sm font-bold rounded-full shadow-sm">Add Organization</button>
            <Link to="/admin/organizations/details" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Organization Details</Link>
            <Link to="/admin/organizations/edit" className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors">Edit Organization</Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-lg font-bold text-slate-800">Add New Organization</h2>
              <div className="flex items-center gap-3">
                <Link to="/admin/organizations" className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </Link>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors">
                  Create Organization
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Organization Information</h3>
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Org Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Organization Name</label>
                    <input type="text" name="name" placeholder="Organization Name" value={form.name} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                  </div>
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Industry</label>
                    <input type="text" name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.industry ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                    {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
                  </div>
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                    <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                    <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  {/* Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block">Street Address</label>
                    <input type="text" name="address" placeholder="Street Address" value={form.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" />
                  </div>
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">City</label>
                    <input type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" />
                  </div>
                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">State</label>
                    <input type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" />
                  </div>
                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Country</label>
                    <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" />
                  </div>
                  {/* Subscription Plan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Subscription Plan</label>
                    <select name="plan" value={form.plan} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 appearance-none">
                      <option value="" disabled className="text-slate-400">Select plan</option>
                      <option value="Enterprise">Enterprise</option>
                      <option value="Professional">Professional</option>
                      <option value="Standard">Standard</option>
                    </select>
                  </div>
                  {/* Status */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 appearance-none">
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
