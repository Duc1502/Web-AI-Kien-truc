import "server-only";
import { createSupabaseServerClient } from "./supabase/server";

export interface DailyStatsRow {
  day: string;
  total_generations: number;
  successful_generations: number;
  failed_generations: number;
  total_cost_usd: number;
  free_tier_cost_usd: number;
  total_credits_spent: number;
}

export interface DailyRevenueRow {
  day: string;
  successful_transactions: number;
  revenue_vnd: number;
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export async function getUserCounts() {
  const supabase = await createSupabaseServerClient();

  const [{ count: total }, { count: last24h }, { count: last7d }, { count: last30d }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", daysAgoIso(1)),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", daysAgoIso(7)),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", daysAgoIso(30)),
    ]);

  return {
    total: total ?? 0,
    newLast24h: last24h ?? 0,
    newLast7d: last7d ?? 0,
    newLast30d: last30d ?? 0,
  };
}

export async function getDailyGenerationStats(days: number): Promise<DailyStatsRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("daily_generation_stats")
    .select("*")
    .gte("day", daysAgoIso(days))
    .order("day", { ascending: true });

  return (data ?? []) as DailyStatsRow[];
}

export async function getDailyRevenueStats(days: number): Promise<DailyRevenueRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("daily_revenue_stats")
    .select("*")
    .gte("day", daysAgoIso(days))
    .order("day", { ascending: true });

  return (data ?? []) as DailyRevenueRow[];
}

export function sumBy<T>(rows: T[], key: keyof T): number {
  return rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
}
