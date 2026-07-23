"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

/**
 * Đối soát giao dịch. Mọi action:
 * 1) Gọi lại requireAdmin() — không tin riêng middleware.
 * 2) Cộng credit qua RPC atomic + idempotent (confirm_transaction / match_transaction_to_user)
 *    để không cộng 2 lần và không ghi đè số dư khi user đang render song song.
 * 3) Bắt buộc "note" (lý do) và ghi audit log.
 */

// Xác nhận giao dịch ĐÃ có user (trạng thái pending do khách tự tạo đơn). Số credit lấy từ
// raw_payload.credits mà create-order đã lưu.
export async function confirmTransaction(transactionId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) throw new Error("Bắt buộc nhập lý do khi xác nhận giao dịch.");

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: tx } = await supabaseAdmin
    .from("transactions")
    .select("id, user_id, status, raw_payload, amount_vnd")
    .eq("id", transactionId)
    .single();

  if (!tx) throw new Error("Không tìm thấy giao dịch.");
  if (tx.status === "success") throw new Error("Giao dịch đã được xác nhận trước đó.");
  if (!tx.user_id) throw new Error("Giao dịch chưa gán user — dùng đối soát thủ công bên dưới.");

  const credits = Number((tx.raw_payload as { credits?: number } | null)?.credits);
  if (!Number.isFinite(credits) || credits <= 0) {
    throw new Error("Không xác định được số credit của gói (raw_payload.credits trống).");
  }

  const { data: newBalance, error } = await supabaseAdmin.rpc("confirm_transaction", {
    p_transaction_id: transactionId,
    p_credits: credits,
    p_matched_by: admin.userId,
  });
  if (error) throw new Error(`Xác nhận thất bại: ${error.message}`);
  if (newBalance === null) throw new Error("Xác nhận thất bại (đã success hoặc chưa có user).");

  await logAdminAction({
    adminId: admin.userId,
    action: "transaction_confirm",
    targetUserId: tx.user_id,
    beforeValue: { status: tx.status, amount_vnd: tx.amount_vnd },
    afterValue: { status: "success", credits_added: credits, new_balance: newBalance },
    note,
  });

  revalidatePath("/admin/transactions");
}

// Đối soát THỦ CÔNG một chuyển khoản 'unmatched' (nội dung CK sai/thiếu mã): admin nhập email
// người dùng + số credit rồi gán, cộng credit.
export async function matchTransaction(transactionId: string, formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const credits = Number(formData.get("credits"));
  const note = String(formData.get("note") ?? "").trim();

  if (!email) throw new Error("Nhập email người dùng cần cộng credit.");
  if (!Number.isFinite(credits) || credits <= 0) throw new Error("Số credit không hợp lệ.");
  if (!note) throw new Error("Bắt buộc nhập lý do.");

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: user } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .eq("email", email)
    .single();
  if (!user) throw new Error(`Không tìm thấy user với email ${email}.`);

  const { data: newBalance, error } = await supabaseAdmin.rpc("match_transaction_to_user", {
    p_transaction_id: transactionId,
    p_user_id: user.id,
    p_credits: credits,
    p_matched_by: admin.userId,
  });
  if (error) throw new Error(`Đối soát thất bại: ${error.message}`);
  if (newBalance === null) throw new Error("Đối soát thất bại (đã success hoặc không tìm thấy giao dịch).");

  await logAdminAction({
    adminId: admin.userId,
    action: "transaction_match",
    targetUserId: user.id,
    beforeValue: { transaction_id: transactionId, status: "unmatched" },
    afterValue: { status: "success", credits_added: credits, new_balance: newBalance },
    note,
  });

  revalidatePath("/admin/transactions");
}
