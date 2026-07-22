"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Đăng xuất admin: xoá session cookie (qua supabase.auth.signOut() — trong Server Action thì
 * cookieStore ghi được) rồi đưa về trang đăng nhập. Hữu ích khi test: đổi qua lại giữa tài khoản
 * admin và user thường để kiểm tra /admin trả 404 cho user thường.
 */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
