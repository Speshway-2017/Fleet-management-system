import { useState, useEffect } from "react";
import { 
  Truck, 
  Zap, 
  Route, 
  Wrench, 
  Users, 
  Fuel, 
  Wallet,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

// Local imports from the same directory
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardCard from "./DashboardCard";
import LiveMap from "./LiveMap";
import VehicleStatus from "./VehicleStatus";
import { dashboardApi } from "./dashboardApi";
import "./manager.css";

export default function ManagerDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // States for API datasets
  const [stats, setStats] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [costs, setCosts] = useState([]);

  // Inject session credentials in Dev Mode if missing
  useEffect(() => {
    if (import.meta.env.DEV) {
      if (!localStorage.getItem("token") || !localStorage.getItem("user")) {
        localStorage.setItem("token", "mock_dev_session_token_3b0569d8");
        localStorage.setItem("user", JSON.stringify({ name: "Alex Thompson", role: "manager" }));
        console.warn("Dev Mode session token initialized locally.");
      }
    }
  }, []);

  // Fetch dashboard details
  useEffect(() => {
    setLoading(true);
    
    Promise.all([
      dashboardApi.getDashboard(),
      dashboardApi.getVehicles(),
      dashboardApi.getCompliance(),
      dashboardApi.getCostBreakdown()
    ])
      .then(([statsData, vehiclesData, complianceData, costsData]) => {
        setStats(statsData);
        setVehicles(vehiclesData);
        setCompliance(complianceData);
        setCosts(costsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetching failure", err);
        toast.error("Failed to load dashboard metrics. Retrying...");
        setLoading(false);
      });
  }, [retryTrigger]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center font-poppins">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-9 h-9 text-[#C65D0E] animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Loading Manager Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7FA] font-nunito text-[#1B2430]">
      {/* Sidebar Layout */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} showMenuButton={true} />

        {/* Dashboard Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar space-y-6">
        
        {/* --- GRID METRICS CARDS (7 COLUMNS ON DESKTOP) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
          <DashboardCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={Truck}
            color="orange"
            darkTheme={true}
          />
          <DashboardCard
            title="Active"
            value={stats.activeVehicles}
            icon={Zap}
            color="orange"
          />
          <DashboardCard
            title="Trips Today"
            value={stats.tripsToday}
            icon={Route}
            color="dark"
          />
          <DashboardCard
            title="Under Repair"
            value={stats.underRepair}
            icon={Wrench}
            color="red"
          />
          <DashboardCard
            title="Drivers Available"
            value={stats.driversAvailable}
            icon={Users}
            color="dark"
          />
          <DashboardCard
            title="Fuel Expense"
            value={stats.fuelExpense}
            icon={Fuel}
            color="orange"
          />
          <DashboardCard
            title="Total Earnings"
            value={stats.totalEarnings}
            icon={Wallet}
            color="dark"
            darkTheme={true}
          />
        </div>

        {/* --- LIVE TRACKING MAP --- */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm relative overflow-hidden h-[450px] mb-6">
          <LiveMap vehicles={vehicles} zoom={11} />
        </div>

        {/* --- BOTTOM SECTION (THREE WIDGETS COLUMN LAYOUT) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-4 h-[350px]">
            <VehicleStatus 
              total={stats.totalVehicles} 
              active={stats.activeVehicles} 
              repair={stats.underRepair} 
            />
          </div>

          {/* Compliance Expiry logs table */}
          <div className="lg:col-span-5 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col h-[350px] overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-poppins font-bold text-[#1B2430] text-[16px]">Compliance Expiry</h3>
              <button 
                onClick={() => toast.success("Loading complete compliance records...")}
                className="text-xs text-[#C65D0E] hover:underline font-poppins font-bold"
              >
                View All
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs font-nunito">
                <thead>
                  <tr className="bg-[#F5F7FA] text-[#6B7280] font-poppins font-semibold rounded-lg overflow-hidden">
                    <th className="py-2.5 px-3 rounded-l-lg">VEHICLE</th>
                    <th className="py-2.5 px-3">DOCUMENT</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {compliance.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-3 font-poppins font-semibold text-[#1B2430]">{row.vehicle.replace(/-/g, " ")}</td>
                      <td className="py-3.5 px-3 text-gray-500 font-medium">{row.document}</td>
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide ${
                          row.statusType === "danger" ? "bg-red-50 text-[#DC2626]" :
                          row.statusType === "warning" ? "bg-amber-50 text-[#F59E0B]" :
                          "bg-emerald-50 text-[#16A34A]"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Breakdowns Bar Progress meters */}
          <div className="lg:col-span-3 bg-[#0D0D0D] border border-gray-900 rounded-2xl p-6 shadow-sm flex flex-col h-[350px] overflow-hidden text-white font-nunito">
            <div className="flex items-center gap-2.5 mb-5 shrink-0">
              <svg className="w-5 h-5 text-[#C65D0E]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="font-poppins font-bold text-white text-[15px]">Cost Breakdown</h3>
            </div>

            <div className="flex-1 flex flex-col justify-between py-2">
              {costs.map((cost) => (
                <div key={cost.label} className="w-full">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-1.5">
                    <span className="font-medium">{cost.label}</span>
                    <span className="text-white font-poppins">₹{cost.amount}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C65D0E] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${cost.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
      </div>
    </div>
  );
}
