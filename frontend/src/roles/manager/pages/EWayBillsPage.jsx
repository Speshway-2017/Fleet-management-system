import { useState } from "react";
import { Download, Printer, Truck, ArrowRight } from "lucide-react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

const BILLS = [
  {
    id: "EWB-2024-8832",
    invoice: "#INV-00421",
    vehicleNo: "MH 12 QX 4582",
    transporter: "Gati KWE Logistics",
    from: "Mumbai",
    to: "Delhi",
    status: "GENERATED",
    validity: "24 Oct, 23:59",
    validityProgress: 72,
    progressColor: "bg-green-500",
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

const TABS = ["All Bills", "Generated", "Expiring", "Pending"];

export default function EWayBillsPage() {
  const [activeTab, setActiveTab] = useState("All Bills");

  const filteredBills = BILLS.filter((b) => {
    if (activeTab === "All Bills") return true;
    if (activeTab === "Generated") return b.status === "GENERATED";
    if (activeTab === "Expiring") return b.status === "EXPIRING";
    if (activeTab === "Pending") return b.status === "PENDING";
    return true;
  });

  const handleDownload = () => toast.success("Downloading E-Way Bills...");
  const handlePrint = () => toast.success("Sending to printer...");
  const handleExtend = (id) => toast.success(`Extended validity for ${id}`);
  const handleGenerate = () => toast.success("Generating new E-Way Bill...");

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">E-Way Bills</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Manage GST E-Way Bills and validity extensions for dispatches.
          </p>
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
        {/* Tabs */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab ? "bg-amber-100 text-amber-700 font-bold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6 text-left whitespace-nowrap">Bill ID</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Invoice / Vehicle</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Route</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Validity</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                  {/* Bill ID */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-bold text-[#1E293B] text-sm">{bill.id}</p>
                    <p className="text-xs text-[#64748B]">{bill.transporter}</p>
                  </td>
                  
                  {/* Invoice / Vehicle */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-bold text-[#1E293B] text-sm">{bill.invoice}</p>
                    <p className="text-xs text-[#64748B] uppercase">{bill.vehicleNo}</p>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#1E293B]">
                      <span>{bill.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                      <span>{bill.to}</span>
                    </div>
                  </td>

                  {/* Validity */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="text-[#64748B] text-sm font-medium">{bill.validity}</p>
                    {bill.validityProgress !== null && (
                      <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${bill.progressColor || "bg-[#B45A0A]"}`}
                          style={{ width: `${bill.validityProgress}%` }}
                        />
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      bill.status === "GENERATED" 
                        ? "bg-green-100 text-green-700" 
                        : bill.status === "EXPIRING" 
                          ? "bg-amber-100 text-amber-700" 
                          : "bg-gray-100 text-gray-600"
                    }`}>
                      {bill.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handlePrint}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleDownload}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {bill.canExtend && (
                        <button
                          onClick={() => handleExtend(bill.id)}
                          className="px-3 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Extend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7EAF0] flex items-center justify-between bg-white">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing 1–{filteredBills.length} of {filteredBills.length} results
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
