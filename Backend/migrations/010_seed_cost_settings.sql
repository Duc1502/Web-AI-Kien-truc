-- 010_seed_cost_settings.sql
-- Giá vốn API ước tính (USD) cho mỗi ảnh render, theo độ phân giải. server.ts đọc key này khi
-- ghi generations.estimated_cost_usd, từ đó Overview/Costs mới có số chi phí/lợi nhuận thật
-- (trước đây cột này luôn NULL nên mọi chỉ số USD = $0).
--
-- Đây là ƯỚC TÍNH — admin chỉnh trong Settings cho khớp hóa đơn Gemini thực tế. standard/1k dùng
-- model Flash (rẻ), 3k/4k dùng model Pro (đắt hơn). on-conflict-do-nothing để không đè giá trị
-- admin đã tinh chỉnh khi chạy lại migration.

insert into public.settings (key, value) values
  ('estimated_cost_usd_by_resolution', '{"standard": 0.02, "1k": 0.04, "3k": 0.10, "4k": 0.15}')
on conflict (key) do nothing;
