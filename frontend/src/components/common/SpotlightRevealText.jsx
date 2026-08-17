import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * SpotlightRevealText Component
 * Character-by-character spotlight reveal animation (opacity 0.1 -> 1, scale 0.8 -> 1, blur 4px -> 0px)
 * staggered from center using GSAP.
 */
export default function SpotlightRevealText({
  text,
  as: Component = "h2",
  className = "",
  delay = 0,
  staggerEach = 0.04
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const charEls = el.querySelectorAll(".spotlight-char");
    if (!charEls.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        charEls,
        {
          opacity: 0.1,
          scale: 0.8,
          filter: "blur(4px)",
        },
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.5,
          delay: delay,
          ease: "power2.out",
          stagger: {
            each: staggerEach,
            from: "center",
          },
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, delay, staggerEach]);

  if (typeof text !== "string") {
    return <Component className={className}>{text}</Component>;
  }

  // Split words & characters while keeping space
  const words = text.split(" ");

  return (
    <Component ref={containerRef} className={`inline-block ${className}`}>
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              className="spotlight-char inline-block will-change-[transform,opacity,filter]"
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Component>
  );
}
