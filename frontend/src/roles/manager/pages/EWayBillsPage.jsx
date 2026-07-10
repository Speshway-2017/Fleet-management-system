import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Printer, Truck, ArrowRight, FileText, Clock, ClipboardCheck, Filter, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

const BILLS = [
  {
    id: "EWB-2024-8832",
    invoice: "Tax Invoice: #INV-00421",
    vehicleNo: "MH 12 QX 4582",
    transporter: "Gati KWE Logistics",
    from: "Mumbai",
    to: "Delhi",
    status: "GENERATED",
    validity: "24 Oct, 23:59",
    validityProgress: 72,
    progressColor: "bg-green-600",
  },
  {
    id: "EWB-2024-7710",
    invoice: "Tax Invoice: #INV-00418",
    vehicleNo: "KA 01 HY 9912",
    transporter: "VRL Logistics",
    from: "Bangalore",
    to: "Chennai",
    status: "EXPIRING",
    validity: "Today, 14:30",
    validityProgress: 18,
    progressColor: "bg-red-600",
    canExtend: true,
  },
  {
    id: "EWB-2024-9102",
    invoice: "Tax Invoice: #INV-00430",
    vehicleNo: "GJ 05 TR 3302",
    transporter: "Safe Express",
    from: "Surat",
    to: "Ahmedabad",
    status: "PENDING",
    validity: "Awaiting Sync",
    validityProgress: null,
  },
];

const TABS = ["All Bills", "Generated", "Expired", "Pending"];

export default function EWayBillsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Bills");

  const filteredBills = BILLS.filter((b) => {
    if (activeTab === "All Bills") return true;
    if (activeTab === "Generated") return b.status === "GENERATED";
    if (activeTab === "Expired") return b.status === "EXPIRING";
    if (activeTab === "Pending") return b.status === "PENDING";
    return true;
  });

  const handleDownload = () => toast.success("Downloading E-Way Bills...");
  const handlePrint = () => toast.success("Sending to printer...");
  const handleExtend = (id) => toast.success(`Extended validity for ${id}`);
  const handleGenerate = () => navigate("/manager/eway/generate");

  return (
    <div className="p-8 bg-gray-50/50 min-h-screen font-poppins">
      <Breadcrumb />
      
      {/* Top Header Row with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">E-Way Bills</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px] font-medium font-nunito">
            Manage GST E-Way Bills and validity extensions for dispatches.
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-xl font-bold hover:bg-amber-800 transition-all shadow-md shadow-amber-700/20 active:scale-95 cursor-pointer text-xs uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          Generate New
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 select-none">
        {/* Stat 1: Active Bills */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between border-l-4 border-l-gray-900">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Active Bills</span>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-2">1,284</h3>
            </div>
            <div className="bg-slate-100 text-slate-800 p-3 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-green-600 font-semibold flex items-center gap-1">
            <span>+12% vs last month</span>
          </div>
        </div>

        {/* Stat 2: Expiring Soon */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-600">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Expiring Soon</span>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-2">42</h3>
            </div>
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-500 font-semibold">
            Action required
          </div>
        </div>

        {/* Stat 3: Pending Verification */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between border-l-4 border-l-indigo-600">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Pending Verification</span>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-2">18</h3>
            </div>
            <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 font-medium">
            GST Portal sync active
          </div>
        </div>
      </div>

      {/* Main Table Block */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Filter Action bar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap bg-white">
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-all active:scale-95">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <div className="flex items-center gap-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer inline-flex"
              title="Download Report"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer inline-flex"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6 text-left whitespace-nowrap">Bill Details</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Vehicle/Transporter</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Route</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-left whitespace-nowrap">Validity</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium">
                    No E-Way Bills found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                    {/* Bill details */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-extrabold text-[#1E293B] text-sm">{bill.id}</p>
                      <span className="text-xs text-[#64748B] font-medium block mt-0.5">{bill.invoice}</span>
                    </td>
                    
                    {/* Vehicle/Transporter */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] text-xs uppercase">{bill.vehicleNo}</p>
                          <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">{bill.transporter}</span>
                        </div>
                      </div>
                    </td>

                    {/* Route */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B]">
                        <span>{bill.from}</span>
                        <ArrowRight className="w-3 h-3 text-[#64748B]" />
                        <span>{bill.to}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black inline-block uppercase tracking-wider select-none ${
                        bill.status === "GENERATED" 
                          ? "bg-black text-white" 
                          : bill.status === "EXPIRING" 
                            ? "bg-amber-700 text-white" 
                            : "bg-slate-300 text-slate-700 font-bold"
                      }`}>
                        {bill.status}
                      </span>
                    </td>

                    {/* Validity */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="text-[#1E293B] text-xs font-bold">{bill.validity}</p>
                      {bill.validityProgress !== null ? (
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full ${bill.progressColor || "bg-[#B45A0A]"}`}
                            style={{ width: `${bill.validityProgress}%` }}
                          />
                        </div>
                      ) : (
                        <span className="flex items-center gap-0.5 mt-1 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {bill.canExtend ? (
                        <button
                          onClick={() => handleExtend(bill.id)}
                          className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm shadow-amber-700/10 active:scale-95"
                        >
                          Extend
                        </button>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 select-none block pr-4">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7EAF0] flex items-center justify-between bg-white select-none">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing 1–{filteredBills.length} of {filteredBills.length} results
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 text-xs font-bold cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center border border-[#E7EAF0] rounded bg-white text-[#64748B] hover:bg-gray-50 text-xs font-bold cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
