import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * ParallaxDepthSection Component
 * Implements 3 scroll-driven parallax depth layers:
 * - .back layer: y: -80 with scrub
 * - .mid layer: y: -40 with scrub
 * - .front layer: y: -20 with scrub
 */
export default function ParallaxDepthSection({
  title = "Parallax Title",
  subtitle = "",
  children,
  className = ""
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const midEl = el.querySelector(".parallax-mid");
    const frontEl = el.querySelector(".parallax-front");

    const ctx = gsap.context(() => {
      if (midEl) {
        gsap.to(midEl, {
          y: -20,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (frontEl) {
        gsap.to(frontEl, {
          y: -10,
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={`relative py-6 sm:py-8 ${className}`}>
      {/* Middle Layer (Main Title) */}
      <div className="parallax-mid relative z-10 text-center space-y-3 px-2">
        <h3 className="font-display text-2xl sm:text-3xl md:text-5xl font-black text-[#0B1B3D] tracking-tight break-words break-all sm:break-words leading-tight max-w-4xl mx-auto">
          {title}
        </h3>
        
        {/* Front Layer (Subtitle / Description) */}
        {subtitle && (
          <p className="parallax-front text-xs sm:text-sm md:text-base text-[#A14000] font-bold tracking-wide max-w-2xl mx-auto break-words leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {children && <div className="relative z-20 mt-8">{children}</div>}
    </div>
  );
}

