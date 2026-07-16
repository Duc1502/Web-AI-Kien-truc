import React, { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { GeneratedProject, PricingPlan } from "./types";
import { supabase, isSupabaseConfigured, UserProfile } from "./lib/supabaseClient";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import CreatePage from "./components/CreatePage";
import GalleryPage from "./components/GalleryPage";
import PricingPage from "./components/PricingPage";
import CheckoutPage from "./components/CheckoutPage";
import { Sparkles, HelpCircle, Mail, Phone, ExternalLink, ShieldCheck, Zap } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [projects, setProjects] = useState<GeneratedProject[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  // Show self-destructing toast utility
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Đăng nhập Google (Supabase Auth) — chỉ áp dụng khi đã cấu hình VITE_SUPABASE_URL/ANON_KEY.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Đồng bộ hồ sơ (credits_balance thật) mỗi khi đăng nhập/đăng xuất — đây là NGUỒN DUY NHẤT
  // cho số dư credit hiển thị/sử dụng trong toàn app, thay thế hoàn toàn hệ đếm localStorage cũ.
  const refreshProfile = async () => {
    if (!isSupabaseConfigured || !session?.user) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, email, role, plan, credits_balance, credits_used_total, is_locked")
      .eq("id", session.user.id)
      .single();
    setProfile(data as UserProfile | null);
  };

  useEffect(() => {
    refreshProfile();
  }, [session]);

  const handleLoginGoogle = () => {
    if (!isSupabaseConfigured) {
      showToast("⚠️ Đăng nhập chưa khả dụng: thiếu cấu hình Supabase (VITE_SUPABASE_URL/ANON_KEY).");
      return;
    }
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setSelectedPlan(null);
    setCurrentTab("landing");
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (!session?.user) {
      handleLoginGoogle();
      return;
    }
    setSelectedPlan(plan);
    setCurrentTab("checkout");
  };

  // Load state from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("caitaonha_projects");
    if (savedProjects !== null) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (e) {
        console.error("Error parsing saved projects:", e);
      }
    }
  }, []);

  // Save new project design with quota safety fallback.
  // Uses the functional setState form because a single "Số lượng ảnh render" batch
  // calls this synchronously once per generated image — reading the `projects` closure
  // directly here would let every call overwrite the same stale snapshot, so only the
  // last of the N images in a batch ever made it into the collection.
  const handleAddProject = (newProject: GeneratedProject) => {
    setProjects((prevProjects) => {
      const updatedProjects = [newProject, ...prevProjects];

      let listToSave = [...updatedProjects];
      let saved = false;
      let prunedCount = 0;

      while (listToSave.length > 0 && !saved) {
        try {
          localStorage.setItem("caitaonha_projects", JSON.stringify(listToSave));
          saved = true;
        } catch (e) {
          console.warn("Storage quota exceeded. Pruning oldest project to fit in localStorage.", e);
          listToSave.pop(); // Remove the oldest project
          prunedCount++;
        }
      }

      if (saved) {
        if (prunedCount > 0) {
          showToast(`💾 Đã lưu phối cảnh mới! Do bộ nhớ đầy, hệ thống tự động dọn dẹp ${prunedCount} thiết kế cũ nhất.`);
        } else {
          showToast("💾 Bản render phối cảnh 3D mới đã được lưu thành công vào Bộ sưu tập!");
        }
      } else {
        try {
          localStorage.removeItem("caitaonha_projects");
        } catch (err) {}
        showToast("⚠️ Trình duyệt đầy bộ nhớ, không thể lưu thêm bản thiết kế mới.");
      }

      return listToSave;
    });
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    const updatedProjects = projects.filter((p) => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem("caitaonha_projects", JSON.stringify(updatedProjects));
    showToast("🗑️ Đã xóa bản thiết kế khỏi Bộ sưu tập cá nhân.");
  };

  return (
    <div className="min-h-screen bg-[#060813] flex flex-col font-sans text-slate-100 selection:bg-teal-500/30 selection:text-teal-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#0E131F] text-slate-100 text-xs font-bold px-5 py-3.5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-slate-800 flex items-center gap-2.5 max-w-sm animate-fade-in-up">
          <Sparkles className="w-4.5 h-4.5 text-teal-400 fill-teal-400/10" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header component */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        authUser={session?.user ? { email: session.user.email || "", creditsBalance: profile?.credits_balance ?? 0 } : null}
        onLoginGoogle={handleLoginGoogle}
        onLogout={handleLogout}
      />

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === "landing" && (
          <LandingPage onStart={() => setCurrentTab("create")} />
        )}
        {currentTab === "create" && (
          <CreatePage
            credits={profile?.credits_balance ?? 0}
            authUserId={session?.user?.id ?? null}
            onRequireLogin={handleLoginGoogle}
            onNavigateToPricing={() => setCurrentTab("pricing")}
            onAddProject={handleAddProject}
            onCreditsUpdated={refreshProfile}
          />
        )}
        {currentTab === "gallery" && (
          <GalleryPage
            projects={projects}
            onDeleteProject={handleDeleteProject}
            onNavigateToCreate={() => setCurrentTab("create")}
          />
        )}
        {currentTab === "pricing" && <PricingPage onSelectPlan={handleSelectPlan} />}
        {currentTab === "checkout" && selectedPlan && session?.user && (
          <CheckoutPage
            plan={selectedPlan}
            userId={session.user.id}
            onBack={() => setCurrentTab("pricing")}
          />
        )}
      </main>

      {/* Footer block */}
      <footer className="bg-[#080B11] text-slate-400 border-t border-slate-900 py-12 relative overflow-hidden">
        {/* Subtle grid decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-zinc-950 font-black">
                  <Sparkles className="w-4 h-4 fill-zinc-950/20" />
                </div>
                <span className="font-black text-lg text-white uppercase tracking-wider">
                  OpzenAI<span className="text-teal-400">.vn</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 font-semibold">
                OpzenAI.vn ứng dụng mô hình đa phương tiện thế hệ mới nhất của Google Gemini AI để biến đổi hình ảnh hiện trạng căn phòng hay mặt tiền cũ kỹ thành bản phối cảnh kiến trúc 3D sắc nét theo chuẩn cao cấp quốc tế chỉ trong vài giây.
              </p>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white text-xs font-black uppercase tracking-widest">Sản phẩm & Tính năng</h4>
              <ul className="text-xs space-y-2 text-slate-400 font-bold">
                <li>
                  <button onClick={() => setCurrentTab("create")} className="hover:text-teal-400 transition">
                    Thiết kế cải tạo phòng ngủ 3D
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("create")} className="hover:text-teal-400 transition">
                    Cải tạo mặt tiền nhà phố (Facade)
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("create")} className="hover:text-teal-400 transition">
                    Thiết kế sân vườn biệt thự (Landscape)
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab("create")} className="hover:text-teal-400 transition">
                    Phác thảo tay sang bản phối (Sketch to Render)
                  </button>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="text-white text-xs font-black uppercase tracking-widest">Lộ trình phát triển</h4>
              <ul className="text-xs space-y-2 text-slate-500 font-semibold">
                <li>
                  <span className="text-teal-400 font-bold">Phase 1: Thử nghiệm miễn phí</span>
                </li>
                <li>
                  <span>Phase 2: Đăng nhập & Lưu trữ Cloud</span>
                </li>
                <li>
                  <span>Phase 3: Xuất mô hình CAD/3ds Max</span>
                </li>
                <li>
                  <span>Điều khoản dịch vụ bảo mật</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 space-y-3">
              <h4 className="text-white text-xs font-black uppercase tracking-widest">Hỗ trợ & Hợp tác</h4>
              <div className="text-xs space-y-2.5 font-semibold text-slate-400">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href="mailto:partnership@opzenai.vn" className="hover:text-teal-400 transition">
                    partnership@opzenai.vn
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  <span>Trung tâm tư vấn & triển khai dự án</span>
                </div>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg font-mono text-[10px]">
                    Powered by Gemini Multimodal Engine
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            <span>
              &copy; {new Date().getFullYear()} OpzenAI.vn. Toàn quyền bản quyền thiết kế được bảo vệ.
            </span>
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <span className="flex items-center gap-1">
                Render Nodes: {new Date().toLocaleDateString("vi-VN")}
              </span>
              <span>•</span>
              <span className="text-teal-400 font-black">
                Phase 1 Active
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
