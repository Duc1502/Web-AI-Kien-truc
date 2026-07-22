import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateSetting } from "./actions";

export const dynamic = "force-dynamic";

const SETTING_LABELS: Record<string, string> = {
  credit_cost_by_resolution: "Giá credit theo độ phân giải (HD/1K/2K/4K)",
  estimated_cost_usd_by_resolution: "Giá vốn API ước tính (USD/ảnh) theo độ phân giải",
  new_user_free_credits: "Số credit tặng user mới",
  default_variants_per_generation: "Số biến thể mặc định mỗi lượt render",
  cost_alert_threshold_usd_per_day: "Ngưỡng cảnh báo chi phí (USD/ngày)",
  watermark_enabled_for_free_tier: "Bật watermark cho tier free",
  maintenance_mode: "Chế độ bảo trì (tạm khoá tính năng render)",
  usd_to_vnd_rate: "Tỉ giá quy đổi USD → VND",
};

export default async function SettingsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase.from("settings").select("*").order("key");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Cấu hình hệ thống</h1>
        <p className="text-sm text-slate-400">Mọi thay đổi được ghi vào audit log.</p>
      </div>

      <div className="space-y-4">
        {(settings ?? []).map((setting) => (
          <form
            key={setting.key}
            action={updateSetting.bind(null, setting.key)}
            className="rounded-2xl border border-slate-800 bg-[#111827]/60 p-5 space-y-3"
          >
            <div>
              <div className="text-sm font-bold text-white">{SETTING_LABELS[setting.key] ?? setting.key}</div>
              <div className="text-[11px] text-slate-500 font-mono">{setting.key}</div>
            </div>
            <textarea
              name="value"
              defaultValue={JSON.stringify(setting.value)}
              rows={2}
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white"
            />
            <textarea
              name="note"
              placeholder="Lý do thay đổi (bắt buộc)"
              required
              rows={1}
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
              Lưu
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
