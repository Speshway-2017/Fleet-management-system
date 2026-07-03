import { FileText, Plus } from "lucide-react";

export default function EmptyDocumentsState({ onUploadClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-[#FDF3EC] p-6 rounded-2xl mb-4">
        <FileText className="w-16 h-16 text-[#B45A0A] opacity-50" />
      </div>
      
      <h3 className="text-xl font-bold text-[#1E293B] text-center mb-2">
        No Documents Uploaded Yet
      </h3>
      
      <p className="text-sm text-[#64748B] text-center mb-6 max-w-sm">
        Start by uploading important vehicle documents like insurance, registration certificate, PUC, and more.
      </p>
      
      <button
        onClick={onUploadClick}
        className="px-6 py-3 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Upload First Document</span>
      </button>
    </div>
  );
}
