import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

interface GenerationsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function GenerationsPage({ searchParams }: GenerationsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status ?? "all";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("generations")
    .select("id, user_id, room_type, style, resolution, credits_spent, status, error_message, processing_time_ms, created_at, profiles(email)", {
      count: "exact",
    });

  if (status === "success" || status === "error") query = query.eq("status", status);

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Lịch sử Render</h1>
        <p className="text-sm text-slate-400">{formatNumber(count ?? 0)} lượt render</p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0e1420] text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Loại phòng / Phong cách</th>
              <th className="text-left px-4 py-3">Độ phân giải</th>
              <th className="text-right px-4 py-3">Credit</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(data ?? []).map((g: any) => (
              <tr key={g.id}>
                <td className="px-4 py-3 text-slate-300">{g.profiles?.email ?? g.user_id}</td>
                <td className="px-4 py-3 text-slate-300">{g.room_type} · {g.style}</td>
                <td className="px-4 py-3 text-slate-400">{g.resolution}</td>
                <td className="px-4 py-3 text-right text-amber-400">{g.credits_spent}</td>
                <td className="px-4 py-3">
                  {g.status === "success" ? (
                    <span className="text-emerald-400 text-xs font-bold">Thành công</span>
                  ) : (
                    <span className="text-red-400 text-xs font-bold" title={g.error_message ?? ""}>Lỗi</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(g.created_at).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có dữ liệu.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
