import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Camera,
  Mail,
  Phone,
  User,
  Briefcase,
  MapPin,
  Loader,
  AlertCircle,
  Save
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { managerApi } from "../api/managerApi";
import { vehicleApi } from "@/api/vehicleApi";
import { managerProfileSchema, validateForm } from "@/validations";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const host = apiBase.replace(/\/api\/?$/, "");
  return `${host}${url}`;
};

export default function EditProfilePage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [primaryHub, setPrimaryHub] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validateProfileField = (name, value) => {
    let errorMsg = "";
    const strVal = String(value ?? "").trim();

    if (name === "fullName") {
      if (!strVal) {
        errorMsg = "Full Name is required.";
      } else if (/\d/.test(strVal)) {
        errorMsg = "Full Name must contain letters only (numbers are not allowed).";
      } else if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) {
        errorMsg = "Full Name contains invalid characters.";
      } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z]{2,4})\1{2,}/i.test(strVal.replace(/[\s.'-]+/g, ''))) {
        errorMsg = "Repeated characters are not allowed.";
      } else if (strVal.length < 2) {
        errorMsg = "Full Name must be at least 2 characters.";
      } else if (strVal.length > 50) {
        errorMsg = "Full Name must not exceed 50 characters.";
      }
    } else if (name === "email") {
      if (!strVal) {
        errorMsg = "Email address is required.";
      } else if (/\s/.test(strVal)) {
        errorMsg = "Email address must not contain spaces.";
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(strVal)) {
        errorMsg = "Please enter a valid email address.";
      } else if (strVal.length < 5) {
        errorMsg = "Email address must be at least 5 characters.";
      } else if (strVal.length > 80) {
        errorMsg = "Email address must not exceed 80 characters.";
      }
    } else if (name === "phone") {
      if (strVal) {
        if (!/^\d+$/.test(strVal)) {
          errorMsg = "Phone number must contain digits only.";
        } else if (!/^[1-9]/.test(strVal)) {
          errorMsg = "Phone number must start with 1-9 (cannot start with 0).";
        } else if (/(.)\1{5,}/.test(strVal)) {
          errorMsg = "Repeated digits are not allowed.";
        } else if (strVal.length !== 10) {
          errorMsg = "Phone number must be exactly 10 digits.";
        }
      }
    } else if (name === "jobTitle") {
      if (strVal) {
        if (/\d/.test(strVal)) {
          errorMsg = "Job Title must contain letters only (numbers are not allowed).";
        } else if (!/^[a-zA-Z\s.'-]+$/.test(strVal)) {
          errorMsg = "Job Title contains invalid characters.";
        } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z]{2,4})\1{2,}/i.test(strVal.replace(/[\s.'-]+/g, ''))) {
          errorMsg = "Repeated characters are not allowed.";
        } else if (strVal.length < 2) {
          errorMsg = "Job Title must be at least 2 characters.";
        } else if (strVal.length > 50) {
          errorMsg = "Job Title must not exceed 50 characters.";
        }
      }
    } else if (name === "primaryHub") {
      if (strVal) {
        if (/\d/.test(strVal)) {
          errorMsg = "Primary Hub must contain letters only (numbers are not allowed).";
        } else if (!/^[a-zA-Z\s,.'&/\-]+$/.test(strVal)) {
          errorMsg = "Primary Hub contains invalid characters.";
        } else if (/(.)\1{3,}/i.test(strVal) || /([a-zA-Z]{2,4})\1{2,}/i.test(strVal.replace(/[\s,.'&/\-]+/g, ''))) {
          errorMsg = "Repeated characters are not allowed.";
        } else if (strVal.length < 2) {
          errorMsg = "Primary Hub must be at least 2 characters.";
        } else if (strVal.length > 100) {
          errorMsg = "Primary Hub must not exceed 100 characters.";
        }
      }
    }
    return errorMsg;
  };

  const handleFieldChange = (name, value) => {
    if (name === "fullName") setFullName(value);
    else if (name === "email") setEmail(value);
    else if (name === "phone") setPhone(value);
    else if (name === "jobTitle") setJobTitle(value);
    else if (name === "primaryHub") setPrimaryHub(value);

    const err = validateProfileField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleFieldBlur = (name, value) => {
    const err = validateProfileField(name, value);
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await managerApi.getProfile();
        const data = res.data?.data || res.data;
        if (data) {
          setFullName(data.name || user?.name || "");
          setEmail(data.email || user?.email || "");
          setPhone(data.phone || "");
          setJobTitle(data.jobTitle || "");
          setPrimaryHub(data.primaryHub || "");
          setProfileImage(data.profileImage || "");
        }
      } catch (err) {
        console.error("Failed to load profile details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();

    const fields = [
      { name: "fullName", value: fullName },
      { name: "email", value: email },
      { name: "phone", value: phone },
      { name: "jobTitle", value: jobTitle },
      { name: "primaryHub", value: primaryHub }
    ];

    const newErrors = {};
    let hasError = false;

    fields.forEach(({ name, value }) => {
      const err = validateProfileField(name, value);
      if (err) {
        newErrors[name] = err;
        hasError = true;
      }
    });

    setErrors(newErrors);

    if (hasError) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError || "Please fix validation errors");
      return;
    }

    const result = validateForm(managerProfileSchema, {
      name: fullName,
      email,
      phone: phone || null,
      jobTitle: jobTitle || null,
      primaryHub: primaryHub || null
    });

    if (!result.isValid) {
      const firstError = Object.values(result.errors)[0];
      toast.error(firstError || "Please fix profile validation errors");
      return;
    }

    try {
      setSaving(true);
      await managerApi.updateProfile({
        name: fullName,
        email,
        phone,
        jobTitle,
        primaryHub,
        profileImage
      });
      
      // Update local storage user credentials mapping
      const updatedUser = { ...user, name: fullName, email, profileImage, jobTitle, primaryHub };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (refreshProfile) {
        await refreshProfile().catch(err => console.error("refreshProfile failed", err));
      }

      toast.success("Profile updated successfully in database!");
      navigate("/manager/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, JPEG, PNG images allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB allowed.");
      return;
    }

    const uploadToast = toast.loading("Uploading image...");
    try {
      const response = await vehicleApi.uploadDocument(file);
      const data = response.data?.data || response.data;
      if (data?.url) {
        setProfileImage(data.url);
        toast.success("Profile image uploaded successfully!", { id: uploadToast });
      } else {
        toast.error("Upload failed", { id: uploadToast });
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || "Failed to upload image.";
      toast.error(errMsg, { id: uploadToast });
    }
  };

  const getInitials = (name) => {
    if (!name) return "FM";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in font-nunito text-gray-800">
      <Breadcrumb />
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7EAF0] pb-6">
        <div>
          <h1 className="font-poppins font-bold text-[28px] sm:text-[32px] text-[#1E293B] leading-tight">
            Edit Profile
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-1 font-medium">
            Manage your account settings and credentials in the database.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/manager/profile")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold text-[#1E293B] transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4 text-[#64748B]" />
          Back to Profile
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: PHOTO & SUMMARY CARD */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#E7EAF0] rounded-2xl p-6 shadow-sm flex flex-col items-center text-center overflow-hidden w-full">
            <div className="relative shrink-0">
              {profileImage ? (
                <img
                  src={getImageUrl(profileImage)}
                  alt={fullName || "Profile"}
                  className="w-24 h-24 rounded-full object-cover shadow-sm shrink-0 border-2 border-white ring-2 ring-[#E7EAF0]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#A14000] to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-sm shrink-0 select-none ring-2 ring-[#E7EAF0]">
                  {getInitials(fullName)}
                </div>
              )}
              <label 
                className="absolute bottom-0 right-0 p-2 bg-[#A14000] text-white rounded-full border-2 border-white shadow cursor-pointer hover:bg-[#853400] transition-transform hover:scale-105"
                title="Upload Profile Picture"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="w-full mt-4 px-2 overflow-hidden">
              <h3 className="font-poppins font-bold text-base text-[#1E293B] leading-snug break-words max-w-full text-center">
                {fullName || "—"}
              </h3>
              <p className="text-xs font-medium text-[#64748B] mt-1 break-all max-w-full text-center">
                {email || "—"}
              </p>
              {jobTitle && (
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-amber-50 text-[#A14000] border border-amber-200/60 rounded-full text-[11px] font-bold font-poppins break-words max-w-full">
                    {jobTitle}
                  </span>
                </div>
              )}
            </div>

            <div className="w-full mt-6 pt-5 border-t border-[#E7EAF0] text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[#64748B] font-medium font-poppins">Role</span>
                <span className="font-bold text-[#1E293B] uppercase tracking-wider text-[11px] font-poppins">Fleet Manager</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-[#64748B] font-medium font-poppins">Account Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FORM FIELDS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#E7EAF0] rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
            <div className="border-b border-[#E7EAF0] pb-3.5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center text-[#A14000]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-poppins font-bold text-sm text-[#1E293B]">Personal & Job Information</h3>
                <p className="text-[11px] text-[#64748B] font-medium font-poppins">Update your profile identity and contact information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block font-poppins">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={50}
                    required
                    value={fullName}
                    onChange={(e) => handleFieldChange("fullName", e.target.value)}
                    onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                      errors.fullName ? "border-red-500 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                    }`}
                    placeholder="e.g. Alex Thompson"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block font-poppins">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    maxLength={80}
                    required
                    value={email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    onBlur={(e) => handleFieldBlur("email", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                      errors.email ? "border-red-500 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                    }`}
                    placeholder="manager@fleet.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block font-poppins">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value.replace(/\D/g, ''))}
                    onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                      errors.phone ? "border-red-500 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                    }`}
                    placeholder="e.g. 9876543210"
                  />
                </div>
                {errors.phone && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block font-poppins">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={50}
                    value={jobTitle}
                    onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
                    onBlur={(e) => handleFieldBlur("jobTitle", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                      errors.jobTitle ? "border-red-500 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                    }`}
                    placeholder="e.g. Senior Fleet Manager"
                  />
                </div>
                {errors.jobTitle && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.jobTitle}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block font-poppins">
                Primary Hub / Region
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  maxLength={100}
                  value={primaryHub}
                  onChange={(e) => handleFieldChange("primaryHub", e.target.value)}
                  onBlur={(e) => handleFieldBlur("primaryHub", e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 h-[42px] bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#A14000]/20 transition-all font-poppins ${
                    errors.primaryHub ? "border-red-500 focus:border-red-500 text-[#1E293B]" : "border-[#E7EAF0] focus:border-[#A14000] text-[#1E293B]"
                  }`}
                  placeholder="e.g. Mumbai Corporate Hub, Maharashtra"
                />
              </div>
              {errors.primaryHub && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1 font-poppins">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.primaryHub}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-5 border-t border-[#E7EAF0] justify-end">
              <button
                type="button"
                onClick={() => navigate("/manager/profile")}
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 border border-[#E7EAF0] rounded-xl text-xs font-bold transition-all cursor-pointer text-[#64748B] font-poppins text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#A14000] hover:bg-[#853400] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm border-none disabled:opacity-50 flex items-center justify-center gap-2 font-poppins"
              >
                {saving ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Details...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
