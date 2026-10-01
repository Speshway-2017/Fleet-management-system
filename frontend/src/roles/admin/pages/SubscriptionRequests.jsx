import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import axiosClient from "@/api/axiosClient";
import { Check, X, Clock, Calendar, ShieldCheck, Mail, Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { subscriptionPlanSchema, validateForm, validateField } from "@/validations";

export default function SubscriptionRequests() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname.includes("subscription-plans") ? "plans" : "requests"
  );

  useEffect(() => {
    if (location.pathname.includes("subscription-plans")) {
      setActiveTab("plans");
    } else {
      setActiveTab("requests");
    }
  }, [location.pathname]);

  // ── Requests State ────────────────────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  // ── Plans State ───────────────────────────────────────────────────────────
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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
    setFormErrors({});
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
    setFormErrors({});
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

  const handleNameKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      setFormErrors((prev) => ({
        ...prev,
        name: "Plan name must contain alphabets only (numbers & symbols are not allowed)."
      }));
    } else {
      if (formErrors.name?.includes("must contain alphabets only")) {
        setFormErrors((prev) => ({ ...prev, name: "" }));
      }
    }
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (/\d/.test(e.key)) {
      e.preventDefault();
      setFormErrors((prev) => ({
        ...prev,
        description: "Description must contain text only (numbers are not allowed)."
      }));
    } else {
      if (formErrors.description?.includes("numbers are not allowed")) {
        setFormErrors((prev) => ({ ...prev, description: "" }));
      }
    }
  };

  const handlePriceKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[\d.]$/.test(e.key)) {
      e.preventDefault();
      setFormErrors((prev) => ({
        ...prev,
        price: "Monthly price must contain numbers and valid decimals only."
      }));
    } else if (e.key === "." && formData.price?.toString().includes(".")) {
      e.preventDefault();
      setFormErrors((prev) => ({
        ...prev,
        price: "Monthly price cannot have multiple decimal points."
      }));
    } else {
      if (formErrors.price?.includes("numbers and valid decimals only") || formErrors.price?.includes("multiple decimal points")) {
        setFormErrors((prev) => ({ ...prev, price: "" }));
      }
    }
  };

  const handleNumberKeyDown = (field, label, e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setFormErrors((prev) => ({
        ...prev,
        [field]: `${label} must contain numbers only.`
      }));
    } else {
      if (formErrors[field]?.includes("numbers only")) {
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      }
    }
  };

  const handleFieldChange = (field, value) => {
    let cleanValue = value;
    let customError = "";

    if (field === "name") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 50);
      if (value !== cleanValue && value.length > 0) {
        customError = "Plan name must contain alphabets only (numbers & symbols are not allowed).";
      }
    } else if (field === "description") {
      cleanValue = value.replace(/\d/g, "").slice(0, 100);
      if (value !== cleanValue && value.length > 0) {
        customError = "Description must contain text only (numbers are not allowed).";
      }
    } else if (field === "price") {
      if (typeof value === "string") {
        cleanValue = value.replace(/[^0-9.]/g, "");
        const parts = cleanValue.split(".");
        if (parts.length > 2) {
          cleanValue = parts[0] + "." + parts.slice(1).join("");
        }
      }
    } else if (field === "featuresText") {
      cleanValue = value.slice(0, 1000);
    } else if (["duration", "displayOrder", "maxVehicles", "maxDrivers", "maxTrips"].includes(field)) {
      if (typeof value === "string") {
        cleanValue = value.replace(/\D/g, "");
      }
    }

    const updated = { ...formData, [field]: cleanValue };
    setFormData(updated);

    if (customError) {
      setFormErrors((prev) => ({ ...prev, [field]: customError }));
    } else {
      const errorMsg = validateField(subscriptionPlanSchema, field, cleanValue, {
        ...updated,
        features: updated.featuresText ? updated.featuresText.split("\n").map((f) => f.trim()).filter(Boolean) : []
      });
      setFormErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleBlur = (field) => {
    const errorMsg = validateField(subscriptionPlanSchema, field, formData[field], {
      ...formData,
      features: formData.featuresText ? formData.featuresText.split("\n").map((f) => f.trim()).filter(Boolean) : []
    });
    setFormErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const validationCheck = validateForm(subscriptionPlanSchema, {
    ...formData,
    features: formData.featuresText ? formData.featuresText.split("\n").map(f => f.trim()).filter(Boolean) : []
  });

  const isSubmitDisabled = !validationCheck.isValid;

  const getSubmitErrorTooltip = () => {
    return Object.values(validationCheck.errors).join(" • ");
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();

    const planPayload = {
      ...formData,
      features: formData.featuresText ? formData.featuresText.split("\n").map(f => f.trim()).filter(Boolean) : []
    };

    const validation = validateForm(subscriptionPlanSchema, planPayload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      const firstMsg = Object.values(validation.errors)[0];
      if (firstMsg) toast.error(firstMsg);
      return;
    }
    setFormErrors({});

    const payload = {
      ...formData,
      name: (formData.name || "").trim(),
      description: (formData.description || "").trim(),
      price: Number(formData.price),
      duration: Number(formData.duration),
      displayOrder: Number(formData.displayOrder) || 1,
      maxVehicles: Number(formData.maxVehicles),
      maxDrivers: Number(formData.maxDrivers),
      maxTrips: Number(formData.maxTrips),
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
      setFormErrors({});
      loadPlans();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to save plan.";
      if (errorMsg.toLowerCase().includes("50 characters") || errorMsg.toLowerCase().includes("plan name") || errorMsg.toLowerCase().includes("name")) {
        setFormErrors(prev => ({ ...prev, name: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("100 characters") || errorMsg.toLowerCase().includes("description")) {
        setFormErrors(prev => ({ ...prev, description: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("driver")) {
        setFormErrors(prev => ({ ...prev, maxDrivers: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("vehicle")) {
        setFormErrors(prev => ({ ...prev, maxVehicles: errorMsg }));
      } else if (errorMsg.toLowerCase().includes("trip")) {
        setFormErrors(prev => ({ ...prev, maxTrips: errorMsg }));
      }
      toast.error(errorMsg);
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
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#A14000] border-t-transparent" />
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
                                <span className={`text-[11px] font-bold flex items-center gap-1 justify-end ${
                                  req.status === 'Approved' ? 'text-green-600' : req.status === 'Rejected' ? 'text-red-500' : 'text-slate-500'
                                }`}>
                                  {req.status === 'Approved' ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                  ) : req.status === 'Rejected' ? (
                                    <X className="w-3.5 h-3.5 text-red-500" />
                                  ) : (
                                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  {req.status || "Processed"}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {plans.map((plan) => {
                    const featuresList = Array.isArray(plan.features)
                      ? plan.features
                      : typeof plan.features === "string"
                        ? plan.features.split("\n").map(f => f.trim()).filter(Boolean)
                        : [];

                    return (
                      <div
                        key={plan._id}
                        className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-[#1E293B] shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between h-full space-y-5"
                      >
                        <div className="space-y-4 flex-1 flex flex-col min-w-0">
                          {/* Plan Header: Name, Status & Action buttons */}
                          <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800 min-h-[52px]">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-base font-black text-[#0f172a] dark:text-white break-words break-all sm:break-words leading-tight line-clamp-2" title={plan.name}>
                                {plan.name}
                              </h3>
                              <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                                plan.status === 'Active' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}>
                                {plan.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 pt-0.5">
                              <button
                                onClick={() => handleOpenEdit(plan)}
                                className="p-1.5 text-slate-400 hover:text-[#a14000] dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit Plan"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePlan(plan._id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Plan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price & Duration */}
                          <div className="space-y-2 min-h-[68px] flex flex-col justify-center">
                            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                              <span className="text-2xl sm:text-3xl font-black font-display text-[#0f172a] dark:text-white break-all">
                                ₹{typeof plan.price === 'number' ? plan.price.toLocaleString('en-IN') : plan.price}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-400 font-bold shrink-0">/ month</span>
                            </div>

                            <div className="inline-flex items-center gap-1.5 text-[10px] text-[#b45309] dark:text-amber-300 font-bold bg-[#FFF3E8] dark:bg-[#A14000]/30 border border-[#b45309]/15 dark:border-[#A14000]/40 px-2.5 py-1 rounded-md max-w-full truncate">
                              <span>Duration: {plan.duration} Days</span>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span>Order #{plan.displayOrder || 1}</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed line-clamp-3 min-h-[44px] break-words" title={plan.description}>
                            {plan.description}
                          </p>

                          {/* Limits Statistics */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                            <div className="min-w-0 space-y-0.5">
                              <span className="block text-sm font-black text-slate-800 dark:text-white truncate" title={String(plan.maxVehicles || 0)}>
                                {plan.maxVehicles >= 9999 ? "Unlimited" : (plan.maxVehicles ?? 0)}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">Vehicles</span>
                            </div>
                            <div className="min-w-0 space-y-0.5 border-x border-slate-200 dark:border-slate-800 px-1">
                              <span className="block text-sm font-black text-slate-800 dark:text-white truncate" title={String(plan.maxDrivers || 0)}>
                                {plan.maxDrivers >= 9999 ? "Unlimited" : (plan.maxDrivers ?? 0)}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">Drivers</span>
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <span className="block text-sm font-black text-slate-800 dark:text-white truncate" title={String(plan.maxTrips || 0)}>
                                {plan.maxTrips >= 9999 ? "Unlimited" : (plan.maxTrips ?? 0)}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider block truncate">Trips</span>
                            </div>
                          </div>

                          {/* Features List */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Features</p>
                            <ul className="space-y-1.5 flex-1 min-w-0">
                              {featuresList.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium min-w-0">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="break-words break-all sm:break-words flex-1 min-w-0 leading-relaxed" title={f}>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                onClick={() => {
                  setShowModal(false);
                  setFormErrors({});
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlan} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Plan Name * <span className="text-slate-400 font-normal lowercase ml-1">({formData.name.length}/50)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={formData.name}
                    onKeyDown={handleNameKeyDown}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                      formErrors.name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-slate-300'
                    }`}
                    placeholder="e.g. Enterprise Plan"
                  />
                  {formErrors.name && (
                    <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.name}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Description * <span className="text-slate-400 font-normal lowercase ml-1">({formData.description.length}/100)</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.description}
                    onKeyDown={handleDescriptionKeyDown}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    onBlur={() => handleBlur("description")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                      formErrors.description 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-slate-300'
                    }`}
                    placeholder="e.g. Best choice for medium sized companies"
                  />
                  {formErrors.description && (
                    <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.description}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Monthly Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    max="10000000"
                    value={formData.price}
                    onKeyDown={handlePriceKeyDown}
                    onChange={(e) => handleFieldChange("price", e.target.value)}
                    onBlur={() => handleBlur("price")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                      formErrors.price 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-slate-300'
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onKeyDown={(e) => handleNumberKeyDown("duration", "Duration", e)}
                    onChange={(e) => handleFieldChange("duration", e.target.value)}
                    onBlur={() => handleBlur("duration")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                      formErrors.duration 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-slate-300'
                    }`}
                  />
                  {formErrors.duration && (
                    <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.duration}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onKeyDown={(e) => handleNumberKeyDown("displayOrder", "Display order", e)}
                    onChange={(e) => handleFieldChange("displayOrder", e.target.value)}
                    onBlur={() => handleBlur("displayOrder")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                      formErrors.displayOrder 
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-slate-300'
                    }`}
                  />
                  {formErrors.displayOrder && (
                    <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.displayOrder}</p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    onBlur={() => handleBlur("status")}
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
                      step="1"
                      min="0"
                      required
                      value={formData.maxVehicles}
                      onKeyDown={(e) => handleNumberKeyDown("maxVehicles", "No of vehicles", e)}
                      onChange={(e) => handleFieldChange("maxVehicles", e.target.value)}
                      onBlur={() => handleBlur("maxVehicles")}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                        formErrors.maxVehicles 
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                          : 'border-slate-200 focus:border-slate-300'
                      }`}
                    />
                    {formErrors.maxVehicles && (
                      <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.maxVehicles}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">No of Drivers *</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={formData.maxDrivers}
                      onKeyDown={(e) => handleNumberKeyDown("maxDrivers", "No of drivers", e)}
                      onChange={(e) => handleFieldChange("maxDrivers", e.target.value)}
                      onBlur={() => handleBlur("maxDrivers")}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                        formErrors.maxDrivers 
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                          : 'border-slate-200 focus:border-slate-300'
                      }`}
                    />
                    {formErrors.maxDrivers && (
                      <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.maxDrivers}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">No of Trips *</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      required
                      value={formData.maxTrips}
                      onKeyDown={(e) => handleNumberKeyDown("maxTrips", "No of trips", e)}
                      onChange={(e) => handleFieldChange("maxTrips", e.target.value)}
                      onBlur={() => handleBlur("maxTrips")}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                        formErrors.maxTrips 
                          ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                          : 'border-slate-200 focus:border-slate-300'
                      }`}
                    />
                    {formErrors.maxTrips && (
                      <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.maxTrips}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Features (One per line) <span className="text-slate-400 font-normal lowercase ml-1">({formData.featuresText.length}/1000)</span>
                    </label>
                  </div>
                  <textarea
                    rows="4"
                    maxLength={1000}
                    value={formData.featuresText}
                    onChange={(e) => handleFieldChange("featuresText", e.target.value)}
                    onBlur={() => handleBlur("featuresText")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none transition-colors ${
                      formErrors.featuresText || formErrors.features
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : 'border-slate-200 focus:border-slate-300'
                    }`}
                    placeholder="Real-time GPS Tracking&#10;Up to 10 Vehicles&#10;Basic Analytics"
                  />
                  {(formErrors.featuresText || formErrors.features) && (
                    <p className="text-[10px] text-red-500 mt-1 leading-tight">{formErrors.featuresText || formErrors.features}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormErrors({});
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div
                  className={`relative group inline-flex items-center ${
                    isSubmitDisabled ? "cursor-not-allowed" : ""
                  }`}
                  title={isSubmitDisabled ? getSubmitErrorTooltip() : ""}
                >
                  {isSubmitDisabled && (
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col items-end pointer-events-none z-50">
                      <div className="bg-[#0f172a] text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap border border-slate-700 max-w-xs text-center">
                        {getSubmitErrorTooltip()}
                      </div>
                      <div className="w-2 h-2 bg-[#0f172a] rotate-45 -mt-1 mr-4 border-r border-b border-slate-700"></div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                      isSubmitDisabled
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none pointer-events-none"
                        : "bg-[#a14000] hover:bg-[#853500] text-white cursor-pointer"
                    }`}
                  >
                    {editingPlan ? "Update Plan" : "Create Plan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
