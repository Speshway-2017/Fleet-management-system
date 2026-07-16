import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import axiosClient from "@/api/axiosClient";
import { Check, X, Clock, Calendar, ShieldCheck, Mail, Building2, Plus, Edit2, Trash2 } from "lucide-react";

export default function SubscriptionRequests() {
  const [activeTab, setActiveTab] = useState("requests"); // "requests" or "plans"

  // ── Requests State ────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // ── Plans State ───────────────────────────────────────────────────────────
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State for Plans
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    duration: 30,
    status: "Active",
    displayOrder: 1,
    maxVehicles: 0,
    maxDrivers: 0,
    maxTrips: 0,
    featuresText: ""
  });

  // ── Requests Operations ───────────────────────────────────────────────────
  const loadRequests = async () => {
    try {
      setRequestsLoading(true);
      const { data: body } = await axiosClient.get("/subscriptions/requests");
      setRequests(body.data || []);
    } catch (err) {
      toast.error("Failed to load subscription requests.");
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to APPROVE this subscription request? This will activate the plan for this manager.")) return;
    try {
      const { data: body } = await axiosClient.put(`/subscriptions/requests/${id}/approve`);
      toast.success(body.message || "Subscription approved successfully!");
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to REJECT this subscription request?")) return;
    try {
      const { data: body } = await axiosClient.put(`/subscriptions/requests/${id}/reject`);
      toast.success(body.message || "Subscription request rejected.");
      loadRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject request.");
    }
  };

  // ── Plans Operations ──────────────────────────────────────────────────────
  const loadPlans = async () => {
    try {
      setPlansLoading(true);
      const { data: body } = await axiosClient.get("/subscriptions/plans");
      setPlans(body.data || []);
    } catch (err) {
      toast.error("Failed to load subscription plans.");
    } finally {
      setPlansLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      duration: 30,
      status: "Active",
      displayOrder: plans.length + 1,
      maxVehicles: 0,
      maxDrivers: 0,
      maxTrips: 0,
      featuresText: ""
    });
    setShowModal(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      duration: plan.duration,
      status: plan.status,
      displayOrder: plan.displayOrder || 1,
      maxVehicles: plan.maxVehicles || 0,
      maxDrivers: plan.maxDrivers || 0,
      maxTrips: plan.maxTrips || 0,
      featuresText: plan.features ? plan.features.join("\n") : ""
    });
    setShowModal(true);
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      const { data: body } = await axiosClient.delete(`/subscriptions/plans/${id}`);
      toast.success(body.message || "Plan deleted successfully!");
      loadPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete plan.");
    }
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || formData.price === undefined || !formData.duration) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      ...formData,
      features: formData.featuresText.split("\n").map(f => f.trim()).filter(Boolean)
    };

    try {
      if (editingPlan) {
        const { data: body } = await axiosClient.put(`/subscriptions/plans/${editingPlan._id}`, payload);
        toast.success(body.message || "Plan updated successfully!");
      } else {
        const { data: body } = await axiosClient.post("/subscriptions/plans", payload);
        toast.success(body.message || "Plan created successfully!");
      }
      setShowModal(false);
      loadPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save plan.");
    }
  };

  // ── Sync bootstrap ────────────────────────────────────────────────────────
  useEffect(() => {
    loadRequests();
    loadPlans();
  }, []);

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="subscription-requests" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Subscriptions" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#0f172a]">Subscriptions Management</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {activeTab === "requests" 
                  ? "Review, approve, or reject subscription plans requested by Fleet Managers."
                  : "Configure and manage subscription packages for Fleet Managers."}
              </p>
            </div>
            {activeTab === "plans" && (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#a14000] hover:bg-[#853500] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create Subscription Plan
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap mb-6">
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-5 py-2 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                activeTab === "requests"
                  ? "bg-[#0f172a] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Subscription Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-5 py-2 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                activeTab === "plans"
                  ? "bg-[#0f172a] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Subscription Plans ({plans.length})
            </button>
          </div>

          {/* Tab Content: Requests */}
          {activeTab === "requests" && (
            <>
              {requestsLoading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#f97316] border-t-transparent" />
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white border rounded-xl p-12 text-center">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No subscription requests found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manager</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Requested Plan</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Request Date</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {requests.map((req) => (
                          <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900">{req.manager?.name || "N/A"}</span>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" /> {req.manager?.email || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {req.manager?.organization?.name || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-extrabold text-slate-800">{req.plan?.name || "N/A"}</span>
                                <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                                  ₹{req.plan?.price || 0} / {req.plan?.duration || 0} Days
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(req.createdAt).toLocaleDateString("en-IN", {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide uppercase border ${
                                req.status === 'Approved'
                                  ? 'bg-green-50 text-green-700 border-green-100'
                                  : req.status === 'Rejected'
                                    ? 'bg-red-50 text-red-700 border-red-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {req.status === "Pending" ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleApprove(req._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Approve"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(req._id)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                    title="Reject"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold italic flex items-center gap-1 justify-end">
                                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                                  Processed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab Content: Plans */}
          {activeTab === "plans" && (
            <>
              {plansLoading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#a14000] border-t-transparent" />
                </div>
              ) : plans.length === 0 ? (
                <div className="bg-white border rounded-xl p-12 text-center">
                  <p className="text-slate-500 font-medium">No plans found. Click create to add your first plan!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <div key={plan._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between min-h-[380px] h-auto hover:shadow-md transition-all gap-4">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-extrabold text-[#0f172a]">{plan.name}</h3>
                            <span className={`inline-block px-2 py-0.5 mt-1.5 rounded-full text-[9px] font-bold border uppercase ${
                              plan.status === 'Active' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {plan.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(plan)}
                              className="p-2 text-slate-500 hover:text-[#a14000] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlan(plan._id)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-[#0f172a]">₹{plan.price}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/ month</span>
                        </div>

                        <p className="text-[11px] font-medium text-slate-500 min-h-[40px] leading-relaxed">
                          {plan.description}
                        </p>

                        <div className="text-[10px] text-[#b45309] font-bold bg-[#FFF3E8] px-2.5 py-1 rounded inline-block">
                          Duration: {plan.duration} Days (Order: {plan.displayOrder || 1})
                        </div>

                        {/* Displays limits dynamically */}
                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-600 pt-1 border-t border-slate-100">
                          <div className="bg-slate-50 border border-slate-100 p-1.5 rounded">
                            <span className="block text-slate-800 font-extrabold">{plan.maxVehicles || 0}</span>
                            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Vehicles</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-1.5 rounded">
                            <span className="block text-slate-800 font-extrabold">{plan.maxDrivers || 0}</span>
                            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Drivers</span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-1.5 rounded">
                            <span className="block text-slate-800 font-extrabold">{plan.maxTrips || 0}</span>
                            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">Trips</span>
                          </div>
                        </div>

                        <ul className="space-y-1.5 pt-3 border-t border-slate-100">
                          {plan.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                              <Check className="w-3 h-3 text-green-500 shrink-0" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Plans Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-extrabold text-[#0f172a]">
                {editingPlan ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    placeholder="e.g. Pro Plan"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description *</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    placeholder="e.g. Best choice for medium sized companies"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Limits Fields in a nice 3-column row */}
                <div className="col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">No of Vehicles *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.maxVehicles}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxVehicles: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">No of Drivers *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.maxDrivers}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDrivers: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">No of Trips *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.maxTrips}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTrips: Number(e.target.value) }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Features (One per line)</label>
                  <textarea
                    rows="4"
                    value={formData.featuresText}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuresText: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-300"
                    placeholder="Real-time GPS Tracking&#10;Up to 10 Vehicles&#10;Basic Analytics"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#a14000] hover:bg-[#853500] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
