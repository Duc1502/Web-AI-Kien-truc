import React, { useState } from "react";
import { X, MapPin } from "lucide-react";

export interface EditMarker {
  id: string;
  x: number; // percentage 0-100, top-left corner relative to image width
  y: number; // percentage 0-100, top-left corner relative to image height
  width: number; // percentage 0-100, relative to image width
  height: number; // percentage 0-100, relative to image height
  text: string;
}

interface ImageAnnotatorProps {
  image: string;
  markers: EditMarker[];
  onChange: (markers: EditMarker[]) => void;
  maxMarkers?: number;
}

// Minimum drag size (in % of image dimension) before a rectangle counts as a real
// selection rather than an accidental click/tap.
const MIN_BOX_SIZE = 1.5;

interface Point {
  x: number;
  y: number;
}

function toPercentPoint(clientX: number, clientY: number, rect: DOMRect): Point {
  return {
    x: Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)),
    y: Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100)),
  };
}

function normalizeRect(start: Point, end: Point) {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export default function ImageAnnotator({
  image,
  markers,
  onChange,
  maxMarkers = 10,
}: ImageAnnotatorProps) {
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);

  const atLimit = markers.length >= maxMarkers;

  const startDrag = (clientX: number, clientY: number, rect: DOMRect) => {
    if (atLimit) return;
    const point = toPercentPoint(clientX, clientY, rect);
    setDragStart(point);
    setDragCurrent(point);
  };

  const updateDrag = (clientX: number, clientY: number, rect: DOMRect) => {
    if (!dragStart) return;
    setDragCurrent(toPercentPoint(clientX, clientY, rect));
  };

  const finishDrag = () => {
    if (dragStart && dragCurrent) {
      const rect = normalizeRect(dragStart, dragCurrent);
      if (rect.width >= MIN_BOX_SIZE && rect.height >= MIN_BOX_SIZE) {
        onChange([
          ...markers,
          { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...rect, text: "" },
        ]);
      }
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    startDrag(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateDrag(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };
  const handleMouseUp = () => finishDrag();
  const handleMouseLeave = () => {
    if (dragStart) finishDrag();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY, e.currentTarget.getBoundingClientRect());
  };
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    updateDrag(touch.clientX, touch.clientY, e.currentTarget.getBoundingClientRect());
  };
  const handleTouchEnd = () => finishDrag();

  const removeMarker = (id: string) => {
    onChange(markers.filter((m) => m.id !== id));
  };

  const updateMarkerText = (id: string, text: string) => {
    onChange(markers.map((m) => (m.id === id ? { ...m, text } : m)));
  };

  const draftRect = dragStart && dragCurrent ? normalizeRect(dragStart, dragCurrent) : null;

  return (
    <div className="space-y-3">
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full rounded-xl overflow-hidden border border-slate-800 select-none touch-none ${
          atLimit ? "cursor-not-allowed" : "cursor-crosshair"
        }`}
      >
        <img src={image} alt="Ảnh cần chỉnh sửa" className="w-full h-auto block pointer-events-none" draggable={false} />

        {markers.map((marker, idx) => (
          <div
            key={marker.id}
            style={{
              left: `${marker.x}%`,
              top: `${marker.y}%`,
              width: `${marker.width}%`,
              height: `${marker.height}%`,
            }}
            className="absolute border-2 border-violet-500 bg-violet-500/15 group/marker"
          >
            <div className="absolute -top-3 -left-3 flex items-center justify-center w-7 h-7 rounded-full bg-violet-600 border-2 border-white text-white text-xs font-black shadow-lg shadow-black/40">
              {idx + 1}
            </div>
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                removeMarker(marker.id);
              }}
              className="absolute -top-3 -right-3 bg-slate-950 hover:bg-red-500 text-white rounded-full p-1 border border-slate-700 opacity-0 group-hover/marker:opacity-100 transition"
              title="Xóa vùng đánh dấu"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {draftRect && (
          <div
            style={{
              left: `${draftRect.x}%`,
              top: `${draftRect.y}%`,
              width: `${draftRect.width}%`,
              height: `${draftRect.height}%`,
            }}
            className="absolute border-2 border-dashed border-violet-400 bg-violet-400/10 pointer-events-none"
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          Kéo để khoanh vùng cần sửa (chọn điểm đầu và điểm cuối) ({markers.length}/{maxMarkers})
        </span>
        {markers.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-slate-500 hover:text-red-400 transition normal-case font-semibold"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {markers.length > 0 && (
        <div className="space-y-2.5">
          {markers.map((marker, idx) => (
            <div key={marker.id} className="flex items-start gap-2.5 bg-[#080B11]/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-center w-6 h-6 shrink-0 rounded-full bg-violet-600 text-white text-[11px] font-black mt-0.5">
                {idx + 1}
              </div>
              <textarea
                value={marker.text}
                onChange={(e) => updateMarkerText(marker.id, e.target.value)}
                placeholder={`Mô tả thay đổi mong muốn tại vùng ${idx + 1}...`}
                rows={2}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none resize-none leading-relaxed"
              />
              <button
                type="button"
                onClick={() => removeMarker(marker.id)}
                className="text-slate-600 hover:text-red-400 transition shrink-0"
                title="Xóa vùng này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Burns the numbered boxes directly into the image pixels (set-of-marks prompting),
// so the image-editing model can visually correlate each numbered instruction with its
// location — plain percentage coordinates in text aren't reliably understood by these models.
export async function renderAnnotatedImage(imageSrc: string, markers: EditMarker[]): Promise<string> {
  if (markers.length === 0) return imageSrc;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(imageSrc);
        return;
      }
      ctx.drawImage(img, 0, 0);

      const badgeRadius = Math.max(16, Math.min(canvas.width, canvas.height) * 0.028);
      const lineWidth = Math.max(3, badgeRadius * 0.35);

      markers.forEach((marker, idx) => {
        const rx = (marker.x / 100) * canvas.width;
        const ry = (marker.y / 100) * canvas.height;
        const rw = (marker.width / 100) * canvas.width;
        const rh = (marker.height / 100) * canvas.height;

        // Box outline
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = "rgba(124, 58, 237, 0.95)";
        ctx.fillStyle = "rgba(124, 58, 237, 0.12)";
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);

        // Number badge at the top-left corner
        const cx = rx;
        const cy = ry;
        ctx.beginPath();
        ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(124, 58, 237, 0.95)";
        ctx.fill();
        ctx.lineWidth = Math.max(2, badgeRadius * 0.12);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(badgeRadius * 1.1)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${idx + 1}`, cx, cy + badgeRadius * 0.05);
      });

      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}
