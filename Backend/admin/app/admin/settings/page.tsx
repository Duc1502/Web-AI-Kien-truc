import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateSetting, updateSepayBankInfo } from "./actions";

export const dynamic = "force-dynamic";

// Tên miền web chính (nơi đặt webhook /api/webhooks/sepay). Đổi ở đây nếu sau này gắn tên miền riêng.
const MAIN_APP_URL = "https://web-ai-kien-truc.vercel.app";

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

  // Tách riêng cấu hình tài khoản nhận tiền để hiển thị bằng form thân thiện, ẩn khỏi danh sách JSON.
  const sepayInfo = ((settings ?? []).find((s) => s.key === "sepay_bank_info")?.value ?? {}) as {
    account_number?: string;
    bank_code?: string;
    account_holder?: string;
  };
  const otherSettings = (settings ?? []).filter((s) => s.key !== "sepay_bank_info");
  const sepayConfigured = Boolean(sepayInfo.account_number && sepayInfo.bank_code);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Cấu hình hệ thống</h1>
        <p className="text-sm text-slate-400">Mọi thay đổi được ghi vào audit log.</p>
      </div>

      {/* Ô cấu hình tài khoản nhận tiền SePay/VietQR */}
      <form
        action={updateSepayBankInfo}
        className="rounded-2xl border border-violet-800/50 bg-[#111827]/60 p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-black text-white">💳 Tài khoản nhận tiền (SePay / VietQR)</div>
            <div className="text-[11px] text-slate-500">Dùng để tạo mã QR chuyển khoản trên trang thanh toán.</div>
          </div>
          {sepayConfigured ? (
            <span className="text-[11px] font-bold text-emerald-400 whitespace-nowrap">✓ Đã cấu hình</span>
          ) : (
            <span className="text-[11px] font-bold text-amber-400 whitespace-nowrap">Chưa cấu hình</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Số tài khoản *</label>
            <input
              name="account_number"
              defaultValue={sepayInfo.account_number ?? ""}
              required
              placeholder="VD: 96247XXXXX"
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Mã ngân hàng *</label>
            <input
              name="bank_code"
              defaultValue={sepayInfo.bank_code ?? ""}
              required
              placeholder="BIDV, Vietcombank, ACB, MBBank, Techcombank..."
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Tên chủ tài khoản</label>
            <input
              name="account_holder"
              defaultValue={sepayInfo.account_holder ?? ""}
              placeholder="NGUYEN VAN A (không dấu, viết hoa)"
              className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
            />
          </div>
        </div>

        <input
          name="note"
          placeholder="Lý do thay đổi (không bắt buộc)"
          className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
        />

        <div className="text-[11px] text-slate-400 bg-[#0e1420] border border-slate-800 rounded-lg p-3 leading-relaxed space-y-1">
          <div className="font-bold text-slate-300">URL webhook để dán vào SePay:</div>
          <code className="text-violet-300 break-all">{MAIN_APP_URL}/api/webhooks/sepay</code>
          <div>
            Vào SePay → Cấu hình → Webhooks → dán URL trên, chọn sự kiện <b>&quot;Có tiền vào&quot;</b>,
            xác thực <b>API Key</b> = biến <code className="text-violet-300">SEPAY_WEBHOOK_API_KEY</code> đã đặt trên Vercel.
          </div>
        </div>

        <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
          Lưu tài khoản nhận tiền
        </button>
      </form>

      <div className="space-y-4">
        {otherSettings.map((setting) => (
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
