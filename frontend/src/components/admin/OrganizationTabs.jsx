import { Link } from "react-router-dom";

export default function OrganizationTabs({ activeTab }) {
  const tabs = [
    { id: "list", label: "Organization List", to: "/admin/organizations" },
    { id: "add", label: "Add Organization", to: "/admin/organizations/add" },
    { id: "details", label: "Organization Details", to: "#" },
    { id: "edit", label: "Edit Organization", to: "#" },
  ];

  return (
    <div className="flex items-center gap-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isActive 
                ? "bg-slate-800 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
