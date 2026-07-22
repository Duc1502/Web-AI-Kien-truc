import { Check } from "lucide-react";
import { PRICING_PLANS } from "../config";
import { PricingPlan } from "../types";
import { useLanguage } from "../i18n/LanguageContext";
import type { Lang } from "../i18n/translations";

interface PricingPageProps {
  onSelectPlan: (plan: PricingPlan) => void;
}

function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN");
}

// Ghép bản dịch EN của gói lên trên bản VI (giá/credits/id giữ nguyên). Thiếu field EN thì dùng VI.
function localizePlan(plan: PricingPlan, lang: Lang): PricingPlan {
  if (lang === "en" && plan.en) return { ...plan, ...plan.en };
  return plan;
}

export default function PricingPage({ onSelectPlan }: PricingPageProps) {
  const { t, lang } = useLanguage();
  return (
    <div className="space-y-12 pb-16 text-slate-100">
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-8">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
          {t("pricing.title")}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          {t("pricing.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {PRICING_PLANS.map((rawPlan) => {
          const plan = localizePlan(rawPlan, lang);
          return (
          <div
            key={plan.id}
            className={`relative rounded-3xl border p-8 flex flex-col ${
              plan.highlighted
                ? "border-violet-500 bg-[#111827] shadow-[0_0_40px_rgba(139,92,246,0.15)] md:-translate-y-2"
                : "border-slate-800 bg-[#0d1220]"
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                {plan.badge}
              </span>
            )}

            <div className="text-center space-y-2 pb-6 border-b border-slate-800">
              <h3 className="text-xl font-black text-white">{plan.name}</h3>
              <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>

              <div className="pt-2 flex items-center justify-center gap-2">
                {plan.originalPrice && (
                  <span className="text-slate-500 line-through text-sm font-bold">
                    {formatVnd(plan.originalPrice)} đ
                  </span>
                )}
                {plan.discountLabel && (
                  <span className="bg-red-500/15 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {plan.discountLabel}
                  </span>
                )}
              </div>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-black text-white">{formatVnd(plan.price)}</span>
                <span className="text-lg font-bold text-slate-400 mb-0.5">đ</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">{plan.billingNote}</p>
            </div>

            <div
              className={`my-6 rounded-xl px-4 py-3 text-center font-black text-sm ${
                plan.highlighted
                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                  : "bg-slate-900 text-violet-300 border border-slate-800"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1.5">
                {t("pricing.getInstantly")}
              </span>
              {plan.credits.toLocaleString("en-US")} Credits
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300 font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(rawPlan)}
              className={`w-full py-3.5 rounded-xl font-black text-sm transition active:scale-95 ${
                plan.highlighted
                  ? "bg-gradient-to-r from-fuchsia-500 to-violet-500 hover:from-fuchsia-400 hover:to-violet-400 text-white shadow-lg"
                  : "bg-white hover:bg-slate-200 text-zinc-950"
              }`}
            >
              {t("pricing.selectPlan")}
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}
