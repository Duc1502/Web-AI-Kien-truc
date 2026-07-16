import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client dùng service_role key — BỎ QUA TOÀN BỘ RLS.
 *
 * Chỉ được import trong Server Actions / Route Handlers, KHÔNG BAO GIỜ trong Client Component
 * hay bất kỳ file nào có thể bị bundle ra phía client. Gói "server-only" sẽ làm build LỖI nếu
 * file này vô tình bị import từ client component, làm chốt chặn kỹ thuật ngoài việc tự nhớ.
 *
 * Dùng cho: cộng/trừ credit, đổi role, ghi admin_logs, CRUD presets/settings — mọi thao tác ghi
 * dữ liệu nhạy cảm mà theo yêu cầu bảo mật KHÔNG được chạy từ client.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong biến môi trường server."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
