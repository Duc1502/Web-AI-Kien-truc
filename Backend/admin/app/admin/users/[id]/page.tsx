import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSignedRenderUrls } from "@/lib/storage";
import { formatNumber, formatVnd } from "@/lib/format";
import { adjustCredit, setAccountLocked, changePlan, resetFreeCredits } from "../actions";

export const dynamic = "force-dynamic";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: user } = await supabase.from("profiles").select("*").eq("id", id).single();
  if (!user) notFound();

  const [{ data: generations }, { data: transactions }, { data: logs }] = await Promise.all([
    supabase
      .from("generations")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("admin_logs")
      .select("*")
      .eq("target_user_id", id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  // Ảnh render lưu ở bucket private → tạo signed URL để hiển thị thumbnail.
  const signedUrls = await getSignedRenderUrls(
    (generations ?? []).flatMap((g) => [g.before_image_url, g.after_image_url])
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">{user.email}</h1>
        <p className="text-sm text-slate-400">
          Đăng ký {new Date(user.created_at).toLocaleDateString("vi-VN")} · ID: {user.id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thông tin & hành động admin */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Số dư credit</span>
              <span className="font-black text-amber-400">{formatNumber(user.credits_balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tổng đã dùng</span>
              <span className="font-bold text-white">{formatNumber(user.credits_used_total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Gói</span>
              <span className="font-bold text-white uppercase">{user.plan}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Trạng thái</span>
              <span className={user.is_locked ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                {user.is_locked ? "Đã khoá" : "Hoạt động"}
              </span>
            </div>
          </div>

          {/* Cộng/trừ credit */}
          <form action={adjustCredit.bind(null, id)} className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Cộng/Trừ Credit</h3>
            <input
              type="number"
              name="delta"
              placeholder="VD: 50 hoặc -20"
              required
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
            />
            <textarea
              name="note"
              placeholder="Lý do (bắt buộc) — vd: chuyển khoản VietQR sai nội dung, mã GD #123"
              required
              rows={2}
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold py-2 rounded-lg transition">
              Áp dụng
            </button>
          </form>

          {/* Khoá/mở khoá + đổi gói + reset credit free */}
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Hành động khác</h3>

            <form action={setAccountLocked.bind(null, id)} className="space-y-2">
              <input type="hidden" name="locked" value={(!user.is_locked).toString()} />
              <textarea name="note" placeholder="Lý do (bắt buộc)" required rows={2} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <button type="submit" className={`w-full text-sm font-bold py-2 rounded-lg transition text-white ${user.is_locked ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}>
                {user.is_locked ? "Mở khoá tài khoản" : "Khoá tài khoản"}
              </button>
            </form>

            <form action={changePlan.bind(null, id)} className="space-y-2">
              <select name="plan" defaultValue={user.plan} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
              <textarea name="note" placeholder="Lý do (bắt buộc)" required rows={2} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 rounded-lg transition">
                Đổi gói
              </button>
            </form>

            <form action={resetFreeCredits.bind(null, id)} className="space-y-2">
              <textarea name="note" placeholder="Lý do (bắt buộc)" required rows={2} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
              <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold py-2 rounded-lg transition">
                Đặt lại credit free mặc định
              </button>
            </form>
          </div>
        </div>

        {/* Lịch sử */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">Lịch sử render</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(generations ?? []).map((g) => {
                const beforeUrl = g.before_image_url ? signedUrls[g.before_image_url] : undefined;
                const afterUrl = g.after_image_url ? signedUrls[g.after_image_url] : undefined;
                return (
                  <div key={g.id} className="flex items-center gap-3 text-xs border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1 shrink-0">
                      {beforeUrl ? (
                        <img src={beforeUrl} alt="Ảnh gốc" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#0e1420] border border-slate-800" />
                      )}
                      <span className="text-slate-600">→</span>
                      {afterUrl ? (
                        <img src={afterUrl} alt="Ảnh kết quả" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#0e1420] border border-slate-800" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-300 font-semibold">{g.room_type} · {g.style}</div>
                      <div className="text-slate-500">{new Date(g.created_at).toLocaleString("vi-VN")}</div>
                    </div>
                    <div className={g.status === "success" ? "text-emerald-400" : "text-red-400"}>
                      {g.status === "success" ? `-${g.credits_spent} cr` : "Lỗi"}
                    </div>
                  </div>
                );
              })}
              {(generations ?? []).length === 0 && <p className="text-xs text-slate-500">Chưa có lượt render nào.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">Lịch sử giao dịch</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(transactions ?? []).map((t) => (
                <div key={t.id} className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-slate-300 font-semibold">{formatVnd(t.amount_vnd)} · {t.method}</div>
                    <div className="text-slate-500">{new Date(t.created_at).toLocaleString("vi-VN")}</div>
                  </div>
                  <span className="text-slate-400">{t.status}</span>
                </div>
              ))}
              {(transactions ?? []).length === 0 && <p className="text-xs text-slate-500">Chưa có giao dịch nào.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">Lịch sử thao tác admin (audit log)</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {(logs ?? []).map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-800 pb-2">
                  <div className="text-slate-300 font-semibold">{log.action}</div>
                  <div className="text-slate-500">{log.note}</div>
                  <div className="text-slate-600">{new Date(log.created_at).toLocaleString("vi-VN")}</div>
                </div>
              ))}
              {(logs ?? []).length === 0 && <p className="text-xs text-slate-500">Chưa có thao tác admin nào trên tài khoản này.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
