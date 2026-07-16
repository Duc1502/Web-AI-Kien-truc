interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}

export default function KpiCard({ label, value, hint, highlight }: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 space-y-1 ${
        highlight
          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          : "border-slate-800 bg-[#111827]/60"
      }`}
    >
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`text-2xl font-black ${highlight ? "text-violet-300" : "text-white"}`}>{value}</div>
      {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}
