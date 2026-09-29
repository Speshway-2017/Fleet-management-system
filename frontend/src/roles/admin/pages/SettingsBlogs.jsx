import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NewAdminSidebar from "@/components/layout/NewAdminSidebar";
import NewAdminTopNav from "@/components/layout/NewAdminTopNav";
import toast from "react-hot-toast";
import { adminApi } from "@/api/adminApi";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { blogSchema, validateField, validateForm } from "@/validations";

export default function SettingsBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Operations",
    summary: "",
    content: "",
    image: "",
    readTime: "5 min read",
    date: ""
  });
  const [errors, setErrors] = useState({});

  const loadBlogs = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getBlogs();
      setBlogs(res.data?.data || []);
    } catch (error) {
      toast.error("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      category: "Operations",
      summary: "",
      content: "",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      readTime: "5 min read",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      category: blog.category || "Operations",
      summary: blog.summary || "",
      content: Array.isArray(blog.content) ? blog.content.join("\n\n") : (blog.content || ""),
      image: blog.image || "",
      readTime: blog.readTime || "5 min read",
      date: blog.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await adminApi.deleteBlog(id);
      toast.success("Blog deleted successfully!");
      loadBlogs();
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const handleFieldChange = (field, value) => {
    let cleanValue = value;
    let customError = "";

    if (field === "title") {
      cleanValue = value.replace(/[^a-zA-Z\s]/g, "").slice(0, 100);
      if (value !== cleanValue && value.length > 0) {
        customError = "Title must contain alphabets only (numbers & symbols are not allowed).";
      }
    } else if (field === "readTime") {
      cleanValue = value.slice(0, 20);
    } else if (field === "image") {
      cleanValue = value.slice(0, 300);
    } else if (field === "summary") {
      cleanValue = value.slice(0, 250);
    } else if (field === "content") {
      cleanValue = value.slice(0, 5000);
    }

    const updated = { ...formData, [field]: cleanValue };
    setFormData(updated);

    if (customError) {
      setErrors(prev => ({ ...prev, [field]: customError }));
    } else {
      const fieldError = validateField(blogSchema, field, cleanValue, updated);
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
      setErrors(prev => ({ ...prev, title: "Title must contain alphabets only (numbers & symbols are not allowed)." }));
    } else {
      if (errors.title?.includes("must contain alphabets only")) {
        setErrors(prev => ({ ...prev, title: "" }));
      }
    }
  };

  const handleBlur = (field) => {
    const fieldError = validateField(blogSchema, field, formData[field], formData);
    setErrors(prev => ({ ...prev, [field]: fieldError }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { isValid, errors: validationErrors } = validateForm(blogSchema, formData);
    if (!isValid) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError || "Please fix all validation errors before publishing.");
      return;
    }

    // Split content by double or single newlines into paragraphs
    const paragraphs = formData.content
      .split(/\n+/)
      .map(p => p.trim())
      .filter(Boolean);

    const payload = {
      ...formData,
      content: paragraphs
    };

    setIsSubmitting(true);
    try {
      if (editingBlog) {
        await adminApi.updateBlog(editingBlog._id, payload);
        toast.success("Blog updated successfully!");
      } else {
        await adminApi.createBlog(payload);
        toast.success("Blog created successfully!");
      }
      setShowModal(false);
      loadBlogs();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save blog";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-[#f4f7f6] flex font-sans">
      <NewAdminSidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col min-w-0">
        <NewAdminTopNav title="Platform Blogs Settings" />
        
        <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          
          {/* Header Tabs */}
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
              <Link to="/admin/settings/profile" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Profile
              </Link>
              <Link to="/admin/settings/reviews" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                Reviews
              </Link>
              <Link to="/admin/settings/blogs" className="px-5 py-2 bg-[#0f172a] text-white text-xs font-bold rounded-full shadow-sm transition-colors">
                Blogs
              </Link>
              <Link to="/admin/settings/about" className="px-5 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold rounded-full transition-colors">
                About
              </Link>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#a14000] hover:bg-[#853500] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Blog
            </button>
          </div>

          {/* Blogs Content */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                <div className="animate-spin w-8 h-8 border-4 border-[#a14000] border-t-transparent rounded-full"></div>
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[15px] font-extrabold text-slate-800">Published Blog Articles</h3>
                <p className="text-xs text-slate-500">Manage all articles visible on the public fleet blog page.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                {blogs.length} {blogs.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>

            {blogs.length === 0 && !isLoading ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-sm font-bold text-slate-400">No blog articles published yet.</p>
                <button
                  onClick={handleOpenAdd}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#a14000] hover:underline"
                >
                  <Plus className="w-4 h-4" /> Write your first article
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {blogs.map((blog) => (
                  <div
                    key={blog._id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md transition-shadow"
                  >
                    <div className="h-44 w-full bg-slate-100 relative overflow-hidden shrink-0">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-wider text-slate-800 rounded-lg shadow-sm">
                        {blog.category}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
                        <span>{blog.date}</span>
                        <span>{blog.readTime}</span>
                      </div>

                      <h4
                        className="text-sm font-bold text-slate-900 mb-2 line-clamp-2"
                        title={blog.title}
                      >
                        {blog.title}
                      </h4>

                      <p
                        className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1"
                        title={blog.summary}
                      >
                        {blog.summary}
                      </p>

                      <div className="flex justify-end gap-2 pt-4 mt-auto border-t border-slate-100 shrink-0">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-[#a14000] hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-base font-extrabold text-[#0f172a]">
                {editingBlog ? "Edit Blog Article" : "Write New Blog Article"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Title *</label>
                  <span className="text-[10px] text-slate-400">{formData.title.length}/100</span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.title}
                  onKeyDown={handleTitleKeyDown}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  onBlur={() => handleBlur("title")}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                    errors.title ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                  }`}
                  placeholder="e.g. How Fleet Command Optimizes Routes (3-100 chars)"
                />
                {errors.title && <p className="text-[11px] text-red-500 font-medium">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                    onBlur={() => handleBlur("category")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all cursor-pointer ${
                      errors.category ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                  >
                    <option value="Operations">Operations</option>
                    <option value="Security">Security</option>
                    <option value="Technology">Technology</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Business">Business</option>
                  </select>
                  {errors.category && <p className="text-[11px] text-red-500 font-medium">{errors.category}</p>}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Read Time (Est) *</label>
                    <span className="text-[10px] text-slate-400">{formData.readTime.length}/20</span>
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={formData.readTime}
                    onChange={(e) => handleFieldChange("readTime", e.target.value)}
                    onBlur={() => handleBlur("readTime")}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                      errors.readTime ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                    }`}
                    placeholder="e.g. 5 min read"
                  />
                  {errors.readTime && <p className="text-[11px] text-red-500 font-medium">{errors.readTime}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Banner Image URL *</label>
                  <span className="text-[10px] text-slate-400">{formData.image.length}/300</span>
                </div>
                <input
                  type="text"
                  maxLength={300}
                  value={formData.image}
                  onChange={(e) => handleFieldChange("image", e.target.value)}
                  onBlur={() => handleBlur("image")}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                    errors.image ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                  }`}
                  placeholder="https://images.unsplash.com/..."
                />
                {errors.image && <p className="text-[11px] text-red-500 font-medium">{errors.image}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Short Summary *</label>
                  <span className="text-[10px] text-slate-400">{formData.summary.length}/250</span>
                </div>
                <input
                  type="text"
                  maxLength={250}
                  value={formData.summary}
                  onChange={(e) => handleFieldChange("summary", e.target.value)}
                  onBlur={() => handleBlur("summary")}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                    errors.summary ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                  }`}
                  placeholder="A quick 1-2 sentence preview of the article (10-250 chars)."
                />
                {errors.summary && <p className="text-[11px] text-red-500 font-medium">{errors.summary}</p>}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Article Content * (Separate paragraphs with newlines)</label>
                  <span className="text-[10px] text-slate-400">{formData.content.length}/5000</span>
                </div>
                <textarea
                  rows="6"
                  maxLength={5000}
                  value={formData.content}
                  onChange={(e) => handleFieldChange("content", e.target.value)}
                  onBlur={() => handleBlur("content")}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none transition-all ${
                    errors.content ? "border-red-500 focus:ring-2 focus:ring-red-500/20" : "border-slate-200 focus:border-slate-300"
                  }`}
                  placeholder="Write the article text here. Hit Enter to separate into distinct paragraphs (20-5000 chars)."
                />
                {errors.content && <p className="text-[11px] text-red-500 font-medium">{errors.content}</p>}
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#a14000] hover:bg-[#853500] text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Publishing..." : editingBlog ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
