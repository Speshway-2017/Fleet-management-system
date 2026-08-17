import React from "react";
import DashboardSkeletonLoader from "@/components/common/DashboardSkeletonLoader";

/**
 * SmartSkeletonFallback Component
 * React Router Suspense fallback wrapper rendering layout-matched skeletons immediately on route navigation.
 */
export default function SmartSkeletonFallback({
  variant = "dashboard", // "dashboard" | "table" | "list" | "map" | "form" | "details" | "analytics" | "reports"
  title = "Loading...",
}) {
  return <DashboardSkeletonLoader variant={variant} title={title} />;
}
