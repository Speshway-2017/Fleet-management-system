import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, ArrowLeft, Sparkles, Calendar, Clock, Share2, Tag } from "lucide-react";
import BlogCard from "@/components/common/BlogCard";
import axiosClient from "@/api/axiosClient";

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

  // Full-Page Article View
  if (selectedArticle) {
    return (
      <div className="bg-white flex-1 flex flex-col font-sans text-[#4B5563] min-h-screen">
        {/* Sticky Header Navigation Bar */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <button
            onClick={() => setSelectedArticle(null)}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#0B1B3D] hover:text-[#A14000] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Blogs</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A14000] bg-[#A14000]/10 px-3 py-1 rounded-full">
              {selectedArticle.category}
            </span>
          </div>
        </div>

        {/* Hero Header Section */}
        <header className="bg-slate-50/70 border-b border-slate-100 py-10 md:py-14 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
              <span className="inline-flex items-center gap-1 text-[#A14000] font-bold">
                <Tag className="w-3.5 h-3.5" />
                {selectedArticle.category}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedArticle.date}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedArticle.readTime}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-[#0B1B3D] leading-tight tracking-tight">
              {selectedArticle.title}
            </h1>
            <p className="text-sm sm:text-base text-body font-normal leading-relaxed">
              {selectedArticle.summary}
            </p>
          </div>
        </header>

        {/* Main Article Content */}
        <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8 flex-1">
          {/* Article Banner Image */}
          <div className="relative h-[300px] sm:h-[420px] md:h-[480px] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <img
              src={selectedArticle.image}
              alt={selectedArticle.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Text Content */}
          <div className="prose max-w-none space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
            {Array.isArray(selectedArticle.content) ? (
              selectedArticle.content.map((paragraph, idx) => (
                <p key={idx} className="font-normal text-slate-600 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="font-normal text-slate-600 leading-relaxed">
                {selectedArticle.content || selectedArticle.summary}
              </p>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => setSelectedArticle(null)}
              className="w-full sm:w-auto px-6 py-3 bg-[#0B1B3D] hover:bg-[#152e5c] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Blogs</span>
            </button>
            <button
              onClick={() => { setSelectedArticle(null); navigate("/contact"); }}
              className="w-full sm:w-auto px-6 py-3 bg-[#A14000] hover:bg-[#853500] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Contact Sales Team</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-white flex-1 flex flex-col font-sans text-[#4B5563]">
      {/* 1. Hero Section */}
      <section className="py-8 md:py-12 bg-gradient-to-br from-slate-50 to-white border-b border-border-custom px-4 sm:px-6 md:px-8">
        <div className="max-w-[1550px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Side */}
          <div className="lg:col-span-6 space-y-6">
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
                className="btn-water-fill px-8 py-3.5 sm:px-9 sm:py-4 rounded-2xl font-black text-sm sm:text-base text-white flex items-center gap-2.5 shadow-lg active:scale-[0.98] cursor-pointer"
              >
                <span>Browse Articles</span>
                <ArrowRight className="w-5 h-5" />
              </a>
              <button
                onClick={() => navigate("/contact")}
                className="btn-learn-more px-8 py-3.5 sm:px-9 sm:py-4 bg-white border border-slate-300 rounded-2xl font-black text-sm sm:text-base text-[#0B1B3D] flex items-center gap-2.5 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Contact Our Team</span>
                <ArrowRight className="w-5 h-5 btn-arrow-icon" />
              </button>
            </div>
          </div>

          {/* Right Side: Visual Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80&w=1200"
                alt="Fleet Intelligence"
                className="w-full h-[400px] sm:h-[460px] md:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3D]/85 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FFDBCC] bg-[#A14000]/70 px-3 py-1 rounded-md">Featured Topic</span>
                  <p className="font-bold text-base md:text-lg">The Evolution of Telematics & Real-Time Logistics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-24 bg-white flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#A14000] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* 2. Featured Articles Section */}
          <section id="featured" className="py-12 md:py-16 bg-white border-b border-border-custom px-4 sm:px-6 md:px-8">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase block font-display">Featured Articles</h3>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
                  Editor's Top Picks
                </h2>
                <p className="text-xs sm:text-sm text-body max-w-xl mx-auto leading-relaxed">
                  Hand-picked articles covering enterprise fleet management, security, compliance, and digital operations.
                </p>
              </div>

              {/* Featured Cards (3 grid - No animation wrapper) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <section className="py-12 md:py-16 bg-slate-50/50 border-b border-border-custom px-4 sm:px-6 md:px-8">
              <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-2">
                  <h3 className="text-[#A14000] text-xs sm:text-sm font-bold tracking-widest uppercase block font-display">Latest Resources</h3>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-[#0B1B3D]">
                    Latest Insights
                  </h2>
                  <p className="text-xs sm:text-sm text-body max-w-xl mx-auto leading-relaxed">
                    Stay ahead in transportation with our recent analyses, operational guides, and cloud platform tutorials.
                  </p>
                </div>

                {/* Grid of latest cards (No animation wrapper) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="max-w-[1550px] mx-auto rounded-3xl bg-[#0B1B3D] text-white p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl">
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
    </div>
  );
}
