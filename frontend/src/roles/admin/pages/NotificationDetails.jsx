import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Check, X, AlertTriangle, Building2, Clock, CheckCircle2, AlertCircle, Info, ShieldAlert, Zap } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import axiosClient from "@/api/axiosClient";

export default function NotificationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifications, markAsRead } = useAdmin();

  const [subRequest, setSubRequest] = useState(null);
  const [subRequestLoading, setSubRequestLoading] = useState(false);

  // Find notification by ID
  const dbNotification = notifications.find(n => n.id === id);

  useEffect(() => {
    if (dbNotification && (dbNotification.type === "subscription_request" || dbNotification.type === "SUBSCRIPTION_REQUEST") && dbNotification.referenceId) {
      const fetchSubRequest = async () => {
        try {
          setSubRequestLoading(true);
          const { data: body } = await axiosClient.get("/subscriptions/requests");
          const found = body.data?.find(r => r._id === dbNotification.referenceId);
          if (found) {
            setSubRequest(found);
          }
        } catch (err) {
          console.error("Failed to load subscription request details:", err);
        } finally {
          setSubRequestLoading(false);
        }
      };
      fetchSubRequest();
    }
  }, [dbNotification]);

  const handleApproveSub = async () => {
    if (!subRequest) return;
    if (!window.confirm("Are you sure you want to APPROVE this subscription request? This will activate the plan for this manager.")) return;
    try {
      const { data: body } = await axiosClient.put(`/subscriptions/requests/${subRequest._id}/approve`);
      toast.success(body.message || "Subscription approved successfully!");
      setSubRequest(prev => prev ? { ...prev, status: "Approved" } : null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleRejectSub = async () => {
    if (!subRequest) return;
    if (!window.confirm("Are you sure you want to REJECT this subscription request?")) return;
    try {
      const { data: body } = await axiosClient.put(`/subscriptions/requests/${subRequest._id}/reject`);
      toast.success(body.message || "Subscription request rejected.");
      setSubRequest(prev => prev ? { ...prev, status: "Rejected" } : null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request.");
    }
  };

  // Fallback to a basic structure or the selected notification
  const notification = dbNotification ? {
    id: dbNotification.id,
    title: dbNotification.title,
    description: dbNotification.description,
    timestamp: dbNotification.time,
    fullDate: new Date(dbNotification.createdAt).toLocaleString(),
    priority: dbNotification.priority || "Low",
    status: dbNotification.isRead ? "Read" : "Unread",
    type: dbNotification.type || "bell",
    organization: dbNotification.organization ? {
      name: dbNotification.organization.name || "N/A",
      id: dbNotification.organization._id || dbNotification.organization.id || "N/A",
      contact: dbNotification.organization.email || dbNotification.organization.contact || "N/A",
      phone: dbNotification.organization.phone || "N/A"
    } : {
      name: "System Generated",
      id: "SYS-ALERT",
      contact: "support@fleet.com",
      phone: "N/A"
    },
    timeline: dbNotification.timeline || [
      { id: 1, action: "Event Triggered", time: new Date(dbNotification.createdAt).toLocaleString(), user: "System", active: true }
    ]
  } : {
    id: "unknown",
    title: "Loading Notification...",
    description: "The notification detail is being fetched or does not exist.",
    timestamp: "N/A",
    fullDate: "N/A",
    priority: "Low",
    status: "Unknown",
    type: "info",
    organization: { name: "System", id: "SYS-000", contact: "info@fleet.com", phone: "N/A" },
    timeline: []
  };

  const isRead = dbNotification ? dbNotification.isRead : false;

  useEffect(() => {
    if (
      dbNotification && 
      (dbNotification.type === "subscription_request" || 
       dbNotification.type === "SUBSCRIPTION_REQUEST" ||
       (dbNotification.title && dbNotification.title.toLowerCase().includes("subscription")))
    ) {
      navigate('/admin/subscription-requests');
    }
  }, [dbNotification, navigate]);

  useEffect(() => {
    if (dbNotification && !dbNotification.isRead) {
      markAsRead(dbNotification.id);
    }
  }, [dbNotification, markAsRead]);

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Notification Details" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/admin/notifications')}
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-800">{notification.title}</h2>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-700">
                      {notification.priority} Priority
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isRead ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>
                      {notification.status}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 mt-1">{notification.fullDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('/admin/notifications')}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[13px] font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Dismiss
                </button>
                
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Content Left */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Description Box */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-500" />
                    <h3 className="text-[15px] font-extrabold text-slate-800">Description</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {notification.description}
                  </p>
                </div>

                {/* Subscription Request Action */}
                {(dbNotification?.type === "subscription_request" || dbNotification?.type === "SUBSCRIPTION_REQUEST") && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Zap className="w-5 h-5 text-[#a14000]" />
                      <h3 className="text-[15px] font-extrabold text-slate-800">Subscription Request Action</h3>
                    </div>
                    {subRequestLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#a14000] border-t-transparent" />
                      </div>
                    ) : subRequest ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan Requested</span>
                          <span className="text-sm font-extrabold text-slate-900">{subRequest.plan?.name || "N/A"} (₹{subRequest.plan?.price || 0})</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Status</span>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase border ${
                            subRequest.status === 'Approved'
                              ? 'bg-green-50 text-green-700 border-green-100'
                              : subRequest.status === 'Rejected'
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {subRequest.status}
                          </span>
                        </div>
                        {subRequest.status === "Pending" ? (
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={handleApproveSub}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" /> Approve Request
                            </button>
                            <button
                              onClick={handleRejectSub}
                              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" /> Reject Request
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg text-center text-xs font-bold text-slate-500">
                            This request has already been processed ({subRequest.status}).
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-slate-500">Could not load subscription request details (it may have been deleted).</p>
                    )}
                  </div>
                )}

                {/* Organization Details */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="w-5 h-5 text-purple-500" />
                    <h3 className="text-[15px] font-extrabold text-slate-800">Organization Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Organization Name</p>
                      <p className="text-sm font-bold text-slate-800">{notification.organization.name}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Organization ID</p>
                      <p className="text-sm font-bold text-slate-800">{notification.organization.id}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Contact</p>
                      <p className="text-sm font-bold text-slate-800">{notification.organization.contact}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                      <p className="text-sm font-bold text-slate-800">{notification.organization.phone}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sidebar Right */}
              <div className="space-y-6">
                
                {/* Information Metadata */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-[15px] font-extrabold text-slate-800 mb-5">Information</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
                      <span className="text-[13px] font-bold text-slate-500">Notification ID</span>
                      <span className="text-[13px] font-black text-slate-800 break-all">#{notification.id}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[13px] font-bold text-slate-500">Category</span>
                      <span className="text-[13px] font-black text-slate-800">{notification.type}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[13px] font-bold text-slate-500">Priority</span>
                      <span className="text-[13px] font-black text-slate-800">{notification.priority}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-bold text-slate-500">System Time</span>
                      <span className="text-[13px] font-black text-slate-800">{notification.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline / Activity */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <h3 className="text-[15px] font-extrabold text-slate-800">Activity History</h3>
                  </div>

                  <div className="relative pl-3">
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-slate-100"></div>
                    <div className="space-y-6">
                      {notification.timeline.map((event, index) => (
                        <div key={event.id} className="relative pl-6">
                          <div className={`absolute left-[-5px] top-1 w-[10px] h-[10px] rounded-full border-2 border-white ${event.active ? 'bg-orange-500 ring-4 ring-orange-50' : 'bg-slate-300'}`}></div>
                          <div>
                            <h4 className={`text-[13px] font-bold mb-0.5 ${event.active ? 'text-slate-800' : 'text-slate-500'}`}>{event.action}</h4>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                              <span>{event.time}</span>
                              <span>•</span>
                              <span>{event.user}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
