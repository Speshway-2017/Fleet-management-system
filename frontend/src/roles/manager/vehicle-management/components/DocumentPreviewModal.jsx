import { X, Download } from "lucide-react";
import { downloadVehicleDocument } from "../services/documentService";

export default function DocumentPreviewModal({
  isOpen,
  document,
  onClose
}) {
  if (!isOpen || !document) return null;

  const isPdf = document.fileType === "application/pdf";
  const isImage = document.fileType?.startsWith("image/");
  const canPreview = isPdf || isImage;

  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = document.fileData;
      link.download = document.fileName;
      link.click();
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E7EAF0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7EAF0] bg-[#F5F7FB]">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#1E293B] truncate">{document.name}</h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B]">
              <span>{document.category}</span>
              <span>•</span>
              <span>{new Date(document.uploadDate).toLocaleDateString("en-IN")}</span>
              {document.expiryDate && (
                <>
                  <span>•</span>
                  <span>Expires: {new Date(document.expiryDate).toLocaleDateString("en-IN")}</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#E7EAF0] rounded-lg transition-colors cursor-pointer ml-4"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Content */}
        <div className="relative w-full max-h-[500px] bg-white overflow-auto">
          {canPreview ? (
            <>
              {isPdf ? (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <iframe
                    src={document.fileData}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              ) : isImage ? (
                <div className="w-full flex items-center justify-center bg-gray-50 p-4">
                  <img
                    src={document.fileData}
                    alt={document.name}
                    className="max-w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div className="w-full h-96 flex flex-col items-center justify-center">
              <p className="text-[#64748B] mb-4">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#E7EAF0] bg-[#F5F7FB]">
          <div className="text-xs text-[#64748B]">
            <span className="font-semibold text-[#1E293B]">{document.fileSize}</span> KB
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#E7EAF0] rounded-lg text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
