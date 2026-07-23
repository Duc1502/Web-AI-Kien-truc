import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import HouseOrbitPreview from "./HouseOrbitPreview";
import ImageAnnotator, { EditMarker, renderAnnotatedImage } from "./ImageAnnotator";
import TemplatePostCard from "./TemplatePostCard";
import { DESIGN_MODES, DESIGN_STYLES, ROOM_TYPES, RESOLUTION_OPTIONS, LOADING_MESSAGES, LOADING_MESSAGES_EN, SCHOOL_TAXONOMY, ASPECT_RATIO_OPTIONS, QUALITY_OPTIONS, VIEW_OPTIONS, CONTEXT_OPTIONS, LIGHTING_OPTIONS, WEATHER_OPTIONS, COLOR_OPTIONS, PLANNING_VIEW_OPTIONS, PLANNING_DENSITY_OPTIONS, PLANNING_CONTEXT_OPTIONS, PLANNING_LIGHTING_OPTIONS, PLANNING_WEATHER_OPTIONS, TEMPLATE_POSTS } from "../config";
import { DesignStyle, RoomType, ResolutionOption, GeneratedProject, AspectRatioOption, QualityOption } from "../types";
import {
  Sparkles,
  Coins,
  ArrowRight,
  Check,
  Compass,
  Info,
  Sofa,
  Bed,
  Utensils,
  ShowerHead,
  Briefcase,
  Flower2,
  Zap,
  X,
  Sliders,
  RefreshCw,
  Eye,
  Download,
  ShieldCheck,
  PenTool,
  Home,
  Trees,
  Trash2,
  Map,
  Layers,
  Grid,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Camera,
  FileText,
  Wand2,
  Maximize2,
  FileImage,
  Layers3,
  Stamp,
  Brush,
  Clock,
  Hammer,
  Star,
  ZoomIn,
  BookOpen
} from "lucide-react";
import ImageUpload from "./ImageUpload";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { useLanguage } from "../i18n/LanguageContext";
import { localizedName, localizedDesc } from "../i18n/content";
import { downloadImage } from "../lib/download";

const getAspectClass = (ratio?: string) => {
  if (ratio === "16:9") return "aspect-[16/9]";
  if (ratio === "9:16") return "aspect-[9/16]";
  if (ratio === "3:4") return "aspect-[3/4]";
  if (ratio === "4:3") return "aspect-[4/3]";
  return "aspect-square"; // Default 1:1
};

const getAspectWrapperClass = (ratio?: string) => {
  if (ratio === "9:16") return "max-w-[340px] mx-auto w-full";
  if (ratio === "3:4") return "max-w-[420px] mx-auto w-full";
  return "w-full";
};

interface CustomDropdownProps {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (val: string) => void;
}

function CustomDropdown({ label, value, options, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.id === value) || options[0];

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-slate-400">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#080B11]/80 border ${
            isOpen ? "border-violet-500 ring-1 ring-violet-500/20" : "border-slate-800"
          } rounded-xl pl-4 pr-10 py-3 text-xs font-bold text-slate-200 focus:outline-none transition text-left flex justify-between items-center cursor-pointer`}
        >
          <span>{selectedOption?.name}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-50 mt-1.5 bg-[#111520] border border-slate-800/80 rounded-xl p-1.5 shadow-2xl max-h-60 overflow-y-auto">
            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition text-left ${
                      isSelected
                        ? "bg-violet-500/10 text-violet-400"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <span>{opt.name}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 12 preset camera angles commonly used in professional architecture/interior photography.
// Selecting one drives the Góc 2.0 widget directly (rotation/tilt/zoom), so the user sees
// exactly which shot they're picking instead of guessing from a text label alone.
interface CameraAnglePreset {
  id: string;
  label: string;
  labelEn: string;
  rotation: number;
  tilt: number;
  zoom: number;
}

const CAMERA_ANGLE_PRESETS: CameraAnglePreset[] = [
  { id: "front_eye", label: "Chính diện – tầm mắt", labelEn: "Front – eye level", rotation: 0, tilt: 0, zoom: 0 },
  { id: "front_left_34", label: "Góc 3/4 trái phía trước", labelEn: "Front 3/4 left", rotation: 315, tilt: 0, zoom: 0 },
  { id: "front_right_34", label: "Góc 3/4 phải phía trước", labelEn: "Front 3/4 right", rotation: 45, tilt: 0, zoom: 0 },
  { id: "left_side", label: "Cạnh bên trái", labelEn: "Left side", rotation: 270, tilt: 0, zoom: 0 },
  { id: "right_side", label: "Cạnh bên phải", labelEn: "Right side", rotation: 90, tilt: 0, zoom: 0 },
  { id: "rear", label: "Phía sau công trình", labelEn: "Rear view", rotation: 180, tilt: 0, zoom: 0 },
  { id: "low_hero", label: "Góc thấp hùng vĩ (hero shot)", labelEn: "Low hero shot", rotation: 0, tilt: 35, zoom: 0 },
  { id: "low_34", label: "Góc thấp 3/4", labelEn: "Low 3/4", rotation: 330, tilt: 30, zoom: 0 },
  { id: "high_overview", label: "Góc cao bao quát", labelEn: "High overview", rotation: 315, tilt: -35, zoom: 0 },
  { id: "birdview", label: "Góc chim bay (drone)", labelEn: "Bird's-eye (drone)", rotation: 300, tilt: -65, zoom: 0 },
  { id: "top_down", label: "Flycam thẳng đứng", labelEn: "Top-down flycam", rotation: 0, tilt: -85, zoom: 0 },
  { id: "closeup_facade", label: "Cận cảnh mặt tiền", labelEn: "Facade close-up", rotation: 0, tilt: 0, zoom: 75 },
];

interface CreatePageProps {
  credits: number;
  authUserId: string | null;
  onRequireLogin: () => void;
  onNavigateToPricing: () => void;
  onAddProject: (project: GeneratedProject) => void;
  onCreditsUpdated: () => void;
}

interface ActiveTool {
  id: string;
  tab: string;
  name: string;
  description: string;
  iconName: string;
  defaultPrompt?: string;
}

export default function CreatePage({
  credits,
  authUserId,
  onRequireLogin,
  onNavigateToPricing,
  onAddProject,
  onCreditsUpdated,
}: CreatePageProps) {
  const { t, lang } = useLanguage();

  // Dịch tên hiển thị của option trong dropdown: dùng englishName (phong cách/phòng) hoặc nameEn
  // (attribute options — bổ sung ở config) khi ở EN; thiếu thì giữ tên tiếng Việt.
  const locOpts = (opts: { id: string; name: string; englishName?: string; nameEn?: string }[]) =>
    opts.map((o) => ({ id: o.id, name: lang === "en" ? o.nameEn || o.englishName || o.name : o.name }));

  // Navigation Tabs at the very top (matching opzenai.com/vi/feature)
  // 1: Render ảnh, 2: render mặt bằng, 3: render cải tạo AI, 4: đồng bộ view, 5: chỉnh sửa ảnh, 6: tính năng mở rộng
  const [activeTab, setActiveTab] = useState<string>("render_photo");
  
  // Track active workstation/tool within each tab
  // If null, show the catalogs (grids). If selected, show the specific workspace.
  const [activeTool, setActiveTool] = useState<ActiveTool | null>(null);

  // General States for the workstation
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>("default");
  const [selectedStyle, setSelectedStyle] = useState<string>("default");
  const [selectedResolution, setSelectedResolution] = useState<string>("standard");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>("1:1");
  const [renderPhotoCount, setRenderPhotoCount] = useState<number>(1); // Render Ảnh: số ảnh cần tạo (1-4)
  const [selectedQuality, setSelectedQuality] = useState<string>("standard");
  const [selectedView, setSelectedView] = useState<string>("default");
  const [selectedContext, setSelectedContext] = useState<string>("default");
  const [selectedLighting, setSelectedLighting] = useState<string>("default");
  const [selectedWeather, setSelectedWeather] = useState<string>("default");
  const [selectedColor, setSelectedColor] = useState<string>("default");
  const [selectedDensity, setSelectedDensity] = useState<string>("default");
  // Render Mặt Bằng > Kiến trúc: "overview" = giữ góc nhìn từ trên xuống như bản vẽ gốc,
  // "view3d" = dựng thành ảnh chụp thực tế góc nhìn kiến trúc 3D (không phải từ trên xuống).
  const [floorplanViewMode, setFloorplanViewMode] = useState<string>("overview");
  // Poster BĐS: "infographic" = poster tiện ích dạng cột đứng, "luxury" = poster nền gradient
  // tối kèm icon tiện ích kết nối bằng nét đứt.
  const [posterTemplate, setPosterTemplate] = useState<string>("infographic");
  // Tạo Bản Vẽ: loại bản vẽ kỹ thuật 2D cần xuất ra từ phối cảnh 3D.
  const [blueprintType, setBlueprintType] = useState<string>("floor_plan");
  // Tạo Diagram: loại sơ đồ/diagram kiến trúc cần xuất ra.
  const [diagramType, setDiagramType] = useState<string>("exploded");
  // Tạo Moodboard: "to_space" = dựng không gian thực tế từ moodboard, "to_moodboard" = trích
  // xuất vật liệu/màu sắc từ ảnh không gian thành bảng moodboard.
  const [moodboardMode, setMoodboardMode] = useState<string>("to_space");
  const [creativity, setCreativity] = useState<number>(0.6); // AI Strength: 0.1 to 1.0
  const [notes, setNotes] = useState<string>("");
  const [refImages, setRefImages] = useState<string[]>([]);

  // Sync View Specific States (From photo 4)
  const [syncViewType, setSyncViewType] = useState<string>("exterior"); // exterior | interior
  const [syncAngle, setSyncAngle] = useState<string>("custom");
  const [syncEffect, setSyncEffect] = useState<string>("none");
  const [syncAtmosphere, setSyncAtmosphere] = useState<string>("default");
  const [syncModel, setSyncModel] = useState<string>("gemini_pro");
  const [syncCount, setSyncCount] = useState<number>(1);

  // Custom Camera Adjustment (Góc 2.0)
  const [cameraRotation, setCameraRotation] = useState<number>(315); // Xoay (Yaw): 0 - 360
  const [cameraTilt, setCameraTilt] = useState<number>(-30); // Nghiêng (Pitch): -90 - 90
  const [cameraZoom, setCameraZoom] = useState<number>(0); // Phóng (Zoom): 0 - 100
  const [generate12Angles, setGenerate12Angles] = useState<boolean>(false); // Tạo từ 12 góc chụp đẹp nhất

  // Edit Image Specific States (From photo 5)
  const [editPrompt, setEditPrompt] = useState<string>("");
  const [editMarkers, setEditMarkers] = useState<EditMarker[]>([]);
  const [editModel, setEditModel] = useState<string>("gemini_pro");
  const [editCount, setEditCount] = useState<number>(1);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultProject, setResultProject] = useState<GeneratedProject | null>(null);
  // Multiple renders from one submission (Sync View / Edit Photo "Số lượng ảnh render"),
  // shown as a picker grid; resultProject holds whichever one is currently selected/displayed.
  const [batchResults, setBatchResults] = useState<GeneratedProject[]>([]);

  // Render completed view control states (for action buttons)
  const [isSyncView, setIsSyncView] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  // Local generation history for comparison
  const [sessionHistory, setSessionHistory] = useState<GeneratedProject[]>([]);
  const [showHistorySection, setShowHistorySection] = useState(true);

  // Set when "Sử dụng Prompt này" (Thư Viện Mẫu) pre-fills editPrompt right before switching to
  // edit_photo — the activeTool-change effect below normally blanks editPrompt on every tool
  // switch, which would immediately wipe out the prompt we just injected.
  const skipNextEditPromptResetRef = useRef(false);

  // Camera Dragging Logic (Góc 2.0)
  const sphereRef = useRef<SVGSVGElement | null>(null);
  const [isCameraDragging, setIsCameraDragging] = useState(false);
  const cameraDragStart = useRef({ x: 0, y: 0, rot: 315, tilt: -30 });

  const handleCameraMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    setIsCameraDragging(true);
    cameraDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rot: cameraRotation,
      tilt: cameraTilt,
    };
  };

  const handleCameraTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      setIsCameraDragging(true);
      cameraDragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        rot: cameraRotation,
        tilt: cameraTilt,
      };
    }
  };

  useEffect(() => {
    const handleCameraMouseMove = (e: MouseEvent) => {
      if (!isCameraDragging) return;
      const dx = e.clientX - cameraDragStart.current.x;
      const dy = e.clientY - cameraDragStart.current.y;
      
      let newRot = (cameraDragStart.current.rot + Math.round(dx * 0.5)) % 360;
      if (newRot < 0) newRot += 360;
      
      const newTilt = Math.max(-90, Math.min(90, cameraDragStart.current.tilt - Math.round(dy * 0.5)));
      
      setCameraRotation(newRot);
      setCameraTilt(newTilt);
      setSyncAngle("custom");
    };

    const handleCameraMouseUp = () => {
      setIsCameraDragging(false);
    };

    if (isCameraDragging) {
      window.addEventListener("mousemove", handleCameraMouseMove);
      window.addEventListener("mouseup", handleCameraMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleCameraMouseMove);
      window.removeEventListener("mouseup", handleCameraMouseUp);
    };
  }, [isCameraDragging]);

  useEffect(() => {
    const handleCameraTouchMove = (e: TouchEvent) => {
      if (!isCameraDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - cameraDragStart.current.x;
      const dy = e.touches[0].clientY - cameraDragStart.current.y;
      
      let newRot = (cameraDragStart.current.rot + Math.round(dx * 0.5)) % 360;
      if (newRot < 0) newRot += 360;
      
      const newTilt = Math.max(-90, Math.min(90, cameraDragStart.current.tilt - Math.round(dy * 0.5)));
      
      setCameraRotation(newRot);
      setCameraTilt(newTilt);
      setSyncAngle("custom");
    };

    const handleCameraTouchEnd = () => {
      setIsCameraDragging(false);
    };

    if (isCameraDragging) {
      window.addEventListener("touchmove", handleCameraTouchMove, { passive: false });
      window.addEventListener("touchend", handleCameraTouchEnd);
    }

    return () => {
      window.removeEventListener("touchmove", handleCameraTouchMove);
      window.removeEventListener("touchend", handleCameraTouchEnd);
    };
  }, [isCameraDragging]);

  const adjustCameraRotation = (delta: number) => {
    setCameraRotation((prev) => {
      let next = (prev + delta) % 360;
      if (next < 0) next += 360;
      return next;
    });
    setSyncAngle("custom");
  };

  const adjustCameraTilt = (delta: number) => {
    setCameraTilt((prev) => Math.max(-90, Math.min(90, prev + delta)));
    setSyncAngle("custom");
  };

  // Apply one of the 12 preset architecture-photography angles directly to the
  // Góc 2.0 widget, so picking from the dropdown visually updates the sphere + 3D preview.
  const handleSelectCameraPreset = (presetId: string) => {
    setSyncAngle(presetId);
    const preset = CAMERA_ANGLE_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCameraRotation(preset.rotation);
      setCameraTilt(preset.tilt);
      setCameraZoom(preset.zoom);
    }
  };

  // Strip trailing English/parenthetical annotations from option labels (e.g. "Biệt thự (Villa)"
  // -> "Biệt thự") so client-built prompts read as natural Vietnamese sentences.
  const cleanLabel = (str: string): string => {
    if (!str) return "Mặc định";
    return str.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
  };

  // Convert numeric Yaw/Pitch into a short, plain-language camera angle phrase
  // (e.g. "góc nhìn chính diện, góc nhìn tầm mắt người"), since that's what image models
  // actually follow — raw degrees relative to an existing photo aren't meaningful to them.
  const describeCameraAngle = (rotation: number, tilt: number, zoom: number): string => {
    const yawBuckets: { max: number; label: string }[] = [
      { max: 22.5, label: "chính diện" },
      { max: 67.5, label: "chếch phải phía trước" },
      { max: 112.5, label: "bên phải" },
      { max: 157.5, label: "chếch phải phía sau" },
      { max: 202.5, label: "phía sau" },
      { max: 247.5, label: "chếch trái phía sau" },
      { max: 292.5, label: "bên trái" },
      { max: 337.5, label: "chếch trái phía trước" },
      { max: 360.01, label: "chính diện" },
    ];
    const yawDesc = yawBuckets.find((b) => rotation < b.max)?.label ?? yawBuckets[0].label;

    let tiltDesc: string;
    if (tilt <= -60) tiltDesc = "từ trên cao nhìn xuống (flycam)";
    else if (tilt <= -20) tiltDesc = "góc cao";
    else if (tilt < 20) tiltDesc = "tầm mắt người";
    else if (tilt < 60) tiltDesc = "góc thấp";
    else tiltDesc = "từ dưới thấp ngước lên";

    const zoomDesc = zoom >= 66 ? "cận cảnh" : zoom >= 33 ? "trung cảnh" : "toàn cảnh";

    return `góc nhìn ${yawDesc}, góc nhìn ${tiltDesc}, bố cục ${zoomDesc}`;
  };

  // Reset active tool when main tab changes, unless the tab itself has a direct workflow (like Sync View or Edit Photo)
  useEffect(() => {
    setResultProject(null);
    setErrorMessage(null);
    setRefImages([]);
    
    if (activeTab === "sync_view") {
      setActiveTool({
        id: "sync_view",
        tab: "sync_view",
        name: t("create.mod.syncName"),
        description: t("create.mod.syncDesc"),
        iconName: "RefreshCw"
      });
    } else if (activeTab === "edit_photo") {
      setActiveTool({
        id: "edit_photo",
        tab: "edit_photo",
        name: t("create.mod.editName"),
        description: t("create.mod.editDesc"),
        iconName: "PenTool"
      });
    } else {
      setActiveTool(null);
    }
  }, [activeTab]);

  // Cycle loading messages when generating
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2200);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Load session history from localStorage on load & state updates
  useEffect(() => {
    const saved = localStorage.getItem("caitaonha_projects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessionHistory(parsed.slice(0, 8)); // Show top 8 recently rendered images
      } catch (e) {
        console.error(e);
      }
    }
  }, [resultProject]);

  // Helper icons mapper
  const getIconComponent = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case "Home": return <Home className={className} />;
      case "Sofa": return <Sofa className={className} />;
      case "Trees": return <Trees className={className} />;
      case "PenTool": return <PenTool className={className} />;
      case "Map": return <Map className={className} />;
      case "Layers": return <Layers className={className} />;
      case "Grid": return <Grid className={className} />;
      case "RefreshCw": return <RefreshCw className={className} />;
      case "Camera": return <Camera className={className} />;
      case "FileText": return <FileText className={className} />;
      case "Wand2": return <Wand2 className={className} />;
      case "Maximize2": return <Maximize2 className={className} />;
      case "FileImage": return <FileImage className={className} />;
      case "Layers3": return <Layers3 className={className} />;
      case "Stamp": return <Stamp className={className} />;
      case "Brush": return <Brush className={className} />;
      case "Hammer": return <Hammer className={className} />;
      case "BookOpen": return <BookOpen className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const renderRoomIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
      case "Sofa": return <Sofa className={className} />;
      case "Bed": return <Bed className={className} />;
      case "Utensils": return <Utensils className={className} />;
      case "ShowerHead": return <ShowerHead className={className} />;
      case "Briefcase": return <Briefcase className={className} />;
      case "Flower2": return <Flower2 className={className} />;
      default: return <Compass className={className} />;
    }
  };

  // Determine active school based on active tool and active tab
  const getActiveSchool = (): "architecture" | "interior" | "planning" | "landscape" => {
    if (activeTab === "sync_view") {
      return syncViewType === "exterior" ? "architecture" : "interior";
    }
    if (!activeTool) return "interior";
    const id = activeTool.id.toLowerCase();
    if (id.includes("architecture") || id.includes("exterior")) {
      return "architecture";
    }
    if (id.includes("planning")) {
      return "planning";
    }
    if (id.includes("landscape")) {
      return "landscape";
    }
    return "interior";
  };

  const activeSchool = getActiveSchool();
  const isReRenderTool = activeTab === "extended_features" && activeTool?.id === "re_render";
  // "Sửa Bằng Ghi Chú" reuses the exact same annotate-points + reference-image workflow as
  // the dedicated "Chỉnh Sửa Ảnh" (edit_photo) tab, just launched from the extended-features grid.
  const isSketchNotesTool = activeTab === "extended_features" && activeTool?.id === "sketch_notes";
  // Upscale AI is purely "make this exact photo 4K" — no style/prompt/quality choice needed,
  // it always targets the highest tier so it always runs on the Pro model at 4K output size.
  const isUpscaleTool = activeTab === "extended_features" && activeTool?.id === "upscale_ai";
  // Tạo Layout always sends the same fixed presentation-board prompt — no detail options needed.
  const isLayoutCreatorTool = activeTab === "extended_features" && activeTool?.id === "layout_creator";
  // Poster BĐS: no detail options — just pick which fixed poster template/prompt to use.
  const isPosterTool = activeTab === "extended_features" && activeTool?.id === "real_estate_poster";
  // Tạo Bản Vẽ: no detail options — just pick which technical drawing type to output.
  const isBlueprintTool = activeTab === "extended_features" && activeTool?.id === "render_blueprint";
  // Bản vẽ kỹ thuật always sends the same fixed presentation-board prompt — no detail options needed.
  const isTechnicalDrawingTool = activeTab === "extended_features" && activeTool?.id === "technical_drawing";
  // Tạo Diagram: no detail options — just pick which diagram type/prompt to use.
  const isDiagramTool = activeTab === "extended_features" && activeTool?.id === "diagram_creator";
  // Tạo Moodboard has its own mode toggle, idea-description field, and model display —
  // no generic detail options.
  const isMoodboardTool = activeTab === "extended_features" && activeTool?.id === "moodboard_creator";
  const availableRoomTypes = [
    { id: "default", name: "Mặc định", nameEn: "Default", englishName: "original layout structure", iconName: "Home", description: "Tự động nhận diện cấu trúc gốc từ ảnh tải lên" },
    ...SCHOOL_TAXONOMY[activeSchool].roomTypes
  ];
  const availableDesignStyles = [
    {
      id: "default",
      name: "Mặc định",
      nameEn: "Default",
      englishName: "Default style",
      description: "Tự động tối ưu hóa phong cách phối cảnh phù hợp nhất",
      promptSuffix: "photorealistic high-end architectural rendering, beautiful organic materials and exquisite colors",
      thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
    },
    ...SCHOOL_TAXONOMY[activeSchool].designStyles
  ];

  // Whenever activeTool changes, reset detailed options to default
  useEffect(() => {
    if (activeTool) {
      setSelectedRoom("default");
      setSelectedStyle("default");
      setSelectedView("default");
      setSelectedContext("default");
      setSelectedLighting("default");
      setSelectedWeather("default");
      setSelectedColor("default");
      setSelectedDensity("default");
      setRefImages([]);
      setFloorplanViewMode("overview");
      setPosterTemplate("infographic");
      setBlueprintType("floor_plan");
      setDiagramType("exploded");
      setMoodboardMode("to_space");
      setRenderPhotoCount(1);
      setEditMarkers([]);
      if (skipNextEditPromptResetRef.current) {
        skipNextEditPromptResetRef.current = false;
      } else {
        setEditPrompt("");
      }
    }
  }, [activeTool]);

  const currentResolutionOption = RESOLUTION_OPTIONS.find((r) => r.id === selectedResolution)!;
  const currentAspectRatioOption = ASPECT_RATIO_OPTIONS.find((r) => r.id === selectedAspectRatio) || ASPECT_RATIO_OPTIONS[0];
  const currentQualityOption = isUpscaleTool
    ? QUALITY_OPTIONS.find((q) => q.id === "4k")!
    : QUALITY_OPTIONS.find((q) => q.id === selectedQuality) || QUALITY_OPTIONS[0];
  // Số ảnh sẽ render cho lượt tạo hiện tại — quyết định tổng credit bị trừ (số ảnh x chi phí/ảnh).
  const activeRenderCount = activeTab === "sync_view" ? syncCount
    : (activeTab === "edit_photo" || isSketchNotesTool) ? editCount
    : renderPhotoCount;
  const currentStyleOption = availableDesignStyles.find((s) => s.id === selectedStyle) || availableDesignStyles[0] || DESIGN_STYLES[0];
  const currentRoomOption = availableRoomTypes.find((r) => r.id === selectedRoom) || availableRoomTypes[0] || ROOM_TYPES[0];

  // Helper to compress any base64 image (specifically the AI-generated one) before saving to state/localStorage
  const compressBase64Image = (base64: string, maxWidth = 1024, maxHeight = 1024, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64 || !base64.startsWith("data:image")) {
        resolve(base64);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => {
        resolve(base64);
      };
      img.src = base64;
    });
  };

  // Edit Photo (and Sửa Bằng Ghi Chú, which reuses it) allows more reference images
  // (e.g. multiple furniture photos to add into a space).
  const maxRefImages = (activeTab === "edit_photo" || isSketchNotesTool) ? 6 : 3;

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files) as File[];

    // Check limit
    const availableSlots = maxRefImages - refImages.length;
    if (availableSlots <= 0) {
      alert(`${t("create.err.maxRefPre")} ${maxRefImages} ${t("create.err.maxRefPost")}`);
      return;
    }

    const filesToProcess = files.slice(0, availableSlots);
    
    filesToProcess.forEach((file: File) => {
      if (!file.type.startsWith("image/")) {
        alert(t("create.err.invalidFile"));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (!event.target?.result) return;
        
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
            setRefImages(prev => {
              if (prev.length >= 3) return prev;
              return [...prev, compressedBase64];
            });
          } else {
            setRefImages(prev => {
              if (prev.length >= 3) return prev;
              return [...prev, event.target!.result as string];
            });
          }
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input value so same file can be selected again
    e.target.value = "";
  };

  // Render trigger handle
  const handleGenerate = async () => {
    if (!authUserId) {
      setErrorMessage(t("create.err.loginRequired"));
      onRequireLogin();
      return;
    }

    // Generate empty base64 background to support pure text-to-image prompt if no image is uploaded
    let finalSourceImage = selectedImage;

    if (!finalSourceImage && activeTool?.id === "prompt_to_design") {
      // Small minimalist blueprint canvas grid as base64 to guide prompt-to-image
      finalSourceImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABFGoRRAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAACNJREFUeNrtl8ENAAAAwqD3T20ON6gAAAAAAAAAAAAAAAAAAHgMFrgAAayB53sAAAAASUVORK5CYII=";
    }

    if (!finalSourceImage) {
      setErrorMessage(t("create.err.uploadRequired"));
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setErrorMessage(null);
    const renderCount = activeRenderCount;
    const requiredCredits = currentQualityOption.cost * renderCount;

    if (credits < requiredCredits) {
      setErrorMessage(
        `Không đủ credits. Bạn cần ${requiredCredits} credits, nhưng số dư hiện tại chỉ có ${credits} credits. Vui lòng mua thêm credit!`
      );
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      setErrorMessage(t("create.err.sessionExpired"));
      onRequireLogin();
      return;
    }

    setIsLoading(true);
    setResultProject(null);
    setBatchResults([]);
    setIsSyncView(false);
    setIsLightboxOpen(false);
    setIsFavorited(false);

    // Build smart customized parameters based on the active sub-tab and active tool
    let stylePromptValue = currentStyleOption.promptSuffix;
    let combinedNotes = notes;
    let processedMode = "interior";

    if (activeTab === "render_photo") {
      if (activeTool?.id === "architecture" || activeTool?.id === "planning") {
        processedMode = "exterior";
      } else if (activeTool?.id === "landscape") {
        processedMode = "landscape";
      } else {
        processedMode = "interior";
      }
    } else if (activeTab === "render_floorplan") {
      processedMode = "sketch";
      if (activeSchool === "architecture") {
        const floorDetails: string[] = [];
        if (selectedRoom !== "default") floorDetails.push(cleanLabel(currentRoomOption.name));
        if (selectedContext !== "default") floorDetails.push(cleanLabel(CONTEXT_OPTIONS.find((c) => c.id === selectedContext)?.name || ""));
        if (selectedLighting !== "default") floorDetails.push(cleanLabel(LIGHTING_OPTIONS.find((l) => l.id === selectedLighting)?.name || ""));
        if (selectedWeather !== "default") floorDetails.push(cleanLabel(WEATHER_OPTIONS.find((w) => w.id === selectedWeather)?.name || ""));
        const floorDetailLine = floorDetails.join(", ");

        const modeInstruction = floorplanViewMode === "view3d"
          ? "Dựa vào bản vẽ mặt bằng kỹ thuật này, hãy dựng và tạo ảnh chụp thực tế theo góc nhìn kiến trúc 3D (góc nhìn ngang tầm mắt/phối cảnh, KHÔNG phải từ trên xuống) của công trình sau khi hoàn thiện"
          : "Biến bản vẽ mặt bằng kỹ thuật này thành phối cảnh tổng thể 3D chân thực, giữ nguyên góc nhìn từ trên xuống và bố cục mặt bằng gốc, tô màu vật liệu và ánh sáng chân thực";

        combinedNotes = notes && notes.trim().length > 0
          ? notes.trim()
          : `${modeInstruction}${floorDetailLine ? `, ${floorDetailLine}` : ""}.`;
      } else {
        combinedNotes = `Vui lòng chuyển đổi bản vẽ mặt bằng kỹ thuật, thiết kế 2D này thành một phối cảnh 3D có màu sắc chân thực, chất liệu tinh tế và bố cục sang trọng. ${notes}`;
      }
    } else if (activeTab === "renovate_ai") {
      if (activeTool?.id === "renovate_exterior") {
        processedMode = "exterior";
      } else if (activeTool?.id === "renovate_landscape") {
        processedMode = "landscape";
      } else {
        processedMode = "interior";
      }
      combinedNotes = `Cải tạo nâng cấp không gian này. Giữ vững kết cấu an toàn và tạo ra bản phối tuyệt đẹp mới. ${notes}`;
    } else if (activeTab === "sync_view") {
      processedMode = syncViewType; // interior or exterior
      const angleDescription = describeCameraAngle(cameraRotation, cameraTilt, cameraZoom);
      // Lead with the viewpoint change as the primary task — if "keep everything unchanged"
      // comes first, the model treats the angle change as an afterthought and barely moves.
      let syncDescription = `Nhiệm vụ chính: vẽ lại công trình/không gian này như thể chụp từ một vị trí camera MỚI — ${angleDescription}. Hãy tưởng tượng dựng lại toàn bộ cảnh này thành mô hình 3D rồi xoay camera sang đúng vị trí trên, không chỉ chỉnh sửa lại ảnh gốc. Giữ nguyên kiến trúc, vật liệu, màu sắc, ánh sáng và cảnh vật xung quanh — chỉ vị trí và hướng camera thay đổi.`;
      if (generate12Angles) syncDescription += ` Tạo thêm bộ ảnh từ 12 góc chụp đẹp nhất bao quanh công trình.`;
      if (syncEffect !== "none") syncDescription += ` Hiệu ứng: ${syncEffect}.`;
      if (syncAtmosphere !== "default") syncDescription += ` Không khí: ${syncAtmosphere}.`;
      combinedNotes = notes ? `${syncDescription} ${notes}` : syncDescription;
    } else if (activeTab === "edit_photo" || isSketchNotesTool) {
      processedMode = "interior";
      if (editMarkers.length > 0) {
        const pointsText = editMarkers
          .map((m, idx) => `Vùng số ${idx + 1}: ${m.text.trim() || "(không có mô tả riêng, áp dụng theo mô tả chung)"}.`)
          .join(" ");
        combinedNotes = `Ảnh đính kèm có các khung chữ nhật đánh số (1-${editMarkers.length}) do người dùng khoanh vùng tại khu vực cần chỉnh sửa. Hãy thực hiện đúng yêu cầu tương ứng với TỪNG vùng đã đánh dấu, chỉ thay đổi bên trong khung đó, giữ nguyên mọi khu vực khác không được đánh dấu. Sau khi chỉnh sửa xong, XÓA HOÀN TOÀN các khung chữ nhật và số đánh dấu khỏi ảnh kết quả — ảnh đầu ra không được còn bất kỳ đường viền, khung hay ký hiệu đánh dấu nào. ${pointsText}${editPrompt.trim() ? ` Yêu cầu bổ sung chung: ${editPrompt.trim()}` : ""}`;
      } else {
        combinedNotes = `Yêu cầu chỉnh sửa ảnh chính xác: ${editPrompt}. Giữ nguyên mọi khu vực khác trong ảnh, chỉ thay thế hoặc thêm bớt đồ đạc tại vùng cần thiết như mô tả.`;
      }
      if (refImages.length > 0) {
        combinedNotes += ` Các ảnh tham chiếu đính kèm sau ảnh chính là đồ vật/nội thất/vật liệu cụ thể mà người dùng muốn đưa vào không gian — hãy sử dụng chính xác hình dáng, kiểu dáng của các vật thể trong ảnh tham chiếu đó khi thực hiện chỉnh sửa.`;
      }
    } else if (activeTab === "extended_features") {
      if (activeTool?.id === "re_render") {
        processedMode = "interior";
        combinedNotes = refImages.length > 0
          ? "Biến ảnh thành ảnh thực tế, tham khảo Đường nét & Bố cục, Vật liệu & Bề mặt chi tiết, ánh sáng, màu sắc, bối cảnh của ảnh tham khảo"
          : "Biến ảnh thành ảnh thực tế";
      } else if (activeTool?.id === "prompt_to_design") {
        processedMode = "interior";
        combinedNotes = `Vẽ ra một bản thiết kế phối cảnh 3D hoàn toàn mới từ ý tưởng sau (không cần giữ khung ảnh cũ): ${notes}`;
      } else if (activeTool?.id === "upscale_ai") {
        processedMode = "interior";
        combinedNotes = `Nâng cấp độ phân giải cực cao (Upscale AI 4K), khử nhiễu hạt, tăng cường chi tiết bề mặt và độ sắc nét cho bức ảnh này một cách chân thực nhất.`;
      } else if (activeTool?.id === "layout_creator") {
        processedMode = "interior";
        combinedNotes = "Tạo một bảng trình bày kiến trúc (architectural presentation board) sử dụng thiết kế của tòa nhà này. Tạo các bản vẽ đặc trưng gồm: mặt bằng, mặt cắt, phối cảnh trục đo axonometric và 5 sơ đồ diễn tiến khối (massing evolution) từng bước. Tạo thêm các cảnh khác, nội thất, mặt đứng và khiến bảng trình bày trở nên mạch lạc và thu hút bằng bố cục và phần chữ được sắp xếp hợp lý.";
      } else if (activeTool?.id === "real_estate_poster") {
        processedMode = "interior";
        combinedNotes = posterTemplate === "luxury"
          ? `Hãy tạo một Poster Bất động sản chuyên nghiệp từ bức ảnh tòa nhà tôi cung cấp, theo phong cách hiện đại – sang trọng như các poster dự án cao cấp.
Yêu cầu:

1. Thiết kế tổng thể
 • Nền gradient tối – xanh navy hoặc xanh đêm.
 • Phía dưới là hình tòa nhà (ảnh gốc) được làm sáng, nổi bật, tăng độ sắc nét.
 • Hiệu ứng ánh sáng vàng sang trọng trên các cửa kính.

2. Bố cục thông tin
 • Tiêu đề lớn, nổi bật ở trung tâm poster:
WHERE LUXURY MEETS LOCATION (hoặc tùy chỉnh theo ảnh)
 • Dòng mô tả nhỏ phía dưới: 3 & 4 BHK Prime Residencies hoặc nội dung phù hợp.

3. Icon tiện ích xung quanh

Tạo các vòng tròn icon kết nối bằng nét đứt:
 • Hospital
 • Educational Institutions
 • Shopping Mall
 • Restaurants
 • Upcoming Highway
(hoặc tự động nhận diện và tạo icon phù hợp với ảnh)

4. Logo dự án
 • Thêm logo/mẫu logo ở chính giữa phía dưới (tự thiết kế dạng monogram sang trọng nếu ảnh không có logo).
 • Tông màu vàng hoặc trắng.

5. Footer thông tin
 • Đặt thông tin liên hệ, hotline, địa chỉ ở cuối poster.
 • Typography hiện đại, dễ đọc.

6. Phong cách
 • Luxury
 • Clean, minimal nhưng ấn tượng
 • Ánh sáng cinematic
 • Layout cân đối giống poster BĐS cao cấp quốc tế.

Hãy xuất ra 1 Poster hoàn chỉnh với bố cục đẹp, rõ ràng, mang tính thương mại và phù hợp marketing bất động sản.`
          : `Hãy tạo một poster bất động sản cao cấp theo đúng phong cách infographic như hình mẫu:
• Hình dự án ở dưới, chiếm 40–50% poster
• Phía trên là danh sách tiện ích xung quanh dạng cột đứng có ảnh minh họa và số thứ tự
• Typography sang trọng, sắc nét, mô phỏng phong cách thiết kế cao cấp quốc tế.

YÊU CẦU BỐ CỤC:
 1. Khu tiện ích (phần trên poster)

 • Tạo 4–6 ô tiện ích dạng hình chữ nhật đứng.
 • Mỗi ô gồm:
• ảnh minh họa tiện ích
• số thứ tự (01–05)
• tiêu đề tiện ích
• mô tả ngắn 1 dòng
 • Các ô xếp thành hàng ngang, có hiệu ứng phát sáng nhẹ.

 2. Khu hình dự án

 • Đặt hình dự án lớn ở phần dưới poster.
 • Tăng độ sáng – độ trong – hiệu ứng ánh đèn vàng warm.
 • Giữ đúng đường nét công trình.

 3. Tiêu đề chính

 • Text sang trọng:
ĐÓN ĐẦU NGUỒN KHÁCH DỒI DÀO QUANH NĂM
 • Hoặc AI tự đề xuất tiêu đề phù hợp.

 4. Tagline dự án

 • Ví dụ:
TỌA ĐỘ GIAO THƯƠNG ĐẮT GIÁ – BỨT PHÁ TIỀM NĂNG KINH DOANH
 • Font serif hoặc sans-serif luxury.

 5. Logo & branding

 • Đặt logo dự án phía dưới phải.
 • Tông màu vàng gold / trắng.

 6. Màu sắc & phong cách

 • Tone xanh–nâu–xám sang trọng.
 • Ánh sáng mềm, mang cảm giác cao cấp.
 • Dùng hiệu ứng chiều sâu và transition mượt giữa phần trên & dưới.

OUTPUT

• 1 poster hoàn chỉnh theo layout giống hình tôi gửi
• Có tiện ích → hình dự án → tagline → logo
• Bố cục đẹp, rõ, sang trọng — dùng được ngay cho marketing BĐS.`;
      } else if (activeTool?.id === "render_blueprint") {
        processedMode = "sketch";
        if (blueprintType === "elevation") {
          combinedNotes = "Hãy tạo bản vẽ mặt đứng kỹ thuật (elevation) của công trình này. Thể hiện rõ mặt tiền, tỷ lệ tầng và chi tiết kiến trúc. Đúng chuẩn bản vẽ 2D đen trắng, nét rõ ràng, không phối cảnh 3D.";
        } else if (blueprintType === "section") {
          combinedNotes = "Hãy tạo bản vẽ mặt cắt kỹ thuật (section) của công trình này. Thể hiện rõ cấu trúc các tầng, chiều cao và mặt cắt không gian bên trong. Đúng chuẩn bản vẽ 2D đen trắng, nét rõ ràng, không phối cảnh 3D.";
        } else {
          combinedNotes = "Hãy tạo bản vẽ mặt bằng kỹ thuật (floor plan) của công trình này. Thể hiện rõ tường, cửa, kích thước và bố trí không gian nhìn từ trên xuống. Đúng chuẩn bản vẽ 2D đen trắng, nét rõ ràng, không phối cảnh 3D.";
        }
      } else if (activeTool?.id === "technical_drawing") {
        processedMode = "interior";
        combinedNotes = "Tạo một bảng trình bày kiến trúc (architectural presentation board) sử dụng thiết kế của tòa nhà này. Tạo các bản vẽ đặc trưng gồm: mặt bằng, mặt cắt, phối cảnh trục đo axonometric và 5 sơ đồ diễn tiến khối (massing evolution) từng bước. Tạo thêm các cảnh khác, nội thất, mặt đứng và khiến bảng trình bày trở nên mạch lạc và thu hút bằng bố cục và phần chữ được sắp xếp hợp lý.";
      } else if (activeTool?.id === "diagram_creator") {
        processedMode = "sketch";
        if (diagramType === "concept") {
          combinedNotes = `Tạo một concept diagram kiến trúc bằng cách vẽ các đường sketch, nét bút chì và ghi chú lên trên ảnh render này.
Giữ nguyên hình ảnh gốc và thêm các yếu tố diagram như:
– mũi tên tay vẽ (hand-drawn arrows)
– vòng cung chỉ hướng
– ký hiệu ánh sáng, gió, mặt trời
– ghi chú text ngắn mô tả công năng, hướng gió, ánh sáng, lối vào, khoảng mở
– khung chữ viết tay (handwritten annotation boxes)
– đường nét trắng nhẹ, phong cách schematic architectural diagram

Phong cách: giống bản phác thảo kiến trúc sư trên mô hình, nét tự nhiên, mềm, hơi nguệch ngoạc nhưng thẩm mỹ.
Không làm thay đổi hình khối công trình trong ảnh gốc.
Không thêm chi tiết mới, chỉ overlay diagram lên trên.
Kết quả: một concept architectural diagram đẹp, trực quan, giống bản viết tay minh họa ý tưởng.`;
        } else if (diagramType === "axon") {
          combinedNotes = `Biến ảnh đầu vào thành phong cách biểu diễn kiến trúc dạng diagram. Giữ công trình chính nổi bật với màu sắc vật liệu phong cách technical illustration, đường nét sạch, mô hình hóa theo dạng 3D massing. Render theo phong cách axonometric / isometric.
Làm mờ và giản lược toàn bộ bối cảnh xung quanh thành các khối trắng tinh, ít chi tiết, viền mảnh. Nhà cửa, đường phố, cây xanh chuyển thành tone trắng – xám nhạt như mô hình study mass.
Tập trung thể hiện rõ hình khối kiến trúc chính, các đường cong, tầng setback, ban công, cửa sổ trình bày bằng các đường line đều và tối giản.
Loại bỏ texture thực tế, ánh sáng mềm, không đổ bóng mạnh.
Phong cách tổng thể giống mô hình concept kiến trúc, minimal, clean, high-level design diagram`;
        } else if (diagramType === "annotation") {
          combinedNotes = `Hãy biến bức ảnh tôi cung cấp thành một Architectural Annotation Diagram chi tiết.
Yêu cầu:
 1. Vẽ overlay đường viền trắng (white outline) lên toàn bộ các chi tiết kiến trúc quan trọng: mái, cột, lan can, bậc tam cấp, tượng đá, phù điêu, đá lát…
 2. Thêm mũi tên chú thích bằng tiếng Việt + tiếng Anh cho từng bộ phận (song ngữ).
 3. Tạo icon minh họa line-art màu trắng cho từng loại vật liệu/chi tiết như: ngói, cột đá, phù điêu, đá lát, tượng.
 4. Mỗi icon đặt cạnh label và có đường line trắng (leader line) dẫn đến vị trí đúng trong ảnh.
 5. Phong cách minh họa giống kiến trúc kỹ thuật: rõ ràng, sạch sẽ, cân đối, nhẹ nhàng nhưng chính xác.
 6. Giữ ảnh chụp gốc làm nền, overlay đường viền và label lên trên như bản phân tích kiến trúc.
 7. Xuất ra ảnh diagram hoàn chỉnh + danh sách chi tiết + mô tả ngắn về phong cách.
8 lưu ý phải chú thích đúng vật liệu và vị trí.`;
        } else {
          combinedNotes = `Tạo một axonometric exploded diagram từ ảnh render này.
Giữ đúng hình khối và tỷ lệ công trình gốc.
Xây dựng lại mô hình dưới dạng axonometric và tách thành các lớp:
– mái
– tầng trên
– tầng dưới
– mặt sàn
– nền/đế
Hiển thị các lớp theo dạng exploded view với đường dẫn chấm thẳng đứng.
Nét mảnh, đồng đều, độ rõ cao, đơn giản hóa chi tiết nhưng giữ đúng hình học.
Thêm nhãn chú thích Mặt bằng tầng 1,2,3 theo thứ tự từ dưới lên.
Không thêm chi tiết mới ngoài hình gốc.`;
        }
      } else if (activeTool?.id === "moodboard_creator") {
        processedMode = "interior";
        combinedNotes = moodboardMode === "to_moodboard"
          ? "Extract materials and colors from this scene into a clean vertical moodboard layout."
          : `Generate a photorealistic scene from this moodboard. Instruction: ${notes}.`;
      } else {
        combinedNotes = `${activeTool?.name}: ${notes}`;
      }
    }

    // Burn the numbered markers into the image pixels so the model can visually
    // correlate each numbered instruction with its location (set-of-marks prompting).
    if ((activeTab === "edit_photo" || isSketchNotesTool) && editMarkers.length > 0 && finalSourceImage) {
      finalSourceImage = await renderAnnotatedImage(finalSourceImage, editMarkers);
    }

    const sourceImage = finalSourceImage;

    const performSingleGenerate = async (): Promise<GeneratedProject> => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          image: sourceImage,
          quality: isUpscaleTool ? "4k" : selectedQuality,
          styleId: selectedStyle,
          styleName: currentStyleOption.name,
          stylePrompt: stylePromptValue,
          roomType: currentRoomOption.name,
          roomTypeId: selectedRoom,
          lightingId: selectedLighting,
          colorId: selectedColor,
          activeTab: activeTab,
          school: activeSchool,
          notes: combinedNotes,
          aspectRatio: currentAspectRatioOption.ratio,
          mode: processedMode,
          creativity: creativity,
          viewName: activeSchool === "planning"
            ? PLANNING_VIEW_OPTIONS.find(v => v.id === selectedView)?.name
            : VIEW_OPTIONS.find(v => v.id === selectedView)?.name,
          viewEnglish: activeSchool === "planning"
            ? PLANNING_VIEW_OPTIONS.find(v => v.id === selectedView)?.english
            : VIEW_OPTIONS.find(v => v.id === selectedView)?.english,
          contextName: activeSchool === "planning"
            ? PLANNING_CONTEXT_OPTIONS.find(c => c.id === selectedContext)?.name
            : CONTEXT_OPTIONS.find(c => c.id === selectedContext)?.name,
          contextEnglish: activeSchool === "planning"
            ? PLANNING_CONTEXT_OPTIONS.find(c => c.id === selectedContext)?.english
            : CONTEXT_OPTIONS.find(c => c.id === selectedContext)?.english,
          lightingName: activeSchool === "planning"
            ? PLANNING_LIGHTING_OPTIONS.find(l => l.id === selectedLighting)?.name
            : LIGHTING_OPTIONS.find(l => l.id === selectedLighting)?.name,
          lightingEnglish: activeSchool === "planning"
            ? PLANNING_LIGHTING_OPTIONS.find(l => l.id === selectedLighting)?.english
            : LIGHTING_OPTIONS.find(l => l.id === selectedLighting)?.english,
          weatherName: activeSchool === "planning"
            ? PLANNING_WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.name
            : WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.name,
          weatherEnglish: activeSchool === "planning"
            ? PLANNING_WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.english
            : WEATHER_OPTIONS.find(w => w.id === selectedWeather)?.english,
          densityName: activeSchool === "planning"
            ? PLANNING_DENSITY_OPTIONS.find(d => d.id === selectedDensity)?.name
            : undefined,
          densityEnglish: activeSchool === "planning"
            ? PLANNING_DENSITY_OPTIONS.find(d => d.id === selectedDensity)?.english
            : undefined,
          colorName: COLOR_OPTIONS.find(c => c.id === selectedColor)?.name,
          colorEnglish: COLOR_OPTIONS.find(c => c.id === selectedColor)?.english,
          refImages: (activeTab === "render_photo" || activeTab === "renovate_ai" || activeTab === "edit_photo" || isReRenderTool || isSketchNotesTool) ? refImages : [],
        }),
      });

      let data: any;
      try {
        data = await response.json();
      } catch {
        // Response KHÔNG phải JSON — thường là trang lỗi text của Vercel khi function timeout/500
        // (hay gặp với render 4K vượt 60s). Hiển thị thông báo timeout thân thiện.
        const err: any = new Error("non-json response");
        err.code = "network";
        throw err;
      }

      if (!response.ok || !data.success) {
        const err: any = new Error(data.error || t("create.err.generic"));
        err.code = data.errorCode; // mã lỗi để hiển thị thông báo thân thiện, song ngữ
        throw err;
      }

      // Server ưu tiên trả về URL ảnh trong Supabase Storage (nhẹ, hỗ trợ 3K/4K, không nhồi base64
      // vào localStorage). Nếu có URL thì dùng luôn; nếu không (Storage lỗi / local chưa cấu hình)
      // thì fallback: nén base64 theo đúng tier chất lượng như trước.
      let afterImage: string;
      if (data.afterUrl) {
        afterImage = data.afterUrl;
      } else {
        const effectiveQuality = isUpscaleTool ? "4k" : selectedQuality;
        const maxDimension = effectiveQuality === "4k" ? 4096 : effectiveQuality === "3k" ? 2048 : 1024;
        const jpegQuality = effectiveQuality === "4k" ? 0.95 : effectiveQuality === "3k" ? 0.9 : 0.8;
        afterImage = await compressBase64Image(data.renovatedImage, maxDimension, maxDimension, jpegQuality);
      }

      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        beforeImage: data.beforeUrl || sourceImage,
        afterImage,
        styleId: selectedStyle,
        roomTypeId: selectedRoom,
        prompt: data.prompt || stylePromptValue,
        notes: combinedNotes,
        createdAt: new Date().toISOString(),
        resolutionId: selectedQuality,
        aspectRatio: selectedAspectRatio,
      };
    };

    try {
      const outcomes = await Promise.allSettled(
        Array.from({ length: renderCount }, () => performSingleGenerate())
      );
      const successes = outcomes
        .filter((o): o is PromiseFulfilledResult<GeneratedProject> => o.status === "fulfilled")
        .map((o) => o.value);

      if (successes.length === 0) {
        const firstFailure = outcomes.find((o): o is PromiseRejectedResult => o.status === "rejected");
        throw firstFailure?.reason ?? new Error(t("create.err.generic")); // giữ nguyên .code để map thông báo
      }

      // Credit đã được server trừ/hoàn theo từng lượt (thành công giữ nguyên, lỗi tự hoàn lại).
      successes.forEach((project) => onAddProject(project));
      setBatchResults(successes);
      setResultProject(successes[0]);

      if (successes.length < renderCount) {
        setErrorMessage(`${t("create.err.partialPre")} ${successes.length}/${renderCount} ${t("create.err.partialPost")}`);
      }
    } catch (err: any) {
      console.error(err);
      // Ưu tiên mã lỗi từ server → thông báo thân thiện theo ngôn ngữ. Lỗi mạng/timeout (fetch không
      // nhận được phản hồi, vd render 4K vượt 60s) → thông báo riêng. Cuối cùng mới dùng message thô.
      const isNetwork =
        err?.name === "TypeError" || /failed to fetch|networkerror|load failed/i.test(String(err?.message || ""));
      const friendly = err?.code
        ? t(`create.err.${err.code}`)
        : isNetwork
        ? t("create.err.network")
        : err?.message || t("create.err.generic");
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
      onCreditsUpdated();
    }
  };

  // Switch Sub-tabs in opzen style
  const subTabs = [
    { id: "render_photo", label: t("create.tab.renderPhoto"), iconName: "Camera" },
    { id: "render_floorplan", label: t("create.tab.renderFloorplan"), iconName: "Map" },
    { id: "renovate_ai", label: t("create.tab.renovateAi"), iconName: "Hammer" },
    { id: "sync_view", label: t("create.tab.syncView"), iconName: "RefreshCw" },
    { id: "edit_photo", label: t("create.tab.editPhoto"), iconName: "PenTool" },
    { id: "extended_features", label: t("create.tab.extended"), iconName: "Grid" },
    { id: "template_library", label: t("create.tab.templateLibrary"), iconName: "BookOpen" },
  ];

  // Grid tools for "Render Ảnh"
  const renderPhotoTools = [
    { id: "architecture", name: t("create.tool.architecture.name"), description: t("create.tool.architecture.desc"), bgImage: "/images/anh-kien-truc.jpg", iconName: "Home" },
    { id: "interior", name: t("create.tool.interior.name"), description: t("create.tool.interior.desc"), bgImage: "/images/anh-noi-that.jpg", iconName: "Sofa" },
    { id: "planning", name: t("create.tool.planning.name"), description: t("create.tool.planning.desc"), bgImage: "/images/anh-quy-hoach.jpg", iconName: "Layers" },
    { id: "landscape", name: t("create.tool.landscape.name"), description: t("create.tool.landscape.desc"), bgImage: "/images/anh-san-vuon.jpg", iconName: "Trees" },
  ];

  // Grid tools for "Render Mặt Bằng"
  const renderFloorplanTools = [
    { id: "floorplan_architecture", name: t("create.tool.fpArchitecture.name"), description: t("create.tool.fpArchitecture.desc"), bgImage: "/images/floorplan-kien-truc.png", iconName: "Home" },
    { id: "floorplan_interior", name: t("create.tool.fpInterior.name"), description: t("create.tool.fpInterior.desc"), bgImage: "/images/floorplan-noi-that.png", iconName: "Sofa" },
    { id: "floorplan_planning", name: t("create.tool.fpPlanning.name"), description: t("create.tool.fpPlanning.desc"), bgImage: "/images/floorplan-quy-hoach.jpg", iconName: "Layers" },
    { id: "floorplan_landscape", name: t("create.tool.fpLandscape.name"), description: t("create.tool.fpLandscape.desc"), bgImage: "/images/floorplan-san-vuon.jpg", iconName: "Trees" },
  ];

  // Grid tools for "Cải Tạo AI"
  const renovateAiTools = [
    { id: "renovate_interior", name: t("create.tool.renovInterior.name"), description: t("create.tool.renovInterior.desc"), bgImage: "/images/caitaonoithat.png", iconName: "Sofa" },
    { id: "renovate_exterior", name: t("create.tool.renovExterior.name"), description: t("create.tool.renovExterior.desc"), bgImage: "/images/caitaongoaithat.png", iconName: "Home" },
    { id: "renovate_landscape", name: t("create.tool.renovLandscape.name"), description: t("create.tool.renovLandscape.desc"), bgImage: "/images/caitaosanvuon.png", iconName: "Trees" },
    { id: "renovate_staging", name: t("create.tool.renovStaging.name"), description: t("create.tool.renovStaging.desc"), bgImage: "/images/caitaoquyhoach.png", iconName: "Wand2" },
  ];

  // 15 Extended features (From photo 6)
  const extendedFeatures = [
    { id: "re_render", name: t("create.ext.reRender.name"), description: t("create.ext.reRender.desc"), iconName: "RefreshCw" },
    { id: "prompt_to_design", name: t("create.ext.promptToDesign.name"), description: t("create.ext.promptToDesign.desc"), iconName: "FileText" },
    { id: "sketch_notes", name: t("create.ext.sketchNotes.name"), description: t("create.ext.sketchNotes.desc"), iconName: "PenTool" },
    { id: "upscale_ai", name: t("create.ext.upscale.name"), description: t("create.ext.upscale.desc"), iconName: "Maximize2" },
    { id: "layout_creator", name: t("create.ext.layout.name"), description: t("create.ext.layout.desc"), iconName: "Layers" },
    { id: "watermark_logo", name: t("create.ext.watermark.name"), description: t("create.ext.watermark.desc"), iconName: "Stamp" },
    { id: "real_estate_poster", name: t("create.ext.poster.name"), description: t("create.ext.poster.desc"), iconName: "FileImage" },
    { id: "render_blueprint", name: t("create.ext.blueprint.name"), description: t("create.ext.blueprint.desc"), iconName: "Layers3" },
    { id: "technical_drawing", name: t("create.ext.technical.name"), description: t("create.ext.technical.desc"), iconName: "Map" },
    { id: "diagram_creator", name: t("create.ext.diagram.name"), description: t("create.ext.diagram.desc"), iconName: "Grid" },
    { id: "moodboard_creator", name: t("create.ext.moodboard.name"), description: t("create.ext.moodboard.desc"), iconName: "Layers" },
  ];

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      
      {/* 6 TOP PILL NAVIGATION BAR WITH HISTORY ACTION BUTTON (MATCHING PICTURES EXACTLY) */}
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3.5 bg-[#0B0F19]/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800/90 shadow-xl w-full">
        <div className="flex flex-wrap items-center gap-1">
          {subTabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] font-extrabold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#111827]/60"
                }`}
              >
                {getIconComponent(tab.iconName, "w-4 h-4")}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Lịch Sử button at the right */}
        <button
          onClick={() => {
            setShowHistorySection(!showHistorySection);
            const historyEl = document.getElementById("session-history-view");
            if (historyEl) {
              historyEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex items-center justify-center gap-2 bg-[#111827] border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0"
        >
          <Clock className="w-4 h-4 text-violet-400" />
          {t("create.history")}
        </button>
      </div>

      {/* RENDER WORKSTATION WORKSPACE (If activeTool is selected or direct tabs are loaded) */}
      {activeTool ? (
        <div className="space-y-6">
          {/* Workstation Header navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => {
                setResultProject(null);
                setErrorMessage(null);
                if (activeTab === "sync_view" || activeTab === "edit_photo") {
                  setActiveTab("render_photo"); // Reset back to main
                } else {
                  setActiveTool(null);
                }
              }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t("create.backToCatalog")}
            </button>

            <div className="text-right">
              <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/25 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-widest">
                {t("create.module")}: {activeTool.name}
              </span>
            </div>
          </div>

          {/* MAIN TWO-COLUMN CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT INPUT CONFIGURATION BOARD */}
            <div className="lg:col-span-7 space-y-6 text-left">

              {/* Mode toggle (chỉ áp dụng cho Tạo Moodboard) */}
              {isMoodboardTool && (
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMoodboardMode("to_space")}
                    className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                      moodboardMode === "to_space" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t("create.moodboard.toSpace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoodboardMode("to_moodboard")}
                    className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                      moodboardMode === "to_moodboard" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t("create.moodboard.toMoodboard")}
                  </button>
                </div>
              )}

              {/* SECTION 1: Source Image Upload (Hidden for purely text-to-image) */}
              {activeTool.id !== "prompt_to_design" && (
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                    <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                      1
                    </span>
                    {isMoodboardTool ? t("create.upload.titleMoodboard") : activeTab === "render_floorplan" ? t("create.upload.titleFloorplan") : t("create.upload.titleDefault")}
                  </h2>
                  <div className="bg-[#080B11]/80 rounded-xl border border-slate-800 p-2.5">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">
                      {activeTab === "render_floorplan"
                        ? t("create.upload.hintFloorplan")
                        : t("create.upload.hintDefault")}
                    </p>
                    <ImageUpload
                      onImageSelected={setSelectedImage}
                      selectedImage={selectedImage}
                      onClear={() => {
                        setSelectedImage(null);
                        setResultProject(null);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* SECTION 2: Dynamic Customizer based on tab */}
              {activeTab === "sync_view" ? (
                /* SYNC VIEW DETAILED PANEL (Matching photo 4 + Góc 2.0) */
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                    <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    {t("create.sync.title")}
                  </h2>

                  <div className="space-y-5">
                    {/* View type toggle */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("create.sync.angleType")}</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSyncViewType("exterior")}
                          className={`py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            syncViewType === "exterior" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.exterior")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSyncViewType("interior")}
                          className={`py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            syncViewType === "interior" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.interior")}
                        </button>
                      </div>
                    </div>

                    {/* BỘ ĐIỀU CHỈNH GÓC CHỤP GÓC 2.0 (Matching photo) */}
                    <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Compass className="w-4 h-4" />
                        </span>
                        <div>
                          <h3 className="text-sm font-black text-white tracking-wide">
                            Góc 2.0
                          </h3>
                        </div>
                      </div>

                      {/* Interactive Dragging Sphere Widget */}
                      <div className="space-y-1">
                        <div className="relative flex items-center justify-center w-full bg-slate-950/50 rounded-xl border border-slate-800/60 h-[250px] overflow-hidden group">
                          {/* Live 3D house/room preview matching the current camera angle,
                              so both designer and client can see exactly which shot is framed */}
                          <div className="absolute inset-0 pointer-events-none">
                            <HouseOrbitPreview
                              rotation={cameraRotation}
                              tilt={cameraTilt}
                              zoom={cameraZoom}
                              viewType={syncViewType}
                            />
                          </div>

                          {/* Instructions floating at the top */}
                          <div className="absolute top-3 left-0 right-0 text-center pointer-events-none z-10">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full shadow-lg">
                              {t("create.sync.dragHint")}
                            </span>
                          </div>

                          {/* Top Cardinal Arrow */}
                          <button
                            type="button"
                            onClick={() => adjustCameraTilt(15)}
                            className="absolute top-2 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition shadow-md z-10 cursor-pointer active:scale-95"
                            title={t("create.sync.tiltUp")}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          {/* Bottom Cardinal Arrow */}
                          <button
                            type="button"
                            onClick={() => adjustCameraTilt(-15)}
                            className="absolute bottom-2 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition shadow-md z-10 cursor-pointer active:scale-95"
                            title={t("create.sync.tiltDown")}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Left Cardinal Arrow */}
                          <button
                            type="button"
                            onClick={() => adjustCameraRotation(-15)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition shadow-md z-10 cursor-pointer active:scale-95"
                            title={t("create.sync.rotateLeft")}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          {/* Right Cardinal Arrow */}
                          <button
                            type="button"
                            onClick={() => adjustCameraRotation(15)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition shadow-md z-10 cursor-pointer active:scale-95"
                            title={t("create.sync.rotateRight")}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          {/* SVG Canvas for Sphere and Camera */}
                          {(() => {
                            const R_SPHERE = 80;
                            const cx = 150;
                            const cy = 125;
                            const rotRad = (cameraRotation * Math.PI) / 180;
                            const tiltRad = (cameraTilt * Math.PI) / 180;

                            const x3d = R_SPHERE * Math.cos(tiltRad) * Math.sin(rotRad);
                            const y3d = -R_SPHERE * Math.sin(tiltRad);
                            const z3d = R_SPHERE * Math.cos(tiltRad) * Math.cos(rotRad);

                            const cameraX = cx + x3d;
                            const cameraY = cy + y3d;

                            const cameraScale = z3d >= 0 ? 1.15 : 0.85;
                            const cameraOpacity = z3d >= 0 ? 1 : 0.55;

                            const dx_c = cx - cameraX;
                            const dy_c = cy - cameraY;
                            const cameraAngle2D = Math.atan2(dy_c, dx_c) * (180 / Math.PI);

                            return (
                              <svg
                                ref={sphereRef}
                                width="100%"
                                height="100%"
                                viewBox="0 0 300 250"
                                className="cursor-grab active:cursor-grabbing select-none"
                                onMouseDown={handleCameraMouseDown}
                                onTouchStart={handleCameraTouchStart}
                              >
                                <defs>
                                  <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
                                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                                  </radialGradient>
                                  <linearGradient id="laserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                                    <stop offset="100%" stopColor="#818cf8" stopOpacity="0.1" />
                                  </linearGradient>
                                </defs>

                                {/* Background sphere backing glow */}
                                <circle cx={cx} cy={cy} r={R_SPHERE} fill="url(#sphereGlow)" />

                                {/* Latitudinal (horizontal) ellipses */}
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE} ry={R_SPHERE * 0.15} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE} ry={R_SPHERE * 0.45} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE} ry={R_SPHERE * 0.75} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
                                {/* Equator */}
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE} ry={2} fill="none" stroke="#475569" strokeWidth="1.2" opacity="0.5" />

                                {/* Longitudinal (vertical) ellipses */}
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE * 0.25} ry={R_SPHERE} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE * 0.65} ry={R_SPHERE} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                <ellipse cx={cx} cy={cy} rx={R_SPHERE * 0.9} ry={R_SPHERE} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />

                                {/* Outer circle shell border */}
                                <circle cx={cx} cy={cy} r={R_SPHERE} fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.6" />

                                {/* Target/center dot */}
                                <circle cx={cx} cy={cy} r={4} fill="#a78bfa" />
                                <circle cx={cx} cy={cy} r={10} fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.4" className="animate-pulse" />

                                {/* Laser beam of sight */}
                                <line
                                  x1={cameraX}
                                  y1={cameraY}
                                  x2={cx}
                                  y2={cy}
                                  stroke="url(#laserGrad)"
                                  strokeWidth="2.5"
                                />
                                <line
                                  x1={cameraX}
                                  y1={cameraY}
                                  x2={cx}
                                  y2={cy}
                                  stroke="#a78bfa"
                                  strokeWidth="1"
                                  opacity="0.8"
                                />

                                {/* Camera SVG representation */}
                                <g transform={`translate(${cameraX}, ${cameraY}) rotate(${cameraAngle2D}) scale(${cameraScale})`} opacity={cameraOpacity}>
                                  {/* Camera main box */}
                                  <rect x="-14" y="-9" width="20" height="18" rx="3" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
                                  {/* Lens pointing forward (facing center) */}
                                  <path d="M6,-4 L11,-2 L11,2 L6,4 Z" fill="#818cf8" stroke="#818cf8" strokeWidth="1" />
                                  {/* Screen details */}
                                  <rect x="-11" y="-6" width="3" height="12" fill="#a78bfa" opacity="0.8" />
                                  <circle cx="-1" cy="0" r="2.5" fill="none" stroke="#c084fc" strokeWidth="1" />
                                  {/* Small flash on top */}
                                  <rect x="-7" y="-12" width="5" height="3" fill="#64748b" rx="0.5" />
                                </g>
                              </svg>
                            );
                          })()}
                        </div>

                        {/* Checkbox: "Tạo ảnh từ 12 góc chụp đẹp nhất" */}
                        <div className="pt-2 flex items-center justify-center">
                          <label className="inline-flex items-center gap-3 cursor-pointer select-none py-1 group">
                            <input
                              type="checkbox"
                              checked={generate12Angles}
                              onChange={(e) => setGenerate12Angles(e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                              generate12Angles 
                                ? "bg-violet-600 border-violet-500 shadow-lg shadow-violet-500/20 text-white" 
                                : "border-slate-700 bg-slate-900 group-hover:border-slate-500"
                            }`}>
                              {generate12Angles && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors">
                              {t("create.sync.gen12")}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Sliders Block */}
                      <div className="space-y-3.5 pt-1">
                        {/* Slider 1: Xoay */}
                        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl px-4 py-2.5 space-y-1.5 shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t("create.sync.rotate")}</span>
                            <span className="text-white font-black text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 min-w-[45px] text-center">
                              {cameraRotation}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={cameraRotation}
                            onChange={(e) => { setCameraRotation(Number(e.target.value)); setSyncAngle("custom"); }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                          />
                        </div>

                        {/* Slider 2: Nghiêng */}
                        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl px-4 py-2.5 space-y-1.5 shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t("create.sync.tilt")}</span>
                            <span className="text-white font-black text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 min-w-[45px] text-center">
                              {cameraTilt}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-90"
                            max="90"
                            value={cameraTilt}
                            onChange={(e) => { setCameraTilt(Number(e.target.value)); setSyncAngle("custom"); }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                          />
                        </div>

                        {/* Slider 3: Phóng */}
                        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-xl px-4 py-2.5 space-y-1.5 shadow-sm">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t("create.sync.zoom")}</span>
                            <span className="text-white font-black text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800 min-w-[45px] text-center">
                              {cameraZoom}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={cameraZoom}
                            onChange={(e) => { setCameraZoom(Number(e.target.value)); setSyncAngle("custom"); }}
                            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Standard details for synchronization */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t("create.sync.cameraStyle")}</label>
                        <select
                          value={syncAngle}
                          onChange={(e) => handleSelectCameraPreset(e.target.value)}
                          className="w-full bg-[#080B11]/80 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:border-violet-500 focus:outline-none cursor-pointer"
                        >
                          <option value="custom">{t("create.camera.custom")}</option>
                          {CAMERA_ANGLE_PRESETS.map((preset) => (
                            <option key={preset.id} value={preset.id}>{lang === "en" ? preset.labelEn : preset.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t("create.sync.frameEffect")}</label>
                        <select
                          value={syncEffect}
                          onChange={(e) => setSyncEffect(e.target.value)}
                          className="w-full bg-[#080B11]/80 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:border-violet-500 focus:outline-none cursor-pointer"
                        >
                          <option value="none">{t("create.sync.effect.none")}</option>
                          <option value="cinematic">{t("create.sync.effect.cinematic")}</option>
                          <option value="sketch">{t("create.sync.effect.sketch")}</option>
                          <option value="clay">{t("create.sync.effect.clay")}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t("create.sync.atmosphere")}</label>
                        <select
                          value={syncAtmosphere}
                          onChange={(e) => setSyncAtmosphere(e.target.value)}
                          className="w-full bg-[#080B11]/80 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:border-violet-500 focus:outline-none cursor-pointer"
                        >
                          <option value="default">{t("create.sync.atm.default")}</option>
                          <option value="sunset">{t("create.sync.atm.sunset")}</option>
                          <option value="sunny">{t("create.sync.atm.sunny")}</option>
                          <option value="night">{t("create.sync.atm.night")}</option>
                          <option value="foggy">{t("create.sync.atm.foggy")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (activeTab === "edit_photo" || isSketchNotesTool) ? (
                /* EDIT PHOTO DETAILED PANEL (Matching photo 5) */
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                    <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                      2
                    </span>
                    {t("create.edit.header")}
                  </h2>
                  <div className="space-y-4">
                    {selectedImage ? (
                      <ImageAnnotator
                        image={selectedImage}
                        markers={editMarkers}
                        onChange={setEditMarkers}
                        maxMarkers={10}
                      />
                    ) : (
                      <p className="text-xs text-slate-500 italic">{t("create.edit.uploadFirst")}</p>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {t("create.generalDesc")} {editMarkers.length > 0 ? t("create.edit.optional") : ""}
                      </label>
                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder={t("create.edit.placeholder")}
                        rows={3}
                        className="w-full bg-[#080B11]/80 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition leading-relaxed"
                      />
                    </div>

                    {/* Section 3: Reference images (e.g. photos of furniture to add into the space) */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {t("create.refImages.prefix")} {maxRefImages} {t("create.refImages.suffix")}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {refImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group bg-[#080B11]/80">
                            <img src={img} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setRefImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 transition opacity-0 group-hover:opacity-100 shadow-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-2 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                              {t("create.image")} {idx + 1}
                            </div>
                          </div>
                        ))}

                        {refImages.length < maxRefImages && (
                          <label className="relative aspect-square rounded-xl border border-dashed border-slate-800 hover:border-violet-500 bg-[#080B11]/50 hover:bg-violet-500/5 flex flex-col items-center justify-center cursor-pointer transition text-center p-2 group">
                            <FileImage className="w-6 h-6 text-slate-500 mb-1.5 group-hover:text-violet-400" />
                            <span className="text-[10px] font-bold text-slate-400">{t("create.upload.small")}</span>
                            <span className="text-[9px] text-slate-600 mt-0.5">({refImages.length}/{maxRefImages})</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleRefImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* STANDARD TAB WORKFLOWS (Render Ảnh, Render Mặt bằng, Cải tạo AI, Tính năng mở rộng) */
                <>
                  {/* 2. Chọn loại & chế độ (chỉ áp dụng cho Render Mặt Bằng > Kiến trúc) */}
                  {activeTab === "render_floorplan" && activeSchool === "architecture" && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black mr-1">
                          2
                        </span>
                        {t("create.fp.typeMode")}
                        <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white transition ml-1.5 shrink-0" />
                      </h2>
                      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setFloorplanViewMode("overview")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            floorplanViewMode === "overview" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.fp.overview")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFloorplanViewMode("view3d")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            floorplanViewMode === "view3d" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.fp.view3d")}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {floorplanViewMode === "overview"
                          ? t("create.fp.overviewDesc")
                          : t("create.fp.view3dDesc")}
                      </p>
                    </div>
                  )}

                  {/* 2. Chọn Mẫu Poster (chỉ áp dụng cho Poster BĐS) */}
                  {isPosterTool && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                        <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black mr-1">
                          2
                        </span>
                        {t("create.poster.choose")}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setPosterTemplate("infographic")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            posterTemplate === "infographic" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.poster.infographic")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPosterTemplate("luxury")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            posterTemplate === "luxury" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.poster.luxury")}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        {posterTemplate === "infographic"
                          ? t("create.poster.infographicDesc")
                          : t("create.poster.luxuryDesc")}
                      </p>
                    </div>
                  )}

                  {/* 2. Type (chỉ áp dụng cho Tạo Bản Vẽ) */}
                  {isBlueprintTool && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Type</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setBlueprintType("floor_plan")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            blueprintType === "floor_plan" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.blueprint.floorPlan")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlueprintType("elevation")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            blueprintType === "elevation" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.blueprint.elevation")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setBlueprintType("section")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            blueprintType === "section" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.blueprint.section")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Chọn Loại Diagram (chỉ áp dụng cho Tạo Diagram) */}
                  {isDiagramTool && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        {t("create.diagram.choose")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setDiagramType("exploded")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            diagramType === "exploded" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.diagram.exploded")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiagramType("concept")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            diagramType === "concept" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.diagram.concept")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiagramType("axon")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            diagramType === "axon" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.diagram.axon")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiagramType("annotation")}
                          className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                            diagramType === "annotation" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {t("create.diagram.annotation")}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. Tải lên ảnh tham chiếu (chỉ áp dụng cho Re-Render) */}
                  {isReRenderTool && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                        <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                          2
                        </span>
                        {t("create.rerender.prefix")} {maxRefImages} {t("create.rerender.suffix")}
                      </h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {t("create.rerender.desc")}
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        {refImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group bg-[#080B11]/80">
                            <img src={img} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setRefImages((prev) => prev.filter((_, i) => i !== idx))}
                              className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 transition opacity-0 group-hover:opacity-100 shadow-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-2 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                              {t("create.image")} {idx + 1}
                            </div>
                          </div>
                        ))}

                        {refImages.length < maxRefImages && (
                          <label className="relative aspect-square rounded-xl border border-dashed border-slate-800 hover:border-violet-500 bg-[#080B11]/50 hover:bg-violet-500/5 flex flex-col items-center justify-center cursor-pointer transition text-center p-2 group">
                            <FileImage className="w-6 h-6 text-slate-500 mb-1.5 group-hover:text-violet-400" />
                            <span className="text-[10px] font-bold text-slate-400">{t("create.upload.small")}</span>
                            <span className="text-[9px] text-slate-600 mt-0.5">({refImages.length}/{maxRefImages})</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleRefImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Tùy chọn chi tiết (Unified Section matching the mockup) */}
                  {!isReRenderTool && !isUpscaleTool && !isLayoutCreatorTool && !isPosterTool && !isBlueprintTool && !isTechnicalDrawingTool && !isDiagramTool && !isMoodboardTool && (
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <h2 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                      <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black mr-1">
                        3
                      </span>
                      {t("create.detailOptions")}
                      <HelpCircle className="w-4 h-4 text-slate-400 cursor-pointer hover:text-white transition ml-1.5 shrink-0" />
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 pt-1">
                      {activeSchool === "interior" ? (
                        <>
                          {/* 1. Loại phòng */}
                          <CustomDropdown
                            label={t("create.roomType")}
                            value={selectedRoom}
                            options={locOpts(availableRoomTypes)}
                            onChange={(val) => {
                              setSelectedRoom(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 2. Phong cách */}
                          <CustomDropdown
                            label={t("create.style")}
                            value={selectedStyle}
                            options={locOpts(availableDesignStyles)}
                            onChange={(val) => {
                              setSelectedStyle(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 3. Ánh sáng */}
                          <CustomDropdown
                            label={t("create.lighting")}
                            value={selectedLighting}
                            options={locOpts(LIGHTING_OPTIONS)}
                            onChange={(val) => {
                              setSelectedLighting(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 4. Tông màu */}
                          <CustomDropdown
                            label={t("create.color")}
                            value={selectedColor}
                            options={locOpts(COLOR_OPTIONS)}
                            onChange={(val) => {
                              setSelectedColor(val);
                              setResultProject(null);
                            }}
                          />
                        </>
                      ) : activeSchool === "planning" ? (
                        <>
                          {/* 1. Góc nhìn */}
                          <CustomDropdown
                            label={t("create.view")}
                            value={selectedView}
                            options={locOpts(PLANNING_VIEW_OPTIONS)}
                            onChange={(val) => {
                              setSelectedView(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 2. Mật độ */}
                          <CustomDropdown
                            label={t("create.density")}
                            value={selectedDensity}
                            options={locOpts(PLANNING_DENSITY_OPTIONS)}
                            onChange={(val) => {
                              setSelectedDensity(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 3. Bối cảnh */}
                          <CustomDropdown
                            label={t("create.context")}
                            value={selectedContext}
                            options={locOpts(PLANNING_CONTEXT_OPTIONS)}
                            onChange={(val) => {
                              setSelectedContext(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 4. Ánh sáng */}
                          <CustomDropdown
                            label={t("create.lighting")}
                            value={selectedLighting}
                            options={locOpts(PLANNING_LIGHTING_OPTIONS)}
                            onChange={(val) => {
                              setSelectedLighting(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 5. Thời tiết */}
                          <CustomDropdown
                            label={t("create.weather")}
                            value={selectedWeather}
                            options={locOpts(PLANNING_WEATHER_OPTIONS)}
                            onChange={(val) => {
                              setSelectedWeather(val);
                              setResultProject(null);
                            }}
                          />
                        </>
                      ) : activeTab === "render_floorplan" && activeSchool === "architecture" ? (
                        <>
                          {/* 1. Loại công trình */}
                          <CustomDropdown
                            label={t("create.buildingType")}
                            value={selectedRoom}
                            options={locOpts(availableRoomTypes)}
                            onChange={(val) => {
                              setSelectedRoom(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 2. Khu vực */}
                          <CustomDropdown
                            label={t("create.area")}
                            value={selectedContext}
                            options={locOpts(CONTEXT_OPTIONS)}
                            onChange={(val) => {
                              setSelectedContext(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 3. Thời gian */}
                          <CustomDropdown
                            label={t("create.time")}
                            value={selectedLighting}
                            options={locOpts(LIGHTING_OPTIONS)}
                            onChange={(val) => {
                              setSelectedLighting(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 4. Thời tiết */}
                          <CustomDropdown
                            label={t("create.weather")}
                            value={selectedWeather}
                            options={locOpts(WEATHER_OPTIONS)}
                            onChange={(val) => {
                              setSelectedWeather(val);
                              setResultProject(null);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          {/* 1. Loại công trình */}
                          <CustomDropdown
                            label={t("create.buildingType")}
                            value={selectedRoom}
                            options={locOpts(availableRoomTypes)}
                            onChange={(val) => {
                              setSelectedRoom(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 2. Phong cách */}
                          <CustomDropdown
                            label={t("create.style")}
                            value={selectedStyle}
                            options={locOpts(availableDesignStyles)}
                            onChange={(val) => {
                              setSelectedStyle(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 3. Góc nhìn */}
                          <CustomDropdown
                            label={t("create.view")}
                            value={selectedView}
                            options={locOpts(VIEW_OPTIONS)}
                            onChange={(val) => {
                              setSelectedView(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 4. Bối cảnh */}
                          <CustomDropdown
                            label={t("create.context")}
                            value={selectedContext}
                            options={locOpts(CONTEXT_OPTIONS)}
                            onChange={(val) => {
                              setSelectedContext(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 5. Ánh sáng */}
                          <CustomDropdown
                            label={t("create.lighting")}
                            value={selectedLighting}
                            options={locOpts(LIGHTING_OPTIONS)}
                            onChange={(val) => {
                              setSelectedLighting(val);
                              setResultProject(null);
                            }}
                          />

                          {/* 6. Thời tiết */}
                          <CustomDropdown
                            label={t("create.weather")}
                            value={selectedWeather}
                            options={locOpts(WEATHER_OPTIONS)}
                            onChange={(val) => {
                              setSelectedWeather(val);
                              setResultProject(null);
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                  )}

                  {/* Prompts notes textarea input */}
                  {!isReRenderTool && !isUpscaleTool && !isLayoutCreatorTool && !isPosterTool && !isBlueprintTool && !isTechnicalDrawingTool && !isDiagramTool && !isMoodboardTool && (
                  <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                    <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                      <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                        4
                      </span>
                      {t("create.specialReq")}
                    </h2>
                    <div className="space-y-1.5">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={t("create.notesPlaceholder")}
                        rows={3}
                        className="w-full bg-[#080B11]/80 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition leading-relaxed"
                      />
                    </div>
                  </div>
                  )}

                  {/* 2. Mô tả ý tưởng (chỉ áp dụng cho Tạo Moodboard) */}
                  {isMoodboardTool && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                        <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                          2
                        </span>
                        {t("create.ideaDesc")}
                      </h2>
                      <div className="space-y-1.5">
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder={t("create.moodboardPlaceholder")}
                          rows={4}
                          className="w-full bg-[#080B11]/80 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tải lên ảnh tham chiếu section */}
                  {(activeTab === "render_photo" || activeTab === "renovate_ai") && (
                    <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                      <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                        <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                          5
                        </span>
                        {t("create.refUploadTitle")}
                      </h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {t("create.refUploadDesc")}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {refImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-800 group bg-[#080B11]/80">
                            <img src={img} alt={`Reference ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setRefImages(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-500 text-white rounded-full p-1.5 transition opacity-0 group-hover:opacity-100 shadow-md"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute bottom-1.5 left-1.5 bg-black/60 px-2 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                              {t("create.image")} {idx + 1}
                            </div>
                          </div>
                        ))}
                        
                        {refImages.length < 3 && (
                          <label className="relative aspect-square rounded-xl border border-dashed border-slate-800 hover:border-violet-500 bg-[#080B11]/50 hover:bg-violet-500/5 flex flex-col items-center justify-center cursor-pointer transition text-center p-2 group">
                            <FileImage className="w-6 h-6 text-slate-500 mb-1.5 group-hover:text-violet-400" />
                            <span className="text-[10px] font-bold text-slate-400">{t("create.upload.small")}</span>
                            <span className="text-[9px] text-slate-600 mt-0.5">({refImages.length}/3)</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleRefImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* SHARED SECTION: ASPECT RATIOS AND QUALITY SELECTOR */}
              <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
                {/* 6.1 Tỉ Lệ Khung Hình */}
                <div className="space-y-3">
                  <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                    <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                      {(activeTab === "render_photo" || activeTab === "renovate_ai") ? "6" : (activeTab === "sync_view" || activeTab === "edit_photo" || isSketchNotesTool ? "3" : "5")}
                    </span>
                    {t("create.aspectRatio")}
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {ASPECT_RATIO_OPTIONS.map((opt) => {
                      const isSelected = selectedAspectRatio === opt.id;
                      
                      // Custom mini box representation for ratio preview
                      const renderRatioBox = () => {
                        if (opt.id === "1:1") {
                          return <div className={`w-5 h-5 border-2 ${isSelected ? 'border-violet-400' : 'border-slate-500'} rounded-sm shrink-0 transition`} />;
                        }
                        if (opt.id === "16:9") {
                          return <div className={`w-7 h-4 border-2 ${isSelected ? 'border-violet-400' : 'border-slate-500'} rounded-sm shrink-0 transition`} />;
                        }
                        if (opt.id === "4:3") {
                          return <div className={`w-6 h-4.5 border-2 ${isSelected ? 'border-violet-400' : 'border-slate-500'} rounded-sm shrink-0 transition`} />;
                        }
                        if (opt.id === "9:16") {
                          return <div className={`w-3.5 h-6 border-2 ${isSelected ? 'border-violet-400' : 'border-slate-500'} rounded-sm shrink-0 transition`} />;
                        }
                        // 3:4
                        return <div className={`w-4.5 h-6 border-2 ${isSelected ? 'border-violet-400' : 'border-slate-500'} rounded-sm shrink-0 transition`} />;
                      };

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedAspectRatio(opt.id);
                            setResultProject(null);
                          }}
                          className={`p-3.5 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition duration-150 relative ${
                            isSelected
                              ? "border-violet-500 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                              : "border-slate-800 hover:border-slate-700 text-slate-400 hover:bg-[#0B0F19]/40"
                          }`}
                        >
                          <div className="h-7 flex items-center justify-center">
                            {renderRatioBox()}
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold leading-tight">{lang === "en" && opt.nameEn ? opt.nameEn : opt.name}</div>
                            <div className="text-[9px] text-slate-500 leading-normal font-medium">{lang === "en" && opt.descriptionEn ? opt.descriptionEn : opt.description}</div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAspectRatio !== "1:1" && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 text-[10px] text-amber-400 font-medium leading-relaxed mt-2 flex items-start gap-2 shadow-sm animate-fade-in">
                      <span className="text-amber-400 shrink-0 select-none">⚠️</span>
                      <span>
                        <strong>{t("create.noteLabel")}</strong> {t("create.aspectWarn")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Số ảnh cần tạo — mọi tab/phân hệ, trừ Đồng Bộ View, Chỉnh Sửa Ảnh và Sửa Bằng
                    Ghi Chú (những tab này đã có bộ đếm riêng trong "Lựa chọn Model & Số lượng"). */}
                {!(activeTab === "sync_view" || activeTab === "edit_photo" || isSketchNotesTool) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      {t("create.imageCount")}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setRenderPhotoCount(count)}
                          className={`py-2.5 rounded-xl border text-sm font-black text-center transition duration-150 ${
                            renderPhotoCount === count
                              ? "border-violet-500 bg-violet-500/10 text-white shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                              : "border-slate-800 hover:border-slate-700 text-slate-400 hover:bg-[#0B0F19]/40"
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!isUpscaleTool && (
                  <>
                    {/* Divider */}
                    <div className="border-t border-slate-800/80 my-2" />

                    {/* 6.2 Chất Lượng & Chi Phí */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        {t("create.qualityTitle")}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {QUALITY_OPTIONS.map((q) => {
                          const isSelected = selectedQuality === q.id;
                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => {
                                setSelectedQuality(q.id);
                                setResultProject(null);
                              }}
                              className={`p-3 rounded-xl border text-left flex justify-between items-center transition duration-150 ${
                                isSelected
                                  ? "border-amber-500 bg-amber-500/5 text-white shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                                  : "border-slate-800 hover:border-slate-700 text-slate-400 hover:bg-[#0B0F19]/40"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                                  {lang === "en" && q.nameEn ? q.nameEn : q.name}
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-normal font-medium">{lang === "en" && q.descriptionEn ? q.descriptionEn : q.description}</div>
                              </div>
                              <div className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1.5 rounded-lg border transition ${
                                isSelected
                                  ? "bg-amber-400/10 text-amber-400 border-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]"
                                  : "bg-slate-900 text-slate-400 border-slate-800"
                              }`}>
                                <Coins className="w-3.5 h-3.5 shrink-0" />
                                {q.cost} cr
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SHARED SECTION: MODEL SELECTOR (From photo 4 and 5) */}
              {(activeTab === "sync_view" || activeTab === "edit_photo" || isSketchNotesTool) && (
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
                  <h2 className="text-sm font-black text-white flex items-center gap-2.5 uppercase tracking-wider">
                    <span className="w-5.5 h-5.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center text-xs font-black">
                      4
                    </span>
                    {t("create.modelQty")}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Model engine — only one model is actually wired up (Gemini / "Nano Banana") */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Model Engine</label>
                      <div className="flex-1 bg-violet-500/10 border border-violet-500 text-violet-400 rounded-xl p-2.5 text-xs font-black text-center">
                        Gemini 2.5 Multi-Modal (Nano Banana)
                      </div>
                    </div>

                    {/* Image counts */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t("create.imageQty")}</label>
                      <div className="grid grid-cols-4 gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                        {[1, 2, 3, 4].map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => (activeTab === "sync_view" ? setSyncCount(count) : setEditCount(count))}
                            className={`py-1 rounded-lg text-xs font-bold text-center transition ${
                              (activeTab === "sync_view" ? syncCount : editCount) === count
                                ? "bg-violet-600 text-white"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lựa Chọn Model (chỉ áp dụng cho Tạo Moodboard) */}
              {isMoodboardTool && (
                <div className="bg-[#111827]/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                    {t("create.modelChoose")}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <div className="py-2.5 rounded-lg text-xs font-black text-center bg-slate-800 text-white">
                      Nano Banana
                    </div>
                    <div
                      className="py-2.5 rounded-lg text-xs font-bold text-center text-slate-600 cursor-not-allowed"
                      title={t("create.comingSoon")}
                    >
                      GPT 2
                    </div>
                  </div>
                </div>
              )}

              {/* Error boundary banner */}
              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-900/50 text-rose-300 p-4 rounded-xl text-xs font-medium flex items-start gap-2.5 shadow-lg">
                  <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p>{errorMessage}</p>
                    {errorMessage.includes("Không đủ credit") && (
                      <button
                        onClick={onNavigateToPricing}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-black px-4 py-2 rounded-lg hover:from-amber-400 hover:to-amber-500 transition shadow-md"
                      >
                        {t("create.buyCredits")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* RENDER EXECUTION BUTTON */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black uppercase tracking-widest py-4.5 rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.3)] transition duration-300 active:scale-99 flex items-center justify-center gap-2.5 text-xs ${
                  isLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <Sparkles className="w-5 h-5 fill-white/10" />
                {activeTab === "sync_view"
                  ? t("create.btn.sync")
                  : (activeTab === "edit_photo" || isSketchNotesTool)
                  ? t("create.btn.edit")
                  : t("create.btn.render")
                }
                <span className="mx-1.5 opacity-50">•</span>
                <span className="flex items-center gap-1 bg-zinc-950/20 px-2.5 py-1 rounded-lg text-[11px] font-black">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {currentQualityOption.cost * activeRenderCount} Credits
                </span>
              </button>
            </div>

            {/* RIGHT OUTPUT PREVIEW & LIVE WORKSPACE (MATCHING THE SCREENSHOTS EXACTLY) */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-[#111827]/40 rounded-3xl border border-slate-800/90 p-6 min-h-[500px] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>

                {isLoading ? (
                  /* Futuristic Rendering Loader Screen (From the screenshots) */
                  <div className="space-y-6 max-w-sm w-full relative z-10 p-4">
                    <div className="relative flex items-center justify-center mx-auto w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-[3px] border-slate-800"></div>
                      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-violet-400 border-r-fuchsia-400 animate-spin"></div>
                      <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 animate-pulse">
                        <Zap className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                        Opzen AI Render Node Connected
                      </div>
                      <h3 className="font-black text-white text-base">{t("create.loading.title")}</h3>
                      
                      {/* Technical terminal log */}
                      <div className="bg-[#080B11] border border-slate-800 p-3.5 rounded-xl font-mono text-[10px] text-violet-400 text-left space-y-1 shadow-inner h-24 overflow-hidden">
                        <div className="text-slate-500 font-bold uppercase tracking-wider border-b border-slate-800/50 pb-1 mb-1 flex justify-between">
                          <span>Log monitor</span>
                          <span className="animate-pulse">● LIVE</span>
                        </div>
                        <div className="text-fuchsia-400 font-semibold animate-fade-in truncate">
                          {(lang === "en" ? LOADING_MESSAGES_EN : LOADING_MESSAGES)[loadingStep]}
                        </div>
                        <div className="text-slate-500">
                          &gt; Model parameters loaded: Gemini Multi-Modal Engine
                        </div>
                        <div className="text-slate-500">
                          &gt; Resolution requested: {currentResolutionOption.dimensions}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-normal">
                        {t("create.loading.desc")}
                      </p>
                    </div>
                  </div>
                ) : resultProject ? (
                  /* Output success result comparison viewport */
                  <div className="w-full space-y-6 relative z-10">
                    <div className="text-left pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t("create.result.done")}
                        </div>
                        <h3 className="font-black text-white text-lg">{t("create.result.title")}</h3>
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t("create.style")}: {localizedName(currentStyleOption, lang)}</p>
                      </div>

                      {/* Action buttons matching the user's uploaded reference image */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSyncView(!isSyncView)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                            isSyncView
                              ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/15"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                          }`}
                          title={t("create.result.syncTitle")}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncView ? 'animate-spin' : ''}`} />
                          <span>View Sync</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            void downloadImage(resultProject.afterImage, `opzen-caitaonha-${resultProject.id}.png`);
                          }}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                          title={t("create.result.downloadTitle")}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t("create.result.download")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsLightboxOpen(true)}
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
                          title={t("create.result.zoomTitle")}
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>{t("create.result.zoom")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsFavorited(!isFavorited)}
                          className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                            isFavorited
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse"
                              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                          }`}
                          title={t("create.result.favTitle")}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-amber-400 text-amber-400' : ''}`} />
                          <span>{t("create.result.fav")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Batch results picker — shown when "Số lượng ảnh render" > 1 produced multiple images */}
                    {batchResults.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {t("create.result.pickPrefix")}{batchResults.length} {t("create.result.pickSuffix")}
                        </p>
                        <div className="grid grid-cols-4 gap-2.5">
                          {batchResults.map((project) => (
                            <button
                              key={project.id}
                              type="button"
                              onClick={() => setResultProject(project)}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                                resultProject.id === project.id
                                  ? "border-violet-500 shadow-lg shadow-violet-600/20"
                                  : "border-slate-800 hover:border-slate-600"
                              }`}
                            >
                              <img src={project.afterImage} alt={t("slider.afterAlt")} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interactive Slider/Sync Area */}
                    <div className={`border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative bg-[#080B11] ${getAspectWrapperClass(resultProject.aspectRatio || selectedAspectRatio)}`}>
                      {isSyncView ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
                          <div className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square md:aspect-auto">
                            <img
                              src={resultProject.beforeImage}
                              alt={t("slider.beforeAlt")}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-3 left-3 bg-zinc-950/85 text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-slate-800 uppercase tracking-widest z-10">
                              {t("slider.before")}
                            </span>
                          </div>
                          <div className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square md:aspect-auto">
                            <img
                              src={resultProject.afterImage}
                              alt={t("slider.afterAlt")}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-widest z-10">
                              {t("slider.after")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <BeforeAfterSlider
                          before={resultProject.beforeImage}
                          after={resultProject.afterImage}
                          aspectRatio={getAspectClass(resultProject.aspectRatio || selectedAspectRatio)}
                        />
                      )}
                    </div>

                    {/* Material reports */}
                    <div className="text-left space-y-2 bg-[#0B0F19]/90 p-4 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("create.result.analysisTitle")}</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                        {t("create.result.analysisText")}
                      </div>
                    </div>

                    {/* High resolution PNG download */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => {
                          void downloadImage(resultProject.afterImage, `opzen-caitaonha-${resultProject.id}.png`);
                        }}
                        className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10"
                      >
                        <Download className="w-4 h-4 stroke-[3]" />
                        {t("create.result.downloadHigh")}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard empty workstation placeholder with "Xem hướng dẫn chi tiết" from photo 4 and 5 */
                  <div className="space-y-6 max-w-sm p-4 relative z-10 w-full">
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-violet-400 mx-auto shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-pulse">
                      <Compass className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-white text-lg">{t("create.empty.title")}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold">
                        {t("create.empty.desc")}
                      </p>
                    </div>

                    {/* Guided tutorial button from screenshots */}
                    <div className="pt-3 space-y-2">
                      <button
                        onClick={() => {
                          alert(t("create.tutorialAlert"));
                        }}
                        className="bg-violet-600 hover:bg-violet-500 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition duration-200 shadow-md inline-flex items-center gap-2"
                      >
                        <Info className="w-4 h-4" />
                        {t("create.tutorial")}
                      </button>
                      <p className="text-[10px] text-slate-500 font-bold block">{t("create.forNewUsers")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* GRID CATALOG VIEWS FOR EACH SUB-TAB (Matching the beautiful grid views from screenshots) */
        <div className="space-y-8 animate-fade-in">
          
          {/* TAB 1: RENDER ẢNH (Image Render Grid) */}
          {activeTab === "render_photo" && (
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto py-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t("create.catalog.photoTitle")}</h2>
                <p className="text-slate-400 text-sm">
                  {t("create.catalog.photoSub")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderPhotoTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedRoom(tool.id === "interior" ? "living_room" : "office");
                      setNotes("");
                      setActiveTool({
                        id: tool.id,
                        tab: "render_photo",
                        name: `Render ${tool.name}`, // tool.name đã theo ngôn ngữ (t)
                        description: tool.description,
                        iconName: tool.iconName
                      });
                    }}
                    className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-slate-800/80 cursor-pointer group hover:border-violet-500/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
                  >
                    {/* Background image overlay */}
                    <img
                      src={tool.bgImage}
                      alt={tool.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-slate-950/40 to-transparent"></div>

                    {/* Content inside card */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-left space-y-2.5 z-10">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/90 text-white flex items-center justify-center shadow-md">
                        {getIconComponent(tool.iconName, "w-5 h-5")}
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">{tool.name}</h3>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">
                        {tool.description}
                      </p>
                      <div className="pt-2 text-xs font-black text-violet-400 group-hover:text-violet-300 flex items-center gap-1.5 transition-colors">
                        {t("create.startNow")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RENDER MẶT BẰNG (Floorplan Render Grid) */}
          {activeTab === "render_floorplan" && (
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto py-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t("create.catalog.fpTitle")}</h2>
                <p className="text-slate-400 text-sm">
                  {t("create.catalog.fpSub")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renderFloorplanTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedRoom("living_room");
                      setNotes(t("create.seed.floorplan"));
                      setActiveTool({
                        id: tool.id,
                        tab: "render_floorplan",
                        name: tool.name,
                        description: tool.description,
                        iconName: tool.iconName
                      });
                    }}
                    className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-slate-800/80 cursor-pointer group hover:border-violet-500/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
                  >
                    {/* Background floorplan */}
                    <img
                      src={tool.bgImage}
                      alt={tool.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 saturate-50"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-slate-950/50 to-transparent"></div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-left space-y-2.5 z-10">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/90 text-white flex items-center justify-center shadow-md">
                        {getIconComponent(tool.iconName, "w-5 h-5")}
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">{tool.name}</h3>
                      <p className="text-[11px] text-slate-300 leading-normal line-clamp-3">
                        {tool.description}
                      </p>
                      <div className="pt-2 text-xs font-black text-violet-400 group-hover:text-violet-300 flex items-center gap-1.5 transition-colors">
                        {t("create.startNow")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CẢI TẠO AI (AI Renovation Grid) */}
          {activeTab === "renovate_ai" && (
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto py-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t("create.catalog.renovTitle")}</h2>
                <p className="text-slate-400 text-sm">
                  {t("create.catalog.renovSub")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {renovateAiTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedRoom("living_room");
                      setNotes(t("create.seed.renovate"));
                      setActiveTool({
                        id: tool.id,
                        tab: "renovate_ai",
                        name: tool.name,
                        description: tool.description,
                        iconName: tool.iconName
                      });
                    }}
                    className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-slate-800/80 cursor-pointer group hover:border-violet-500/80 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300"
                  >
                    <img
                      src={tool.bgImage}
                      alt={tool.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-slate-950/40 to-transparent"></div>

                    {/* Split line decoration mimicking before/after */}
                    <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/20 backdrop-blur-sm group-hover:scale-y-110 transition-transform"></div>

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-left space-y-2.5 z-10">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/90 text-white flex items-center justify-center shadow-md">
                        {getIconComponent(tool.iconName, "w-5 h-5")}
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">{tool.name}</h3>
                      <p className="text-[11px] text-slate-300 leading-normal line-clamp-3">
                        {tool.description}
                      </p>
                      <div className="pt-2 text-xs font-black text-violet-400 group-hover:text-violet-300 flex items-center gap-1.5 transition-colors">
                        {t("create.startNow")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: TÍNH NĂNG MỞ RỘNG (15 Advanced Tools Grid) */}
          {activeTab === "extended_features" && (
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto py-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t("create.ext.header")}</h2>
                <p className="text-slate-400 text-sm">
                  {t("create.ext.sub")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {extendedFeatures.map((feat) => (
                  <div
                    key={feat.id}
                    onClick={() => {
                      setSelectedImage(null);
                      setNotes("");
                      setActiveTool({
                        id: feat.id,
                        tab: "extended_features",
                        name: feat.name,
                        description: feat.description,
                        iconName: feat.iconName
                      });
                    }}
                    className="p-5 rounded-2xl bg-[#111827]/40 border border-slate-800/85 hover:border-violet-500/80 hover:bg-[#111827]/80 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] transition-all duration-200 cursor-pointer text-left space-y-3 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-violet-400 flex items-center justify-center group-hover:bg-violet-600/10 transition-colors">
                      {getIconComponent(feat.iconName, "w-4.5 h-4.5")}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider group-hover:text-violet-400 transition-colors">
                        {feat.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 font-medium">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: THƯ VIỆN MẪU (Curated prompt/reference posts) */}
          {activeTab === "template_library" && (
            <div className="space-y-6">
              <div className="text-center space-y-2 max-w-2xl mx-auto py-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">{t("create.tpl.title")}</h2>
                <p className="text-slate-400 text-sm">
                  {t("create.tpl.sub")}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {TEMPLATE_POSTS.map((post) => (
                  <TemplatePostCard
                    key={post.id}
                    post={post}
                    onUsePrompt={(prompt) => {
                      skipNextEditPromptResetRef.current = true;
                      setEditPrompt(prompt);
                      setEditMarkers([]);
                      setSelectedImage(null);
                      setResultProject(null);
                      setActiveTab("edit_photo");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* QUICK SESSION HISTORY SCROLLABLE COMPONENT */}
      {showHistorySection && sessionHistory.length > 0 && (
        <div id="session-history-view" className="bg-[#111827]/40 border border-slate-800/80 p-6 rounded-3xl text-left space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-violet-400" />
              {t("create.history.titlePrefix")}{sessionHistory.length})
            </span>
            <button
              onClick={() => {
                if (confirm(t("create.history.clearConfirm"))) {
                  setSessionHistory([]);
                }
              }}
              className="text-[10px] text-slate-500 hover:text-rose-400 font-bold uppercase transition"
            >
              {t("create.history.clear")}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {sessionHistory.map((proj) => (
              <button
                key={proj.id}
                onClick={() => {
                  // Preload parameters back to allow comparison and tweaking
                  setSelectedImage(proj.beforeImage);
                  setSelectedStyle(proj.styleId);
                  setSelectedRoom(proj.roomTypeId);
                  setResultProject(proj);
                  
                  // Open corresponding design workstation
                  setActiveTool({
                    id: "interior",
                    tab: "render_photo",
                    name: t("create.history.restoreName"),
                    description: t("create.history.restoreDesc"),
                    iconName: "Sofa"
                  });
                }}
                className={`aspect-square rounded-xl overflow-hidden border transition relative group ${
                  resultProject?.id === proj.id 
                    ? "border-violet-500 scale-95 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                    : "border-slate-800 hover:border-slate-700"
                }`}
                title={t("create.history.restoreTitle")}
              >
                <img src={proj.afterImage} alt="history item" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL WITH DYNAMIC ASPECT RATIO */}
      {isLightboxOpen && resultProject && (
        <div className="fixed inset-0 z-50 bg-[#05070c]/95 backdrop-blur-xl flex flex-col justify-between p-6 md:p-8 animate-fade-in">
          {/* Header Controls */}
          <div className="flex justify-between items-center w-full border-b border-slate-800 pb-4">
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-wider">{t("create.lightbox.title")}</h4>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">
                {t("create.lightbox.ratio")}: {resultProject.aspectRatio || selectedAspectRatio} • {t("create.style")}: {localizedName(currentStyleOption, lang)}
              </p>
            </div>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-full hover:bg-slate-800 transition shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Immersive Main Display Area */}
          <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
            <div className={`shadow-3xl rounded-3xl overflow-hidden border border-slate-800/80 bg-[#080B11] ${getAspectWrapperClass(resultProject.aspectRatio || selectedAspectRatio)} max-h-[75vh] flex flex-col`}>
              {isSyncView ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 h-full overflow-y-auto">
                  <div className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square md:aspect-auto">
                    <img
                      src={resultProject.beforeImage}
                      alt={t("slider.beforeAlt")}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 bg-zinc-950/85 text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-slate-800 uppercase tracking-widest z-10">
                      {t("slider.before")}
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-slate-900 aspect-square md:aspect-auto">
                    <img
                      src={resultProject.afterImage}
                      alt={t("slider.afterAlt")}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md uppercase tracking-widest z-10">
                      {t("slider.after")}
                    </span>
                  </div>
                </div>
              ) : (
                <BeforeAfterSlider
                  before={resultProject.beforeImage}
                  after={resultProject.afterImage}
                  aspectRatio={getAspectClass(resultProject.aspectRatio || selectedAspectRatio)}
                  className="h-full"
                />
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsSyncView(!isSyncView)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition border flex items-center justify-center gap-2 ${
                isSyncView 
                  ? "bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-500/10" 
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncView ? 'animate-spin' : ''}`} />
              VIEW SYNC: {isSyncView ? t("create.lightbox.viewSyncParallel") : t("create.lightbox.viewSyncSlider")}
            </button>

            <button
              onClick={() => {
                void downloadImage(resultProject.afterImage, `opzen-caitaonha-${resultProject.id}.png`);
              }}
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-2xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              {t("create.lightbox.download")}
            </button>

            <button
              onClick={() => setIsLightboxOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center"
            >
              {t("create.lightbox.close")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
