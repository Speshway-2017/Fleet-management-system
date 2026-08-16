import React from "react";

/**
 * DashboardSkeletonLoader Component
 * Multi-variant skeleton loader matching exact page layout structures.
 * Renders layout skeleton immediately on route change / data load for fast, smooth user experience.
 */
export default function DashboardSkeletonLoader({
  title = "Loading Page Data...",
  variant = "dashboard", // "dashboard" | "table" | "list" | "map" | "form" | "details" | "analytics" | "reports"
}) {
  // Render layout matching the target page structure immediately
  switch (variant) {
    case "table":
    case "list":
      return <TableSkeleton title={title} />;
    case "map":
      return <MapSkeleton title={title} />;
    case "form":
    case "details":
      return <FormDetailsSkeleton title={title} />;
    case "analytics":
    case "reports":
      return <AnalyticsSkeleton title={title} />;
    case "dashboard":
    default:
      return <DashboardSkeleton title={title} />;
  }
}

/* 1. Dashboard Skeleton (Header + 4 KPI Cards + Chart + Sidebar) */
function DashboardSkeleton({ title }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans animate-fade-in">
      {/* Title Bar Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-xs animate-pulse space-y-3">
        <div className="h-7 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-4 w-96 bg-slate-100 dark:bg-slate-700/50 rounded" />
      </div>

      {/* 4 KPI Cards Skeleton Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700" />
            </div>
            <div className="h-8 w-20 bg-slate-300 dark:bg-slate-600 rounded-lg" />
            <div className="h-3 w-28 bg-slate-100 dark:bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content & Sidebar Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-xs animate-pulse space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-700/40 rounded-xl flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#A14000] border-t-transparent" />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs animate-pulse h-56 flex flex-col justify-between">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-32 bg-slate-100 dark:bg-slate-700/40 rounded-full w-32 mx-auto border-4 border-slate-200 dark:border-slate-600" />
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs animate-pulse h-56 space-y-3">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2. Table / List Skeleton (Header + Search/Filter Bar + Table Rows) */
function TableSkeleton({ title }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans animate-fade-in">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs animate-pulse">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-slate-700/50 rounded" />
        </div>
        <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Search & Filter Controls Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs animate-pulse flex flex-wrap items-center justify-between gap-4">
        <div className="h-10 w-64 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
          <div className="h-10 w-28 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
        </div>
      </div>

      {/* Table Container Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs overflow-hidden animate-pulse">
        {/* Table Header */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 p-4 grid grid-cols-12 gap-4">
          <div className="col-span-1 h-4 bg-slate-200 dark:bg-slate-700 rounded w-6" />
          <div className="col-span-3 h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          <div className="col-span-3 h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" />
          <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
          <div className="col-span-2 h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
          <div className="col-span-1 h-4 bg-slate-200 dark:bg-slate-700 rounded w-8 justify-self-end" />
        </div>

        {/* 6 Skeleton Table Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="space-y-1.5 w-full">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700/50 rounded" />
                </div>
              </div>
              <div className="col-span-3 space-y-1.5">
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-24 bg-slate-100 dark:bg-slate-700/50 rounded" />
              </div>
              <div className="col-span-2">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="col-span-2">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="col-span-1 flex justify-end">
                <div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 3. Map View Skeleton (Header Status Pills + Full Canvas Map Area + Floating Controls) */
function MapSkeleton({ title }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans animate-fade-in">
      {/* Top Header Bar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 dark:bg-slate-700/50 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>

      {/* Map Canvas Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Vehicles List Panel Skeleton */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-4 shadow-xs animate-pulse space-y-4 flex flex-col">
          <div className="h-10 bg-slate-100 dark:bg-slate-700/60 rounded-xl w-full" />
          <div className="space-y-3 flex-1 overflow-hidden">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/40 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-700/50 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Map View Canvas Skeleton */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-xs animate-pulse relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-slate-200/40 dark:bg-slate-700/20 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 flex flex-col items-center space-y-3 bg-white/90 dark:bg-slate-900/90 p-6 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 backdrop-blur-md">
            <div className="animate-spin rounded-full h-9 w-9 border-4 border-[#A14000] border-t-transparent" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          {/* Map Controls Floating Skeleton */}
          <div className="absolute bottom-6 right-6 space-y-2">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700" />
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 4. Form / Details Skeleton (Breadcrumb + Form Input Grid / Detail Panels) */
function FormDetailsSkeleton({ title }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto min-h-screen font-sans animate-fade-in">
      {/* Header & Back Button */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs animate-pulse flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-64 bg-slate-100 dark:bg-slate-700/50 rounded" />
          </div>
        </div>
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Main Form Card Skeleton */}
      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs animate-pulse space-y-6">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded pb-2 border-b border-slate-100 dark:border-slate-700" />

        {/* 2-Column Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-11 w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-700" />
            </div>
          ))}
        </div>

        {/* Full Width Field / Textarea */}
        <div className="space-y-2 pt-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-28 w-full bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200/60 dark:border-slate-700" />
        </div>

        {/* Form Action Buttons Footer */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
          <div className="h-10 w-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* 5. Analytics / Reports Skeleton (Header Date Tabs + 4 Stats + 2x2 Chart Grid) */
function AnalyticsSkeleton({ title }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen font-sans animate-fade-in">
      {/* Header & Date Range Picker */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-80 bg-slate-100 dark:bg-slate-700/50 rounded" />
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-700/60 p-1.5 rounded-xl">
          <div className="h-8 w-20 bg-white dark:bg-slate-600 rounded-lg shadow-xs" />
          <div className="h-8 w-20 bg-transparent rounded-lg" />
          <div className="h-8 w-20 bg-transparent rounded-lg" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-5 shadow-xs animate-pulse space-y-3">
            <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded-lg" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>

      {/* 2x2 Chart Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-xs animate-pulse space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
              <div className="h-5 w-44 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-7 w-20 bg-slate-100 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-56 bg-slate-100 dark:bg-slate-700/40 rounded-xl flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#A14000] border-t-transparent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
