import React from "react";

export default function StatusBadge({ status, label, type, size = "md", dot = true, className = "" }) {
  const getVariant = (str = "") => {
    if (type) return type;
    const s = str.toString().toLowerCase().trim();

    if (
      s.includes("active") ||
      s.includes("available") ||
      s.includes("completed") ||
      s.includes("delivered") ||
      s.includes("success") ||
      s.includes("resolved") ||
      s.includes("paid")
    ) {
      return "emerald";
    }

    if (
      s.includes("trip") ||
      s.includes("assigned") ||
      s.includes("in transit") ||
      s.includes("progress") ||
      s.includes("scheduled") ||
      s.includes("info")
    ) {
      return "blue";
    }

    if (
      s.includes("maintenance") ||
      s.includes("pending") ||
      s.includes("idle") ||
      s.includes("warning") ||
      s.includes("open") ||
      s.includes("need maintenance")
    ) {
      return "amber";
    }

    if (
      s.includes("overdue") ||
      s.includes("critical") ||
      s.includes("high") ||
      s.includes("failed") ||
      s.includes("cancelled") ||
      s.includes("inactive") ||
      s.includes("out of service") ||
      s.includes("expired")
    ) {
      return "rose";
    }

    return "slate";
  };

  const variant = getVariant(status || label || "");

  const styles = {
    emerald: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
      dot: "bg-emerald-500",
    },
    blue: {
      bg: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50",
      dot: "bg-blue-500",
    },
    amber: {
      bg: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
      dot: "bg-amber-500",
    },
    rose: {
      bg: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50",
      dot: "bg-rose-500",
    },
    slate: {
      bg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      dot: "bg-slate-400",
    },
  };

  const selected = styles[variant] || styles.slate;
  const sizeClasses = size === "sm" 
    ? "px-2 py-0.5 text-[10px] font-bold" 
    : "px-2.5 py-1 text-xs font-bold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-poppins tracking-wide ${sizeClasses} ${selected.bg} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected.dot}`} />}
      <span className="truncate">{label || status || "Unknown"}</span>
    </span>
  );
}
