import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

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
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">E-Way Bills</h1>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-xl font-medium hover:bg-amber-800 transition-colors w-full sm:w-auto justify-center cursor-pointer"
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-amber-100 text-amber-700" : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6 text-left whitespace-nowrap">Bill ID</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Vehicle</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Date</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-bold text-[#1E293B] text-sm">{bill.id}</p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-bold text-[#1E293B] text-sm">{bill.vehicle}</p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      bill.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="text-[#64748B] text-sm">{bill.date}</p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                        <Icon icon="mdi:eye" className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                        <Icon icon="mdi:download" className="w-4 h-4" />
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
