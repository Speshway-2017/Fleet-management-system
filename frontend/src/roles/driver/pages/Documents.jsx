import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import { FileText, Download, CheckCircle2, RefreshCw } from "lucide-react";

const resolveDocumentUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  let backendBase = apiBase.replace("/api", "");
  
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    ) {
      backendBase = `http://${hostname}:5000`;
    }
  }
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function DriverDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      // 1. Fetch profile to get license details
      let licenseUrl = "";
      let licenseExpiryDate = "";
      try {
        const profileRes = await driverApi.getProfile();
        if (profileRes?.success && profileRes.data) {
          const profile = profileRes.data;
          licenseUrl = profile.licenseDocument || profile.documents?.license || "";
          licenseExpiryDate = profile.licenseExpiry || "";
        }
      } catch (err) {
        console.warn("Failed to fetch driver profile:", err);
      }

      // 2. Fetch assigned vehicle to get vehicle compliance documents (RC, Insurance, PUC)
      let rcUrl = "";
      let rcExpiryDate = "";
      let insUrl = "";
      let insExpiryDate = "";
      let pucUrl = "";
      let pucExpiryDate = "";
      let fitnessUrl = "";
      let fitnessExpiryDate = "";
      let permitUrl = "";
      let permitExpiryDate = "";
      let roadTaxUrl = "";
      let roadTaxExpiryDate = "";
      let registrationNumber = "";

      try {
        const vehicleRes = await driverApi.getAssignedVehicle();
        if (vehicleRes?.success && vehicleRes.data?.vehicle) {
          const vehicle = vehicleRes.data.vehicle;
          registrationNumber = vehicle.registrationNumber || vehicle.vehicleNumber || "";
          
          rcUrl = vehicle.documents?.rc?.fileUrl || vehicle.rcUrl || "";
          rcExpiryDate = vehicle.documents?.rc?.expiryDate || vehicle.rcExpiry || "";
          
          insUrl = vehicle.documents?.insurance?.fileUrl || vehicle.insuranceUrl || "";
          insExpiryDate = vehicle.documents?.insurance?.expiryDate || vehicle.insuranceExpiry || "";
          
          pucUrl = vehicle.documents?.puc?.fileUrl || vehicle.pucUrl || "";
          pucExpiryDate = vehicle.documents?.puc?.expiryDate || vehicle.pollutionExpiry || "";

          fitnessUrl = vehicle.documents?.fitness?.fileUrl || vehicle.fitnessUrl || "";
          fitnessExpiryDate = vehicle.documents?.fitness?.expiryDate || vehicle.fitnessExpiry || "";

          permitUrl = vehicle.documents?.permit?.fileUrl || vehicle.permitUrl || "";
          permitExpiryDate = vehicle.documents?.permit?.expiryDate || vehicle.permitExpiry || "";

          roadTaxUrl = vehicle.documents?.roadTax?.fileUrl || vehicle.roadTaxUrl || "";
          roadTaxExpiryDate = vehicle.documents?.roadTax?.expiryDate || vehicle.roadTaxExpiry || "";
        }
      } catch (err) {
        console.warn("Failed to fetch assigned vehicle:", err);
      }

      const getStatus = (exp) => {
        if (!exp) return "Valid";
        const days = Math.ceil((new Date(exp) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return "Expired";
        if (days <= 30) return "Expiring Soon";
        return "Valid";
      };

      // 3. Build the compliance documents list dynamically
      const complianceDocs = [
        {
          type: "Driving License",
          title: "Driving License Certificate",
          fileUrl: licenseUrl,
          expiryDate: licenseExpiryDate,
          status: getStatus(licenseExpiryDate)
        },
        {
          type: "Vehicle RC",
          title: `Registration Certificate (RC) ${registrationNumber ? `- ${registrationNumber}` : ""}`,
          fileUrl: rcUrl,
          expiryDate: rcExpiryDate,
          status: getStatus(rcExpiryDate)
        },
        {
          type: "Insurance",
          title: "Vehicle Commercial Insurance",
          fileUrl: insUrl,
          expiryDate: insExpiryDate,
          status: getStatus(insExpiryDate)
        },
        {
          type: "PUC Certificate",
          title: "Pollution Under Control (PUC)",
          fileUrl: pucUrl,
          expiryDate: pucExpiryDate,
          status: getStatus(pucExpiryDate)
        },
        {
          type: "Fitness Certificate",
          title: "Vehicle Fitness Certificate",
          fileUrl: fitnessUrl,
          expiryDate: fitnessExpiryDate,
          status: getStatus(fitnessExpiryDate)
        },
        {
          type: "National Permit",
          title: "National Goods Permit",
          fileUrl: permitUrl,
          expiryDate: permitExpiryDate,
          status: getStatus(permitExpiryDate)
        },
        {
          type: "Road Tax",
          title: "Road Tax Receipt",
          fileUrl: roadTaxUrl,
          expiryDate: roadTaxExpiryDate,
          status: getStatus(roadTaxExpiryDate)
        }
      ];

      setDocuments(complianceDocs);
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
            <FileText className="w-6 h-6 text-[#A14000]" />
            Compliance Documents & Certificates
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            View and download your License, RC, Insurance, and PUC certificates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#A14000] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#A14000]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold font-poppins text-slate-900 text-base">{doc.title || doc.type}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{doc.type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 font-poppins ${
                    doc.status === "Expired"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : doc.status === "Expiring Soon"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> {doc.status}
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
                  <button
                    onClick={() => {
                      const resolvedUrl = resolveDocumentUrl(doc.fileUrl);
                      console.log("[Driver View/Download Document] Type:", doc.type, "Title:", doc.title, "Raw URL:", doc.fileUrl, "Resolved URL:", resolvedUrl);
                      window.open(resolvedUrl, "_blank");
                    }}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-[#A14000] border border-slate-200 font-semibold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> View / Download Document
                  </button>
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
