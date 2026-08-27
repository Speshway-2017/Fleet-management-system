import { X, Download } from "lucide-react";

export default function DocumentPreviewModal({
  isOpen,
  document,
  onClose
}) {
  if (!isOpen || !document) return null;

  const fileUrl = document.fileData || document.fileUrl || document.url || "";
  const name = document.name || document.title || "Document";
  const category = document.category || document.type || "Other";
  const fileName = document.fileName || name;

  const detectFileType = (url, filename = "", defaultMime = "application/pdf") => {
    if (defaultMime && typeof defaultMime === "string") {
      const mimeLower = defaultMime.toLowerCase();
      if (mimeLower.startsWith("image/") || mimeLower === "application/pdf") {
        return mimeLower;
      }
    }
    const checkStr = `${String(url).toLowerCase()} ${String(filename).toLowerCase()}`;
    if (checkStr.includes(".pdf")) {
      return "application/pdf";
    }
    if (
      checkStr.includes(".png") ||
      checkStr.includes(".jpg") ||
      checkStr.includes(".jpeg") ||
      checkStr.includes(".webp") ||
      checkStr.includes("/image/upload/")
    ) {
      return "image/png";
    }
    if (checkStr.includes("/raw/upload/")) {
      if (checkStr.includes("rc") || checkStr.includes("insurance") || checkStr.includes("puc") || checkStr.includes("fitness") || checkStr.includes("permit") || checkStr.includes("tax")) {
        return "image/png";
      }
      return "application/pdf";
    }
    return defaultMime;
  };

  const fileMime = detectFileType(fileUrl, fileName, document.fileType);
  const isPdf = fileMime === "application/pdf";
  const isImage = fileMime?.startsWith("image/");
  const canPreview = isPdf || isImage;

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.warn("Direct download failed, falling back to window.open", error);
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E7EAF0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7EAF0] bg-[#F5F7FB]">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#1E293B] truncate">{name}</h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-[#64748B]">
              <span>{category}</span>
              {document.uploadDate && (
                <>
                  <span>•</span>
                  <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString("en-IN")}</span>
                </>
              )}
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
        <div className="relative w-full max-h-[500px] bg-white overflow-auto font-nunito">
          {canPreview ? (
            <>
              {isPdf ? (
                <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                </div>
              ) : isImage ? (
                <div className="w-full flex items-center justify-center bg-gray-50 p-4">
                  <img
                    src={fileUrl}
                    alt={name}
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
                className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#E7EAF0] bg-[#F5F7FB] font-nunito">
          <div className="text-xs text-[#64748B]">
            {document.fileSize && (
              <>
                <span className="font-semibold text-[#1E293B]">{document.fileSize}</span> KB
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#A14000] hover:bg-[#853400] rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 cursor-pointer"
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
