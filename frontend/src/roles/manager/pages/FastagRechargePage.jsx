import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { ArrowLeft, CreditCard, CheckCircle, IndianRupee } from "lucide-react";

export default function FastagRechargePage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const quickAmounts = [500, 1000, 2500, 5000, 10000];

  const handleRecharge = () => {
    if (!amount && !selectedOption) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft width="24" height="24" className="text-gray-700" />
          </button>
        </div>

        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle width="64" height="64" className="text-amber-700" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Recharge Successful!</h2>
          <p className="text-gray-500 text-lg mb-8">
            Your FASTag wallet has been recharged successfully.
          </p>
          <button
            onClick={() => navigate('/manager/fastag')}
            className="px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-xl font-medium hover:from-amber-800 hover:to-amber-900 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft width="24" height="24" className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quick Recharge</h1>
          <p className="text-gray-500 mt-2">Recharge your FASTag wallet</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Recharge Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          {/* Amount Input */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-4">Enter Amount</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <IndianRupee width="28" height="28" className="text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedOption(null);
                }}
                placeholder="0"
                className="w-full pl-16 pr-6 py-5 text-4xl font-bold text-center border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-4">Quick Select</label>
            <div className="grid grid-cols-5 gap-4">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedOption(amt);
                    setAmount("");
                  }}
                  className={`py-4 rounded-xl font-semibold text-lg transition-all ${
                    selectedOption === amt
                      ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-4">Payment Method</label>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 border-2 border-amber-600 bg-amber-50 rounded-xl">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <CreditCard width="24" height="24" className="text-amber-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">UPI / Net Banking</p>
                  <p className="text-sm text-gray-500">Instant payment</p>
                </div>
                <div className="w-5 h-5 rounded-full bg-amber-700 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recharge Button */}
          <button
            disabled={loading || (!amount && !selectedOption)}
            onClick={handleRecharge}
            className="w-full py-5 bg-gradient-to-r from-amber-700 to-orange-800 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-amber-800 hover:to-orange-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Recharge ₹${amount || selectedOption || "0"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
