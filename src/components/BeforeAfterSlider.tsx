import React, { useState, useRef, useEffect } from "react";
import { MoveHorizontal } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-video", "aspect-square", etc.
}

export default function BeforeAfterSlider({
  before,
  after,
  className = "",
  aspectRatio = "aspect-square",
}: BeforeAfterSliderProps) {
  const { t } = useLanguage();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl select-none border border-zinc-200 shadow-lg ${aspectRatio} ${className}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* After Image (lớp nền, full) — lộ ra ở nửa PHẢI, khớp nhãn "Sau/After" */}
      <img
        src={after}
        alt={t("slider.afterAlt")}
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        referrerPolicy="no-referrer"
      />

      <div className="absolute top-4 left-4 bg-zinc-900/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
        {t("slider.before")}
      </div>

      {/* Before Image (lớp phủ, cắt lộ ở nửa TRÁI) — khớp nhãn "Trước/Before" */}
      <img
        src={before}
        alt={t("slider.beforeAlt")}
        className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
        style={{
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
        }}
        referrerPolicy="no-referrer"
      />

      <div className="absolute top-4 right-4 bg-teal-600/85 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
        {t("slider.after")}
      </div>

      {/* Slider Bar */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-2xl"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Slider Button */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white text-teal-600 p-2.5 rounded-full shadow-xl border border-zinc-200 z-30 transition-transform active:scale-110 flex items-center justify-center">
          <MoveHorizontal className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
