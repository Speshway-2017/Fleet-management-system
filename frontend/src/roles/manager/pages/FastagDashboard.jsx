import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { CreditCard, Truck } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { mockWalletBalance, mockTollTransactions, mockMonthlySpending } from "@/data/mockFastag";

export default function FastagDashboard() {
  const navigate = useNavigate();
  const [period] = useState("Last 6 Months");

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">FASTag & Toll</h1>
          <p className="text-[18px] text-[#64748B] mt-[12px]">
            Real-time monitoring of toll expenditure and wallet liquidity across 142 vehicles.
          </p>
        </div>
        <button 
          onClick={() => navigate('/manager/fastag/recharge')}
          className="bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 hover:from-amber-800 hover:to-amber-900 transition-all w-full sm:w-auto cursor-pointer"
        >
          <CreditCard width="24" height="24" />
          Quick Recharge
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Wallet Balance Card */}
        <div className="lg:col-span-1 bg-black rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          {/* Gradient overlay */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-700/80 via-orange-600/60 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-8 left-8 w-32 h-32 bg-gradient-to-tr from-amber-600/30 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-gray-400 text-lg tracking-wider mb-2">TOTAL WALLET BALANCE</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-extrabold">
                {mockWalletBalance.currency}
                {mockWalletBalance.total.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
              <span className="text-xl text-gray-400">
                .{mockWalletBalance.total.toFixed(2).split(".")[1]}
              </span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-gray-300">Low Balance Vehicles</span>
                <span className="bg-amber-700 px-3 py-1 rounded-md text-xs font-medium">
                  {mockWalletBalance.lowBalanceVehicles} Vehicles
                </span>
              </div>
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                <span className="text-gray-300">Auto-Topup Status</span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="font-medium">{mockWalletBalance.autoTopupStatus}</span>
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <button onClick={() => navigate('/manager/fastag/history')} className="w-full border border-white/30 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Spending Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-medium text-gray-700">Monthly Toll Spending</h2>
            <div className="flex items-center gap-2">
              <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-sm font-medium">
                {period}
              </button>
              <button className="bg-blue-100 text-blue-800 p-2 rounded-xl">
                <Icon icon="mdi:unfold-more-vertical" width="20" height="20" />
              </button>
            </div>
          </div>
          <div className="h-48 flex items-end justify-around gap-4 px-4">
            {mockMonthlySpending.map((item) => (
              <div key={item.month} className="flex flex-col items-center gap-3 flex-1">
                <div className="w-full bg-gray-100 rounded-t-xl relative overflow-hidden" style={{ height: `${(item.amount / 16500) * 100}%` }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl" style={{ height: '100%' }}></div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-700">Recent Transactions</h2>
          <button onClick={() => navigate('/manager/fastag/history')} className="text-amber-700 font-medium text-sm hover:text-amber-800">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-8 py-5 text-left text-gray-500 font-semibold text-base">
                  VEHICLE ID
                </th>
                <th className="px-8 py-5 text-left text-gray-500 font-semibold text-base">
                  LOCATION / PLAZA
                </th>
                <th className="px-8 py-5 text-left text-gray-500 font-semibold text-base">
                  TIME
                </th>
                <th className="px-8 py-5 text-left text-gray-500 font-semibold text-base">
                  AMOUNT
                </th>
                <th className="px-8 py-5 text-left text-gray-500 font-semibold text-base">
                  STATUS
                </th>
                <th className="px-8 py-5 text-left text-gray-500 font-semibold text-base">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {mockTollTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck width="32" height="32" className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-lg whitespace-nowrap">{txn.vehicleId}</p>
                        <p className="text-gray-500 text-sm">{txn.vehicleModel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-gray-800">{txn.location}</p>
                    <p className="text-gray-500 text-sm">Plaza ID: {txn.plazaId}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-gray-800">{new Date(txn.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-gray-500 text-sm">
                      Today, {new Date(txn.time).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-semibold text-gray-800 text-lg">
                      ₹{txn.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-semibold uppercase">
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => navigate(`/manager/fastag/receipt/${txn.id}`)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                    >
                      <Icon icon="mdi:receipt-text-outline" width="24" height="24" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
