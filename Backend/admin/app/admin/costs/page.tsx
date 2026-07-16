import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDailyGenerationStats, getUserCounts } from "@/lib/kpi";
import { getSettings } from "@/lib/settings";
import { formatUsd, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const ABUSE_RENDER_THRESHOLD_24H = 30; // ngưỡng tạm — chỉnh trong /admin/settings khi có UI

export default async function CostsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const [dailyStats, settings, userCounts] = await Promise.all([
    getDailyGenerationStats(30),
    getSettings(),
    getUserCounts(),
  ]);

  const threshold = settings.cost_alert_threshold_usd_per_day ?? 50;
  const totalCost = dailyStats.reduce((acc, d) => acc + d.total_cost_usd, 0);
  const totalFreeCost = dailyStats.reduce((acc, d) => acc + d.free_tier_cost_usd, 0);
  const totalGenerations = dailyStats.reduce((acc, d) => acc + d.total_generations, 0);
  const avgCostPerRender = totalGenerations > 0 ? totalCost / totalGenerations : 0;
  const avgCostPerUser = userCounts.total > 0 ? totalCost / userCounts.total : 0;

  // Phát hiện lạm dụng: render bất thường cao trong 24h gần nhất.
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentGenerations } = await supabase
    .from("generations")
    .select("user_id")
    .gte("created_at", since24h);

  const renderCountByUser = new Map<string, number>();
  for (const g of recentGenerations ?? []) {
    renderCountByUser.set(g.user_id, (renderCountByUser.get(g.user_id) ?? 0) + 1);
  }
  const suspiciousUserIds = [...renderCountByUser.entries()]
    .filter(([, count]) => count > ABUSE_RENDER_THRESHOLD_24H)
    .sort((a, b) => b[1] - a[1]);

  let suspiciousUsers: Array<{ id: string; email: string; count: number }> = [];
  if (suspiciousUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", suspiciousUserIds.map(([id]) => id));
    suspiciousUsers = suspiciousUserIds.map(([id, count]) => ({
      id,
      email: profiles?.find((p) => p.id === id)?.email ?? id,
      count,
    }));
  }

  // Phát hiện nhiều tài khoản free cùng 1 IP đăng ký (dấu hiệu farm credit free).
  const { data: freeProfiles } = await supabase
    .from("profiles")
    .select("id, email, signup_ip")
    .eq("plan", "free")
    .not("signup_ip", "is", null);

  const byIp = new Map<string, string[]>();
  for (const p of freeProfiles ?? []) {
    if (!p.signup_ip) continue;
    byIp.set(p.signup_ip, [...(byIp.get(p.signup_ip) ?? []), p.email]);
  }
  const sharedIpGroups = [...byIp.entries()].filter(([, emails]) => emails.length > 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Chi phí API & Cảnh báo</h1>
        <p className="text-sm text-slate-400">30 ngày gần nhất</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Tổng chi phí</div>
          <div className="text-2xl font-black text-white">{formatUsd(totalCost)}</div>
        </div>
        <div className="rounded-2xl border border-red-500/40 bg-red-500/5 p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-red-400">Chi phí tier Free</div>
          <div className="text-2xl font-black text-red-300">{formatUsd(totalFreeCost)}</div>
          <div className="text-[11px] text-slate-500">Khoản lỗ có chủ đích</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Chi phí / render</div>
          <div className="text-2xl font-black text-white">{formatUsd(avgCostPerRender)}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Chi phí / user</div>
          <div className="text-2xl font-black text-white">{formatUsd(avgCostPerUser)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 overflow-hidden">
        <h2 className="text-sm font-black text-white uppercase tracking-wider p-5 pb-0">
          Chi phí theo ngày (ngưỡng cảnh báo: {formatUsd(threshold)}/ngày)
        </h2>
        <table className="w-full text-sm mt-4">
          <thead className="bg-[#0e1420] text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-2.5">Ngày</th>
              <th className="text-right px-4 py-2.5">Số request</th>
              <th className="text-right px-4 py-2.5">Lỗi</th>
              <th className="text-right px-4 py-2.5">Chi phí</th>
              <th className="text-right px-4 py-2.5">Trong đó Free</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {dailyStats.map((d) => (
              <tr key={d.day} className={d.total_cost_usd > threshold ? "bg-red-500/10" : ""}>
                <td className="px-4 py-2.5 text-slate-300">{d.day}</td>
                <td className="px-4 py-2.5 text-right text-slate-300">{formatNumber(d.total_generations)}</td>
                <td className="px-4 py-2.5 text-right text-red-400">{formatNumber(d.failed_generations)}</td>
                <td className={`px-4 py-2.5 text-right font-bold ${d.total_cost_usd > threshold ? "text-red-400" : "text-white"}`}>
                  {formatUsd(d.total_cost_usd)}
                </td>
                <td className="px-4 py-2.5 text-right text-slate-400">{formatUsd(d.free_tier_cost_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
          <h2 className="text-sm font-black text-amber-300 uppercase tracking-wider mb-3">
            Render bất thường cao (24h qua, &gt; {ABUSE_RENDER_THRESHOLD_24H} lượt)
          </h2>
          <div className="space-y-2">
            {suspiciousUsers.map((u) => (
              <div key={u.id} className="flex justify-between text-xs">
                <span className="text-slate-300">{u.email}</span>
                <span className="font-bold text-amber-400">{u.count} lượt</span>
              </div>
            ))}
            {suspiciousUsers.length === 0 && <p className="text-xs text-slate-500">Không phát hiện bất thường.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5">
          <h2 className="text-sm font-black text-amber-300 uppercase tracking-wider mb-3">
            Nhiều tài khoản Free cùng IP đăng ký
          </h2>
          <div className="space-y-2">
            {sharedIpGroups.map(([ip, emails]) => (
              <div key={ip} className="text-xs border-b border-amber-500/20 pb-2">
                <div className="text-slate-400">{ip}</div>
                <div className="text-slate-300">{emails.join(", ")}</div>
              </div>
            ))}
            {sharedIpGroups.length === 0 && <p className="text-xs text-slate-500">Không phát hiện bất thường.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
