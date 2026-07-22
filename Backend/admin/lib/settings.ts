import { createSupabaseServerClient } from "./supabase/server";

export interface SystemSettings {
  credit_cost_by_resolution: Record<string, number>;
  estimated_cost_usd_by_resolution: Record<string, number>;
  new_user_free_credits: number;
  default_variants_per_generation: number;
  cost_alert_threshold_usd_per_day: number;
  watermark_enabled_for_free_tier: boolean;
  maintenance_mode: boolean;
  usd_to_vnd_rate: number;
}

/** Đọc toàn bộ settings hệ thống (bảng key-value) thành 1 object gõ kiểu sẵn. */
export async function getSettings(): Promise<Partial<SystemSettings>> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("settings").select("key, value");

  const result: Record<string, unknown> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return result as Partial<SystemSettings>;
}
