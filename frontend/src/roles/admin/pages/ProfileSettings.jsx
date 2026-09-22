import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { adminApi } from "@/api/adminApi";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { checkAuth, user, login } = useAuth(); // login to potentially update user session
  const { setAdminProfile } = useAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});

  const isProfileDirty = () => {
    if (!initialForm) return false;
    return (
      form.firstName !== initialForm.firstName ||
      form.lastName !== initialForm.lastName ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      profileFile !== null
    );
  };

  const isPasswordDirty = () => {
    return form.currentPassword !== "" || form.newPassword !== "" || form.confirmNewPassword !== "";
  };

  const isDirty = isProfileDirty() || isPasswordDirty();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await adminApi.getProfile();
        const user = response.data?.data || response.data;
        if (user) {
          const nameParts = (user.name || "").split(" ");
          const profileData = {
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: user.phone ? String(user.phone).replace(/\D/g, '').slice(-10) : ""
          };
          setForm((prev) => ({
            ...prev,
            ...profileData
          }));
          setInitialForm(profileData);
          if (user.profileImage) {
            setProfileUrl(user.profileImage);
          }
        }
      } catch (error) {
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleNameKeyDown = (e) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    if (!/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: `${e.target.name === "firstName" ? "First name" : "Last name"} must contain alphabets only.`
      }));
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) ||
      ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase()))
    ) {
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        phone: "Phone number must contain numbers only."
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let fieldError = "";

    if (name === "firstName") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
      formattedValue = cleaned;
      if (value !== cleaned && value.length > 0) {
        fieldError = "First name must contain alphabets only.";
      } else if (!cleaned.trim()) {
        fieldError = "First name is required.";
      } else if (cleaned.length > 20) {
        fieldError = "First name must not exceed 20 characters.";
      }
    } else if (name === "lastName") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
      formattedValue = cleaned;
      if (value !== cleaned && value.length > 0) {
        fieldError = "Last name must contain alphabets only.";
      } else if (cleaned.length > 20) {
        fieldError = "Last name must not exceed 20 characters.";
      }
    } else if (name === "email") {
      formattedValue = value.slice(0, 30);
      if (!value.trim()) {
        fieldError = "Email address is required.";
      } else if (/\s/.test(value)) {
        fieldError = "Email address must not contain spaces.";
      } else if (value.length > 30) {
        fieldError = "Email address must not exceed 30 characters.";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        fieldError = "Please enter a valid email address.";
      }
    } else if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      formattedValue = cleaned;
      if (value !== cleaned && value.length > 0) {
        fieldError = "Phone number must contain numbers only.";
      } else if (cleaned && cleaned.length !== 10) {
        fieldError = "Phone number must be exactly 10 digits.";
      }
    } else if (name === "currentPassword") {
      formattedValue = value;
      if (isPasswordDirty() && !value) {
        fieldError = "Current password is required.";
      }
    } else if (name === "newPassword") {
      formattedValue = value;
      if (value) {
        if (value.length < 6) fieldError = "Password must be at least 6 characters.";
        else if (!/[A-Z]/.test(value)) fieldError = "Password must contain at least one uppercase letter.";
        else if (!/[0-9]/.test(value)) fieldError = "Password must contain at least one number.";
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) fieldError = "Password must contain at least one special character.";
      }
      if (form.confirmNewPassword && value !== form.confirmNewPassword) {
        setErrors((prev) => ({ ...prev, confirmNewPassword: "Passwords do not match." }));
      } else if (form.confirmNewPassword && value === form.confirmNewPassword) {
        setErrors((prev) => ({ ...prev, confirmNewPassword: "" }));
      }
    } else if (name === "confirmNewPassword") {
      formattedValue = value;
      if (form.newPassword && value !== form.newPassword) {
        fieldError = "Passwords do not match.";
      }
    }

    setForm((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "firstName") {
      if (!value.trim()) setErrors((prev) => ({ ...prev, firstName: "First name is required." }));
      else if (!/^[a-zA-Z\s]+$/.test(value)) setErrors((prev) => ({ ...prev, firstName: "First name must contain alphabets only." }));
      else if (value.length > 20) setErrors((prev) => ({ ...prev, firstName: "First name must not exceed 20 characters." }));
    } else if (name === "lastName") {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) setErrors((prev) => ({ ...prev, lastName: "Last name must contain alphabets only." }));
      else if (value.length > 20) setErrors((prev) => ({ ...prev, lastName: "Last name must not exceed 20 characters." }));
    } else if (name === "email") {
      if (!value.trim()) setErrors((prev) => ({ ...prev, email: "Email address is required." }));
      else if (/\s/.test(value)) setErrors((prev) => ({ ...prev, email: "Email address must not contain spaces." }));
      else if (value.length > 30) setErrors((prev) => ({ ...prev, email: "Email address must not exceed 30 characters." }));
      else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
    } else if (name === "phone") {
      if (value && value.length !== 10) setErrors((prev) => ({ ...prev, phone: "Phone number must be exactly 10 digits." }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First Name
    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(form.firstName)) {
      newErrors.firstName = "First name must contain alphabets only.";
    } else if (form.firstName.length > 20) {
      newErrors.firstName = "First name must not exceed 20 characters.";
    }

    // Last Name
    if (form.lastName && !/^[a-zA-Z\s]+$/.test(form.lastName)) {
      newErrors.lastName = "Last name must contain alphabets only.";
    } else if (form.lastName && form.lastName.length > 20) {
      newErrors.lastName = "Last name must not exceed 20 characters.";
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (/\s/.test(form.email)) {
      newErrors.email = "Email address must not contain spaces.";
    } else if (form.email.length > 30) {
      newErrors.email = "Email address must not exceed 30 characters.";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone (optional or 10 digits)
    if (form.phone && (form.phone.length !== 10 || !/^\d{10}$/.test(form.phone))) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    // Password validation if password fields are used
    if (isPasswordDirty()) {
      if (!form.currentPassword) {
        newErrors.currentPassword = "Current password is required.";
      }
      if (!form.newPassword) {
        newErrors.newPassword = "New password is required.";
      } else {
        if (form.newPassword.length < 6) {
          newErrors.newPassword = "Password must be at least 6 characters.";
        } else if (!/[A-Z]/.test(form.newPassword)) {
          newErrors.newPassword = "Password must contain at least one uppercase letter.";
        } else if (!/[0-9]/.test(form.newPassword)) {
          newErrors.newPassword = "Password must contain at least one number.";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword)) {
          newErrors.newPassword = "Password must contain at least one special character.";
        }
      }
      if (!form.confirmNewPassword) {
        newErrors.confirmNewPassword = "Please confirm your new password.";
      } else if (form.newPassword !== form.confirmNewPassword) {
        newErrors.confirmNewPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please resolve the form errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      
      if (isProfileDirty()) {
        formData.append("name", `${form.firstName} ${form.lastName}`.trim());
        formData.append("email", form.email);
        formData.append("phone", form.phone);
        if (profileFile) {
          formData.append("profileImage", profileFile);
        }
      }
      
      if (isPasswordDirty()) {
        formData.append("currentPassword", form.currentPassword);
        formData.append("newPassword", form.newPassword);
      }

      const response = await adminApi.updateProfile(formData);
      const updatedUser = response.data?.data || response.data;
      
      toast.success("Profile saved successfully!");
      setForm({...form, currentPassword: '', newPassword: '', confirmNewPassword: ''});
      setProfileFile(null); // Clear file since it's uploaded
      
      if (isProfileDirty()) {
        const nameParts = (updatedUser.name || "").split(" ");
        setInitialForm({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: updatedUser.email || "",
          phone: updatedUser.phone || ""
        });
      }
      
      // Update local state image
      if (updatedUser.profileImage) {
        setProfileUrl(updatedUser.profileImage);
      }
      
      // Update top navbar via AdminContext
      setAdminProfile({
        name: updatedUser.name || "",
        avatarUrl: updatedUser.profileImage || ""
      });

      // Refresh the AuthContext
      if (checkAuth) {
        await checkAuth();
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Profile" />
        
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Area with Tabs and Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex sm:inline-flex w-full sm:w-auto items-center p-1 bg-white border border-slate-200 rounded-full shadow-sm overflow-x-auto whitespace-nowrap">
              <Link to="/admin/settings" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                General
              </Link>
              <Link to="/admin/settings/security" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Security
              </Link>
              <Link to="/admin/settings/notifications" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Notifications
              </Link>
              <Link to="/admin/settings/profile" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/reviews" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Reviews
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                About
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
              <button 
                onClick={handleSave}
                disabled={!isDirty || isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-center flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6 max-w-5xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-[#f4f7f6]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#b45309] border-t-transparent rounded-full"></div>
              </div>
            )}
            {/* Admin Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Admin Profile</h3>
              
              {/* Profile Header */}
              <div className="flex items-center gap-5 mb-8">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-xl font-bold overflow-hidden shadow-sm">
                    {profileUrl ? (
                      <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      "SA"
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    id="profile-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProfileFile(e.target.files[0]);
                        setProfileUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }} 
                  />
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => document.getElementById('profile-upload').click()}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#b45309] hover:bg-[#92400e] text-white rounded-full flex items-center justify-center border-2 border-white transition-colors cursor-pointer"
                    style={{ minWidth: '24px', minHeight: '24px', padding: 0, margin: 0 }}
                  >
                    <Upload className="w-3 h-3" />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{form.firstName} {form.lastName}</h4>
                  <p className="text-sm text-slate-500 font-medium mb-1.5">{form.email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-[#A14000]">
                    Super Admin
                  </span>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      name="firstName"
                      maxLength={20}
                      value={form.firstName}
                      onChange={handleChange}
                      onKeyDown={handleNameKeyDown}
                      onBlur={handleBlur}
                      placeholder="e.g. John"
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.firstName ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    {errors.firstName && <p className="text-xs text-red-500 font-medium mt-1">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      maxLength={20}
                      value={form.lastName}
                      onChange={handleChange}
                      onKeyDown={handleNameKeyDown}
                      onBlur={handleBlur}
                      placeholder="e.g. Doe"
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.lastName ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    {errors.lastName && <p className="text-xs text-red-500 font-medium mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      maxLength={30}
                      value={form.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="admin@fleet.com"
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 font-medium mt-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">Phone Number</label>
                    <input 
                      type="tel"
                      inputMode="numeric"
                      name="phone"
                      maxLength={10}
                      value={form.phone}
                      onChange={handleChange}
                      onKeyDown={handlePhoneKeyDown}
                      onBlur={handleBlur}
                      placeholder="10-digit mobile number"
                      className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 font-medium mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Change Password</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-600">
                    Current Password {isPasswordDirty() && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="********"
                      autoComplete="new-password"
                      className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.currentPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500 font-medium mt-1">{errors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">
                      New Password {isPasswordDirty() && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="********"
                        autoComplete="new-password"
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.newPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-red-500 font-medium mt-1">{errors.newPassword}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[13px] font-bold text-slate-600">
                      Confirm New Password {isPasswordDirty() && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        value={form.confirmNewPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="********"
                        autoComplete="new-password"
                        className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all placeholder-slate-400 ${errors.confirmNewPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500' : 'border-slate-200 focus:ring-2 focus:ring-[#b45309]/20 focus:border-[#b45309]'}`}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && <p className="text-xs text-red-500 font-medium mt-1">{errors.confirmNewPassword}</p>}
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
