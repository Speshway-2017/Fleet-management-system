import { useParams, useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import { ArrowLeft, Truck, Receipt, CheckCircle } from "lucide-react";
import { mockTollTransactions } from "@/data/mockFastag";

export default function FastagReceiptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const transaction = mockTollTransactions.find(t => t.id === parseInt(id));

  if (!transaction) {
    return (
      <div className="p-6 lg:p-8">
        <Breadcrumb />
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Transaction not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Transaction Receipt</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">Receipt for FASTag toll transaction</p>
        </div>
      </div>

      {/* Receipt Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Receipt width="28" height="28" className="text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Receipt No</p>
                <p className="font-bold text-gray-800">FRX{String(transaction.id).padStart(6, '0')}</p>
              </div>
            </div>
            {transaction.status === "settled" ? (
              <span className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium">
                <CheckCircle width="20" height="20" />
                Settled
              </span>
            ) : (
              <span className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium">
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Truck width="40" height="40" className="text-amber-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{transaction.vehicleId}</p>
              <p className="text-gray-500">{transaction.vehicleModel}</p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-8">
          <h3 className="font-semibold text-gray-800 mb-6">Transaction Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-gray-500">Toll Plaza</p>
              <p className="font-medium text-gray-800">{transaction.location}</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-gray-500">Plaza ID</p>
              <p className="font-medium text-gray-800">{transaction.plazaId}</p>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <p className="text-gray-500">Date & Time</p>
              <div className="text-right">
                <p className="font-medium text-gray-800">
                  {new Date(transaction.time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-6 bg-gray-50 rounded-xl px-4 mt-4">
              <p className="font-semibold text-gray-700">Total Amount</p>
              <p className="text-3xl font-extrabold text-amber-700">₹{transaction.amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">Generated on {new Date().toLocaleString()}</p>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl font-medium hover:from-amber-800 hover:to-amber-900 transition-all">
            <Icon icon="mdi:download" width="20" height="20" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
