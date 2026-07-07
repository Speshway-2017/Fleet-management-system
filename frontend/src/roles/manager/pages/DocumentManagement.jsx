import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Mock data for documents
const MOCK_DOCUMENTS = [
  {
    id: 1,
    name: "Commercial Insurance - Truck #42",
    type: "Insurance",
    category: "Vehicle Docs",
    vehicle: "Volu FM-30",
    expiry: "2025-10-24",
    status: "Expiring Soon",
    uploadedBy: "Alex Thompson",
    uploadDate: "2024-05-15",
    fileSize: "2.4 MB",
    fileType: "PDF"
  },
  {
    id: 2,
    name: "Commercial Driver License (CDL)",
    type: "License",
    category: "Driver Docs",
    driver: "Robert L. Henderson",
    expiry: "2026-03-12",
    status: "Active",
    uploadedBy: "Sarah Lee",
    uploadDate: "2024-01-20",
    fileSize: "1.1 MB",
    fileType: "PDF"
  },
  {
    id: 3,
    name: "Pollution Check (PUC)",
    type: "Compliance",
    category: "Vehicle Docs",
    vehicle: "Komila FM-30",
    expiry: "2024-08-15",
    status: "Expired",
    uploadedBy: "Mike Johnson",
    uploadDate: "2023-08-20",
    fileSize: "500 KB",
    fileType: "PDF"
  },
  {
    id: 4,
    name: "Trip Invoice - Mumbai to Delhi",
    type: "Invoice",
    category: "Trip Invoices",
    trip: "TRP-2024-185",
    amount: "₹45,200",
    status: "Active",
    uploadedBy: "Rajesh Kumar",
    uploadDate: "2024-07-01",
    fileSize: "850 KB",
    fileType: "XLSX"
  },
  {
    id: 5,
    name: "Road Tax Receipt 2024",
    type: "Tax",
    category: "Vehicle Docs",
    vehicle: "Ashok Leyland 3118",
    expiry: "2025-06-30",
    status: "Active",
    uploadedBy: "Alex Thompson",
    uploadDate: "2024-06-25",
    fileSize: "1.2 MB",
    fileType: "PDF"
  }
];

const DOC_CATEGORIES = [
  { name: "Vehicle Docs", icon: Truck, count: 124, lastUpdated: "2 hours ago" },
  { name: "Driver Docs", icon: Users, count: 86, lastUpdated: "Yesterday" },
  { name: "Trip Invoices", icon: FileSpreadsheet, count: 412, lastUpdated: "Just Now" },
  { name: "Compliance", icon: ShieldCheck, count: 28, lastUpdated: "3 days ago" }
];

const STATUS_OPTIONS = ["All Statuses", "Active", "Expiring Soon", "Expired"];
const CATEGORY_OPTIONS = ["All Categories", "Vehicle Docs", "Driver Docs", "Trip Invoices", "Compliance"];

export default function DocumentManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Filter documents
  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.vehicle?.toLowerCase().includes(search.toLowerCase())) ||
                          (doc.driver?.toLowerCase().includes(search.toLowerCase()));
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
    toast.success(`Downloading document: ${doc.name}`);
  };

  const handleDelete = (doc) => {
    toast.success(`Deleted document: ${doc.name}`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-black text-3xl text-[#1E293B] tracking-tight">
            Document Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1 font-medium">
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
        {DOC_CATEGORIES.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover-card-trigger relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
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
                Maintenance, Insurance & Permits
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
                <th className="py-4 px-6">Actions</th>
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
                    <td className="py-4 px-6 select-none whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleView(doc)}
                          title="View details"
                          className="p-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(doc)}
                          title="Edit"
                          className="p-2 text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          title="Download"
                          className="p-2 text-gray-600 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          title="Delete"
                          className="p-2 text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
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
            Showing {filteredDocs.length} of {MOCK_DOCUMENTS.length} documents
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm">
          <h3 className="font-poppins font-black text-xl text-[#1E293B] mb-4">Compliance Health Index</h3>
          <div className="flex items-center gap-8">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" stroke="#E7EAF0" strokeWidth="10" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#22C55E" strokeWidth="10" fill="none"
                        strokeDasharray="251.2"
                        strokeDashoffset="50"
                        strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1E293B]">80%</span>
                <span className="text-xs text-[#64748B]">Compliant</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Valid Documents</span>
                <span className="font-bold text-[#1E293B]">542</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Expiring Soon</span>
                <span className="font-bold text-[#F59E0B]">28</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">Expired</span>
                <span className="font-bold text-[#EF4444]">5</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#E7EAF0]/60">
                <button className="px-4 py-2 bg-[#FDF3EC] text-[#B45A0A] text-sm font-bold rounded-xl hover:bg-[#F5E8D8] transition-colors cursor-pointer">
                  View Compliance Report
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#0F0F10] rounded-2xl border border-[#1B1B1D] p-6 shadow-sm text-white">
          <h3 className="font-poppins font-black text-xl text-white mb-4">Recent Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-500/20 text-amber-400 p-2 rounded-full shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Urgent: Asset #42 insurance expires in 72h.</p>
                <span className="text-xs text-[#94A3B8]">1 hour ago</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-500/20 text-green-400 p-2 rounded-full shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Robert L. Henderson license renewed successfully.</p>
                <span className="text-xs text-[#94A3B8]">Yesterday</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-red-500/20 text-red-400 p-2 rounded-full shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Pollution check for Komila FM-30 has expired.</p>
                <span className="text-xs text-[#94A3B8]">2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
