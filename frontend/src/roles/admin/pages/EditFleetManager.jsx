import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function EditFleetManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFleetManager, updateFleetManager, organizations } = useAdmin();
  const manager = getFleetManager(id);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    role: "Fleet Manager",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (manager) {
      setFormData({
        fullName: manager.name || "",
        email: manager.email || "",
        phone: manager.phone || "",
        organization: manager.org || "",
        role: "Fleet Manager",
        password: "",
        confirmPassword: ""
      });
    }
  }, [manager]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    if (formData.phone && !/^\+?[0-9\s-]{7,15}$/.test(formData.phone)) newErrors.phone = "Invalid phone format";
    if (!formData.organization) newErrors.organization = "Organization is required";
    if (!formData.role) newErrors.role = "Role is required";

    if (formData.password) {
      if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      else if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain uppercase letter";
      else if (!/[0-9]/.test(formData.password)) newErrors.password = "Password must contain a number";
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = "Password must contain special character";
      
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    updateFleetManager(id, {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      org: formData.organization,
      role: formData.role
    });
    toast.success("Manager updated successfully!");
    navigate("/admin/fleet-managers");
  };

  if (!manager) return <div className="p-8">Manager not found.</div>;

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
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.fullName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    placeholder="e.g. James Carter"
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                      placeholder="manager@organization.com"
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Assign Organization</label>
                    <select 
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all text-slate-700 ${errors.organization ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    >
                      <option value="" disabled>Select Organization</option>
                      {organizations.map(org => (
                        <option key={org.id} value={org.name}>{org.name}</option>
                      ))}
                    </select>
                    {errors.organization && <p className="text-xs text-red-500 mt-1">{errors.organization}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Role</label>
                    <select 
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all text-slate-700 ${errors.role ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    >
                      <option value="" disabled>Select Role</option>
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Admin">Admin</option>
                    </select>
                    {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
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
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Confirm Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
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
