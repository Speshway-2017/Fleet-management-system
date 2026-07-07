import { useState } from "react";
import { Icon } from "@iconify/react";
import { Download, Printer, Filter, ChevronLeft, ChevronRight, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const INITIAL_BILLS = [
  {
    id: "EWB-2024-8832",
    invoice: "#INV-00421",
    vehiclePlate: "MH 12 QX 4582",
    transporter: "Gatl KWE Logistics",
    route: { from: "Mumbai", to: "Delhi" },
    status: "GENERATED",
    validityDate: "24 Oct, 23:59",
    validityProgress: 72,
  },
  {
    id: "EWB-2024-7710",
    invoice: "#INV-00418",
    vehiclePlate: "KA 01 HY 9912",
    transporter: "VRL Logistics",
    route: { from: "Bangalore", to: "Chennai" },
    status: "EXPIRING",
    validityDate: "Today, 14:30",
    validityProgress: 8,
  },
  {
    id: "EWB-2024-9102",
    invoice: "#INV-00430",
    vehiclePlate: "GJ 05 TR 3302",
    transporter: "Safe Express",
    route: { from: "Surat", to: "Ahmedabad" },
    status: "PENDING",
    validityDate: "Awaiting Sync",
    validityProgress: null,
  },
  {
    id: "EWB-2024-6641",
    invoice: "#INV-00415",
    vehiclePlate: "MH 04 AA 7721",
    transporter: "Blue Dart Logistics",
    route: { from: "Pune", to: "Nagpur" },
    status: "GENERATED",
    validityDate: "26 Oct, 18:00",
    validityProgress: 55,
  },
  {
    id: "EWB-2024-5530",
    invoice: "#INV-00410",
    vehiclePlate: "DL 01 CX 3341",
    transporter: "DTDC Freight",
    route: { from: "Delhi", to: "Jaipur" },
    status: "EXPIRED",
    validityDate: "21 Oct, 09:00",
    validityProgress: 0,
  },
];

const TABS = ["All Bills", "Generated", "Expired", "Pending"];

const STATUS_CONFIG = {
  GENERATED: { label: "GENERATED", bg: "bg-[#1E293B]", text: "text-white" },
  EXPIRING:  { label: "EXPIRING",  bg: "bg-[#B45A0A]", text: "text-white" },
  PENDING:   { label: "PENDING",   bg: "bg-[#94A3B8]", text: "text-white" },
  EXPIRED:   { label: "EXPIRED",   bg: "bg-red-100",   text: "text-red-600" },
};

export default function EWayBillsPage() {
  const [activeTab, setActiveTab] = useState("All Bills");
  const [bills, setBills] = useState(INITIAL_BILLS);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [form, setForm] = useState({ invoice: "", vehicle: "", transporter: "", from: "", to: "", validity: "" });

  const activeBills      = bills.filter(b => b.status === "GENERATED" || b.status === "EXPIRING");
  const expiringSoon     = bills.filter(b => b.status === "EXPIRING");
  const pendingVerify    = bills.filter(b => b.status === "PENDING");

  const filteredBills = bills.filter(b => {
    if (activeTab === "All Bills") return true;
    if (activeTab === "Generated") return b.status === "GENERATED";
    if (activeTab === "Expired")   return b.status === "EXPIRED";
    if (activeTab === "Pending")   return b.status === "PENDING";
    return true;
  });

  const handleExtend = (id) => {
    setBills(prev => prev.map(b =>
      b.id === id
        ? { ...b, status: "GENERATED", validityDate: "28 Oct, 23:59", validityProgress: 80 }
        : b
    ));
    toast.success(`E-Way Bill ${id} extended successfully!`);
  };

  const handleDownload = (id) => toast.success(`Downloading ${id}...`);
  const handlePrint    = (id) => toast.success(`Printing ${id}...`);
  const handleView     = (bill) => {
    setSelectedBill(bill);
    setShowDetailsModal(true);
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!form.invoice || !form.vehicle || !form.from || !form.to) {
      toast.error("Please fill all required fields.");
      return;
    }
    const newBill = {
      id: `EWB-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      invoice: form.invoice,
      vehiclePlate: form.vehicle,
      transporter: form.transporter || "Own Fleet",
      route: { from: form.from, to: form.to },
      status: "GENERATED",
      validityDate: form.validity || "3 days",
      validityProgress: 90,
    };
    setBills(prev => [newBill, ...prev]);
    setShowGenerateModal(false);
    setForm({ invoice: "", vehicle: "", transporter: "", from: "", to: "", validity: "" });
    toast.success("New E-Way Bill generated successfully!");
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 bg-[#F5F7FB] min-h-full font-nunito text-[#1E293B]">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Bills */}
        <div className="bg-white rounded-2xl border-l-4 border-l-[#1E293B] border border-[#E7EAF0] shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold font-poppins mb-3">Active Bills</p>
              <p className="text-4xl font-black text-[#1E293B] font-poppins">{bills.length}</p>
              <p className="text-emerald-600 text-xs font-semibold mt-1">+12% vs last month</p>
            </div>
            <div className="w-11 h-11 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center justify-center">
              <Icon icon="mdi:file-document-outline" className="w-5 h-5 text-[#64748B]" />
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-2xl border-l-4 border-l-[#B45A0A] border border-[#E7EAF0] shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold font-poppins mb-3">Expiring Soon</p>
              <p className="text-4xl font-black text-[#1E293B] font-poppins">{expiringSoon.length + 42}</p>
              <p className="text-[#B45A0A] text-xs font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Action required
              </p>
            </div>
            <div className="w-11 h-11 bg-[#FDF3EC] border border-orange-100 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:alert" className="w-5 h-5 text-[#B45A0A]" />
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white rounded-2xl border-l-4 border-l-[#64748B] border border-[#E7EAF0] shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#64748B] uppercase tracking-wider text-[10px] font-bold font-poppins mb-3">Pending Verification</p>
              <p className="text-4xl font-black text-[#1E293B] font-poppins">{pendingVerify.length + 18}</p>
              <p className="text-[#64748B] text-xs font-medium mt-1">GST Portal sync active</p>
            </div>
            <div className="w-11 h-11 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl flex items-center justify-center">
              <Icon icon="mdi:shield-check-outline" className="w-5 h-5 text-[#64748B]" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-[#E7EAF0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success("Filter options coming soon!")}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>

            {/* Tab pills */}
            <div className="flex items-center bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl p-1 gap-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab
                      ? "bg-[#1E293B] text-white shadow-sm"
                      : "text-[#64748B] hover:text-[#1E293B]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload("all")}
              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => toast.success("Printing E-Way Bills list...")}
              className="p-2 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#B45A0A]/20"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" />
              Generate New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider">
                <th className="text-left px-6 py-4">Bill Details</th>
                <th className="text-left px-6 py-4">Vehicle / Transporter</th>
                <th className="text-left px-6 py-4">Route</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Validity</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#64748B] font-medium">
                    No bills found for this filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map(bill => {
                  const statusCfg = STATUS_CONFIG[bill.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={bill.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                      {/* Bill Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-black text-[#1E293B] font-poppins text-sm">{bill.id}</p>
                        <p className="text-[#64748B] text-[10px] font-medium mt-0.5">Tax Invoice: {bill.invoice}</p>
                      </td>

                      {/* Vehicle / Transporter */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            bill.status === "EXPIRING" ? "bg-red-50 text-red-500" : "bg-[#F5F7FB] text-[#64748B]"
                          }`}>
                            <Icon icon="mdi:truck" className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1E293B] text-xs font-poppins">{bill.vehiclePlate}</p>
                            <p className="text-[#64748B] text-[10px]">{bill.transporter}</p>
                          </div>
                        </div>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-[#1E293B]">
                          <span>{bill.route.from}</span>
                          <Icon icon="mdi:arrow-right" className="w-4 h-4 text-[#B45A0A]" />
                          <span>{bill.route.to}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Validity */}
                      <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                        <p className={`text-xs font-bold mb-1.5 ${
                          bill.status === "EXPIRING" ? "text-[#B45A0A]" :
                          bill.status === "EXPIRED" ? "text-red-500" :
                          bill.status === "PENDING" ? "text-[#64748B]" :
                          "text-[#1E293B]"
                        }`}>
                          {bill.validityDate}
                        </p>
                        {bill.validityProgress !== null ? (
                          <div className="w-24 h-1.5 bg-[#E7EAF0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                bill.validityProgress > 50 ? "bg-[#1E293B]" :
                                bill.validityProgress > 15 ? "bg-[#B45A0A]" :
                                "bg-red-500"
                              }`}
                              style={{ width: `${bill.validityProgress}%` }}
                            />
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-2 h-2 rounded-full bg-[#94A3B8] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(bill)}
                            className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors cursor-pointer"
                            title="View"
                          >
                            <Icon icon="mdi:eye-outline" className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(bill.id)}
                            className="p-1.5 text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] rounded-lg transition-colors cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {bill.status === "EXPIRING" && (
                            <button
                              onClick={() => handleExtend(bill.id)}
                              className="px-3 py-1.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-lg text-[10px] font-black transition-colors cursor-pointer shadow-sm"
                            >
                              Extend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="px-6 py-4 border-t border-[#E7EAF0] flex items-center justify-between bg-white select-none">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing 1–{filteredBills.length} of <span className="font-bold text-[#1E293B]">1,284</span> results
          </span>
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 border border-[#E7EAF0] rounded-lg text-[#64748B] hover:bg-[#F5F7FB] cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 border border-[#E7EAF0] rounded-lg text-[#64748B] hover:bg-[#F5F7FB] cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bill Details Modal */}
      {showDetailsModal && selectedBill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
              <div>
                <h3 className="font-poppins font-black text-lg text-[#1E293B]">{selectedBill.id}</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Tax Invoice: {selectedBill.invoice}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-[#F5F7FB] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>

            {/* Status badge */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_CONFIG[selectedBill.status]?.bg} ${STATUS_CONFIG[selectedBill.status]?.text}`}>
                {STATUS_CONFIG[selectedBill.status]?.label}
              </span>
              <span className="text-xs text-[#64748B]">Validity: {selectedBill.validityDate}</span>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "E-Way Bill No.", value: selectedBill.id },
                { label: "Tax Invoice", value: selectedBill.invoice },
                { label: "Vehicle Plate", value: selectedBill.vehiclePlate },
                { label: "Transporter", value: selectedBill.transporter },
                { label: "Origin", value: selectedBill.route.from },
                { label: "Destination", value: selectedBill.route.to },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-[#F5F7FB] rounded-xl border border-[#E7EAF0]">
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider font-poppins">{item.label}</p>
                  <p className="font-bold text-[#1E293B] text-sm mt-0.5 font-poppins">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Route visual */}
            <div className="flex items-center gap-3 p-4 bg-[#F5F7FB] border border-[#E7EAF0] rounded-xl">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
                <div className="w-0.5 h-8 bg-dashed border-l border-dashed border-[#B45A0A] my-1" />
                <div className="w-3 h-3 rounded-full bg-[#B45A0A] border-2 border-white shadow" />
              </div>
              <div className="flex flex-col justify-between h-14">
                <p className="font-bold text-sm text-[#1E293B]">{selectedBill.route.from}</p>
                <p className="font-bold text-sm text-[#1E293B]">{selectedBill.route.to}</p>
              </div>
            </div>

            {/* Validity bar */}
            {selectedBill.validityProgress !== null && (
              <div>
                <div className="flex justify-between text-xs font-medium text-[#64748B] mb-1.5">
                  <span>Validity Progress</span>
                  <span className="font-bold text-[#1E293B]">{selectedBill.validityProgress}%</span>
                </div>
                <div className="w-full h-2 bg-[#E7EAF0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedBill.validityProgress > 50 ? "bg-[#1E293B]" :
                      selectedBill.validityProgress > 15 ? "bg-[#B45A0A]" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${selectedBill.validityProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-[#E7EAF0]">
              <button
                onClick={() => { handleDownload(selectedBill.id); setShowDetailsModal(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              {selectedBill.status === "EXPIRING" && (
                <button
                  onClick={() => { handleExtend(selectedBill.id); setShowDetailsModal(false); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-[#B45A0A]/20"
                >
                  Extend Validity
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate New Modal */}
      {showGenerateModal && (        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7EAF0] pb-4">
              <h3 className="font-poppins font-black text-lg text-[#1E293B]">Generate E-Way Bill</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-[#F5F7FB] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              {[
                { label: "Tax Invoice Number *", key: "invoice", placeholder: "#INV-00000" },
                { label: "Vehicle Plate *",      key: "vehicle", placeholder: "MH 12 XX 0000" },
                { label: "Transporter Name",     key: "transporter", placeholder: "e.g. VRL Logistics" },
                { label: "Origin *",             key: "from",  placeholder: "e.g. Mumbai" },
                { label: "Destination *",        key: "to",    placeholder: "e.g. Delhi" },
                { label: "Validity",             key: "validity", placeholder: "e.g. 3 days" },
              ].map(field => (
                <div key={field.key} className="space-y-1">
                  <label className="text-xs font-bold text-[#64748B] block font-poppins">{field.label}</label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2 border-t border-[#E7EAF0]">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#F5F7FB] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white rounded-xl text-xs font-bold shadow-md shadow-[#B45A0A]/20 cursor-pointer"
                >
                  Generate Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
