import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedRenderUrls } from "@/lib/storage";
import { formatNumber, formatUsd, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

interface GenerationsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

interface StyleStatRow {
  style: string;
  total: number;
  errors: number;
  credits_spent: number;
}

export default async function GenerationsPage({ searchParams }: GenerationsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status ?? "all";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("generations")
    .select(
      "id, user_id, room_type, style, resolution, credits_spent, estimated_cost_usd, before_image_url, after_image_url, status, error_message, processing_time_ms, created_at, profiles(email)",
      { count: "exact" }
    );

  if (status === "success" || status === "error") query = query.eq("status", status);

  const from = (page - 1) * PAGE_SIZE;
  const [{ data, count }, { data: styleStats }] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, from + PAGE_SIZE - 1),
    supabase.from("generation_style_stats").select("*"),
  ]);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  // Signed URL cho thumbnail (bucket private).
  const signedUrls = await getSignedRenderUrls(
    (data ?? []).flatMap((g: any) => [g.before_image_url, g.after_image_url])
  );

  // Thống kê phong cách: dùng nhiều nhất + tỉ lệ lỗi cao nhất.
  const stats = (styleStats ?? []) as StyleStatRow[];
  const topByUsage = [...stats].sort((a, b) => b.total - a.total).slice(0, 5);
  const topByErrorRate = [...stats]
    .filter((s) => s.total >= 3) // bỏ mẫu quá nhỏ để tỉ lệ lỗi có ý nghĩa
    .sort((a, b) => b.errors / b.total - a.errors / a.total)
    .slice(0, 5);

  const statusTabs = [
    { id: "all", label: "Tất cả" },
    { id: "success", label: "Thành công" },
    { id: "error", label: "Lỗi" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Lịch sử Render</h1>
        <p className="text-sm text-slate-400">{formatNumber(count ?? 0)} lượt render</p>
      </div>

      {/* Thống kê phong cách */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Phong cách dùng nhiều nhất</h2>
          <div className="space-y-1.5">
            {topByUsage.map((s) => (
              <div key={s.style} className="flex justify-between text-sm">
                <span className="text-slate-300">{s.style}</span>
                <span className="text-violet-400 font-bold">{formatNumber(s.total)}</span>
              </div>
            ))}
            {topByUsage.length === 0 && <p className="text-xs text-slate-500">Chưa có dữ liệu.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Tỉ lệ lỗi cao nhất (≥3 lượt)</h2>
          <div className="space-y-1.5">
            {topByErrorRate.map((s) => (
              <div key={s.style} className="flex justify-between text-sm">
                <span className="text-slate-300">{s.style}</span>
                <span className="text-red-400 font-bold">
                  {formatPercent(s.errors / s.total)} ({s.errors}/{s.total})
                </span>
              </div>
            ))}
            {topByErrorRate.length === 0 && <p className="text-xs text-slate-500">Chưa có dữ liệu.</p>}
          </div>
        </div>
      </div>

      {/* Lọc trạng thái */}
      <div className="flex gap-1 bg-[#0e1420] border border-slate-800 rounded-lg p-1 w-fit">
        {statusTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/generations?status=${tab.id}`}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
              status === tab.id ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0e1420] text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Ảnh</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Loại phòng / Phong cách</th>
              <th className="text-left px-4 py-3">Độ phân giải</th>
              <th className="text-right px-4 py-3">Credit</th>
              <th className="text-right px-4 py-3">Chi phí</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Thời gian xử lý</th>
              <th className="text-left px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(data ?? []).map((g: any) => {
              const beforeUrl = g.before_image_url ? signedUrls[g.before_image_url] : undefined;
              const afterUrl = g.after_image_url ? signedUrls[g.after_image_url] : undefined;
              return (
                <tr key={g.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {beforeUrl ? (
                        <img src={beforeUrl} alt="Ảnh gốc" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#0e1420] border border-slate-800" />
                      )}
                      <span className="text-slate-600 text-xs">→</span>
                      {afterUrl ? (
                        <img src={afterUrl} alt="Ảnh kết quả" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#0e1420] border border-slate-800" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{g.profiles?.email ?? g.user_id}</td>
                  <td className="px-4 py-3 text-slate-300">{g.room_type} · {g.style}</td>
                  <td className="px-4 py-3 text-slate-400">{g.resolution}</td>
                  <td className="px-4 py-3 text-right text-amber-400">{g.credits_spent}</td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {g.estimated_cost_usd != null ? formatUsd(g.estimated_cost_usd) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {g.status === "success" ? (
                      <span className="text-emerald-400 text-xs font-bold">Thành công</span>
                    ) : (
                      <span className="text-red-400 text-xs font-bold" title={g.error_message ?? ""}>Lỗi</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs">
                    {g.processing_time_ms != null ? `${(g.processing_time_ms / 1000).toFixed(1)}s` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(g.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              );
            })}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/generations?page=${p}&status=${status}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition ${
                p === page ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
