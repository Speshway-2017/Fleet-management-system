import { useEffect, useState } from "react";
import { adminApi } from "@/roles/admin/api/adminApi";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminApi.getUsers().then(({ data }) => setUsers(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
      <ul className="mt-4 divide-y divide-gray-200">
        {users.map((u) => (
          <li key={u.id} className="py-2 text-gray-700">
            {u.name} — {u.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
