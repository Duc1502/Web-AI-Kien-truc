import { requireAdmin } from "@/lib/auth";
import { getUserCounts, getDailyGenerationStats, getDailyRevenueStats, sumBy } from "@/lib/kpi";
import { getSettings } from "@/lib/settings";
import { formatVnd, formatUsd, formatNumber, formatPercent } from "@/lib/format";
import KpiCard from "@/components/KpiCard";
import DailyChart from "@/components/DailyChart";

export const dynamic = "force-dynamic"; // luôn lấy số liệu mới nhất, không cache trang admin

export default async function OverviewPage() {
  // Lớp phòng thủ thứ hai (độc lập với middleware) — bắt buộc ở mọi trang admin.
  await requireAdmin();

  const [userCounts, gen30d, revenue30d, settings] = await Promise.all([
    getUserCounts(),
    getDailyGenerationStats(30),
    getDailyRevenueStats(30),
    getSettings(),
  ]);

  const usdToVnd = settings.usd_to_vnd_rate ?? 25400;
  const costAlertThreshold = settings.cost_alert_threshold_usd_per_day ?? 50;

  const totalGenerations = sumBy(gen30d, "total_generations");
  const totalFailed = sumBy(gen30d, "failed_generations");
  const totalCostUsd = sumBy(gen30d, "total_cost_usd");
  const freeTierCostUsd = sumBy(gen30d, "free_tier_cost_usd");
  const totalRevenueVnd = sumBy(revenue30d, "revenue_vnd");
  const totalCostVnd = totalCostUsd * usdToVnd;
  const grossProfitVnd = totalRevenueVnd - totalCostVnd;
  const grossMargin = totalRevenueVnd > 0 ? grossProfitVnd / totalRevenueVnd : 0;
  const errorRate = totalGenerations > 0 ? totalFailed / totalGenerations : 0;

  const todayStats = gen30d.find(
    (row) => row.day === new Date().toISOString().slice(0, 10)
  );
  const todayCostAlert = (todayStats?.total_cost_usd ?? 0) > costAlertThreshold;

  // Ghép 2 view (generation + revenue) theo ngày để vẽ chung 1 biểu đồ.
  const chartData = gen30d.map((g) => {
    const rev = revenue30d.find((r) => r.day === g.day);
    return {
      day: g.day.slice(5), // MM-DD cho gọn trục X
      "Lượt render": g.total_generations,
      "Doanh thu (VND)": rev?.revenue_vnd ?? 0,
      "Chi phí (USD)": Number(g.total_cost_usd.toFixed(2)),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Tổng quan</h1>
        <p className="text-sm text-slate-400">30 ngày gần nhất</p>
      </div>

      {todayCostAlert && (
        <div className="rounded-xl border border-red-500 bg-red-500/10 p-4 text-sm font-bold text-red-300">
          ⚠️ Chi phí API hôm nay ({formatUsd(todayStats?.total_cost_usd ?? 0)}) đã vượt ngưỡng cấu
          hình ({formatUsd(costAlertThreshold)}). Kiểm tra mục Chi phí để biết chi tiết.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Tổng user" value={formatNumber(userCounts.total)} hint={`+${userCounts.newLast30d} trong 30 ngày`} />
        <KpiCard label="User mới (7 ngày)" value={formatNumber(userCounts.newLast7d)} />
        <KpiCard label="Lượt render (30 ngày)" value={formatNumber(totalGenerations)} />
        <KpiCard
          label="Tỉ lệ render lỗi"
          value={formatPercent(errorRate)}
          highlight={errorRate > 0.05}
        />
        <KpiCard label="Doanh thu (30 ngày)" value={formatVnd(totalRevenueVnd)} />
        <KpiCard label="Chi phí API ước tính" value={formatUsd(totalCostUsd)} hint={formatVnd(totalCostVnd)} />
        <KpiCard label="Chi phí tier Free" value={formatUsd(freeTierCostUsd)} hint="Khoản lỗ có chủ đích" />
        <KpiCard
          label="Lợi nhuận gộp"
          value={formatVnd(grossProfitVnd)}
          hint={`Biên lợi nhuận ${formatPercent(grossMargin)}`}
          highlight
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-6">
        <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4">
          Render / Doanh thu / Chi phí theo ngày
        </h2>
        <DailyChart
          data={chartData}
          lines={[
            { dataKey: "Lượt render", name: "Lượt render", color: "#8b5cf6" },
            { dataKey: "Doanh thu (VND)", name: "Doanh thu (VND)", color: "#22c55e" },
            { dataKey: "Chi phí (USD)", name: "Chi phí (USD)", color: "#f59e0b" },
          ]}
        />
      </div>
    </div>
  );
}
