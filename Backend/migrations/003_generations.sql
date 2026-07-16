-- 003_generations.sql
-- Lịch sử render — thay thế localStorage hiện tại của app, server ghi lại mọi lượt render thật.

create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  before_image_url text,
  after_image_url text,
  room_type text,
  style text,
  resolution text, -- 'standard' | '1k' | '3k' | '4k'
  credits_spent integer not null default 0,
  estimated_cost_usd numeric(10, 4),
  status text not null default 'success' check (status in ('success', 'error')),
  error_message text,
  processing_time_ms integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_generations_user_id on public.generations(user_id);
create index if not exists idx_generations_created_at on public.generations(created_at desc);
create index if not exists idx_generations_status on public.generations(status);

alter table public.generations enable row level security;

-- User chỉ xem được lượt render của chính mình.
drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own" on public.generations
  for select using (user_id = auth.uid());

-- Admin xem toàn bộ.
drop policy if exists "generations_select_admin" on public.generations;
create policy "generations_select_admin" on public.generations
  for select using (public.is_admin());

-- Không có policy INSERT cho client — server (service_role, sau khi xác thực + trừ credit) mới
-- được ghi bản ghi render, tránh user tự chèn lịch sử giả hoặc bịa credits_spent.
