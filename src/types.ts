export interface DesignStyle {
  id: string;
  name: string;
  englishName: string;
  description: string;
  promptSuffix: string;
  thumbnail: string;
}

export interface RoomType {
  id: string;
  name: string;
  englishName: string;
  iconName: string;
  description: string;
}

export interface ResolutionOption {
  id: string;
  name: string;
  dimensions: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  cost: number;
}

export interface AspectRatioOption {
  id: string;
  name: string;
  ratio: string;
  description: string;
  nameEn?: string;
  descriptionEn?: string;
}

export interface QualityOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  nameEn?: string;
  descriptionEn?: string;
}

export interface GeneratedProject {
  id: string;
  beforeImage: string; // Base64 or Object URL
  afterImage: string;  // Base64
  styleId: string;
  roomTypeId: string;
  prompt: string;
  notes: string;
  createdAt: string;
  resolutionId: string;
  aspectRatio?: string;
}

export interface TemplatePost {
  id: string;
  title: string;
  category: string;
  images: string[]; // reference/example images shown in the carousel
  prompt: string; // full detailed prompt, pushed into "Mô tả chung" when the user hits "Sử dụng Prompt này"
  titleEn?: string;
  categoryEn?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number; // giá hiện tại (VND)
  originalPrice?: number; // giá gốc trước giảm, hiển thị gạch ngang
  discountLabel?: string; // VD "-14%"
  credits: number;
  durationLabel: string; // VD "Hạn sử dụng: 3 Tháng"
  billingNote: string; // VD "Gia hạn tự động"
  features: string[];
  highlighted?: boolean; // gói "Phổ biến nhất"
  badge?: string;
  // Bản dịch tiếng Anh cho các trường hiển thị (giá/credits/id giữ nguyên). Thiếu thì fallback về VI.
  en?: {
    description?: string;
    durationLabel?: string;
    billingNote?: string;
    features?: string[];
    badge?: string;
  };
}

export interface CreditHistory {
  id: string;
  amount: number;
  type: "earn" | "spend";
  description: string;
  timestamp: string;
}
