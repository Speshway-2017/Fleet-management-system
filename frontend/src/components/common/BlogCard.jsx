import { Calendar, Clock, ArrowRight } from "lucide-react";
import GoldFrameCard from "@/components/common/GoldFrameCard";

export default function BlogCard({ image, category, date, readTime, title, summary, onReadMore }) {
  return (
    <GoldFrameCard className="h-full max-w-sm mx-auto w-full">
      <div className="flex flex-col h-full justify-between min-w-0">
        {/* Top Section: Image & Content */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Image Container */}
          <div className="relative overflow-hidden h-44 sm:h-48 w-full rounded-t-2xl shrink-0 bg-slate-100">
            <img
              src={image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"}
              alt={title || "Blog Image"}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3 z-10 max-w-[80%]">
              <span 
                className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[#A14000] text-[10px] font-bold shadow-xs uppercase tracking-wider block truncate"
                title={category}
              >
                {category || "Operations"}
              </span>
            </div>
          </div>

          {/* Content Container */}
          <div className="p-4 sm:p-5 flex flex-col space-y-3 min-w-0 flex-1">
            {/* Meta Info: Date and Read Time */}
            <div className="flex items-center justify-between gap-2 text-[11px] text-gray-500 font-semibold min-w-0 pb-2 border-b border-gray-100/80">
              <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                <Calendar className="w-3.5 h-3.5 text-[#A14000] shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[130px]" title={date}>{date || "Recent"}</span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0 justify-end flex-1">
                <Clock className="w-3.5 h-3.5 text-[#A14000] shrink-0" />
                <span className="truncate text-right block max-w-full" title={readTime}>{readTime || "5 min read"}</span>
              </div>
            </div>

            {/* Title & Summary */}
            <div className="space-y-2 min-w-0 flex-1 flex flex-col">
              <h4 
                className="font-display font-black text-sm sm:text-base text-[#0B1B3D] leading-snug group-hover:text-[#A14000] transition-colors line-clamp-2 min-h-[44px] sm:min-h-[48px] flex items-center break-words break-all sm:break-words"
                title={title}
              >
                {title}
              </h4>
              <p 
                className="text-xs text-body font-normal leading-relaxed line-clamp-3 min-h-[54px] sm:min-h-[58px] break-words break-all sm:break-words flex-1"
                title={summary}
              >
                {summary}
              </p>
            </div>
          </div>
        </div>

        {/* Read More Link / Button (Anchored at Bottom) */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 mt-auto border-t border-gray-100 flex items-center justify-between shrink-0">
          <button
            onClick={onReadMore}
            className="flex items-center gap-1.5 text-xs font-bold text-[#A14000] hover:text-[#853500] transition-colors group/btn cursor-pointer"
          >
            <span>Read More</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </GoldFrameCard>
  );
}
