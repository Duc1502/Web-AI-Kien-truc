import express from "express";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { PRICING_PLANS } from "./src/config.js";

// Load environment variables (.env.local takes precedence, matching README setup instructions)
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const app = express();

// Setup JSON body parsing with high limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Supabase service-role client — dùng để ghi transactions (bảng không có policy INSERT cho
// client, chỉ tin tưởng server này). Chỉ khởi tạo khi đã cấu hình đủ biến môi trường.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

// Upload một ảnh (data URL base64) lên bucket private "renders" để Admin Dashboard hiển thị
// thumbnail (ảnh gốc → ảnh kết quả). Trả về object path đã lưu, hoặc null nếu lỗi — bọc kín để
// sự cố Storage KHÔNG làm hỏng luồng render/trừ credit. Admin đọc lại qua signed URL (service_role).
async function uploadRenderImage(objectPath: string, dataUrl: string): Promise<string | null> {
  if (!supabaseAdmin || !dataUrl) return null;
  try {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    const contentType = match ? match[1] : "image/png";
    const base64 = match ? match[2] : dataUrl;
    const buffer = Buffer.from(base64, "base64");
    const { error } = await supabaseAdmin.storage
      .from("renders")
      .upload(objectPath, buffer, { contentType, upsert: true });
    if (error) {
      console.error(`Upload render image thất bại (${objectPath}):`, error.message);
      return null;
    }
    return objectPath;
  } catch (err) {
    console.error(`Upload render image lỗi (${objectPath}):`, err);
    return null;
  }
}

// Health check
export const handleHealth = (req: any, res: any) => {
  res.json({ status: "ok", message: "CảiTạoNhà.AI API is running smoothly!" });
};

// API: Tạo đơn hàng nạp credit (trạng thái pending), chờ đối soát VietQR thủ công/tự động.
export const handleCreateOrder = async (req: any, res: any): Promise<any> => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: "Chưa cấu hình SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trên server.",
      });
    }

    const { userId, planId, fullName, phone } = req.body;
    if (!userId || !planId || !fullName || !phone) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc." });
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({ error: "Gói cước không hợp lệ." });
    }

    const referenceCode = `OPZ${userId.slice(0, 6).toUpperCase()}${Date.now().toString().slice(-6)}`;

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: userId,
        amount_vnd: plan.price,
        package_id: plan.id,
        method: "vietqr",
        status: "pending",
        reference_code: referenceCode,
        raw_payload: { fullName, phone, planName: plan.name, credits: plan.credits },
      })
      .select("id")
      .single();

    if (error) throw error;

    return res.json({
      transactionId: data.id,
      referenceCode,
      amountVnd: plan.price,
    });
  } catch (error: any) {
    console.error("Error creating checkout order:", error);
    return res.status(500).json({
      error: error.message || "Đã xảy ra lỗi khi tạo đơn hàng.",
    });
  }
};

// API: Generate image renovation
export const handleGenerate = async (req: any, res: any): Promise<any> => {
  let deductedUserId: string | null = null;
  let deductedAmount = 0;
  let estimatedCostUsd = 0;
  let generationRoomType: string | undefined;
  let generationStyle: string | undefined;
  let generationResolution: string | undefined;
  const generationId = randomUUID(); // id cố định để đặt tên object Storage khớp với hàng generations
  const generationStartedAt = Date.now();

  try {
    const {
      image,
      quality,
      styleId,
      styleName,
      stylePrompt,
      roomType,
      roomTypeId,
      lightingId,
      colorId,
      activeTab,
      school,
      notes,
      aspectRatio,
      mode,
      creativity,
      viewName,
      viewEnglish,
      contextName,
      contextEnglish,
      lightingName,
      lightingEnglish,
      weatherName,
      weatherEnglish,
      colorName,
      colorEnglish,
      densityName,
      densityEnglish,
      refImages
    } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Thiếu hình ảnh gốc để cải tạo." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in environment");
      return res.status(500).json({
        error: "Ứng dụng chưa cấu hình API Key. Vui lòng thêm GEMINI_API_KEY trong Settings > Secrets.",
      });
    }

    // --- Xác thực người dùng + trừ credit server-side (bắt buộc đăng nhập để render) ---
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: "Server chưa cấu hình Supabase (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
      });
    }

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!accessToken) {
      return res.status(401).json({ error: "Vui lòng đăng nhập để sử dụng tính năng render." });
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn, vui lòng đăng nhập lại." });
    }
    const userId = authData.user.id;

    const resolutionKey = (quality || "standard") as string;
    const { data: costSetting } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "credit_cost_by_resolution")
      .single();
    const costMap = (costSetting?.value as Record<string, number> | null) || {
      standard: 5,
      "1k": 10,
      "3k": 20,
      "4k": 30,
    };
    const cost = costMap[resolutionKey] ?? 10;

    // Giá vốn API ước tính (USD) cho lượt render này — ghi vào generations.estimated_cost_usd để
    // Overview/Costs có số chi phí/lợi nhuận thật. Admin chỉnh bảng giá này trong Settings.
    const { data: apiCostSetting } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "estimated_cost_usd_by_resolution")
      .single();
    const apiCostMap = (apiCostSetting?.value as Record<string, number> | null) || {
      standard: 0.02,
      "1k": 0.04,
      "3k": 0.10,
      "4k": 0.15,
    };
    estimatedCostUsd = apiCostMap[resolutionKey] ?? 0;

    const { data: newBalance, error: deductError } = await supabaseAdmin.rpc("deduct_credits", {
      p_user_id: userId,
      p_amount: cost,
    });
    if (deductError) throw deductError;
    if (newBalance === null) {
      return res.status(402).json({
        error: "Không đủ credit để thực hiện render này. Vui lòng mua thêm credit tại trang Bảng Giá.",
      });
    }

    // Ghi nhớ để hoàn credit + log lịch sử render dù thành công hay lỗi (xem catch bên dưới).
    deductedUserId = userId;
    deductedAmount = cost;
    generationRoomType = roomType;
    generationStyle = styleName;
    generationResolution = resolutionKey;

    // Process base64 image
    const imageMatch = image.match(/^data:([^;]+);base64,(.+)$/);
    let mimeType = "image/jpeg";
    let base64Data = image;

    if (imageMatch) {
      mimeType = imageMatch[1];
      base64Data = imageMatch[2];
    }

    // Parse reference images if any
    const refParts: any[] = [];
    if (Array.isArray(refImages)) {
      for (const refImage of refImages) {
        if (refImage && typeof refImage === "string" && refImage.startsWith("data:")) {
          const match = refImage.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            refParts.push({
              inlineData: {
                data: match[2],
                mimeType: match[1],
              }
            });
          }
        }
      }
    }

    let designPrompt = "";

    if (activeTab === "sync_view") {
      // Ảnh gốc đã đẹp sẵn — chỉ cần đổi góc chụp, không cần chỉ dẫn phức tạp về vật liệu/phong cách.
      designPrompt = notes && notes.trim().length > 0
        ? notes.trim()
        : "Giữ nguyên toàn bộ nội dung ảnh gốc, chỉ đổi góc chụp camera sang một góc nhìn khác.";
    } else if (activeTab === "edit_photo") {
      // Chỉnh sửa cục bộ theo điểm đánh dấu / mô tả — không dùng prompt "giữ nguyên 100%, không được thêm/xóa"
      // của chế độ tương thích chung, vì nó mâu thuẫn trực tiếp với mục đích chỉnh sửa của tab này.
      designPrompt = notes && notes.trim().length > 0
        ? notes.trim()
        : "Thực hiện chỉnh sửa theo mô tả được cung cấp, giữ nguyên mọi khu vực không liên quan trong ảnh.";
    } else if (activeTab === "extended_features") {
      // Mỗi tool trong "Tính năng mở rộng" (Re-Render, Upscale AI, Sketch Render, ...) đã được
      // client build sẵn thành một câu lệnh hoàn chỉnh, tự nhiên — dùng thẳng, không đẩy qua
      // nhánh "compatibility mode" (viết cho renovate ảnh chụp, không phù hợp các tool này).
      designPrompt = notes && notes.trim().length > 0
        ? notes.trim()
        : "Biến ảnh thành ảnh thực tế.";
    } else if (activeTab === "render_floorplan" && school === "architecture") {
      // Đầu vào là bản vẽ mặt bằng kỹ thuật (không phải ảnh chụp), nên KHÔNG dùng nhánh
      // "compatibility mode" ở dưới — nhánh đó viết cho việc renovate một bức ảnh chụp thật
      // ("transform this exterior building PHOTO..."), sai hoàn toàn ngữ cảnh cho tác vụ này.
      // Client đã build sẵn câu lệnh tự nhiên (gồm chế độ top-down/3D và các lựa chọn), server
      // chỉ cần dùng lại, kèm câu mặc định dự phòng nếu vì lý do gì đó client không gửi notes.
      designPrompt = notes && notes.trim().length > 0
        ? notes.trim()
        : "Biến bản vẽ mặt bằng kỹ thuật này thành phối cảnh tổng thể 3D chân thực, giữ nguyên góc nhìn từ trên xuống và bố cục mặt bằng gốc, tô màu vật liệu và ánh sáng chân thực.";
    } else if (activeTab === "render_photo" || activeTab === "renovate_ai") {
        // Maps for Interior Space
        const interiorRoomMap: Record<string, string> = {
          living_room: "living room",
          master_bedroom: "master bedroom",
          children_room: "children's room",
          kitchen_dining: "kitchen and dining",
          bathroom: "bathroom",
          workspace: "home office",
          altar_room: "ancestor altar worship room",
          balcony_terrace: "balcony and terrace",
          foyer_entrance: "foyer entrance",
          media_room: "home media theater room",
          wardrobe: "walk-in wardrobe dressing closet",
          staircase_void: "staircase",
          cafe_restaurant_interior: "commercial cafe lounge restaurant interior",
          retail_showroom: "retail shop boutique design interior",
          office_interior: "corporate open office interior workspace",
        };

        const interiorStyleMap: Record<string, string> = {
          modern_luxe: "Modern luxury style: elegant white Calacatta marble wall cladding, polished marble or dark wood flooring, sleek gold steel accents, custom velvet couches, warm ambient linear lighting, large glass panels, sophisticated and prestigious atmosphere.",
          japandi: "Japandi style: low height beige oak furniture, wabi-sabi minimalist concept, sliding paper shoji textures, light gray lime-wash textured plaster walls, miniature bonsai tree, diffuse soft sunlight, serene zen tranquility.",
          scandinavian_interior: "Scandinavian style: light oak wood flooring, white and soft grey walls, natural linen and wool textiles, simple functional furniture with clean lines, greenery, abundant natural light, cozy hygge atmosphere.",
          indochine_interior: "Indochine style: black teakwood cabinets, rattan weave detailing on furniture, iconic green-and-white cement mosaic floor tiles, tropical broadleaf houseplants, brass vintage table lamps, warm cinematic nostalgic glow, blending French romance with East Asian heritage.",
          wabisabi_interior: "Wabi-sabi style: curved clay plaster walls, raw weathered wooden beams on ceiling, rough-hewn stone elements, organic linen fabrics, hand-carved pottery, low-key earthy organic tones, shadows of dry twigs, celebrating imperfection.",
          industrial_interior: "Industrial Loft style: exposed red brick masonry, black metal columns and pipework, dark leather sofa, polished concrete floor, large iron-framed grid windows, warm golden light from vintage filament bulbs.",
          neoclassical_interior: "Neoclassical style: symmetrical architectural layout, ornate white wall panel moldings, soft gold gilded cornices, luxurious crystal chandelier, marble dining table, velvet dining chairs, elegant French-inspired royal elite feel.",
          tropical_interior: "Tropical resort style: bamboo and rattan woven ceiling, large banana leaf plants, soft cream linen curtains blowing in the ocean breeze, wooden shutters, terracotta pottery, warm coastal daylight.",
          coastal_mediterranean: "Mediterranean coastal style: curved interior archways, white stucco brick walls, royal navy blue accents, exposed warm timber lintels, terracotta floor tiles, bright sunlight pouring in, olive branches decoration."
        };

        // Maps for Architecture Space
        const architectureRoomMap: Record<string, string> = {
          townhouse: "townhouse",
          tube_house: "tube house with narrow facade",
          villa: "modern villa",
          garden_house: "garden house",
          single_storey: "single-storey country house",
          apartment_building: "apartment building",
          facade: "architectural front facade",
          shophouse: "commercial shophouse",
          cafe_restaurant_exterior: "commercial cafe restaurant",
          hotel_resort: "luxury hotel resort",
          office_commercial: "commercial corporate building",
          homestay_bungalow: "homestay cabin bungalow",
          public_building: "public building facade",
        };

        const architectureStyleMap: Record<string, string> = {
          arch_modern: "Modern architecture style: sharp clean geometric facades, large dynamic glass windows, premium concrete cladding, luxury outdoor warm lighting, highly polished architectural feel.",
          arch_minimalist: "Minimalist exterior villa architecture style: raw board-formed concrete walls, massive cantilever structures, single continuous black metal frame windows, soft moody shadow play.",
          arch_neoclassical: "Neoclassical style: grand neoclassical mansion exterior facade, symmetrical classical architectural portals, delicate wall molding, white limestone cladding, elegant arched windows.",
          arch_classical: "Classical European style: palatial european chateau exterior, majestic ionic columns, elaborate hand-carved stone reliefs, symmetrical layout, grand entry staircase.",
          arch_indochine: "Indochine style: historic indochine heritage villa exterior, warm yellow ochre textured walls, elegant dark wood shutter windows, clay tile roof, traditional wooden balconies, tropical palms surrounding.",
          arch_french_colonial: "French Colonial style: french colonial boutique estate facade, wrought iron ornate balconies, high double-hung arched windows, white plaster walls, premium landscape lighting.",
          arch_mediterranean: "Mediterranean style: sun-drenched mediterranean estate exterior, textured white stucco masonry, curved entry archways, warm terracotta roof tiles, lush pink bougainvillea flowers cascading.",
          arch_tropical: "Tropical modernist architectural style: rich cedarwood slat facades, massive deep roof overhangs, open layouts, water reflection ponds, towering palms.",
          arch_green_eco: "Eco-friendly biophilic architecture style: vertical foliage hanging gardens on brick facade, solar panel rooftop lawns, natural timber screen structures."
        };

        // Maps for Landscape Space
        const landscapeRoomMap: Record<string, string> = {
          villa_garden: "luxury villa garden yard",
          townhouse_garden: "cozy townhouse courtyard",
          penthouse_terrace: "rooftop terrace penthouse garden",
          resort_landscape: "resort-style tropical leisure landscape",
          cafe_garden: "commercial cafe outdoor garden",
          front_yard: "front yard entrance path",
          back_yard: "backyard family retreat",
          side_yard: "side yard walkway corridor",
          koi_pond_garden: "exquisite koi pond water garden",
        };

        const landscapeStyleMap: Record<string, string> = {
          japanese_zen_garden: "Japanese Zen style: traditional japanese zen garden landscape, fine white gravel patterns, beautifully balanced stepping stones, clear koi pond, minimalist wooden bridges, maple trees, stone lanterns.",
          dry_rock_garden: "Dry rock garden style: modern minimalist dry rock garden, stacked flat stone slabs, gravel bedding, architectural agave and barrel cacti, soft twilight uplighting.",
          modern_minimalist_landscape: "Modern minimalist landscape design: neat limestone paving grid, pristine green lawn patches, architectural black metal planters, simple linear layout, dramatic warm accent spotlights.",
          tropical_resort_landscape: "Tropical resort garden style: dense layers of broadleaf elephant ears, birds of paradise, lush fan palms, raw granite boulders, cascading natural waterfall features, ambient night uplights.",
          english_cottage_garden: "English country cottage style: winding brick walkways, overflowing colorful perennial flower borders with lavender and hydrangeas, climbing white roses on rustic trellises.",
          mediterranean_courtyard: "Mediterranean courtyard design: warm terracotta pots with olive trees, terracotta tile pavers, gravel pathways, rustic dry-stacked stone walls, lavender and rosemary plantings.",
          chinese_classical_garden: "Chinese classical garden style: jagged scholars rocks, ornate moon gates, weeping willows, curved roof pavilions, winding pathways over water, traditional scholar poetry atmosphere.",
          modern_luxury_pool: "Modern luxury pool landscape: beautiful light limestone pool deck, sleek glass fencing, premium wooden sun lounger decks, lush privacy hedges.",
          vertical_green_wall: "Vertical green wall and biophilic design: dense lush green wall panels, rich automated drip watering systems, clean architectural timber pergolas."
        };

        // Maps for Planning Space
        const planningRoomMap: Record<string, string> = {
          residential_neighborhood: "residential neighborhood block complex",
          new_urban_area: "new urban development plan",
          mixed_use: "mixed-use commercial district masterplan",
          resort_complex: "leisure resort master planning grounds",
          industrial_park: "industrial logistics warehouse park design",
          commercial_district: "downtown CBD masterplan layout",
          park_public_space: "urban central green park open spaces",
          plaza: "urban public town plaza square plan",
          masterplan: "comprehensive site masterplan development map",
          streetscape: "streetscape sidewalk boulevard boulevard green corridor",
          social_housing: "affordable social housing block planning",
        };

        const planningStyleMap: Record<string, string> = {
          compact_high_density: "Compact high-density style: towering sleek modern skyscrapers, integrated skybridges, vertical green terraces, smart pedestrian districts.",
          eco_green_city: "Eco green city layout: sustainable low-impact developments, solar panel rooftops, extensive bioswales, deep blue water canals, wind turbines, lush interconnected greenways.",
          garden_city: "Garden city plan: classic concentric circle neighborhoods, low-rise cottage blocks, majestic public parks at hubs, sweeping greenbelts separating sectors.",
          new_urbanism: "New Urbanism walkable grid: human-scale classic building facades, wide tree-lined sidewalks, charming street corners, active civic plazas.",
          smart_city: "Smart city style: high-tech digital infrastructure, automatic self-driving electric transit lanes, clean energy grids, highly advanced architectural designs.",
          transit_oriented_tod: "Transit-oriented development (TOD): elegant modern central railway/metro hub, sleek sky trains, dense mixed-use tower clusters surrounding the station, integrated bike highways."
        };

        // Lighting and Color Maps
        const lightingMap: Record<string, string> = {
          daylight: "bright natural daylight streaming through the windows",
          golden_hour: "warm golden-hour sunlight with soft long shadows",
          sunset: "warm golden-hour sunlight with soft long shadows",
          cozy_warm: "cozy warm evening lighting, glowing lamps, ambient warmth",
          natural_white: "bright even studio-like lighting, crisp and clean",
          ambient_night: "dim moody atmosphere with warm accent lighting",
        };

        const colorMap: Record<string, string> = {
          elegant_white: "neutral palette of whites, beige, greige and soft greys",
          warm_cozy: "warm palette of terracotta, wood tones, warm beige and amber",
          cool_modern: "cool palette of blues, cool greys and soft greens",
          wood_earth: "earthy natural palette of browns, clay, olive and natural wood",
          monochrome: "monochrome palette, tonal variations of a single color",
          dark_luxury: "monochrome palette, tonal variations of a single color",
          soothing_green: "soft muted pastel palette",
        };

      if (school === "interior") {
        const cleanName = (str: string) => {
          if (!str) return "Mặc định";
          return str.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
        };

        const cleanRoom = cleanName(roomType);
        const cleanStyle = cleanName(styleName);
        const cleanLighting = cleanName(lightingName);
        const cleanColor = cleanName(colorName);

        if (refParts.length === 0) {
          designPrompt = `You are a professional interior designer. Adapt the composition of the interior scene from the source image to fit this new frame. Do not add black bars or letterbox. The main creative instruction is: Biến thành ảnh chụp thực tế không gian nội thất, loại hình: ${cleanRoom}, phong cách: ${cleanStyle}, ánh sáng: ${cleanLighting}, tông màu: ${cleanColor}.
Lưu ý: Giữ nguyên tuyệt đối bố cục chính xác của mô hình đã tải lên, bao gồm: cấu trúc không gian, vị trí đồ vật, tỷ lệ không gian, góc camera và toàn bộ các yếu tố trong cảnh.
Không được thay đổi, thêm mới, xóa bỏ, phóng to, thu nhỏ hoặc di chuyển bất kỳ chi tiết nào. Không được thay đổi hình dạng phòng, bố cục mặt bằng hay cách sắp xếp hiện trạng của cảnh.
Không có cảm giác CGI, không có bề mặt nhựa hoặc nhân tạo. Vật liệu phải siêu chân thực, có đặc tính vật lý như ngoài đời thật, không quá bóng, không quá sạch hoặc giả tạo. Không khí tổng thể yên tĩnh, ấm áp, dễ chịu.
Cấu trúc cảnh phải khớp 1:1 với ảnh gốc, không chỉnh sửa bố cục ban đầu. Loại bỏ hoàn toàn cảm giác render nhựa, thay bằng vật liệu gỗ ấm chân thực với biến thiên vân gỗ tự nhiên. Bổ sung kết cấu vải mềm với chi tiết dệt tinh tế, chuyển sắc bóng đổ nhẹ nhàng, không dùng ánh sáng phẳng, không có bề mặt hoàn toàn trơn láng.`;
        } else {
          designPrompt = `You are a professional interior designer. Adapt the composition of the interior scene from the source image to fit this new frame. Do not add black bars or letterbox. The main creative instruction is: Biến thành ảnh chụp thực tế không gian nội thất, loại hình: ${cleanRoom}, phong cách: ${cleanStyle}, ánh sáng: ${cleanLighting}, tông màu: ${cleanColor}. Make it photorealistic interior design.
Lưu ý: Tôi đính kèm ảnh tham chiếu về nội thất mà tôi muốn sử dụng, từ ảnh tham chiếu đó hãy giúp tôi tạo ra một không gian nội thất mang đậm cá tính của ảnh tham chiếu.`;
        }

        if (notes && notes.trim().length > 0) {
          designPrompt += `\n\nYêu cầu bổ sung từ người dùng: ${notes.trim()}`;
        }

        const englishDetails: string[] = [];
        if (stylePrompt && styleName !== "Mặc định") englishDetails.push(`Aesthetic design style: ${stylePrompt}`);
        if (viewEnglish && viewName !== "Mặc định") englishDetails.push(`Perspective: ${viewEnglish}`);
        if (contextEnglish && contextName !== "Mặc định") englishDetails.push(`Surroundings: ${contextEnglish}`);
        if (lightingEnglish && lightingName !== "Mặc định") englishDetails.push(`Lighting scenario: ${lightingEnglish}`);
        if (weatherEnglish && weatherName !== "Mặc định") englishDetails.push(`Atmosphere: ${weatherEnglish}`);

        if (englishDetails.length > 0) {
          designPrompt += `\n\nTechnical rendering attributes for reference:\n- ${englishDetails.join("\n- ")}`;
        }
      } else if (school === "architecture") {
        const cleanName = (str: string) => {
          if (!str) return "Mặc định";
          return str.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
        };

        const cleanRoom = cleanName(roomType);
        const cleanStyle = cleanName(styleName);
        const cleanView = cleanName(viewName);
        const cleanContext = cleanName(contextName);
        const cleanLighting = cleanName(lightingName);
        const cleanWeather = cleanName(weatherName);

        if (activeTab === "renovate_ai") {
          // Renovation must preserve the existing building, so it keeps the stricter,
          // structure-locking prompt (unlike plain "Render Ảnh" below).
          if (refParts.length === 0) {
            designPrompt = `Bạn là một kiến trúc sư thiết kế ngoại thất chuyên nghiệp,chuyên tạo ra những bức ảnh ngoại thất đẹp giống như ảnh thực tế.
Hãy tạo cho tôi bức ảnh này với Chất lượng ảnh siêu chân thực như ảnh chụp thực tế. Yêu cầu ảnh đầu ra với: loại hình công trình: ${cleanRoom}, phong cách: ${cleanStyle}, góc nhìn: ${cleanView}, bối cảnh: ${cleanContext}, ánh sáng: ${cleanLighting}, thời tiết: ${cleanWeather}.

Giữ nguyên tuyệt đối bố cục chính xác của mô hình đã tải lên, bao gồm: cấu trúc không gian, vị trí đồ vật, tỷ lệ không gian, góc camera và toàn bộ các yếu tố trong cảnh.

Không được thay đổi, thêm mới, xóa bỏ, phóng to, thu nhỏ hoặc di chuyển bất kỳ chi tiết nào. Không được thay đổi hình dạng phòng, bố cục mặt bằng hay cách sắp xếp hiện trạng của cảnh.

Không có cảm giác CGI, không có bề mặt nhựa hoặc nhân tạo. Vật liệu phải siêu chân thực, có đặc tính vật lý như ngoài đời thật, không quá bóng, không quá sạch hoặc giả tạo. Không khí tổng thể yên tĩnh, ấm áp, dễ chịu. Loại bỏ cảm giác render nhựa.`;
          } else {
            designPrompt = `Dựa vào ảnh tham chiếu, hãy tạo cho tôi ảnh ngoại thất mang phong cách giống như ảnh tham chiếu. Yêu cầu ảnh đầu ra với: loại hình công trình: ${cleanRoom}, phong cách: ${cleanStyle}, góc nhìn: ${cleanView}, bối cảnh: ${cleanContext}, ánh sáng: ${cleanLighting}, thời tiết: ${cleanWeather}.`;
          }

          if (notes && notes.trim().length > 0) {
            designPrompt += `\n\nYêu cầu bổ sung từ người dùng: ${notes.trim()}`;
          }

          const englishDetails: string[] = [];
          if (stylePrompt && styleName !== "Mặc định") englishDetails.push(`Aesthetic design style: ${stylePrompt}`);
          if (viewEnglish && viewName !== "Mặc định") englishDetails.push(`Perspective: ${viewEnglish}`);
          if (contextEnglish && contextName !== "Mặc định") englishDetails.push(`Surroundings: ${contextEnglish}`);
          if (lightingEnglish && lightingName !== "Mặc định") englishDetails.push(`Lighting scenario: ${lightingEnglish}`);
          if (weatherEnglish && weatherName !== "Mặc định") englishDetails.push(`Atmosphere: ${weatherEnglish}`);

          if (englishDetails.length > 0) {
            designPrompt += `\n\nTechnical rendering attributes for reference:\n- ${englishDetails.join("\n- ")}`;
          }
        } else {
          // Render Ảnh > Kiến trúc: short, natural-sounding prompt, always grounded on the
          // uploaded photo. Priority order:
          // 1) the user's own notes (used AS the prompt, not merged/duplicated with the rest)
          // 2) an uploaded reference image
          // 3) selected dropdown details, skipping anything left at "Mặc định"
          // No raw English SD/Midjourney-style keyword soup (e.g. stylePrompt's
          // "..., 8k resolution") — this model is an LLM-based photo editor, not a
          // text-to-image generator, and tag-soup plus a prompt that never references
          // "this building" is what made prior renders look like a generic fake render
          // instead of the actual uploaded building.
          const details: string[] = [];
          if (cleanStyle !== "Mặc định") details.push(`phong cách ${cleanStyle}`);
          if (cleanView !== "Mặc định") details.push(cleanView);
          if (cleanContext !== "Mặc định") details.push(cleanContext);
          if (cleanLighting !== "Mặc định") details.push(cleanLighting);
          if (cleanWeather !== "Mặc định") details.push(cleanWeather);
          const detailLine = details.join(", ");

          if (notes && notes.trim().length > 0) {
            designPrompt = notes.trim();
            if (!/[.!?]$/.test(designPrompt)) designPrompt += ".";
            if (refParts.length > 0) {
              designPrompt += " Đồng thời tham khảo thêm phong cách, ánh sáng và vật liệu từ ảnh tham chiếu đính kèm.";
            }
            if (!/chân thực|sắc nét|photorealistic|realistic/i.test(designPrompt)) {
              designPrompt += " Phong cách nhiếp ảnh kiến trúc chân thực, sắc nét.";
            }
          } else if (refParts.length > 0) {
            designPrompt = `Hãy tạo cho tôi hình ảnh chụp thực tế của công trình trong ảnh chính, dựa theo phong cách, ánh sáng, bối cảnh và vật liệu của ảnh tham chiếu đính kèm${detailLine ? `, ${detailLine}` : ""}.`;
          } else {
            designPrompt = `Biến thành ảnh chụp thực tế nhà ở${detailLine ? `, ${detailLine}` : ""}. Phong cách nhiếp ảnh kiến trúc chân thực, sắc nét.`;
          }
        }
      } else if (school === "landscape") {
        const cleanName = (str: string) => {
          if (!str) return "Mặc định";
          return str.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
        };

        const cleanRoom = cleanName(roomType);
        const cleanStyle = cleanName(styleName);
        const cleanView = cleanName(viewName);
        const cleanContext = cleanName(contextName);
        const cleanLighting = cleanName(lightingName);
        const cleanWeather = cleanName(weatherName);

        if (refParts.length === 0) {
          designPrompt = `Là một nhiếp ảnh gia phong cảnh chuyên nghiệp, chuyên chụp ảnh khu vườn thiết kế tuyệt đẹp và không gian sống ngoài trời, hãy biến khung cảnh ngoài trời này thành một khu vườn cảnh quan được thiết kế chuyên nghiệp.
Yêu cầu ảnh đầu ra với loại công trình: ${cleanRoom}, phong cách: ${cleanStyle}, góc nhìn: ${cleanView}, bối cảnh: ${cleanContext}, ánh sáng: ${cleanLighting}, thời tiết: ${cleanWeather}. Chất lượng ảnh siêu chân thực như ảnh chụp thực tế
QUAN TRỌNG: Giữ nguyên tuyệt đối bố cục chính xác của mô hình đã tải lên, bao gồm: cấu trúc không gian, vị trí đồ vật, tỷ lệ không gian, góc camera và toàn bộ các yếu tố trong cảnh.
Không được thay đổi, thêm mới, xóa bỏ, phóng to, thu nhỏ hoặc di chuyển bất kỳ chi tiết nào. Không được thay đổi hình dạng phòng, bố cục mặt bằng hay cách sắp xếp hiện trạng của cảnh.
Tránh: các họa tiết phẳng độ phân giải thấp, cỏ nhân tạo trông như nhựa, mô hình cây nhân bản, màu xanh neon quá bão hòa, hiệu ứng nước hoạt hình và bất kỳ văn bản hoặc logo nào được phủ lên trên.`;
        } else {
          designPrompt = `Render cho tôi ảnh thiết kế sân vườn, sử dụng các đặc điểm của ảnh tham chiếu mà tôi đã gửi.
Yêu cầu ảnh đầu ra với loại công trình: ${cleanRoom}, phong cách: ${cleanStyle}, góc nhìn: ${cleanView}, bối cảnh: ${cleanContext}, ánh sáng: ${cleanLighting}, thời tiết: ${cleanWeather}.`;
        }

        if (notes && notes.trim().length > 0) {
          designPrompt += `\n\nYêu cầu bổ sung từ người dùng: ${notes.trim()}`;
        }

        const englishDetails: string[] = [];
        if (stylePrompt && styleName !== "Mặc định") englishDetails.push(`Aesthetic design style: ${stylePrompt}`);
        if (viewEnglish && viewName !== "Mặc định") englishDetails.push(`Perspective: ${viewEnglish}`);
        if (contextEnglish && contextName !== "Mặc định") englishDetails.push(`Surroundings: ${contextEnglish}`);
        if (lightingEnglish && lightingName !== "Mặc định") englishDetails.push(`Lighting scenario: ${lightingEnglish}`);
        if (weatherEnglish && weatherName !== "Mặc định") englishDetails.push(`Atmosphere: ${weatherEnglish}`);

        if (englishDetails.length > 0) {
          designPrompt += `\n\nTechnical rendering attributes for reference:\n- ${englishDetails.join("\n- ")}`;
        }
      } else if (school === "planning") {
        const cleanName = (str: string) => {
          if (!str) return "Mặc định";
          return str.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
        };

        const cleanView = cleanName(viewName);
        const cleanDensity = cleanName(densityName);
        const cleanContext = cleanName(contextName);
        const cleanLighting = cleanName(lightingName);
        const cleanWeather = cleanName(weatherName);

        if (refParts.length === 0) {
          designPrompt = `Là một nhà quy hoạch kiến trúc và đô thị chuyên nghiệp, hãy chụp ảnh toàn cảnh quy hoạch tổng thể 3D từ trên cao để chuyển đổi bức ảnh bố cục đô thị này thành hình ảnh trực quan quy hoạch tổng thể 3D hoàn chỉnh.
QUAN TRỌNG: Giữ nguyên bố cục đường sá, các khu nhà, phân chia lô đất, đường bờ biển hoặc các vùng nước. Không thay đổi cấu trúc không gian tổng thể hoặc hình học vĩ mô.
Ảnh đầu ra với góc nhìn: ${cleanView}, mật độ: ${cleanDensity}, bối cảnh: ${cleanContext}, ánh sáng: ${cleanLighting}, thời tiết: ${cleanWeather}.`;
        } else {
          designPrompt = `Dựa vào ảnh tham chiếu ( ảnh 2) mà tôi gửi, hãy tạo cho tôi một ảnh mang đầy đủ đặc tính của ảnh tham chiếu.
Ảnh đầu ra với góc nhìn: ${cleanView}, mật độ: ${cleanDensity}, bối cảnh: ${cleanContext}, ánh sáng: ${cleanLighting}, thời tiết: ${cleanWeather}.
lưu ý: Giữ nguyên tuyệt đối bố cục chính xác của mô hình đã tải lên, bao gồm: cấu trúc không gian, vị trí đồ vật, tỷ lệ không gian, góc camera và toàn bộ các yếu tố trong cảnh.
Không được thay đổi, thêm mới, xóa bỏ, phóng to, thu nhỏ hoặc di chuyển bất kỳ chi tiết nào. Không được thay đổi hình dạng phòng, bố cục mặt bằng hay cách sắp xếp hiện trạng của cảnh.`;
        }

        if (notes && notes.trim().length > 0) {
          designPrompt += `\n\nYêu cầu bổ sung từ người dùng: ${notes.trim()}`;
        }

        const englishDetails: string[] = [];
        if (viewEnglish && viewName !== "Mặc định") englishDetails.push(`Perspective: ${viewEnglish}`);
        if (densityEnglish && densityName !== "Mặc định") englishDetails.push(`Density layout: ${densityEnglish}`);
        if (contextEnglish && contextName !== "Mặc định") englishDetails.push(`Surroundings: ${contextEnglish}`);
        if (lightingEnglish && lightingName !== "Mặc định") englishDetails.push(`Lighting scenario: ${lightingEnglish}`);
        if (weatherEnglish && weatherName !== "Mặc định") englishDetails.push(`Atmosphere: ${weatherEnglish}`);

        if (englishDetails.length > 0) {
          designPrompt += `\n\nTechnical rendering attributes for reference:\n- ${englishDetails.join("\n- ")}`;
        }
      } else {
        const segments: string[] = [];

        // Determine the photographer role based on school
        let photographerRole = "";
        if (school === "interior") {
          photographerRole = "interior photographer capturing a room just renovated by a professional designer";
        } else if (school === "architecture") {
          photographerRole = "professional architectural photographer capturing an exquisite exterior facade just finished by an elite architect";
        } else if (school === "landscape") {
          photographerRole = "professional landscape photographer capturing a stunning designer garden and outdoor living space";
        } else if (school === "planning") {
          photographerRole = "professional architectural and urban planner capturing a comprehensive 3D masterplan aerial visualization";
        } else {
          photographerRole = "professional architectural photographer";
        }

        // L1: Giữ kết cấu (FIXED)
        if (school === "interior") {
          segments.push(`As an ${photographerRole}, transform this interior photo into a fully renovated, redecorated version.
CRITICAL: keep the exact same room architecture from the FIRST image — identical wall positions, window and door locations, ceiling, floor plan, room proportions, and the same camera viewpoint and perspective. Do not add, remove, or move any structural elements. Only change interior finishes, furniture, materials, decor, textiles, and lighting.`);
        } else if (school === "architecture") {
          segments.push(`As a ${photographerRole}, transform this exterior building photo into a fully renovated, modern architectural version.
CRITICAL: keep the exact same structural volume and building geometry from the FIRST image — identical walls, floor counts, columns, balconies, window and door configurations, roof lines, fences, and the same camera angle, viewport, and focal distance. Do not add, remove, or move any architectural structures. Only update surface materials, paint, windows, railings, facade panels, cladding, lighting, and immediate surroundings.`);
        } else if (school === "landscape") {
          segments.push(`As a ${photographerRole}, transform this outdoor scene into a professionally designed landscape garden.
CRITICAL: keep the exact same yard layout, boundary lines, house facade positions, pool shape, major stairs, and camera viewpoint from the FIRST image. Do not change the position of main architectural structures. Only renovate ground materials, grass, pavers, pathways, flower beds, fences, garden furniture, water features, and plants.`);
        } else if (school === "planning") {
          segments.push(`As a ${photographerRole}, transform this urban layout photo into a fully realized 3D planning masterplan visualization.
CRITICAL: keep the exact same road layout, blocks, plot divisions, shoreline or water bodies, and bird's-eye camera perspective from the FIRST image. Do not change the overall spatial structure or macro geometry. Only replace block volumes with beautiful architectural towers, buildings, parks, green spaces, detailed roadways, water canals, and high-end urban finishes.`);
        } else {
          segments.push(`As a ${photographerRole}, transform this photo into a fully renovated, highly detailed modern version. Keep the exact layout, geometry, and perspective of the original image 100% identical. Only change materials, lighting, surface finishes, and styling.`);
        }

        // L2: Loại phòng/Không gian (DYNAMIC)
        if (roomTypeId && roomTypeId !== "default") {
          let roomStr = "";
          if (school === "interior" && interiorRoomMap[roomTypeId]) {
            roomStr = `The space is a ${interiorRoomMap[roomTypeId]}.`;
          } else if (school === "architecture" && architectureRoomMap[roomTypeId]) {
            roomStr = `The building is a ${architectureRoomMap[roomTypeId]}.`;
          } else if (school === "landscape" && landscapeRoomMap[roomTypeId]) {
            roomStr = `The garden space is a ${landscapeRoomMap[roomTypeId]}.`;
          } else if (school === "planning" && planningRoomMap[roomTypeId]) {
            roomStr = `The masterplan area is a ${planningRoomMap[roomTypeId]}.`;
          }
          if (roomStr) segments.push(roomStr);
        }

        // L3: Phong cách (DYNAMIC)
        if (styleId && styleId !== "default") {
          let styleStr = "";
          if (school === "interior" && interiorStyleMap[styleId]) {
            styleStr = interiorStyleMap[styleId];
          } else if (school === "architecture" && architectureStyleMap[styleId]) {
            styleStr = architectureStyleMap[styleId];
          } else if (school === "landscape" && landscapeStyleMap[styleId]) {
            styleStr = landscapeStyleMap[styleId];
          } else if (school === "planning" && planningStyleMap[styleId]) {
            styleStr = planningStyleMap[styleId];
          }
          if (styleStr) {
            segments.push(styleStr);
          }
        } else if (styleId === "default") {
          if (school === "interior") {
            segments.push("Beautiful high-end architectural interior style with photorealistic organic materials and exquisite colors.");
          } else if (school === "architecture") {
            segments.push("Beautiful high-end architectural exterior style with premium materials, elegant glass windows, and beautiful finishes.");
          } else if (school === "landscape") {
            segments.push("Beautiful high-end professional landscape design with manicured lawn, elegant stone pavers, and lush plants.");
          } else if (school === "planning") {
            segments.push("Beautiful high-end 3D urban masterplan with smart towers, beautiful roads, green spaces, and water canals.");
          }
        }

        // L4: Ánh sáng (conditional)
        if (lightingId && lightingId !== "default" && lightingMap[lightingId]) {
          segments.push(`Lighting: ${lightingMap[lightingId]}.`);
        } else if (lightingEnglish && lightingName && lightingName !== "Mặc định") {
          segments.push(`Lighting scenario: ${lightingEnglish}.`);
        }

        // L5: Tổng màu (conditional)
        if (colorId && colorId !== "default" && colorMap[colorId]) {
          segments.push(`Color palette: ${colorMap[colorId]}.`);
        } else if (colorEnglish && colorName && colorName !== "Mặc định") {
          segments.push(`Color scheme: ${colorEnglish}.`);
        }

        // Perspective / View
        if (viewEnglish && viewName && viewName !== "Mặc định") {
          segments.push(`Perspective/View: ${viewEnglish}.`);
        }

        // Surroundings / Context
        if (contextEnglish && contextName && contextName !== "Mặc định") {
          segments.push(`Surroundings/Context: ${contextEnglish}.`);
        }

        // Weather
        if (weatherEnglish && weatherName && weatherName !== "Mặc định") {
          segments.push(`Atmosphere/Weather: ${weatherEnglish}.`);
        }

        // Density planning layout (for planning)
        if (school === "planning" && densityEnglish && densityName !== "Mặc định") {
          segments.push(`Density planning layout: ${densityEnglish}.`);
        }

        // L6: Xử lý ảnh tham chiếu (conditional)
        if (refParts.length > 0) {
          if (school === "interior") {
            segments.push(`Additional reference image(s) are provided AFTER the main photo. Use them ONLY as inspiration for style, materials, furniture, and color palette. Do NOT copy their room layout, geometry, or camera angle. The room architecture and viewpoint must stay exactly as in the first (main) photo.`);
          } else if (school === "architecture") {
            segments.push(`Additional reference image(s) are provided AFTER the main photo. Use them ONLY as inspiration for facade materials, cladding, textures, colors, and architectural detailing. Do NOT copy their building layout, height, or geometry. The building structure and camera viewpoint must stay exactly as in the first (main) photo.`);
          } else if (school === "landscape") {
            segments.push(`Additional reference image(s) are provided AFTER the main photo. Use them ONLY as inspiration for paving materials, plant selections, garden furniture, and color theme. Do NOT copy their layout or structures. The yard layout and viewpoint must stay exactly as in the first (main) photo.`);
          } else if (school === "planning") {
            segments.push(`Additional reference image(s) are provided AFTER the main photo. Use them ONLY as inspiration for building designs, coloring, landscape typologies, and material rendering. Do NOT copy their block layout or geography. The site structure and bird's-eye viewpoint must stay exactly as in the first (main) photo.`);
          }
        }

        // L7: Chân thực như ảnh chụp (FIXED)
        if (school === "interior") {
          segments.push(`The result must look like a real professional interior photograph, NOT a 3D render or CGI. Captured on a full-frame DSLR with a 24mm lens at f/8. Physically accurate materials, realistic soft shadows and reflections, natural depth of field, and subtle real-world imperfections. Editorial real-estate photography, magazine quality, neutral white balance, high dynamic range.`);
        } else if (school === "architecture") {
          segments.push(`The result must look like an ultra-realistic professional architectural photograph, NOT a 3D render, CGI, or illustration. Captured on a professional tilt-shift lens (24mm) at f/8 for straight parallel lines. Perfect perspective correction, physically accurate PBR materials, realistic shadows and reflections, crisp daylight, and high dynamic range. Editorial quality, featured in architectural magazines.`);
        } else if (school === "landscape") {
          segments.push(`The result must look like an ultra-realistic professional garden photograph, NOT a 3D simulation or low-quality render. Captured on a professional landscape camera at f/11 for deep focus. Vivid natural colors, physically realistic bark, leaf, and rock textures, natural light filtering through leaves, and high-fidelity atmosphere. Featured in prestigious landscape architecture journals.`);
        } else if (school === "planning") {
          segments.push(`The result must look like a professional drone aerial photograph of a real constructed masterplan, or a high-end physical architectural model showcase. Clear daylight, physically correct surface textures for roofs, roads, and foliage, beautiful water reflections, realistic shadows cast by towers, and professional tilt-shift depth of field. Featured in elite urban planning portfolios.`);
        }

        // L8: Dàn dựng đẹp phổ quát (FIXED)
        if (school === "interior") {
          segments.push(`Professionally staged by an interior designer: tidy, uncluttered, balanced composition, warm and inviting, broadly appealing and timeless rather than experimental. High-end but comfortable and livable.`);
        } else if (school === "architecture") {
          segments.push(`Professionally staged landscape: manicured lawn, clean pathways, elegant modern planters, beautiful contextual sky, tidy and clean, luxurious and highly prestigious presentation.`);
        } else if (school === "landscape") {
          segments.push(`Impeccably manicured: fresh trimmed grass, weed-free garden beds, healthy vibrant plants, tidy outdoor seating, welcoming and beautifully balanced.`);
        } else if (school === "planning") {
          segments.push(`Impeccably organized: clean structured streets, uniform building alignments, clear green park corridors, beautiful deep blue water features, looking completely polished, realistic, and highly professional.`);
        }

        // L9: Tránh (FIXED)
        if (school === "interior") {
          segments.push(`Avoid: a CGI or video-game look, plastic or artificial textures, oversaturated colors, fisheye distortion, warped or bent lines, cluttered or messy scenes, unrealistic lighting, and any text or watermark.`);
        } else if (school === "architecture") {
          segments.push(`Avoid: a plastic or cartoonish look, 3D software viewport render feel, oversaturated unrealistic colors, distorted vertical lines, cluttered scenes, fake lighting bloom, and any text, logo, or watermark.`);
        } else if (school === "landscape") {
          segments.push(`Avoid: low-resolution flat textures, plastic-looking artificial turf, cloned plant models, overly saturated neon greens, cartoon water effects, and any overlay text or logos.`);
        } else if (school === "planning") {
          segments.push(`Avoid: low-poly flat game meshes, solid untextured colored polygons, draft watercolor drawings (unless specified), toy model plastic appearance, blurry maps, and any text overlay or watermarks.`);
        }

        // L10: Prompt đặc biệt (conditional)
        if (notes && notes.trim().length > 0) {
          segments.push(`Additional request from the user: ${notes.trim()}`);
        }

        designPrompt = segments.join("\n\n");
      }
    } else {
      // Compatibility mode for other features (floorplan render, edit, upscale etc.)
      const rtPart = roomType ? `${roomType}` : "Mặc định";
      const stPart = styleName ? `${styleName}` : "Mặc định";
      const vwPart = viewName ? `${viewName}` : "Mặc định";
      const ctPart = contextName ? `${contextName}` : "Mặc định";
      const ltPart = lightingName ? `${lightingName}` : "Mặc định";
      const wtPart = weatherName ? `${weatherName}` : "Mặc định";
      const clPart = colorName ? `${colorName}` : "Mặc định";

      let englishDetails = [];
      if (stylePrompt && styleName !== "Mặc định") englishDetails.push(`Aesthetic design style: ${stylePrompt}`);
      if (viewEnglish && viewName !== "Mặc định") englishDetails.push(`Perspective: ${viewEnglish}`);
      if (contextEnglish && contextName !== "Mặc định") englishDetails.push(`Surroundings: ${contextEnglish}`);
      if (lightingEnglish && lightingName !== "Mặc định") englishDetails.push(`Lighting scenario: ${lightingEnglish}`);
      if (weatherEnglish && weatherName !== "Mặc định") englishDetails.push(`Atmosphere: ${weatherEnglish}`);
      if (colorEnglish && colorName !== "Mặc định") englishDetails.push(`Color scheme: ${colorEnglish}`);
      
      const englishContext = englishDetails.length > 0 
        ? `\n\nTechnical rendering attributes for reference:\n- ${englishDetails.join("\n- ")}`
        : "";

      let referencePromptSuffix = "";
      if (refParts.length > 0) {
        referencePromptSuffix = "\n\nSử dụng các hình ảnh tham chiếu đính kèm làm tài liệu tham khảo cho phong cách kiến trúc, cách bài trí, vật liệu, tông màu và ánh sáng. Hãy hòa trộn thiết kế từ các ảnh tham chiếu này vào công trình mà vẫn giữ nguyên bố cục cấu trúc hình khối của ảnh chính.";
      }

      designPrompt = `You are a professional architectural renderer. Biến thành ảnh chụp thực tế nhà ở, ${rtPart}, ${stPart}, ${vwPart}, ${ctPart}, ${ltPart}, ${wtPart}${clPart !== "Mặc định" ? `, Tông màu: ${clPart}` : ""}${notes ? ` + ${notes}` : ""}${referencePromptSuffix}

Lưu ý: Giữ nguyên tuyệt đối bố cục chính xác của mô hình kiến trúc đã tải lên, bao gồm toàn bộ hình khối công trình, tỷ lệ kiến trúc, số tầng, mái, ban công, cửa, mặt đứng, mặt tiền, vật liệu, cảnh quan, sân vườn, hàng rào, cổng, lối đi, địa hình, vị trí các hạng mục, khoảng lùi, góc camera, tiêu cự và toàn bộ các yếu tố trong cảnh.

Không được thay đổi, thêm mới, xóa bỏ, phóng to, thu nhỏ hoặc di chuyển bất kỳ chi tiết nào. Không được thay đổi hình dáng công trình, kết cấu kiến trúc, tỷ lệ giữa các khối, bố cục mặt tiền, vị trí cửa, cửa sổ, ban công, mái, cột, tường, lan can, vật liệu hoàn thiện, cây xanh, sân vườn, hàng rào hoặc bất kỳ thành phần nào của thiết kế.

Chỉ được nâng cấp chất lượng hình ảnh để đạt độ chân thực như ảnh chụp công trình thực tế, thông qua việc cải thiện ánh sáng, vật liệu PBR, phản xạ kính, kết cấu bề mặt, chi tiết môi trường, đặc tính quang học của máy ảnh và hiệu ứng nhiếp ảnh kiến trúc, đồng thời giữ nguyên 100% thiết kế gốc.

Không được tự ý thiết kế lại, sáng tạo thêm hoặc chỉnh sửa kiến trúc dưới bất kỳ hình thức nào. Mọi thay đổi chỉ được phép nhằm tăng tính chân thực của hình ảnh, tuyệt đối không làm thay đổi ý đồ thiết kế ban đầu.${englishContext}`;
    }

    // "Ảnh tiêu chuẩn"/"Ảnh 1K" dùng Nano Banana (Flash) — nhanh, rẻ.
    // "Ảnh 3K"/"Ảnh 4K" dùng Nano Banana Pro (Pro Image) — chất lượng cao hơn, chi tiết hơn.
    const imageModel = (quality === "3k" || quality === "4k")
      ? "gemini-3-pro-image-preview"
      : "gemini-3.1-flash-lite-image";

    // Gemini's imageConfig.imageSize defaults to "1K" if not specified — so every tier was
    // silently generated at the same base resolution before. Only "1K" | "2K" | "4K" are
    // valid, so "3K" maps to the closest supported tier, "2K".
    const imageSize = quality === "4k" ? "4K" : quality === "3k" ? "2K" : "1K";

    console.log(`Sending image-to-image request to Gemini. Model: ${imageModel}, Style: ${styleId}, Room: ${roomType}, AspectRatio: ${aspectRatio}`);

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          ...refParts,
          {
            text: designPrompt,
          },
        ],
      },
      config: {
        // "Độ sáng tạo" slider (0.1 - 1.0) maps to the model's temperature (0 - 2.0].
        // Higher values let the model deviate further from the source image structure,
        // which matters for tasks like changing camera viewpoint.
        temperature: typeof creativity === "number" ? Math.min(2, Math.max(0.1, creativity * 2)) : undefined,
        imageConfig: {
          aspectRatio: aspectRatio || "1:1",
          imageSize,
        },
      },
    });

    // Extract the image from candidates
    let renovatedImageBase64 = null;
    let descriptionText = "";

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          renovatedImageBase64 = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        } else if (part.text) {
          descriptionText += part.text + " ";
        }
      }
    }

    if (!renovatedImageBase64) {
      console.error("No image returned in Gemini response. Full response:", JSON.stringify(response));
      throw new Error("Không nhận được hình ảnh kết quả từ AI. Hãy thử lại với ảnh gốc rõ ràng hơn.");
    }

    let beforeUrl: string | null = null;
    let afterUrl: string | null = null;

    if (supabaseAdmin && deductedUserId) {
      // Lưu ảnh gốc + ảnh kết quả lên Storage (private). Path gắn với generationId để về sau
      // Admin Dashboard tra ngược được. Lỗi upload trả null → cột URL để trống, không chặn insert.
      const [beforePath, afterPath] = await Promise.all([
        uploadRenderImage(`${deductedUserId}/${generationId}/before.png`, image),
        uploadRenderImage(`${deductedUserId}/${generationId}/after.png`, renovatedImageBase64),
      ]);

      await supabaseAdmin.from("generations").insert({
        id: generationId,
        user_id: deductedUserId,
        room_type: generationRoomType,
        style: generationStyle,
        resolution: generationResolution,
        credits_spent: deductedAmount,
        estimated_cost_usd: estimatedCostUsd,
        before_image_url: beforePath,
        after_image_url: afterPath,
        status: "success",
        processing_time_ms: Date.now() - generationStartedAt,
      });

      // Tạo signed URL (hạn 1 năm) để client hiển thị/lưu bằng URL thay vì base64. Nhờ đó response
      // nhẹ (không dính giới hạn ~4.5MB của serverless khi render 3K/4K) và không nhồi base64 nặng
      // vào localStorage của trình duyệt.
      const pathsToSign = [beforePath, afterPath].filter((p): p is string => !!p);
      if (pathsToSign.length > 0) {
        const { data: signed } = await supabaseAdmin.storage
          .from("renders")
          .createSignedUrls(pathsToSign, 60 * 60 * 24 * 365);
        const urlByPath: Record<string, string> = {};
        for (const item of signed ?? []) {
          if (item.signedUrl && item.path) urlByPath[item.path] = item.signedUrl;
        }
        if (beforePath) beforeUrl = urlByPath[beforePath] ?? null;
        if (afterPath) afterUrl = urlByPath[afterPath] ?? null;
      }
    }

    return res.json({
      success: true,
      beforeUrl,
      afterUrl,
      // Chỉ trả base64 khi CHƯA có URL (Storage lỗi / chạy local không cấu hình Storage) — làm fallback.
      renovatedImage: afterUrl ? undefined : renovatedImageBase64,
      description: descriptionText.trim(),
      prompt: designPrompt,
      creditsRemaining: newBalance,
    });

  } catch (error: any) {
    console.error("Error during image generation:", error);

    // Hoàn credit + ghi log lỗi nếu đã trừ credit trước khi phát sinh lỗi (VD Gemini API lỗi).
    if (supabaseAdmin && deductedUserId && deductedAmount > 0) {
      await supabaseAdmin.rpc("refund_credits", { p_user_id: deductedUserId, p_amount: deductedAmount });
      await supabaseAdmin.from("generations").insert({
        id: generationId,
        user_id: deductedUserId,
        room_type: generationRoomType,
        style: generationStyle,
        resolution: generationResolution,
        credits_spent: 0,
        estimated_cost_usd: 0, // render lỗi → không tính chi phí (đã hoàn credit, không có ảnh ra)
        status: "error",
        error_message: error.message || "Lỗi không xác định",
        processing_time_ms: Date.now() - generationStartedAt,
      });
    }

    // Phân loại lỗi thành mã ổn định để client hiển thị thông báo thân thiện, song ngữ — thay vì
    // lộ chuỗi JSON thô của Gemini (vd 503 "high demand").
    const raw = String(error?.message ?? error ?? "");
    let errorCode = "generic";
    if (/\b503\b|UNAVAILABLE|high demand|overloaded/i.test(raw)) errorCode = "model_busy";
    else if (/\b429\b|RESOURCE_EXHAUSTED|quota|rate.?limit/i.test(raw)) errorCode = "quota";
    else if (/safety|blocked|prohibited/i.test(raw)) errorCode = "blocked";
    else if (/Không nhận được hình ảnh/i.test(raw)) errorCode = "no_image";

    return res.status(errorCode === "model_busy" ? 503 : 500).json({
      errorCode,
      error: error.message || "Đã xảy ra lỗi không xác định trong quá trình sinh ảnh.",
    });
  }
};

// Đăng ký route cho bản chạy Express local (npm run dev qua dev-server.ts). Trên Vercel,
// các file api/*.ts import trực tiếp các handler này (không đi qua Express), nên phần này bỏ qua.
app.get("/api/health", handleHealth);
app.post("/api/checkout/create-order", handleCreateOrder);
app.post("/api/generate", handleGenerate);

export { app };
