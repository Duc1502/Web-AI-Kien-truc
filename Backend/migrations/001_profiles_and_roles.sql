-- 001_profiles_and_roles.sql
-- Nền tảng: bảng profiles mở rộng từ auth.users của Supabase, thêm role admin/user.
-- Chạy trong Supabase SQL Editor. An toàn để chạy nhiều lần (idempotent).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free' check (plan in ('free', 'paid')),
  credits_balance integer not null default 100,
  credits_used_total integer not null default 0,
  is_locked boolean not null default false,
  signup_ip text, -- dùng để phát hiện nhiều tài khoản free cùng 1 IP (dấu hiệu farm credit)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tự tạo profile khi có user mới đăng ký (Supabase Auth trigger).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: kiểm tra người gọi hiện tại có phải admin không (dùng trong RLS policy).
-- SECURITY DEFINER để tránh đệ quy vô hạn khi policy trên profiles tự gọi lại chính nó.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

-- User thường chỉ đọc/sửa được đúng hàng của chính mình (không tự đổi role/credits qua client).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_update_own_limited" on public.profiles;
-- Không cho phép update role/credits_balance từ client: chỉ cho phép qua service_role (bỏ qua RLS).
-- Do đó không tạo policy UPDATE cho user thường — mọi ghi credit/role đi qua server (service key).

-- Admin đọc được toàn bộ.
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());
