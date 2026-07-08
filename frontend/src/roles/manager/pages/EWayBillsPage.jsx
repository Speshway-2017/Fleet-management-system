import { useState } from "react";
import { Download, Printer, Filter, Truck, AlertCircle, FileCheck2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

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
    <div className="w-full px-6 md:px-8 py-8 min-h-full bg-gray-50">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Active Bills */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-poppins">
              Active Bills
            </p>
            <p className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">1,284</p>
            <p className="text-xs text-[#B45A0A] font-semibold mt-1">+12% vs last month</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl">
            <FileCheck2 className="w-5 h-5 text-[#64748B]" />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-2xl border-l-4 border-[#B45A0A] border-t border-r border-b border-[#E7EAF0] p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-poppins">
              Expiring Soon
            </p>
            <p className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">42</p>
            <p className="text-xs text-[#B45A0A] font-semibold mt-1">Action required</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-xl">
            <AlertCircle className="w-5 h-5 text-[#B45A0A]" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest font-poppins">
              Pending Verification
            </p>
            <p className="text-3xl font-extrabold text-[#1E293B] mt-2 font-poppins">18</p>
            <p className="text-xs text-[#64748B] font-medium mt-1">GST Portal sync active</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-xl">
            <FileCheck2 className="w-5 h-5 text-[#64748B]" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        {/* Filter + Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <div className="flex items-center bg-white border border-[#E7EAF0] rounded-xl shadow-sm overflow-hidden">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold transition-colors ${
                  activeTab === tab
                    ? "bg-[#1E293B] text-white"
                    : "text-[#64748B] hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2.5 bg-white border border-[#E7EAF0] rounded-xl text-[#64748B] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="p-2.5 bg-white border border-[#E7EAF0] rounded-xl text-[#64748B] hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_1fr] gap-4 px-6 py-3 bg-[#F5F7FB] border-b border-[#E7EAF0]">
          {["BILL DETAILS", "VEHICLE/TRANSPORTER", "ROUTE", "STATUS", "VALIDITY", "ACTIONS"].map((h) => (
            <span key={h} className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#E7EAF0]">
          {filteredBills.length === 0 ? (
            <div className="py-16 text-center text-[#94A3B8] text-sm font-medium">
              No bills found for this filter.
            </div>
          ) : (
            filteredBills.map((bill) => (
              <div
                key={bill.id}
                className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1.5fr_1fr] gap-4 px-6 py-5 items-center hover:bg-[#F5F7FB]/60 transition-colors"
              >
                {/* Bill Details */}
                <div>
                  <p className="text-sm font-bold text-[#1E293B] font-poppins">{bill.id}</p>
                  <p className="text-xs text-[#94A3B8] mt-0.5 font-nunito">Tax Invoice: {bill.invoice}</p>
                </div>

                {/* Vehicle / Transporter */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    bill.status === "EXPIRING" ? "bg-red-50" : "bg-blue-50"
                  }`}>
                    <Truck className={`w-4 h-4 ${
                      bill.status === "EXPIRING" ? "text-red-500" : "text-blue-500"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B] font-poppins">{bill.vehicleNo}</p>
                    <p className="text-xs text-[#94A3B8] font-nunito">{bill.transporter}</p>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-center gap-1.5 text-sm text-[#1E293B] font-medium font-nunito">
                  <span>{bill.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                  <span>{bill.to}</span>
                </div>

                {/* Status */}
                <div>
                  <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[bill.status]}`}>
                    {bill.status}
                  </span>
                </div>

                {/* Validity */}
                <div>
                  {bill.validityProgress !== null ? (
                    <>
                      <p className={`text-xs font-semibold mb-1.5 ${
                        bill.status === "EXPIRING" ? "text-red-500" : "text-[#1E293B]"
                      } font-poppins`}>
                        {bill.validity}
                      </p>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${bill.progressColor}`}
                          style={{ width: `${bill.validityProgress}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-xs text-[#94A3B8] font-medium font-nunito">{bill.validity}</p>
                      <div className="flex gap-0.5 ml-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        ))}
                      </div>
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
