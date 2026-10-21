import React, { useEffect, useRef } from "react";
import anime from "animejs";
import {
  fadeUp,
  fadeIn,
  revealFromLeft,
  revealFromRight,
  revealFromTop,
  staggerReveal,
  staggerRevealLeft,
  staggerRevealTop,
  pageEnterAnimation,
} from "@/utils/animeUtils";

/**
 * Safely extracts target elements without selector syntax errors
 */
function getTargetElements(el, childSelector) {
  if (!el) return [];
  if (!childSelector || childSelector === "> *" || childSelector === "*") {
    return Array.from(el.children);
  }
  try {
    const list = el.querySelectorAll(childSelector);
    return list && list.length > 0 ? Array.from(list) : Array.from(el.children);
  } catch (_) {
    return Array.from(el.children);
  }
}

/**
 * AnimeScrollReveal Component
 * Smooth, slow Anime.js scroll reveal for text, images, section headers, and cards from left to right.
 * Replays freshly whenever scrolling into view.
 */
export function AnimeScrollReveal({
  children,
  direction = "top",
  distance = 35,
  delay = 0,
  duration = 900,
  threshold = 0.12,
  className = "",
  style = {},
  ...props
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animInstance = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (direction === "left") {
            animInstance = revealFromLeft(el, { distance, delay, duration });
          } else if (direction === "right") {
            animInstance = revealFromRight(el, { distance, delay, duration });
          } else if (direction === "top") {
            animInstance = revealFromTop(el, { distance, delay, duration });
          } else if (direction === "none") {
            animInstance = fadeIn(el, { delay, duration });
          } else {
            animInstance = fadeUp(el, { distance, delay, duration });
          }
          // Animate once top-to-bottom and unobserve so scrolling back up bottom-to-top does not reset or replay
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -20px 0px" }
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
  }, [direction, distance, delay, duration, threshold]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ opacity: 0, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * AnimeStaggerGroup Component
 * Staggers children reveal slowly from top to bottom.
 * Animates once top-to-bottom; no bottom-to-top resets.
 */
export function AnimeStaggerGroup({
  children,
  direction = "top",
  staggerDelay = 130,
  distance = 35,
  duration = 900,
  threshold = 0.1,
  className = "",
  childSelector = null,
  ...props
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let animInstance = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const targets = getTargetElements(el, childSelector);
        if (!targets || targets.length === 0) return;

        if (entry.isIntersecting) {
          if (direction === "left") {
            animInstance = staggerRevealLeft(targets, {
              staggerDelay,
              distance,
              duration,
            });
          } else if (direction === "top") {
            animInstance = staggerRevealTop(targets, {
              staggerDelay,
              distance,
              duration,
            });
          } else {
            animInstance = staggerReveal(targets, {
              staggerDelay,
              distance,
              duration,
            });
          }
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -20px 0px" }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animInstance) {
        try {
          animInstance.pause();
        } catch (_) {}
      }
      const targets = getTargetElements(el, childSelector);
      if (targets && targets.length > 0) anime.remove(targets);
    };
  }, [direction, staggerDelay, distance, duration, threshold, childSelector]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}

/**
 * AnimePageTransition Component
 * Smooth non-flashing page route transition.
 */
export function AnimePageTransition({ children, className = "" }) {
  return (
    <div className={`w-full flex-1 ${className}`}>
      {children}
    </div>
  );
}

export default AnimeScrollReveal;

