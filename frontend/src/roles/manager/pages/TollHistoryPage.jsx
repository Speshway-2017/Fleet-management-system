import { formatIFD, formatIFDWithTime } from '@/utils/dateUtils';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Icon } from "@iconify/react";
import { Calendar, Filter, AlertTriangle, TrendingDown, ArrowRight, ArrowLeft } from "lucide-react";
import { mockTollTransactions } from "@/data/mockFastag";

export default function TollHistoryPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = mockTollTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(mockTollTransactions.length / itemsPerPage);

  return (
    <div className="p-6 lg:p-8">
      <Breadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-poppins font-bold text-[32px] text-[#1E293B] leading-none">Toll Transaction History</h1>
            <p className="text-[18px] text-[#64748B] mt-[12px]">
              Real-time overview of all FASTag debits across the fleet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
            <Calendar width="20" height="20" className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Last 30 Days</span>
            <Icon icon="mdi:chevron-down" width="18" height="18" className="text-gray-500" />
          </div>
          <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter width="20" height="20" />
            Filter By Vehicle
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm mb-10">
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
                  DATE & TIME
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  AMOUNT
                </th>
                <th className="py-4 px-6 text-left whitespace-nowrap">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((txn) => (
                <tr key={txn.id} className="border-b border-[#E7EAF0]/60 hover:bg-[#F5F7FB]/50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center justify-center w-fit px-3.5 h-10 bg-blue-50 rounded text-center">
                      <span className="text-sm font-semibold text-gray-800 leading-none whitespace-nowrap">{txn.vehicleId}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <p className="text-sm text-gray-800 font-medium whitespace-nowrap">{txn.location}</p>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-sm text-gray-800 font-medium">
                      {formatIFD()}
                    </span>
                    <span className="text-sm text-gray-400 mx-1.5 font-bold">•</span>
                    <span className="text-sm text-gray-600 font-medium">
                      {formatIFDWithTime()}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="text-sm font-semibold text-orange-700 whitespace-nowrap">
                      ₹{txn.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {txn.status === "settled" ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                        <AlertTriangle width="14" height="14" />
                        <span>Low Balance Alert</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, mockTollTransactions.length)} of {mockTollTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 text-sm rounded border border-gray-300 bg-gray-50 text-gray-500 disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 text-sm rounded border ${
                  currentPage === page ? "bg-black text-white border-black" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 text-sm rounded border border-gray-300 bg-gray-50 text-gray-700 disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Total Monthly Toll</h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">₹1,45,280.00</p>
          <div className="flex items-center gap-2 text-green-700 text-xs font-semibold">
            <TrendingDown width="16" height="16" />
            4.2% from last month
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Active FASTag Units</h3>
          <p className="text-3xl font-bold text-gray-900 mb-4">128</p>
          <div className="flex items-center gap-2 text-gray-700 text-xs font-semibold">
            <span className="w-2 h-2 bg-orange-700 rounded-full"></span>
            3 Units near threshold
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-700 to-orange-800 rounded-lg border border-gray-300 p-6 shadow-lg">
          <h3 className="text-xs font-semibold text-orange-100 uppercase tracking-wider mb-2">Pending Reconciliation</h3>
          <p className="text-2xl font-bold text-white mb-4">12 Transactions</p>
          <button className="text-sm font-semibold text-orange-50 flex items-center gap-1">
            Resolve Now
            <ArrowRight width="16" height="16" />
          </button>
        </div>
      </div>
    </div>
  );
}
