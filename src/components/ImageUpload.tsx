import React, { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageSelected: (base64String: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

export default function ImageUpload({
  onImageSelected,
  selectedImage,
  onClear,
}: ImageUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp tin hình ảnh hợp lệ (PNG, JPG, JPEG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.8 quality
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
          onImageSelected(compressedBase64);
        } else {
          onImageSelected(event.target.result as string);
        }
      };
      img.onerror = () => {
        onImageSelected(event.target?.result as string);
      };
      img.src = event.target.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />

      {selectedImage ? (
        <div className="relative group rounded-2xl overflow-hidden border border-zinc-200 shadow-md aspect-video max-h-[350px] bg-zinc-50 flex items-center justify-center">
          <img
            src={selectedImage}
            alt="Original Preview"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              className="bg-white text-zinc-900 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition shadow"
            >
              Thay đổi ảnh
            </button>
            <button
              type="button"
              onClick={onClear}
              className="bg-rose-600 text-white p-2 rounded-xl hover:bg-rose-700 transition shadow"
              title="Xóa ảnh"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 bg-zinc-900/60 backdrop-blur-md text-white p-1.5 rounded-full hover:bg-zinc-900 transition md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition aspect-video max-h-[350px] min-h-[220px] ${
            isDragActive
              ? "border-teal-500 bg-teal-50/50 text-teal-600"
              : "border-zinc-300 hover:border-teal-400 hover:bg-zinc-50/50 text-zinc-500"
          }`}
        >
          <div className="p-4 bg-teal-50 text-teal-600 rounded-full mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="font-semibold text-zinc-800 text-base mb-1">
            Kéo thả ảnh phòng vào đây, hoặc click để chọn tệp
          </p>
          <p className="text-sm text-zinc-500 max-w-xs mb-4">
            Hỗ trợ PNG, JPG, JPEG chất lượng cao lên đến 10MB
          </p>
          <div className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition">
            <ImageIcon className="w-4 h-4" />
            Chọn ảnh hiện tại
          </div>
        </div>
      )}
    </div>
  );
}
