import { useEffect, useState } from "react";
import { adminApi } from "@/roles/admin/api/adminApi";
import toast from "react-hot-toast";
import TableRowSkeleton from "@/components/common/TableRowSkeleton";

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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-bg-page min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">User Management</h1>
          <p className="text-sm text-body">
            Manage system operators, assign access privileges, and review team roles.
          </p>
        </div>
        <div>
          <button
            onClick={handleAddUserPlaceholder}
            className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-accent transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
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
            {loading ? (
              <span className="inline-block w-20 h-3.5 bg-slate-200 animate-pulse rounded" />
            ) : (
              `Total count: ${users.length}`
            )}
          </span>
        </div>

        <div className="p-6">
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
                {loading ? (
                  <TableRowSkeleton columns={4} rows={5} />
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted font-medium">
                      No operators found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

