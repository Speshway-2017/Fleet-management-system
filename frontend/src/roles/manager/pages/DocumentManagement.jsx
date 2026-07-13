import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  ChevronDown,
  Filter,
  Calendar,
  ShieldCheck,
  FileSpreadsheet,
  FileCheck,
  Truck,
  Users,
  ClipboardList,
  Clock,
  AlertTriangle,
  Edit
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";

const STATUS_OPTIONS = ["All Statuses", "Active", "Expiring Soon", "Expired"];
const CATEGORY_OPTIONS = ["All Categories", "Vehicle Docs", "Driver Docs", "Trip Invoices", "Compliance"];

export default function DocumentManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const complianceSectionRef = useRef(null);
  const [highlightCompliance, setHighlightCompliance] = useState(false);

  // Dynamic Category Stats Calculations
  const categories = [
    { name: "Vehicle Docs", icon: Truck, description: "Maintenance, Insurance & Permits" },
    { name: "Driver Docs", icon: Users, description: "Licenses & Driver Profile Checks" },
    { name: "Trip Invoices", icon: FileSpreadsheet, description: "Billing Records & Invoices" },
    { name: "Compliance", icon: ShieldCheck, description: "Pollution checks & Audits" }
  ].map(cat => {
    const categoryDocs = documents.filter(d => d.category === cat.name);
    const count = categoryDocs.length;
    
    let lastUpdated = "No files";
    if (count > 0) {
      const sorted = [...categoryDocs].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      const latestDate = new Date(sorted[0].updatedAt || sorted[0].createdAt || Date.now());
      const diffMin = Math.round((Date.now() - latestDate) / 60000);
      if (diffMin < 1) lastUpdated = "Just Now";
      else if (diffMin < 60) lastUpdated = `${diffMin} mins ago`;
      else {
        const diffHrs = Math.round(diffMin / 60);
        if (diffHrs < 24) lastUpdated = `${diffHrs} hours ago`;
        else lastUpdated = `${Math.round(diffHrs / 24)} days ago`;
      }
    }
    
    return {
      ...cat,
      count,
      lastUpdated
    };
  });

  // Dynamic compliance index calculations
  const activeDocsCount = documents.filter(d => d.status === "Active").length;
  const expiringDocsCount = documents.filter(d => d.status === "Expiring Soon").length;
  const expiredDocsCount = documents.filter(d => d.status === "Expired").length;
  const totalDocsCount = documents.length;
  const compliancePercentage = totalDocsCount > 0 ? Math.round((activeDocsCount / totalDocsCount) * 100) : 100;
  const strokeDashoffset = 251.2 - (251.2 * compliancePercentage) / 100;

  // Dynamic alert notifications from database
  const alertNotifications = documents
    .filter(d => d.status === "Expiring Soon" || d.status === "Expired")
    .map(d => {
      const isExpired = d.status === "Expired";
      return {
        id: d.id,
        text: isExpired 
          ? `Alert: ${d.name} has expired.` 
          : `Urgent: ${d.name} expires soon (Expiry: ${new Date(d.expiry).toLocaleDateString("en-IN")}).`,
        time: d.updatedAt ? "Updated recently" : "Added recently",
        icon: isExpired ? AlertTriangle : Clock,
        iconClass: isExpired ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"
      };
    });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await managerApi.getDocuments();
      const result = response.data?.data || response.data;
      if (Array.isArray(result)) {
        setDocuments(result.map(d => ({
          ...d,
          id: d._id,
          name: d.title
        })));
      } else {
        setDocuments([]);
      }
    } catch (error) {
      toast.error("Failed to load documents from database");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = location.state?.section || params.get("section");

    if (section === "compliance") {
      setCategoryFilter("Compliance");
      setHighlightCompliance(true);

      const scrollTimer = setTimeout(() => {
        if (complianceSectionRef.current) {
          complianceSectionRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);

      const highlightTimer = setTimeout(() => {
        setHighlightCompliance(false);
      }, 3000);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(highlightTimer);
      };
    }
  }, [location]);

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const nameStr = doc.name ? doc.name.toLowerCase() : "";
    const vehicleStr = doc.vehicle ? doc.vehicle.toLowerCase() : "";
    const driverStr = doc.driver ? doc.driver.toLowerCase() : "";
    const query = search.toLowerCase();

    const matchesSearch = nameStr.includes(query) ||
                          vehicleStr.includes(query) ||
                          driverStr.includes(query);
    const matchesStatus = statusFilter === "All Statuses" || doc.status === statusFilter;
    const matchesCategory = categoryFilter === "All Categories" || doc.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border border-green-100";
      case "Expiring Soon":
        return "bg-amber-50 text-amber-700 border border-amber-100";
      case "Expired":
        return "bg-red-50 text-red-700 border border-red-100";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-100";
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF": return FileText;
      case "XLSX": return FileSpreadsheet;
      default: return FileCheck;
    }
  };

  const handleView = (doc) => {
    navigate(`/manager/documents/view/${doc.id}`);
  };

  const handleEdit = (doc) => {
    navigate(`/manager/documents/edit/${doc.id}`);
  };

  const handleDownload = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
      toast.success(`Downloading document: ${doc.name}`);
    } else {
      toast.error("File download URL not found");
    }
  };

  const handleDelete = async (doc) => {
    try {
      await managerApi.deleteDocument(doc._id);
      toast.success(`Deleted document: ${doc.name}`);
      fetchDocuments();
    } catch (error) {
      toast.error("Failed to delete document");
      console.error(error);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">
            Document Management
          </h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Organize, monitor, and audit your fleet's critical filing systems.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/manager/documents/compliance-audit")} className="px-4 py-2.5 bg-white border border-[#B45A0A] rounded-xl text-sm font-semibold text-[#B45A0A] hover:bg-[#FDF3EC] transition-all flex items-center gap-2 shadow-sm cursor-pointer">
            <ShieldCheck className="w-4 h-4" />
            <span>Compliance Audit</span>
          </button>
          <button onClick={() => navigate("/manager/documents/upload")} className="px-5 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer">
            <Upload className="w-4.5 h-4.5" />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* Document Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category, idx) => {
          const Icon = category.icon;
          const isCompliance = category.name === "Compliance";
          return (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl border p-6 shadow-sm relative overflow-hidden group transition-all duration-500 ${
                isCompliance && highlightCompliance
                  ? "ring-4 ring-amber-500/80 scale-[1.02] shadow-2xl border-amber-300 bg-amber-50/10"
                  : "border-[#E7EAF0]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="bg-[#FDF3EC] text-[#B45A0A] p-3 rounded-xl">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#B45A0A] bg-[#FDF3EC] px-2 py-1 rounded-md">
                  {category.count} files
                </span>
              </div>
              <h3 className="font-poppins font-bold text-xl text-[#1E293B] mt-4">{category.name}</h3>
              <p className="text-sm text-[#64748B] mt-1">
                {category.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-[10px] text-[#64748B] border-t border-[#E7EAF0]/60 pt-3">
                <span className="font-semibold uppercase">Last Updated</span>
                <span className="font-bold text-[#1E293B]">{category.lastUpdated}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
              <Search className="w-4.5 h-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search documents by name, vehicle, or driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:border-[#B45A0A] focus:ring-1 focus:ring-[#B45A0A] transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none pr-10"
              >
                {STATUS_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none pr-10"
              >
                {CATEGORY_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden flex flex-col w-full">
        <div className="px-6 py-5 border-b border-[#E7EAF0] flex items-center justify-between shrink-0">
          <h3 className="font-poppins font-black text-lg text-[#1E293B]">Recent Documents</h3>
          <button onClick={() => navigate("/manager/documents/list")} className="text-xs text-[#B45A0A] hover:text-[#9A4D08] hover:underline font-bold font-poppins flex items-center gap-1 cursor-pointer">
            View All Documents
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6">Document Name</th>
                <th className="py-4 px-6">Owner / Identity</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredDocs.map((doc) => {
                const FileIcon = getFileIcon(doc.fileType);
                return (
                  <tr key={doc.id} className="hover:bg-[#F5F7FB]/50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FDF3EC] text-[#B45A0A] p-2.5 rounded-xl flex items-center justify-center shrink-0 border border-[#FDF3EC]/50">
                          <FileIcon className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] font-poppins text-sm leading-tight whitespace-nowrap">{doc.name}</p>
                          <span className="text-[10px] text-[#64748B] font-semibold mt-0.5 block">{doc.fileType} • {doc.fileSize}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="text-sm text-[#1E293B] font-medium">{doc.vehicle || doc.driver || doc.trip}</p>
                      <span className="text-[10px] text-[#64748B] block">{doc.uploadedBy}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-[#1E293B] font-semibold">
                      {doc.expiry && new Date(doc.expiry).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(doc.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          doc.status === "Active" ? "bg-green-500" :
                          doc.status === "Expiring Soon" ? "bg-amber-500" : "bg-red-500"
                        }`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleView(doc)}
                          title="View details"
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          title="Edit"
                          className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          title="Delete"
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#E7EAF0] flex items-center justify-between">
          <span className="text-xs text-[#64748B] font-medium font-poppins">
            Showing {filteredDocs.length} of {documents.length} documents
          </span>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
            <button className="p-2 text-gray-500 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Health Index & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          ref={complianceSectionRef}
          className={`lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm transition-all duration-500 ${
            highlightCompliance 
              ? "ring-4 ring-[#B45A0A]/80 scale-[1.02] shadow-2xl border-[#B45A0A]/40 bg-amber-50/10" 
              : "border-[#E7EAF0]"
          }`}
        >
          <h3 className="font-poppins font-black text-xl text-[#1E293B] mb-4">Compliance Health Index</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#E7EAF0" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#22C55E" strokeWidth="10" fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1E293B]">{compliancePercentage}%</span>
                <span className="text-xs text-[#64748B]">Compliant</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Valid Documents</span>
                <span className="font-bold text-[#1E293B]">{activeDocsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Expiring Soon</span>
                <span className="font-bold text-[#F59E0B]">{expiringDocsCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Expired</span>
                <span className="font-bold text-[#EF4444]">{expiredDocsCount}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E7EAF0]/60">
                <button 
                  onClick={() => navigate("/manager/documents/compliance-audit")}
                  className="px-4 py-2 bg-[#FDF3EC] text-[#B45A0A] text-sm font-bold rounded-xl hover:bg-[#F5E8D8] transition-colors cursor-pointer"
                >
                  View Compliance Report
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#0F0F10] rounded-2xl border border-[#1B1B1D] p-6 shadow-sm text-white">
          <h3 className="font-poppins font-black text-xl text-white mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            {alertNotifications.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium">No pending document alerts. All documents are active.</p>
            ) : (
              alertNotifications.slice(0, 3).map((notif, idx) => {
                const Icon = notif.icon;
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`${notif.iconClass} p-2 rounded-full shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white">{notif.text}</p>
                      <span className="text-[10px] text-[#94A3B8]">{notif.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
