import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useState } from "react";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

const MOCK_DOCUMENTS = [
  {
    id: 1,
    name: "Commercial Insurance - Truck #42",
    type: "Insurance",
    category: "Vehicle Docs",
    vehicle: "Volvo FM 12 [KA-01-FE-9912]",
    expiry: "2025-10-24",
    uploadedBy: "Alex Thompson",
    fileSize: "2.4 MB",
    fileName: "insurance_policy_42.pdf"
  }
];

const CATEGORIES = ["Insurance", "Vehicle Docs", "Driver Docs", "Trip Invoices", "Compliance"];
const VEHICLES = ["Volvo FM 12 [KA-01-FE-9912]", "Ashok Leyland 3118", "Tata Ace Gold", "Komila FM-30"];

export default function EditDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = MOCK_DOCUMENTS.find(d => d.id === parseInt(id || 1));
  const [formData, setFormData] = useState({
    name: doc?.name,
    vehicle: doc?.vehicle,
    expiry: doc?.expiry,
    category: doc?.category,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Document updated successfully!");
    navigate(`/manager/documents/view/${doc?.id}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Edit Document
          </h1>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-[#E7EAF0]">
          <h2 className="font-poppins font-bold text-2xl text-[#1E293B]">
            {formData.name}
          </h2>
          <p className="text-sm text-[#64748B] mt-1">
            Update metadata and replace document files for audit compliance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Document Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Owner / Entity
              </label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors appearance-none"
              >
                {VEHICLES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Document Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      formData.category === cat
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mt-8">
            <label className="text-xs font-bold uppercase tracking-widest text-[#64748B] mb-3 block">
              Document File
            </label>
            <div className="border-2 border-dashed border-[#E7EAF0] rounded-2xl p-12 text-center bg-[#F5F7FB]/50 hover:bg-[#F5F7FB] cursor-pointer transition-colors">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-[#1E293B]">
                Replace Current File
              </h3>
              <p className="text-sm text-[#64748B] mt-2">
                Current: <span className="text-[#B45A0A]">{doc?.fileName}</span> ({doc?.fileSize})
              </p>
              <p className="text-xs text-[#94A3B8] mt-3">
                DRAG AND DROP OR CLICK TO BROWSE
              </p>
            </div>
          </div>

          {/* Compliance Verification */}
          <div className="mt-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-[#64748B]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                Compliance Verification
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#B45A0A]" />
                <div>
                  <p className="text-sm text-[#1E293B] font-medium">
                    Digital signature is valid and verified.
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Last verified on Nov 12, 2024 by Alex Thompson.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#B45A0A]" />
                <p className="text-sm text-[#1E293B] font-medium">
                  QR Code scan matches physical copy metadata.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="mt-8 pt-6 border-t border-[#E7EAF0] flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/manager/documents/view/${doc?.id}`)}
              className="px-8 py-2.5 bg-white border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-[#F5F7FB] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
