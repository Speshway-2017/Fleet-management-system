import { useState } from "react";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import { Upload, Eye, EyeOff } from "lucide-react";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { createOrganizationSchema, managerItemSchema, validateForm, validateField } from "@/validations";

export default function AddOrganization() {
  const navigate = useNavigate();
  const { fetchOrganizations, fetchNotifications } = useAdmin();
  const [form, setForm] = useState({
    name: "", industry: "", email: "", phone: "", address: "",
    city: "", state: "", country: "", plan: "", status: ""
  });
  const [managers, setManagers] = useState([
    { name: "", email: "", phone: "", password: "", confirmPassword: "", showPassword: false, showConfirmPassword: false }
  ]);
  const [errors, setErrors] = useState({});
  const [managerErrors, setManagerErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name || "";
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const validExts = ['jpg', 'jpeg', 'png'];
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!validExts.includes(fileExt) && !validTypes.includes(file.type)) {
      setLogoError("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");
      toast.error("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");
      setLogoFile(null);
      setLogoPreview(null);
      e.target.value = "";
      return;
    }

    setLogoError("");
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const handleTextKeyDown = (e, fieldName, fieldLabel) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, [fieldName]: `${fieldLabel} must contain alphabets only (numbers & symbols are not allowed).` }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, phone: "Phone number must contain numbers only (letters are not allowed)." }));
    }
  };

  const handleManagerTextKeyDown = (e, index, field, fieldLabel) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      const newManagerErrors = [...managerErrors];
      if (!newManagerErrors[index]) newManagerErrors[index] = {};
      newManagerErrors[index][field] = `${fieldLabel} must contain alphabets only (numbers & symbols are not allowed).`;
      setManagerErrors(newManagerErrors);
    }
  };

  const handleManagerPhoneKeyDown = (e, index) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      const newManagerErrors = [...managerErrors];
      if (!newManagerErrors[index]) newManagerErrors[index] = {};
      newManagerErrors[index].phone = "Phone number must contain numbers only (letters are not allowed).";
      setManagerErrors(newManagerErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    let customError = "";

    if (['name', 'industry', 'city', 'state', 'country'].includes(name)) {
      if (/[^a-zA-Z\s]/.test(value)) {
        customError = "Numbers and symbols are not allowed in this field.";
        finalValue = value.replace(/[^a-zA-Z\s]/g, "");
      }
    } else if (name === 'phone') {
      if (/\D/.test(value)) {
        customError = "Phone number must contain numbers only.";
        finalValue = value.replace(/\D/g, "").slice(0, 10);
      }
    }

    const updatedForm = { ...form, [name]: finalValue };
    setForm(updatedForm);

    const errorMsg = customError || validateField(createOrganizationSchema, name, finalValue, updatedForm);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleBlur = (fieldName) => {
    const errorMsg = validateField(createOrganizationSchema, fieldName, form[fieldName], form);
    setErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
  };

  const handleManagerChange = (index, field, value) => {
    const newManagers = [...managers];
    const newManagerErrors = [...managerErrors];
    if (!newManagerErrors[index]) newManagerErrors[index] = {};

    let finalValue = value;
    let customError = "";

    if (field === 'name') {
      if (/[^a-zA-Z\s]/.test(value)) {
        customError = "Numbers and symbols are not allowed in full name.";
        finalValue = value.replace(/[^a-zA-Z\s]/g, "");
      }
    } else if (field === 'phone') {
      if (/\D/.test(value)) {
        customError = "Phone number must contain numbers only.";
        finalValue = value.replace(/\D/g, "").slice(0, 10);
      }
    }

    newManagers[index] = { ...newManagers[index], [field]: finalValue };

    let errorMsg = customError || validateField(managerItemSchema, field, finalValue, newManagers[index]);

    if (field === 'password') {
      if (newManagers[index].confirmPassword) {
        newManagerErrors[index].confirmPassword = finalValue !== newManagers[index].confirmPassword ? 'Passwords do not match.' : '';
      }
    } else if (field === 'confirmPassword') {
      if (newManagers[index].password && finalValue && finalValue !== newManagers[index].password) {
        errorMsg = 'Passwords do not match.';
      }
    }

    newManagerErrors[index][field] = errorMsg;

    setManagers(newManagers);
    setManagerErrors(newManagerErrors);
  };

  const handleManagerBlur = (index, field) => {
    const newManagerErrors = [...managerErrors];
    if (!newManagerErrors[index]) newManagerErrors[index] = {};

    let errorMsg = validateField(managerItemSchema, field, managers[index][field], managers[index]);
    if (field === 'confirmPassword' && managers[index].password && managers[index].confirmPassword) {
      if (managers[index].password !== managers[index].confirmPassword) {
        errorMsg = 'Passwords do not match.';
      }
    }
    newManagerErrors[index][field] = errorMsg;
    setManagerErrors(newManagerErrors);
  };

  const addManager = () => {
    setManagers([...managers, { name: "", email: "", phone: "", password: "", confirmPassword: "", showPassword: false, showConfirmPassword: false }]);
    setManagerErrors([...managerErrors, {}]);
  };

  const removeManager = (index) => {
    if (managers.length === 1) return;
    setManagers(managers.filter((_, i) => i !== index));
    setManagerErrors(managerErrors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Organization fields
    const newErrors = {};
    ['name', 'industry', 'email', 'phone', 'address', 'city', 'state', 'country'].forEach((f) => {
      const err = validateField(createOrganizationSchema, f, form[f], form);
      if (err) newErrors[f] = err;
    });

    // 2. Validate Manager fields
    let hasManagerErrors = false;
    let firstManagerError = "";
    const newManagerErrors = managers.map((manager, index) => {
      const mErrors = {};
      ['name', 'email', 'phone', 'password', 'confirmPassword'].forEach((f) => {
        let err = validateField(managerItemSchema, f, manager[f], manager);
        if (f === 'confirmPassword' && manager.password && manager.confirmPassword && manager.password !== manager.confirmPassword) {
          err = 'Passwords do not match.';
        }
        if (err) {
          mErrors[f] = err;
          hasManagerErrors = true;
          if (!firstManagerError) firstManagerError = `Manager #${index + 1}: ${err}`;
        }
      });
      return mErrors;
    });

    setErrors(newErrors);
    setManagerErrors(newManagerErrors);

    const hasOrgErrors = Object.keys(newErrors).length > 0;

    if (hasOrgErrors || hasManagerErrors) {
      const firstOrgError = Object.values(newErrors)[0];
      toast.error(firstOrgError || firstManagerError || "Please fix all errors before submitting.");
      return;
    }

    setIsSubmitting(true);
    
    let payload = {
      ...form,
      managers: managers.map(m => ({ name: m.name, email: m.email, phone: m.phone, password: m.password }))
    };
    
    if (logoFile) {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      formData.append('managers', JSON.stringify(payload.managers));
      formData.append('logo', logoFile);
      payload = formData;
    }
    
    try {
      await adminApi.createOrganization(payload);
      toast.success("Organization created successfully!");
      if (fetchOrganizations) await fetchOrganizations(); // Refresh the list
      if (fetchNotifications) await fetchNotifications(); // Refresh notifications
      
      // Reset form state and sensitive credentials
      setForm({
        name: "", industry: "", email: "", phone: "", address: "",
        city: "", state: "", country: "", plan: "", status: ""
      });
      setManagers([
        { name: "", email: "", phone: "", password: "", confirmPassword: "", showPassword: false, showConfirmPassword: false }
      ]);
      setLogoFile(null);
      setLogoPreview(null);
      setErrors({});
      setManagerErrors([]);

      navigate("/admin/organizations");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="organizations" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Organizations" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Tabs */}
          <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full mb-8 shadow-sm">
            <Link to="/admin/organizations" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">List</span>
              <span className="hidden sm:inline">Organization List</span>
            </Link>
            <button className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 bg-[#0f172a] text-white text-[10px] sm:text-sm font-bold rounded-full shadow-sm whitespace-nowrap">
              <span className="sm:hidden">Add Org</span>
              <span className="hidden sm:inline">Add Organization</span>
            </button>
            <Link to="/admin/organizations/details" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Details</span>
              <span className="hidden sm:inline">Organization Details</span>
            </Link>
            <Link to="/admin/organizations/edit" className="flex-1 sm:flex-none text-center px-1 sm:px-6 py-2 sm:py-2.5 text-[10px] sm:text-sm font-bold text-slate-600 hover:text-slate-900 rounded-full transition-colors whitespace-nowrap">
              <span className="sm:hidden">Edit Org</span>
              <span className="hidden sm:inline">Edit Organization</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Hidden dummy fields to prevent browser credential autofill */}
            <input type="text" name="fake_username_remembered" style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none", zIndex: -1 }} tabIndex="-1" readOnly aria-hidden="true" />
            <input type="password" name="fake_password_remembered" style={{ position: "absolute", opacity: 0, height: 0, width: 0, pointerEvents: "none", zIndex: -1 }} tabIndex="-1" readOnly aria-hidden="true" />

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-lg font-bold text-slate-800">Add New Organization</h2>
              <div className="flex flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link to="/admin/organizations" className="flex-1 sm:flex-none flex items-center justify-center px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-[#A14000] border border-[#A14000] bg-transparent hover:bg-[#A14000]/10 rounded-lg transition-colors text-center truncate">
                  Cancel
                </Link>
                <button type="submit" disabled={isSubmitting} className="flex-[2] sm:flex-none px-2 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#A14000] border border-[#A14000] rounded-lg shadow-sm hover:bg-[#8a3700] transition-colors text-center truncate disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Organization Information</h3>
              <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                
                {/* Logo Upload */}
                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-xs font-bold text-slate-700 block">Organization Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">LOGO</span>
                      )}
                    </div>
                    <label className="cursor-pointer px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                        className="hidden" 
                        onChange={handleLogoChange} 
                      />
                    </label>
                  </div>
                  {logoError && <p className="text-xs text-red-500 font-medium mt-1">{logoError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Org Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      maxLength={20}
                      autoComplete="off"
                      placeholder="Organization Name"
                      value={form.name}
                      onKeyDown={(e) => handleTextKeyDown(e, 'name', 'Organization name')}
                      onBlur={() => handleBlur('name')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
                  </div>
                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="industry"
                      maxLength={20}
                      autoComplete="off"
                      placeholder="Industry"
                      value={form.industry}
                      onKeyDown={(e) => handleTextKeyDown(e, 'industry', 'Industry')}
                      onBlur={() => handleBlur('industry')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.industry ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.industry && <p className="text-xs text-red-500 mt-1 font-medium">{errors.industry}</p>}
                  </div>
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      maxLength={30}
                      autoComplete="off"
                      placeholder="Email Address"
                      value={form.email}
                      onBlur={() => handleBlur('email')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                  </div>
                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={10}
                      autoComplete="off"
                      placeholder="Phone Number (10 digits)"
                      value={form.phone}
                      onKeyDown={handlePhoneKeyDown}
                      onBlur={() => handleBlur('phone')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.phone}</p>}
                  </div>
                  {/* Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      maxLength={30}
                      autoComplete="off"
                      placeholder="Street Address (5-30 chars)"
                      value={form.address}
                      onBlur={() => handleBlur('address')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.address ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>}
                  </div>
                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      maxLength={20}
                      autoComplete="off"
                      placeholder="City"
                      value={form.city}
                      onKeyDown={(e) => handleTextKeyDown(e, 'city', 'City')}
                      onBlur={() => handleBlur('city')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.city ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1 font-medium">{errors.city}</p>}
                  </div>
                  {/* State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      maxLength={20}
                      autoComplete="off"
                      placeholder="State"
                      value={form.state}
                      onKeyDown={(e) => handleTextKeyDown(e, 'state', 'State')}
                      onBlur={() => handleBlur('state')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.state ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.state && <p className="text-xs text-red-500 mt-1 font-medium">{errors.state}</p>}
                  </div>
                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      maxLength={20}
                      autoComplete="off"
                      placeholder="Country"
                      value={form.country}
                      onKeyDown={(e) => handleTextKeyDown(e, 'country', 'Country')}
                      onBlur={() => handleBlur('country')}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${errors.country ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                    />
                    {errors.country && <p className="text-xs text-red-500 mt-1 font-medium">{errors.country}</p>}
                  </div>
                </div>

              </div>
            </div>

            {/* Fleet Managers Section */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Add Fleet Manager(s)</h3>
              </div>
              
              <div className="space-y-6">
                {managers.map((manager, index) => {
                  const mErr = managerErrors[index] || {};
                  return (
                    <div key={index} className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative">
                      {managers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeManager(index)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
                        {/* Manager Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={20}
                            autoComplete="off"
                            value={manager.name}
                            onKeyDown={(e) => handleManagerTextKeyDown(e, index, 'name', 'Full name')}
                            onBlur={() => handleManagerBlur(index, 'name')}
                            onChange={(e) => handleManagerChange(index, 'name', e.target.value)}
                            placeholder="Full Name"
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${mErr.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                          />
                          {mErr.name && <p className="text-xs text-red-500 mt-1 font-medium">{mErr.name}</p>}
                        </div>
                        {/* Manager Email */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            maxLength={30}
                            autoComplete="off"
                            value={manager.email}
                            onBlur={() => handleManagerBlur(index, 'email')}
                            onChange={(e) => handleManagerChange(index, 'email', e.target.value)}
                            placeholder="Email Address"
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${mErr.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                          />
                          {mErr.email && <p className="text-xs text-red-500 mt-1 font-medium">{mErr.email}</p>}
                        </div>
                        {/* Manager Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            autoComplete="off"
                            value={manager.phone}
                            onKeyDown={(e) => handleManagerPhoneKeyDown(e, index)}
                            onBlur={() => handleManagerBlur(index, 'phone')}
                            onChange={(e) => handleManagerChange(index, 'phone', e.target.value)}
                            placeholder="Phone Number (10 digits)"
                            className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 ${mErr.phone ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                          />
                          {mErr.phone && <p className="text-xs text-red-500 mt-1 font-medium">{mErr.phone}</p>}
                        </div>
                        {/* Role (Read Only) */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">Role</label>
                          <input type="text" value="Fleet Manager" disabled className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-500 bg-slate-100 cursor-not-allowed" />
                        </div>
                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={manager.showPassword ? "text" : "password"}
                              maxLength={50}
                              autoComplete="new-password"
                              value={manager.password}
                              onBlur={() => handleManagerBlur(index, 'password')}
                              onChange={(e) => handleManagerChange(index, 'password', e.target.value)}
                              placeholder="Create Password (min 6 chars)"
                              className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 pr-10 ${mErr.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleManagerChange(index, 'showPassword', !manager.showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {manager.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {mErr.password && <p className="text-xs text-red-500 mt-1 font-medium">{mErr.password}</p>}
                        </div>
                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={manager.showConfirmPassword ? "text" : "password"}
                              maxLength={50}
                              autoComplete="new-password"
                              value={manager.confirmPassword}
                              onBlur={() => handleManagerBlur(index, 'confirmPassword')}
                              onChange={(e) => handleManagerChange(index, 'confirmPassword', e.target.value)}
                              placeholder="Confirm Password"
                              className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all bg-slate-50/50 pr-10 ${mErr.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-[#A14000]/20 focus:border-[#A14000]'}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleManagerChange(index, 'showConfirmPassword', !manager.showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {manager.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {mErr.confirmPassword && <p className="text-xs text-red-500 mt-1 font-medium">{mErr.confirmPassword}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addManager}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 font-medium hover:border-[#A14000] hover:text-[#A14000] hover:bg-orange-50 transition-colors"
                >
                  + Add Another Fleet Manager
                </button>
              </div>
            </div>

            {/* Logo Upload Section */}
            <div className="mb-8">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Logo Upload</h3>
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                
                <label className="w-full max-w-md border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#A14000]/50 transition-colors cursor-pointer group relative overflow-hidden">
                  <input type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="" />
                  {logoPreview ? (
                    <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none">
                      <img src={logoPreview} alt="Logo Preview" className="max-h-32 object-contain mb-4" />
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Click to change logo
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-[#A14000]/10 transition-colors pointer-events-none">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#A14000]" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 mb-1 pointer-events-none">
                        Drag & drop logo here or <span className="text-[#A14000]">browse</span>
                      </p>
                      <p className="text-xs text-slate-400 pointer-events-none">
                        PNG, JPG up to 5MB
                      </p>
                    </>
                  )}
                </label>

              </div>
            </div>

          </form>
          
        </main>
      </div>
    </div>
  );
}
