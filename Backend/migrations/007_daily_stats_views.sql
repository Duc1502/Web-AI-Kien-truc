-- 007_daily_stats_views.sql
-- View thống kê tổng hợp theo ngày, để Overview/Costs dashboard load nhanh bằng SQL aggregate
-- thay vì kéo toàn bộ generations/transactions về JS rồi tính tay.

create or replace view public.daily_generation_stats
with (security_invoker = true) as
select
  date_trunc('day', g.created_at)::date as day,
  count(*) as total_generations,
  count(*) filter (where g.status = 'success') as successful_generations,
  count(*) filter (where g.status = 'error') as failed_generations,
  coalesce(sum(g.estimated_cost_usd), 0) as total_cost_usd,
  coalesce(sum(g.estimated_cost_usd) filter (where p.plan = 'free'), 0) as free_tier_cost_usd,
  coalesce(sum(g.credits_spent), 0) as total_credits_spent
from public.generations g
join public.profiles p on p.id = g.user_id
group by 1;

create or replace view public.daily_revenue_stats
with (security_invoker = true) as
select
  date_trunc('day', t.created_at)::date as day,
  count(*) filter (where t.status = 'success') as successful_transactions,
  coalesce(sum(t.amount_vnd) filter (where t.status = 'success'), 0) as revenue_vnd
from public.transactions t
group by 1;

-- security_invoker = true (Postgres 15+, Supabase mặc định hỗ trợ): view chạy với quyền của
-- người gọi, nên vẫn tôn trọng RLS của generations/transactions/profiles — admin thấy toàn bộ,
-- user thường (nếu lỡ query) chỉ thấy đúng phần dữ liệu của chính họ, không bị lộ dữ liệu chéo.
