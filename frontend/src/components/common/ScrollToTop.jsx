import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * Resets window & main container scroll position immediately to (0,0) upon route navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (_) {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}
