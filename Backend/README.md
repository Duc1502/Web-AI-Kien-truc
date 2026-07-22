# Backend — Admin Dashboard & Nền tảng dữ liệu

Thư mục này chứa toàn bộ code backend mới cho hệ thống: schema Supabase và Admin Dashboard
(Next.js). Đây là phần bổ sung hoàn toàn mới — app người dùng cuối hiện tại (thư mục gốc,
Vite + Express) chưa có database/auth, nên các bước Phase 0 dưới đây là bắt buộc trước khi
Admin Dashboard có dữ liệu thật để hiển thị.

## Cấu trúc

```
Backend/
  migrations/     Các file SQL chạy trong Supabase SQL Editor, theo đúng thứ tự 001 → 012
  admin/          Next.js App Router — Admin Dashboard, route /admin
  scripts/        Script seed dữ liệu (chạy bằng tsx từ thư mục gốc repo)
```

## Bước 1 — Tạo Supabase project

1. Vào https://supabase.com → tạo project mới (miễn phí).
2. Vào **Project Settings → API**, lấy 3 giá trị:
   - `Project URL`
   - `anon public key`
   - `service_role key` (⚠️ giữ bí mật tuyệt đối, không bao giờ lộ ra client/commit vào git)

## Bước 2 — Chạy migration

Mở **SQL Editor** trong Supabase, chạy lần lượt từng file trong `migrations/` theo thứ tự
001 → 012 (mỗi file idempotent, chạy lại không lỗi). Các file bổ sung:

- `009_admin_adjust_credits.sql` — RPC cộng/trừ credit atomic cho admin (chống race với render).
- `010_seed_cost_settings.sql` — seed giá vốn API ước tính (USD) theo độ phân giải.
- `011_storage_renders_bucket.sql` — tạo bucket private `renders` để lưu ảnh gốc/kết quả render.
- `012_admin_list_views.sql` — view tổng hợp cho màn Users & thống kê phong cách ở Generations.

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

## Bước 5 — Seed thư viện phong cách (presets)

Bảng `presets` ship rỗng. Để đổ dữ liệu phong cách từ `src/config.ts` vào DB (cho màn 2.6 quản lý),
chạy từ **thư mục gốc repo** (cần `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` trong `.env`/`.env.local`):

```
npm run seed:presets
```

Script dùng `on conflict do nothing` — chạy lại an toàn, không đè prompt admin đã chỉnh trên dashboard.

## Trạng thái hiện tại

- [x] Migration schema (Phase 0 + Phần 1 bảo mật): `profiles.role`, RLS, `admin_logs`,
      `generations`, `transactions`, `presets`, `settings` + RPC credit atomic, bucket Storage, view tổng hợp.
- [x] Next.js admin app scaffold + middleware chặn non-admin → 404 + `requireAdmin()` 2 lớp.
- [x] App chính (Vite/Express, `server.ts`) đã có auth thật + trừ credit server-side + ghi
      `generations` (kèm `estimated_cost_usd` + upload ảnh gốc/kết quả lên Storage).
- [x] Màn 2.1 Overview, 2.2 Users (kèm số render + tổng nạp), 2.4 Chi phí — chạy với dữ liệu thật.
- [x] 2.5 Generations (thumbnail + lọc + thống kê phong cách), 2.6 Presets CRUD, 2.7 Settings.
- [ ] 2.3 Giao dịch & đối soát — **chờ tích hợp thanh toán VietQR/MoR** ở app chính (giữ stub).
- [ ] Gửi email cảnh báo khi chi phí vượt ngưỡng (hiện mới có banner đỏ trên dashboard).
