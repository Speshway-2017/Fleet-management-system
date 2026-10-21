import React from "react";

/**
 * CountUpNumber Component
 * Displays exact values immediately without counting up from 0.
 * Preserves prefix, suffix, and decimal formatting.
 */
export default function CountUpNumber({
  endValue,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = ""
}) {
  let formattedVal = "";
  if (typeof endValue === "number") {
    formattedVal = endValue.toFixed(decimals);
  } else if (endValue !== undefined && endValue !== null) {
    formattedVal = String(endValue);
  } else {
    formattedVal = "0";
  }

  return (
    <span className={`font-display font-black tracking-tight ${className}`}>
      {prefix}{formattedVal}{suffix}
    </span>
  );
}
