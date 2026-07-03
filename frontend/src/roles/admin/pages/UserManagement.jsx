import { useEffect, useState } from "react";
import { adminApi } from "@/roles/admin/api/adminApi";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getUsers()
      .then(({ data }) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Error loading user directory");
        setLoading(false);
      });
  }, []);

  const handleAddUserPlaceholder = () => {
    toast.success("User creation drawer will open here");
  };

  return (
    <div className="p-8 space-y-8 bg-bg-page min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-heading tracking-tight">User Management</h1>
          <p className="text-sm text-body">
            Manage system operators, assign access privileges, and review team roles.
          </p>
        </div>
        <div>
          <button
            onClick={handleAddUserPlaceholder}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-accent transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
          >
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Add New User
          </button>
        </div>
      </div>

      {/* Users Card Table */}
      <div className="rounded-2xl border border-border-custom bg-card overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border-custom bg-gray-50/50 flex items-center justify-between">
          <span className="text-sm font-bold text-heading">Registered Operators</span>
          <span className="text-xs font-semibold text-muted bg-white border border-border-custom px-2.5 py-1 rounded-lg">
            Total count: {users.length}
          </span>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center items-center text-sm text-muted gap-2">
              <svg className="animate-spin h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Fetching operator directory...
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border-custom text-muted font-bold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Operator Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Permission</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-custom">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-hover-custom transition-colors duration-150 group">
                      <td className="py-4 px-4 font-semibold text-heading flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/5 text-primary border border-primary/10 flex items-center justify-center font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        {u.name}
                      </td>
                      <td className="py-4 px-4 text-body font-mono">
                        {u.email ?? `${u.name.toLowerCase().replace(/\s+/g, ".")}@fleet.com`}
                      </td>
                      <td className="py-4 px-4">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-info-custom/10 text-info-custom border border-info-custom/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-info-custom" />
                            Fleet Manager
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toast.error("Editing permissions is restricted for safety.")}
                            className="p-1.5 rounded-lg border border-border-custom bg-white hover:bg-hover-custom text-body hover:text-heading transition-colors"
                            title="Edit User"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-muted">
              No operator users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

