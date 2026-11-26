import { useEffect, useRef } from "react";
import anime from "animejs";
import {
  fadeUp,
  fadeIn,
  revealFromLeft,
  revealFromRight,
  staggerReveal,
  animateCounter,
} from "@/utils/animeUtils";

/**
 * Custom React Hook for IntersectionObserver + Anime.js scroll reveals.
 * Runs animation ONCE when element enters viewport.
 * Cleans up on unmount.
 */
export function useAnimeReveal(animationType = "fadeUp", options = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    let animeInstance = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animation once when entering viewport top-to-bottom
            if (animationType === "fadeUp") {
              animeInstance = fadeUp(el, options);
            } else if (animationType === "fadeIn") {
              animeInstance = fadeIn(el, options);
            } else if (animationType === "revealFromLeft") {
              animeInstance = revealFromLeft(el, options);
            } else if (animationType === "revealFromRight") {
              animeInstance = revealFromRight(el, options);
            } else if (animationType === "stagger") {
              const children = options.selector
                ? el.querySelectorAll(options.selector)
                : el.children;
              if (children && children.length > 0) {
                animeInstance = staggerReveal(children, options);
              }
            } else if (animationType === "counter") {
              animeInstance = animateCounter(el, options.endValue, options);
            }
            // Unobserve so animation runs ONLY ONCE top-to-bottom and never resets on bottom-to-top scroll
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: options.threshold || 0.15,
        rootMargin: options.rootMargin || "0px 0px -20px 0px",
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (animeInstance) {
        try {
          animeInstance.pause();
        } catch (_) {}
      }
      anime.remove(el);
    };
  }, [animationType, JSON.stringify(options)]);

  return elementRef;
}

export default useAnimeReveal;
