"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";

export async function upsertPreset(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const nameVi = String(formData.get("name_vi") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const school = String(formData.get("school") ?? "interior");
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sort_order")) || 0;
  const note = String(formData.get("note") ?? "").trim();

  if (!id || !nameVi || !nameEn || !prompt) {
    throw new Error("Thiếu id, tên (VI/EN) hoặc prompt.");
  }
  if (!note) throw new Error("Bắt buộc nhập lý do thay đổi preset.");

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: before } = await supabaseAdmin.from("presets").select("*").eq("id", id).maybeSingle();

  const { error } = await supabaseAdmin.from("presets").upsert({
    id,
    name_vi: nameVi,
    name_en: nameEn,
    prompt,
    school,
    thumbnail_url: thumbnailUrl,
    sort_order: sortOrder,
    is_active: before?.is_active ?? true,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(`Lưu preset thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: before ? "preset_update" : "preset_create",
    targetUserId: null,
    beforeValue: before,
    afterValue: { id, name_vi: nameVi, name_en: nameEn, prompt, school, sort_order: sortOrder },
    note,
  });

  revalidatePath("/admin/presets");
  redirect("/admin/presets");
}

export async function togglePresetActive(id: string, formData: FormData) {
  const admin = await requireAdmin();
  const nextActive = formData.get("nextActive") === "true";

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: before } = await supabaseAdmin.from("presets").select("is_active").eq("id", id).single();

  const { error } = await supabaseAdmin
    .from("presets")
    .update({ is_active: nextActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Cập nhật thất bại: ${error.message}`);

  await logAdminAction({
    adminId: admin.userId,
    action: nextActive ? "preset_enable" : "preset_disable",
    targetUserId: null,
    beforeValue: { is_active: before?.is_active ?? null },
    afterValue: { is_active: nextActive },
    note: `${nextActive ? "Bật" : "Ẩn"} preset ${id}`,
  });

  revalidatePath("/admin/presets");
}
