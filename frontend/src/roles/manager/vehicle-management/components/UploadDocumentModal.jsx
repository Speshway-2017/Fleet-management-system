import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { DOCUMENT_CATEGORIES } from "./DocumentFilters";

export default function UploadDocumentModal({
  isOpen,
  isReplacing,
  onClose,
  onUpload,
  isUploading,
  existingDocument
}) {
  const [formData, setFormData] = useState({
    category: existingDocument?.category || "",
    documentName: existingDocument?.name || "",
    documentNumber: existingDocument?.documentNumber || "",
    issueDate: existingDocument?.issueDate || "",
    expiryDate: existingDocument?.expiryDate || "",
    notes: existingDocument?.notes || ""
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        file: "Only PDF, JPG, PNG files are allowed"
      }));
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        file: "File size must not exceed 10MB"
      }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({
      ...prev,
      file: ""
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category.trim()) {
      newErrors.category = "Document category is required";
    }
    if (!formData.documentName.trim()) {
      newErrors.documentName = "Document name is required";
    }
    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required";
    }
    if (formData.expiryDate && formData.issueDate) {
      if (new Date(formData.expiryDate) < new Date(formData.issueDate)) {
        newErrors.expiryDate = "Expiry date cannot be before issue date";
      }
    }
    if (!selectedFile && !isReplacing) {
      newErrors.file = "Please select a file to upload";
    }
    if (isReplacing && !selectedFile) {
      newErrors.file = "Please select a new file to replace";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Read file and create object with data
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileObj = {
        name: selectedFile.name,
        size: (selectedFile.size / 1024).toFixed(2),
        type: selectedFile.type,
        data: event.target.result
      };

      const formDataToSubmit = new FormData();
      formDataToSubmit.append("category", formData.category);
      formDataToSubmit.append("documentName", formData.documentName);
      formDataToSubmit.append("documentNumber", formData.documentNumber);
      formDataToSubmit.append("issueDate", formData.issueDate);
      formDataToSubmit.append("expiryDate", formData.expiryDate);
      formDataToSubmit.append("notes", formData.notes);
      formDataToSubmit.append("file", fileObj);

      await onUpload(formDataToSubmit, isReplacing, existingDocument?.id);

      // Reset form
      setFormData({
        category: "",
        documentName: "",
        documentNumber: "",
        issueDate: "",
        expiryDate: "",
        notes: ""
      });
      setSelectedFile(null);
      setErrors({});
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7EAF0] my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E7EAF0] bg-[#F5F7FB]">
          <h3 className="text-xl font-bold text-[#1E293B]">
            {isReplacing ? "Replace Document" : "Upload New Document"}
          </h3>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-2 hover:bg-[#E7EAF0] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            type="button"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Document Category */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Document Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isReplacing}
              className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B] disabled:bg-gray-100"
            >
              <option value="">Select a category...</option>
              {DOCUMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.category}
              </div>
            )}
          </div>

          {/* Document Name */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Document Name *
            </label>
            <input
              type="text"
              name="documentName"
              value={formData.documentName}
              onChange={handleInputChange}
              placeholder="e.g., Car Insurance Policy 2024"
              className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
            />
            {errors.documentName && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.documentName}
              </div>
            )}
          </div>

          {/* Document Number */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Document Number (Optional)
            </label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleInputChange}
              placeholder="e.g., POL-2024-001234"
              className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
            />
          </div>

          {/* Issue Date and Expiry Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
              {errors.issueDate && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.issueDate}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
              {errors.expiryDate && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.expiryDate}
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              {isReplacing ? "New File *" : "Upload File *"}
            </label>
            <label className="block border-2 border-dashed border-[#B45A0A] rounded-xl p-6 cursor-pointer hover:bg-[#FDF3EC] transition-colors group bg-white">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center text-center gap-3">
                <div className="bg-[#FDF3EC] p-3 rounded-lg group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-[#B45A0A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E293B]">
                    {selectedFile ? selectedFile.name : "Choose file or drag and drop"}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">PDF, JPG, PNG • Max 10MB</p>
                </div>
              </div>
            </label>
            {errors.file && (
              <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                {errors.file}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any additional notes about this document..."
              rows="3"
              className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-sm focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B] resize-none"
            />
          </div>
        </form>

        {/* Footer - Always Visible */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E7EAF0] bg-[#F5F7FB] sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2.5 border border-[#E7EAF0] rounded-xl text-sm font-semibold text-[#64748B] hover:text-[#1E293B] hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#B45A0A]/20 cursor-pointer disabled:opacity-50 disabled:hover:bg-[#B45A0A]"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isReplacing ? "Replacing..." : "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {isReplacing ? "Replace Document" : "Upload Document"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
