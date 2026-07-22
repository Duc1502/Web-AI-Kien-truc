import type { Lang } from "./translations";

// Helper dịch NỘI DUNG dữ liệu (phong cách, loại phòng...) trong config.ts. Các item này đã có sẵn
// `englishName` cho tên tiếng Anh; mô tả EN (descriptionEn) bổ sung dần — thiếu thì fallback về VI.

export function localizedName(
  item: { name: string; englishName?: string } | undefined,
  lang: Lang,
  fallback = ""
): string {
  if (!item) return fallback;
  return lang === "en" && item.englishName ? item.englishName : item.name;
}

export function localizedDesc(
  item: { description?: string; descriptionEn?: string } | undefined,
  lang: Lang,
  fallback = ""
): string {
  if (!item) return fallback;
  if (lang === "en") return item.descriptionEn ?? item.description ?? fallback;
  return item.description ?? fallback;
}
