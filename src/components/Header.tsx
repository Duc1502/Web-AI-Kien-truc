import { Coins, Sparkles, Menu, X, Landmark, Image as ImageIcon, Zap, LogOut, UserRound } from "lucide-react";
import { useState } from "react";

interface AuthUser {
  email: string;
  creditsBalance: number;
}

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  authUser: AuthUser | null;
  onLoginGoogle: () => void;
  onLogout: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  authUser,
  onLoginGoogle,
  onLogout,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navItems = [
    { id: "landing", label: "Trang Chủ" },
    { id: "create", label: "Studio Cải Tạo" },
    { id: "gallery", label: "Bộ Sưu Tập 3D" },
    { id: "pricing", label: "Bảng Giá" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with Opzen aesthetic */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => {
              setCurrentTab("landing");
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-500 flex items-center justify-center text-zinc-950 shadow-[0_0_20px_rgba(20,184,166,0.3)] group-hover:rotate-6 transition duration-300">
              <Zap className="w-5 h-5 fill-zinc-950" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-tight flex items-center gap-1.5">
                CảiTạoNhà<span className="text-teal-400">.AI</span>
                <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/25 px-1.5 py-0.5 rounded font-mono font-medium tracking-wide">OPZEN</span>
              </span>
              <span className="block text-[8px] font-bold text-slate-400 tracking-widest uppercase leading-none mt-0.5">
                Gemini Multi-Modal Engine
              </span>
            </div>
          </div>

          {/* Desktop Nav - sleek pill style */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-4.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  currentTab === item.id
                    ? "bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-400 border border-teal-500/30 font-extrabold shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                    : "text-slate-400 hover:text-white border border-transparent hover:bg-slate-800/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Credits & Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Credits Counter with high-tech look — chỉ hiện khi đã đăng nhập (số dư thật) */}
            {authUser && (
              <div className="flex items-center gap-2.5 bg-[#151D2F] border border-slate-700/80 rounded-xl px-3.5 py-1.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]">
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400/10 animate-spin-slow" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none font-bold">Số dư Credits</span>
                  <span className="text-xs font-black text-amber-400 mt-0.5">
                    {authUser.creditsBalance} CR
                  </span>
                </div>
              </div>
            )}

            {/* Account: Google login / user menu */}
            {authUser ? (
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center gap-2 bg-[#151D2F] border border-slate-700/80 rounded-xl px-3 py-2 hover:border-slate-600 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                    <UserRound className="w-3.5 h-3.5 text-violet-300" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 max-w-[120px] truncate">{authUser.email}</span>
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0E131F] border border-slate-800 rounded-xl shadow-2xl p-3 space-y-2 z-50">
                    <div className="px-2 py-1 text-xs text-slate-400 truncate">{authUser.email}</div>
                    <button
                      onClick={() => {
                        onLogout();
                        setAccountMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 text-xs font-bold text-red-400 hover:bg-red-500/10 px-2 py-2 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginGoogle}
                className="flex items-center gap-2 bg-white hover:bg-slate-200 text-zinc-950 text-xs font-black px-4 py-2.5 rounded-xl transition active:scale-95"
              >
                Đăng nhập Google
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Small Credits Display — chỉ hiện khi đã đăng nhập */}
            {authUser && (
              <div className="flex items-center gap-1.5 bg-[#151D2F] border border-slate-700 rounded-xl px-2.5 py-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-black text-amber-400">{authUser.creditsBalance}</span>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0B0F19] px-4 py-5 flex flex-col gap-4 shadow-2xl animate-fade-in">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition ${
                  currentTab === item.id
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20 font-extrabold"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
            {authUser && (
              <div className="flex items-center gap-2.5 bg-[#151D2F] border border-slate-800 rounded-xl p-4">
                <Coins className="w-5 h-5 text-amber-400 fill-amber-400/10" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Số dư tài khoản</div>
                  <div className="text-sm font-black text-amber-400">{authUser.creditsBalance} Credits</div>
                </div>
              </div>
            )}

            {authUser ? (
              <div className="bg-[#151D2F] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-300 truncate">{authUser.email}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Credit đã mua: <span className="text-violet-300">{authUser.creditsBalance}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400 border border-red-500/20 py-2.5 rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-white text-zinc-950 py-3 rounded-xl font-black text-xs"
              >
                Đăng nhập Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
