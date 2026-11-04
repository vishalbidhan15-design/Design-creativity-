import React, { useRef, useState } from 'react';
import { SlideMediaConfig, ThemePalette } from '../types/presentation';
import {
  DEFAULT_SLIDE_MEDIA_CONFIG,
  HeadlineAnimationStyle,
  MEDIA_FILTER_PRESETS,
  SAMPLE_MEDIA_ASSETS,
} from '../utils/deckEngine';
import { AnimatedHeadline } from './AnimatedHeadline';
import { SlideMediaFrame } from './SlideMediaFrame';
import { Film, Image as ImageIcon, Upload, Sliders, ArrowUpRight, Sparkles } from 'lucide-react';

interface MediaStudioSectionProps {
  theme: ThemePalette;
  headlineAnimation: HeadlineAnimationStyle;
  enable3DDesignMotion: boolean;
  onApplyMediaToActiveSlide: (mediaConfig: SlideMediaConfig) => void;
}

export const MediaStudioSection: React.FC<MediaStudioSectionProps> = ({
  theme,
  headlineAnimation,
  enable3DDesignMotion,
  onApplyMediaToActiveSlide,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [labMedia, setLabMedia] = useState<SlideMediaConfig>({
    ...DEFAULT_SLIDE_MEDIA_CONFIG,
    mode: 'video',
    url: 'procedural://cinema-prism',
    caption: 'Live 4K Showreel & Custom Photo Grading Lab · Ready for Slide Injection',
    brightness: 104,
    contrast: 108,
    saturation: 112,
    zoom: 1,
    borderRadiusPx: 6,
  });
  const [appliedBanner, setAppliedBanner] = useState<string | null>(null);

  const updateLabMedia = (patch: Partial<SlideMediaConfig>) => {
    setLabMedia((prev) => ({ ...prev, ...patch }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const objectUrl = URL.createObjectURL(file);
    updateLabMedia({
      mode: isVideo ? 'video' : 'photo',
      url: objectUrl,
      caption: `${file.name} · Custom Uploaded ${isVideo ? 'Video' : 'Photo'}`,
    });
  };

  const handleSendToSlide = () => {
    onApplyMediaToActiveSlide(labMedia);
    setAppliedBanner(
      `Injected "${labMedia.caption}" (${labMedia.mode.toUpperCase()}) into the active Studio slide.`
    );
    setTimeout(() => setAppliedBanner(null), 4000);
  };

  return (
    <section
      id="media-studio-lab"
      className="scroll-mt-16 py-12 border-t border-slate-200/80 bg-white/90"
    >
      <div className="max-w-[1360px] mx-auto px-6 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              03. Interactive Photo & Video Customization Lab
            </p>
            <AnimatedHeadline
              as="h2"
              text="Upload, Grade, and Frame Custom Videos & Photos Inside Any Template"
              animationStyle={headlineAnimation}
              primaryColorHex="#0F172A"
              accentColorHex="#2563EB"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display"
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              Every template supports real-time photo and video editing. Upload your own product reels or photography, apply cinema LUT color grading, adjust zoom and framing, and push directly to your active presentation slide.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
              Upload Your Photo / Video
            </button>
            <button
              type="button"
              onClick={handleSendToSlide}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              Apply Media to Active Studio Slide
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {appliedBanner && (
          <div
            role="status"
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-medium flex items-center justify-between"
          >
            <span>{appliedBanner}</span>
            <a
              href="#studio-workspace"
              className="text-blue-300 hover:text-white underline ml-4 whitespace-nowrap"
            >
              View on Studio Slide
            </a>
          </div>
        )}

        {/* Interactive 12-Col Photo & Video Grading Workbench */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Live 3D Media Stage Preview */}
          <div className="lg:col-span-7 space-y-4 preserve-3d">
            <div
              className={`p-5 bg-slate-950 border border-slate-800 space-y-3 ${
                enable3DDesignMotion ? 'animate-headline-depth' : ''
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">
                    Live Optical & Video Color-Grading Monitor
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono uppercase text-blue-400">
                    {labMedia.mode} Mode
                  </span>
                </div>
                <div className="font-mono tabular-nums text-[11px] text-slate-400">
                  Brightness {labMedia.brightness}% · Contrast {labMedia.contrast}% · Sat{' '}
                  {labMedia.saturation}% · Zoom {labMedia.zoom.toFixed(2)}x
                </div>
              </div>

              <div className="aspect-video w-full overflow-hidden border border-slate-800 bg-slate-900">
                <SlideMediaFrame
                  media={labMedia}
                  theme={theme}
                  editable={true}
                  onUpdateMedia={updateLabMedia}
                />
              </div>

              {/* Sample Studio Assets Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  Switch Studio Preset Asset:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {SAMPLE_MEDIA_ASSETS.map((asset) => {
                    const isCurrent = labMedia.url === asset.url;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() =>
                          updateLabMedia({
                            mode: asset.type,
                            url: asset.url,
                            caption: asset.caption,
                          })
                        }
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {asset.type === 'video' ? (
                          <Film className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <ImageIcon className="w-3 h-3" aria-hidden="true" />
                        )}
                        {asset.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Real-Time Photo & Video Editor Controls */}
          <div className="lg:col-span-5 bg-white border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-700" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900 font-display">
                  Photo & Video Grading Controls
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                Real-Time GPU Pipeline
              </span>
            </div>

            {/* 1-Click Color Filter LUT Presets */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                Cinema LUT Color Presets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MEDIA_FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      updateLabMedia({
                        brightness: preset.brightness,
                        contrast: preset.contrast,
                        saturation: preset.saturation,
                        sepia: preset.sepia,
                        blurPx: preset.blurPx,
                      })
                    }
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Fine-Grain Optical Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <label htmlFor="lab-brightness">Brightness</label>
                  <span className="font-mono tabular-nums">{labMedia.brightness}%</span>
                </div>
                <input
                  id="lab-brightness"
                  type="range"
                  min={50}
                  max={150}
                  value={labMedia.brightness}
                  onChange={(e) =>
                    updateLabMedia({ brightness: Number(e.target.value) })
                  }
                  className="w-full accent-blue-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <label htmlFor="lab-contrast">Contrast</label>
                  <span className="font-mono tabular-nums">{labMedia.contrast}%</span>
                </div>
                <input
                  id="lab-contrast"
                  type="range"
                  min={50}
                  max={160}
                  value={labMedia.contrast}
                  onChange={(e) =>
                    updateLabMedia({ contrast: Number(e.target.value) })
                  }
                  className="w-full accent-blue-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <label htmlFor="lab-saturation">Saturation</label>
                  <span className="font-mono tabular-nums">{labMedia.saturation}%</span>
                </div>
                <input
                  id="lab-saturation"
                  type="range"
                  min={0}
                  max={180}
                  value={labMedia.saturation}
                  onChange={(e) =>
                    updateLabMedia({ saturation: Number(e.target.value) })
                  }
                  className="w-full accent-blue-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                  <label htmlFor="lab-zoom">Optical Zoom</label>
                  <span className="font-mono tabular-nums">
                    {labMedia.zoom.toFixed(2)}x
                  </span>
                </div>
                <input
                  id="lab-zoom"
                  type="range"
                  min={1}
                  max={1.6}
                  step={0.05}
                  value={labMedia.zoom}
                  onChange={(e) =>
                    updateLabMedia({ zoom: Number(e.target.value) })
                  }
                  className="w-full accent-blue-700"
                />
              </div>
            </div>

            {/* Caption & Framing Controls */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div>
                <label
                  htmlFor="lab-caption-input"
                  className="block text-[11px] font-medium text-slate-600 mb-1"
                >
                  Overlay Frame Caption & Credit
                </label>
                <input
                  id="lab-caption-input"
                  type="text"
                  value={labMedia.caption}
                  onChange={(e) => updateLabMedia({ caption: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateLabMedia({
                        objectFit:
                          labMedia.objectFit === 'cover' ? 'contain' : 'cover',
                      })
                    }
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded whitespace-nowrap shrink-0"
                  >
                    Fit: {labMedia.objectFit === 'cover' ? 'Cover Frame' : 'Contain'}
                  </button>
                  {labMedia.mode === 'video' && (
                    <button
                      type="button"
                      onClick={() =>
                        updateLabMedia({
                          videoPlaybackRate:
                            labMedia.videoPlaybackRate === 1
                              ? 1.5
                              : labMedia.videoPlaybackRate === 1.5
                              ? 0.5
                              : 1,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-800 rounded whitespace-nowrap shrink-0"
                    >
                      Speed: {labMedia.videoPlaybackRate}x
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSendToSlide}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
                >
                  Send to Active Slide
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Visual Customization Workflow Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 preserve-3d">
          <div
            className={`p-5 bg-white border border-slate-200 space-y-2 ${
              enable3DDesignMotion ? 'animate-headline-depth' : ''
            }`}
          >
            <div className="text-xs font-mono font-semibold text-blue-700">
              STEP 01 · SELECT ARCHITECTURE
            </div>
            <AnimatedHeadline
              as="h3"
              text="Choose from 12 Multi-Slide Industry Templates"
              animationStyle={headlineAnimation}
              primaryColorHex="#0F172A"
              accentColorHex="#2563EB"
              className="text-base font-bold text-slate-900 font-display"
            />
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick a domain-specific deck across Venture Pitch, Board Financials, Product Launch, Cinema Showreels, or Luxury Brand Dossiers and click "Edit Photo / Video".
            </p>
          </div>

          <div
            className={`p-5 bg-white border border-slate-200 space-y-2 ${
              enable3DDesignMotion ? 'animate-headline-depth' : ''
            }`}
            style={{ animationDelay: '140ms' }}
          >
            <div className="text-xs font-mono font-semibold text-blue-700">
              STEP 02 · UPLOAD & GRADE MEDIA
            </div>
            <AnimatedHeadline
              as="h3"
              text="Edit Your Own Video & Photography on the Slide"
              animationStyle={headlineAnimation}
              primaryColorHex="#0F172A"
              accentColorHex="#2563EB"
              className="text-base font-bold text-slate-900 font-display"
            />
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload local MP4/WebM video clips or high-res photos, apply 1-click cinema LUT filters, fine-tune contrast and optical zoom, and edit headlines directly on canvas.
            </p>
          </div>

          <div
            className={`p-5 bg-white border border-slate-200 space-y-2 ${
              enable3DDesignMotion ? 'animate-headline-depth' : ''
            }`}
            style={{ animationDelay: '280ms' }}
          >
            <div className="text-xs font-mono font-semibold text-blue-700">
              STEP 03 · PRESENT IN 3D OR EXPORT
            </div>
            <AnimatedHeadline
              as="h3"
              text="Launch Full-Screen 3D Deck or Export HTML & JSON"
              animationStyle={headlineAnimation}
              primaryColorHex="#0F172A"
              accentColorHex="#2563EB"
              className="text-base font-bold text-slate-900 font-display"
            />
            <p className="text-xs text-slate-600 leading-relaxed">
              Present immediately with interactive 3D spatial depth and kinetic typography, or export a self-contained HTML presentation bundle ready for board distribution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
