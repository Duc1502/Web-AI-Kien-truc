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
