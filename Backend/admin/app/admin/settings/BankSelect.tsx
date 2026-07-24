"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { VN_BANKS } from "@/lib/vn-banks";

// Bỏ dấu tiếng Việt để tìm kiếm không cần gõ dấu (vd "techcom", "ngoai thuong").
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // bỏ các dấu tổ hợp (huyền/sắc/hỏi/ngã/nặng...)
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

interface BankSelectProps {
  name?: string;
  defaultValue?: string;
}

// Combobox chọn 1 ngân hàng, có ô tìm kiếm. Ghi giá trị (code) vào input ẩn để form gửi kèm.
export default function BankSelect({ name = "bank_code", defaultValue = "" }: BankSelectProps) {
  const [selected, setSelected] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedBank = VN_BANKS.find((b) => b.code === selected);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return VN_BANKS;
    return VN_BANKS.filter(
      (b) => normalize(b.shortName).includes(q) || normalize(b.fullName).includes(q) || normalize(b.code).includes(q)
    );
  }, [query]);

  // Đóng khi click ra ngoài.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Focus ô tìm kiếm khi mở.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function choose(code: string) {
    setSelected(code);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Giá trị thật gửi kèm form */}
      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-left"
      >
        {selectedBank ? (
          <span className="text-white">
            <span className="font-bold">{selectedBank.shortName}</span>
            <span className="text-slate-500"> — {selectedBank.fullName}</span>
          </span>
        ) : (
          <span className="text-slate-500">Chọn ngân hàng...</span>
        )}
        <svg className="w-4 h-4 text-slate-500 shrink-0 ml-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.4a.75.75 0 01-1.08 0l-4.25-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-[#0e1420] border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm ngân hàng (vd: vietcom, techcom, quan doi...)"
              className="w-full bg-[#151d2f] border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.map((b) => (
              <button
                key={b.code}
                type="button"
                onClick={() => choose(b.code)}
                className={`w-full text-left px-3 py-2 text-sm transition hover:bg-violet-600/20 ${
                  b.code === selected ? "bg-violet-600/10" : ""
                }`}
              >
                <span className="font-bold text-white">{b.shortName}</span>
                <span className="text-slate-500 text-xs"> — {b.fullName}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-slate-500 text-center">Không tìm thấy ngân hàng phù hợp.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
