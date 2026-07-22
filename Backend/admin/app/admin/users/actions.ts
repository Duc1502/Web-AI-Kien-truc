"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

/**
 * Mọi server action trong file này:
 * 1) Tự gọi lại requireAdmin() — KHÔNG tin tưởng riêng middleware.
 * 2) Đọc giá trị "before" trước khi ghi, để audit log có đủ before/after.
 * 3) Ghi bằng service_role (bỏ qua RLS) — RLS không cho phép client tự sửa profiles.
 * 4) Bắt buộc "note" (lý do) — không có lý do thì từ chối thực hiện.
 *
 * Ký hiệu (userId, formData) để dùng trực tiếp làm form action qua .bind(null, userId) từ
 * Server Component, không cần lớp wrapper "use server" lồng nhau.
 */

export async function adjustCredit(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  const delta = Number(formData.get("delta"));
  const note = String(formData.get("note") ?? "").trim();

  if (!note) throw new Error("Bắt buộc nhập lý do khi cộng/trừ credit.");
  if (!Number.isFinite(delta) || delta === 0) throw new Error("Số credit không hợp lệ.");

  const supabaseAdmin = createSupabaseAdminClient();

  // Dùng RPC atomic (một câu UPDATE có FOR UPDATE) thay vì đọc-sửa-ghi ở tầng app, để không
  // ghi đè số dư khi user đang render (deduct_credits/refund_credits) song song.
  const { data: result, error: rpcError } = await supabaseAdmin.rpc("admin_adjust_credits", {
    p_user_id: userId,
    p_delta: delta,
  });
  if (rpcError) throw new Error(`Cập nhật credit thất bại: ${rpcError.message}`);
  if (!result) throw new Error("Không tìm thấy user.");

  const before = Number((result as { before: number }).before);
  const newBalance = Number((result as { after: number }).after);

  await logAdminAction({
    adminId: admin.userId,
    action: "credit_adjust",
    targetUserId: userId,
    beforeValue: { credits_balance: before },
    afterValue: { credits_balance: newBalance },
    note: `${delta > 0 ? "Cộng" : "Trừ"} ${Math.abs(delta)} credit. Lý do: ${note}`,
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function setAccountLocked(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  const locked = formData.get("locked") === "true";
  const note = String(formData.get("note") ?? "").trim();
  if (!note) throw new Error("Bắt buộc nhập lý do khi khoá/mở khoá tài khoản.");

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: before } = await supabaseAdmin
    .from("profiles")
    .select("is_locked")
    .eq("id", userId)
    .single();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_locked: locked, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(`Cập nhật thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: locked ? "lock_account" : "unlock_account",
    targetUserId: userId,
    beforeValue: { is_locked: before?.is_locked ?? null },
    afterValue: { is_locked: locked },
    note,
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function changePlan(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  const plan = String(formData.get("plan")) as "free" | "paid";
  const note = String(formData.get("note") ?? "").trim();
  if (!note) throw new Error("Bắt buộc nhập lý do khi đổi gói.");

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: before } = await supabaseAdmin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(`Cập nhật thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: "plan_change",
    targetUserId: userId,
    beforeValue: { plan: before?.plan ?? null },
    afterValue: { plan },
    note,
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function resetFreeCredits(userId: string, formData: FormData) {
  const admin = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) throw new Error("Bắt buộc nhập lý do khi đặt lại credit free.");

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: setting } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "new_user_free_credits")
    .single();
  const defaultCredits = Number(setting?.value ?? 100);

  const { data: before } = await supabaseAdmin
    .from("profiles")
    .select("credits_balance")
    .eq("id", userId)
    .single();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ credits_balance: defaultCredits, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(`Cập nhật thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: "reset_free_credits",
    targetUserId: userId,
    beforeValue: { credits_balance: before?.credits_balance ?? null },
    afterValue: { credits_balance: defaultCredits },
    note,
  });

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}
