import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { adminApi } from "@/api/adminApi";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import AdminEmptyState from "@/components/common/AdminEmptyState";

// ── Tabs shared across all Fleet Manager pages ────────────────────────────
function FMTabs({ activeId }) {
  return (
    <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
      <Link to="/admin/fleet-managers"
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Fleet Manager List</span><span className="sm:hidden">List</span>
      </Link>
      <Link to="/admin/fleet-managers/add"
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Add Fleet Manager</span><span className="sm:hidden">Add</span>
      </Link>
      <Link to={activeId ? `/admin/fleet-managers/details/${activeId}` : "/admin/fleet-managers/details"}
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Manager Details</span><span className="sm:hidden">Details</span>
      </Link>
      <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
        <span className="hidden sm:inline">Edit Manager</span><span className="sm:hidden">Edit</span>
      </button>
    </div>
  );
}

export default function EditFleetManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFleetManager, fetchFleetManagers, organizations } = useAdmin();

  // Deduplicate organizations by id/_id
  const uniqueOrganizations = Array.from(
    new Map(organizations.map(org => [org.id || org._id, org])).values()
  );

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "",
    organization: "", role: "Fleet Manager",
    password: "", confirmPassword: "",
  });
  const [errors, setErrors]           = useState({});
  const [saving, setSaving]       = useState(false);

  const manager = id ? getFleetManager(id) : null;

  useEffect(() => {
    if (manager) {
      // Get organization id from any possible field
      let orgId = "";
      if (manager.organizationId) orgId = manager.organizationId;
      else if (manager.organization) {
        orgId = manager.organization.id || manager.organization._id;
      }
      else if (manager.orgId) orgId = manager.orgId;

      setFormData({
        fullName: manager.name || "",
        email: manager.email || "",
        phone: manager.phone || "",
        organization: orgId,
        role: "Fleet Manager",
        password:        "",
        confirmPassword: "",
      });
    }
  }, [manager]);

  // ── No ID selected ────────────────────────────────────────────────────────
  if (!id) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
        <NewAdminSidebar activeItem="fleet-managers" />
        <div className="flex-1 flex flex-col min-w-0">
          <NewAdminTopNav title="Edit Fleet Manager" />
          <AdminEmptyState
            icon="user"
            title="No Manager Selected"
            description="Please select a manager from the Fleet Manager List to edit their details."
            buttonLabel="Go to Fleet Manager List"
            buttonHref="/admin/fleet-managers"
            tabs={<FMTabs activeId={null} />}
          />
        </div>
      </div>
    );
  }

  // ── Manager not found after ID supplied (stale link etc.) ─────────────────
  if (!manager) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
        <NewAdminSidebar activeItem="fleet-managers" />
        <div className="flex-1 flex flex-col min-w-0">
          <NewAdminTopNav title="Edit Fleet Manager" />
          <AdminEmptyState
            icon="user"
            title="Manager Not Found"
            description="The manager you are trying to edit could not be found."
            buttonLabel="Go to Fleet Manager List"
            buttonHref="/admin/fleet-managers"
            tabs={<FMTabs activeId={null} />}
          />
        </div>
      </div>
    );
  }

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
    if (formData.phone && !/^\+?[0-9\s-]{7,15}$/.test(formData.phone))
      newErrors.phone = "Invalid phone format";
    if (formData.password) {
      if (formData.password.length < 8)            newErrors.password = "At least 8 characters";
      else if (!/[A-Z]/.test(formData.password))   newErrors.password = "Must contain uppercase letter";
      else if (!/[0-9]/.test(formData.password))   newErrors.password = "Must contain a number";
      if (formData.password !== formData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name:         formData.fullName,
        email:        formData.email,
        phone:        formData.phone,
        ...(formData.password ? { password: formData.password } : {}),
      };
      // Only add organization if it's not empty
      if (formData.organization) {
        payload.organization = formData.organization;
      }
      await adminApi.updateFleetManager(id, payload);
      toast.success("Manager updated successfully!");
      if (fetchFleetManagers) await fetchFleetManagers();
      navigate("/admin/fleet-managers");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update manager");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!id) return;
    try {
      await adminApi.deleteFleetManager(id);
      toast.success('Fleet manager deleted successfully!');
      if (fetchFleetManagers) await fetchFleetManagers();
      navigate('/admin/fleet-managers');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete manager');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Edit Fleet Manager" />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">

          <FMTabs activeId={id} />

          <form onSubmit={handleSubmit}>
            {/* Header actions */}
            <div className="flex justify-end gap-3 mb-6">
              <Link to="/admin/fleet-managers"
                className="px-5 py-2.5 text-sm font-bold text-[#A14000] border border-[#A14000] rounded-lg hover:bg-[#A14000]/10 transition-colors">
                Cancel
              </Link>
              <button type="button" onClick={handleDelete}
                className="flex-[2] sm:flex-none px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50">
                Delete
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#B45A0A] rounded-lg shadow-sm hover:bg-[#8a4406] transition-colors disabled:opacity-50">
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-[15px] font-extrabold text-slate-800 mb-8 tracking-wide">
                Fleet Manager Information
              </h2>

              <div className="space-y-6 max-w-4xl">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                    placeholder="e.g. James Carter"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`} />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange}
                      placeholder="manager@organization.com"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      placeholder="+91 00000 00000"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Organization + Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Organization</label>
                  <select name="organization" value={formData.organization} onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all">
                    <option value="">Select Organization</option>
                    {uniqueOrganizations.map(org => (
                      <option key={org.id || org._id} value={org.id || org._id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all">
                      <option value="Fleet Manager">Fleet Manager</option>
                      <option value="Dispatcher">Dispatcher</option>
                    </select>
                  </div>
                </div>

                {/* Password (optional on edit) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span>
                    </label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 transition-all ${errors.password ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`} />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm tracking-widest focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`} />
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
