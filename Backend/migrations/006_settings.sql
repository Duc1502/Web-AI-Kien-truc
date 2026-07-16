-- 006_settings.sql
-- Cấu hình hệ thống dạng key-value: giá credit theo độ phân giải, credit tặng mới, ngưỡng cảnh báo
-- chi phí, bật/tắt watermark, chế độ bảo trì... Sửa ở đây áp dụng ngay, không cần deploy lại.

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

alter table public.settings enable row level security;

-- App chính cần đọc settings công khai (giá credit, số credit tặng mới...) để hiển thị cho user.
drop policy if exists "settings_select_all" on public.settings;
create policy "settings_select_all" on public.settings
  for select using (true);

-- Không có policy UPDATE/INSERT cho client — mọi thay đổi settings chỉ qua Admin Dashboard
-- (service_role), và mỗi lần đổi phải ghi vào admin_logs (xử lý ở tầng ứng dụng, không phải DB).

-- Giá trị mặc định khớp với hệ thống hiện tại (xem src/config.ts QUALITY_OPTIONS).
insert into public.settings (key, value) values
  ('credit_cost_by_resolution', '{"standard": 5, "1k": 10, "3k": 20, "4k": 30}'),
  ('new_user_free_credits', '100'),
  ('default_variants_per_generation', '1'),
  ('cost_alert_threshold_usd_per_day', '50'),
  ('watermark_enabled_for_free_tier', 'false'),
  ('maintenance_mode', 'false'),
  ('usd_to_vnd_rate', '25400')
on conflict (key) do nothing;
