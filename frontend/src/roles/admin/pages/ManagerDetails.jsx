import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "@/api/adminApi";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { ChevronLeft, Pencil } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import AdminEmptyState from "@/components/common/AdminEmptyState";

// ── Tab strip ─────────────────────────────────────────────────────────────
function FMTabs({ activeId, active }) {
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
      <button className={`flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap ${active === "details" ? "bg-[#0f172a] text-white" : "text-slate-600"}`}>
        <span className="hidden sm:inline">Manager Details</span><span className="sm:hidden">Details</span>
      </button>
      <Link to={activeId ? `/admin/fleet-managers/edit/${activeId}` : "/admin/fleet-managers/edit"}
        className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
        <span className="hidden sm:inline">Edit Manager</span><span className="sm:hidden">Edit</span>
      </Link>
    </div>
  );
}

export default function ManagerDetails() {
  const { id } = useParams();
  const { getFleetManager, fleetManagers } = useAdmin();
  const contextManager = id ? getFleetManager(id) : null;
  const [manager, setManager] = useState(contextManager);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      adminApi.getManagerDetails(id)
        .then((res) => {
          setManager(res.data?.data || res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const orgId = manager?.organizationId;
  const orgManagers = orgId 
    ? fleetManagers.filter(m => m.organizationId === orgId)
    : [];

  const layout = (content) => (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="fleet-managers" />
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Fleet Manager Details" />
        {content}
      </div>
    </div>
  );

  // ── No ID ─────────────────────────────────────────────────────────────────
  if (!id) return layout(
    <AdminEmptyState
      icon="user"
      title="No Manager Selected"
      description="Please select a manager from the Fleet Manager List to view their details."
      buttonLabel="Go to Fleet Manager List"
      buttonHref="/admin/fleet-managers"
      tabs={<FMTabs activeId={null} active="details" />}
    />
  );

  // ── ID present but not found ──────────────────────────────────────────────
  if (!manager) return layout(
    <AdminEmptyState
      icon="user"
      title="Manager Not Found"
      description="The manager you are looking for could not be found. They may have been removed."
      buttonLabel="Go to Fleet Manager List"
      buttonHref="/admin/fleet-managers"
      tabs={<FMTabs activeId={null} active="details" />}
    />
  );

  // ── Full details view ─────────────────────────────────────────────────────
  return layout(
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
      <FMTabs activeId={id} active="details" />

      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center text-sm font-bold text-slate-500">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <Link to="/admin/fleet-managers" className="hover:text-slate-800 transition-colors">Fleet Managers</Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-800">{manager.name}</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link to="/admin/fleet-managers"
            className="flex-1 sm:flex-none flex items-center justify-center px-5 py-2.5 text-sm font-bold text-[#A14000] border border-[#A14000] rounded-lg hover:bg-[#A14000]/10 transition-colors">
            Back to List
          </Link>
          <Link to={`/admin/fleet-managers/edit/${id}`}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors">
            <Pencil className="w-4 h-4" />
            Edit Manager
          </Link>
        </div>
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left: Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-[#0f172a] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
              {manager.initials}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{manager.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-slate-500 font-medium">{manager.role || "Fleet Manager"}</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide ${
                  manager.status === "Active"   ? "text-green-600 bg-green-50" :
                  manager.status === "Invited"  ? "text-blue-600 bg-blue-50"  :
                  "text-slate-500 bg-slate-100"
                }`}>{manager.status}</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {[
              ["Email",            manager.email],
              ["Phone",            manager.phone || "—"],
              ["Organization",     manager.org   || "—"],
              ["Last Login",       manager.lastLogin],
              ["Created",          manager.created || "—"],
              ["Permission Level", "Standard"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center border-b border-slate-100 pb-4 last:border-0">
                <span className="text-sm font-bold text-slate-500">{label}</span>
                <span className="text-sm font-bold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h3 className="text-[15px] font-extrabold text-slate-800 mb-6 tracking-wide">Recent Login Activity</h3>
          <div className="space-y-4">
            {[
              { date: "2024-06-01 10:30", info: "Chrome / macOS • 192.168.1.1",  success: true  },
              { date: "2024-05-31 14:15", info: "Safari / iOS • 192.168.1.5",    success: true  },
              { date: "2024-05-30 09:00", info: "Chrome / macOS • 192.168.1.1",  success: true  },
              { date: "2024-05-28 17:45", info: "Firefox / Windows • 10.0.0.5",  success: false },
            ].map((item) => (
              <div key={item.date} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800 mb-1">{item.date}</div>
                  <div className="text-xs font-semibold text-slate-500">{item.info}</div>
                </div>
                <span className={`text-[11px] font-bold tracking-wide ${item.success ? "text-green-600" : "text-red-500"}`}>
                  {item.success ? "Success" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Organization Overview */}
      {manager.org && manager.org !== 'N/A' && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-extrabold text-slate-800 tracking-wide">Organization Overview</h3>
            <span className="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              {manager.org}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Fleet Managers</p>
              <h4 className="text-2xl font-black text-slate-800">{manager.stats?.orgManagersCount || 0}</h4>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Vehicles</p>
              <h4 className="text-2xl font-black text-slate-800">{manager.stats?.vehiclesCount || 0}</h4>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Active Trips</p>
              <h4 className="text-2xl font-black text-slate-800">{manager.stats?.activeTripsCount || 0}</h4>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Revenue</p>
              <h4 className="text-2xl font-black text-slate-800">₹{(manager.stats?.totalRevenue || 0).toLocaleString('en-IN')}</h4>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-800 mb-4">Other Fleet Managers in {manager.org}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {orgManagers.map(m => (
              <Link key={m.id} to={`/admin/fleet-managers/${m.id}`} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-[#0f172a] rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {m.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">{m.name}</div>
                  <div className="text-xs font-medium text-slate-500">{m.status}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
