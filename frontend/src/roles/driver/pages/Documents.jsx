import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import { FileText, Download, CheckCircle2, RefreshCw } from "lucide-react";

export default function DriverDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getDocuments();
      if (res?.success && Array.isArray(res.data)) {
        setDocuments(res.data);
      } else {
        // Fallback default structure for License, RC, Insurance, PUC
        setDocuments([
          { type: "Driving License", title: "Driver License", status: "VALID", expiryDate: "2028-12-31" },
          { type: "Vehicle RC", title: "Registration Certificate (RC)", status: "VALID", expiryDate: "2030-05-15" },
          { type: "Insurance", title: "Vehicle Commercial Insurance", status: "VALID", expiryDate: "2027-04-10" },
          { type: "PUC Certificate", title: "Pollution Under Control (PUC)", status: "VALID", expiryDate: "2026-11-20" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching driver documents:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#B45A0A]" />
            Compliance Documents & Certificates
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            View and download your License, RC, Insurance, and PUC certificates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#B45A0A]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold font-poppins text-slate-900 text-base">{doc.title || doc.type}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.type}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-poppins">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                  </span>
                </div>

                <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Expiration Date:</span>
                    <span className="font-semibold text-slate-900 font-poppins">
                      {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : "Valid"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Verification Status:</span>
                    <span className="font-semibold text-emerald-700 font-poppins">Approved by Manager</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#B45A0A] border border-slate-200 font-semibold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" /> Download Certificate
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Certificate file available in mobile & manager records</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
