# Backend — Admin Dashboard & Nền tảng dữ liệu

Thư mục này chứa toàn bộ code backend mới cho hệ thống: schema Supabase và Admin Dashboard
(Next.js). Đây là phần bổ sung hoàn toàn mới — app người dùng cuối hiện tại (thư mục gốc,
Vite + Express) chưa có database/auth, nên các bước Phase 0 dưới đây là bắt buộc trước khi
Admin Dashboard có dữ liệu thật để hiển thị.

## Cấu trúc

```
Backend/
  migrations/     Các file SQL chạy trong Supabase SQL Editor, theo đúng thứ tự 001 → 006
  admin/          Next.js App Router — Admin Dashboard, route /admin
```

## Bước 1 — Tạo Supabase project

1. Vào https://supabase.com → tạo project mới (miễn phí).
2. Vào **Project Settings → API**, lấy 3 giá trị:
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ giữ bí mật tuyệt đối, không bao giờ lộ ra client/commit vào git)

## Bước 2 — Chạy migration

Mở **SQL Editor** trong Supabase, chạy lần lượt từng file trong `migrations/` theo thứ tự
001 → 006 (mỗi file idempotent, chạy lại không lỗi).

## Bước 3 — Cấu hình biến môi trường cho Admin Dashboard

Trong `Backend/admin/`, tạo file `.env.local` (đã có `.env.local.example` mẫu):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
SUPABASE_SERVICE_ROLE_KEY=xxxx   # chỉ dùng server-side, KHÔNG có tiền tố NEXT_PUBLIC_
```

## Bước 4 — Tạo tài khoản admin đầu tiên

Chưa có ai là admin sau khi chạy migration (mặc định mọi user đều là `role = 'user'`). Sau khi
bạn đăng ký 1 tài khoản (qua app chính hoặc Supabase Auth UI), vào Supabase **Table Editor →
profiles**, sửa `role` của tài khoản đó thành `admin` thủ công (chỉ lần đầu — sau đó có thể
quản lý role qua chính Admin Dashboard).

## Trạng thái hiện tại

- [x] Migration schema (Phase 0 + Phần 1 bảo mật): `profiles.role`, RLS, `admin_logs`,
      `generations`, `transactions`, `presets`, `settings`.
- [x] Next.js admin app scaffold + middleware chặn non-admin → 404.
- [ ] Tích hợp auth thật + trừ credit server-side vào app chính (Vite/Express) — **cần làm
      tiếp để Admin Dashboard có dữ liệu thật**, hiện app chính vẫn đang dùng localStorage.
- [ ] Màn 2.1 Overview, 2.2 Users, 2.4 Chi phí (đang xây).
- [ ] 2.3 Giao dịch & đối soát — chờ tích hợp thanh toán VietQR/MoR ở app chính.
- [ ] 2.5 Generations, 2.6 Presets CRUD, 2.7 Settings.
