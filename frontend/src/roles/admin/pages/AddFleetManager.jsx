import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";

export default function AddFleetManager() {
  const navigate = useNavigate();
  const { fetchFleetManagers, fetchNotifications, fetchOrganizations } = useAdmin();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    role: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [activeOrgs, setActiveOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setOrgsLoading(true);
        const response = await adminApi.getOrganizations();
        const data = response.data?.data || response.data || [];
        // Deduplicate organizations and filter active ones
        const uniqueOrgs = Array.from(
          new Map(data.map(org => [org.id || org._id, org])).values()
        );
        const active = uniqueOrgs.filter(org => org.status !== "Suspended");
        setActiveOrgs(active);
      } catch (err) {
        console.error("Failed to fetch organizations:", err);
        setOrgsError(true);
      } finally {
        setOrgsLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
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
    } else {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await adminApi.createFleetManager({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        role: formData.role,
        password: formData.password
      });
      
      toast.success("Manager added successfully!");
      if (fetchFleetManagers) await fetchFleetManagers();
      if (fetchNotifications) await fetchNotifications();
      if (fetchOrganizations) await fetchOrganizations();
      navigate("/admin/fleet-managers");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to create fleet manager");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Add Fleet Manager" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/fleet-managers" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Fleet Manager List</span>
            </Link>
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">Add Mgr</span>
              <span className="hidden sm:inline">Add Fleet Manager</span>
            </button>
            <Link to="/admin/fleet-managers/details" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">Manager Details</span>
            </Link>
            <Link to="/admin/fleet-managers/edit" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Edit Mgr</span>
              <span className="hidden sm:inline">Edit Manager</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
              <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link to="/admin/fleet-managers" className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#A14000] border border-[#A14000] bg-transparent hover:bg-[#A14000]/10 rounded-lg transition-colors text-center truncate">
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  disabled={orgsLoading || orgsError || activeOrgs.length === 0 || isSubmitting}
                  className="flex-[2] sm:flex-none px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors text-center truncate disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Fleet Manager"}
                </button>
              </div>
            </div>

            {/* Empty State Warning */}
            {(!orgsLoading && !orgsError && activeOrgs.length === 0) && (
              <div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 rounded-xl p-4 text-sm font-medium">
                No active organizations available. Please ask a Super Admin to create an organization first.
              </div>
            )}
            {orgsError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm font-medium">
                Failed to load organizations. Please try refreshing the page.
              </div>
            )}

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
                      disabled={orgsLoading || orgsError || activeOrgs.length === 0}
                    >
                      <option value="" disabled>
                        {orgsLoading ? "Loading organizations..." : activeOrgs.length === 0 ? "No organizations available" : "Select Organization"}
                      </option>
                      {activeOrgs.map(org => (
                        <option key={org.id || org._id} value={org.id || org._id}>{org.name}</option>
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
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 transition-all ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
