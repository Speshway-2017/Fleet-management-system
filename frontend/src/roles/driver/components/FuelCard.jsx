import { Fuel, Calendar, FileText, CheckCircle2, Clock, XCircle, MapPin } from "lucide-react";

export default function FuelCard({ record }) {
  if (!record) return null;

  const approvalState = (
    record.approvalStatus ||
    record.billStatus ||
    (record.status === 'resolved' ? 'APPROVED' : record.status) ||
    'Pending'
  ).toString().toUpperCase();

  const getStatusBadge = (stateStr) => {
    switch (stateStr) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-poppins shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-poppins shadow-xs">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-poppins shadow-xs">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
          </span>
        );
    }
  };

  const stationName = record.fuelStation || record.stationName || record.station || "General Fuel Station";
  const vehicleName = record.vehicleId || record.vehicleRegistration || record.vehicleName || (record.vehicle && (record.vehicle.registrationNumber || record.vehicle.plateNumber || record.vehicle.vehicleNumber)) || "Assigned Vehicle";
  const litersVal = record.liters || record.quantity || 0;
  const amountVal = record.amount || record.totalCost || record.cost || 0;
  const odoVal = record.odometer || record.odometerReading || (record.vehicle && record.vehicle.odometer);
  const receiptLink = record.receiptImage || record.billUrl || record.receiptUrl;
  const rawDate = record.createdAt || record.dateTime || record.date;
  const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' }) : "Recent";
  const locationTag = record.location || record.purchaseLocation || record.city;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm hover:shadow-md flex flex-col justify-between font-nunito relative">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#A14000] border border-amber-200 flex items-center justify-center shrink-0">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-poppins">{stationName}</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{vehicleName}</p>
            </div>
          </div>
          {getStatusBadge(approvalState)}
        </div>

        {locationTag && (
          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{locationTag}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-poppins">Liters</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 font-poppins">{litersVal} L</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-poppins">Amount</span>
            <p className="font-bold text-[#A14000] text-sm mt-0.5 font-poppins">₹{Number(amountVal).toLocaleString("en-IN")}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-poppins">Odometer</span>
            <p className="font-semibold text-slate-800 mt-0.5 font-poppins">{odoVal ? `${odoVal} km` : "N/A"}</p>
          </div>
        </div>

        {approvalState === "REJECTED" && record.rejectionReason && (
          <div className="mb-3 p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-medium">
            <strong>Rejection Reason:</strong> {record.rejectionReason}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
        {receiptLink && (
          <a
            href={receiptLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#A14000] hover:underline flex items-center gap-1 font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> View Receipt
          </a>
        )}
      </div>
    </div>
  );
}
