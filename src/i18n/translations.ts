// Từ điển dịch giao diện (UI strings). Key phẳng dạng "nhom.ten". t(key) lấy theo ngôn ngữ hiện
// tại, thiếu thì fallback sang tiếng Việt rồi tới chính key. Bổ sung dần theo từng trang khi dịch.
export type Lang = "vi" | "en";

type Dict = Record<string, string>;

export const translations: Record<Lang, Dict> = {
  vi: {
    // Header / nav
    "nav.home": "Trang Chủ",
    "nav.studio": "Studio Cải Tạo",
    "nav.gallery": "Bộ Sưu Tập 3D",
    "nav.pricing": "Bảng Giá",
    "header.tagline": "Gemini Multi-Modal Engine",
    "header.creditsBalance": "Số dư Credits",
    "header.login": "Đăng nhập Google",
    "header.logout": "Đăng xuất",
    "header.accountBalance": "Số dư tài khoản",
    "header.creditsPurchased": "Credit đã mua",
    "header.langLabel": "Ngôn ngữ",

    // Before/After slider
    "slider.before": "Trước",
    "slider.after": "Sau",
    "slider.beforeAlt": "Ảnh trước khi cải tạo",
    "slider.afterAlt": "Ảnh sau khi cải tạo",

    // Footer
    "footer.desc":
      "OpzenAI.vn ứng dụng mô hình đa phương tiện thế hệ mới nhất của Google Gemini AI để biến đổi hình ảnh hiện trạng căn phòng hay mặt tiền cũ kỹ thành bản phối cảnh kiến trúc 3D sắc nét theo chuẩn cao cấp quốc tế chỉ trong vài giây.",
    "footer.productsTitle": "Sản phẩm & Tính năng",
    "footer.product1": "Thiết kế cải tạo phòng ngủ 3D",
    "footer.product2": "Cải tạo mặt tiền nhà phố (Facade)",
    "footer.product3": "Thiết kế sân vườn biệt thự (Landscape)",
    "footer.product4": "Phác thảo tay sang bản phối (Sketch to Render)",
    "footer.roadmapTitle": "Lộ trình phát triển",
    "footer.roadmap1": "Phase 1: Thử nghiệm miễn phí",
    "footer.roadmap2": "Phase 2: Đăng nhập & Lưu trữ Cloud",
    "footer.roadmap3": "Phase 3: Xuất mô hình CAD/3ds Max",
    "footer.roadmap4": "Điều khoản dịch vụ bảo mật",
    "footer.supportTitle": "Hỗ trợ & Hợp tác",
    "footer.supportCenter": "Trung tâm tư vấn & triển khai dự án",
    "footer.poweredBy": "Powered by Gemini Multimodal Engine",
    "footer.rights": "Toàn quyền bản quyền thiết kế được bảo vệ.",
    "footer.renderNodes": "Render Nodes",
    "footer.phaseActive": "Phase 1 Active",

    // Toast
    "toast.loginUnavailable":
      "⚠️ Đăng nhập chưa khả dụng: thiếu cấu hình Supabase (VITE_SUPABASE_URL/ANON_KEY).",

    // Landing
    "landing.hero.badge": "Công nghệ AI Cải Tạo Nhà Tiên Phong",
    "landing.hero.title1": "Lột xác tổ ấm",
    "landing.hero.title2": "Chỉ Trong 10 Giây",
    "landing.hero.desc":
      "Giống như <b>Opzen AI</b> hàng đầu, chúng tôi ứng dụng mô hình đa phương thức <b>Gemini 3.1</b> tiên tiến nhất để biến ảnh chụp căn phòng cũ kỹ của bạn thành những kiệt tác phối cảnh 3D siêu chân thực chỉ sau một nút bấm.",
    "landing.hero.cta": "Trải nghiệm cải tạo ngay miễn phí",
    "landing.hero.stat1Label": "Style thiết kế",
    "landing.hero.stat2Value": "< 12 giây",
    "landing.hero.stat2Label": "Xử lý siêu tốc",
    "landing.hero.stat3Label": "Chuẩn thi công",
    "landing.demo.hint": "Kéo thanh trượt ở giữa sang trái/phải để ngắm kết quả biến đổi",
    "landing.modes.title": "Phân hệ render chuyên nghiệp",
    "landing.modes.subtitle":
      "Thiết lập sẵn 4 phân hệ thông minh phục vụ toàn diện nhu cầu thiết kế kiến trúc và thi công.",
    "landing.mode1.title": "Thiết Kế Nội Thất",
    "landing.mode1.desc":
      "Cải tạo phòng khách, phòng ngủ, phòng bếp hoàn mỹ với các phối màu nội thất thượng lưu.",
    "landing.mode1.badge": "Nổi bật",
    "landing.mode2.title": "Thiết Kế Ngoại Thất",
    "landing.mode2.desc":
      "Lột xác mặt tiền nhà, tường ngoại thất, ban công, nâng cấp kiến trúc thô thành hiện thực.",
    "landing.mode2.badge": "Hot",
    "landing.mode3.title": "Cảnh Quan & Sân Vườn",
    "landing.mode3.desc":
      "Thiết kế mảng xanh sinh thái, lối đi, thảm cỏ, hồ nước và chiếu sáng ngoài trời thông minh.",
    "landing.mode3.badge": "Eco",
    "landing.mode4.title": "Sketch To Render",
    "landing.mode4.desc":
      "Nhận diện nét vẽ tay thô, bản vẽ kỹ thuật CAD 2D đen trắng để đổ bóng lên màu 3D chuẩn xác.",
    "landing.mode4.badge": "X-Power",
    "landing.process.title": "3 bước tạo siêu phẩm thiết kế",
    "landing.process.subtitle":
      "Không cần kỹ năng đồ họa 3D phức tạp, bạn chỉ cần đưa ý tưởng, AI sẽ biến nó thành hiện thực.",
    "landing.step1.title": "Tải ảnh hiện trạng",
    "landing.step1.desc":
      "Chụp ảnh căn phòng, ngôi nhà hoặc bản phác thảo tay của bạn ở góc rộng, đủ ánh sáng rồi kéo thả vào studio.",
    "landing.step2.title": "Cấu hình tham số",
    "landing.step2.desc":
      "Chọn phong cách yêu thích (Japandi, Hiện đại...), điều chỉnh thanh kéo độ bám sát kết cấu hiện tại và viết thêm yêu cầu đặc thù.",
    "landing.step3.title": "Hưởng thụ & Download",
    "landing.step3.desc":
      "Mô hình Gemini 3.1 xử lý cực nhanh, đem lại bản thiết kế có thể so sánh Before/After mượt mà và tải về sắc nét.",
    "landing.features.title": "Tại sao chọn CảiTạoNhà.AI?",
    "landing.features.subtitle":
      "Những cải tiến công nghệ mang lại giá trị cốt lõi, nâng tầm trải nghiệm cá nhân hóa.",
    "landing.feat1.title": "Xử lý thần tốc",
    "landing.feat1.desc":
      "Thời gian kết xuất chưa đầy 12 giây nhờ chip thế hệ mới trong Cloud Run và bộ nén hình ảnh tối ưu.",
    "landing.feat2.title": "Hợp chuẩn kiến trúc",
    "landing.feat2.desc":
      "Vật liệu gỗ, đá marble, kim loại bóng loáng, bố cục ánh sáng gián tiếp tuân thủ chính xác lý thuyết kiến trúc.",
    "landing.feat3.title": "Độ bám sát thực tế",
    "landing.feat3.desc":
      "Thanh kéo AI Strength giúp bảo toàn chính xác cấu trúc tường bệ, cột chịu lực để không phá vỡ khả năng thi công thực tế.",
    "landing.feat4.title": "Demo Credits miễn phí",
    "landing.feat4.desc":
      "Nhận ngay 150 Credits ban đầu và +50 Credits miễn phí mỗi ngày để bạn tha hồ thử nghiệm sáng tạo.",
    "landing.cta.title": "Bạn đã sẵn sàng nâng tầm không gian sống?",
    "landing.cta.desc":
      "Khám phá sức mạnh vô hạn của AI kiến trúc thế hệ mới. Trải nghiệm tức thì không mất mát phí tổn ban đầu nào.",
    "landing.cta.button": "Cải Tạo Không Gian Của Bạn Ngay",

    // Pricing
    "pricing.title": "Bảng Giá Gói Sử Dụng AI",
    "pricing.subtitle": "Chọn gói cước phù hợp với nhu cầu sáng tạo của bạn. Không phí ẩn, hủy bất cứ lúc nào.",
    "pricing.getInstantly": "Nhận ngay",
    "pricing.selectPlan": "Chọn gói này",

    // Checkout
    "checkout.back": "Quay lại",
    "checkout.secure": "Thanh toán bảo mật",
    "checkout.formTitle": "Cập nhật thông tin",
    "checkout.formSubtitle": "Vui lòng hoàn tất hồ sơ để tiếp tục thanh toán.",
    "checkout.fullName": "Họ và tên",
    "checkout.fullNamePlaceholder": "Nguyễn Văn A",
    "checkout.phone": "Số điện thoại",
    "checkout.continue": "Tiếp tục thanh toán",
    "checkout.errCreate": "Không thể khởi tạo đơn hàng.",
    "checkout.errGeneric": "Đã xảy ra lỗi khi tạo đơn hàng.",
    "checkout.privacy":
      "Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng để xác nhận giao dịch chuyển khoản.",
    "checkout.orderCreated": "Đơn hàng đã được tạo",
    "checkout.orderInstructions":
      "Quét mã QR bên dưới hoặc chuyển khoản thủ công theo đúng nội dung để được cộng credit tự động.",
    "checkout.qrPlaceholder": "Mã QR VietQR sẽ hiển thị tại đây sau khi tích hợp cổng thanh toán",
    "checkout.amount": "Số tiền",
    "checkout.transferContent": "Nội dung chuyển khoản",
    "checkout.copied": "✓ Đã copy nội dung chuyển khoản. ",
    "checkout.pending":
      "Đơn hàng đang ở trạng thái chờ đối soát — credit sẽ được cộng vào tài khoản ngay sau khi giao dịch được xác nhận.",
    "checkout.orderSummary": "Chi tiết đơn hàng",
    "checkout.voucherPlaceholder": "NHẬP MÃ...",
    "checkout.apply": "Áp dụng",
    "checkout.subtotal": "Tạm tính",
    "checkout.total": "Tổng thanh toán",

    // Gallery
    "gallery.title": "BẢN ĐỒ THIẾT KẾ CỦA BẠN",
    "gallery.subtitle": "Nơi lưu trữ những tác phẩm cải tạo không gian sống đỉnh cao, chân thực bởi Gemini AI.",
    "gallery.createNew": "Tạo phối cảnh mới",
    "gallery.emptyTitle": "Chưa Có Bản Thiết Kế Nào",
    "gallery.emptyDesc":
      "Hiện tại bạn chưa thực hiện phiên render cải tạo nào. Hãy tải lên ảnh phòng cũ, lựa chọn phong cách yêu thích và bắt đầu tái định vị không gian sống của bạn ngay!",
    "gallery.emptyCta": "Bắt đầu cải tạo phòng đầu tiên",
    "gallery.compareSlider": "So sánh slider",
    "gallery.downloadAfterTitle": "Tải ảnh sau cải tạo",
    "gallery.deleteTitle": "Xóa bản thiết kế",
    "gallery.customStyle": "Phong cách riêng",
    "gallery.space": "Không gian",
    "gallery.defaultNote": "Cải tạo hoàn mỹ theo tiêu chuẩn kiến trúc 3D.",
    "gallery.viewDetails": "Xem chi tiết",
    "gallery.renderedAt": "KẾT XUẤT LÚC",
    "gallery.yourRequest": "Yêu cầu ban đầu của bạn",
    "gallery.detailedPrompt": "Prompt chi tiết tạo ảnh (Detailed AI Prompt)",
    "gallery.copied": "Đã sao chép!",
    "gallery.copyPrompt": "Sao chép Prompt",
    "gallery.downloadBefore": "Tải ảnh trước cải tạo (Before)",
    "gallery.downloadAfter": "Tải ảnh sau cải tạo (After)",
  },
  en: {
    // Header / nav
    "nav.home": "Home",
    "nav.studio": "Renovation Studio",
    "nav.gallery": "3D Collection",
    "nav.pricing": "Pricing",
    "header.tagline": "Gemini Multi-Modal Engine",
    "header.creditsBalance": "Credit Balance",
    "header.login": "Sign in with Google",
    "header.logout": "Log out",
    "header.accountBalance": "Account Balance",
    "header.creditsPurchased": "Credits purchased",
    "header.langLabel": "Language",

    // Before/After slider
    "slider.before": "Before",
    "slider.after": "After",
    "slider.beforeAlt": "Before renovation",
    "slider.afterAlt": "After renovation",

    // Footer
    "footer.desc":
      "OpzenAI.vn uses Google Gemini AI's latest multimodal models to transform photos of existing rooms or aging facades into sharp, premium-grade 3D architectural renders in just seconds.",
    "footer.productsTitle": "Products & Features",
    "footer.product1": "3D Bedroom Renovation Design",
    "footer.product2": "Townhouse Facade Renovation",
    "footer.product3": "Villa Garden & Landscape Design",
    "footer.product4": "Hand Sketch to Render",
    "footer.roadmapTitle": "Roadmap",
    "footer.roadmap1": "Phase 1: Free Trial",
    "footer.roadmap2": "Phase 2: Login & Cloud Storage",
    "footer.roadmap3": "Phase 3: CAD/3ds Max Export",
    "footer.roadmap4": "Terms of Service & Privacy",
    "footer.supportTitle": "Support & Partnership",
    "footer.supportCenter": "Consulting & Project Deployment Center",
    "footer.poweredBy": "Powered by Gemini Multimodal Engine",
    "footer.rights": "All design rights reserved.",
    "footer.renderNodes": "Render Nodes",
    "footer.phaseActive": "Phase 1 Active",

    // Toast
    "toast.loginUnavailable":
      "⚠️ Sign-in unavailable: missing Supabase configuration (VITE_SUPABASE_URL/ANON_KEY).",

    // Landing
    "landing.hero.badge": "Pioneering AI Home Renovation Technology",
    "landing.hero.title1": "Transform Your Home",
    "landing.hero.title2": "In Just 10 Seconds",
    "landing.hero.desc":
      "Like the leading <b>Opzen AI</b>, we harness the most advanced <b>Gemini 3.1</b> multimodal model to turn photos of your old room into hyper-realistic 3D render masterpieces at the click of a button.",
    "landing.hero.cta": "Try renovation now — free",
    "landing.hero.stat1Label": "Design styles",
    "landing.hero.stat2Value": "< 12 sec",
    "landing.hero.stat2Label": "Ultra-fast processing",
    "landing.hero.stat3Label": "Build-ready",
    "landing.demo.hint": "Drag the middle slider left/right to preview the transformation",
    "landing.modes.title": "Professional render modules",
    "landing.modes.subtitle":
      "Four smart built-in modules that cover every architecture and construction design need.",
    "landing.mode1.title": "Interior Design",
    "landing.mode1.desc":
      "Perfectly renovate living rooms, bedrooms and kitchens with premium interior color palettes.",
    "landing.mode1.badge": "Featured",
    "landing.mode2.title": "Exterior Design",
    "landing.mode2.desc":
      "Transform house facades, exterior walls and balconies — turning raw architecture into reality.",
    "landing.mode2.badge": "Hot",
    "landing.mode3.title": "Landscape & Garden",
    "landing.mode3.desc":
      "Design ecological greenery, pathways, lawns, water features and smart outdoor lighting.",
    "landing.mode3.badge": "Eco",
    "landing.mode4.title": "Sketch To Render",
    "landing.mode4.desc":
      "Recognizes rough hand sketches and black-and-white 2D CAD drawings to shade them into accurate 3D color.",
    "landing.mode4.badge": "X-Power",
    "landing.process.title": "3 steps to a stunning design",
    "landing.process.subtitle":
      "No complex 3D graphics skills needed — just bring your idea and AI turns it into reality.",
    "landing.step1.title": "Upload the current photo",
    "landing.step1.desc":
      "Take a wide-angle, well-lit photo of your room, house or hand sketch, then drag and drop it into the studio.",
    "landing.step2.title": "Configure parameters",
    "landing.step2.desc":
      "Pick your favorite style (Japandi, Modern...), adjust how closely it follows the existing structure, and add specific requests.",
    "landing.step3.title": "Enjoy & Download",
    "landing.step3.desc":
      "The Gemini 3.1 model processes lightning-fast, delivering a design with a smooth Before/After comparison and crisp downloads.",
    "landing.features.title": "Why choose CảiTạoNhà.AI?",
    "landing.features.subtitle":
      "Technological advances that deliver core value and elevate a personalized experience.",
    "landing.feat1.title": "Lightning-fast processing",
    "landing.feat1.desc":
      "Render time under 12 seconds thanks to next-gen chips on Cloud Run and optimized image compression.",
    "landing.feat2.title": "Architecturally accurate",
    "landing.feat2.desc":
      "Wood, marble and glossy metal materials with indirect lighting layouts that precisely follow architectural theory.",
    "landing.feat3.title": "True-to-reality fidelity",
    "landing.feat3.desc":
      "The AI Strength slider preserves the exact structure of walls, bases and load-bearing columns so real construction stays feasible.",
    "landing.feat4.title": "Free demo Credits",
    "landing.feat4.desc":
      "Get 150 Credits to start plus +50 free Credits every day so you can experiment freely.",
    "landing.cta.title": "Ready to elevate your living space?",
    "landing.cta.desc":
      "Discover the limitless power of next-gen architectural AI. An instant experience with no upfront cost.",
    "landing.cta.button": "Renovate Your Space Now",

    // Pricing
    "pricing.title": "AI Plan Pricing",
    "pricing.subtitle": "Choose the plan that fits your creative needs. No hidden fees, cancel anytime.",
    "pricing.getInstantly": "Get instantly",
    "pricing.selectPlan": "Choose this plan",

    // Checkout
    "checkout.back": "Back",
    "checkout.secure": "Secure checkout",
    "checkout.formTitle": "Your information",
    "checkout.formSubtitle": "Please complete your profile to continue with payment.",
    "checkout.fullName": "Full name",
    "checkout.fullNamePlaceholder": "John Doe",
    "checkout.phone": "Phone number",
    "checkout.continue": "Continue to payment",
    "checkout.errCreate": "Could not create the order.",
    "checkout.errGeneric": "An error occurred while creating the order.",
    "checkout.privacy":
      "Your information is kept strictly confidential and used only to confirm the bank transfer.",
    "checkout.orderCreated": "Order created",
    "checkout.orderInstructions":
      "Scan the QR code below or transfer manually with the exact reference to get credits added automatically.",
    "checkout.qrPlaceholder": "The VietQR code will appear here once the payment gateway is integrated",
    "checkout.amount": "Amount",
    "checkout.transferContent": "Transfer reference",
    "checkout.copied": "✓ Transfer reference copied. ",
    "checkout.pending":
      "Your order is pending reconciliation — credits will be added to your account as soon as the transaction is confirmed.",
    "checkout.orderSummary": "Order summary",
    "checkout.voucherPlaceholder": "ENTER CODE...",
    "checkout.apply": "Apply",
    "checkout.subtotal": "Subtotal",
    "checkout.total": "Total",

    // Gallery
    "gallery.title": "YOUR DESIGN MAP",
    "gallery.subtitle": "Where your finest, photorealistic living-space renovations by Gemini AI are stored.",
    "gallery.createNew": "Create new render",
    "gallery.emptyTitle": "No Designs Yet",
    "gallery.emptyDesc":
      "You haven't run any renovation renders yet. Upload a photo of your old room, pick your favorite style and start reimagining your living space now!",
    "gallery.emptyCta": "Renovate your first room",
    "gallery.compareSlider": "Compare slider",
    "gallery.downloadAfterTitle": "Download the after image",
    "gallery.deleteTitle": "Delete design",
    "gallery.customStyle": "Custom style",
    "gallery.space": "Space",
    "gallery.defaultNote": "Perfectly renovated to 3D architectural standards.",
    "gallery.viewDetails": "View details",
    "gallery.renderedAt": "RENDERED AT",
    "gallery.yourRequest": "Your original request",
    "gallery.detailedPrompt": "Detailed AI Prompt",
    "gallery.copied": "Copied!",
    "gallery.copyPrompt": "Copy Prompt",
    "gallery.downloadBefore": "Download before image (Before)",
    "gallery.downloadAfter": "Download after image (After)",
  },
};
