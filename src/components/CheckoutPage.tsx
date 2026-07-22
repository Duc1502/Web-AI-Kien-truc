import { useState } from "react";
import { ArrowLeft, ShieldCheck, Gem, Ticket, Loader2, CheckCircle2, Copy } from "lucide-react";
import { PricingPlan } from "../types";
import { useLanguage } from "../i18n/LanguageContext";

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
  const { t } = useLanguage();
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
      if (!res.ok) throw new Error(data.error || t("checkout.errCreate"));
      setOrder(data);
    } catch (err: any) {
      setError(err.message || t("checkout.errGeneric"));
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
          {t("checkout.back")}
        </button>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          {t("checkout.secure")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left: form or pending payment instructions */}
        <div className="lg:col-span-3 bg-[#0d1220] border border-slate-800 rounded-3xl p-8 space-y-6">
          {!order ? (
            <>
              <div>
                <h2 className="text-xl font-black text-white">{t("checkout.formTitle")}</h2>
                <p className="text-sm text-slate-400 mt-1">{t("checkout.formSubtitle")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    {t("checkout.fullName")}
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("checkout.fullNamePlaceholder")}
                    required
                    className="w-full bg-[#151d2f] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    {t("checkout.phone")}
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
                  {t("checkout.continue")}
                </button>
              </form>

              <p className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                {t("checkout.privacy")}
              </p>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  {t("checkout.orderCreated")}
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  {t("checkout.orderInstructions")}
                </p>
              </div>

              <div className="bg-[#151d2f] border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-xl bg-white/5 border border-dashed border-slate-600 flex items-center justify-center text-[11px] text-slate-500 text-center px-3">
                  {t("checkout.qrPlaceholder")}
                </div>
                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("checkout.amount")}</span>
                    <span className="font-black text-white">{formatVnd(order.amountVnd)} đ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t("checkout.transferContent")}</span>
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
                {copied ? t("checkout.copied") : ""}
                {t("checkout.pending")}
              </p>
            </>
          )}
        </div>

        {/* Right: order summary */}
        <div className="lg:col-span-2 bg-[#0d1220] border border-slate-800 rounded-3xl p-8 space-y-5">
          <h3 className="text-lg font-black text-white">{t("checkout.orderSummary")}</h3>

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
              placeholder={t("checkout.voucherPlaceholder")}
              className="flex-1 bg-[#151d2f] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 uppercase focus:outline-none"
            />
            <button className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-black px-4 py-2 rounded-lg transition">
              {t("checkout.apply")}
            </button>
          </div>

          <div className="flex justify-between text-sm text-slate-400 font-semibold">
            <span>{t("checkout.subtotal")}</span>
            <span>{formatVnd(plan.price)} đ</span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <span className="font-black text-white">{t("checkout.total")}</span>
            <span className="text-2xl font-black text-violet-400">{formatVnd(plan.price)} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
