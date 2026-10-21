import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteDocumentModal({
  isOpen,
  document,
  onConfirm,
  onCancel,
  isDeleting
}) {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 border border-[#E7EAF0]">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 text-red-600 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1E293B]">Delete Document?</h3>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6">
          <p className="text-sm text-red-800">
            Are you sure you want to delete <strong>{document.name}</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
