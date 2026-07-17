import { Calendar, Clock, ArrowRight } from "lucide-react";

export default function BlogCard({ image, category, date, readTime, title, summary, onReadMore }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(161,64,0,0.15)] hover:border-[#A14000]/30 transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[16/10] w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#A14000] text-xs font-bold shadow-sm uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-grow space-y-4">
        {/* Meta Info: Date and Read Time */}
        <div className="flex items-center gap-4 text-xs text-gray-500 font-semibold">
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
        <div className="space-y-2">
          <h4 className="font-display font-black text-base sm:text-lg text-[#0B1B3D] leading-snug group-hover:text-[#A14000] transition-colors line-clamp-2">
            {title}
          </h4>
          <p className="text-xs text-body font-normal leading-relaxed line-clamp-3">
            {summary}
          </p>
        </div>

        {/* Read More Link */}
        <div className="pt-4 mt-auto border-t border-gray-50 flex items-center justify-between">
          <button
            onClick={onReadMore}
            className="flex items-center gap-2 text-xs font-bold text-[#A14000] hover:text-[#853500] transition-colors group/btn cursor-pointer"
          >
            <span>Read More</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
