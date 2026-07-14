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
              <div key={item.month} className="flex flex-col items-center gap-3 flex-1 h-full justify-end">
                <div className="w-full h-36 bg-gray-100 rounded-xl relative overflow-hidden group/bar">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-xl transition-all duration-500" 
                    style={{ height: `${(item.amount / 16500) * 100}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold font-poppins pointer-events-none">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-bold font-poppins">{item.month}</span>
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
          <table className="w-full text-left border-collapse text-sm font-nunito">
            <thead>
              <tr className="bg-[#F5F7FB] border-b border-[#E7EAF0] text-[#64748B] font-poppins font-semibold uppercase text-[10px] tracking-wider select-none whitespace-nowrap">
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  VEHICLE ID
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  LOCATION / PLAZA
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  TIME
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  AMOUNT
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  STATUS
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EAF0]/60">
              {mockTollTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#F5F7FB]/50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <Truck width="20" height="20" className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1E293B] text-sm whitespace-nowrap">{txn.vehicleId}</p>
                        <p className="text-xs text-[#64748B]">{txn.vehicleModel}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-bold text-[#1E293B] text-sm">{txn.location}</p>
                    <p className="text-xs text-[#64748B]">Plaza ID: {txn.plazaId}</p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="font-bold text-[#1E293B] text-sm">{new Date(txn.time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p className="text-xs text-[#64748B]">
                      Today, {new Date(txn.time).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="font-bold text-[#1E293B] text-sm">
                      ₹{txn.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                      txn.status.toLowerCase() === "settled" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <button 
                      onClick={() => navigate(`/manager/fastag/receipt/${txn.id}`)}
                      className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl active:scale-95 transition-all cursor-pointer"
                    >
                      <Icon icon="mdi:receipt-text-outline" width="20" height="20" />
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
