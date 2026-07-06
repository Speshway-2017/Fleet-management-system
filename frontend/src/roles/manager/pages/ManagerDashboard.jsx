import { useState } from "react";
import { Icon } from "@iconify/react";
import {
  mockDashboardStats,
  mockVehicleStatus,
  mockComplianceExpiry,
  mockCostBreakdown,
} from "@/data/mockManagerDashboard";

export default function ManagerDashboard() {
  const [zone, setZone] = useState("All Zones");

  return (
    <div className="p-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
        {mockDashboardStats.map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-2xl shadow-sm flex flex-col justify-between ${stat.color}`}
          >
            <p className={`text-sm font-medium ${stat.color === "bg-black" ? "text-gray-400" : "text-gray-600"}`}>
              {stat.label}
            </p>
            <div className="flex items-end justify-between mt-4">
              <span className={`text-3xl font-bold ${stat.color === "bg-black" ? "text-white" : "text-gray-900"}`}>
                {stat.value}
              </span>
              <Icon icon={stat.icon} width="32" height="32" className={`${stat.color === "bg-black" ? "text-white" : "text-gray-700"}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="p-4 flex items-center gap-4 border-b border-gray-200">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <span className="w-3 h-3 bg-amber-700 rounded-full"></span>
            <span className="text-sm font-medium text-gray-700">380 Vehicles Online</span>
          </div>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm"
          >
            <option>All Zones</option>
            <option>North</option>
            <option>South</option>
            <option>East</option>
            <option>West</option>
          </select>
        </div>
        <div className="h-96 bg-gray-100 relative">
          {/* Placeholder map */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg">Interactive Map</p>
              <p className="text-sm">380 vehicles online across {zone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Icon icon="mdi:circle-double" width="24" height="24" />
            Vehicle Status
          </h3>
          <div className="flex items-center justify-center">
            {/* Simple donut chart placeholder */}
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Active */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#78350f"
                  strokeWidth="12"
                  strokeDasharray={`${(380 / 450) * 251.2} 251.2`}
                />
                {/* Inactive */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  strokeDasharray={`${(55 / 450) * 251.2} 251.2`}
                  strokeDashoffset={`${(380 / 450) * 251.2}`}
                />
                {/* Maintenance */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="12"
                  strokeDasharray={`${(15 / 450) * 251.2} 251.2`}
                  strokeDashoffset={`${(380 + 55) / 450 * 251.2}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">
                  {mockVehicleStatus.total}
                </span>
                <span className="text-xs text-gray-500">TOTAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Expiry */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Compliance Expiry</h3>
            <button className="text-amber-700 text-sm font-medium">View All</button>
          </div>
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  VEHICLE
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  DOCUMENT
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockComplianceExpiry.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                    {item.vehicle}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.document}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-black rounded-2xl text-white p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Icon icon="mdi:bank-outline" width="24" height="24" />
            Cost Breakdown
          </h3>
          <div className="space-y-6">
            {mockCostBreakdown.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">{item.category}</span>
                  <span className="text-sm font-medium">{item.amount}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-amber-700 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
