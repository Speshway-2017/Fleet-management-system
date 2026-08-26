import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  getVehicleDocuments,
  uploadVehicleDocument,
  replaceVehicleDocument,
  deleteVehicleDocument,
  getDocumentStatus
} from "../services/documentService";
import DocumentCard from "./DocumentCard";
import UploadDocumentModal from "./UploadDocumentModal";
import DocumentPreviewModal from "./DocumentPreviewModal";
import DeleteDocumentModal from "./DeleteDocumentModal";
import DocumentFilters from "./DocumentFilters";
import EmptyDocumentsState from "./EmptyDocumentsState";

export default function VehicleDocuments({ vehicleId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("uploadDate");

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [vehicleId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await getVehicleDocuments(vehicleId);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || doc.category === selectedCategory;
      const docStatus = doc.status || getDocumentStatus(doc.expiryDate);
      const matchesStatus = !selectedStatus || docStatus === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "uploadDate":
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case "expiryDate":
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleUploadClick = () => {
    setIsReplacing(false);
    setSelectedDocument(null);
    setUploadModalOpen(true);
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setPreviewModalOpen(true);
  };

  const handleDownloadDocument = async (doc) => {
    if (!doc?.fileData) return;
    try {
      const response = await fetch(doc.fileData);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = doc.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Document downloaded successfully");
    } catch (error) {
      console.warn("Direct download failed, falling back to window.open", error);
      window.open(doc.fileData, "_blank");
    }
  };

  const handleReplaceDocument = (doc) => {
    setSelectedDocument(doc);
    setIsReplacing(true);
    setUploadModalOpen(true);
  };

  const handleDeleteClick = (doc) => {
    setSelectedDocument(doc);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteVehicleDocument(vehicleId, selectedDocument.id);
      
      setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id));
      setDeleteModalOpen(false);
      setSelectedDocument(null);
      
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadDocument = async (formData, replacing = false, replacingDocId = null) => {
    try {
      setIsUploading(true);
      
      let result;
      if (replacing && replacingDocId) {
        result = await replaceVehicleDocument(vehicleId, replacingDocId, formData);
        setDocuments(prev =>
          prev.map(d => d.id === replacingDocId ? result : d)
        );
        toast.success("Document replaced successfully");
      } else {
        result = await uploadVehicleDocument(vehicleId, formData);
        setDocuments(prev => [...prev, result]);
        toast.success("Document uploaded successfully");
      }

      setUploadModalOpen(false);
      setIsReplacing(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(replacing ? "Failed to replace document" : "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };



  return (
    <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
            Vehicle Documents
          </h2>
          <p className="text-xs text-[#64748B] mt-1">
            View, upload, replace, and manage all vehicle-related documents.
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="px-4 py-2.5 bg-[#A14000] hover:bg-[#853400] rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-md shadow-[#A14000]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Empty State */}
      {documents.length === 0 ? (
        <EmptyDocumentsState onUploadClick={handleUploadClick} />
      ) : (
        <>
          {/* Filters */}
          <DocumentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Results Count */}
          <div className="mb-4 text-xs text-[#64748B] font-medium">
            Showing <span className="font-bold text-[#1E293B]">{filteredDocuments.length}</span> of{" "}
            <span className="font-bold text-[#1E293B]">{documents.length}</span> documents
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#64748B]">No documents match your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(doc => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                  onReplace={handleReplaceDocument}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <UploadDocumentModal
        isOpen={uploadModalOpen}
        isReplacing={isReplacing}
        onClose={() => {
          setUploadModalOpen(false);
          setIsReplacing(false);
          setSelectedDocument(null);
        }}
        onUpload={handleUploadDocument}
        isUploading={isUploading}
        existingDocument={isReplacing ? selectedDocument : null}
      />

      <DocumentPreviewModal
        isOpen={previewModalOpen}
        document={selectedDocument}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedDocument(null);
        }}
      />

      <DeleteDocumentModal
        isOpen={deleteModalOpen}
        document={selectedDocument}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedDocument(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
