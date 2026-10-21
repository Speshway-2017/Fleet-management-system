/**
 * Anime.js Global Animation Configuration
 * Fleet Management System - Public Pages
 * Design System: Smooth, subtle, slow, and premium enterprise SaaS motion.
 */

export const ANIME_CONFIG = {
  // Easing curves
  easing: {
    smoothOut: "cubicBezier(0.25, 1, 0.5, 1)", // Custom smooth ease-out
    gentleEase: "easeOutCubic",
    easeInOut: "easeInOutQuad",
    continuous: "linear",
  },

  // Animation durations (ms)
  duration: {
    fast: 400,
    normal: 700,
    slow: 1000,
    heroSequence: 1200,
    counter: 1800,
    heroBackground: 28000, // Very slow traveling loop
    pageEnter: 500,
  },

  // Stagger delays (ms)
  stagger: {
    fast: 60,
    normal: 100,
    slow: 150,
  },

  // Offsets and distances
  distance: {
    sm: 15,
    md: 25,
    lg: 40,
  },

  // Scale multipliers
  scale: {
    subtle: 0.98,
    cardHover: 1.02,
    heroBgMin: 1.03,
    heroBgMax: 1.08,
  },
};

/**
 * Checks if the user prefers reduced motion for accessibility.
 */
export const isReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
