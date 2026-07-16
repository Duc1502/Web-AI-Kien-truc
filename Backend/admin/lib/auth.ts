import "server-only";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

export interface AdminSession {
  userId: string;
  email: string;
}

/**
 * Chốt bảo mật bắt buộc: gọi hàm này ở ĐẦU MỌI Server Component, Server Action và Route Handler
 * trong app/admin/**. Middleware đã chặn ở tầng request, nhưng theo yêu cầu bảo mật ("không chỉ
 * ẩn UI") mỗi điểm vào phải tự xác minh lại — không tin tưởng middleware là lớp phòng thủ duy nhất.
 *
 * Không phải admin (hoặc chưa đăng nhập) → notFound() → trả về 404 thật, KHÔNG phải 403, để
 * không lộ sự tồn tại của trang cho người dùng thường.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    notFound();
  }

  return { userId: user.id, email: profile.email };
}
