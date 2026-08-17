import { Search, ChevronDown } from "lucide-react";

const DOCUMENT_CATEGORIES = [
  "Registration Certificate (RC)",
  "Insurance",
  "Pollution Certificate (PUC)",
  "Fitness Certificate",
  "Permit",
  "Road Tax Receipt",
  "FASTag Document",
  "Vehicle Invoice",
  "Service Record",
  "Other"
];

const DOCUMENT_STATUS = ["Valid", "Expiring Soon", "Expired", "Pending Verification"];

const SORT_OPTIONS = [
  { value: "uploadDate", label: "Upload Date (Newest)" },
  { value: "expiryDate", label: "Expiry Date" },
  { value: "name", label: "Document Name" }
];

export default function DocumentFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E7EAF0] p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B] appearance-none"
          >
            <option value="">All Categories</option>
            {DOCUMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B] appearance-none"
          >
            <option value="">All Status</option>
            {DOCUMENT_STATUS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#A14000] bg-white text-[#1E293B] appearance-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

export { DOCUMENT_CATEGORIES, DOCUMENT_STATUS };
