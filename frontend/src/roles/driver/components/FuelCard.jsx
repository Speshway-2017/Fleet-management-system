import { Fuel, Calendar, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";

export default function FuelCard({ record }) {
  if (!record) return null;

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-poppins">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 font-poppins">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 font-poppins">
            <Clock className="w-3 h-3" /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition shadow-sm hover:shadow-md flex flex-col justify-between font-nunito">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#B45A0A] border border-amber-200 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm font-poppins">{record.stationName || "Fuel Station"}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{record.vehicleRegistration || "Assigned Truck"}</p>
            </div>
          </div>
          {getStatusBadge(record.status)}
        </div>

        <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-poppins">Liters</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5 font-poppins">{record.quantity || record.liters || 0} L</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-poppins">Amount</span>
            <p className="font-bold text-[#B45A0A] text-sm mt-0.5 font-poppins">₹{record.totalCost || record.cost || 0}</p>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold font-poppins">Odometer</span>
            <p className="font-semibold text-slate-800 mt-0.5 font-poppins">{record.odometerReading ? `${record.odometerReading} km` : "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{record.date ? new Date(record.date).toLocaleDateString() : "Recent"}</span>
        </div>
        {record.receiptUrl && (
          <a
            href={record.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#B45A0A] hover:underline flex items-center gap-1 font-semibold"
          >
            <FileText className="w-3.5 h-3.5" /> View Receipt
          </a>
        )}
      </div>
    </div>
  );
}
