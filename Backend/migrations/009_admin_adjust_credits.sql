-- 009_admin_adjust_credits.sql
-- Cộng/trừ credit thủ công cho admin, NGUYÊN TỬ (atomic) trong một câu UPDATE để tránh race
-- condition với deduct_credits/refund_credits chạy song song khi user đang render. Trước đây
-- action adjustCredit đọc-sửa-ghi ở tầng app (2 query tách rời) nên có thể ghi đè số dư.
--
-- Khác deduct_credits: hàm này KHÔNG chặn khi is_locked (admin cần cứu/điều chỉnh cả tài khoản
-- đang khoá) và clamp số dư về >= 0 khi trừ quá tay. Trả về JSON {before, after} để action lấy
-- đúng giá trị trước/sau ghi vào admin_logs. Chỉ gọi qua service_role từ Admin Dashboard.

create or replace function public.admin_adjust_credits(p_user_id uuid, p_delta integer)
returns jsonb -- {"before": <int>, "after": <int>} — hoặc null nếu user không tồn tại
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before integer;
  v_after integer;
begin
  select credits_balance into v_before
    from public.profiles
    where id = p_user_id
    for update;

  if v_before is null then
    return null; -- user không tồn tại
  end if;

  v_after := greatest(0, v_before + p_delta);

  update public.profiles
    set credits_balance = v_after,
        updated_at = now()
    where id = p_user_id;

  return jsonb_build_object('before', v_before, 'after', v_after);
end;
$$;
