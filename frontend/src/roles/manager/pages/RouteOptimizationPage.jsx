import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Search,
  Check,
  AlertTriangle,
  RotateCw,
  Zap,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock
} from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../dashboard/Sidebar";
import Header from "../dashboard/Header";
import "../dashboard/manager.css";

const MOCK_ROUTES = [
  {
    id: "r1",
    routeNumber: "ROUTE #PN-MB-03",
    vehicleName: "Truck 12 - Heavy Duty",
    driver: "Ravi Kumar",
    efficiency: "96%",
    distanceSaved: "13.4 km",
    trafficAlerts: "2 Heavy",
    alertsSeverity: "heavy",
    coords: [
      [18.5204, 73.8567], // Pune
      [18.7508, 73.4218], // Lonavala
      [19.0760, 72.8777]  // Mumbai
    ],
    optimizedCoords: [
      [18.5204, 73.8567], // Pune
      [18.8000, 73.3500], // Alternate bypass Khopoli
      [19.0760, 72.8777]  // Mumbai
    ]
  },
  {
    id: "r2",
    routeNumber: "ROUTE #CK-NS-04",
    vehicleName: "Van 04 - Express",
    driver: "Suresh Raina",
    efficiency: "94%",
    distanceSaved: "9.1 km",
    trafficAlerts: "Clear",
    alertsSeverity: "clear",
    coords: [
      [18.7600, 73.8500], // Chakan
      [19.2000, 73.8000], // Standard Highway
      [19.9975, 73.7898]  // Nashik
    ],
    optimizedCoords: [
      [18.7600, 73.8500], // Chakan
      [19.1500, 73.8900], // Optimized expressway route
      [19.9975, 73.7898]  // Nashik
    ]
  },
  {
    id: "r3",
    routeNumber: "ROUTE #KH-PN-01",
    vehicleName: "Truck 05 - Reefer",
    driver: "Vikram Singh",
    efficiency: "90%",
    distanceSaved: "0.7 km",
    trafficAlerts: "1 Moderate",
    alertsSeverity: "moderate",
    coords: [
      [16.7050, 74.2433], // Kolhapur
      [17.6805, 73.9918], // Satara
      [18.5204, 73.8567]  // Pune
    ],
    optimizedCoords: [
      [16.7050, 74.2433], // Kolhapur
      [17.7000, 74.0100], // Satara bypass
      [18.5204, 73.8567]  // Pune
    ]
  }
];

export default function RouteOptimizationPage() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState("r1");
  const [routes, setRoutes] = useState(MOCK_ROUTES);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const standardRouteLineRef = useRef(null);
  const optimizedRouteLineRef = useRef(null);
  const markersGroupRef = useRef(null);

  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Center around Lonavala corridor
    const centerCoords = [18.7481, 73.4076];
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(centerCoords, 9);

    // Grayscale street tiles layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      className: "map-tiles-grayscale"
    }).addTo(map);

    L.control.zoom({
      position: "topright"
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Polyline Overlay on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRoute) return;

    // Clear old lines/markers
    if (standardRouteLineRef.current) map.removeLayer(standardRouteLineRef.current);
    if (optimizedRouteLineRef.current) map.removeLayer(optimizedRouteLineRef.current);
    markersGroupRef.current.clearLayers();

    // 1. Draw Standard original route (Dashed Red Line)
    standardRouteLineRef.current = L.polyline(selectedRoute.coords, {
      color: "#EF4444",
      weight: 3,
      dashArray: "6, 8",
      opacity: 0.6
    }).addTo(map);

    // 2. Draw Optimized path route (Solid Orange Line)
    optimizedRouteLineRef.current = L.polyline(selectedRoute.optimizedCoords, {
      color: "#B45A0A",
      weight: 5,
      opacity: 0.9
    }).addTo(map);

    // 3. Draw Start & End Markers
    const startLoc = selectedRoute.optimizedCoords[0];
    const endLoc = selectedRoute.optimizedCoords[selectedRoute.optimizedCoords.length - 1];

    const startIcon = L.divIcon({
      html: `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">S</div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const endIcon = L.divIcon({
      html: `<div class="w-6 h-6 rounded-full bg-[#B45A0A] border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">E</div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker(startLoc, { icon: startIcon }).addTo(markersGroupRef.current);
    L.marker(endLoc, { icon: endIcon }).addTo(markersGroupRef.current);

    // Adjust map viewport bounds to encompass the optimized route coordinates
    map.fitBounds(L.polyline(selectedRoute.optimizedCoords).getBounds(), {
      padding: [40, 40]
    });

  }, [selectedRouteId, routes]);

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    toast.loading("Analyzing traffic overlays & delays...");

    setTimeout(() => {
      toast.dismiss();
      setIsOptimizing(false);

      // Simulate a change in distances saved
      const updated = routes.map(r => {
        if (r.id === "r1") return { ...r, distanceSaved: "15.8 km", efficiency: "98%" };
        if (r.id === "r2") return { ...r, distanceSaved: "11.2 km", efficiency: "96%" };
        return r;
      });
      setRoutes(updated);
      toast.success("Auto-Optimizer successfully optimized 3 routes!");
    }, 2000);
  };

  const handleAcceptRoute = (route) => {
    toast.success(`${route.routeNumber} accepted & dispatch route set!`);
    setRoutes(prev => prev.filter(r => r.id !== route.id));
    if (selectedRouteId === route.id) {
      const remaining = routes.filter(r => r.id !== route.id);
      if (remaining.length > 0) {
        setSelectedRouteId(remaining[0].id);
      }
    }
  };

  const handleReRoute = (route) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Recalculating alternative bypasses...",
        success: "Found new route with lower toll gates!",
        error: "Reroute failed"
      }
    );
  };

  const filteredRoutes = routes.filter(r => {
    const q = search.toLowerCase();
    return (
      r.routeNumber.toLowerCase().includes(q) ||
      r.vehicleName.toLowerCase().includes(q) ||
      r.driver.toLowerCase().includes(q)
    );
  });

  const getAlertColor = (severity) => {
    if (severity === "heavy") return "text-red-600 bg-red-50 border-red-100";
    if (severity === "moderate") return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-emerald-600 bg-emerald-50 border-emerald-100 font-medium";
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FB] font-nunito text-[#1E293B]">
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onMenuToggle={() => setMobileSidebarOpen(true)} showMenuButton={true} />

        <main className="flex-1 p-0 relative overflow-hidden flex min-h-[calc(100vh-72px)] select-none">
          
          {/* Map display */}
          <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />

          {/* Top banner / overlay label */}
          <div className="absolute left-6 top-6 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#E7EAF0]/80 shadow-md">
            <h2 className="font-poppins font-black text-sm text-[#1E293B]">Route Optimization</h2>
            <p className="text-[10px] text-[#64748B] font-medium block mt-0.5">Pune-Mumbai-Nashik-Kolhapur Logistics</p>
          </div>

          {/* Right Floating active routes card container */}
          <div className="absolute right-6 top-6 bottom-6 w-[350px] bg-white/95 backdrop-blur-md rounded-2xl border border-[#E7EAF0]/80 shadow-2xl p-5 z-[1000] flex flex-col space-y-4 max-h-[85vh] overflow-hidden">
            
            <div className="flex items-center justify-between shrink-0">
              <h3 className="font-poppins font-black text-sm text-[#1E293B]">Active Routes</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-50 border border-orange-100 text-[#B45A0A] rounded-lg font-poppins">
                {routes.length} Active
              </span>
            </div>

            {/* Route Search */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search active routes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] font-medium"
              />
            </div>

            {/* Scrollable routes cards list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {filteredRoutes.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">No active routes available</div>
              ) : (
                filteredRoutes.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRouteId(r.id)}
                    className={`p-4 border.5 rounded-xl transition-all cursor-pointer flex flex-col space-y-3 relative ${
                      selectedRouteId === r.id
                        ? "border-[#B45A0A] bg-orange-50/10 shadow-sm"
                        : "border-[#E7EAF0] bg-white hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-bold text-gray-400 font-poppins uppercase tracking-wider block">{r.routeNumber}</span>
                        <h4 className="font-bold text-xs text-[#1E293B] font-poppins mt-0.5">{r.vehicleName}</h4>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-[#22C55E] text-[10px] font-bold rounded-lg font-poppins">
                        {r.efficiency} EFFICIENCY
                      </span>
                    </div>

                    {/* Stats details */}
                    <div className="grid grid-cols-2 gap-2 select-none">
                      <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                        <span className="text-[8px] font-bold text-[#64748B] uppercase block">Dist. Saved</span>
                        <span className="text-xs font-black text-[#1E293B] mt-0.5 inline-block">{r.distanceSaved}</span>
                      </div>
                      <div className={`rounded-lg p-2 text-center border ${getAlertColor(r.alertsSeverity)}`}>
                        <span className="text-[8px] font-bold uppercase block opacity-85">Traffic Alerts</span>
                        <span className="text-xs font-black mt-0.5 inline-block">{r.trafficAlerts}</span>
                      </div>
                    </div>

                    {/* Action buttons row */}
                    <div className="grid grid-cols-2 gap-2 shrink-0 pt-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleReRoute(r)}
                        className="py-1.5 px-3 border border-[#E7EAF0] hover:bg-gray-50 rounded-xl text-[10px] font-bold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
                      >
                        Re-route
                      </button>
                      <button
                        onClick={() => handleAcceptRoute(r)}
                        className="py-1.5 px-3 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-[10px] font-bold shadow-sm shadow-[#B45A0A]/10 transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Savings bottom row */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between shrink-0 select-none">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">Fleet Savings Today</span>
              <span className="text-sm font-black text-[#B45A0A] font-poppins">₹2,410.50</span>
            </div>

          </div>

          {/* Floating Route Summary Overlay bottom-center */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-[#E7EAF0] rounded-2xl shadow-xl p-4 z-[1000] w-[260px] flex flex-col space-y-3.5 select-none text-center">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider font-poppins">Route Summary</span>
              <span className="px-2 py-0.5 bg-orange-50 text-[#B45A0A] text-[9px] font-bold rounded-lg font-poppins">94% AVG</span>
            </div>

            <div className="grid grid-cols-2 gap-2 select-none">
              <div>
                <span className="text-[8px] font-bold text-[#64748B] uppercase block">Fuel Saved</span>
                <span className="text-xs font-black text-emerald-600 block mt-0.5">14.2%</span>
              </div>
              <div>
                <span className="text-[8px] font-bold text-[#64748B] uppercase block">Avg. Delay</span>
                <span className="text-xs font-black text-blue-600 block mt-0.5">-12m</span>
              </div>
            </div>

            <button
              onClick={handleRunOptimizer}
              disabled={isOptimizing}
              className="w-full py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-60 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 text-orange-400 ${isOptimizing ? "animate-spin" : ""}`} />
              <span>{isOptimizing ? "Optimizing..." : "Run Auto-Optimizer"}</span>
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}
