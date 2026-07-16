import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Check, Sparkles } from "lucide-react";
import { TemplatePost } from "../types";

interface TemplatePostCardProps {
  post: TemplatePost;
  onUsePrompt: (prompt: string) => void;
}

export default function TemplatePostCard({ post, onUsePrompt }: TemplatePostCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const prevImage = () => setImageIndex((i) => (i - 1 + post.images.length) % post.images.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % post.images.length);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111827]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-5 pb-3 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">{post.category}</span>
          <h3 className="text-base font-black text-white leading-snug">{post.title}</h3>
        </div>
      </div>

      {post.images.length > 0 && (
        <div className="relative aspect-video bg-[#080B11] group">
          <img
            src={post.images[imageIndex]}
            alt={`${post.title} - ảnh ${imageIndex + 1}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {post.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition ${idx === imageIndex ? "bg-violet-400 w-4" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="max-h-40 overflow-y-auto rounded-xl bg-[#080B11]/80 border border-slate-800 p-3.5 text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap scrollbar-thin">
          {post.prompt}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Đã sao chép!" : "Copy Prompt"}
          </button>
          <button
            type="button"
            onClick={() => onUsePrompt(post.prompt)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow-[0_0_15px_rgba(139,92,246,0.2)]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sử dụng Prompt này
          </button>
        </div>
      </div>
    </div>
  );
}
