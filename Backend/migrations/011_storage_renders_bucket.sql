-- 011_storage_renders_bucket.sql
-- Bucket lưu ảnh render (ảnh gốc + ảnh kết quả) để Admin Dashboard hiển thị thumbnail ở màn
-- Quản lý User (2.2) và Lịch sử Render (2.5). Trước đây ảnh chỉ trả về client dạng base64, không
-- được lưu, nên before_image_url/after_image_url luôn NULL.
--
-- Bucket để PRIVATE (public = false). storage.objects đã bật RLS sẵn; KHÔNG tạo policy nào ở đây
-- nghĩa là mặc định từ chối mọi truy cập từ anon/authenticated. Chỉ service_role (server.ts upload,
-- Admin Dashboard tạo signed URL) bỏ qua RLS — đúng ý đồ: người dùng thường không đọc được ảnh
-- render của người khác qua Storage.

insert into storage.buckets (id, name, public)
values ('renders', 'renders', false)
on conflict (id) do nothing;
