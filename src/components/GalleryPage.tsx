import React, { useState } from "react";
import { GeneratedProject } from "../types";
import { DESIGN_STYLES, ROOM_TYPES } from "../config";
import { Trash2, Download, Eye, Calendar, Tag, Compass, Sparkles, X, ChevronRight, Grid, Copy } from "lucide-react";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { useLanguage } from "../i18n/LanguageContext";

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
  return "max-w-2xl mx-auto w-full";
};

interface GalleryPageProps {
  projects: GeneratedProject[];
  onDeleteProject: (id: string) => void;
  onNavigateToCreate: () => void;
}

export default function GalleryPage({
  projects,
  onDeleteProject,
  onNavigateToCreate,
}: GalleryPageProps) {
  const { t, lang } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<GeneratedProject | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Reset copied status when changing selected project
  React.useEffect(() => {
    setCopied(false);
  }, [selectedProject]);

  const getStyleName = (styleId: string) => {
    return DESIGN_STYLES.find((s) => s.id === styleId)?.name || t("gallery.customStyle");
  };

  const getRoomName = (roomId: string) => {
    return ROOM_TYPES.find((r) => r.id === roomId)?.name || t("gallery.space");
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === "en" ? "en-US" : "vi-VN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const downloadImage = (base64Data: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16 text-slate-100">
      {/* Header and Call To Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="text-left space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <Grid className="w-7 h-7 text-teal-400" />
            {t("gallery.title")}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {t("gallery.subtitle")}
          </p>
        </div>

        {projects.length > 0 && (
          <button
            onClick={onNavigateToCreate}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.15)]"
          >
            <Sparkles className="w-4 h-4 fill-zinc-950/20" />
            {t("gallery.createNew")}
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        /* Empty State */
        <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6 bg-[#111827]/40">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-teal-400 mx-auto shadow-md">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-lg text-white">{t("gallery.emptyTitle")}</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-semibold">
              {t("gallery.emptyDesc")}
            </p>
          </div>
          <button
            onClick={onNavigateToCreate}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition duration-200 shadow-lg"
          >
            {t("gallery.emptyCta")}
          </button>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-[#111827]/50 rounded-2xl border border-slate-800/85 overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col group text-left"
            >
              {/* Image box with action overlays */}
              <div className="relative aspect-video bg-[#080B11] overflow-hidden">
                <img
                  src={project.afterImage}
                  alt="Renovated Space"
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay buttons on hover */}
                <div className="absolute inset-0 bg-[#080B11]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-10">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="bg-white text-zinc-950 px-4 py-2 rounded-xl hover:bg-slate-100 transition text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow"
                  >
                    <Eye className="w-4 h-4" /> {t("gallery.compareSlider")}
                  </button>
                  <button
                    onClick={() => downloadImage(project.afterImage, `opzen-after-${project.id}.png`)}
                    className="bg-[#111827] border border-slate-700 text-slate-200 p-2.5 rounded-xl hover:bg-slate-800 transition shadow"
                    title={t("gallery.downloadAfterTitle")}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition shadow"
                    title={t("gallery.deleteTitle")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 bg-[#080B11]/80 backdrop-blur-md text-teal-400 border border-teal-500/20 text-[10px] font-bold px-2.5 py-1 rounded-md z-10 uppercase tracking-wider">
                  {getRoomName(project.roomTypeId)}
                </div>
              </div>

              {/* Text content details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-base leading-snug line-clamp-1">
                    {getStyleName(project.styleId)}
                  </h3>

                  {project.notes ? (
                    <p className="text-xs text-slate-400 line-clamp-2 bg-[#080B11]/60 p-2.5 rounded-lg italic border border-slate-900 leading-normal">
                      &ldquo;{project.notes}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic leading-normal">
                      {t("gallery.defaultNote")}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                    {formatDate(project.createdAt)}
                  </span>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-teal-400 hover:text-teal-300 transition flex items-center gap-1 font-black"
                  >
                    {t("gallery.viewDetails")} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BEFORE / AFTER SLIDER MODAL (HIGH-TECH FLUID LIGHTBOX) */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-[#080B11]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[92vh]">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 bg-[#080B11]/80 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-full z-50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="text-left border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {getRoomName(selectedProject.roomTypeId)} &mdash; {getStyleName(selectedProject.styleId)}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedProject.id} • {t("gallery.renderedAt")}: {formatDate(selectedProject.createdAt)}
                </p>
              </div>

              {/* Slider Component */}
              <div className={`border border-slate-800 rounded-2xl overflow-hidden bg-[#080B11] ${getAspectWrapperClass(selectedProject.aspectRatio)}`}>
                <BeforeAfterSlider
                  before={selectedProject.beforeImage}
                  after={selectedProject.afterImage}
                  aspectRatio={getAspectClass(selectedProject.aspectRatio)}
                />
              </div>

              {selectedProject.notes && (
                <div className="text-left bg-[#080B11]/80 p-4 rounded-xl border border-slate-800/85">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {t("gallery.yourRequest")}
                  </span>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &ldquo;{selectedProject.notes}&rdquo;
                  </p>
                </div>
              )}

              {/* Detailed Prompt Section */}
              {selectedProject.prompt && (
                <div className="text-left bg-[#080B11]/80 p-4 rounded-xl border border-slate-800/85 space-y-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {t("gallery.detailedPrompt")}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedProject.prompt);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="text-[10px] font-black text-teal-400 hover:text-teal-300 transition uppercase tracking-wider flex items-center gap-1.5 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1.5 rounded-lg border border-teal-500/20"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? t("gallery.copied") : t("gallery.copyPrompt")}
                    </button>
                  </div>
                  <div className="max-h-[160px] overflow-y-auto rounded-lg bg-[#05070c] p-3.5 text-[11px] font-mono text-slate-300 leading-relaxed border border-slate-900 scrollbar-thin whitespace-pre-wrap select-all">
                    {selectedProject.prompt}
                  </div>
                </div>
              )}

              {/* Action Downloads */}
              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    downloadImage(selectedProject.beforeImage, `opzen-before-${selectedProject.id}.png`);
                  }}
                  className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition"
                >
                  {t("gallery.downloadBefore")}
                </button>
                <button
                  onClick={() => {
                    downloadImage(selectedProject.afterImage, `opzen-after-${selectedProject.id}.png`);
                  }}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-lg shadow-teal-500/10"
                >
                  {t("gallery.downloadAfter")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
