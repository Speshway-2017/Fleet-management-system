import { useState, useEffect } from "react";
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
import { managerApi } from "../api/managerApi";

const STATUS_OPTIONS = ["All Statuses", "Active", "Expiring Soon", "Expired"];
const CATEGORY_OPTIONS = ["All Categories", "Vehicle Docs", "Driver Docs", "Trip Invoices", "Compliance"];

export default function DocumentsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const customerOptions = ["All Customers", ...new Set(documents.filter(d => d.customerName).map(d => d.customerName))];

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

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const nameStr = doc.name ? doc.name.toLowerCase() : "";
    const invoiceNoStr = doc.invoiceNo ? doc.invoiceNo.toLowerCase() : "";
    const vehicleStr = doc.vehicle ? doc.vehicle.toLowerCase() : "";
    const driverStr = doc.driver ? doc.driver.toLowerCase() : "";
    const customerStr = doc.customerName ? doc.customerName.toLowerCase() : "";
    const tripStr = doc.trip ? doc.trip.toLowerCase() : "";
    const query = search.toLowerCase();

    const matchesSearch = nameStr.includes(query) ||
                          invoiceNoStr.includes(query) ||
                          vehicleStr.includes(query) ||
                          driverStr.includes(query) ||
                          customerStr.includes(query) ||
                          tripStr.includes(query);
    const matchesStatus = statusFilter === "All Statuses" || doc.status === statusFilter;
    const matchesCategory = categoryFilter === "All Categories" || doc.category === categoryFilter;
    
    // Customer filter
    const matchesCustomer = customerFilter === "All Customers" || doc.customerName === customerFilter;

    // Generated Date filter
    let matchesDate = true;
    if (dateFilter) {
      const docDate = new Date(doc.createdAt).toISOString().split('T')[0];
      matchesDate = docDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesCustomer && matchesDate;
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

  const handleDownload = (doc) => {
    if (doc.fileUrl) {
      window.open(doc.fileUrl, '_blank');
      toast.success(`Downloading document: ${doc.name}`);
    } else {
      toast.error("File download URL not found");
    }
  };

  const handleEdit = (doc) => {
    navigate(`/manager/documents/edit/${doc.id}`);
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
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="relative">
              <select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                className="px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A] appearance-none pr-10"
              >
                {customerOptions.map(opt => <option key={opt}>{opt}</option>)}
              </select>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#64748B]">
                <ChevronDown className="w-4 h-4" />
              </span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3.5 py-2 h-[44px] bg-white border border-[#E7EAF0] rounded-xl text-sm text-[#1E293B] focus:outline-none focus:border-[#B45A0A]"
                placeholder="Filter by Date"
              />
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
                      {doc.expiry && doc.expiry !== "-" ? new Date(doc.expiry).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(doc.status)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${doc.status === "Active" ? "bg-green-500" : doc.status === "Expiring Soon" ? "bg-amber-500" : "bg-red-500"}`} />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right select-none whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {!doc.fileUrl && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mr-1 select-none">
                            PDF Not Available
                          </span>
                        )}
                        <button onClick={() => handleView(doc)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                          <Eye className="w-4 h-4" />
                        </button>
                        {doc.fileUrl && (
                          <button onClick={() => handleDownload(doc)} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleEdit(doc)} className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc)} className="p-2 text-[#EF4444] bg-red-50 hover:bg-red-100 rounded-xl active:scale-95 transition-all cursor-pointer">
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
      </div>
    </div>
  );
}
