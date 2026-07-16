-- 005_presets.sql
-- Thư viện phong cách — chuyển từ hardcode trong src/config.ts (DESIGN_STYLES, ...) sang DB,
-- để admin sửa prompt trực tiếp trên dashboard mà không cần deploy lại code.

create table if not exists public.presets (
  id text primary key, -- giữ nguyên slug id cũ (vd: 'modern', 'japandi'...) để dễ đối chiếu dữ liệu cũ
  name_vi text not null,
  name_en text not null,
  prompt text not null, -- đoạn prompt tiếng Anh (promptSuffix hiện tại trong config.ts)
  thumbnail_url text,
  school text not null check (school in ('architecture', 'interior', 'planning', 'landscape')),
  room_types text[] not null default '{}', -- loại không gian áp dụng, rỗng = áp dụng mọi loại
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_presets_school on public.presets(school);
create index if not exists idx_presets_sort_order on public.presets(sort_order);

alter table public.presets enable row level security;

-- Ai cũng đọc được preset đang bật (app chính cần đọc để hiển thị danh sách phong cách).
drop policy if exists "presets_select_active" on public.presets;
create policy "presets_select_active" on public.presets
  for select using (is_active = true);

-- Admin đọc được cả preset đã tắt (để bật lại/quản lý).
drop policy if exists "presets_select_admin" on public.presets;
create policy "presets_select_admin" on public.presets
  for select using (public.is_admin());

-- Không có policy INSERT/UPDATE/DELETE cho client — CRUD preset chỉ qua Admin Dashboard (service_role).
