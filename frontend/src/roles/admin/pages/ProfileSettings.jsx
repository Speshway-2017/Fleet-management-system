import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/roles/admin/context/AdminContext";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import { adminApi } from "@/api/adminApi";
import { adminProfileSchema, validateField, validateForm } from "@/validations";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { checkAuth, user, login } = useAuth();
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
    return Boolean(form.currentPassword || form.newPassword || form.confirmNewPassword);
  };

  const isDirty = isProfileDirty() || isPasswordDirty();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
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
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      const label = e.target.name === "firstName" ? "First name" : "Last name";
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: `${label} must contain alphabets only (numbers & symbols are not allowed).`
      }));
    } else {
      if (errors[e.target.name]?.includes("must contain alphabets only")) {
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
      }
    }
  };

  const handlePhoneKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        phone: "Phone number must contain numbers only (letters are not allowed)."
      }));
    } else {
      if (errors.phone?.includes("must contain numbers only")) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    let customError = "";

    if (name === "firstName") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
      formattedValue = cleaned;
      if (value !== cleaned && value.length > 0) {
        customError = "First name must contain alphabets only (numbers & symbols are not allowed).";
      }
    } else if (name === "lastName") {
      const cleaned = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 20);
      formattedValue = cleaned;
      if (value !== cleaned && value.length > 0) {
        customError = "Last name must contain alphabets only (numbers & symbols are not allowed).";
      }
    } else if (name === "email") {
      formattedValue = value.slice(0, 30);
      if (/\s/.test(value)) {
        customError = "Email address must not contain spaces.";
      }
    } else if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 10);
      formattedValue = cleaned;
      if (value !== cleaned && value.length > 0) {
        customError = "Phone number must contain numbers only (letters are not allowed).";
      }
    } else if (name === "newPassword" || name === "confirmNewPassword" || name === "currentPassword") {
      formattedValue = value.slice(0, 50);
    }

    const updatedForm = { ...form, [name]: formattedValue };
    setForm(updatedForm);

    if (customError) {
      setErrors((prev) => ({ ...prev, [name]: customError }));
    } else {
      const fieldError = validateField(adminProfileSchema, name, formattedValue, updatedForm);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(adminProfileSchema, name, value, form);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleProfileImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      const validExts = /\.(jpg|jpeg|png)$/i;

      if (!validTypes.includes(file.type) && !validExts.test(file.name)) {
        setErrors(prev => ({ ...prev, profileImage: "Invalid file type. Only JPG, JPEG, and PNG files are allowed." }));
        toast.error("Invalid file type. Only JPG, JPEG, and PNG files are allowed.");
        e.target.value = "";
        return;
      }
      setErrors(prev => ({ ...prev, profileImage: "" }));
      setProfileFile(file);
      setProfileUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const { isValid, errors: validationErrors } = validateForm(adminProfileSchema, form);

    if (!isValid) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please fix all validation errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      
      formData.append("name", `${form.firstName} ${form.lastName}`.trim());
      formData.append("email", form.email.trim());
      if (form.phone) {
        formData.append("phone", form.phone.trim());
      }
      if (profileFile) {
        formData.append("profileImage", profileFile);
      }
      
      if (isPasswordDirty()) {
        formData.append("currentPassword", form.currentPassword);
        formData.append("newPassword", form.newPassword);
      }

      const response = await adminApi.updateProfile(formData);
      const updatedUser = response.data?.data || response.data;
      
      toast.success("Profile updated successfully!");
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
      setProfileFile(null);
      setErrors({});
      
      const nameParts = (updatedUser.name || "").split(" ");
      setInitialForm({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || ""
      });
      
      if (updatedUser.profileImage) {
        setProfileUrl(updatedUser.profileImage);
      }
      
      setAdminProfile({
        name: updatedUser.name || "",
        avatarUrl: updatedUser.profileImage || ""
      });

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

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#a14000] hover:bg-[#853400] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6 max-w-5xl relative">
            {isLoading && (
              <div className="absolute inset-0 bg-[#f4f7f6]/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#a14000] border-t-transparent rounded-full"></div>
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
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                    onChange={handleProfileImageChange} 
                  />
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => document.getElementById('profile-upload').click()}
                    className="absolute bottom-0 right-0 w-6 h-6 bg-[#a14000] hover:bg-[#853400] text-white rounded-full flex items-center justify-center border-2 border-white transition-colors cursor-pointer"
                    style={{ minWidth: '24px', minHeight: '24px', padding: 0, margin: 0 }}
                  >
                    <Upload className="w-3 h-3" />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-slate-800">{form.firstName ? `${form.firstName} ${form.lastName}` : "Super Admin"}</h4>
                  <p className="text-xs text-slate-500">{form.email || "admin@fleetcommand.io"}</p>
                  <p className="text-[11px] font-semibold text-[#a14000] mt-0.5">Platform Super Administrator</p>
                  {errors.profileImage && <p className="text-xs text-red-500 font-medium mt-1">{errors.profileImage}</p>}
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">First Name *</label>
                  <input 
                    type="text" 
                    name="firstName"
                    maxLength={20}
                    value={form.firstName}
                    onKeyDown={handleNameKeyDown}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Super (2-20 chars)" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                      errors.firstName ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                    }`}
                  />
                  {errors.firstName && <p className="text-xs text-red-500 font-medium">{errors.firstName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    maxLength={20}
                    value={form.lastName}
                    onKeyDown={handleNameKeyDown}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Admin (Max 20 chars)" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                      errors.lastName ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                    }`}
                  />
                  {errors.lastName && <p className="text-xs text-red-500 font-medium">{errors.lastName}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    maxLength={30}
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="admin@fleetcommand.io (5-30 chars)" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                      errors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                    }`}
                  />
                  {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onKeyDown={handlePhoneKeyDown}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="10-digit mobile number" 
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                      errors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                    }`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[15px] font-extrabold text-slate-800 mb-2">Change Password</h3>
              <p className="text-xs text-slate-500 mb-6">Leave blank if you do not wish to change your password.</p>
              
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-bold text-slate-600">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      name="currentPassword"
                      maxLength={50}
                      value={form.currentPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="••••••••" 
                      className={`w-full pl-4 pr-10 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                        errors.currentPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                      }`}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500 font-medium">{errors.currentPassword}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        name="newPassword"
                        maxLength={50}
                        value={form.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="•••••••• (6-50 chars)" 
                        className={`w-full pl-4 pr-10 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                          errors.newPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="text-xs text-red-500 font-medium">{errors.newPassword}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-bold text-slate-600">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        name="confirmNewPassword"
                        maxLength={50}
                        value={form.confirmNewPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="••••••••" 
                        className={`w-full pl-4 pr-10 py-2.5 bg-white border rounded-lg text-sm text-slate-800 focus:outline-none transition-all ${
                          errors.confirmNewPassword ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 focus:ring-2 focus:ring-[#a14000]/20 focus:border-[#a14000]'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmNewPassword && <p className="text-xs text-red-500 font-medium">{errors.confirmNewPassword}</p>}
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
