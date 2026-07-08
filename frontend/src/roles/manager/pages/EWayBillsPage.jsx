import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function EWayBillsPage() {
  const [activeTab, setActiveTab] = useState("All");

  const bills = [
    { id: "EWB-12345", vehicle: "#TRK-8821", status: "Active", date: "Oct 24, 2023" },
    { id: "EWB-12344", vehicle: "#VAN-402", status: "Expired", date: "Oct 20, 2023" },
    { id: "EWB-12343", vehicle: "#TRK-7710", status: "Active", date: "Oct 23, 2023" },
  ];

  const handleGenerate = () => {
    toast.success("Generating new E-Way Bill...");
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">E-Way Bills</h1>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors"
        >
          <Icon icon="mdi:plus" className="w-5 h-5" />
          Generate New
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          {["All", "Active", "Expired", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-amber-100 text-amber-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Bill ID</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Vehicle</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{bill.id}</td>
                  <td className="px-6 py-4 text-gray-600">{bill.vehicle}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bill.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{bill.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Icon icon="mdi:eye" className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                        <Icon icon="mdi:download" className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
