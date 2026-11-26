import { Eye, Download, Edit2, Trash2, File, FileText, Image } from "lucide-react";
import { getDocumentStatus, getStatusBadgeClass } from "../services/documentService";

export default function DocumentCard({
  document,
  onView,
  onDownload,
  onReplace,
  onDelete
}) {
  const status = document.status || getDocumentStatus(document.expiryDate);
  const statusBadgeClass = getStatusBadgeClass(status);

  // Get file type icon
  const getFileIcon = () => {
    if (document.fileType?.startsWith("image/")) {
      return <Image className="w-5 h-5" />;
    }
    if (document.fileType === "application/pdf") {
      return <FileText className="w-5 h-5" />;
    }
    return <File className="w-5 h-5" />;
  };

  return (
    <div className="bg-white rounded-xl border border-[#E7EAF0] p-6 hover:shadow-md transition-shadow">
      {/* Header with Icon and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-[#FDF3EC] p-3 rounded-lg flex-shrink-0">
            {getFileIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-[#1E293B] truncate">{document.name}</h3>
            <p className="text-xs text-[#64748B] mt-1">{document.category}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${statusBadgeClass}`}>
          {status}
        </span>
      </div>

      {/* Document Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <p className="text-[#64748B] font-medium">Upload Date</p>
          <p className="text-[#1E293B] font-semibold mt-1">
            {new Date(document.uploadDate).toLocaleDateString("en-IN")}
          </p>
        </div>
        <div>
          <p className="text-[#64748B] font-medium">File Size</p>
          <p className="text-[#1E293B] font-semibold mt-1">{document.fileSize} KB</p>
        </div>
        {document.expiryDate && (
          <>
            <div>
              <p className="text-[#64748B] font-medium">Expiry Date</p>
              <p className="text-[#1E293B] font-semibold mt-1">
                {new Date(document.expiryDate).toLocaleDateString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[#64748B] font-medium">Uploaded By</p>
              <p className="text-[#1E293B] font-semibold mt-1">{document.uploadedBy}</p>
            </div>
          </>
        )}
        {document.documentNumber && (
          <div>
            <p className="text-[#64748B] font-medium">Document Number</p>
            <p className="text-[#1E293B] font-semibold mt-1">{document.documentNumber}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      {document.notes && (
        <div className="mb-4 p-3 bg-[#F5F7FB] rounded-lg border border-[#E7EAF0]">
          <p className="text-[10px] text-[#64748B] font-medium uppercase mb-1">Notes</p>
          <p className="text-xs text-[#1E293B] line-clamp-2">{document.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E7EAF0]">
        <div className="flex gap-1">
          <button
            onClick={() => onView(document)}
            title="View Document"
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={() => onDownload(document)}
            title="Download Document"
            className="p-2 hover:bg-green-100 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={() => onReplace(document)}
            title="Replace Document"
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-[#A14000]" />
          </button>
          <button
            onClick={() => onDelete(document)}
            title="Delete Document"
            className="p-2 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
        <div className="text-[10px] text-[#94A3B8] font-semibold">
          {document.fileName}
        </div>
      </div>
    </div>
  );
}
