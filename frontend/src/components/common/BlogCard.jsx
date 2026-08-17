import { Calendar, Clock, ArrowRight } from "lucide-react";
import GoldFrameCard from "@/components/common/GoldFrameCard";

export default function BlogCard({ image, category, date, readTime, title, summary, onReadMore }) {
  return (
    <GoldFrameCard className="h-full max-w-sm mx-auto w-full">
      <div className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative overflow-hidden h-44 sm:h-48 w-full rounded-t-2xl">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-[#A14000] text-[10px] font-bold shadow-xs uppercase tracking-wider">
              {category}
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-5 flex flex-col flex-grow space-y-3">
          {/* Meta Info: Date and Read Time */}
          <div className="flex items-center gap-3.5 text-[11px] text-gray-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#A14000]" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#A14000]" />
              <span>{readTime}</span>
            </div>
          </div>

          {/* Title & Summary */}
          <div className="space-y-1.5">
            <h4 className="font-display font-black text-sm sm:text-base text-[#0B1B3D] leading-snug group-hover:text-[#A14000] transition-colors line-clamp-2">
              {title}
            </h4>
            <p className="text-xs text-body font-normal leading-relaxed line-clamp-2">
              {summary}
            </p>
          </div>

          {/* Read More Link */}
          <div className="pt-3 mt-auto border-t border-gray-50 flex items-center justify-between">
            <button
              onClick={onReadMore}
              className="flex items-center gap-1.5 text-xs font-bold text-[#A14000] hover:text-[#853500] transition-colors group/btn cursor-pointer"
            >
              <span>Read More</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </GoldFrameCard>
  );
}
