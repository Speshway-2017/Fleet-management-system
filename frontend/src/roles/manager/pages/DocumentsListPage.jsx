import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  ChevronDown,
  ArrowLeft,
  Eye,
  Download,
  Edit,
  Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";

// Mock data for documents
const MOCK_DOCUMENTS = [
  { id: 1, name: "Commercial Insurance - Truck #42", type: "Insurance", category: "Vehicle Docs", vehicle: "Volvo FM 12", expiry: "2025-10-24", status: "Expiring Soon", uploadedBy: "Alex Thompson", uploadDate: "2024-05-15", fileSize: "2.4 MB", fileType: "PDF" },
  { id: 2, name: "Commercial Driver License (CDL)", type: "License", category: "Driver Docs", driver: "Robert L. Henderson", expiry: "2026-03-12", status: "Active", uploadedBy: "Sarah Lee", uploadDate: "2024-01-20", fileSize: "1.1 MB", fileType: "PDF" },
  { id: 3, name: "Pollution Check (PUC)", type: "Compliance", category: "Vehicle Docs", vehicle: "Komila FM-30", expiry: "2024-08-15", status: "Expired", uploadedBy: "Mike Johnson", uploadDate: "2023-08-20", fileSize: "500 KB", fileType: "PDF" },
  { id: 4, name: "Trip Invoice - Mumbai to Delhi", type: "Invoice", category: "Trip Invoices", trip: "TRP-2024-185", amount: "₹45,200", status: "Active", uploadedBy: "Rajesh Kumar", uploadDate: "2024-07-01", fileSize: "850 KB", fileType: "XLSX" },
  { id: 5, name: "Road Tax Receipt 2024", type: "Tax", category: "Vehicle Docs", vehicle: "Ashok Leyland 3118", expiry: "2025-06-30", status: "Active", uploadedBy: "Alex Thompson", uploadDate: "2024-06-25", fileSize: "1.2 MB", fileType: "PDF" }
];

const STATUS_OPTIONS = ["All Statuses", "Active", "Expiring Soon", "Expired"];
const CATEGORY_OPTIONS = ["All Categories", "Vehicle Docs", "Driver Docs", "Trip Invoices", "Compliance"];

export default function DocumentsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

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
      default: return FileText;
    }
  };

  const handleView = (doc) => {
    navigate(`/manager/documents/view/${doc.id}`);
  };

  const handleEdit = (doc) => {
    navigate(`/manager/documents/edit/${doc.id}`);
  };

  const handleDelete = (doc) => {
    toast.success(`Deleted document: ${doc.name}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in w-full overflow-hidden">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">All Documents</h1>
            <p className="text-[18px] text-[#64748B] mt-[12px]">Manage all your fleet documents in one place</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
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
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-4 px-6">Document Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Owner</th>
                <th className="py-4 px-6">Expiry Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {filteredDocs.map((doc) => {
                const FileIcon = getFileIcon(doc.fileType);
                return (
                  <tr key={doc.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#FDF3EC] text-[#B45A0A] p-2.5 rounded-xl flex items-center justify-center shrink-0 border border-[#FDF3EC]/50">
                          <FileIcon className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1E293B] font-poppins text-sm">{doc.name}</p>
                          <p className="text-[10px] text-[#64748B]">{doc.fileType} • {doc.fileSize}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm text-[#1E293B]">{doc.category}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="text-sm text-[#1E293B]">{doc.vehicle || doc.driver || doc.trip}</p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-sm text-[#1E293B] font-semibold">
                      {doc.expiry && new Date(doc.expiry).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(doc.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${doc.status === "Active" ? "bg-green-500" : doc.status === "Expiring Soon" ? "bg-amber-500" : "bg-red-500"}`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleView(doc)} className="p-2 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(doc)} className="p-2 text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc)} className="p-2 text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
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
      </div>
    </div>
  );
}
