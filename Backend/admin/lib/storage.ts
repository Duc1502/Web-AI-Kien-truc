import "server-only";
import { createSupabaseAdminClient } from "./supabase/admin";

const BUCKET = "renders";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 giờ — đủ để xem trong 1 phiên admin

/**
 * Tạo signed URL cho một loạt object path trong bucket private "renders" (ảnh gốc/kết quả render).
 * Bucket để private nên KHÔNG dùng public URL được — phải ký tạm thời bằng service_role (bỏ qua
 * RLS Storage). Trả về map { path -> signedUrl }; path null/rỗng hoặc lỗi ký sẽ bị bỏ qua để UI
 * tự fallback (không hiện thumbnail) thay vì vỡ trang.
 */
export async function getSignedRenderUrls(
  paths: (string | null | undefined)[]
): Promise<Record<string, string>> {
  const valid = Array.from(new Set(paths.filter((p): p is string => !!p)));
  if (valid.length === 0) return {};

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrls(valid, SIGNED_URL_TTL_SECONDS);
  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.signedUrl && item.path) map[item.path] = item.signedUrl;
  }
  return map;
}
