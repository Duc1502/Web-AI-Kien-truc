import { useLanguage } from "../i18n/LanguageContext";
import type { Lang } from "../i18n/translations";

/**
 * Công tắc chọn ngôn ngữ VI | EN. Bên đang chọn được làm nổi bật (nền teal + viền + đổ bóng),
 * trông như đang được "ấn xuống"; bên còn lại mờ. Đặt bên trái nút đăng nhập trong Header.
 */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const options: { id: Lang; label: string }[] = [
    { id: "vi", label: "VI" },
    { id: "en", label: "EN" },
  ];

  return (
    <div
      className={`flex items-center gap-0.5 bg-slate-900/60 border border-slate-800 rounded-xl p-0.5 ${className}`}
      role="group"
      aria-label="Chọn ngôn ngữ / Language"
    >
      {options.map((opt) => {
        const active = lang === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setLang(opt.id)}
            aria-pressed={active}
            title={opt.id === "vi" ? "Tiếng Việt" : "English"}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition ${
              active
                ? "bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
                : "text-slate-500 hover:text-white border border-transparent"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
