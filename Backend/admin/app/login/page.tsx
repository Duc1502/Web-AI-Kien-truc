"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Trang đăng nhập admin. Đặt NGOÀI /admin/** để middleware không chặn (middleware chỉ match
 * /admin/:path*). Dùng @supabase/ssr createBrowserClient — nó lưu session vào COOKIE (khác app
 * chính lưu ở localStorage), nhờ đó middleware + requireAdmin() đọc được session ở phía server.
 *
 * Bảo mật: đăng nhập thành công KHÔNG có nghĩa là vào được /admin — middleware/requireAdmin vẫn
 * kiểm tra profiles.role === 'admin' và trả 404 nếu là user thường. Trang này chỉ tạo session.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError("Đăng nhập thất bại: " + signInError.message);
      setLoading(false);
      return;
    }

    // Session cookie đã được set — điều hướng cứng để middleware chạy lại và kiểm tra quyền admin.
    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#111827]/60 p-6 space-y-4"
      >
        <div>
          <div className="text-xs font-black uppercase tracking-widest text-violet-400">Admin Dashboard</div>
          <h1 className="text-xl font-black text-white mt-1">Đăng nhập</h1>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full bg-[#0e1420] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-bold py-2 rounded-lg transition"
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
