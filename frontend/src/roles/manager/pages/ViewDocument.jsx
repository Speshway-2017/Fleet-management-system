import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  ShieldCheck,
  ZoomIn,
  Printer,
  Download,
  FileText,
  Truck,
  ExternalLink,
  Clock,
  CheckCircle2,
  TrendingUp
} from "lucide-react";
import { managerApi } from "../api/managerApi";
import toast from "react-hot-toast";

export default function ViewDocument() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await managerApi.getDocumentById(id);
        const data = response.data?.data || response.data;
        if (data) {
          setDoc({
            ...data,
            id: data._id,
            name: data.title,
            complianceScore: 8.5,
            uploadedBy: "Alex Thompson",
            activityLog: [
              { action: "Document Verified", user: "Alex Thompson", date: new Date(data.updatedAt).toLocaleDateString("en-IN") },
              { action: "Uploaded", user: "Alex Thompson", date: new Date(data.createdAt).toLocaleDateString("en-IN") }
            ]
          });
        }
      } catch (error) {
        toast.error("Failed to load document details");
        console.error(error);
      }
    };
    fetchDoc();
  }, [id]);

  if (!doc) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6 lg:p-8 font-poppins">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-t-[#B45A0A] border-r-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-semibold">Loading document details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
              View Document
            </h1>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link to="/manager/documents" className="hover:text-[#B45A0A] hover:underline cursor-pointer">
              Documents
              </Link>
              <span className="text-gray-400">›</span>
              <span className="text-[#B45A0A]">{doc?.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/manager/documents/edit/${doc?.id}`)}
            className="px-5 py-2.5 bg-white border border-[#B45A0A] rounded-xl text-sm font-semibold text-[#B45A0A] hover:bg-[#FDF3EC] transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Document</span>
          </button>
          <button className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer">
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>Compliance Audit</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Document Viewer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Preview Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-[#E7EAF0] flex items-center justify-between bg-[#F5F7FB]">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] cursor-pointer">
                  <ZoomIn className="w-5 h-5" />
                  <span>Zoom</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] cursor-pointer">
                  <Printer className="w-5 h-5" />
                  <span>Print</span>
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-[#64748B] hover:text-[#1E293B] cursor-pointer">
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
              </div>
              <div className="text-sm text-[#64748B]">
                Page 1 of 4
              </div>
            </div>

            {/* PDF Preview Area */}
            <div className="p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-[600px] flex items-center justify-center">
              <div className="bg-white shadow-xl w-full max-w-2xl aspect-[3/4] p-8 relative overflow-hidden">
                {/* Mock PDF Content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="text-9xl font-black text-gray-400">
                    PREVIEW ONLY
                  </div>
                </div>
                <div className="relative z-10 space-y-8">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#1E293B]">CERTIFICATE OF INSURANCE</h2>
                    <p className="text-xs uppercase tracking-widest text-gray-500">Policy Number: PL-4492-AX20</p>
                  </div>
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-gray-500">Insured Party</h3>
                      <p className="font-bold text-[#1E293B]">Voluux FM-30 Logistics Corp.</p>
                      <p className="text-sm text-gray-600">422 Industrial Road</p>
                      <p className="text-sm text-gray-600">Mumbai, MH 400001</p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-gray-500">Vehicle Description</h3>
                      <p className="font-bold text-[#1E293B]">Heavy Duty Semi-Truck #42</p>
                      <p className="text-sm text-gray-600">VIN: 1HGCM82633A00XXX</p>
                      <p className="text-sm text-gray-600">Model Year: 2023</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-gray-500">Coverage Type</h3>
                      <p className="font-bold text-[#1E293B]">Commercial General Liability</p>
                      <p className="text-sm text-gray-600">Limit: ₹1,50,00,000.00</p>
                      <p className="text-sm text-gray-600">Combined Single Limit</p>
                    </div>
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-gray-500">Effective Period</h3>
                      <p className="font-bold text-[#1E293B]">Oct 24, 2023 - Oct 24, 2024</p>
                      <p className="text-sm text-gray-600">Auto-Renewal: Disabled</p>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-8 mt-8">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="text-left">
                        <div className="border-b border-gray-400 w-48 pb-2 mb-2" />
                        <p className="text-lg text-[#1E293B]">Mark J. Sterling</p>
                        <p className="text-xs uppercase tracking-widest text-gray-500">Authorized Representative</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs uppercase tracking-widest text-gray-500">Verified Blockchain ID</span>
                          <div className="bg-blue-100 px-4 py-1 rounded flex items-center gap-1">
                            <span className="text-xs font-mono">████████████</span>
                            <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Details */}
        <div className="space-y-6">
          {/* Document Status Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
            <h3 className="font-poppins font-medium text-lg text-[#64748B] mb-6">
              DOCUMENT STATUS
            </h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#64748B] mb-1">Current State</p>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm">
                    Active
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-[#64748B] mb-1">Expiry Date</p>
                <span className="font-bold text-xl text-[#1E293B]">
                  {doc?.expiry && doc.expiry !== "-" ? new Date(doc.expiry).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' }) : "No Expiry"}
                </span>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B] mb-1">Compliance Score</p>
                <p className="font-black text-lg text-[#1E293B]">
                  {doc?.complianceScore} / 10
                </p>
              </div>
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" stroke="#dbeafe" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#B45A0A" strokeWidth="8" fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset="251.2 - (251.2 * 0.85)"
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#B45A0A]" />
                </div>
              </div>
            </div>
          </div>

          {/* Properties Card */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
            <h3 className="font-poppins font-medium text-lg text-[#64748B] mb-6">
              PROPERTIES
            </h3>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-[#64748B] mb-1">Document Type</p>
                <p className="font-bold text-[#1E293B]">
                  {doc?.type}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Owner / Entity</p>
                <p className="font-bold text-[#1E293B]">
                  Voluux FM-30 Logistics
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Assigned Vehicle</p>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#64748B]" />
                  <span className="font-bold text-[#1E293B]">
                    {doc?.vehicle}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-[#64748B] mb-1">Region</p>
                <p className="font-bold text-[#1E293B]">
                  North America (IL / WI / IN)
                </p>
              </div>
              <div className="pt-4 border-t border-[#E7EAF0]">
                <button className="w-full py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-medium text-[#1E293B] flex items-center justify-center gap-2 cursor-pointer">
                  <span>View Full Metadata</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
            <h3 className="font-poppins font-medium text-lg text-[#64748B] mb-6">
              ACTIVITY TIMELINE
            </h3>
            <div className="space-y-4">
              {doc?.activityLog.map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#B45A0A]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#B45A0A]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E293B]">{item.action}</p>
                    <p className="text-xs text-[#64748B]">{item.user} • {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
