"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

export async function updateSetting(key: string, formData: FormData) {
  const admin = await requireAdmin();
  const rawValue = String(formData.get("value") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!note) throw new Error("Bắt buộc nhập lý do khi đổi cấu hình hệ thống.");

  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    throw new Error("Giá trị không hợp lệ (phải là JSON — số, chuỗi có ngoặc kép, true/false, hoặc object).");
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: before } = await supabaseAdmin.from("settings").select("value").eq("key", key).maybeSingle();

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key, value: parsedValue, updated_at: new Date().toISOString(), updated_by: admin.userId });
  if (error) throw new Error(`Cập nhật thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: "settings_update",
    targetUserId: null,
    beforeValue: { key, value: before?.value ?? null },
    afterValue: { key, value: parsedValue },
    note,
  });

  revalidatePath("/admin/settings");
}

// Ô cấu hình riêng cho tài khoản nhận tiền SePay/VietQR — nhập theo trường rõ ràng thay vì JSON thô.
export async function updateSepayBankInfo(formData: FormData) {
  const admin = await requireAdmin();
  const account_number = String(formData.get("account_number") ?? "").trim();
  const bank_code = String(formData.get("bank_code") ?? "").trim();
  const account_holder = String(formData.get("account_holder") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim() || "Cập nhật tài khoản nhận tiền SePay";

  if (!account_number || !bank_code) {
    throw new Error("Bắt buộc nhập Số tài khoản và Mã ngân hàng.");
  }

  const value = { account_number, bank_code, account_holder };
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: before } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "sepay_bank_info")
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from("settings")
    .upsert({ key: "sepay_bank_info", value, updated_at: new Date().toISOString(), updated_by: admin.userId });
  if (error) throw new Error(`Cập nhật thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: "settings_update",
    targetUserId: null,
    beforeValue: { key: "sepay_bank_info", value: before?.value ?? null },
    afterValue: { key: "sepay_bank_info", value },
    note,
  });

  revalidatePath("/admin/settings");
}
