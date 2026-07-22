import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatNumber, formatVnd } from "@/lib/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

interface UsersPageProps {
  searchParams: Promise<{ q?: string; filter?: string; page?: string }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const filter = params.filter ?? "all"; // all | paid | free | locked
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createSupabaseServerClient();

  // Đọc từ view admin_user_overview để có sẵn render_count + total_deposited_vnd (SQL aggregate).
  let query = supabase
    .from("admin_user_overview")
    .select(
      "id, email, created_at, credits_balance, credits_used_total, plan, is_locked, role, render_count, total_deposited_vnd",
      { count: "exact" }
    );

  if (q) query = query.ilike("email", `%${q}%`);
  if (filter === "paid") query = query.eq("plan", "paid");
  if (filter === "free") query = query.eq("plan", "free");
  if (filter === "locked") query = query.eq("is_locked", true);

  const from = (page - 1) * PAGE_SIZE;
  const { data: users, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const filterTabs = [
    { id: "all", label: "Tất cả" },
    { id: "paid", label: "Trả phí" },
    { id: "free", label: "Free" },
    { id: "locked", label: "Bị khoá" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Người dùng</h1>
        <p className="text-sm text-slate-400">{formatNumber(count ?? 0)} tài khoản</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex gap-2">
          <input type="hidden" name="filter" value={filter} />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Tìm theo email..."
            className="bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
          />
          <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition">
            Tìm
          </button>
        </form>

        <div className="flex gap-1 bg-[#0e1420] border border-slate-800 rounded-lg p-1">
          {filterTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/users?filter=${tab.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                filter === tab.id ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0e1420] text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Ngày đăng ký</th>
              <th className="text-right px-4 py-3">Số dư credit</th>
              <th className="text-right px-4 py-3">Đã dùng</th>
              <th className="text-right px-4 py-3">Số render</th>
              <th className="text-right px-4 py-3">Tổng nạp (VND)</th>
              <th className="text-left px-4 py-3">Gói</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(users ?? []).map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="text-violet-400 hover:text-violet-300 font-semibold">
                    {user.email}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(user.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-amber-400">{formatNumber(user.credits_balance)}</td>
                <td className="px-4 py-3 text-right text-slate-400">{formatNumber(user.credits_used_total)}</td>
                <td className="px-4 py-3 text-right text-slate-400">{formatNumber(user.render_count)}</td>
                <td className="px-4 py-3 text-right text-emerald-400">{formatVnd(user.total_deposited_vnd)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    user.plan === "paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700/50 text-slate-400"
                  }`}>
                    {user.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.is_locked ? (
                    <span className="text-red-400 font-bold text-xs">Đã khoá</span>
                  ) : (
                    <span className="text-emerald-400 font-bold text-xs">Hoạt động</span>
                  )}
                </td>
              </tr>
            ))}
            {(users ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Không tìm thấy user nào.
                </td>
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
              href={`/admin/users?page=${p}&filter=${filter}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
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
