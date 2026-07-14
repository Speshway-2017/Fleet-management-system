import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Download
} from "lucide-react";
import { managerApi } from "../api/managerApi";
import toast from "react-hot-toast";

export default function ComplianceAuditPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all"); // all, compliant, non-compliant
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const response = await managerApi.getDocuments();
        const data = response.data?.data || response.data;
        if (Array.isArray(data)) {
          setDocuments(data.map(d => {
            const status = d.status === "Expired" ? "Non-Compliant" : "Compliant";
            let score = 95;
            if (d.status === "Expired") score = 40;
            else if (d.status === "Expiring Soon") score = 75;
            
            return {
              id: d._id,
              document: d.title,
              type: d.type,
              status,
              lastChecked: d.updatedAt || d.createdAt || new Date(),
              nextCheck: d.expiry || "-",
              score
            };
          }));
        }
      } catch (err) {
        toast.error("Failed to load audit documents");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filteredAuditData = documents.filter(item => {
    if (activeTab === "compliant") return item.status === "Compliant";
    if (activeTab === "non-compliant") return item.status === "Non-Compliant";
    return true;
  });

  const getStatusBadge = (status) => {
    return status === "Compliant"
      ? "bg-green-50 text-green-700 border border-green-100"
      : "bg-red-50 text-red-700 border border-red-100";
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Compliance Audit</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Check document compliance and audit status</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Total Documents</span>
            <div className="bg-gray-100 p-2 rounded-lg"><FileText className="w-5 h-5 text-gray-600" /></div>
          </div>
          <p className="text-3xl font-black text-[#1E293B]">{documents.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Compliant</span>
            <div className="bg-green-100 p-2 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
          </div>
          <p className="text-3xl font-black text-[#22C55E]">{documents.filter(i => i.status === "Compliant").length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Non-Compliant</span>
            <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          </div>
          <p className="text-3xl font-black text-[#EF4444]">{documents.filter(i => i.status === "Non-Compliant").length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Avg Score</span>
            <div className="bg-amber-100 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-amber-600" /></div>
          </div>
          <p className="text-3xl font-black text-[#B45A0A]">{documents.length > 0 ? Math.round(documents.reduce((a, b) => a + b.score, 0) / documents.length) : 100}%</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E7EAF0] pb-4">
        <button onClick={() => setActiveTab("all")} className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${activeTab === "all" ? "text-[#B45A0A] border-b-2 border-[#B45A0A] pb-5" : "text-gray-600 hover:text-[#1E293B]"}`}>
          All
        </button>
        <button onClick={() => setActiveTab("compliant")} className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${activeTab === "compliant" ? "text-[#B45A0A] border-b-2 border-[#B45A0A] pb-5" : "text-gray-600 hover:text-[#1E293B]"}`}>
          Compliant
        </button>
        <button onClick={() => setActiveTab("non-compliant")} className={`px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${activeTab === "non-compliant" ? "text-[#B45A0A] border-b-2 border-[#B45A0A] pb-5" : "text-gray-600 hover:text-[#1E293B]"}`}>
          Non-Compliant
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col w-full">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-4 px-6">Document</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Last Checked</th>
                <th className="py-4 px-6">Next Check</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#B45A0A] border-t-transparent rounded-full animate-spin" />
                      <span>Loading Audit Trail...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAuditData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                    No documents found in compliance audit trail.
                  </td>
                </tr>
              ) : (
                filteredAuditData.map(item => (
                  <tr key={item.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-bold text-[#1E293B] font-poppins text-sm">{item.document}</p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-[#64748B]">
                      {item.type}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-[#1E293B]">
                        <Calendar className="w-4 h-4 text-[#64748B]" />
                        {new Date(item.lastChecked).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-[#1E293B]">
                        <Clock className="w-4 h-4 text-[#64748B]" />
                        {item.nextCheck !== "-" ? new Date(item.nextCheck).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div style={{ width: `${item.score}%` }} className={`h-full ${item.score >= 80 ? "bg-green-500" : item.score >= 50 ? "bg-amber-500" : "bg-red-500"}`} />
                        </div>
                        <span className="text-sm font-bold text-[#1E293B]">{item.score}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(item.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === "Compliant" ? "bg-green-500" : "bg-red-500"}`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 bg-white border border-[#E7EAF0] rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F5F7FB] transition-colors flex items-center gap-1 cursor-pointer">
                          <Download className="w-3.5 h-3.5" />
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
