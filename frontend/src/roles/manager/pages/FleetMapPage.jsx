import { useEffect, useState } from "react";
import { managerApi } from "@/roles/manager/api/managerApi";
import FleetMap from "@/roles/manager/components/FleetMap";

export default function FleetMapPage() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    managerApi.getVehicles().then(({ data }) => setVehicles(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Fleet Map</h1>
      <div className="mt-4">
        <FleetMap vehicles={vehicles} />
      </div>
    </div>
  );
}
