import anime from "animejs";
import { ANIME_CONFIG, isReducedMotion } from "@/config/animeConfig";

/**
 * Fade Up animation: opacity 0 -> 1, translateY -> 0
 */
export const fadeUp = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return anime({
      targets,
      opacity: [0, 1],
      duration: ANIME_CONFIG.duration.fast,
      easing: "linear",
      ...options,
    });
  }

  const {
    distance = ANIME_CONFIG.distance.md,
    duration = ANIME_CONFIG.duration.slow,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateY: [distance, 0],
    duration,
    delay,
    easing,
    ...restOptions,
  });
};

/**
 * Pure Fade In animation
 */
export const fadeIn = (targets, options = {}) => {
  if (!targets) return null;

  const {
    duration = ANIME_CONFIG.duration.normal,
    delay = 0,
    easing = "linear",
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    duration,
    delay,
    easing,
    ...restOptions,
  });
};

/**
 * Reveal From Left animation
 */
export const revealFromLeft = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return fadeIn(targets, options);
  }

  const {
    distance = ANIME_CONFIG.distance.lg,
    duration = ANIME_CONFIG.duration.slow,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateX: [-distance, 0],
    duration,
    delay,
    easing,
    ...restOptions,
  });
};

/**
 * Reveal From Right animation
 */
export const revealFromRight = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return fadeIn(targets, options);
  }

  const {
    distance = ANIME_CONFIG.distance.lg,
    duration = ANIME_CONFIG.duration.slow,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateX: [distance, 0],
    duration,
    delay,
    easing,
    ...restOptions,
  });
};

/**
 * Reveal From Top animation
 */
export const revealFromTop = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return fadeIn(targets, options);
  }

  const {
    distance = ANIME_CONFIG.distance.md,
    duration = ANIME_CONFIG.duration.slow,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateY: [-distance, 0],
    duration,
    delay,
    easing,
    ...restOptions,
  });
};

/**
 * Stagger Reveal From Top for footer and lists
 */
export const staggerRevealTop = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return anime({
      targets,
      opacity: [0, 1],
      duration: ANIME_CONFIG.duration.fast,
      easing: "linear",
      ...options,
    });
  }

  const {
    distance = 35,
    staggerDelay = 120,
    duration = 900,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateY: [-distance, 0],
    delay: anime.stagger(staggerDelay, { start: delay }),
    duration,
    easing,
    ...restOptions,
  });
};

/**
 * Stagger Reveal for grid/list cards
 */
export const staggerReveal = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return anime({
      targets,
      opacity: [0, 1],
      duration: ANIME_CONFIG.duration.fast,
      easing: "linear",
      ...options,
    });
  }

  const {
    distance = ANIME_CONFIG.distance.md,
    staggerDelay = ANIME_CONFIG.stagger.normal,
    duration = ANIME_CONFIG.duration.normal,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    scaleFrom = ANIME_CONFIG.scale.subtle,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateY: [distance, 0],
    scale: [scaleFrom, 1],
    delay: anime.stagger(staggerDelay, { start: delay }),
    duration,
    easing,
    ...restOptions,
  });
};

/**
 * Stagger Reveal From Left for lists, points, and history cards
 */
export const staggerRevealLeft = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return anime({
      targets,
      opacity: [0, 1],
      duration: ANIME_CONFIG.duration.fast,
      easing: "linear",
      ...options,
    });
  }

  const {
    distance = 35,
    staggerDelay = 130,
    duration = 900,
    delay = 0,
    easing = ANIME_CONFIG.easing.smoothOut,
    ...restOptions
  } = options;

  return anime({
    targets,
    opacity: [0, 1],
    translateX: [-distance, 0],
    delay: anime.stagger(staggerDelay, { start: delay }),
    duration,
    easing,
    ...restOptions,
  });
};



/**
 * Animate Stat Counter (0 -> endValue)
 */
export const animateCounter = (targetEl, endValue, options = {}) => {
  if (!targetEl) return null;

  const numericTarget = typeof endValue === "number" ? endValue : parseFloat(endValue) || 0;
  const {
    prefix = "",
    suffix = "",
    decimals = 0,
    duration = ANIME_CONFIG.duration.counter,
    easing = "easeOutCubic",
    ...restOptions
  } = options;

  const obj = { value: 0 };

  return anime({
    targets: obj,
    value: numericTarget,
    round: decimals > 0 ? Math.pow(10, decimals) : 1,
    duration,
    easing,
    update: () => {
      if (targetEl) {
        const val = decimals > 0
          ? obj.value.toFixed(decimals)
          : Math.round(obj.value).toLocaleString();
        targetEl.textContent = `${prefix}${val}${suffix}`;
      }
    },
    ...restOptions,
  });
};

/**
 * Hero Page Load Sequence
 * Sequence: Hero bg -> Badge -> Heading -> Description -> Buttons -> Cards
 */
export const heroSequence = (containerEl, options = {}) => {
  if (!containerEl) return null;

  if (isReducedMotion()) {
    return anime({
      targets: containerEl.querySelectorAll("[data-hero-anim]"),
      opacity: [0, 1],
      duration: ANIME_CONFIG.duration.normal,
      easing: "linear",
    });
  }

  const timeline = anime.timeline({
    easing: ANIME_CONFIG.easing.smoothOut,
  });

  const bgEl = containerEl.querySelector("[data-hero-bg]");
  const badgeEl = containerEl.querySelector("[data-hero-badge]");
  const headingEl = containerEl.querySelector("[data-hero-heading]");
  const descEl = containerEl.querySelector("[data-hero-desc]");
  const buttonsEl = containerEl.querySelector("[data-hero-buttons]");
  const trustEl = containerEl.querySelector("[data-hero-trusted]");
  const cardsElements = containerEl.querySelectorAll("[data-hero-card]");

  if (bgEl) {
    timeline.add({
      targets: bgEl,
      opacity: [0, 1],
      scale: [1.05, 1.03],
      duration: 1200,
    });
  }

  if (badgeEl) {
    timeline.add(
      {
        targets: badgeEl,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
      },
      "-=800"
    );
  }

  if (headingEl) {
    timeline.add(
      {
        targets: headingEl,
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 800,
      },
      "-=550"
    );
  }

  if (descEl) {
    timeline.add(
      {
        targets: descEl,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 750,
      },
      "-=600"
    );
  }

  if (buttonsEl) {
    timeline.add(
      {
        targets: buttonsEl,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 700,
      },
      "-=550"
    );
  }

  if (trustEl) {
    timeline.add(
      {
        targets: trustEl,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 600,
      },
      "-=450"
    );
  }

  if (cardsElements && cardsElements.length > 0) {
    timeline.add(
      {
        targets: cardsElements,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.97, 1],
        delay: anime.stagger(100),
        duration: 800,
      },
      "-=400"
    );
  }

  return timeline;
};

/**
 * Continuous Truck Parallax Traveling Animation for Hero Background
 */
export const heroBackgroundAnimation = (bgEl) => {
  if (!bgEl || isReducedMotion()) return null;

  return anime({
    targets: bgEl,
    translateX: [0, -25, 0],
    scale: [ANIME_CONFIG.scale.heroBgMin, ANIME_CONFIG.scale.heroBgMax, ANIME_CONFIG.scale.heroBgMin],
    duration: ANIME_CONFIG.duration.heroBackground,
    easing: "easeInOutQuad",
    loop: true,
  });
};

/**
 * Page entrance transition (Navigation Home -> About -> Features, etc.)
 */
export const pageEnterAnimation = (targets, options = {}) => {
  if (!targets) return null;
  if (isReducedMotion()) {
    return anime({
      targets,
      opacity: [0, 1],
      duration: ANIME_CONFIG.duration.fast,
      easing: "linear",
    });
  }

  return anime({
    targets,
    opacity: [0, 1],
    translateY: [15, 0],
    scale: [0.985, 1],
    duration: ANIME_CONFIG.duration.pageEnter,
    easing: ANIME_CONFIG.easing.smoothOut,
    ...options,
  });
};

/**
 * Enterprise Dashboard Staggered Entrance Sequence
 * Section 1 timing:
 * Title: 0ms, Subtitle: 80ms, Action: 120ms, Banner: 160ms, KPI Cards: 220ms+, Main Sections: 350ms+
 */
export const animateDashboardEntrance = (containerEl) => {
  if (!containerEl) return null;
  if (isReducedMotion()) {
    const allAnimEls = containerEl.querySelectorAll("[data-dash-anim]");
    return anime({
      targets: allAnimEls,
      opacity: [0, 1],
      duration: 300,
      easing: "linear",
    });
  }

  const timeline = anime.timeline({
    easing: "cubicBezier(0.25, 1, 0.5, 1)",
  });

  const titleEl = containerEl.querySelector("[data-dash-title]");
  const subEl = containerEl.querySelector("[data-dash-subtitle]");
  const actionEl = containerEl.querySelector("[data-dash-action]");
  const bannerEl = containerEl.querySelector("[data-dash-banner]");
  const kpiEls = containerEl.querySelectorAll("[data-dash-kpi]");
  const sectionEls = containerEl.querySelectorAll("[data-dash-section]");

  if (titleEl) {
    timeline.add({
      targets: titleEl,
      opacity: [0, 1],
      translateY: [12, 0],
      duration: 400,
    }, 0);
  }

  if (subEl) {
    timeline.add({
      targets: subEl,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
    }, 80);
  }

  if (actionEl) {
    timeline.add({
      targets: actionEl,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 400,
    }, 120);
  }

  if (bannerEl) {
    timeline.add({
      targets: bannerEl,
      opacity: [0, 1],
      translateY: [-5, 0],
      duration: 450,
    }, 160);
  }

  if (kpiEls && kpiEls.length > 0) {
    timeline.add({
      targets: kpiEls,
      opacity: [0, 1],
      translateY: [14, 0],
      delay: anime.stagger(60),
      duration: 500,
    }, 220);
  }

  if (sectionEls && sectionEls.length > 0) {
    timeline.add({
      targets: sectionEls,
      opacity: [0, 1],
      translateY: [16, 0],
      delay: anime.stagger(90),
      duration: 550,
    }, 350);
  }

  return timeline;
};

/**
 * Slide and fade entrance for newly received activity item
 */
export const animateNewActivityItem = (el) => {
  if (!el) return null;
  if (isReducedMotion()) {
    return anime({
      targets: el,
      opacity: [0, 1],
      duration: 200,
    });
  }

  return anime({
    targets: el,
    opacity: [0, 1],
    translateY: [-12, 0],
    duration: 450,
    easing: "cubicBezier(0.25, 1, 0.5, 1)",
  });
};

