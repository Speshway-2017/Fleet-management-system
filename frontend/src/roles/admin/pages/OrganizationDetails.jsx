import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { ChevronLeft } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import AdminEmptyState from "@/components/common/AdminEmptyState";
import { Plus, Eye, EyeOff, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

// ── Shared tab strip ──────────────────────────────────────────────────────
function OrgTabs({ activeId, active }) {
  return (
    <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
      <Link to="/admin/organizations"
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Organization List</span><span className="sm:hidden">List</span>
      </Link>
      <Link to="/admin/organizations/add"
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Add Organization</span><span className="sm:hidden">Add</span>
      </Link>
      <button className={`flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap ${active === "details" ? "bg-[#0f172a] text-white" : "text-slate-600"}`}>
        <span className="hidden sm:inline">Organization Details</span><span className="sm:hidden">Details</span>
      </button>
      <Link to={activeId ? `/admin/organizations/edit/${activeId}` : "/admin/organizations/edit"}
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Edit Organization</span><span className="sm:hidden">Edit</span>
      </Link>
    </div>
  );
}

export default function OrganizationDetails() {
  const { id } = useParams();
  const { getOrganization, fleetManagers } = useAdmin();
  const contextOrg = id ? getOrganization(id) : null;
  const [org, setOrg] = useState(contextOrg);
  const [loading, setLoading] = useState(false);
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [isEditManagerOpen, setIsEditManagerOpen] = useState(false);
  const [managerForm, setManagerForm] = useState({ id: "", name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [managerErrors, setManagerErrors] = useState({});
  const [isSubmittingManager, setIsSubmittingManager] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { fetchOrganizations } = useAdmin();

  useEffect(() => {
    if (id) {
      setLoading(true);
      adminApi.getOrganizationDetails(id)
        .then((res) => {
          setOrg(res.data?.data || res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const orgManagers = org?.fleetManagers || (org 
    ? fleetManagers.filter(m => m.organizationId === (org.id || org._id))
    : []);

  const layout = (content) => (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organization Details" />
        {content}
      </div>
    </div>
  );

  const handleDeleteManager = async (managerId) => {
    if (!window.confirm("Are you sure you want to delete this fleet manager?")) return;
    try {
      await adminApi.deleteManager(managerId);
      toast.success("Manager deleted successfully");
      // Refresh organization details to get updated managers list
      const res = await adminApi.getOrganizationDetails(id);
      setOrg(res.data?.data || res.data);
      if (fetchOrganizations) await fetchOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete manager");
    }
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!managerForm.name) errors.name = "Required";
    if (!managerForm.email) errors.email = "Required";
    if (!isEditManagerOpen) {
      if (!managerForm.password) errors.password = "Required";
      else if (managerForm.password.length < 6) errors.password = "Min 6 characters";
      if (managerForm.password !== managerForm.confirmPassword) errors.confirmPassword = "Passwords mismatch";
    } else {
      if (managerForm.password && managerForm.password.length < 6) errors.password = "Min 6 characters";
      if (managerForm.password !== managerForm.confirmPassword) errors.confirmPassword = "Passwords mismatch";
    }
    
    setManagerErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmittingManager(true);
    try {
      if (isEditManagerOpen) {
        await adminApi.updateFleetManager(managerForm.id, {
          name: managerForm.name,
          email: managerForm.email,
          phone: managerForm.phone,
          ...(managerForm.password ? { password: managerForm.password } : {})
        });
        toast.success("Fleet manager updated successfully");
        setIsEditManagerOpen(false);
      } else {
        await adminApi.createFleetManager({
          ...managerForm,
          organization: org.id || org._id
        });
        toast.success("Fleet manager added successfully");
        setIsAddManagerOpen(false);
      }
      setManagerForm({ id: "", name: "", email: "", phone: "", password: "", confirmPassword: "" });
      // Refresh details
      const res = await adminApi.getOrganizationDetails(id);
      setOrg(res.data?.data || res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditManagerOpen ? 'update' : 'add'} manager`);
    } finally {
      setIsSubmittingManager(false);
    }
  };

  const openEditModal = (manager) => {
    setManagerForm({
      id: manager.id || manager._id,
      name: manager.name || "",
      email: manager.email || "",
      phone: manager.phone || "",
      password: "",
      confirmPassword: ""
    });
    setManagerErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsEditManagerOpen(true);
  };

  const handleSuspendOrg = async () => {
    const isSuspended = org?.status === "Suspended";
    const nextStatus = isSuspended ? "Active" : "Suspended";
    const promptMsg = isSuspended
      ? "Are you sure you want to reactivate this organization?"
      : "Are you sure you want to suspend this organization?";

    if (!window.confirm(promptMsg)) return;

    try {
      await adminApi.suspendOrganization(id, nextStatus);
      toast.success(isSuspended ? "Organization reactivated successfully" : "Organization suspended successfully");
      const res = await adminApi.getOrganizationDetails(id);
      setOrg(res.data?.data || res.data);
      if (fetchOrganizations) await fetchOrganizations();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const openAddModal = () => {
    setManagerForm({ id: "", name: "", email: "", phone: "", password: "", confirmPassword: "" });
    setManagerErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsAddManagerOpen(true);
  };

  // ── No ID ─────────────────────────────────────────────────────────────────
  if (!id) return layout(
    <AdminEmptyState
      icon="building"
      title="No Organization Selected"
      description="Please select an organization from the Organization List to view its details."
      buttonLabel="Go to Organization List"
      buttonHref="/admin/organizations"
      tabs={<OrgTabs activeId={null} active="details" />}
    />
  );

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!org) return layout(
    <AdminEmptyState
      icon="building"
      title="Organization Not Found"
      description="The organization you are looking for could not be found."
      buttonLabel="Go to Organization List"
      buttonHref="/admin/organizations"
      tabs={<OrgTabs activeId={null} active="details" />}
    />
  );

  // ── Full details view ─────────────────────────────────────────────────────
  return layout(
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
      <OrgTabs activeId={id} active="details" />

          {/* Breadcrumb & Actions */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Link to="/admin/organizations" className="text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Organizations
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800">{org.name}</span>
            </div>
            <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/admin/organizations" className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#A14000] border border-[#A14000] bg-transparent hover:bg-[#A14000]/10 rounded-lg transition-colors text-center truncate">
                Back to List
              </Link>
              <button
                onClick={handleSuspendOrg}
                className={`flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors text-center truncate ${
                  org.status === 'Suspended'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {org.status === 'Suspended' ? 'Reactivate Organization' : 'Suspend Organization'}
              </button>
              <Link to={`/admin/organizations/edit/${id}`} className="flex-[2] sm:flex-none flex items-center justify-center px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors text-center truncate">
                Edit Organization
              </Link>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            {/* Company Information */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-6">Company Information</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Name</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">{org.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Industry</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">{org.industry || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Email</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">{org.email || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Phone</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">{org.phone || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Address</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0 max-w-[200px]">{org.address || "—"} {org.city ? `, ${org.city}` : ""} {org.state ? `, ${org.state}` : ""}</span>
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm mb-6">Subscription Details</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Plan</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">{org.plan || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Status</span>
                  <span className={`text-sm font-bold sm:text-right mt-1 sm:mt-0 ${org.status === 'Active' ? 'text-green-600' : org.status === 'Pending' ? 'text-orange-500' : 'text-slate-600'}`}>{org.status || "—"}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-slate-50 last:border-0">
                  <span className="text-sm font-semibold text-slate-500">Created</span>
                  <span className="text-sm font-semibold text-slate-800 sm:text-right mt-1 sm:mt-0">{org.joined || org.date || "—"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Statistics */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Statistics</h3>
            <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-0 md:divide-x divide-slate-100">
              
              <div className="flex flex-col items-center justify-center p-2 md:p-4 w-full text-center">
                <span className="text-2xl md:text-3xl font-black text-slate-800 mb-1">{org.stats?.totalFleetManagers ?? org.managers ?? 0}</span>
                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fleet Managers</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-2 md:p-4 w-full text-center">
                <span className="text-2xl md:text-3xl font-black text-slate-800 mb-1">{org.stats?.totalVehicles ?? 0}</span>
                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Vehicles</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-2 md:p-4 w-full text-center">
                <span className="text-2xl md:text-3xl font-black text-slate-800 mb-1">{org.stats?.totalActiveTrips ?? 0}</span>
                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Trips</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-2 md:p-4 w-full text-center">
                <span className="text-2xl md:text-3xl font-black text-slate-800 mb-1">₹{(org.stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</span>
                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              </div>

            </div>
          </div>

          {/* Fleet Managers List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-800 text-sm">Fleet Managers in {org.name}</h3>
              <button onClick={openAddModal} className="flex items-center w-full sm:w-auto justify-center gap-2 bg-[#A14000] hover:bg-[#8a3700] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm whitespace-nowrap">
                <Plus className="w-4 h-4" />
                Add Fleet Manager
              </button>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <table className="w-full text-center border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-left">Name</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Email & Phone</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Role</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Vehicles Managed</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Revenue Generated</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orgManagers.length > 0 ? (
                    orgManagers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap text-left">
                          <div className="flex items-center justify-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                              {m.initials}
                            </div>
                            <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">
                          <div>{m.email}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{m.phone || "—"}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500 font-medium whitespace-nowrap text-center">Fleet Manager</td>
                        <td className="py-4 px-6 whitespace-nowrap text-center">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full tracking-wide ${m.status === "Active" ? "text-green-600 bg-green-50" : "text-slate-500 bg-slate-100"}`}>{m.status}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-800 font-semibold whitespace-nowrap text-center">
                          {m.stats?.activeTripsCount ?? 0}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-800 font-semibold whitespace-nowrap text-center">
                          ₹{(m.stats?.totalRevenue ?? 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-3 flex-nowrap w-max mx-auto">
                            <button onClick={() => openEditModal(m)} className="text-slate-400 hover:text-[#A14000] transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteManager(m.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-sm font-semibold text-slate-500">
                        No fleet managers assigned to this organization.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50/50">
              {orgManagers.length > 0 ? (
                orgManagers.map(m => (
                <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                        {m.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{m.name}</div>
                        <div className="text-xs text-slate-500">{m.email}</div>
                        {m.phone && <div className="text-xs text-slate-400">{m.phone}</div>}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${m.status === "Active" ? "text-green-600 bg-green-50" : "text-slate-500 bg-slate-100"}`}>{m.status}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Role</span>
                      <span className="text-sm font-medium text-slate-700">Fleet Manager</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Vehicles Managed</span>
                      <span className="text-sm font-medium text-slate-700">{m.stats?.activeTripsCount ?? 0}</span>
                    </div>
                    <div className="flex flex-col col-span-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Revenue Generated</span>
                      <span className="text-sm font-medium text-slate-700">₹{(m.stats?.totalRevenue ?? 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 mt-3 pt-3 border-t border-slate-100">
                    <button onClick={() => openEditModal(m)} className="text-slate-400 hover:text-[#A14000] transition-colors" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteManager(m.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))) : (
                <div className="text-center text-slate-500 py-8 text-sm">No fleet managers assigned to this organization.</div>
              )}
            </div>
          </div>

          {/* Add / Edit Manager Modal */}
          {(isAddManagerOpen || isEditManagerOpen) && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800">{isEditManagerOpen ? "Edit Fleet Manager" : "Add Fleet Manager"}</h3>
                  <button onClick={() => {setIsAddManagerOpen(false); setIsEditManagerOpen(false);}} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleManagerSubmit} className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Full Name</label>
                      <input type="text" value={managerForm.name} onChange={e => {setManagerForm(p => ({...p, name: e.target.value})); setManagerErrors(p => ({...p, name: ""}))}} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" placeholder="Manager Name" />
                      {managerErrors.name && <p className="text-xs text-red-500 mt-1">{managerErrors.name}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Email Address</label>
                      <input type="email" value={managerForm.email} onChange={e => {setManagerForm(p => ({...p, email: e.target.value})); setManagerErrors(p => ({...p, email: ""}))}} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" placeholder="Email Address" />
                      {managerErrors.email && <p className="text-xs text-red-500 mt-1">{managerErrors.email}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">Phone Number</label>
                      <input type="tel" value={managerForm.phone} onChange={e => setManagerForm(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50" placeholder="Phone Number" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Password {isEditManagerOpen && <span className="font-normal text-slate-400">(leave blank to keep)</span>}</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={managerForm.password} onChange={e => {setManagerForm(p => ({...p, password: e.target.value})); setManagerErrors(p => ({...p, password: ""}))}} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 pr-10" placeholder={isEditManagerOpen ? "New Password" : "Create Password"} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {managerErrors.password && <p className="text-xs text-red-500 mt-1">{managerErrors.password}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <input type={showConfirmPassword ? "text" : "password"} value={managerForm.confirmPassword} onChange={e => {setManagerForm(p => ({...p, confirmPassword: e.target.value})); setManagerErrors(p => ({...p, confirmPassword: ""}))}} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all bg-slate-50/50 pr-10" placeholder="Confirm Password" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {managerErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{managerErrors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => {setIsAddManagerOpen(false); setIsEditManagerOpen(false);}} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmittingManager} className="px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors disabled:opacity-50">
                      {isSubmittingManager ? "Saving..." : isEditManagerOpen ? "Save Changes" : "Add Manager"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
  );
}
