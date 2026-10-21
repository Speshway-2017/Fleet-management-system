import { useEffect, useRef } from "react";
import anime from "animejs";
import { isReducedMotion } from "@/config/animeConfig";

/**
 * Hook to trigger entrance animation once when an element enters the viewport.
 * Section 13: Cards entering the viewport
 * Opacity: 0 -> 1, translateY: 12px -> 0. Animate only once.
 */
export function useIntersectionReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isReducedMotion()) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const {
      threshold = 0.1,
      rootMargin = "0px 0px -40px 0px",
      distance = 12,
      duration = 500,
      delay = 0,
      stagger = 0,
      childrenSelector = null,
    } = options;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = childrenSelector
              ? entry.target.querySelectorAll(childrenSelector)
              : entry.target;

            anime({
              targets,
              opacity: [0, 1],
              translateY: [distance, 0],
              duration,
              delay: stagger ? anime.stagger(stagger, { start: delay }) : delay,
              easing: "cubicBezier(0.25, 1, 0.5, 1)",
            });

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [options]);

  return ref;
}
