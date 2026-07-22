import { DesignStyle, RoomType, ResolutionOption, AspectRatioOption, QualityOption, TemplatePost, PricingPlan } from "./types";

export const APP_CONFIG = {
  appName: "OpzenAI.vn - Cải Tạo Nhà AI",
  defaultCredits: 150,
  dailyEarnCredits: 50,
  geminiModel: "gemini-3.1-flash-lite-image",
  signupFreeCredits: 100,
};

// Bảng giá gói credit — giữ đúng giá & số credit như trang chính thức OpzenAI.
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Gói trải nghiệm cho người mới bắt đầu.",
    price: 299000,
    credits: 3000,
    durationLabel: "Hạn sử dụng: 1 Tháng",
    billingNote: "Gia hạn tự động",
    features: [
      "Tổng 3,000 Credits",
      "Gói tiêu chuẩn",
      "Hạn sử dụng: 1 Tháng",
      "Truy cập tất cả công cụ AI",
      "Render tốc độ tiêu chuẩn",
      "Hỗ trợ ưu tiên 24/7",
      "Tính năng truy cập sớm",
    ],
    en: {
      description: "An entry plan for newcomers.",
      durationLabel: "Valid for: 1 month",
      billingNote: "Auto-renewal",
      features: [
        "3,000 Credits total",
        "Standard plan",
        "Valid for: 1 month",
        "Access to all AI tools",
        "Standard render speed",
        "Priority 24/7 support",
        "Early access features",
      ],
    },
  },
  {
    id: "pro",
    name: "Pro",
    description: "Lựa chọn tốt nhất cho Kiến trúc sư & Freelancer.",
    price: 599000,
    originalPrice: 700000,
    discountLabel: "-14%",
    credits: 7000,
    durationLabel: "Hạn sử dụng: 3 Tháng",
    billingNote: "Gia hạn tự động",
    highlighted: true,
    badge: "PHỔ BIẾN NHẤT",
    features: [
      "Tổng 7,000 Credits",
      "Hạn sử dụng: 3 Tháng",
      "Tối ưu chi phí & hiệu năng",
      "Truy cập tất cả công cụ AI",
      "Render tốc độ cao",
      "Hỗ trợ ưu tiên 24/7",
      "Tính năng truy cập sớm",
    ],
    en: {
      description: "The best choice for architects & freelancers.",
      durationLabel: "Valid for: 3 months",
      billingNote: "Auto-renewal",
      badge: "MOST POPULAR",
      features: [
        "7,000 Credits total",
        "Valid for: 3 months",
        "Optimized cost & performance",
        "Access to all AI tools",
        "High render speed",
        "Priority 24/7 support",
        "Early access features",
      ],
    },
  },
  {
    id: "ultra",
    name: "Ultra",
    description: "Giải pháp tối ưu cho Studio và Doanh nghiệp.",
    price: 1999000,
    originalPrice: 2500000,
    discountLabel: "-20%",
    credits: 25000,
    durationLabel: "Hạn sử dụng: 6 Tháng",
    billingNote: "Gia hạn tự động",
    features: [
      "Tổng 25,000 Credits",
      "Hạn sử dụng: 6 Tháng",
      "Chi phí rẻ nhất/credit",
      "Truy cập tất cả công cụ AI",
      "Render tốc độ siêu tốc",
      "Hỗ trợ ưu tiên 24/7",
      "Tính năng truy cập sớm",
    ],
    en: {
      description: "The optimal solution for studios and businesses.",
      durationLabel: "Valid for: 6 months",
      billingNote: "Auto-renewal",
      features: [
        "25,000 Credits total",
        "Valid for: 6 months",
        "Lowest cost per credit",
        "Access to all AI tools",
        "Ultra-fast render speed",
        "Priority 24/7 support",
        "Early access features",
      ],
    },
  },
];

export interface DesignMode {
  id: string;
  name: string;
  englishName: string;
  description: string;
  iconName: string;
}

export const DESIGN_MODES: DesignMode[] = [
  {
    id: "interior",
    name: "Thiết Kế Nội Thất",
    englishName: "Interior Design",
    description: "Cải tạo phòng khách, phòng ngủ, phòng bếp hoàn hảo.",
    iconName: "Sofa",
  },
  {
    id: "exterior",
    name: "Thiết Kế Ngoại Thất",
    englishName: "Exterior Facade",
    description: "Lột xác mặt tiền nhà phố, biệt thự, nhà cấp 4 siêu tốc.",
    iconName: "Home",
  },
  {
    id: "landscape",
    name: "Cảnh Quan & Sân Vườn",
    englishName: "Landscape & Garden",
    description: "Bố cục vườn cây, thảm cỏ, lối đi và hồ bơi thư giãn.",
    iconName: "Trees",
  },
  {
    id: "sketch",
    name: "Bản Vẽ Phác Thảo Sang 3D",
    englishName: "Sketch to Render",
    description: "Biến nét vẽ tay, bản vẽ 2D đen trắng thành phối cảnh chân thực.",
    iconName: "PenTool",
  }
];

// --- TAXONOMY BY SCHOOL: Architecture, Interior, Planning, Landscape ---

// 1. ARCHITECTURE (Kiến trúc)
const ARCHITECTURE_STYLES: DesignStyle[] = [
  {
    id: "arch_modern",
    name: "Hiện đại (Modern)",
    englishName: "Modern",
    description: "Đường nét gãy gọn, khỏe khoắn, hình khối bay bổng cùng vật liệu kính lớn.",
    promptSuffix: "modern luxury architecture exterior, sharp clean geometric facade, large dynamic glass windows, premium concrete cladding, luxury outdoor warm lighting, highly polished architectural photo, 8k resolution",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_minimalist",
    name: "Hiện đại tối giản (Minimalist)",
    englishName: "Minimalist",
    description: "Đơn giản tuyệt đối, tôn vinh hình khối vững chãi và mảng tường bê tông trần thanh lịch.",
    promptSuffix: "ultra-minimalist exterior villa architecture, raw board-formed concrete walls, massive cantilever structures, single continuous black metal frame windows, soft moody shadow play, hyper-realistic, 8k",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_neoclassical",
    name: "Tân cổ điển (Neoclassical)",
    englishName: "Neoclassical",
    description: "Mặt tiền cân đối trang nhã, phào chỉ tường mảnh và vòm cửa sang trọng kiểu Âu.",
    promptSuffix: "grand neoclassical mansion exterior facade, symmetrical classical architectural portals, delicate wall molding, white limestone cladding, elegant arched windows, premium architectural photography, 8k",
    thumbnail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_classical",
    name: "Cổ điển (Classical)",
    englishName: "Classical",
    description: "Nguy nga tráng lệ với hệ cột thức Hy Lạp, phù điêu đắp tay xảo diệu và mái vòm lâu đài.",
    promptSuffix: "palatial classical european chateau exterior, majestic ionic columns, elaborate hand-carved stone reliefs, symmetrical layout, grand entry staircase, luxury photorealistic rendering, 8k",
    thumbnail: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_indochine",
    name: "Đông Dương (Indochine)",
    englishName: "Indochine",
    description: "Hài hòa hoài cổ của sơn vàng, mái ngói dốc, hệ cửa chớp gỗ gõ đen lãng mạn Pháp.",
    promptSuffix: "historic indochine heritage villa exterior, warm yellow ochre textured walls, elegant dark wood shutter windows, clay tile roof, traditional wooden balconies, tropical palms surrounding, nostalgic cinematic, 8k",
    thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_french_colonial",
    name: "Kiến trúc Pháp cổ điển (French Colonial)",
    englishName: "French Colonial",
    description: "Mặt tiền cao rộng, ban công sắt hoa văn nghệ thuật uốn lượn và mái Mansard quyền thế.",
    promptSuffix: "french colonial boutique estate facade, wrought iron ornate balconies, high double-hung arched windows, white plaster walls, premium twilight landscape lighting, cinematic architectural digest, 8k",
    thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_mediterranean",
    name: "Địa Trung Hải (Mediterranean)",
    englishName: "Mediterranean",
    description: "Mái ngói nung ấm, vách thạch cao xước thô rực nắng và giàn hoa giấy rực rỡ sắc tím.",
    promptSuffix: "sun-drenched mediterranean estate exterior, textured white stucco masonry, curved entry archways, warm terracotta roof tiles, lush pink bougainvillea flowers cascading, coastal daylight, 8k",
    thumbnail: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_tropical",
    name: "Nhiệt đới (Tropical)",
    englishName: "Tropical",
    description: "Hệ lam gỗ chắn nắng tự nhiên, mái dốc vươn rộng và ngập tràn bóng mát cây rừng nhiệt đới.",
    promptSuffix: "tropical modernist architectural pavilion, rich cedarwood slat facades, massive deep roof overhangs, open layouts, water reflection ponds, towering palms, luxurious high-end resort style, 8k",
    thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "arch_green_eco",
    name: "Kiến trúc xanh / sinh thái (Green / Eco)",
    englishName: "Green / Eco",
    description: "Vườn treo trên tường bao, mái nhà phủ thảm cỏ xanh mướt mát kết hợp pin năng lượng thông minh.",
    promptSuffix: "biophilic sustainable green eco-friendly house exterior, vertical foliage hanging gardens on brick facade, solar panel rooftop lawns, natural timber screen structures, smart design, 8k",
    thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  }
];

const ARCHITECTURE_ROOM_TYPES: RoomType[] = [
  { id: "townhouse", name: "Nhà phố (Townhouse)", englishName: "Townhouse exterior facade", iconName: "Home", description: "Mặt tiền nhà phố hiện đại, tối ưu diện tích." },
  { id: "tube_house", name: "Nhà ống (Tube House)", englishName: "Tube House narrow facade", iconName: "Home", description: "Dáng nhà hẹp ngang đặc trưng đô thị Việt Nam." },
  { id: "villa", name: "Biệt thự (Villa)", englishName: "Luxury villa exterior", iconName: "Home", description: "Biệt thự sang trọng, đẳng cấp với khoảng sân rộng." },
  { id: "garden_house", name: "Nhà vườn (Garden House)", englishName: "Garden House exterior", iconName: "Trees", description: "Nhà vườn yên bình, giao hòa với thiên nhiên." },
  { id: "single_storey", name: "Nhà cấp 4 / một tầng (Single-storey House)", englishName: "Single-storey country house exterior", iconName: "Home", description: "Nhà một tầng mộc mạc, ấm cúng và tiện lợi." },
  { id: "apartment_building", name: "Chung cư / Cao ốc (Apartment Building)", englishName: "Apartment building high-rise exterior facade", iconName: "Layers", description: "Phối cảnh tòa nhà chung cư hoặc văn phòng cao tầng." },
  { id: "facade", name: "Mặt tiền (Facade)", englishName: "Architectural front facade building", iconName: "Home", description: "Chỉ tập trung render chi tiết mặt trước công trình." },
  { id: "shophouse", name: "Shophouse / Nhà phố thương mại (Shophouse)", englishName: "Shophouse commercial facade design", iconName: "Home", description: "Sự kết hợp giữa nhà ở và cửa hàng kinh doanh." },
  { id: "cafe_restaurant_exterior", name: "Quán cafe / Nhà hàng — ngoại thất (Cafe / Restaurant Exterior)", englishName: "Commercial cafe restaurant front facade", iconName: "Home", description: "Ngoại thất ấn tượng thu hút thực khách ghé thăm." },
  { id: "hotel_resort", name: "Khách sạn / Resort (Hotel / Resort)", englishName: "Luxury resort hotel pavilion facade", iconName: "Home", description: "Phối cảnh nghỉ dưỡng xa hoa đẳng cấp quốc tế." },
  { id: "office_commercial", name: "Văn phòng / Tòa nhà thương mại (Office / Commercial)", englishName: "Commercial corporate building exterior", iconName: "Layers", description: "Thiết kế tòa nhà công sở chuyên nghiệp, hiện đại." },
  { id: "homestay_bungalow", name: "Homestay / Bungalow", englishName: "Homestay wooden cabin bungalow exterior", iconName: "Trees", description: "Nhà gỗ nhỏ xinh dành cho du lịch trải nghiệm." },
  { id: "public_building", name: "Công trình công cộng (Public Building)", englishName: "Civic center public building facade", iconName: "Layers", description: "Trường học, bệnh viện hoặc trung tâm văn hóa." }
];

// 2. INTERIOR (Nội thất)
const INTERIOR_STYLES: DesignStyle[] = [
  {
    id: "modern_luxe",
    name: "Hiện Đại Sang Trọng (Modern Luxe)",
    englishName: "Modern Luxury",
    description: "Đường nét gãy gọn, đá marble vân mây, kim loại mạ vàng và ánh sáng ấm áp lung linh.",
    promptSuffix: "modern luxury master interior, warm ambient linear lighting, white Calacatta marble wall cladding, sleek gold steel accents, custom velvet couches, large glass panels, high ceiling, photo by architectural digest, 8k resolution, photorealistic",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "japandi",
    name: "Japandi (Zen & Hygge)",
    englishName: "Japandi Style",
    description: "Sự kết hợp hoàn hảo giữa nét tĩnh lặng thô mộc Nhật Bản và sự ấm áp Bắc Âu.",
    promptSuffix: "peaceful minimalist japandi design, wabi-sabi concept, low height beige oak bed frame, sliding paper shoji textures, light gray lime-wash textured plaster walls, miniature bonsai tree, diffuse soft sunlight, pure tranquility",
    thumbnail: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "scandinavian_interior",
    name: "Bắc Âu Ấm Áp (Scandinavian)",
    englishName: "Scandinavian Cozy",
    description: "Nội thất gỗ sồi sáng màu, thảm lông dày mềm mại và cây xanh ngập tràn gió mát.",
    promptSuffix: "cozy bright scandinavian living room, natural white oak wooden floor, fluffy white wool rug, minimal wooden chairs, green indoor fiddle leaf figs, warm beige linen curtains, airy and bright, soft morning shadow play",
    thumbnail: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "indochine_interior",
    name: "Đông Dương Hoài Niệm (Indochine)",
    englishName: "Indochine Vintage",
    description: "Sự lãng mạn nước Pháp giao thoa với nét thô mộc, gạch bông của Á Đông cổ xưa.",
    promptSuffix: "indochine style interior, black teakwood cabinets, rattan weave detailing on furniture, iconic green-and-white cement mosaic floor tiles, tropical broadleaf houseplants, brass vintage table lamps, warm cinematic nostalgic glow",
    thumbnail: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wabisabi_interior",
    name: "Wabi-Sabi Tự Nhiên (Raw Clay)",
    englishName: "Wabi-Sabi Natural",
    description: "Tôn vinh vẻ đẹp bất toàn với tường đất sét, gỗ phong hóa thô mộc và đồ gốm thủ công.",
    promptSuffix: "rustic wabi-sabi meditation room, curved clay plaster walls, raw weathered wooden beams on ceiling, rough-hewn stone elements, organic linen fabrics, hand-carved pottery, low-key earthy organic tones, shadows of dry twigs",
    thumbnail: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "industrial_interior",
    name: "Công Nghiệp Cá Tính (Industrial Loft)",
    englishName: "Industrial Loft",
    description: "Tường gạch trần, dầm thép đen bóng, sàn bê tông mài bóng bẩy và đèn Edison cổ điển.",
    promptSuffix: "modern industrial penthouse interior, exposed red brick masonry, black metal columns and pipework, dark leather sofa, polished concrete floor, large iron-framed grid windows, warm golden light from vintage filament bulbs",
    thumbnail: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "neoclassical_interior",
    name: "Tân Cổ Điển Quý Tộc (Neoclassical)",
    englishName: "Neoclassical Elite",
    description: "Trang nhã với các đường phào chỉ tường cân đối, lò sưởi cổ kính và chi tiết ánh vàng sang trọng.",
    promptSuffix: "regal neoclassical dining room, symmetry architectural layout, ornate white wall panel moldings, soft gold gilded cornices, luxurious crystal chandelier, marble dining table, velvet dining chairs, premium fine art render",
    thumbnail: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "tropical_interior",
    name: "Ốc Đảo Nhiệt Đới (Tropical Oasis)",
    englishName: "Tropical Resort",
    description: "Thiên đường nghỉ dưỡng với vật liệu mây tre đan, rèm lụa và sắc xanh tươi mát từ rừng nhiệt đới.",
    promptSuffix: "luxury tropical resort villa interior, bamboo and rattan woven ceiling, large banana leaf plants, soft cream linen curtains blowing in the ocean breeze, wooden shutters, terracotta pottery, warm coastal daylight, high realism",
    thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "coastal_mediterranean",
    name: "Duyên hải / Địa Trung Hải (Coastal / Mediterranean)",
    englishName: "Coastal Mediterranean",
    description: "Sơn tường trắng nhám, cửa vòm cong mềm mại, điểm xuyết sắc xanh đại dương tươi mát.",
    promptSuffix: "mediterranean sun-drenched villa interior, curved archways, white stucco brick walls, royal navy blue accents, exposed warm timber lintels, terracotta floor tiles, bright light pouring in, olive branches decoration",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80",
  }
];

const INTERIOR_ROOM_TYPES: RoomType[] = [
  { id: "living_room", name: "Phòng khách (Living Room)", englishName: "living room", iconName: "Sofa", description: "Trung tâm sinh hoạt và đón tiếp sang trọng." },
  { id: "master_bedroom", name: "Phòng ngủ chính (Master Bedroom)", englishName: "master bedroom", iconName: "Bed", description: "Không gian nghỉ ngơi yên tĩnh, riêng tư ấm áp." },
  { id: "children_room", name: "Phòng ngủ trẻ em (Children's Room)", englishName: "children's play bedroom", iconName: "Bed", description: "Không gian năng động, kích thích tư duy phát triển." },
  { id: "kitchen_dining", name: "Phòng bếp & ăn (Kitchen & Dining)", englishName: "kitchen and dining room", iconName: "Utensils", description: "Không gian ẩm thực đầm ấm và tiện ích vượt trội." },
  { id: "bathroom", name: "Phòng tắm / WC (Bathroom)", englishName: "bathroom restroom", iconName: "ShowerHead", description: "Không gian thư giãn rũ bỏ mệt mỏi với các thiết bị đẳng cấp." },
  { id: "workspace", name: "Góc làm việc / Home office (Workspace)", englishName: "home office and workspace", iconName: "Briefcase", description: "Không gian làm việc thúc đẩy khả năng tập trung cao." },
  { id: "altar_room", name: "Phòng thờ (Altar Room)", englishName: "ancestor altar worship room", iconName: "Home", description: "Không gian tâm linh tôn nghiêm, ấm áp tĩnh lặng." },
  { id: "balcony_terrace", name: "Ban công / Sân thượng (Balcony / Terrace)", englishName: "balcony and deck terrace", iconName: "Flower2", description: "Góc ngắm cảnh, kết nối và giao hòa thiên nhiên." },
  { id: "foyer_entrance", name: "Sảnh / Lối vào (Foyer / Entrance)", englishName: "foyer entryway", iconName: "Home", description: "Ấn tượng tinh tế khi bước chân qua cánh cửa." },
  { id: "media_room", name: "Phòng giải trí / Media (Media Room)", englishName: "home media theater room", iconName: "Sofa", description: "Phòng xem phim và hát karaoke đỉnh cao." },
  { id: "wardrobe", name: "Tủ quần áo / Walk-in closet (Wardrobe)", englishName: "walk-in wardrobe dressing closet", iconName: "Layers", description: "Tủ đồ cao cấp phân chia khoa học, gọn gàng." },
  { id: "staircase_void", name: "Cầu thang / Thông tầng (Staircase / Void)", englishName: "staircase and double height void", iconName: "Layers", description: "Trục đối lưu ánh sáng nghệ thuật của căn nhà." },
  { id: "cafe_restaurant_interior", name: "Quán cafe / Nhà hàng — nội thất (Cafe / Restaurant Interior)", englishName: "commercial cafe lounge restaurant interior", iconName: "Home", description: "Không gian kinh doanh thu hút mọi ánh nhìn." },
  { id: "retail_showroom", name: "Cửa hàng / Showroom (Retail / Showroom)", englishName: "retail shop boutique design interior", iconName: "Layers", description: "Trưng bày sản phẩm tinh sảo thu hút sức mua." },
  { id: "office_interior", name: "Văn phòng (Office Interior)", englishName: "corporate open office interior workspace", iconName: "Briefcase", description: "Môi trường công sở tràn đầy năng lượng làm việc." }
];

// 3. URBAN PLANNING (Quy hoạch)
const PLANNING_STYLES: DesignStyle[] = [
  {
    id: "compact_high_density",
    name: "Đô thị nén / mật độ cao (Compact / High-density)",
    englishName: "Compact / High-density",
    description: "Tập trung các tòa tháp cao tầng thông minh, skybridge xanh kết nối tối ưu quỹ đất cực kỳ hiện đại.",
    promptSuffix: "compact high-density futuristic city masterplan, towering sleek skyscrapers, vertical green terraces, elevated pedestrian skybridges, bustling high-tech urban district layout, realistic 3D render, 8k",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "eco_green_city",
    name: "Đô thị sinh thái / xanh (Eco / Green City)",
    englishName: "Eco / Green City",
    description: "Hạ tầng xanh tích hợp hồ điều hòa điều nhiệt, ngập tràn dải công viên tự nhiên rộng lớn.",
    promptSuffix: "sustainable eco green city layout masterplan, solar panel roofs, extensive bioswales, deep blue water canals, wind turbines, lush interconnected greenways, zero carbon ecosystem architecture, 8k",
    thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "garden_city",
    name: "Đô thị vườn (Garden City)",
    englishName: "Garden City",
    description: "Quy hoạch vòng xuyến đồng tâm, dải nhà thấp tầng xen kẽ thảm rừng cây trù phú thanh bình.",
    promptSuffix: "classic concentric circle garden city layout, low-rise cottage neighborhoods, central majestic public park hubs, sweeping greenbelts, woodlands separating sectors, beautiful landscape architecture, 8k",
    thumbnail: "https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "new_urbanism",
    name: "Đô thị mới kiểu truyền thống (New Urbanism)",
    englishName: "New Urbanism",
    description: "Tăng cường kết nối đi bộ, mặt tiền phố quy mô nhân bản và các quảng trường góc cộng đồng sôi động.",
    promptSuffix: "new urbanism walkable grid planning, human scale classic facades, brick-paved wide sidewalks, street trees, cozy corner shops, beautiful neighborhood pocket plazas, vibrant active lifestyle, 8k",
    thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "smart_city",
    name: "Đô thị thông minh (Smart City)",
    englishName: "Smart City",
    description: "Cơ sở hạ tầng IoT kỹ thuật số đột phá, bến sạc xe điện tự động hóa và kiến trúc công nghệ tiên tiến.",
    promptSuffix: "advanced futuristic smart city planning, digital infrastructure, automatic self-driving electric bus lanes, interactive glowing LED street kiosks, clean energy grids, highly technological layout, 8k",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "transit_oriented_tod",
    name: "Định hướng giao thông công cộng (Transit-oriented / TOD)",
    englishName: "Transit-oriented / TOD",
    description: "Mật độ cao tập trung xoay quanh các nhà ga tàu điện ngầm lớn, tối ưu hóa các tuyến đi bộ.",
    promptSuffix: "transit-oriented development (TOD) masterplan, elegant modern railway and metro station hub, sleek sky trains, dense surrounding mixed-use towers, bicycle highway lanes, pedestrian-first urban core, 8k",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80",
  }
];

const PLANNING_ROOM_TYPES: RoomType[] = [
  { id: "residential_neighborhood", name: "Khu dân cư (Residential Neighborhood)", englishName: "residential neighborhood block complex", iconName: "Home", description: "Bản phối cảnh tổng thể khu phố văn minh, đồng bộ." },
  { id: "new_urban_area", name: "Khu đô thị mới (New Urban Area)", englishName: "new urban development plan", iconName: "Layers", description: "Khu phức hợp hiện đại, đầy đủ hạ tầng." },
  { id: "mixed_use", name: "Khu phức hợp / hỗn hợp (Mixed-use)", englishName: "mixed-use commercial district masterplan", iconName: "Layers", description: "Kết hợp thương mại, dịch vụ và nhà ở cao tầng." },
  { id: "resort_complex", name: "Khu nghỉ dưỡng / Resort (Resort Complex)", englishName: "leisure resort master planning grounds", iconName: "Trees", description: "Quy hoạch nghỉ dưỡng, khách sạn sinh thái ven biển." },
  { id: "industrial_park", name: "Khu công nghiệp (Industrial Park)", englishName: "industrial logistics warehouse park design", iconName: "Layers", description: "Bố cục nhà xưởng, giao thông tải trọng lớn." },
  { id: "commercial_district", name: "Khu thương mại / trung tâm (Commercial District)", englishName: "downtown CBD masterplan layout", iconName: "Layers", description: "Trung tâm tài chính, mua sắm sầm uất." },
  { id: "park_public_space", name: "Công viên / Không gian công cộng (Park / Public Space)", englishName: "urban central green park open spaces", iconName: "Trees", description: "Lá phổi xanh, quảng trường vui chơi ngoài trời." },
  { id: "plaza", name: "Quảng trường (Plaza)", englishName: "urban public town plaza square plan", iconName: "Layers", description: "Không gian tổ chức sự kiện, biểu diễn cộng đồng." },
  { id: "masterplan", name: "Tổng mặt bằng dự án (Masterplan)", englishName: "comprehensive site masterplan development map", iconName: "Map", description: "Render phối cảnh quy hoạch 3D tổng quát từ trên cao." },
  { id: "streetscape", name: "Cảnh quan tuyến phố (Streetscape)", englishName: "streetscape sidewalk boulevard boulevard green corridor", iconName: "Trees", description: "Hành lang vỉa hè, giao thông đô thị hiện đại." },
  { id: "social_housing", name: "Nhà ở xã hội / tái định cư (Social Housing)", englishName: "affordable social housing block planning", iconName: "Home", description: "Dự án nhà ở mật độ trung bình thân thiện môi trường." }
];

// 4. LANDSCAPE (Sân vườn)
const LANDSCAPE_STYLES: DesignStyle[] = [
  {
    id: "japanese_zen_garden",
    name: "Vườn Nhật / Thiền (Japanese Zen)",
    englishName: "Japanese Zen",
    description: "Đá bước dạo nhám thô, hồ cá Koi uốn lượn mềm mại và sỏi trắng được cào gợn sóng tịnh tâm.",
    promptSuffix: "traditional japanese zen garden landscape, fine white gravel patterns, beautifully balanced stepping stones, clear koi pond, minimalist wooden bridges, maple trees, stone lanterns, tranquility, 8k",
    thumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "dry_rock_garden",
    name: "Vườn khô / Sỏi đá (Dry / Rock Garden)",
    englishName: "Dry / Rock Garden",
    description: "Sắp đặt đá phiến tự nhiên mộc mạc kết hợp xương rồng, cỏ kiểng mọc thưa đầy chất nghệ thuật.",
    promptSuffix: "modern minimalist dry rock garden, stacked flat stone slabs, gravel bedding, architectural agave and barrel cacti, soft twilight uplighting, highly sophisticated desert landscape, 8k",
    thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "tropical_garden",
    name: "Vườn nhiệt đới (Tropical)",
    englishName: "Tropical",
    description: "Bão táp của sắc lá bản lớn như chuối cảnh, lá dong kết hợp hoa thiên điểu rực rỡ nhiệt đới.",
    promptSuffix: "dense jungle tropical garden design, large elephant ear leaves, vibrant bird of paradise flowers, mist spray system, organic stone walkways, natural raw beauty, coastal forest mood, 8k",
    thumbnail: "https://images.unsplash.com/photo-1558904541-efa8c3a30fc9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "tropical_resort_garden",
    name: "Resort nhiệt đới (Tropical Resort)",
    englishName: "Tropical Resort",
    description: "Hồ bơi tràn viền biếc xanh, giường tắm nắng sang chảnh dưới bóng dừa lãng mạn.",
    promptSuffix: "luxury tropical resort garden, sparkling turquoise swimming pool, wooden sunbeds, white linen umbrellas, towering palm trees, ambient landscape torchlights, elite escape, 8k",
    thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "modern_minimalist_garden",
    name: "Vườn hiện đại tối giản (Modern Minimalist)",
    englishName: "Modern Minimalist",
    description: "Hình khối vuông vức, bồn bê tông đúc mài mịn, bãi cỏ nhung phẳng phiu sạch gọn tuyệt đối.",
    promptSuffix: "sleek modern minimalist villa backyard garden, manicured flat lawn, smooth grey plaster planter boxes, warm cedar wood patio deck, minimalist linear lighting, clean lines, 8k",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "english_garden",
    name: "Vườn kiểu Anh (English Garden)",
    englishName: "English Garden",
    description: "Bình yên cổ điển với vách đá cũ phủ đầy hồng leo rực rỡ và những khóm oải hương thơ mộng.",
    promptSuffix: "formal english cottage flower garden, sweeping perennial rose bushes, lavender borders, winding weathered brick path, rustic stone fountain, magical soft morning mist, 8k",
    thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "mediterranean_garden",
    name: "Vườn Địa Trung Hải (Mediterranean)",
    englishName: "Mediterranean",
    description: "Lát đá phong sương, chum gốm đất nung vỡ nghệ thuật và bóng dâm cây ô liu, hoa giấy rực hồng.",
    promptSuffix: "breezy mediterranean courtyard garden, terracotta clay urns, rugged stone paving, gnarled olive trees, creeping magenta bougainvillea on warm plaster wall, sunny, 8k",
    thumbnail: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "wabisabi_garden",
    name: "Vườn Wabi-Sabi",
    englishName: "Wabi-Sabi",
    description: "Trân quý nét rêu phong sương phủ, dòng suối nước róc rách tự nhiên khơi dậy bản ngã hoang sơ.",
    promptSuffix: "weathered wabi-sabi mossy rock garden, asymmetrical pond fed by hollow bamboo stream, overgrown moss, ancient textured branches, quiet foggy morning, earthy dark green aesthetic, 8k",
    thumbnail: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=400&q=80",
  }
];

const LANDSCAPE_ROOM_TYPES: RoomType[] = [
  { id: "front_yard", name: "Sân vườn trước (Front Yard)", englishName: "front yard landscape garden", iconName: "Trees", description: "Ấn tượng chào đón thanh bình tại cổng nhà." },
  { id: "backyard", name: "Sân vườn sau (Backyard)", englishName: "backyard landscape patio garden", iconName: "Trees", description: "Góc sinh hoạt ngoài trời kín đáo, bình yên." },
  { id: "courtyard", name: "Sân trong / Giếng trời (Courtyard)", englishName: "central inner courtyard garden", iconName: "Flower2", description: "Điều hòa vi khí hậu xanh ngay lòng ngôi nhà." },
  { id: "rooftop_garden", name: "Sân thượng / Vườn trên mái (Rooftop Garden)", englishName: "luxurious rooftop sky terrace garden", iconName: "Flower2", description: "Biến mái nhà thành ốc đảo mát mẻ thanh bình." },
  { id: "green_balcony", name: "Ban công xanh (Green Balcony)", englishName: "lush balcony garden greenery pocket", iconName: "Flower2", description: "Góc xanh nhỏ tràn ngập sức sống tại chung cư." },
  { id: "pool_area", name: "Khu hồ bơi (Pool Area)", englishName: "luxury swimming pool deck and landscape", iconName: "Trees", description: "Cảnh quan hồ bơi sang chảnh phong cách resort." },
  { id: "landscape_feature", name: "Tiểu cảnh (Landscape Feature)", englishName: "miniature rockery water feature landscaping", iconName: "Trees", description: "Hòn non bộ, thác nước chảy róc rách phong thủy." },
  { id: "vertical_garden", name: "Vườn thẳng đứng (Vertical Garden)", englishName: "vertical living wall garden plants", iconName: "Flower2", description: "Tranh tường cây xanh nghệ thuật độc đáo." },
  { id: "walkway", name: "Lối đi / Đường dạo (Walkway)", englishName: "garden walkway path stepping stones", iconName: "Trees", description: "Đường dạo uốn lượn rải sỏi mát rượi bàn chân." },
  { id: "villa_resort_grounds", name: "Khuôn viên biệt thự / Resort (Villa / Resort Grounds)", englishName: "sprawling villa resort landscaped grounds", iconName: "Trees", description: "Khuôn viên cảnh quan quy mô lớn lộng lẫy." },
  { id: "cafe_garden", name: "Sân vườn quán cafe (Cafe Garden)", englishName: "cafe outdoor garden dining patio area", iconName: "Flower2", description: "Góc check-in ngoài trời mát mẻ rợp hoa lá." }
];

export const SCHOOL_TAXONOMY: Record<"architecture" | "interior" | "planning" | "landscape", {
  roomTypes: RoomType[];
  designStyles: DesignStyle[];
}> = {
  architecture: {
    roomTypes: ARCHITECTURE_ROOM_TYPES,
    designStyles: ARCHITECTURE_STYLES
  },
  interior: {
    roomTypes: INTERIOR_ROOM_TYPES,
    designStyles: INTERIOR_STYLES
  },
  planning: {
    roomTypes: PLANNING_ROOM_TYPES,
    designStyles: PLANNING_STYLES
  },
  landscape: {
    roomTypes: LANDSCAPE_ROOM_TYPES,
    designStyles: LANDSCAPE_STYLES
  }
};

// Default full lists for backward-compatibility lookup elsewhere,
// containing ALL possible combinations across the categories.
export const DESIGN_STYLES: DesignStyle[] = [
  ...INTERIOR_STYLES,
  ...ARCHITECTURE_STYLES,
  ...PLANNING_STYLES,
  ...LANDSCAPE_STYLES
];

export const ROOM_TYPES: RoomType[] = [
  ...INTERIOR_ROOM_TYPES,
  ...ARCHITECTURE_ROOM_TYPES,
  ...PLANNING_ROOM_TYPES,
  ...LANDSCAPE_ROOM_TYPES
];

export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  {
    id: "standard",
    name: "Tiêu Chuẩn (1:1 Square)",
    dimensions: "1024 x 1024",
    aspectRatio: "1:1",
    cost: 10,
  },
  {
    id: "high",
    name: "Sắc Nét (4:3 Photo)",
    dimensions: "1280 x 960",
    aspectRatio: "4:3",
    cost: 15,
  },
  {
    id: "landscape",
    name: "Màn Ảnh Rộng (16:9 Landscape)",
    dimensions: "1280 x 720",
    aspectRatio: "16:9",
    cost: 20,
  },
  {
    id: "mobile",
    name: "Di Động (9:16 Portrait)",
    dimensions: "720 x 1280",
    aspectRatio: "9:16",
    cost: 20,
  }
];

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: "1:1", name: "1:1 (Vuông)", ratio: "1:1", description: "Bản vẽ vuông cân đối (Mặc định)", nameEn: "1:1 (Square)", descriptionEn: "Balanced square frame (Default)" },
  { id: "16:9", name: "16:9 (Ngang)", ratio: "16:9", description: "Màn ảnh rộng (Tivi, Máy tính)", nameEn: "16:9 (Landscape)", descriptionEn: "Widescreen (TV, computer)" },
  { id: "4:3", name: "4:3 (Ngang)", ratio: "4:3", description: "Khung ảnh ngang cổ điển", nameEn: "4:3 (Landscape)", descriptionEn: "Classic landscape frame" },
  { id: "9:16", name: "9:16 (Dọc)", ratio: "9:16", description: "Dọc điện thoại (Story, TikTok)", nameEn: "9:16 (Portrait)", descriptionEn: "Phone vertical (Story, TikTok)" },
  { id: "3:4", name: "3:4 (Chân dung)", ratio: "3:4", description: "Khung ảnh đứng cổ điển", nameEn: "3:4 (Portrait)", descriptionEn: "Classic portrait frame" }
];

export const QUALITY_OPTIONS: QualityOption[] = [
  { id: "standard", name: "Ảnh tiêu chuẩn", description: "Tối ưu hóa tốc độ xử lý", cost: 5, nameEn: "Standard image", descriptionEn: "Optimized for processing speed" },
  { id: "1k", name: "Ảnh 1K", description: "Độ phân giải HD sắc nét", cost: 10, nameEn: "1K image", descriptionEn: "Sharp HD resolution" },
  { id: "3k", name: "Ảnh 3K", description: "Chất lượng cao chuyên nghiệp", cost: 20, nameEn: "3K image", descriptionEn: "High professional quality" },
  { id: "4k", name: "Ảnh 4K", description: "Độ nét cực đại, siêu chi tiết", cost: 30, nameEn: "4K image", descriptionEn: "Maximum sharpness, ultra detail" }
];

// Thư viện Mẫu: prompt kiến trúc mẫu do admin đăng tải để người dùng tham khảo/sử dụng luôn.
// Ảnh dưới đây là ảnh minh họa tạm (Unsplash) — thay bằng ảnh thật của dự án khi có.
export const TEMPLATE_POSTS: TemplatePost[] = [
  {
    id: "cao-tang-do-thi-thu-thiem",
    title: "Prompt chi tiết render Cao tầng đô thị",
    titleEn: "Detailed high-rise urban render prompt",
    category: "Kiến trúc",
    categoryEn: "Architecture",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1567449303078-57ad995bd17a?auto=format&fit=crop&w=1200&q=80",
    ],
    prompt: `Ảnh chụp kiến trúc chân thực, tổ hợp cao tầng đô thị gồm khối đế thương mại và tháp văn phòng cao tầng, phong cách hiện đại đương đại.

Khối tháp chính cao tầng, hình khối đứng mảnh, các góc bo tròn nhẹ, tỷ lệ mặt đứng tháp vươn cao thanh thoát. Mặt đứng tháp sử dụng hệ kính xanh xám, bề mặt bóng phản chiếu nhẹ, chia ô đều theo nhịp đứng. Khung mặt đứng tháp bằng kim loại màu trắng bạc, bề mặt mịn, tạo hệ đường kẻ dọc thanh mảnh và đều đặn. Các đường viền bo góc và viền cạnh tháp màu trắng sáng, bề mặt sơn mịn, chạy liên tục theo chiều cao công trình. Các mảng nhấn bên hông tháp có đường gờ bo cong màu trắng, xếp tầng theo phương đứng, tạo hiệu ứng mềm mại trên mặt đứng.

Khối đế thấp tầng kéo dài theo phương ngang, hình thức bo cong mềm, các dải sàn màu trắng chạy liên tục quanh mặt tiền. Mặt đứng khối đế có các dải cửa kính ngang màu xanh nhạt, bề mặt bóng, xen giữa các tầng sơn trắng mịn. Tầng trệt thương mại mở với cửa kính lớn, khung kim loại màu, ánh sáng nội thất vàng ấm nhẹ, có người đi bộ phía trước. Khu mái khối đế bố trí dải cây xanh đô thị, tán cây thấp màu xanh đậm, tạo lớp đệm cảnh quan dưới chân tháp.

Công trình được đặt tại khu đô thị Thủ Thiêm, TP.HCM, xung quanh là đại lộ rộng, cây xanh đô thị, các tòa văn phòng kính hiện đại và không gian vỉa hè thương mại. Người đi bộ di chuyển nhẹ trước sảnh, khách ra vào tầng trệt, ô tô, taxi và xe máy lưu thông vừa phải trên đường, phản chiếu đô thị trên mặt kính, motion blur tự nhiên rất nhẹ, không che khuất công trình chính.

Ánh sáng chính là ánh sáng xanh lạnh của bầu trời sau hoàng hôn, kết hợp với ánh đèn nội thất vàng cam ấm phát ra từ tầng trệt, sảnh chính và các khe kính đứng trên mặt đứng. Đèn đường bắt đầu bật sáng, tạo các điểm glow nhẹ. Mặt kính phản chiếu ánh đèn thành phố, tạo cảm giác sang trọng, cao cấp và hơi tương lai. Không khí đô thị hiện đại, sạch, tinh tế, có cảm giác nhộn nhịp nhẹ nhưng không hỗn loạn. Đường phố phía trước có xe cộ chạy qua với light streak và motion blur nhẹ, vài bóng người nhỏ ở vỉa hè để tạo tỷ lệ. Mặt đường hơi ẩm, phản chiếu ánh đèn xe và ánh vàng từ khối đế. Bầu trời chuyển sắc từ xanh cyan sang xanh xám nhạt, không mây dày, không nắng gắt.`,
  },
];

export const LOADING_MESSAGES = [
  "⚡ [Opzen AI Engine] Đang phân tích kết cấu không gian nguồn...",
  "📐 Đang dựng khung 3D, định vị hệ cửa sổ và các nguồn sáng...",
  "🧱 Đang tiến hành loại bỏ đồ nội thất thừa và mảng tường cũ...",
  "🛋️ Phủ vật liệu cao cấp và sắp xếp đồ đạc mới hợp phong thủy...",
  "💡 Cân chỉnh ánh sáng, độ đổ bóng tự nhiên cực kỳ chân thực...",
  "✨ Sử dụng mô hình Google Gemini 3.1 tạo phối cảnh photorealistic...",
  "⚡ Hoàn thiện so sánh Before/After chất lượng đỉnh cao...",
  "📦 Đang đóng gói dữ liệu và tải phối cảnh 3D xuống thiết bị..."
];

export const LOADING_MESSAGES_EN = [
  "⚡ [Opzen AI Engine] Analyzing the source space structure...",
  "📐 Building the 3D frame, locating windows and light sources...",
  "🧱 Removing excess furniture and old wall sections...",
  "🛋️ Applying premium materials and arranging new furniture...",
  "💡 Fine-tuning lighting and ultra-realistic natural shadows...",
  "✨ Using the Google Gemini 3.1 model to create a photorealistic render...",
  "⚡ Finalizing the top-quality Before/After comparison...",
  "📦 Packaging data and downloading the 3D render to your device..."
];

export interface DetailedSelectionOption {
  id: string;
  name: string;
  english: string;
  nameEn?: string; // tên hiển thị tiếng Anh trong dropdown (khác `english` vốn là câu prompt)
}

export const VIEW_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original perspective" },
  { id: "eye_level", name: "Góc ngang tầm mắt", nameEn: "Eye-level view", english: "eye-level camera view" },
  { id: "bird_eye", name: "Góc chim bay (Từ trên cao)", nameEn: "Bird's-eye (aerial)", english: "bird's eye drone view from above" },
  { id: "wide_angle", name: "Góc rộng toàn cảnh", nameEn: "Wide panoramic", english: "wide-angle panoramic view" },
  { id: "close_up", name: "Góc cận cảnh chi tiết", nameEn: "Close-up detail", english: "close-up detail macro view" },
  { id: "front", name: "Góc trực diện chính diện", nameEn: "Straight front view", english: "straight front architectural view" },
  { id: "side", name: "Góc nghiêng nghệ thuật", nameEn: "Artistic side angle", english: "three-quarter side perspective view" }
];

export const CONTEXT_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original surrounding context" },
  { id: "vn_street", name: "Đường phố Việt Nam", nameEn: "Vietnamese street", english: "typical Vietnamese residential street with neighboring townhouses closely built on both sides, local neighborhood streetscape" },
  { id: "vn_countryside", name: "Làng quê Việt Nam", nameEn: "Vietnamese countryside", english: "peaceful northern Vietnamese rural countryside with green rice paddies, rustic paths, bamboo groves and banana trees background" },
  { id: "modern_urban", name: "Khu đô thị hiện đại", nameEn: "Modern urban district", english: "modern urban district context, contemporary buildings, clean paved streets, manicured street trees, sophisticated urban surroundings" },
  { id: "t_junction", name: "Ngã ba đường", nameEn: "T-junction", english: "corner plot at a T-junction street intersection, roads meeting from two directions, wide sidewalk view" },
  { id: "crossroads", name: "Ngã tư đường", nameEn: "Crossroads", english: "corner plot at a four-way crossroads intersection, streets meeting from all directions, busy urban corner view" }
];

export const LIGHTING_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original balance lighting" },
  { id: "daylight", name: "Ánh sáng ban ngày tự nhiên", nameEn: "Natural daylight", english: "bright natural daylight with realistic soft shadows" },
  { id: "golden_hour", name: "Giờ vàng hoàng hôn ấm áp", nameEn: "Warm golden hour", english: "golden hour warm sunlight casting long dramatic shadows" },
  { id: "sunset", name: "Hoàng hôn lãng mạn", nameEn: "Romantic sunset", english: "vibrant dramatic sunset sky with moody reddish ambient light" },
  { id: "cozy_warm", name: "Ánh sáng ấm cúng", nameEn: "Cozy warm light", english: "cozy warm interior ambient lighting, glowing lamps" },
  { id: "natural_white", name: "Ánh sáng trắng hiện đại", nameEn: "Modern white light", english: "modern bright neutral white lighting" },
  { id: "ambient_night", name: "Đèn nội thất đêm lung linh", nameEn: "Sparkling night interior", english: "luxurious night interior lights glowing, dark blue starry night outside windows" }
];

export const WEATHER_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original climate atmosphere" },
  { id: "sunny", name: "Nắng rực rỡ", nameEn: "Bright sunny", english: "clear sunny sky, bright sunrays" },
  { id: "cloudy", name: "Trời nhiều mây dịu mát", nameEn: "Cool cloudy", english: "overcast sky, diffuse soft overcast lighting" },
  { id: "misty", name: "Sương mù mờ ảo", nameEn: "Misty haze", english: "magical misty foggy atmosphere, soft volume fog" },
  { id: "light_rain", name: "Mưa nhẹ lãng mạn", nameEn: "Romantic light rain", english: "peaceful soft light rain drizzle, wet glossy reflections" },
  { id: "snowy", name: "Tuyết rơi mùa đông", nameEn: "Winter snow", english: "scenic winter snowy weather, soft snowflakes falling, light white snow dusting" },
  { id: "after_rain", name: "Sau cơn mưa hửng nắng", nameEn: "Clearing after rain", english: "beautiful clearing sky after rain, double rainbow, fresh clean atmosphere, wet asphalt" }
];

export const COLOR_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original color scheme" },
  { id: "warm_cozy", name: "Tông màu ấm cúng (Warm Cozy)", nameEn: "Warm Cozy", english: "warm cozy color palette, soft cream, beige, light oak wood and sandy tones" },
  { id: "cool_modern", name: "Tông màu lạnh hiện đại (Cool Modern)", nameEn: "Cool Modern", english: "cool modern color palette, slate gray, charcoal, cool white and muted blue accents" },
  { id: "elegant_white", name: "Trắng sáng thanh lịch (Elegant White)", nameEn: "Elegant White", english: "bright elegant white color scheme, pure white, ivory plaster, and subtle light ash wood" },
  { id: "dark_luxury", name: "Trầm ấm sang trọng (Dark Luxury)", nameEn: "Dark Luxury", english: "dark luxury color scheme, deep walnut wood, charcoal black stone, and gold metal accents" },
  { id: "soothing_green", name: "Xanh lá dịu mát (Sage Green)", nameEn: "Sage Green", english: "soothing sage green color scheme, off-white plaster, soft olive accents, and natural wood" },
  { id: "monochrome", name: "Tối giản đơn sắc (Monochrome)", nameEn: "Monochrome", english: "monochrome minimalist palette, stark black, dark gray, and crisp white finishes" },
  { id: "wood_earth", name: "Màu gỗ & Đất tự nhiên (Earthy Wood)", nameEn: "Earthy Wood", english: "organic earthy wood palette, rich oak timber, warm terracotta clays, and beige linen textures" }
];

export const PLANNING_VIEW_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original perspective" },
  { id: "eye_level", name: "Tầm mắt người", nameEn: "Human eye level", english: "human eye-level camera view perspective" },
  { id: "bird_eye", name: "Phối cảnh mắt chim (Toàn cảnh)", nameEn: "Bird's-eye (panoramic)", english: "bird's-eye view, wide-angle aerial panoramic perspective" },
  { id: "perspective_45", name: "Phối cảnh 45°", nameEn: "45° perspective", english: "45-degree angle bird's-eye perspective" },
  { id: "street_view", name: "Góc nhìn đường phố", nameEn: "Street view", english: "ground-level street-view perspective" },
  { id: "front_view", name: "Góc nhìn chính diện", nameEn: "Front view", english: "straight front architectural facade perspective" },
  { id: "worms_eye", name: "Góc nhìn từ dưới lên", nameEn: "Worm's-eye (from below)", english: "low angle worm's-eye view looking up perspective" }
];

export const PLANNING_DENSITY_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "default density layout" },
  { id: "low_density_suburban", name: "Ngoại ô thấp tầng", nameEn: "Low-rise suburban", english: "low-density suburban neighborhood layout, sparse detached houses, plenty of gardens" },
  { id: "medium_density_mixed", name: "Phức hợp vừa", nameEn: "Medium mixed-use", english: "medium-density mixed-use block, moderate-height buildings and townhouses" },
  { id: "high_density_urban", name: "Đô thị cao tầng", nameEn: "High-rise urban", english: "high-density high-rise urban district with compact skyscrapers" },
  { id: "green_park", name: "Công viên cây xanh", nameEn: "Green park", english: "green park open public area, abundant trees, walkways, sparse lightweight structures" }
];

export const PLANNING_CONTEXT_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "default surrounding context" },
  { id: "vn_street", name: "Đường phố Việt Nam", nameEn: "Vietnamese street", english: "vibrant typical Vietnamese urban street context, narrow townhouses, storefronts, motorbikes" },
  { id: "vn_countryside", name: "Làng quê Việt Nam", nameEn: "Vietnamese countryside", english: "peaceful northern Vietnamese countryside, green rice fields, winding river, brick paths" },
  { id: "modern_city", name: "Khu đô thị hiện đại", nameEn: "Modern city", english: "sleek modern smart city context, glass facades, clean wide boulevards, neat landscape" },
  { id: "three_way_junction", name: "Ngã ba đường", nameEn: "T-junction", english: "dynamic three-way T-junction road intersection with clear lane markings" },
  { id: "four_way_junction", name: "Ngã tư đường", nameEn: "Crossroads", english: "busy four-way crossroads traffic intersection with traffic lights and crosswalks" }
];

export const PLANNING_LIGHTING_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original balanced lighting" },
  { id: "soft_sunrise", name: "Bình minh dịu nhẹ", nameEn: "Soft sunrise", english: "soft gentle sunrise golden morning lighting with light mist" },
  { id: "sunny_midday", name: "Buổi trưa nắng", nameEn: "Sunny midday", english: "bright sunny midday solar light with short sharp shadows" },
  { id: "sunset", name: "Hoàng hôn", nameEn: "Sunset", english: "vibrant sunset golden-hour sky, warm reddish and golden long casting shadows" },
  { id: "evening_warm", name: "Buổi tối (Đèn vàng)", nameEn: "Evening (warm light)", english: "evening warm street lighting, illuminated windows, glowing ambient yellow light" },
  { id: "midnight_starry", name: "Đêm khuya (Sao)", nameEn: "Starry midnight", english: "midnight starry night sky, dim moonlight, dark blue atmosphere, illuminated building lights" }
];

export const PLANNING_WEATHER_OPTIONS: DetailedSelectionOption[] = [
  { id: "default", name: "Mặc định", nameEn: "Default", english: "original weather atmosphere" },
  { id: "clear_sky", name: "Trời trong xanh", nameEn: "Clear sky", english: "clear blue sunny sky, no clouds, high visibility" },
  { id: "light_rain", name: "Mưa nhẹ", nameEn: "Light rain", english: "peaceful soft light rain drizzle, wet glistening streets and surfaces" },
  { id: "snowy", name: "Tuyết rơi", nameEn: "Snowfall", english: "magical winter snowy weather with gentle snowflakes falling and dusting surfaces" },
  { id: "harsh_sun", name: "Nắng gắt", nameEn: "Harsh sun", english: "harsh direct bright sunlight with strong contrast shadows" },
  { id: "after_rain", name: "Sau mưa", nameEn: "After rain", english: "fresh post-rain clean atmosphere, wet asphalt reflections, clearing sky" }
];

