import { useState } from "react";
import {
  HelpCircle,
  Search,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Clock,
  Sparkles,
  LifeBuoy
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/common/Breadcrumb";
import { useAuth } from "@/context/AuthContext";

export default function HelpSupportPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const [ticketForm, setTicketForm] = useState({
    category: "Technical Issue",
    priority: "Medium",
    subject: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      question: "How do I register a new vehicle to my fleet?",
      answer:
        "Navigate to 'Vehicle Management' from the sidebar menu and click 'Add Vehicle'. Fill in the vehicle basic details, registration info, technical specifications, and upload the required 6 vehicle documents (RC, Insurance, PUC, Fitness, Permit, Road Tax). Files up to 10 MB in PDF, JPG, or PNG format are supported.",
    },
    {
      question: "What document file formats and size limits are supported?",
      answer:
        "Our system supports PDF documents as well as JPG, JPEG, and PNG images. Each document file can be up to 10 MB in size. Documents are securely processed and hosted on Cloudinary.",
    },
    {
      question: "How does live vehicle tracking work?",
      answer:
        "Live tracking operates via real-time location sync from the driver's mobile application or telematics devices. Open 'Live Tracking' in the manager dashboard to monitor active truck positions, route polylines, ETAs, and speed in real-time.",
    },
    {
      question: "What happens when a vehicle document is expiring or expired?",
      answer:
        "The system automatically monitors document expiry dates and categorizes documents as 'Active', 'Expiring Soon' (within 30 days), or 'Expired'. You will receive real-time notifications in your Notification Center to replace or renew documents.",
    },
    {
      question: "How can drivers submit fuel entries and maintenance tickets?",
      answer:
        "Drivers assigned to active vehicles can log fuel fill-ups with receipt images directly through the driver app. For maintenance issues, drivers can raise vehicle issue tickets, which will appear in your 'Maintenance Management' dashboard for review and technical assignment.",
    },
    {
      question: "How do I upgrade or manage my Fleet subscription plan?",
      answer:
        "Go to your 'Profile Dropdown' -> 'Subscription' or navigate to '/manager/subscription' to view active plan details, request plan upgrades, or manage subscription renewals.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast.error("Please fill in both subject and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate ticket submission delay
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Support ticket submitted successfully! Reference #TK-" + Math.floor(100000 + Math.random() * 900000));
      setTicketForm({
        category: "Technical Issue",
        priority: "Medium",
        subject: "",
        description: "",
      });
    } catch (err) {
      toast.error("Failed to submit ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 font-poppins">
      <Breadcrumb />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#FDF3EC] border border-[#B45A0A]/20 flex items-center justify-center text-[#B45A0A] shrink-0">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-poppins font-bold text-2xl lg:text-3xl text-[#1E293B] leading-none">
                Help & Support Center
              </h1>
              <p className="text-sm text-[#64748B] mt-1.5 font-nunito">
                Find answers to common questions, browse user guides, or contact our dedicated support team
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#475569]">
          <Clock className="w-4 h-4 text-[#B45A0A]" />
          <span>Support Hours: 24/7 Available</span>
        </div>
      </div>

      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#B45A0A]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B45A0A]/20 border border-[#B45A0A]/30 text-[#FDBA74] text-xs font-bold font-poppins">
            <Sparkles className="w-3.5 h-3.5" /> How can we help you today?
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold font-poppins leading-tight">
            Search knowledge base or ask a question
          </h2>

          <div className="relative pt-2">
            <Search className="w-5 h-5 absolute left-4 top-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for vehicle upload rules, driver tracking, subscriptions, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#B45A0A] backdrop-blur-md transition-all"
            />
          </div>
        </div>
      </div>

      {/* Quick Support Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Phone Support */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover:shadow-md hover:border-[#B45A0A]/30 transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-[#B45A0A] flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1E293B]">Phone Support</h3>
            <p className="text-xs text-[#64748B] mt-1 font-nunito">Toll-Free 24/7 Helpline</p>
          </div>
          <a
            href="tel:+18005553533"
            className="text-sm font-bold text-[#B45A0A] hover:underline inline-block pt-1"
          >
            +1 (800) 555-FLEET
          </a>
        </div>

        {/* Email Support */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover:shadow-md hover:border-[#B45A0A]/30 transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1E293B]">Email Support</h3>
            <p className="text-xs text-[#64748B] mt-1 font-nunito">Average response under 2 hours</p>
          </div>
          <a
            href="mailto:support@fleetmanagement.com"
            className="text-sm font-bold text-blue-600 hover:underline inline-block pt-1 truncate max-w-full"
          >
            support@fleetmanagement.com
          </a>
        </div>

        {/* Live Chat */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover:shadow-md hover:border-[#B45A0A]/30 transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1E293B]">Live Chat Desk</h3>
            <p className="text-xs text-[#64748B] mt-1 font-nunito">Chat with support agents</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full inline-block">
            🟢 Active Agents Online
          </span>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm hover:shadow-md hover:border-[#B45A0A]/30 transition-all space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#1E293B]">User Manuals</h3>
            <p className="text-xs text-[#64748B] mt-1 font-nunito">Guides & Fleet Standards</p>
          </div>
          <span className="text-sm font-bold text-indigo-600 hover:underline cursor-pointer inline-block pt-1">
            Browse Documentation &rarr;
          </span>
        </div>
      </div>

      {/* Main Grid Section: FAQs + Support Ticket Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: FAQs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7EAF0]">
            <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#B45A0A]" />
              <span>Frequently Asked Questions</span>
            </h2>
            <span className="text-xs text-[#64748B] font-semibold">
              Showing {filteredFaqs.length} FAQs
            </span>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E7EAF0] overflow-hidden transition-all duration-200 shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 font-semibold text-[#1E293B] hover:bg-gray-50/50 transition-colors"
                    >
                      <span className="text-sm font-bold text-[#1E293B]">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#B45A0A] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-[#64748B] leading-relaxed font-nunito border-t border-gray-100 bg-gray-50/30">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#E7EAF0]">
                <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-[#1E293B]">No FAQs match your search</p>
                <p className="text-xs text-[#64748B] mt-1 font-nunito">
                  Try searching for keywords like 'vehicle', 'driver', 'document', or 'tracking'.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submit Support Ticket Form (1 col) */}
        <div className="bg-white rounded-2xl border border-[#E7EAF0] p-6 shadow-sm space-y-6 h-fit">
          <div className="pb-4 border-b border-[#E7EAF0]">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#B45A0A]" />
              <span>Submit Support Ticket</span>
            </h2>
            <p className="text-xs text-[#64748B] mt-1 font-nunito">
              Can't find what you need? Send a message directly to our technical team.
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={ticketForm.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              >
                <option value="Technical Issue">Technical Issue</option>
                <option value="Vehicle Management">Vehicle Management</option>
                <option value="Driver Management">Driver Management</option>
                <option value="Live Tracking / GPS">Live Tracking / GPS</option>
                <option value="Subscription & Billing">Subscription & Billing</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={ticketForm.priority}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Urgent">Urgent Critical</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                placeholder="e.g. Issue uploading RC document"
                value={ticketForm.subject}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                Description *
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Provide detailed information about your inquiry or error..."
                value={ticketForm.description}
                onChange={handleInputChange}
                required
                className="w-full px-3.5 py-2.5 border border-[#E7EAF0] rounded-xl text-xs focus:outline-none focus:border-[#B45A0A] bg-white text-[#1E293B] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#B45A0A] hover:bg-[#9A4D08] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#B45A0A]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-[11px] text-[#64748B] font-nunito">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Submitted tickets are assigned directly to your account representative.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
