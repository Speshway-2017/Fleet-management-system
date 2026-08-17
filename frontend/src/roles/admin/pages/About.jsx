import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import anime from "animejs";
import axiosClient from "@/api/axiosClient";
import ParallaxDepthSection from "@/components/common/ParallaxDepthSection";
import CountUpNumber from "@/components/common/CountUpNumber";
import GoldFrameCard from "@/components/common/GoldFrameCard";
import { AnimeScrollReveal, AnimeStaggerGroup } from "@/components/common/AnimeScrollReveal";
import WordRevealParagraph from "@/components/common/WordRevealParagraph";
import { heroBackgroundAnimation } from "@/utils/animeUtils";
import { Sparkles, ShieldCheck, Award, Eye, Clock, CheckCircle } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        const { data: body } = await axiosClient.get("/public/about");
        setAboutData(body.data || null);
      } catch (err) {
        console.error("Failed to fetch public about details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, []);

  useEffect(() => {
    let bgAnim = null;
    if (bgRef.current) {
      bgAnim = heroBackgroundAnimation(bgRef.current);
    }
    return () => {
      if (bgAnim) {
        try { bgAnim.pause(); } catch (_) {}
      }
    };
  }, []);

  const storyTitle = aboutData?.storyTitle || "Built for Fleet Operators, by Logistics Experts";
  const storyContent = aboutData?.storyContent || [
    "Founded in 2021, FleetManagement began with a simple observation: most fleet management tools were either too complicated for daily operations or too basic for enterprise needs.",
    "Our team of logistics veterans and enterprise engineers came together to build a platform that bridges the gap — powerful analytics wrapped in an intuitive, driver-friendly interface."
  ];
  const missionTitle = aboutData?.missionTitle || "Eliminating Blind Spots in Fleet Operations";
  const missionContent = aboutData?.missionContent || [
    "Every year, inefficient fleet management costs businesses billions in wasted resources, unexpected breakdowns, and compliance failures. Most operators don't know what they don't know.",
    "FleetManagement gives operations teams complete, real-time intelligence across every asset in their fleet — so decisions are driven by data, not guesswork."
  ];
  const missionQuote = aboutData?.missionQuote || "The only way to run a fleet well is to see it clearly.";
  const statsFounded = aboutData?.statsFounded || "2018";
  const statsEnterprises = aboutData?.statsEnterprises || "340+";
  const statsVehicles = aboutData?.statsVehicles || "1.2M+";
  const statsSavings = aboutData?.statsSavings || "$180M+";
  const timelineItems = aboutData?.timeline || [
    { year: "2018", text: "FleetManagement founded in Bengaluru, India. Seed funding of ₹30 Cr." },
    { year: "2019", text: "First 50 enterprise customers. Launched real-time GPS tracking." },
    { year: "2021", text: "Series A — ₹200 Cr. Expanded to reporting & analytics and driver management." },
    { year: "2023", text: "Surpassed 1M vehicles tracked. Launched performance monitoring cloud platform." },
    { year: "2026", text: "340+ enterprise clients. ₹1,500 Cr+ in documented customer savings." },
  ];

  return (
    <div className="bg-bg-page flex-1 flex flex-col font-sans text-body">
      {/* 1. Hero Banner - Compact & Clean Top Gap */}
      <section className="relative w-full overflow-hidden border-b border-border-custom bg-[#0B1B3D] text-white py-8 sm:py-10 md:py-12 flex items-center">
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1B3D] via-[#0B1B3D]/85 to-transparent" />
        
        <AnimeScrollReveal direction="top" className="relative max-w-[1550px] mx-auto px-4 sm:px-6 md:px-10 z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A14000]/20 border border-[#A14000]/40 text-[#FFDBCC] text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-[#A14000]" />
            <span>Empowering Global Logistics Intelligence</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight max-w-3xl">
            Driving Efficiency Across <br />
            <span className="text-[#A14000]">Every Mile of Your Fleet</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl font-normal leading-relaxed">
            Discover how FleetManagement connects vehicles, drivers, and operations teams with real-time intelligence, automated workflows, and documented cost savings.
          </p>
        </AnimeScrollReveal>
      </section>

      {/* 2. Our Story Section with Image 1 (/about-delivery-man.png) */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 bg-white border-b border-border-custom">
        <div className="max-w-[1550px] mx-auto space-y-8">
          <AnimeScrollReveal direction="top">
            <ParallaxDepthSection
              title={storyTitle}
              subtitle="Building the future of fleet intelligence"
            />
          </AnimeScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Story Text */}
            <AnimeScrollReveal direction="top" className="lg:col-span-6 space-y-4">
              <h2 className="text-[#A14000] font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-wider block font-display">
                Our Vision & History
              </h2>
              <div className="space-y-3.5 text-body font-medium">
                {storyContent.map((paragraph, idx) => (
                  <p key={idx} className="text-body font-medium text-sm sm:text-base leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </AnimeScrollReveal>

            {/* Right Column: High-Res Fleet Vision & Telemetry Graphic (/about-fleet-vision.jpg) */}
            <AnimeScrollReveal direction="top" className="lg:col-span-6 relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-xl border-4 border-white anime-card-lift max-w-md mx-auto lg:max-w-none bg-[#0B1B3D] h-[340px] sm:h-[380px]">
                <img
                  src="/about-fleet-vision.jpg"
                  alt="Fleet Management Digital Operations & Telemetry Architecture"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3D]/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFDBCC] bg-[#A14000]/80 px-2.5 py-1 rounded-md">Smart Fleet Telemetry & Logistics Suite</span>
                    <p className="font-bold text-xs sm:text-sm">Real-Time GPS Tracking, Asset Health & Driver Analytics</p>
                  </div>
                </div>
              </div>
            </AnimeScrollReveal>
          </div>

          {/* Stats Grid */}
          <AnimeStaggerGroup direction="top" className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <GoldFrameCard>
              <div className="p-4 text-center space-y-1">
                <CountUpNumber endValue={parseInt(statsFounded) || 2018} duration={1.5} className="text-2xl text-heading block font-black" />
                <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block font-display">Founded</span>
              </div>
            </GoldFrameCard>

            <GoldFrameCard>
              <div className="p-4 text-center space-y-1">
                <CountUpNumber endValue={340} suffix="+" className="text-2xl text-heading block font-black" />
                <span className="text-[9px] font-bold text-secondary uppercase tracking-wider block font-display">Enterprises</span>
              </div>
            </GoldFrameCard>

            <GoldFrameCard>
              <div className="p-4 text-center space-y-1">
                <CountUpNumber endValue={1.2} decimals={1} suffix="M+" className="text-2xl text-heading block font-black" />
                <span className="text-[8.5px] font-bold text-secondary uppercase tracking-wider block font-display leading-tight">Vehicles Tracked</span>
              </div>
            </GoldFrameCard>

            <GoldFrameCard>
              <div className="p-4 text-center space-y-1">
                <CountUpNumber endValue={180} prefix="$" suffix="M+" className="text-2xl text-heading block font-black" />
                <span className="text-[8.5px] font-bold text-secondary uppercase tracking-wider block font-display leading-tight">Customer Savings</span>
              </div>
            </GoldFrameCard>
          </AnimeStaggerGroup>
        </div>
      </section>

      {/* 3. Our Mission Section (Left Text + Right Image 2 /about-delivery-truck.png) */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-8 bg-slate-50/70 border-b border-border-custom">
        <div className="max-w-[1550px] mx-auto space-y-8">
          <AnimeScrollReveal direction="top">
            <ParallaxDepthSection
              title={missionTitle}
              subtitle="Our Core Principles & Purpose"
            />
          </AnimeScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Text & Principles */}
            <AnimeScrollReveal direction="top" className="lg:col-span-6 space-y-6">
              <div className="space-y-4 text-body font-medium">
                {missionContent.map((paragraph, idx) => (
                  <p key={idx} className="text-body font-medium text-base sm:text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Quote Block */}
              <div className="border-l-4 border-[#A14000] pl-4 italic text-[#0B1B3D] font-semibold text-sm sm:text-base bg-orange-50/60 py-3 rounded-r-xl">
                "{missionQuote}"
              </div>

              {/* Core Principles List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B1B3D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Eye className="h-4.5 w-4.5 text-[#FFDBCC]" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-heading">Total Transparency</h4>
                    <p className="text-xs text-body leading-relaxed">We give fleet operators complete visibility — every vehicle, every driver, every mile.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B1B3D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="h-4.5 w-4.5 text-[#FFDBCC]" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-heading">Reliability First</h4>
                    <p className="text-xs text-body leading-relaxed">Our 99.97% uptime SLA keeps your operations moving. Never depend on a flaky platform.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-[#0B1B3D] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Award className="h-4.5 w-4.5 text-[#FFDBCC]" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-heading">Outcome-Driven</h4>
                    <p className="text-xs text-body leading-relaxed">We measure our success by your cost savings, not just platform adoption.</p>
                  </div>
                </div>
              </div>
            </AnimeScrollReveal>

            {/* Right Column: Image 2 (/about-delivery-truck.png - Clean Red Delivery Cargo Loading Illustration) */}
            <AnimeScrollReveal direction="top" className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xl text-center anime-card-lift">
                <div className="relative overflow-hidden rounded-2xl bg-white p-2 sm:p-4 flex items-center justify-center border border-slate-100">
                  <img
                    src="/about-delivery-truck.png"
                    alt="Commercial Red Delivery Cargo Truck Loading Operations"
                    className="w-full h-auto max-h-[340px] sm:max-h-[380px] object-contain mx-auto"
                  />
                </div>
                <span className="text-xs font-bold text-[#0B1B3D] font-display uppercase tracking-wider block mt-4">
                  Smart Fleet Freight & Logistics Architecture
                </span>
              </div>
            </AnimeScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. Journey Timeline Section - Compact Spacing */}
      <section className="py-8 sm:py-10 px-4 sm:px-6 md:px-8 bg-white text-center border-b border-border-custom">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <AnimeScrollReveal direction="top">
            <ParallaxDepthSection
              title="Our Journey"
              subtitle="Milestones & Growth Along the Way"
            />
          </AnimeScrollReveal>

          <AnimeStaggerGroup direction="top" className="relative space-y-6 md:space-y-8 before:absolute before:top-0 before:bottom-0 before:left-3 md:before:left-1/2 before:w-[2px] before:bg-gradient-to-b before:from-secondary/20 before:via-secondary/40 before:to-secondary/20">
            {timelineItems.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={idx}
                  className={`timeline-item-group relative flex flex-col md:flex-row items-start md:items-center ${
                    isEven ? "md:justify-start" : "md:justify-end"
                  } pl-8 md:pl-0 group`}
                >
                  <div
                    className="timeline-dot absolute left-[4px] md:left-1/2 top-3 md:top-1/2 -translate-y-0 md:-translate-y-1/2 -translate-x-0 md:-translate-x-1/2 h-4 w-4 rounded-full bg-secondary border-2 border-white shadow-md z-10"
                    title={`Milestone ${item.year}`}
                  />
                  <div
                    className={`w-full md:w-[calc(50%-2rem)] text-left ${
                      isEven ? "md:text-right md:pr-8" : "md:text-left md:pl-8"
                    }`}
                  >
                    <div className="timeline-card-box p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-xs space-y-1">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#A14000]/10 text-[#A14000] font-black text-xs font-display">
                        {item.year}
                      </div>
                      <p className={`text-xs text-body font-medium leading-relaxed max-w-sm md:max-w-none ${
                        isEven ? "md:ml-auto md:mr-0" : "md:mr-auto md:ml-0"
                      }`}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </AnimeStaggerGroup>
        </div>
      </section>
    </div>
  );
}
