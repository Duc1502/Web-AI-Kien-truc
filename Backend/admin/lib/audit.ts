import "server-only";
import { createSupabaseAdminClient } from "./supabase/admin";

export interface LogAdminActionParams {
  adminId: string;
  action: string; // vd: 'credit_adjust', 'lock_account', 'plan_change', 'preset_update'
  targetUserId?: string | null;
  beforeValue?: unknown;
  afterValue?: unknown;
  note: string; // bắt buộc — mọi hành động admin phải kèm lý do
}

/**
 * Ghi audit log — BẮT BUỘC gọi sau mọi hành động admin làm thay đổi dữ liệu (cộng/trừ credit,
 * đổi gói, khoá tài khoản, sửa giá, sửa preset...). Không có audit log thì không truy được lỗi/
 * gian lận sau này. Dùng service_role vì bảng admin_logs không có policy INSERT cho client.
 */
export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.from("admin_logs").insert({
    admin_id: params.adminId,
    action: params.action,
    target_user_id: params.targetUserId ?? null,
    before_value: params.beforeValue ?? null,
    after_value: params.afterValue ?? null,
    note: params.note,
  });

  if (error) {
    // Ghi log thất bại là sự cố nghiêm trọng (mất khả năng truy vết) — ném lỗi để hành động
    // admin gọi hàm này biết và có thể rollback/báo lỗi, thay vì âm thầm bỏ qua.
    throw new Error(`Không ghi được audit log: ${error.message}`);
  }
}
