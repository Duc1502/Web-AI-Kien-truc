import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { togglePresetActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function PresetsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: presets } = await supabase
    .from("presets")
    .select("*")
    .order("school", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Preset / Phong cách</h1>
          <p className="text-sm text-slate-400">Sửa prompt trực tiếp, không cần deploy lại code.</p>
        </div>
        <Link
          href="/admin/presets/new"
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition"
        >
          + Thêm preset
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-[#111827]/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0e1420] text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Tên (VI / EN)</th>
              <th className="text-left px-4 py-3">Trường phái</th>
              <th className="text-right px-4 py-3">Thứ tự</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {(presets ?? []).map((preset) => (
              <tr key={preset.id}>
                <td className="px-4 py-3">
                  <div className="text-white font-semibold">{preset.name_vi}</div>
                  <div className="text-slate-500 text-xs">{preset.name_en}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">{preset.school}</td>
                <td className="px-4 py-3 text-right text-slate-400">{preset.sort_order}</td>
                <td className="px-4 py-3">
                  {preset.is_active ? (
                    <span className="text-emerald-400 text-xs font-bold">Đang bật</span>
                  ) : (
                    <span className="text-slate-500 text-xs font-bold">Đã ẩn</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`/admin/presets/${preset.id}`} className="text-violet-400 hover:text-violet-300 text-xs font-bold">
                    Sửa
                  </Link>
                  <form action={togglePresetActive.bind(null, preset.id)} className="inline">
                    <input type="hidden" name="nextActive" value={(!preset.is_active).toString()} />
                    <button type="submit" className="text-xs font-bold text-slate-400 hover:text-white">
                      {preset.is_active ? "Ẩn" : "Bật"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(presets ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Chưa có preset nào trong DB — nhấn &quot;+ Thêm preset&quot; hoặc di chuyển từ
                  src/config.ts (DESIGN_STYLES) sang.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
