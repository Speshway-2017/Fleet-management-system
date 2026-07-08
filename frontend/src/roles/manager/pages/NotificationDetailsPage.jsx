import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import L from "leaflet";

export default function NotificationDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const coords = [41.8781, -87.6298];

    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView(coords, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const pinIcon = L.divIcon({
      html: `<div class="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-white shadow-lg border-2 border-white animate-pulse">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker(coords, { icon: pinIcon }).bindPopup("<strong>Violation Location</strong><br/>I-90 Expressway, Mile Marker 42.5").addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleBack = () => {
    navigate("/manager/notifications");
  };

  const handleAction = (action) => {
    toast.success(`${action} action triggered!`);
  };

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Notification Details</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <Icon icon="mdi:alert-octagon" className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Critical Overspeeding Alert</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold">High Priority</span>
                    <span className="text-sm text-gray-500">2 mins ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Icon icon="mdi:email-outline" className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <Icon icon="mdi:archive-outline" className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Event Description</h3>
              <p className="text-gray-700 leading-relaxed">
                Vehicle #TRK-8821 detected traveling at <strong className="text-gray-900">95 mph</strong> in a 65 mph zone on the I-90 Expressway. The vehicle maintained this speed for approximately 4 minutes before entering a congested area. Immediate intervention is recommended to ensure driver safety and regulatory compliance.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Recorded Speed</p>
                <p className="text-xl font-extrabold text-red-600">95 MPH</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Speed Limit</p>
                <p className="text-xl font-extrabold text-gray-700">65 MPH</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-xs text-gray-500 uppercase mb-1">Duration</p>
                <p className="text-xl font-extrabold text-gray-700">04:12 Min</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAction("Dispatch Warning")}
                className="flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors"
              >
                <Icon icon="mdi:alert-outline" className="w-5 h-5" />
                Dispatch Warning
              </button>
              <button
                onClick={() => handleAction("Call Driver")}
                className="flex items-center gap-2 px-6 py-3 bg-white text-amber-700 border border-amber-700 rounded-xl font-medium hover:bg-amber-50 transition-colors"
              >
                <Icon icon="mdi:phone" className="w-5 h-5" />
                Call Driver
              </button>
              <button
                onClick={() => handleAction("View Analytics")}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <Icon icon="mdi:chart-line" className="w-5 h-5" />
                View Analytics
              </button>
            </div>
          </div>

          {/* Violation Location */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Icon icon="mdi:map-marker-radius" className="w-5 h-5 text-amber-700" />
                Violation Location
              </h3>
              <span className="text-sm text-gray-500">I-90 Expressway, Mile Marker 42.5</span>
            </div>
            <div className="relative h-80 bg-gray-100">
              <div ref={mapRef} className="absolute inset-0 z-0 w-full h-full" />
              <div className="absolute right-4 top-4 flex flex-col gap-2 z-[400]">
                <button
                  onClick={() => mapInstanceRef.current?.zoomIn()}
                  className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                  <Icon icon="mdi:plus" className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => mapInstanceRef.current?.zoomOut()}
                  className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                  <Icon icon="mdi:minus" className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => mapInstanceRef.current?.setView([41.8781, -87.6298], 12)}
                  className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                >
                  <Icon icon="mdi:target-variant" className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-80 space-y-6">
          {/* Vehicle Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Vehicle Details</h3>
              <button className="text-xs font-medium text-amber-700 hover:underline">Full Profile</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon icon="mdi:truck" className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">#TRK-8821</p>
                  <p className="text-xs text-gray-500">Freightliner Cascadia 2023</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Total Mileage</span>
                  <span className="text-xs font-medium text-gray-800">42,850 mi</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Last Service</span>
                  <span className="text-xs font-medium text-gray-800">12 Oct 2025</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-500">Maintenance Health</span>
                  <span className="text-xs font-medium text-amber-700">Good</span>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Driver Details</h3>
              <button className="text-xs font-medium text-amber-700 hover:underline">View History</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Marcus Read</p>
                  <p className="text-xs text-gray-500">Emp ID: #REED442</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Daily Drive Time</p>
                  <p className="text-lg font-bold text-gray-800">06:45h</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Safety Score</p>
                  <p className="text-lg font-bold text-amber-700">8.4/10</p>
                </div>
              </div>
              <button className="w-full py-2 border border-amber-700 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors">
                <Icon icon="mdi:message-text-outline" className="w-4 h-4 inline mr-1" />
                Message Driver
              </button>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Recent Alerts for #TRK-8821</h3>
            <div className="space-y-3">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800 mb-1">Moderate Overspeeding</p>
                <p className="text-xs text-gray-500">Today, 08:32 AM • 72 mph</p>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 mb-1">Refuel Completed</p>
                <p className="text-xs text-gray-500">Yesterday, 04:30 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
