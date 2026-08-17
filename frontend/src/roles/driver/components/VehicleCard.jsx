import { Truck, ShieldCheck, Fuel, Wrench, Eye } from "lucide-react";

export default function VehicleCard({ vehicle }) {
  if (!vehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
        <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-slate-800 font-semibold font-poppins">No Vehicle Assigned</h3>
        <p className="text-slate-500 text-xs font-nunito mt-1">Contact your Fleet Manager to get a vehicle assigned.</p>
      </div>
    );
  }

  const isCompliant = (dateStr) => {
    if (!dateStr) return true;
    return new Date(dateStr) > new Date();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-nunito">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#A14000] shrink-0">
            <Truck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h2 className="text-lg sm:text-xl font-bold font-poppins text-slate-900 whitespace-nowrap truncate" title={vehicle.registrationNumber || vehicle.vehicleNumber || "Unassigned"}>
                {vehicle.registrationNumber || vehicle.vehicleNumber || "Unassigned"}
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-poppins uppercase whitespace-nowrap shrink-0">
                {vehicle.currentStatus || vehicle.status || "Available"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {[vehicle.brand || vehicle.make, vehicle.model, vehicle.vehicleType || vehicle.type].filter(Boolean).join(" ") || "Vehicle"}
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-1.5 font-poppins font-medium self-start sm:self-center shrink-0">
          <Eye className="w-3.5 h-3.5 text-[#A14000]" />
          <span>View Only</span>
        </div>
      </div>

      {/* Grid Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-poppins font-semibold truncate">
            <Fuel className="w-3.5 h-3.5 text-[#A14000] shrink-0" />
            <span className="truncate">Fuel Specs</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 font-poppins truncate">{vehicle.fuelType || "Diesel"}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {vehicle.fuelCapacity || vehicle.tankCapacity ? `${vehicle.fuelCapacity || vehicle.tankCapacity} Liters` : "N/A"}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-poppins font-semibold truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#A14000] shrink-0" />
            <span className="truncate">Insurance</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isCompliant(vehicle.insuranceExpiry || vehicle.insuranceDetails?.expiryDate) ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <p className="text-sm font-semibold text-slate-900 font-poppins truncate">
              {isCompliant(vehicle.insuranceExpiry || vehicle.insuranceDetails?.expiryDate) ? "Valid & Active" : "Action Needed"}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Expires: {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : (vehicle.insuranceDetails?.expiryDate ? new Date(vehicle.insuranceDetails.expiryDate).toLocaleDateString() : "N/A")}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 min-w-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1 font-poppins font-semibold truncate">
            <Wrench className="w-3.5 h-3.5 text-[#A14000] shrink-0" />
            <span className="truncate">Maintenance</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 font-poppins truncate">{vehicle.currentStatus === 'Under Maintenance' ? 'Under Repair' : 'Good Health'}</p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            Last: {vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toLocaleDateString() : vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}
