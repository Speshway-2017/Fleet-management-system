import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { revealFromLeft } from "@/utils/animeUtils";

/**
 * SlideFromLeft Component
 * Slides element from left using Anime.js on scroll (triggers ONCE).
 */
export default function SlideFromLeft({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
  startX = -30
}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let animInstance = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animInstance = revealFromLeft(el, {
            distance: Math.abs(startX),
            delay: delay * 1000,
            duration: duration * 1000,
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animInstance) {
        try {
          animInstance.pause();
        } catch (_) {}
      }
      anime.remove(el);
    };
  }, [startX, duration, delay]);

  return (
    <div ref={elementRef} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
