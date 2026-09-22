import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { adminApi } from "@/api/adminApi";
import { ChevronLeft, Upload } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import AdminEmptyState from "@/components/common/AdminEmptyState";
import { updateOrganizationSchema, validateForm, validateField } from "@/validations";

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
      <Link to={activeId ? `/admin/organizations/details/${activeId}` : "/admin/organizations/details"}
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Organization Details</span><span className="sm:hidden">Details</span>
      </Link>
      <button className={`flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap ${active === "edit" ? "bg-[#0f172a] text-white" : "text-slate-600"}`}>
        <span className="hidden sm:inline">Edit Organization</span><span className="sm:hidden">Edit</span>
      </button>
    </div>
  );
}

export default function EditOrganization() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations, fetchOrganizations } = useAdmin();

  const org = organizations.find(o => String(o._id || o.id) === String(id));

  const [form, setForm] = useState({
    name: "", industry: "", email: "", phone: "", address: "",
    city: "", state: "", country: "", plan: "", status: "",
  });
  const [errors, setSErrors] = useState({});
  const [saving, setSaving]   = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (org) {
      setForm({
        name:     org.name     || "",
        industry: org.industry || "",
        email:    org.email    || "",
        phone:    org.phone    || "",
        address:  org.address  || "",
        city:     org.city     || "",
        state:    org.state    || "",
        country:  org.country  || "",
        plan:     org.plan     || "",
        status:   org.status   || "",
      });
    }
  }, [org]);

  const layout = (content) => (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Edit Organization" />
        {content}
      </div>
    </div>
  );

  // ── No ID selected ────────────────────────────────────────────────────────
  if (!id) return layout(
    <AdminEmptyState
      icon="building"
      title="No Organization Selected"
      description="Please select an organization from the Organization List to edit its details."
      buttonLabel="Go to Organization List"
      buttonHref="/admin/organizations"
      tabs={<OrgTabs activeId={null} active="edit" />}
    />
  );

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!org) return layout(
    <AdminEmptyState
      icon="building"
      title="Organization Not Found"
      description="The organization you are trying to edit could not be found."
      buttonLabel="Go to Organization List"
      buttonHref="/admin/organizations"
      tabs={<OrgTabs activeId={null} active="edit" />}
    />
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    const errorMsg = validateField(updateOrganizationSchema, name, value, updatedForm);
    setSErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(updateOrganizationSchema, form);
    setSErrors(validation.errors);
    if (!validation.isValid) return;

    setSaving(true);
    try {
      let payload = form;
      if (logoFile) {
        payload = new FormData();
        Object.entries(form).forEach(([k, v]) => payload.append(k, v));
        payload.append('logo', logoFile);
      }
      await adminApi.updateOrganization(id, payload);
      toast.success("Organization updated successfully!");
      if (fetchOrganizations) await fetchOrganizations();
      navigate("/admin/organizations");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!id) return;
    try {
      await adminApi.deleteOrganization(id);
      toast.success('Organization deleted successfully!');
      if (fetchOrganizations) await fetchOrganizations();
      navigate('/admin/organizations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete organization');
    }
  };

  // ── Full edit form ────────────────────────────────────────────────────────
  return layout(
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
      <OrgTabs activeId={id} active="edit" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center text-sm">
          <Link to="/admin/organizations" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Organizations
          </Link>
          <span className="text-slate-300 mx-2">/</span>
          <span className="text-slate-800 font-bold">Edit {org.name}</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/admin/organizations"
            className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 text-sm font-bold text-[#A14000] border border-[#A14000] rounded-lg hover:bg-[#A14000]/10 transition-colors">
            Cancel
          </Link>
          <button type="button" onClick={handleDelete}
            className="flex-[2] sm:flex-none px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50">
            Delete
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-[2] sm:flex-none px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Organization Information</h2>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-6">
          {/* Hidden dummy fields to prevent browser credential autofill */}
          <input type="text" name="fake_username_remembered" style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none", zIndex: -1 }} tabIndex="-1" readOnly aria-hidden="true" />
          <input type="password" name="fake_password_remembered" style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none", zIndex: -1 }} tabIndex="-1" readOnly aria-hidden="true" />

          {/* Logo upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Organization Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                {(logoPreview || org?.logoUrl) ? (
                  <img src={logoPreview || org?.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-slate-400">LOGO</span>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              maxLength={20}
              autoComplete="off"
              value={form.name}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (!/^[a-zA-Z\s]$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="e.g. ABC Logistics"
              className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.name ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Industry + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="industry"
                maxLength={20}
                autoComplete="off"
                placeholder="Industry (letters only)"
                value={form.industry}
                onKeyDown={(e) => {
                  if (!/^[a-zA-Z\s]$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.industry ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
              />
              {errors.industry && <p className="text-xs text-red-500 mt-1 font-medium">{errors.industry}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                maxLength={30}
                value={form.email}
                onChange={handleChange}
                autoComplete="off"
                placeholder="contact@organization.com"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.email ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                name="phone"
                value={form.phone}
                onKeyDown={(e) => {
                  if (!/^\d$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                  }
                }}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Street Address</label>
            <input
              type="text"
              name="address"
              maxLength={100}
              autoComplete="off"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address"
              className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.address ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>}
          </div>

          {/* City + State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
              <input
                type="text"
                name="city"
                maxLength={20}
                autoComplete="off"
                value={form.city}
                onKeyDown={(e) => {
                  if (!/^[a-zA-Z\s]$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={handleChange}
                placeholder="City"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.city ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
              />
              {errors.city && <p className="text-xs text-red-500 mt-1 font-medium">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">State</label>
              <input
                type="text"
                name="state"
                maxLength={20}
                autoComplete="off"
                value={form.state}
                onKeyDown={(e) => {
                  if (!/^[a-zA-Z\s]$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={handleChange}
                placeholder="State"
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.state ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
              />
              {errors.state && <p className="text-xs text-red-500 mt-1 font-medium">{errors.state}</p>}
            </div>
          </div>

          {/* Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
              <input
                type="text"
                name="country"
                maxLength={20}
                autoComplete="off"
                value={form.country}
                onKeyDown={(e) => {
                  if (!/^[a-zA-Z\s]$/.test(e.key) && !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${errors.country ? "border-red-500 focus:ring-red-500/20" : "border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]"}`}
              />
              {errors.country && <p className="text-xs text-red-500 mt-1 font-medium">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 focus:border-[#A14000] transition-all">
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
