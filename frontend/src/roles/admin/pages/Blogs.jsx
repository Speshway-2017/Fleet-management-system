import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";
import BlogCard from "@/components/common/BlogCard";
import { 
  BookOpen, 
  Shield, 
  Cpu, 
  FileText, 
  Briefcase, 
  Globe, 
  Mail, 
  User, 
  ArrowRight,
  Sparkles,
  ChevronRight,
  X
} from "lucide-react";

export default function Blogs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newsletter, setNewsletter] = useState({ name: "", email: "" });
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleAction = (label) => {
    toast.success(`Action triggered: ${label}`);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletter.name || !newsletter.email) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success(`Thank you for subscribing, ${newsletter.name}!`);
    setNewsletter({ name: "", email: "" });
  };

  const featuredArticles = [
    {
      category: "Operations",
      title: "How Digital Fleet Platforms Improve Business Efficiency",
      summary: "Discover how centralized fleet management platforms simplify daily operations, improve collaboration, enhance visibility, and support better decision-making for growing transportation businesses.",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
      date: "July 14, 2026",
      readTime: "5 min read",
      content: [
        "In today's fast-paced logistics landscape, digital fleet management platforms have transitioned from being a convenience to a necessity. These comprehensive software suites consolidate vehicle locations, route updates, scheduling, driver statuses, and telemetry data into a single, intuitive dashboard. This unified view empowers dispatchers to coordinate trips seamlessly and minimize miscommunications.",
        "One of the most immediate benefits is real-time visibility. By knowing the precise location of every truck or van in the roster, businesses can respond to client inquiries instantly, optimize fuel consumption, and reroute vehicles dynamically to avoid heavy traffic or hazardous weather conditions. This operational agility directly translates to lower fuel overheads and improved customer satisfaction.",
        "Furthermore, automation reduces the heavy burden of manual bookkeeping. Digital platforms handle compliance documentation, driver rosters, licensing renewals, and safety logs. This mitigates compliance errors and simplifies the auditing process, allowing management teams to focus on scaling operations rather than managing endless paperwork.",
        "Ultimately, the consolidation of data offers invaluable analytical insights. Business owners can inspect detailed reports on idle times, average speeds, fuel usage, and route efficiency. These data-driven inputs enable logistics directors to identify bottlenecks and configure strategic reforms that drive long-term business productivity."
      ]
    },
    {
      category: "Security",
      title: "Building Secure Fleet Operations for Modern Businesses",
      summary: "Learn how secure authentication, role-based access, data protection, and cloud infrastructure help organizations safeguard operational information.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      date: "July 12, 2026",
      readTime: "4 min read",
      content: [
        "Security is a paramount concern for enterprise fleet management, as logistics networks deal with sensitive customer addresses, freight schedules, and driver identification records. A breach in operational databases could compromise business logistics, disrupt operations, and lead to financial liabilities.",
        "Implementing role-based access control (RBAC) is the first line of defense. By assigning granular authorization rules, companies ensure that dispatchers, vehicle managers, and drivers only have access to information relevant to their roles. An admin dashboard handles critical operations configurations, while a driver dashboard is streamlined for route execution, keeping systemic vulnerabilities to a minimum.",
        "Data encryption forms the core of information protection. Operational telemetry transmitted from vehicle trackers to cloud systems must be secured using robust cryptographic standards, such as TLS 1.3 in transit and AES-256 at rest. This protects vital diagnostics logs, GPS streams, and database records from potential interceptors.",
        "Regular auditing and system health checks complete the security cycle. Maintaining comprehensive logs of user actions, login times, and database edits helps detect suspicious behavior early, safeguarding fleet assets against digital and physical threats."
      ]
    },
    {
      category: "Technology",
      title: "Cloud-Based Fleet Management for Enterprise Growth",
      summary: "Explore how cloud technology enables organizations to manage drivers, vehicles, documents, and operational data from anywhere with greater efficiency.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      date: "July 10, 2026",
      readTime: "6 min read",
      content: [
        "Scaling a logistics organization requires infrastructure that expands alongside vehicle count and user demands. Cloud-based fleet management solutions offer the perfect foundation for this transition, removing the constraints of localized legacy servers.",
        "Cloud platforms ensure that operational dashboards are accessible from anywhere. Whether dispatch managers are at headquarters or working remotely, they can manage driver assignments, monitor vehicle statuses, and coordinate service requests in real-time, fostering unified team collaboration.",
        "Cost efficiency is another major factor. Cloud hosting eliminates the need for expensive hardware maintenance and localized IT staff. Platforms scale system resources dynamically, handling peak hours with ease without performance degradation.",
        "Finally, cloud integration facilitates automated feature upgrades, continuous telemetry syncing, and remote data backups. This reliability ensures that operational histories remain secure and accessible even during unforeseen localized hardware failures."
      ]
    }
  ];

  const latestArticles = [
    {
      title: "Improving Fleet Visibility Across Multiple Locations",
      category: "Operations",
      date: "July 8, 2026",
      readTime: "4 min read",
      summary: "Learn how modern centralized management systems enable complete tracking and visibility of enterprise transport assets and drivers across global hubs.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      content: [
        "For businesses operating across multiple regional hubs, coordinating fleet movement is highly challenging. Integrating telemetry systems under a single cloud platform is the key to maintaining consistent, cross-hub operational visibility.",
        "Live location streams and regional geofences allow operators to track transit progress as vehicles travel between hubs. Automated notices notify dispatchers when a truck leaves one territory and enters another, improving ETA accuracy.",
        "This level of control allows companies to reallocate vehicles to where driver demand is highest, reducing empty returns and maximizing fleet utility."
      ]
    },
    {
      title: "Enterprise Security Best Practices",
      category: "Security",
      date: "July 5, 2026",
      readTime: "5 min read",
      summary: "Implement advanced role-based access controls, robust data protection, and cloud infrastructure to safeguard sensitive operational data.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      content: [
        "Securing logistics data involves continuous adherence to rigorous standards. Best practices include mandatory multi-factor authentication (MFA) for administrative accounts, regular password rotations, and routine penetration tests.",
        "Training staff to recognize social engineering tactics and phishing emails is equally important. Secure configurations must cover driver communication channels, safeguarding mobile dispatch platforms from unauthorized overrides."
      ]
    },
    {
      title: "Benefits of Digital Documentation",
      category: "Compliance",
      date: "July 2, 2026",
      readTime: "3 min read",
      summary: "Transition to electronic record-keeping to simplify compliance audits, improve record accuracy, and streamline driver management processes.",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
      content: [
        "Replacing paper sheets with digital records simplifies driver compliance and regulatory reporting. Electronic logs instantly record driver hours, maintenance logs, and vehicle inspections, removing manual calculation errors.",
        "During audits, digital databases allow managers to fetch specific records in seconds, avoiding operational delays and showing a strong commitment to compliance."
      ]
    },
    {
      title: "Managing Growing Transportation Businesses",
      category: "Business",
      date: "June 28, 2026",
      readTime: "6 min read",
      summary: "Scale your fleet operations smoothly by utilizing centralized reporting, performance monitoring, and scalable cloud platforms.",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80",
      content: [
        "Growing fleets must establish scalable protocols to avoid operations bottlenecks. Standardizing training, organizing vehicle service intervals, and delegating dispatch tasks prevents management overload.",
        "Using software analytics, companies can forecast hiring and vehicle acquisition needs, aligning fleet capabilities with client demands."
      ]
    },
    {
      title: "Improving Operational Productivity",
      category: "Operations",
      date: "June 25, 2026",
      readTime: "4 min read",
      summary: "Identify bottlenecks in daily workflows and enhance driver safety and vehicle productivity through advanced operational excellence methodologies.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
      content: [
        "Optimizing productivity requires analyzing operational data to find inefficiencies. Telemetry data reveals details about idle times, long loading processes, and inefficient routing.",
        "Implementing driver training programs, optimizing warehouse queues, and automating communication with clients helps reduce idle times and improves delivery efficiency."
      ]
    },
    {
      title: "Building Reliable Fleet Operations",
      category: "Technology",
      date: "June 20, 2026",
      readTime: "5 min read",
      summary: "Leverage highly available cloud platforms and real-time connectivity to ensure enterprise reliability and consistent service delivery.",
      image: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
      content: [
        "System reliability depends on stable telemetry tracking and responsive cloud databases. High-availability cloud systems guarantee that live feeds from GPS trackers are processed in real-time.",
        "Redundant database setups and fast API connections ensure dispatchers and drivers remain connected, keeping fleet operations running smoothly under any conditions."
      ]
    }
  ];

  useEffect(() => {
    if (location.state?.openBlogTitle) {
      const match = [...featuredArticles, ...latestArticles].find(
        a => a.title === location.state.openBlogTitle
      );
      if (match) {
        setSelectedArticle(match);
      }
    }
  }, [location]);

  return (

    <div className="bg-white min-h-screen flex flex-col font-sans text-[#4B5563]">
      <LandingHeader />

      {/* 1. Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 to-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#A14000]/10 text-[#A14000] text-xs font-bold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Latest Insights & Resources</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black text-[#0B1B3D] leading-[1.15] tracking-tight">
              Stay Updated with <br />
              <span className="text-[#A14000]">Fleet Management</span> Insights
            </h1>

            <p className="text-sm sm:text-base text-[#4B5563] max-w-xl font-normal leading-relaxed">
              Explore practical articles, industry updates, operational strategies, security best practices, and business insights designed to help organizations improve fleet operations and make informed decisions.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#featured"
                className="px-6 py-3 bg-[#A14000] hover:bg-[#853500] rounded-xl font-bold text-xs text-white flex items-center gap-1.5 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer"
              >
                Browse Articles
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => navigate("/contact")}
                className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-bold text-xs text-heading flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                Contact Our Team
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-[#A14000]/10 rounded-3xl transform rotate-3 scale-102 blur-sm pointer-events-none" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/40 aspect-[4/3] w-full bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80" 
                alt="Business team discussing fleet performance" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Articles Section */}
      <section id="featured" className="py-16 md:py-24 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase block font-display">Featured Articles</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Editor's Top Picks
            </h2>
            <p className="text-sm text-body max-w-xl mx-auto leading-relaxed">
              Hand-picked articles covering enterprise fleet management, security, compliance, and digital operations.
            </p>
          </div>

          {/* Featured Cards (3 grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredArticles.map((article, i) => (
              <BlogCard
                key={i}
                image={article.image}
                category={article.category}
                date={article.date}
                readTime={article.readTime}
                title={article.title}
                summary={article.summary}
                onReadMore={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Latest Insights Grid */}
      <section className="py-16 md:py-24 bg-slate-50/50 border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-2">
            <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase block font-display">Latest Resources</h3>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
              Latest Insights
            </h2>
            <p className="text-sm text-body max-w-xl mx-auto leading-relaxed">
              Stay ahead in transportation with our recent analyses, operational guides, and cloud platform tutorials.
            </p>
          </div>

          {/* Grid of 6 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article, i) => (
              <BlogCard
                key={i}
                image={article.image}
                category={article.category}
                date={article.date}
                readTime={article.readTime}
                title={article.title}
                summary={article.summary}
                onReadMore={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Ready to Improve Your Fleet Operations? CTA Section */}
      <section className="bg-white py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto rounded-3xl bg-[#0B1B3D] text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600')" }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/50 via-[#0B1B3D]/95 to-[#0B1B3D] pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
            <h3 className="font-display text-2xl md:text-3xl font-extrabold">Ready to Improve Your Fleet Operations?</h3>
            <p className="text-sm text-gray-400">Discover how our platform helps organizations manage fleets with greater efficiency, visibility, and security.</p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 shrink-0 justify-center">
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3.5 bg-[#A14000] hover:bg-[#853500] rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Contact Sales
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Blog Details Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl max-w-4xl w-full flex flex-col max-h-[85vh] relative animate-scale-up overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 p-2 bg-slate-50/80 hover:bg-slate-100 text-gray-500 hover:text-black rounded-full transition-all border border-gray-100 hover:scale-105 cursor-pointer z-10 font-bold"
              aria-label="Close details"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content Scrollable Area */}
            <div className="overflow-y-auto flex-1">
              {/* Image banner */}
              <div className="relative h-[220px] sm:h-[300px] w-full bg-slate-100">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3 py-1 rounded-full bg-[#A14000] text-white text-xs font-bold shadow-md uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <h2 className="font-display font-black text-lg sm:text-2xl text-white mt-3 leading-snug">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Meta info bar */}
                <div className="flex items-center gap-6 text-xs text-gray-500 font-semibold border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-1.5">
                    <span>Date published:</span>
                    <span className="text-[#0B1B3D]">{selectedArticle.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Est. read time:</span>
                    <span className="text-[#0B1B3D]">{selectedArticle.readTime}</span>
                  </div>
                </div>

                {/* Article body paragraphs */}
                <div className="text-xs sm:text-sm text-body space-y-4 font-normal leading-relaxed">
                  {selectedArticle.content ? (
                    selectedArticle.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))
                  ) : (
                    <p>{selectedArticle.summary}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 bg-white flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-[#0B1B3D] hover:bg-[#152e5c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

      <LandingFooter />
    </div>
  );
}
