import { useState } from "react";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

export default function ScheduleFromNotificationModal({ prefilled, onClose, onScheduled }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [serviceCenter, setServiceCenter] = useState("G-Tech Car Care, Pune Bypass");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !serviceCenter) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newOrder = {
      id: `wo${Date.now()}`,
      vehicleId: prefilled.vehicleNumber,
      vehicleName: "Fleet Vehicle",
      serviceType: prefilled.maintenanceType,
      scheduledDate: selectedDate,
      status: "Scheduled",
      cost: "₹4,500.00",
      specialist: "Dayanand M",
      garage: serviceCenter
    };

    onScheduled(newOrder);
    setLoading(false);
    toast.success("Maintenance Scheduled");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-lg animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Icon icon="mdi:wrench" className="w-6 h-6 text-amber-700" />
            Schedule Maintenance
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <Icon icon="mdi:close" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSchedule} className="space-y-4">
          {/* Prefilled Data — Read Only */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Vehicle Number</span>
              <span className="font-bold text-gray-800">{prefilled.vehicleNumber}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Maintenance Type</span>
              <span className="font-bold text-gray-800">{prefilled.maintenanceType}</span>
            </div>
            {prefilled.dueMileage && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Due Mileage</span>
                <span className="font-bold text-red-600">{prefilled.dueMileage} miles</span>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Select Date *</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-700 transition-colors"
              required
            />
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Select Time *</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-700 transition-colors"
              required
            />
          </div>

          {/* Service Center */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Service Center *</label>
            <select
              value={serviceCenter}
              onChange={(e) => setServiceCenter(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-700 appearance-none cursor-pointer"
              required
            >
              <option>G-Tech Car Care, Pune Bypass</option>
              <option>HP garage hub, Mumbai Corridor</option>
              <option>Speedway Center, Bangalore road</option>
              <option>Auto Service Station, Delhi NCR</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Save Schedule"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
