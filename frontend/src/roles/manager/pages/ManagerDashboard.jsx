import { useEffect, useState } from "react";
import { managerApi } from "@/roles/manager/api/managerApi";

export default function ManagerDashboard() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    managerApi.getVehicles().then(({ data }) => setVehicles(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Manager Dashboard</h1>
      <p className="mt-2 text-gray-500">Vehicles, drivers, and trips under your management.</p>
      <ul className="mt-4 divide-y divide-gray-200">
        {vehicles.map((v) => (
          <li key={v.id} className="py-2 text-gray-700">
            {v.plateNumber} — {v.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
