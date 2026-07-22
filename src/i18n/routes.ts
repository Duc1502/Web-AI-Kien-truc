import type { Lang } from "./translations";

// Đường dẫn theo từng "chức năng" (tab), khác nhau theo ngôn ngữ để URL cũng đổi sang tiếng Anh.
// landing "/" và create "/studio" giữ chung cho cả 2; gallery/pricing/checkout có slug riêng.
export const TAB_PATHS: Record<Lang, Record<string, string>> = {
  vi: {
    landing: "/",
    create: "/studio",
    gallery: "/bo-suu-tap",
    pricing: "/bang-gia",
    checkout: "/thanh-toan",
  },
  en: {
    landing: "/",
    create: "/studio",
    gallery: "/gallery",
    pricing: "/pricing",
    checkout: "/checkout",
  },
};

// Map ngược path -> tab, gộp cả 2 ngôn ngữ, để suy ra tab hiện tại từ URL bất kể đang ở ngôn ngữ nào.
export const PATH_TO_TAB: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  (Object.keys(TAB_PATHS) as Lang[]).forEach((lang) => {
    Object.entries(TAB_PATHS[lang]).forEach(([tab, path]) => {
      map[path] = tab;
    });
  });
  return map;
})();
