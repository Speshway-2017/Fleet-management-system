import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * WordRevealParagraph Component
 * Splits paragraph text into individual words and animates them sequentially on scroll.
 * Animates: opacity 0 -> 1, y: 15 -> 0, stagger: 0.04, ease: "power2.out"
 * Matches: font-size: 1.25rem; line-height: 1.8;
 */
export default function WordRevealParagraph({
  children,
  text,
  className = "",
  style = {},
  fontSize = "1.25rem",
  lineHeight = "1.8",
  stagger = 0.04,
  duration = 0.5,
  as: Component = "p",
}) {
  const containerRef = useRef(null);
  const rawText = text || (typeof children === "string" ? children : "");

  // Split into words
  const words = rawText ? rawText.split(/\s+/) : [];

  useEffect(() => {
    const el = containerRef.current;
    if (!el || words.length === 0) return;

    const wordElements = el.querySelectorAll(".word-item");
    if (!wordElements || wordElements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wordElements,
        {
          opacity: 0,
          y: 15,
        },
        {
          opacity: 1,
          y: 0,
          stagger,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "restart none none reset",
            once: false,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [rawText, stagger, duration, words.length]);

  if (words.length === 0) {
    return (
      <Component
        ref={containerRef}
        className={`text ${className}`}
        style={{ fontSize, lineHeight, ...style }}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      ref={containerRef}
      className={`text font-medium ${className}`}
      style={{ fontSize, lineHeight, ...style }}
    >
      {words.map((word, idx) => (
        <span key={idx} className="inline-block word-item mr-1.5 opacity-0">
          {word}
        </span>
      ))}
    </Component>
  );
}
