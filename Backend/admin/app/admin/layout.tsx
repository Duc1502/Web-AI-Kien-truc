import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/transactions", label: "Giao dịch" },
  { href: "/admin/costs", label: "Chi phí" },
  { href: "/admin/generations", label: "Lịch sử Render" },
  { href: "/admin/presets", label: "Preset" },
  { href: "/admin/settings", label: "Cấu hình" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Lớp phòng thủ thứ hai: mọi trang trong /admin/** đi qua layout này đều tự kiểm tra lại
  // quyền admin, độc lập với middleware.ts.
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen flex bg-[#0b0f19]">
      <aside className="w-60 shrink-0 border-r border-slate-800 bg-[#0e1420] p-4 space-y-1">
        <div className="px-2 pb-4 text-xs font-black uppercase tracking-widest text-violet-400">
          Admin Dashboard
        </div>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            {item.label}
          </Link>
        ))}
        <div className="pt-6 mt-6 border-t border-slate-800 px-3 text-[11px] text-slate-500">
          Đăng nhập: {admin.email}
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
