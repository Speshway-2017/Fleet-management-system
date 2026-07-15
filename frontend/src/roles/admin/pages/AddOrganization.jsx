import { useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { Upload, Eye, EyeOff } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function AddOrganization() {
  const navigate = useNavigate();
  const { fetchOrganizations, fetchNotifications } = useAdmin();
  const [form, setForm] = useState({
    name: "", industry: "", email: "", phone: "", address: "",
    city: "", state: "", country: "", plan: "", status: ""
  });
  const [managers, setManagers] = useState([
    { name: "", email: "", phone: "", password: "", confirmPassword: "", showPassword: false, showConfirmPassword: false }
  ]);
  const [errors, setErrors] = useState({});
  const [managerErrors, setManagerErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleManagerChange = (index, field, value) => {
    const newManagers = [...managers];
    newManagers[index][field] = value;
    setManagers(newManagers);
    
    // clear specific error
    const newManagerErrors = [...managerErrors];
    if (newManagerErrors[index]) {
      newManagerErrors[index][field] = "";
      setManagerErrors(newManagerErrors);
    }
  };

  const addManager = () => {
    setManagers([...managers, { name: "", email: "", phone: "", password: "", confirmPassword: "", showPassword: false, showConfirmPassword: false }]);
    setManagerErrors([...managerErrors, {}]);
  };

  const removeManager = (index) => {
    if (managers.length > 1) {
      const newManagers = managers.filter((_, i) => i !== index);
      const newManagerErrors = managerErrors.filter((_, i) => i !== index);
      setManagers(newManagers);
      setManagerErrors(newManagerErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = "Organization Name is required";
    if (!form.industry) newErrors.industry = "Industry is required";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone)) newErrors.phone = "Invalid phone format";

    let hasManagerErrors = false;
    const newManagerErrors = managers.map((manager, index) => {
      const mErr = {};
      if (!manager.name) mErr.name = "Manager Name is required";
      if (!manager.email) mErr.email = "Manager Email is required";
      else if (!/\S+@\S+\.\S+/.test(manager.email)) mErr.email = "Invalid email format";
      if (!manager.password) mErr.password = "Password is required";
      else if (manager.password.length < 6) mErr.password = "Password must be at least 6 characters";
      if (manager.password !== manager.confirmPassword) mErr.confirmPassword = "Passwords do not match";
      
      if (Object.keys(mErr).length > 0) hasManagerErrors = true;
      return mErr;
    });

    setErrors(newErrors);
    setManagerErrors(newManagerErrors);
    if (Object.keys(newErrors).length > 0 || hasManagerErrors) return;

    setIsSubmitting(true);
    
    // Construct payload
    const payload = {
      name: form.name, industry: form.industry, email: form.email, phone: form.phone,
      address: form.address, city: form.city, state: form.state, country: form.country,
      plan: form.plan, status: form.status,
      managers: managers.map(m => ({ name: m.name, email: m.email, phone: m.phone, password: m.password }))
    };
    
    try {
      await adminApi.createOrganization(payload);
      toast.success("Organization created successfully!");
      if (fetchOrganizations) await fetchOrganizations(); // Refresh the list
      if (fetchNotifications) await fetchNotifications(); // Refresh notifications
      navigate("/admin/organizations");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organizations" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/organizations" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Organization List</span>
            </Link>
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">Add Org</span>
              <span className="hidden sm:inline">Add Organization</span>
            </button>
            <Link to="/admin/organizations/details" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">Organization Details</span>
            </Link>
            <Link to="/admin/organizations/edit" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Edit Org</span>
              <span className="hidden sm:inline">Edit Organization</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-lg font-bold text-slate-800">Add New Organization</h2>
              <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link to="/admin/organizations" className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#A14000] border border-[#A14000] bg-transparent hover:bg-[#A14000]/10 rounded-lg transition-colors text-center truncate">
                  Cancel
                </Link>
                <button type="submit" disabled={isSubmitting} className="flex-[2] sm:flex-none px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors text-center truncate disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Organization"}
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

            {/* Fleet Managers Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Add Fleet Manager(s)</h3>
              </div>
              
              <div className="space-y-6">
                {managers.map((manager, index) => {
                  const mErr = managerErrors[index] || {};
                  return (
                    <div key={index} className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative">
                      {managers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeManager(index)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
                        {/* Manager Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                          <input type="text" value={manager.name} onChange={(e) => handleManagerChange(index, 'name', e.target.value)} placeholder="Full Name" className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${mErr.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                          {mErr.name && <p className="text-xs text-red-500 mt-1">{mErr.name}</p>}
                        </div>
                        {/* Manager Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Email Address</label>
                          <input type="email" value={manager.email} onChange={(e) => handleManagerChange(index, 'email', e.target.value)} placeholder="Email Address" className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${mErr.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                          {mErr.email && <p className="text-xs text-red-500 mt-1">{mErr.email}</p>}
                        </div>
                        {/* Manager Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Phone Number</label>
                          <input type="tel" value={manager.phone} onChange={(e) => handleManagerChange(index, 'phone', e.target.value)} placeholder="Phone Number" className="w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]" />
                        </div>
                        {/* Role (Read Only) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Role</label>
                          <input type="text" value="Fleet Manager" disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-500 bg-slate-100 cursor-not-allowed" />
                        </div>
                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Password</label>
                          <div className="relative">
                            <input type={manager.showPassword ? "text" : "password"} value={manager.password} onChange={(e) => handleManagerChange(index, 'password', e.target.value)} placeholder="Create Password" className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 pr-10 ${mErr.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                            <button type="button" onClick={() => handleManagerChange(index, 'showPassword', !manager.showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                              {manager.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {mErr.password && <p className="text-xs text-red-500 mt-1">{mErr.password}</p>}
                        </div>
                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Confirm Password</label>
                          <div className="relative">
                            <input type={manager.showConfirmPassword ? "text" : "password"} value={manager.confirmPassword} onChange={(e) => handleManagerChange(index, 'confirmPassword', e.target.value)} placeholder="Confirm Password" className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 pr-10 ${mErr.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`} />
                            <button type="button" onClick={() => handleManagerChange(index, 'showConfirmPassword', !manager.showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                              {manager.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {mErr.confirmPassword && <p className="text-xs text-red-500 mt-1">{mErr.confirmPassword}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addManager}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-medium hover:border-[#A14000] hover:text-[#A14000] hover:bg-orange-50 transition-colors"
                >
                  + Add Another Fleet Manager
                </button>
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Logo Upload</h3>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                
                <label className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#A14000]/50 transition-colors cursor-pointer group relative overflow-hidden">
                  <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="" />
                  {logoPreview ? (
                    <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
                      <img src={logoPreview} alt="Logo Preview" className="max-h-32 object-contain mb-4" />
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Click to change logo
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#A14000]/10 transition-colors pointer-events-none">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#A14000]" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mb-1 pointer-events-none">
                        Drag & drop logo here or <span className="text-[#A14000]">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 pointer-events-none">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </label>

              </div>
            </div>

          </form>
          
        </main>
      </div>
    </div>
  );
}
