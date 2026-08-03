import { useState, useEffect } from "react";
import driverApi from "../api/driverApi";
import FuelCard from "../components/FuelCard";
import { toast } from "react-hot-toast";
import { Fuel, Plus, X, RefreshCw } from "lucide-react";

export default function DriverFuelPage() {
  const [loading, setLoading] = useState(true);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [stationName, setStationName] = useState("");
  const [odometerReading, setOdometerReading] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  useEffect(() => {
    fetchFuelRecords();
  }, []);

  const fetchFuelRecords = async () => {
    setLoading(true);
    try {
      const res = await driverApi.getFuelRecords();
      if (res?.success && Array.isArray(res.data)) {
        setFuelRecords(res.data);
      }
    } catch (err) {
      console.error("Error fetching fuel records:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFuelEntry = async (e) => {
    e.preventDefault();
    if (!quantity || !totalCost || !stationName) {
      toast.error("Please fill in required fields (Station Name, Liters, Amount)");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("quantity", quantity);
      formData.append("totalCost", totalCost);
      formData.append("stationName", stationName);
      if (odometerReading) formData.append("odometerReading", odometerReading);
      if (receiptFile) formData.append("file", receiptFile);

      const res = await driverApi.createFuelEntry(formData);
      if (res?.success) {
        toast.success("Fuel log entry submitted successfully!");
        setShowModal(false);
        setQuantity("");
        setTotalCost("");
        setStationName("");
        setOdometerReading("");
        setReceiptFile(null);
        fetchFuelRecords();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit fuel entry");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-nunito pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-slate-900 flex items-center gap-2">
            <Fuel className="w-6 h-6 text-[#B45A0A]" />
            Fuel Log & Expense Records
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Submit fuel refilling receipts for manager approval and view past logs.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#B45A0A] hover:bg-[#9A4D08] text-white font-bold font-poppins rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Fuel Refill</span>
        </button>
      </div>

      {/* Fuel Cards Grid */}
      {loading ? (
        <div className="min-h-[50vh] flex items-center justify-center font-poppins">
          <RefreshCw className="w-8 h-8 text-[#B45A0A] animate-spin" />
        </div>
      ) : fuelRecords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fuelRecords.map((record) => (
            <FuelCard key={record._id || record.id} record={record} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <Fuel className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-slate-800 font-semibold font-poppins text-base">No Fuel Entries Logged Yet</h3>
          <p className="text-slate-500 text-xs mt-1">Click "Log New Fuel Refill" above to add your first receipt.</p>
        </div>
      )}

      {/* Modal: Create Fuel Entry */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl relative font-nunito">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold font-poppins text-slate-900 flex items-center gap-2">
                <Fuel className="w-5 h-5 text-[#B45A0A]" /> Log Fuel Refill
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFuelEntry} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Station Name / Location</label>
                <input
                  type="text"
                  required
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  placeholder="e.g. Indian Oil, Expressway Station"
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Liters (Quantity)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 120"
                    className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Total Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    placeholder="e.g. 11400"
                    className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Odometer Reading (km)</label>
                <input
                  type="number"
                  value={odometerReading}
                  onChange={(e) => setOdometerReading(e.target.value)}
                  placeholder="e.g. 45210"
                  className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:ring-1 focus:ring-[#B45A0A] focus:border-[#B45A0A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold font-poppins text-slate-700 uppercase">Fuel Bill / Receipt Photo</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#B45A0A] hover:file:bg-amber-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold font-poppins rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold font-poppins rounded-xl disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Submitting..." : "Save Fuel Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
