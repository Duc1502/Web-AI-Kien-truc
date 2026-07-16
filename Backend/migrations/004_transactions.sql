-- 004_transactions.sql
-- Giao dịch nạp tiền / mua gói. status='unmatched' dùng cho đối soát VietQR sai nội dung.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null, -- null nếu chưa đối soát được
  amount_vnd numeric(14, 2) not null,
  package_id text,
  method text not null check (method in ('vietqr', 'mor', 'manual')),
  status text not null default 'pending' check (status in ('success', 'pending', 'unmatched', 'failed')),
  reference_code text, -- nội dung chuyển khoản / mã giao dịch cổng thanh toán
  raw_payload jsonb, -- toàn bộ payload webhook gốc, phục vụ đối soát/debug
  matched_by_admin_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

alter table public.transactions enable row level security;

drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own" on public.transactions
  for select using (user_id = auth.uid());

drop policy if exists "transactions_select_admin" on public.transactions;
create policy "transactions_select_admin" on public.transactions
  for select using (public.is_admin());

-- Không có policy INSERT/UPDATE cho client — webhook thanh toán và thao tác đối soát của admin
-- đều chạy qua server với service_role.
