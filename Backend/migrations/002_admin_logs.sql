-- 002_admin_logs.sql
-- Audit log bắt buộc cho mọi hành động admin. Không bao giờ xoá được từ client (append-only).

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null, -- vd: 'credit_adjust', 'plan_change', 'lock_account', 'preset_update'...
  target_user_id uuid references public.profiles(id),
  before_value jsonb,
  after_value jsonb,
  note text,
  created_at timestamptz not null default now()
);

alter table public.admin_logs enable row level security;

-- Chỉ admin đọc được log (kể cả log của chính mình).
drop policy if exists "admin_logs_select_admin" on public.admin_logs;
create policy "admin_logs_select_admin" on public.admin_logs
  for select using (public.is_admin());

-- Không có policy INSERT/UPDATE/DELETE cho client — mọi ghi log đi qua service_role ở server,
-- đảm bảo admin (kể cả admin) không tự sửa/xoá log qua client để che dấu vết.
