import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { confirmTransaction, matchTransaction } from "./actions";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

interface TransactionsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

function formatVnd(n: number | null | undefined): string {
  return Number(n ?? 0).toLocaleString("vi-VN") + " đ";
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  success: { label: "Thành công", cls: "text-emerald-400" },
  pending: { label: "Chờ thanh toán", cls: "text-amber-400" },
  unmatched: { label: "Chưa khớp", cls: "text-orange-400" },
  failed: { label: "Thất bại", cls: "text-red-400" },
};

const METHOD_LABEL: Record<string, string> = {
  vietqr: "SePay / VietQR",
  mor: "Lemon Squeezy",
  manual: "Thủ công",
};

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = params.status ?? "all";

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("transactions")
    .select(
      "id, user_id, amount_vnd, package_id, method, status, reference_code, raw_payload, created_at, profiles!transactions_user_id_fkey(email)",
      { count: "exact" }
    );

  if (["success", "pending", "unmatched", "failed"].includes(status)) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const statusTabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ thanh toán" },
    { id: "unmatched", label: "Chưa khớp" },
    { id: "success", label: "Thành công" },
    { id: "failed", label: "Thất bại" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Giao dịch &amp; Đối soát</h1>
        <p className="text-sm text-slate-400">
          {Number(count ?? 0).toLocaleString("vi-VN")} giao dịch. Chuyển khoản khớp mã tự động cộng
          credit qua webhook SePay; giao dịch &quot;Chưa khớp&quot; cần đối soát thủ công bên dưới.
        </p>
      </div>

      {/* Lọc trạng thái */}
      <div className="flex flex-wrap gap-1 bg-[#0e1420] border border-slate-800 rounded-lg p-1 w-fit">
        {statusTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/transactions?status=${tab.id}`}
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
              <th className="text-left px-4 py-3">Thời gian</th>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Gói</th>
              <th className="text-right px-4 py-3">Số tiền</th>
              <th className="text-left px-4 py-3">Kênh</th>
              <th className="text-left px-4 py-3">Mã / Nội dung CK</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Đối soát</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(data ?? []).map((tx: any) => {
              const badge = STATUS_BADGE[tx.status] ?? { label: tx.status, cls: "text-slate-400" };
              const planName = (tx.raw_payload as any)?.planName ?? tx.package_id ?? "—";
              const email = tx.profiles?.email ?? (tx.user_id ? tx.user_id : "—");
              return (
                <tr key={tx.id} className="align-top">
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{email}</td>
                  <td className="px-4 py-3 text-slate-300">{planName}</td>
                  <td className="px-4 py-3 text-right font-bold text-white whitespace-nowrap">
                    {formatVnd(tx.amount_vnd)}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{METHOD_LABEL[tx.method] ?? tx.method}</td>
                  <td className="px-4 py-3 font-mono text-xs text-violet-300 break-all max-w-[180px]">
                    {tx.reference_code ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {tx.status === "pending" && tx.user_id && (
                      <form action={confirmTransaction.bind(null, tx.id)} className="flex flex-col gap-1.5">
                        <input
                          name="note"
                          defaultValue="Xác nhận thanh toán chuyển khoản"
                          className="w-44 bg-[#0e1420] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded transition">
                          Xác nhận + cộng credit
                        </button>
                      </form>
                    )}
                    {tx.status === "unmatched" && (
                      <form action={matchTransaction.bind(null, tx.id)} className="flex flex-col gap-1.5">
                        <input
                          name="email"
                          type="email"
                          placeholder="email người dùng"
                          required
                          className="w-44 bg-[#0e1420] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          name="credits"
                          type="number"
                          placeholder="số credit"
                          required
                          className="w-44 bg-[#0e1420] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <input
                          name="note"
                          defaultValue="Đối soát thủ công chuyển khoản chưa khớp"
                          className="w-44 bg-[#0e1420] border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        <button className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded transition">
                          Gán user + cộng credit
                        </button>
                      </form>
                    )}
                    {tx.status === "success" && <span className="text-slate-600 text-xs">—</span>}
                    {tx.status === "failed" && <span className="text-slate-600 text-xs">—</span>}
                  </td>
                </tr>
              );
            })}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Chưa có giao dịch nào.
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
              href={`/admin/transactions?page=${p}&status=${status}`}
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
