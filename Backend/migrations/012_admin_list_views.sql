-- 012_admin_list_views.sql
-- View tổng hợp phục vụ 2 màn danh sách admin, để tính bằng SQL aggregate thay vì kéo hết về JS.

-- (2.2) Danh sách user kèm số lần render + tổng đã nạp (VND). Bảng profiles không có sẵn 2 số này;
-- join aggregate ở đây để trang Users phân trang/lọc/tìm ngay trên view mà vẫn nhanh.
create or replace view public.admin_user_overview
with (security_invoker = true) as
select
  p.id,
  p.email,
  p.role,
  p.plan,
  p.credits_balance,
  p.credits_used_total,
  p.is_locked,
  p.created_at,
  coalesce(g.render_count, 0) as render_count,
  coalesce(t.total_deposited_vnd, 0) as total_deposited_vnd
from public.profiles p
left join (
  select user_id, count(*) as render_count
  from public.generations
  group by user_id
) g on g.user_id = p.id
left join (
  select user_id, sum(amount_vnd) as total_deposited_vnd
  from public.transactions
  where status = 'success'
  group by user_id
) t on t.user_id = p.id;

-- (2.5) Thống kê theo phong cách: phong cách nào dùng nhiều nhất, tỉ lệ lỗi cao nhất — dữ liệu để
-- cải thiện thư viện preset.
create or replace view public.generation_style_stats
with (security_invoker = true) as
select
  g.style,
  count(*) as total,
  count(*) filter (where g.status = 'error') as errors,
  coalesce(sum(g.credits_spent), 0) as credits_spent
from public.generations g
where g.style is not null
group by g.style;

-- security_invoker = true: view tôn trọng RLS của bảng gốc — chỉ admin (is_admin) đọc được toàn
-- bộ; user thường nếu lỡ query chỉ thấy dữ liệu của chính mình.
