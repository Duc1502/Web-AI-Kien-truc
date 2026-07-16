import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Chưa cấu hình Supabase (biến môi trường trống) thì đăng nhập/thanh toán sẽ vô hiệu hoá
// thay vì crash toàn bộ app — các nơi gọi supabase kiểm tra isSupabaseConfigured trước khi dùng.
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);

export interface UserProfile {
  id: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "paid";
  credits_balance: number;
  credits_used_total: number;
  is_locked: boolean;
}
