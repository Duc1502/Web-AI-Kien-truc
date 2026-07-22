/**
 * Seed bảng presets từ thư viện phong cách hardcode trong src/config.ts (SCHOOL_TAXONOMY) vào DB,
 * để Admin Dashboard có dữ liệu quản lý (2.6). Dùng service_role (bảng presets không có policy
 * INSERT cho client).
 *
 * Dùng ignoreDuplicates (INSERT ... ON CONFLICT DO NOTHING) — chạy lại nhiều lần an toàn và KHÔNG
 * đè lên prompt admin đã tinh chỉnh trên dashboard. Muốn seed lại 1 preset đã sửa thì xoá nó trước.
 *
 * Chạy từ thư mục gốc repo:  npm run seed:presets
 * Cần biến môi trường (giống server.ts): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (trong .env/.env.local).
 */
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { SCHOOL_TAXONOMY } from "../../src/config";

dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY. Kiểm tra .env / .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type School = keyof typeof SCHOOL_TAXONOMY; // 'architecture' | 'interior' | 'planning' | 'landscape'

async function main() {
  const rows: Record<string, unknown>[] = [];

  (Object.keys(SCHOOL_TAXONOMY) as School[]).forEach((school) => {
    SCHOOL_TAXONOMY[school].designStyles.forEach((style, index) => {
      rows.push({
        id: style.id,
        name_vi: style.name,
        name_en: style.englishName,
        prompt: style.promptSuffix ?? "",
        thumbnail_url: style.thumbnail ?? null,
        school,
        room_types: [], // rỗng = áp dụng cho mọi loại không gian
        is_active: true,
        sort_order: index,
      });
    });
  });

  console.log(`Chuẩn bị seed ${rows.length} preset...`);

  const { data, error } = await supabase
    .from("presets")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: true })
    .select("id");

  if (error) {
    console.error("Seed presets thất bại:", error.message);
    process.exit(1);
  }

  console.log(`Xong. Thêm mới ${data?.length ?? 0} preset (các preset đã tồn tại được giữ nguyên).`);
}

main();
