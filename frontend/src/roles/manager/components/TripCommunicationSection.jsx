import { useState } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  User,
  Truck,
  Hash,
  Send
} from "lucide-react";
import toast from "react-hot-toast";
import { formatEmployeeId } from "@/utils/employeeIdFormatter";

export default function TripCommunicationSection({ trip }) {
  const [copied, setCopied] = useState(false);

  const driverName = trip?.driverName || trip?.driver?.name || trip?.driver?.fullName || "Assigned Driver";
  const driverPhone = trip?.driverPhone || trip?.driver?.phone || trip?.driver?.phoneNumber || "+91 98765 43210";
  const driverEmail = trip?.driverEmail || trip?.driver?.email || "driver@fleetmanagement.com";
  const driverEmpId = formatEmployeeId(trip?.driver?.employeeId || trip?.driver?.driverId);
  const vehicleNumber = trip?.vehiclePlate || trip?.vehicle?.registrationNumber || trip?.vehicleName || "N/A";
  const tripNumber = trip?.tripNumber || trip?._id || "TRP-846708";

  const cleanPhone = (driverPhone || "").replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(driverPhone);
    setCopied(true);
    toast.success("Driver phone number copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = (customText = "") => {
    const textParam = customText ? `?text=${encodeURIComponent(customText)}` : "";
    window.open(`https://wa.me/${formattedPhone}${textParam}`, "_blank");
  };

  const openPhoneCall = () => {
    window.open(`tel:${driverPhone}`, "_self");
  };

  const openSMS = () => {
    window.open(`sms:${driverPhone}`, "_self");
  };

  const openEmail = () => {
    window.open(`mailto:${driverEmail}`, "_blank");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Driver Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E7EAF0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#C65D0E] to-amber-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
            {driverName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-poppins font-bold text-lg text-slate-800">{driverName}</h3>
              <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase rounded-full">
                Active Driver
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                ID: {driverEmpId}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {driverPhone}
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Vehicle: {vehicleNumber}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Trip: {tripNumber}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCopyPhone}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold font-poppins"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied" : "Copy Phone"}</span>
        </button>
      </div>

      {/* Main External Communication Workspace */}
      <div className="bg-white rounded-2xl border border-[#E7EAF0] shadow-sm overflow-hidden">
        
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h3 className="font-poppins font-bold text-base text-white">External Communication Hub</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Direct App Launcher</span>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Connect directly with <strong>{driverName}</strong> via external messaging and voice applications. Select an app below to launch immediately on your desktop or device:
          </p>

          {/* 4 External Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. WhatsApp Launcher */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Recommended</span>
                </div>
                <h4 className="font-poppins font-bold text-base text-slate-800">WhatsApp Web & App</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Send instant chat, share document attachments, route locations, and place voice notes directly to {driverName}.
                </p>
              </div>

              <button
                onClick={() => openWhatsApp(`Hello ${driverName}, regarding trip ${tripNumber}...`)}
                className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs font-poppins flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Launch WhatsApp</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Direct Phone Call */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Voice Call</span>
                </div>
                <h4 className="font-poppins font-bold text-base text-slate-800">Phone Call / Dialer</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Initiate a direct phone call via system default telephony dialer to reach {driverName} at {driverPhone}.
                </p>
              </div>

              <button
                onClick={openPhoneCall}
                className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-xs font-poppins flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Call Driver ({driverPhone})</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Cellular SMS */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Cellular SMS</span>
                </div>
                <h4 className="font-poppins font-bold text-base text-slate-800">SMS Text Message</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Open default device SMS messenger to send SMS texts even if the driver is offline from mobile data.
                </p>
              </div>

              <button
                onClick={openSMS}
                className="mt-5 w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-xs font-poppins flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Send SMS Message</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* 4. Official Email */}
            <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 bg-slate-200 text-slate-800 text-[10px] font-bold rounded-full uppercase tracking-wider">Email</span>
                </div>
                <h4 className="font-poppins font-bold text-base text-slate-800">Email Communication</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Send official emails and trip documentation copies directly to {driverEmail}.
                </p>
              </div>

              <button
                onClick={openEmail}
                className="mt-5 w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-xl font-bold text-xs font-poppins flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>Send Email ({driverEmail})</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick WhatsApp Text Templates */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <h4 className="font-poppins font-bold text-xs text-slate-700 uppercase tracking-wider">Quick WhatsApp Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => openWhatsApp(`Hi ${driverName}, please confirm your current ETA and route compliance for trip ${tripNumber}.`)}
                className="text-left p-3 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                ⚡ "Please confirm current ETA and route status."
              </button>
              <button
                onClick={() => openWhatsApp(`Hi ${driverName}, please remember to upload the weighbridge and POD receipts upon arrival.`)}
                className="text-left p-3 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                📑 "Please upload weighbridge and POD receipts."
              </button>
              <button
                onClick={() => openWhatsApp(`Hi ${driverName}, please check fuel levels and log any toll receipts in the driver app.`)}
                className="text-left p-3 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                ⛽ "Please check fuel levels and log receipts."
              </button>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>All external app triggers launch native installed applications (WhatsApp, Phone, SMS, Email) with pre-filled recipient information.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
