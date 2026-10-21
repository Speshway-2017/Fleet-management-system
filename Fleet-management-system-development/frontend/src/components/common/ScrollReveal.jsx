import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { fadeUp, revealFromLeft, revealFromRight, staggerReveal, pageEnterAnimation } from "@/utils/animeUtils";

/**
 * ScrollReveal Component - Powered by Anime.js
 * Clean scroll reveal with IntersectionObserver. Triggers ONCE per visit.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.8,
  direction = "up",
  distance = 25,
  stagger = false,
  staggerDelay = 0.1,
  className = "",
  once = true
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animInstance = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (stagger) {
            const targets = el.children;
            if (targets && targets.length > 0) {
              animInstance = staggerReveal(targets, {
                staggerDelay: staggerDelay * 1000,
                duration: duration * 1000,
                delay: delay * 1000,
                distance,
              });
            }
          } else {
            if (direction === "left") {
              animInstance = revealFromLeft(el, { distance, delay: delay * 1000, duration: duration * 1000 });
            } else if (direction === "right") {
              animInstance = revealFromRight(el, { distance, delay: delay * 1000, duration: duration * 1000 });
            } else {
              animInstance = fadeUp(el, { distance, delay: delay * 1000, duration: duration * 1000 });
            }
          }
          if (once) observer.unobserve(el);
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
  }, [direction, distance, delay, duration, stagger, staggerDelay, once]);

  return (
    <div ref={containerRef} className={className} style={stagger ? {} : { opacity: 0 }}>
      {children}
    </div>
  );
}

export function ScrollRevealItem({
  children,
  duration = 0.7,
  direction = "up",
  distance = 20,
  className = ""
}) {
  return (
    <div className={`anime-reveal-item ${className}`} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/**
 * PageTransition Component - Powered by Anime.js
 */
export function PageTransition({ children, className = "" }) {
  const pageRef = useRef(null);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const anim = pageEnterAnimation(el);

    return () => {
      if (anim) {
        try {
          anim.pause();
        } catch (_) {}
      }
      anime.remove(el);
    };
  }, []);

  return (
    <div ref={pageRef} className={`w-full flex-1 ${className}`} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
