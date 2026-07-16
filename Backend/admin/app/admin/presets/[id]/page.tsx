import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertPreset } from "../actions";

interface PresetEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PresetEditPage({ params }: PresetEditPageProps) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";

  let preset = null;
  if (!isNew) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("presets").select("*").eq("id", id).single();
    preset = data;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-white">{isNew ? "Thêm preset mới" : `Sửa preset: ${preset?.name_vi}`}</h1>

      <form action={upsertPreset} className="space-y-4 rounded-2xl border border-slate-800 bg-[#111827]/60 p-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
            ID (slug, không đổi được sau khi tạo)
          </label>
          <input
            type="text"
            name="id"
            defaultValue={preset?.id ?? ""}
            readOnly={!isNew}
            required
            placeholder="vd: modern_luxury"
            className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên hiển thị (VI)</label>
            <input type="text" name="name_vi" defaultValue={preset?.name_vi ?? ""} required className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên hiển thị (EN)</label>
            <input type="text" name="name_en" defaultValue={preset?.name_en ?? ""} required className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Prompt (tiếng Anh)</label>
          <textarea
            name="prompt"
            defaultValue={preset?.prompt ?? ""}
            required
            rows={5}
            className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Trường phái</label>
            <select name="school" defaultValue={preset?.school ?? "interior"} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
              <option value="architecture">Kiến trúc</option>
              <option value="interior">Nội thất</option>
              <option value="planning">Quy hoạch</option>
              <option value="landscape">Sân vườn</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Thứ tự hiển thị</label>
            <input type="number" name="sort_order" defaultValue={preset?.sort_order ?? 0} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ảnh thumbnail (URL)</label>
          <input type="text" name="thumbnail_url" defaultValue={preset?.thumbnail_url ?? ""} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lý do thay đổi (bắt buộc, ghi audit log)</label>
          <textarea name="note" required rows={2} className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white" />
        </div>

        <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold py-2.5 rounded-lg transition">
          {isNew ? "Tạo preset" : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}
