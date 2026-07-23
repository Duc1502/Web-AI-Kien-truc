-- 013_payment_confirm.sql
-- Xác nhận thanh toán + cộng credit NGUYÊN TỬ (atomic) và IDEMPOTENT. Dùng cho:
--   1) Webhook SePay (chuyển khoản VN) — server tự khớp mã đơn rồi gọi hàm này.
--   2) Webhook Lemon Squeezy (thẻ quốc tế) — tương tự.
--   3) Admin đối soát thủ công các giao dịch 'unmatched'.
-- Idempotent: nếu giao dịch đã 'success' thì KHÔNG cộng credit lần nữa (SePay/LS có thể gọi
-- webhook trùng nhiều lần). Chỉ gọi qua service_role từ server, không cấp EXECUTE cho client.

-- Cộng credit cho một giao dịch ĐÃ CÓ user_id (luồng tự động: mã đơn khớp sẵn user).
create or replace function public.confirm_transaction(
  p_transaction_id uuid,
  p_credits integer,
  p_matched_by uuid default null
)
returns integer -- số dư mới sau khi cộng; null nếu không tìm thấy / đã success / chưa có user
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
  v_status text;
  v_new_balance integer;
begin
  -- Khoá hàng giao dịch để chống race + double-credit khi webhook gọi song song.
  select user_id, status into v_user, v_status
    from public.transactions
    where id = p_transaction_id
    for update;

  if not found then return null; end if;
  if v_status = 'success' then return null; end if; -- đã cộng rồi → bỏ qua (idempotent)
  if v_user is null then return null; end if;        -- chưa gán user → dùng luồng đối soát tay

  update public.transactions
    set status = 'success',
        matched_by_admin_id = coalesce(p_matched_by, matched_by_admin_id)
    where id = p_transaction_id;

  update public.profiles
    set credits_balance = credits_balance + p_credits,
        updated_at = now()
    where id = v_user
    returning credits_balance into v_new_balance;

  return v_new_balance;
end;
$$;

-- Đối soát THỦ CÔNG: gán user cho giao dịch 'unmatched' (chuyển khoản không khớp mã) rồi cộng
-- credit. Admin gọi qua service_role, kèm p_matched_by = id admin để lưu vào audit.
create or replace function public.match_transaction_to_user(
  p_transaction_id uuid,
  p_user_id uuid,
  p_credits integer,
  p_matched_by uuid
)
returns integer -- số dư mới; null nếu không tìm thấy / đã success
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_new_balance integer;
begin
  select status into v_status
    from public.transactions
    where id = p_transaction_id
    for update;

  if not found then return null; end if;
  if v_status = 'success' then return null; end if;

  update public.transactions
    set user_id = p_user_id,
        status = 'success',
        matched_by_admin_id = p_matched_by
    where id = p_transaction_id;

  update public.profiles
    set credits_balance = credits_balance + p_credits,
        updated_at = now()
    where id = p_user_id
    returning credits_balance into v_new_balance;

  return v_new_balance;
end;
$$;

-- Thông tin tài khoản nhận tiền để tạo mã QR VietQR (KHÔNG bí mật — vốn hiện công khai trên QR).
-- Secret webhook của SePay để riêng ở biến môi trường SEPAY_WEBHOOK_API_KEY (không để trong bảng
-- settings vì settings có policy cho client đọc). Admin điền các giá trị dưới đây trong Cài đặt.
--   bank_code: mã ngân hàng theo chuẩn SePay/VietQR (VD: BIDV, Vietcombank, ACB, MBBank, Techcombank)
insert into public.settings (key, value) values
  ('sepay_bank_info', '{"account_number": "", "bank_code": "", "account_holder": ""}')
on conflict (key) do nothing;
