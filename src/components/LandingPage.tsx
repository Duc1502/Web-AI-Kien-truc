import { Sparkles, ArrowRight, Paintbrush, Hammer, Image as ImageIcon, ShieldCheck, Zap, Layers, RefreshCw, Eye } from "lucide-react";
import BeforeAfterSlider from "./BeforeAfterSlider";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  // Real interior design examples for showcase
  const mockBefore = "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"; // dusty bedroom skeleton
  const mockAfter = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80";  // beautiful cozy Japandi space

  return (
    <div className="space-y-24 pb-16 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16">
        {/* Neon Glow spots background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 text-teal-400 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              Công nghệ AI Cải Tạo Nhà Tiên Phong
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              Lột xác tổ ấm <br />
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-md">
                Chỉ Trong 10 Giây
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Giống như <b>Opzen AI</b> hàng đầu, chúng tôi ứng dụng mô hình đa phương thức <b>Gemini 3.1</b> tiên tiến nhất để biến ảnh chụp căn phòng cũ kỹ của bạn thành những kiệt tác phối cảnh 3D siêu chân thực chỉ sau một nút bấm.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onStart}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black uppercase tracking-widest text-xs px-8 py-4.5 rounded-2xl shadow-[0_0_25px_rgba(20,184,166,0.3)] transition duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
              >
                Trải nghiệm cải tạo ngay miễn phí
                <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800">
              <div>
                <span className="block text-3xl font-black text-teal-400">10+</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Style thiết kế</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-teal-400">&lt; 12 giây</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Xử lý siêu tốc</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-teal-400">100%</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chuẩn thi công</span>
              </div>
            </div>
          </div>

          {/* Right Column Interactive Demo */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#111827]/80 rounded-3xl p-3 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[25px] opacity-15 group-hover:opacity-25 transition blur-lg"></div>
              <div className="relative rounded-2xl overflow-hidden">
                <BeforeAfterSlider before={mockBefore} after={mockAfter} aspectRatio="aspect-video" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-semibold italic">
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>Kéo thanh trượt ở giữa sang trái/phải để ngắm kết quả biến đổi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modes Overview like Opzen */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Phân hệ render chuyên nghiệp
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Thiết lập sẵn 4 phân hệ thông minh phục vụ toàn diện nhu cầu thiết kế kiến trúc và thi công.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              title: "Thiết Kế Nội Thất",
              desc: "Cải tạo phòng khách, phòng ngủ, phòng bếp hoàn mỹ với các phối màu nội thất thượng lưu.",
              icon: <Paintbrush className="w-5 h-5 text-teal-400" />,
              badge: "Nổi bật"
            },
            {
              title: "Thiết Kế Ngoại Thất",
              desc: "Lột xác mặt tiền nhà, tường ngoại thất, ban công, nâng cấp kiến trúc thô thành hiện thực.",
              icon: <Layers className="w-5 h-5 text-emerald-400" />,
              badge: "Hot"
            },
            {
              title: "Cảnh Quan & Sân Vườn",
              desc: "Thiết kế mảng xanh sinh thái, lối đi, thảm cỏ, hồ nước và chiếu sáng ngoài trời thông minh.",
              icon: <Zap className="w-5 h-5 text-cyan-400" />,
              badge: "Eco"
            },
            {
              title: "Sketch To Render",
              desc: "Nhận diện nét vẽ tay thô, bản vẽ kỹ thuật CAD 2D đen trắng để đổ bóng lên màu 3D chuẩn xác.",
              icon: <Hammer className="w-5 h-5 text-amber-400" />,
              badge: "X-Power"
            }
          ].map((mode, idx) => (
            <div key={idx} className="bg-[#111827]/50 border border-slate-800 hover:border-teal-500/30 p-6 rounded-2xl text-left space-y-4 hover:-translate-y-1 transition duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 bg-teal-500/10 text-teal-400 text-[9px] font-bold px-2.5 py-1 rounded-bl-xl border-l border-b border-slate-800 uppercase tracking-widest">
                {mode.badge}
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                {mode.icon}
              </div>
              <h3 className="font-extrabold text-white text-base">{mode.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{mode.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section (How it Works) */}
      <section className="bg-[#111827]/40 rounded-3xl border border-slate-800/80 p-8 sm:p-12 text-center space-y-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            3 bước tạo siêu phẩm thiết kế
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Không cần kỹ năng đồ họa 3D phức tạp, bạn chỉ cần đưa ý tưởng, AI sẽ biến nó thành hiện thực.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="bg-[#0B0F19]/80 p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center space-y-4 hover:border-teal-500/20 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-lg border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              01
            </div>
            <h3 className="font-extrabold text-white text-lg">Tải ảnh hiện trạng</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Chụp ảnh căn phòng, ngôi nhà hoặc bản phác thảo tay của bạn ở góc rộng, đủ ánh sáng rồi kéo thả vào studio.
            </p>
          </div>

          <div className="bg-[#0B0F19]/80 p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center space-y-4 hover:border-teal-500/20 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-lg border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              02
            </div>
            <h3 className="font-extrabold text-white text-lg">Cấu hình tham số</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Chọn phong cách yêu thích (Japandi, Hiện đại...), điều chỉnh thanh kéo độ bám sát kết cấu hiện tại và viết thêm yêu cầu đặc thù.
            </p>
          </div>

          <div className="bg-[#0B0F19]/80 p-6 rounded-2xl border border-slate-800/80 flex flex-col items-center text-center space-y-4 hover:border-teal-500/20 transition">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-lg border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              03
            </div>
            <h3 className="font-extrabold text-white text-lg">Hưởng thụ & Download</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Mô hình Gemini 3.1 xử lý cực nhanh, đem lại bản thiết kế có thể so sánh Before/After mượt mà và tải về sắc nét.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">
            Tại sao chọn CảiTạoNhà.AI?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Những cải tiến công nghệ mang lại giá trị cốt lõi, nâng tầm trải nghiệm cá nhân hóa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111827]/40 p-6 rounded-2xl border border-slate-800 space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <h4 className="font-extrabold text-white text-base">Xử lý thần tốc</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Thời gian kết xuất chưa đầy 12 giây nhờ chip thế hệ mới trong Cloud Run và bộ nén hình ảnh tối ưu.
            </p>
          </div>

          <div className="bg-[#111827]/40 p-6 rounded-2xl border border-slate-800 space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Paintbrush className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-white text-base">Hợp chuẩn kiến trúc</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Vật liệu gỗ, đá marble, kim loại bóng loáng, bố cục ánh sáng gián tiếp tuân thủ chính xác lý thuyết kiến trúc.
            </p>
          </div>

          <div className="bg-[#111827]/40 p-6 rounded-2xl border border-slate-800 space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Hammer className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-white text-base">Độ bám sát thực tế</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Thanh kéo AI Strength giúp bảo toàn chính xác cấu trúc tường bệ, cột chịu lực để không phá vỡ khả năng thi công thực tế.
            </p>
          </div>

          <div className="bg-[#111827]/40 p-6 rounded-2xl border border-slate-800 space-y-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-white text-base">Demo Credits miễn phí</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Nhận ngay 150 Credits ban đầu và +50 Credits miễn phí mỗi ngày để bạn tha hồ thử nghiệm sáng tạo.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="bg-gradient-to-br from-[#111827] via-teal-950/40 to-slate-900 border border-slate-800 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-2xl mx-auto space-y-6 relative z-10">
          <h2 className="text-3xl font-black uppercase tracking-tight leading-tight">Bạn đã sẵn sàng nâng tầm không gian sống?</h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Khám phá sức mạnh vô hạn của AI kiến trúc thế hệ mới. Trải nghiệm tức thì không mất mát phí tổn ban đầu nào.
          </p>
          <div className="pt-2">
            <button
              onClick={onStart}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black uppercase tracking-widest text-xs px-10 py-5 rounded-xl shadow-[0_0_30px_rgba(20,184,166,0.3)] transition duration-300 active:scale-95 inline-flex items-center gap-2"
            >
              Cải Tạo Không Gian Của Bạn Ngay
              <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
