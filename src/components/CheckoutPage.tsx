import { useState } from "react";
import { ArrowLeft, ShieldCheck, Gem, Ticket, Loader2, CheckCircle2, Copy } from "lucide-react";
import { PricingPlan } from "../types";

interface CheckoutPageProps {
  plan: PricingPlan;
  userId: string;
  onBack: () => void;
}

function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN");
}

interface PendingOrder {
  transactionId: string;
  referenceCode: string;
  amountVnd: number;
}

export default function CheckoutPage({ plan, userId, onBack }: CheckoutPageProps) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [voucher, setVoucher] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          planId: plan.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể khởi tạo đơn hàng.");
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo đơn hàng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          Thanh toán bảo mật
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left: form or pending payment instructions */}
        <div className="lg:col-span-3 bg-[#0d1220] border border-slate-800 rounded-3xl p-8 space-y-6">
          {!order ? (
            <>
              <div>
                <h2 className="text-xl font-black text-white">Cập nhật thông tin</h2>
                <p className="text-sm text-slate-400 mt-1">Vui lòng hoàn tất hồ sơ để tiếp tục thanh toán.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Họ và tên
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full bg-[#151d2f] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    required
                    className="w-full bg-[#151d2f] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-400 hover:to-violet-400 disabled:opacity-60 text-white font-black py-4 rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tiếp tục thanh toán
                </button>
              </form>

              <p className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng để xác nhận giao dịch chuyển khoản.
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Đơn hàng đã được tạo
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Quét mã QR bên dưới hoặc chuyển khoản thủ công theo đúng nội dung để được cộng credit tự động.
                </p>
              </div>

              <div className="bg-[#151d2f] border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-xl bg-white/5 border border-dashed border-slate-600 flex items-center justify-center text-[11px] text-slate-500 text-center px-3">
                  Mã QR VietQR sẽ hiển thị tại đây sau khi tích hợp cổng thanh toán
                </div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tiền</span>
                    <span className="font-black text-white">{formatVnd(order.amountVnd)} đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Nội dung chuyển khoản</span>
                    <button
                      onClick={handleCopyReference}
                      className="flex items-center gap-1.5 font-mono font-black text-violet-300 hover:text-violet-200 transition"
                    >
                      {order.referenceCode}
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                {copied ? "✓ Đã copy nội dung chuyển khoản. " : ""}
                Đơn hàng đang ở trạng thái chờ đối soát — credit sẽ được cộng vào tài khoản ngay sau khi giao dịch được xác nhận.
              </p>
            </>
          )}
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-2 bg-[#0d1220] border border-slate-800 rounded-3xl p-8 space-y-5">
          <h3 className="text-lg font-black text-white">Chi tiết đơn hàng</h3>

          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-fuchsia-500 to-violet-500 flex items-center justify-center shrink-0">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-black text-white text-sm">{plan.name}</div>
              <div className="text-xs text-slate-400">{plan.credits.toLocaleString("en-US")} Credits</div>
            </div>
            <div className="font-black text-white text-sm">{formatVnd(plan.price)} đ</div>
          </div>

          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Ticket className="w-4 h-4 text-slate-500" />
            <input
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="NHẬP MÃ..."
              className="flex-1 bg-[#151d2f] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 uppercase focus:outline-none"
            />
            <button className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-black px-4 py-2 rounded-lg transition">
              Áp dụng
            </button>
          </div>

          <div className="flex justify-between text-sm text-slate-400 font-semibold">
            <span>Tạm tính</span>
            <span>{formatVnd(plan.price)} đ</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <span className="font-black text-white">Tổng thanh toán</span>
            <span className="text-2xl font-black text-violet-400">{formatVnd(plan.price)} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
