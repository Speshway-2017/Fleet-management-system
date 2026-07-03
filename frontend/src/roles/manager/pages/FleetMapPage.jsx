import { useEffect, useState } from "react";
import { dashboardApi } from "../dashboard/dashboardApi";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import LiveMap from "../dashboard/LiveMap";
import "../dashboard/manager.css";

import { MapPin, AlertTriangle } from "lucide-react";

export default function FleetMapPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    dashboardApi.getVehicles()
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Map page fetch error", err);
        setError("Unable to load live fleet coordinates.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] font-nunito text-[#1B2430]">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Dashboard Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar flex flex-col space-y-6">
          <div>
            <h1 className="font-poppins font-bold text-2xl text-[#1B2430]">
              Fleet Map Tracking
            </h1>
            <p className="text-sm text-[#6B7280] mt-1 font-nunito font-medium">
              Geographic coordinates and active routing positions of fleet units.
            </p>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-2xl min-h-[400px]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-t-[#C65D0E] border-r-[#C65D0E]/20 border-b-[#C65D0E]/20 border-l-[#C65D0E]/20 rounded-full animate-spin" />
                <p className="text-sm text-[#1B2430] font-semibold font-poppins">Loading Map Coordinates...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center min-h-[400px]">
              <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-sm font-semibold text-gray-700">{error}</p>
            </div>
          ) : (
            /* Live tracking map container card */
            <div className="flex-1 min-h-[500px] bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden relative">
              <LiveMap vehicles={vehicles} zoom={11} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
