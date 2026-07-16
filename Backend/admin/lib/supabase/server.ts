import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Supabase client chạy trong Server Component/Server Action/Route Handler, dùng session cookie
 * của người dùng hiện tại (anon key + RLS). Dùng cho mọi query "đọc như chính user đó" — KHÔNG
 * bỏ qua RLS. Để đọc toàn hệ thống hoặc ghi dữ liệu nhạy cảm, dùng lib/supabase/admin.ts.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Bỏ qua nếu gọi từ Server Component (không set được cookie) — middleware sẽ
            // đảm nhiệm việc refresh session trong trường hợp đó.
          }
        },
      },
    }
  );
}
