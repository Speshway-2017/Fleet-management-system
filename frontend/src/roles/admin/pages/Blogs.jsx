import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import LandingHeader from "@/components/layout/LandingHeader";
import LandingFooter from "@/components/layout/LandingFooter";
import BlogCard from "@/components/common/BlogCard";
import axiosClient from "@/api/axiosClient";
import { 
  ArrowRight,
  Sparkles,
  X
} from "lucide-react";

export default function Blogs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data: body } = await axiosClient.get("/public/blogs");
        setAllBlogs(body.data || []);
      } catch (err) {
        console.error("Failed to load public blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const featuredArticles = allBlogs.slice(0, 3);
  const latestArticles = allBlogs.slice(3);

  useEffect(() => {
    if (location.state?.openBlogTitle && allBlogs.length > 0) {
      const match = allBlogs.find(
        a => a.title === location.state.openBlogTitle
      );
      if (match) {
        setSelectedArticle(match);
      }
    }
  }, [location, allBlogs]);

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

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-24 bg-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary border-t-transparent" />
        </div>
      ) : allBlogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-body font-semibold">No blog articles are published at the moment.</p>
        </div>
      ) : (
        <>
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
          {latestArticles.length > 0 && (
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

                {/* Grid of latest cards */}
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
          )}
        </>
      )}

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
                  {Array.isArray(selectedArticle.content) ? (
                    selectedArticle.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))
                  ) : (
                    <p>{selectedArticle.content || selectedArticle.summary}</p>
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
