import { useEffect, useState } from "react";
import { adminApi } from "@/roles/admin/api/adminApi";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .getFleetOverview()
      .then(({ data }) => setOverview(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-500">Fleet-wide overview and user management.</p>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      {overview && (
        <pre className="mt-4 rounded-lg bg-gray-50 p-4 text-sm">
          {JSON.stringify(overview, null, 2)}
        </pre>
      )}
    </div>
  );
}
