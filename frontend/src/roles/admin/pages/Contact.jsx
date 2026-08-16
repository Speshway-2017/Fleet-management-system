import { useState, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import { useAuth } from "@/context/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";
import { contactApi } from "@/api/contactApi";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Users,
  Award,
  Send,
  ChevronDown,
  ChevronUp,
  Headphones,
  ArrowRight,
  KeyRound,
  X
} from "lucide-react";

export default function Contact() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const recaptchaRef = useRef(null);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [activeFaq, setActiveFaq] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "agent", text: "Hello! How can we help you with our Fleet Management System today?" }
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      let replyText = "Thank you for reaching out! A fleet specialist has been notified and will connect with you here shortly.";
      const query = userMsg.toLowerCase();
      if (query.includes("pricing") || query.includes("cost") || query.includes("price")) {
        replyText = "Our basic plan starts at $29/vehicle/month. I can have a sales representative email you the detailed pricing sheets if you wish!";
      } else if (query.includes("demo") || query.includes("trial")) {
        replyText = "We offer a 14-day free trial! You can sign up using the Contact Us form on this page or register a manager account directly.";
      } else if (query.includes("features") || query.includes("track")) {
        replyText = "Our platform offers live GPS tracking, IoT telematics integration, smart maintenance routing, and automated trip logging. Check our Features tab for more info!";
      }
      setChatMessages(prev => [...prev, { sender: "agent", text: replyText }]);
    }, 1000);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleCaptchaExpired = () => {
    setCaptchaToken("");
    toast.error("Captcha expired. Please verify again.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.message || !form.subject) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!captchaToken) {
      toast.error("Please verify that you are not a robot.");
      return;
    }

    setSubmitting(true);
    try {
      await contactApi.sendContactRequest({
        ...form,
        captchaToken,
      });
      toast.success("Message sent successfully!");
      setForm({
        fullName: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: "",
      });
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send message. Please try again.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const faqData = [
    {
      question: "How quickly can we get started?",
      answer: "You can get started in as little as 24 hours. Our onboarding specialists will work closely with you to import your driver roster, register vehicle telemetry units, and configure dashboard access so your fleet is visible on day one."
    },
    {
      question: "Is my data secure with your platform?",
      answer: "Absolutely. We employ bank-grade security protocols, including AES-256 data encryption at rest and TLS 1.3 in transit. Our infrastructure is fully ISO 27001 and SOC 2 Type II compliant, featuring granular role-based access levels."
    },
    {
      question: "Do you offer training for our team?",
      answer: "Yes, we offer comprehensive training tailored for fleet managers, dispatch staff, and drivers. This includes live video walkthroughs, hands-on tutorials, downloadable guides, and a 24/7 self-service knowledge base."
    },
    {
      question: "Can I get a customized solution for my business?",
      answer: "Yes! For large enterprise fleets, we provide bespoke API integrations, custom analytical report structures, and unique telemetry hooks designed around your existing logistics workflows and TMS applications."
    }
  ];

  return (
    <div className="bg-[#FAFBFC] min-h-screen flex flex-col font-sans text-[#4B5563]">

      {/* 2. Hero Section with Background Volvo Truck */}
      <section className="relative w-full overflow-hidden border-b border-[#E5E7EB] bg-white py-8 md:py-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        {/* Translucent overlay for text legibility (minimized white casting for maximum image clarity) */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-white/20 to-transparent md:bg-gradient-to-r md:from-white/70 md:via-white/30 md:to-transparent lg:bg-gradient-to-r lg:from-white/65 lg:via-white/15 lg:to-transparent" />

        <div className="relative w-full max-w-[1550px] mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <AnimeScrollReveal direction="top" className="lg:col-span-6 space-y-6">

            {/* Pill Capsule */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#A14000]/40 bg-[#A14000]/5 text-[#A14000] text-xs font-bold w-fit">
              <span className="h-2 w-2 rounded-full bg-[#A14000] animate-pulse" />
              <span>Let's Drive a Better Tomorrow</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-[#0B1B3D] leading-[1.1] tracking-tight">
              We’re Here to <br />
              <span className="text-[#A14000]">Support Your Journey.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4B5563] max-w-xl font-medium leading-relaxed">
              Have questions about our Fleet Management System? Our team is ready to help you with any inquiries, support needs or partnership opportunities.
            </p>

            {/* Features Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E5E7EB]/50">

              <div className="flex gap-2.5 items-start">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Fast Response</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Within 24 Hours</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center">
                  <Users className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Expert Support</h4>
                  <p className="text-[10px] text-gray-500 font-medium">From Fleet Specialists</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Partnership</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Your Success, Our Focus</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-[#A14000]/10 text-[#A14000] flex items-center justify-center">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Data Secure</h4>
                  <p className="text-[10px] text-gray-500 font-medium">100% Confidential</p>
                </div>
              </div>

            </div>

          </AnimeScrollReveal>
        </div>
      </section>

      {/* 3. Quick Info Bar */}
      <section className="py-10 max-w-[1550px] mx-auto w-full px-4 sm:px-6 md:px-10 mt-6 relative z-10">
        <AnimeStaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-md flex items-start gap-4 anime-card-lift">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center anime-icon-hover">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D]">Our Office</h4>
              <p className="text-xs text-[#4B5563] mt-1">Hyderabad, Telangana</p>
              <p className="text-[11px] text-gray-400 font-medium">India 500081</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-md flex items-start gap-4 anime-card-lift">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center anime-icon-hover">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D]">Call Us</h4>
              <p className="text-xs text-[#A14000] font-bold mt-1">+91 98765 43210</p>
              <p className="text-[11px] text-gray-400 font-medium">Mon - Fri, 9AM - 6PM IST</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-md flex items-start gap-4 anime-card-lift">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center anime-icon-hover">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D]">Email Us</h4>
              <p className="text-xs text-[#A14000] font-bold mt-1">support@fleetmanagement.com</p>
              <p className="text-[11px] text-gray-400 font-medium">We reply within 24 hours</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-md flex items-start gap-4 anime-card-lift">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-[#A14000]/10 text-[#A14000] flex items-center justify-center anime-icon-hover">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-[#0B1B3D]">Live Chat</h4>
              <p className="text-xs text-[#4B5563] mt-1">Available on our platform</p>
              <p className="text-[11px] text-gray-400 font-medium">For instant help</p>
            </div>
          </div>

        </AnimeStaggerGroup>
      </section>

      {/* 4. Form and Map Split Section */}
      <section className="py-10 max-w-[1550px] mx-auto w-full px-4 sm:px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">


        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-md">
          <h2 className="font-display text-2xl font-black text-[#0B1B3D] mb-2">Send Us a Message</h2>
          <p className="text-xs text-[#4B5563] mb-8 font-medium">Fill out the form and our team will get back to you soon.</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-display">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/15 focus:outline-none placeholder:text-gray-400 font-medium bg-white text-[#1E293B]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-display">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/15 focus:outline-none placeholder:text-gray-400 font-medium bg-white text-[#1E293B]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-display">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your company name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/15 focus:outline-none placeholder:text-gray-400 font-medium bg-white text-[#1E293B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-display">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/15 focus:outline-none placeholder:text-gray-400 font-medium bg-white text-[#1E293B]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-display">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs focus:border-[#A14000] focus:outline-none font-medium bg-white text-[#1E293B] cursor-pointer"
                required
              >
                <option value="">Select a subject</option>
                <option value="Sales">Sales Inquiry</option>
                <option value="Demo">Request a Demo</option>
                <option value="Support">Technical Support</option>
                <option value="Partnership">Partnership Opportunities</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block font-display">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="5"
                placeholder="Tell us how we can help you..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] px-4 py-3 text-xs focus:border-[#A14000] focus:ring-2 focus:ring-[#A14000]/15 focus:outline-none placeholder:text-gray-400 font-medium resize-none bg-white text-[#1E293B]"
                required
              />
            </div>

            {/* Google reCAPTCHA v2 Checkbox */}
            <div className="max-w-[300px] overflow-hidden rounded-lg">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                onExpired={handleCaptchaExpired}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!captchaToken || submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#A14000] hover:bg-[#853500] text-white px-6 py-3.5 text-xs font-bold shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Sending..." : "Send Message"}
            </button>

          </form>
        </div>

        {/* Right Column: Map and Urgent Support */}
        <div className="lg:col-span-5 space-y-6">

          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-4 shadow-md space-y-4">
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-3.5 flex items-start gap-3">
              <div className="p-2 bg-[#A14000]/10 text-[#A14000] rounded-xl shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-[#0B1B3D]">Fleet Management Head Office</h5>
                <p className="text-[10px] text-gray-500 font-medium">Hyderabad, Telangana, India</p>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.7579758784116!2d78.3762293148777!3d17.44775798804245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93e2f2e51921%3A0xe54e3d3b76a084c!2sHitech%20City%2C%20Hyderabad%2C%20Telangana%20500081%2C%20India!5e0!3m2!1sen!2sus!4v1657800000000!5m2!1sen!2sus"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen=""
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="bg-[#A14000]/5 border border-[#A14000]/25 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 text-center sm:text-left">
              <div className="h-10 w-10 shrink-0 rounded-full bg-[#A14000]/10 text-[#A14000] flex items-center justify-center mx-auto">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#0B1B3D]">Need Immediate Assistance?</h4>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">For urgent support or technical issues, reach out to our dedicated support team.</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2 border border-[#A14000] hover:bg-[#A14000] hover:text-white text-[#A14000] rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
            >
              <Headphones className="h-3.5 w-3.5" />
              Chat Now
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-md">
            <h3 className="font-display font-black text-sm text-[#0B1B3D] mb-5 pb-3 border-b border-gray-100">Why Contact Us?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[#A14000] rounded-full shrink-0" />
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Get Expert Guidance</h4>
                </div>
                <p className="text-[9px] text-gray-500 leading-normal pl-3.5">Talk to our fleet management specialists for the best solutions.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[#A14000] rounded-full shrink-0" />
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Request a Demo</h4>
                </div>
                <p className="text-[9px] text-gray-500 leading-normal pl-3.5">See our platform in action with a personalized demo.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[#A14000] rounded-full shrink-0" />
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Partnership Ops</h4>
                </div>
                <p className="text-[9px] text-gray-500 leading-normal pl-3.5">Let's build a stronger, smarter and more efficient future together.</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-[#A14000] rounded-full shrink-0" />
                  <h4 className="font-bold text-xs text-[#0B1B3D]">Ongoing Support</h4>
                </div>
                <p className="text-[9px] text-gray-500 leading-normal pl-3.5">Our dedicated support team is always ready to help you succeed.</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. FAQs Section */}
      <section className="py-16 bg-[#FAFBFC] border-t border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">

          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs font-bold tracking-widest uppercase block font-display">Frequently Asked Questions</h3>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0B1B3D]">Quick answers to common questions</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-display font-bold text-sm text-[#0B1B3D] select-none cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="p-1 rounded-lg bg-[#FAFBFC] border border-[#E5E7EB] text-gray-400 shrink-0">
                      {isOpen ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 border-t border-gray-50">
                      <p className="text-xs text-[#4B5563] leading-relaxed pt-3">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Ready to Transform Banner */}
      <section className="py-10 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#A14000] to-[#b84a00] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/hero-bg.jpg')", bgSize: 'cover' }} />
          <div className="relative z-10 flex items-center gap-4 text-center md:text-left flex-col md:flex-row mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md border border-white/20 shrink-0">
              <ShieldCheck className="h-6.5 w-6.5" />
            </div>
            <div>
              <h3 className="font-display text-lg sm:text-xl font-extrabold leading-tight">Ready to Transform Your Fleet Operations?</h3>
              <p className="text-xs text-white/90 font-medium mt-1">Get in touch today and take the first step towards safer and more efficient fleet management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col h-[400px] animate-fade-in font-sans">
          {/* Header */}
          <div className="bg-[#0B1B3D] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse shrink-0" />
              <div>
                <h4 className="font-bold text-xs">Live Support</h4>
                <p className="text-[9px] text-slate-300 font-medium">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "agent" && (
                  <div className="h-6 w-6 rounded-full bg-[#A14000]/15 text-[#A14000] flex items-center justify-center font-bold text-[9px] shrink-0 border border-[#A14000]/10">
                    S
                  </div>
                )}
                <div className={`p-3 max-w-[80%] rounded-2xl shadow-sm leading-relaxed ${msg.sender === "user"
                    ? "bg-[#A14000] text-white rounded-tr-none font-medium"
                    : "bg-white border border-gray-200 text-slate-700 rounded-tl-none font-normal"
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendChatMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 pl-3 pr-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#A14000]"
            />
            <button
              onClick={handleSendChatMessage}
              className="px-3 py-2 bg-[#A14000] text-white rounded-xl hover:bg-[#853500] font-bold text-xs transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
