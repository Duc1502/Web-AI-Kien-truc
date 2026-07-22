import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string; // dịch UI string theo ngôn ngữ hiện tại
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "app_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "vi";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "vi" ? saved : "vi"; // mặc định tiếng Việt
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* localStorage đầy/không khả dụng — bỏ qua, vẫn đổi ngôn ngữ trong phiên */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang; // cập nhật <html lang> cho đúng ngữ nghĩa/accessibility
  }, [lang]);

  const t = (key: string) => translations[lang][key] ?? translations.vi[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage phải được dùng bên trong <LanguageProvider>");
  return ctx;
}
