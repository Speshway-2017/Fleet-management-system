import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Search, Mail, Phone, Calendar, Download, Trash2, 
  MessageSquare, Eye, X, Check, ArrowRight, CornerDownRight,
  TrendingUp, HelpCircle, ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import axiosClient from "@/api/axiosClient";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import KPICard from "@/components/common/KPICard";

export default function ContactRequests() {
  const location = useLocation();
  const highlightId = new URLSearchParams(location.search).get("id");
  
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState({
    summary: { total: 0, new: 0, pending: 0, resolved: 0 },
    timeframes: { today: 0, thisWeek: 0, thisMonth: 0 },
    averageResponseTime: "0.0",
    mostSelectedSubject: "N/A"
  });
  
  // Filters and Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [replying, setReplying] = useState(false);
  
  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch all contact requests
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getContactRequests({
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
        subject: subjectFilter,
        startDate,
        endDate
      });
      
      const result = response.data?.data || response.data;
      if (result) {
        setContacts(result.contacts || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalContacts(result.pagination?.total || 0);
      }
    } catch (err) {
      toast.error("Failed to load contact requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await adminApi.getContactAnalytics();
      const result = response.data?.data || response.data;
      if (result) {
        setAnalytics(result);
      }
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, statusFilter, subjectFilter, startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (highlightId && contacts.length > 0) {
      const matchingContact = contacts.find(c => c._id === highlightId);
      if (matchingContact) {
        openViewModal(matchingContact);
      }
    }
  }, [contacts, highlightId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContacts();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setSubjectFilter("All");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // Delete Request
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteContact(deleteId);
      toast.success("Contact request deleted successfully");
      fetchContacts();
      fetchAnalytics();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete request");
    }
  };

  // Update Status directly
  const handleUpdateStatus = async (id, statusVal, responseNotesVal = "") => {
    try {
      await adminApi.updateContactStatus(id, { 
        status: statusVal, 
        responseNotes: responseNotesVal 
      });
      toast.success(`Status updated to ${statusVal}`);
      fetchContacts();
      fetchAnalytics();
      if (selectedContact && selectedContact._id === id) {
        setSelectedContact(prev => ({ ...prev, status: statusVal, responseNotes: responseNotesVal }));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Submit Reply Email
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    setReplying(true);
    try {
      await adminApi.replyToContact(selectedContact._id, {
        message: replyMessage,
        updateStatusTo: newStatus || "Resolved"
      });
      
      toast.success("Response email sent successfully!");
      setReplyMessage("");
      setShowViewModal(false);
      fetchContacts();
      fetchAnalytics();
    } catch (err) {
      toast.error("Failed to send response email");
    } finally {
      setReplying(false);
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const response = await axiosClient.get('/admin/contacts/export', { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fleet_contact_requests_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("CSV exported successfully!");
    } catch (err) {
      toast.error("Failed to export CSV");
      console.error(err);
    }
  };

  const openViewModal = (contact) => {
    setSelectedContact(contact);
    setNewStatus(contact.status);
    setShowViewModal(true);
  };

  // Helper Badge Color
  const getStatusStyle = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-700">
      <NewAdminSidebar activeItem="contact-requests" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-[72px]">
        <div className="fixed top-0 left-0 lg:left-[260px] right-0 z-30">
          <NewAdminTopNav title="Contact Requests" />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* KPI Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard 
              title="Total Requests" 
              value={analytics.summary.total}
              subtitle="All Time Submissions"
              icon="material-symbols:mail-outline"
              variant="blue"
              filledBarsRatio={0.8}
            />
            <KPICard 
              title="New Inquiries" 
              value={analytics.summary.new}
              subtitle="Awaiting First Review"
              icon="material-symbols:mark-email-unread-outline"
              variant="amber"
              filledBarsRatio={0.65}
              trendText={analytics.timeframes.today > 0 ? `+${analytics.timeframes.today} today` : ""}
              isTrendUp={analytics.timeframes.today > 0}
            />
            <KPICard 
              title="In Progress" 
              value={analytics.summary.pending}
              subtitle="Follow-ups Pending"
              icon="material-symbols:pending-actions"
              variant="rose"
              filledBarsRatio={0.4}
            />
            <KPICard 
              title="Resolved" 
              value={analytics.summary.resolved}
              subtitle="Closed Tickets"
              icon="material-symbols:task-alt"
              variant="green"
              filledBarsRatio={0.9}
            />
          </div>

          {/* Core Analytics Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between shadow-md border border-slate-800">
              <div className="space-y-2 text-center sm:text-left mb-4 sm:mb-0">
                <div className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest">Inquiry Insights</div>
                <h2 className="text-xl font-black leading-tight">Fast Responses Build Happy Partnerships</h2>
                <p className="text-xs text-slate-300 font-medium">Keep response rates below 24 hours to maximize inbound conversion and driver compliance.</p>
              </div>
              <div className="flex gap-4 items-center shrink-0">
                <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10 backdrop-blur-sm min-w-[100px]">
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Avg SLA</div>
                  <div className="text-2xl font-black text-indigo-300 mt-1">{analytics.averageResponseTime}h</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10 backdrop-blur-sm min-w-[100px]">
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Top Interest</div>
                  <div className="text-base font-extrabold text-amber-300 mt-2 truncate max-w-[90px]">{analytics.mostSelectedSubject}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Submission Volume</h3>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">Today</span>
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">{analytics.timeframes.today} requests</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">This Week</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">{analytics.timeframes.thisWeek} requests</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-500">This Month</span>
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">{analytics.timeframes.thisMonth} requests</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter and Actions Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {/* Search */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Inquiries</label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search name, email, subject, or ticket ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs font-medium rounded-xl border border-slate-200 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none w-full text-xs font-medium rounded-xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer pr-10"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Subject Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Subject</label>
                  <div className="relative">
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="appearance-none w-full text-xs font-medium rounded-xl border border-slate-200 px-4 py-3 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer pr-10"
                    >
                      <option value="All">All Subjects</option>
                      <option value="Sales">Sales Inquiry</option>
                      <option value="Demo">Request a Demo</option>
                      <option value="Support">Technical Support</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Date Filters & Advanced Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">From</span>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">To</span>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Apply Filter
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#A14000] hover:bg-[#853500] rounded-xl shadow-sm transition-all cursor-pointer ml-auto sm:ml-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Requests Table List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-24 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-xs font-semibold text-slate-400">Loading contact inquiries...</p>
              </div>
            ) : contacts.length === 0 ? (
              <div className="py-24 text-center text-slate-400">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-700 mb-1">No contact requests found</h3>
                <p className="text-xs font-medium max-w-sm mx-auto">Try updating search filters or clear inputs to see all requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Requester Details</th>
                      <th className="px-6 py-4">Company & Phone</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {contacts.map((contact) => {
                      const isHighlighted = contact._id === highlightId;
                      return (
                        <tr 
                          key={contact._id} 
                          className={`hover:bg-slate-50/50 transition-colors ${
                            isHighlighted 
                              ? "bg-amber-50 hover:bg-amber-100/70 border-l-4 border-[#A14000] font-semibold" 
                              : ""
                          }`}
                        >
                        {/* Ticket ID */}
                        <td className="px-6 py-4.5 font-bold text-slate-900 tracking-wide font-mono whitespace-nowrap">
                          {contact.ticketId || "N/A"}
                        </td>
                        {/* Requester Details */}
                        <td className="px-6 py-4.5">
                          <div className="font-bold text-slate-800 text-sm mb-0.5">{contact.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-semibold truncate max-w-[200px]">
                            {contact.email}
                          </div>
                        </td>
                        {/* Company & Phone */}
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-700">{contact.company || <span className="text-slate-300 font-normal">No Company</span>}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {contact.phone || <span className="text-slate-300 font-normal">No Phone</span>}
                          </div>
                        </td>
                        {/* Subject */}
                        <td className="px-6 py-4.5 font-semibold text-indigo-950">
                          {contact.subject}
                        </td>
                        {/* Date */}
                        <td className="px-6 py-4.5 text-slate-400 font-medium whitespace-nowrap">
                          {new Date(contact.createdAt).toLocaleDateString("en-US", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        {/* Status */}
                        <td className="px-6 py-4.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(contact.status)}`}>
                            {contact.status}
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4.5 text-center space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => openViewModal(contact)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 rounded-lg transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View & Reply</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact._id)}
                            className="inline-flex items-center justify-center p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {contacts.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-4.5">
                <div className="text-xs text-slate-500 font-semibold">
                  Showing <span className="text-slate-800">{((page - 1) * limit) + 1}</span> to{" "}
                  <span className="text-slate-800">{Math.min(page * limit, totalContacts)}</span> of{" "}
                  <span className="text-slate-800">{totalContacts}</span> entries
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        page === i + 1
                          ? "bg-slate-900 text-white border border-slate-900"
                          : "text-slate-600 hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* VIEW & REPLY MODAL */}
      {showViewModal && selectedContact && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-center">
              <div>
                <div className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">Ticket Detail</div>
                <h3 className="text-base font-black flex items-center gap-2 mt-0.5">
                  <span>{selectedContact.ticketId}</span>
                  <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold border bg-white/10 ${
                    selectedContact.status === 'New' ? 'border-blue-400/30 text-blue-300' :
                    selectedContact.status === 'Pending' ? 'border-amber-400/30 text-amber-300' :
                    'border-emerald-400/30 text-emerald-300'
                  }`}>
                    {selectedContact.status}
                  </span>
                </h3>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
              
              {/* Requester Contact Info */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Full Name</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedContact.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Email Address</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${selectedContact.email}`} className="hover:underline">{selectedContact.email}</a>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Company</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedContact.company || "N/A"}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Phone Number</div>
                  <div className="font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedContact.phone || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Subject Matter</div>
                  <div className="font-bold text-slate-800 mt-0.5">{selectedContact.subject}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Submitted Date</div>
                  <div className="font-bold text-slate-800 mt-0.5">
                    {new Date(selectedContact.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inquiry Message</h4>
                <div className="bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl p-4 text-slate-700 leading-relaxed italic whitespace-pre-line text-sm">
                  "{selectedContact.message}"
                </div>
              </div>

              {/* Direct Status Control & Notes */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">Quick Status Override</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Update request state without drafting an email response.</p>
                </div>
                <div className="flex gap-2">
                  {["New", "Pending", "Resolved"].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedContact._id, st, selectedContact.responseNotes)}
                      className={`px-3 py-1.5 rounded-lg font-bold border text-[11px] transition-all cursor-pointer ${
                        selectedContact.status === st 
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply History Logs */}
              {selectedContact.history && selectedContact.history.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Response History</h4>
                  <div className="space-y-3">
                    {selectedContact.history.map((log, idx) => (
                      <div key={idx} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex gap-3 items-start">
                        <CornerDownRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-800">{log.replier}</span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(log.sentAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed font-medium">{log.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compose email Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-4 pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Send Email Response</label>
                  <textarea
                    rows="4"
                    placeholder="Draft your reply email. The user will receive this as an HTML email quoting their ticket and request details..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-xs resize-none bg-white text-slate-800"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Post-Reply Status:</span>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="border border-slate-200 text-[11px] font-bold rounded-lg px-2 py-1.5 bg-white cursor-pointer"
                    >
                      <option value="Resolved">Resolved (Close Ticket)</option>
                      <option value="Pending">Pending (Keep Active)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={replying}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <span>{replying ? "Sending Email..." : "Send Response"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Delete Inquiry Request?</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">This action is permanent. All ticket logs, communication history, and data related to this inquiry will be deleted.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
