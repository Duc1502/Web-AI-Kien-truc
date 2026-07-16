-- 008_credit_functions.sql
-- Trừ/hoàn credit nguyên tử (atomic) để tránh race condition khi nhiều request render chạy
-- song song. Chỉ gọi qua service_role từ server.ts (main app), không cấp quyền EXECUTE cho
-- client — an toàn vì service_role vốn đã bỏ qua RLS/grants.

create or replace function public.deduct_credits(p_user_id uuid, p_amount integer)
returns integer -- số dư mới, hoặc null nếu không đủ credit / tài khoản bị khoá / không tồn tại
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_balance integer;
begin
  update public.profiles
    set credits_balance = credits_balance - p_amount,
        credits_used_total = credits_used_total + p_amount,
        updated_at = now()
    where id = p_user_id
      and is_locked = false
      and credits_balance >= p_amount
    returning credits_balance into v_new_balance;

  return v_new_balance;
end;
$$;

create or replace function public.refund_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
    set credits_balance = credits_balance + p_amount,
        credits_used_total = greatest(credits_used_total - p_amount, 0),
        updated_at = now()
    where id = p_user_id;
end;
$$;
