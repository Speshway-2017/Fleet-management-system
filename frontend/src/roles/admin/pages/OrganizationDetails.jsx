import { Link, useParams } from "react-router-dom";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { ChevronLeft } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import AdminEmptyState from "@/components/common/AdminEmptyState";

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
  const { getOrganization } = useAdmin();
  const org = id ? getOrganization(id) : null;

  const layout = (content) => (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organization Details" />
        {content}
      </div>
    </div>
  );

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
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">{org.managers || 0}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fleet Managers</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">—</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Vehicles</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">—</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trips</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-4 w-full">
                <span className="text-3xl font-black text-slate-800 mb-1">—</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Cost</span>
              </div>

            </div>
          </div>

        </main>
  );
}
