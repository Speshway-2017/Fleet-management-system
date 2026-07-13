import { Link } from "react-router-dom";

/**
 * Reusable empty-state card for admin detail/edit pages
 * when no entity has been selected yet.
 */
export default function AdminEmptyState({
  icon = "user",        // "user" | "building"
  title,
  description,
  buttonLabel,
  buttonHref,
  tabs,                 // optional JSX for the tab strip above the card
}) {
  return (
    <main className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
      {tabs && tabs}

      <div className="flex flex-col items-center justify-center py-24 text-center">
        {/* Icon circle */}
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          {icon === "building" ? (
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                   M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>

        <h3 className="text-lg font-bold text-slate-700 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-6 max-w-xs">{description}</p>

        <Link
          to={buttonHref}
          className="px-5 py-2.5 bg-[#A14000] text-white rounded-lg text-sm font-bold hover:bg-[#8a3700] transition-colors"
        >
          {buttonLabel}
        </Link>
      </div>
    </main>
  );
}
