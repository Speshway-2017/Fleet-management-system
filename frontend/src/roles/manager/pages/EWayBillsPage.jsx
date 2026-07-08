import { useState } from "react";
import { Download, Printer, Filter, Truck, AlertCircle, FileCheck2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

const BILLS = [
  {
    id: "EWB-2024-8832",
    invoice: "#INV-00421",
    vehicleNo: "MH 12 QX 4582",
    transporter: "Gatl KWE Logistics",
    from: "Mumbai",
    to: "Delhi",
    status: "GENERATED",
    validity: "24 Oct, 23:59",
    validityProgress: 72,
    progressColor: "bg-[#B45A0A]",
  },
  {
    id: "EWB-2024-7710",
    invoice: "#INV-00418",
    vehicleNo: "KA 01 HY 9912",
    transporter: "VRL Logistics",
    from: "Bangalore",
    to: "Chennai",
    status: "EXPIRING",
    validity: "Today, 14:30",
    validityProgress: 18,
    progressColor: "bg-red-500",
    canExtend: true,
  },
  {
    id: "EWB-2024-9102",
    invoice: "#INV-00430",
    vehicleNo: "GJ 05 TR 3302",
    transporter: "Safe Express",
    from: "Surat",
    to: "Ahmedabad",
    status: "PENDING",
    validity: "Awaiting Sync",
    validityProgress: null,
  },
];

const STATUS_STYLES = {
  GENERATED: "bg-[#1E293B] text-white",
  EXPIRING: "bg-[#B45A0A] text-white",
  PENDING: "bg-gray-200 text-gray-600",
};

const TABS = ["All Bills", "Generated", "Expired", "Pending"];

export default function EWayBillsPage() {
  const [activeTab, setActiveTab] = useState("All Bills");

  const filteredBills = BILLS.filter((b) => {
    if (activeTab === "All Bills") return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleDownload = () => toast.success("Downloading E-Way Bills...");
  const handlePrint = () => toast.success("Sending to printer...");
  const handleExtend = (id) => toast.success(`Extended validity for ${id}`);

  return (

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
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {bill.canExtend && (
                    <button
                      onClick={() => handleExtend(bill.id)}
                      className="px-3 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer"
                    >
                      Extend
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7EAF0] flex items-center justify-between bg-white">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing 1–10 of 1,284 results
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 text-xs font-bold">
              ‹
            </button>
            <button className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 text-xs font-bold">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
