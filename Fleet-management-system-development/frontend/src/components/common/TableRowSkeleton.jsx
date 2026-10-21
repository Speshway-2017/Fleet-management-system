import React from "react";

export default function TableRowSkeleton({ columns = 5, rows = 5 }) {
  const rowArray = Array.from({ length: rows });
  const colArray = Array.from({ length: columns });

  return (
    <>
      {rowArray.map((_, rIdx) => (
        <tr
          key={rIdx}
          className="border-b border-[#E7EAF0]/60 dark:border-slate-800 animate-pulse"
        >
          {colArray.map((_, cIdx) => (
            <td key={cIdx} className="py-4 px-6 whitespace-nowrap">
              <div
                className={`h-4 bg-slate-200 dark:bg-slate-700/60 rounded ${
                  cIdx === 0 ? "w-28" : cIdx === 1 ? "w-36" : "w-20"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
