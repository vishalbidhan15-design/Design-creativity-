import React, { useState } from 'react';
import {
  AspectRatioFormat,
  SlideData,
  ThemePalette,
  TypographyPair,
} from '../types/presentation';
import {
  computeCard3DTiltTransform,
  DEFAULT_SLIDE_MEDIA_CONFIG,
  HeadlineAnimationStyle,
  SAMPLE_MEDIA_ASSETS,
} from '../utils/deckEngine';
import { SlideArtwork } from './SlideArtwork';
import { SlideMediaFrame } from './SlideMediaFrame';
import { AnimatedHeadline } from './AnimatedHeadline';

interface SlideCanvasProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  deckTitle: string;
  theme: ThemePalette;
  typography: TypographyPair;
  aspectRatio: AspectRatioFormat;
  showGridGuides?: boolean;
  editable?: boolean;
  compact?: boolean;
  headlineAnimation?: HeadlineAnimationStyle;
  enable3DDesignMotion?: boolean;
  onUpdateSlideField?: <K extends keyof SlideData>(field: K, value: SlideData[K]) => void;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  slideIndex,
  totalSlides,
  deckTitle,
  theme,
  typography,
  aspectRatio,
  showGridGuides = false,
  editable = false,
  compact = false,
  headlineAnimation = 'kinetic-3d-wave',
  enable3DDesignMotion = true,
  onUpdateSlideField,
}) => {
  const [pointerTiltCss, setPointerTiltCss] = useState<string | null>(null);

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '4:3'
      ? 'aspect-[4/3]'
      : 'aspect-[1.414/1]';

  const headingFontStyle = {
    fontFamily: typography.headingFontFamilyCss,
    color: theme.textPrimaryHex,
  };

  const maxWaterfallValue = Math.max(
    ...slide.waterfallBars.map((b) => b.primaryValue + b.secondaryValue),
    10
  );

  const containerPadding = compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6';
  const headlineSizeCover = compact
    ? 'text-lg sm:text-xl'
    : 'text-xl sm:text-2xl';
  const headlineSizeStandard = compact
    ? 'text-base sm:text-lg'
    : 'text-lg sm:text-xl';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3DDesignMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setPointerTiltCss(computeCard3DTiltTransform(normX, normY, compact ? 5 : 4, compact ? 6 : 8));
  };

  const handleMouseLeave = () => {
    setPointerTiltCss(null);
  };

  return (
    <div
      data-testid="active-slide-canvas"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${aspectClass} border transition-transform duration-150 overflow-hidden flex flex-col justify-between ${containerPadding} select-none ${
        enable3DDesignMotion && !pointerTiltCss ? 'animate-design-orbit-3d' : 'preserve-3d'
      }`}
      style={{
        backgroundColor: theme.backgroundHex,
        borderColor: theme.borderHex,
        color: theme.textPrimaryHex,
        fontFamily: typography.bodyFontFamilyCss,
        ...(pointerTiltCss ? { transform: pointerTiltCss } : {}),
      }}
    >
      {/* Optional Swiss 12-Column & 5% Safe-Margin Architectural Grid Overlay */}
      {showGridGuides && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 z-20 ${containerPadding}`}
        >
          <div className="w-full h-full border border-dashed border-rose-500/40 grid grid-cols-12 gap-2.5">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="h-full bg-rose-500/[0.03] border-x border-rose-500/15"
              />
            ))}
          </div>
        </div>
      )}

      {/* Top Slide Running Header */}
      <header
        className="relative z-10 flex items-center justify-between gap-3 pb-2 border-b text-[11px] shrink-0"
        style={{ borderColor: theme.borderHex }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {editable && onUpdateSlideField ? (
            <input
              type="text"
              aria-label="Slide section kicker"
              value={slide.sectionKicker}
              onChange={(e) => onUpdateSlideField('sectionKicker', e.target.value)}
              className="font-semibold tracking-tight bg-transparent border-b border-transparent focus:border-current focus:outline-none px-0.5 min-w-[140px]"
              style={{ color: theme.accentHex }}
            />
          ) : (
            <span
              className="font-semibold tracking-tight whitespace-nowrap"
              style={{ color: theme.accentHex }}
            >
              {slide.sectionKicker}
            </span>
          )}
          <span aria-hidden="true" style={{ color: theme.textMutedHex }}>
            ·
          </span>
          <span className="truncate" style={{ color: theme.textMutedHex }}>
            {deckTitle}
          </span>
        </div>

        <div
          className="font-mono text-[11px] tabular-nums shrink-0"
          style={{ color: theme.textMutedHex }}
        >
          {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </div>
      </header>

      {/* Main Slide Body per Layout Architecture */}
      <div className="relative z-10 my-auto py-2 flex-1 flex flex-col justify-center min-h-0 preserve-3d">
        {slide.layout === 'cover-editorial' && (
          <div className="grid grid-cols-12 gap-4 items-stretch h-full preserve-3d">
            <div className="col-span-7 flex flex-col justify-center space-y-2 preserve-3d">
              <AnimatedHeadline
                as="h2"
                text={slide.headline}
                animationStyle={headlineAnimation}
                primaryColorHex={theme.textPrimaryHex}
                accentColorHex={theme.accentHex}
                fontFamilyCss={typography.headingFontFamilyCss}
                className={`${headlineSizeCover} font-bold tracking-tight leading-snug`}
              />

              {editable && onUpdateSlideField ? (
                <input
                  type="text"
                  aria-label="Slide subtitle"
                  value={slide.subtitle}
                  onChange={(e) => onUpdateSlideField('subtitle', e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium bg-transparent border-b border-transparent focus:border-current focus:outline-none px-1 py-0.5"
                  style={{ color: theme.accentHex }}
                />
              ) : (
                <p className="text-xs sm:text-sm font-medium" style={{ color: theme.accentHex }}>
                  {slide.subtitle}
                </p>
              )}

              {editable && onUpdateSlideField ? (
                <textarea
                  aria-label="Slide narrative body copy"
                  rows={2}
                  value={slide.bodyCopy}
                  onChange={(e) => onUpdateSlideField('bodyCopy', e.target.value)}
                  className="w-full text-[11px] sm:text-xs leading-relaxed bg-transparent border border-transparent focus:border-current rounded px-1 py-0.5 resize-none focus:outline-none"
                  style={{ color: theme.textMutedHex }}
                />
              ) : (
                <p
                  className="text-[11px] sm:text-xs leading-relaxed line-clamp-3"
                  style={{ color: theme.textMutedHex }}
                >
                  {slide.bodyCopy}
                </p>
              )}
            </div>

            <div className="col-span-5 flex flex-col justify-center preserve-3d">
              {slide.customMedia && slide.customMedia.mode !== 'artwork' ? (
                <SlideMediaFrame
                  media={slide.customMedia}
                  theme={theme}
                  compact={compact}
                  editable={editable}
                  onUpdateMedia={
                    onUpdateSlideField
                      ? (m) => onUpdateSlideField('customMedia', m)
                      : undefined
                  }
                  className="w-full h-full"
                />
              ) : (
                <SlideArtwork
                  artworkId={slide.artworkId}
                  theme={theme}
                  compact={compact}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        )}

        {slide.layout === 'kpi-grid' && (
          <div className="space-y-3 preserve-3d">
            <div className="max-w-3xl space-y-1">
              <AnimatedHeadline
                as="h2"
                text={slide.headline}
                animationStyle={headlineAnimation}
                primaryColorHex={theme.textPrimaryHex}
                accentColorHex={theme.accentHex}
                fontFamilyCss={typography.headingFontFamilyCss}
                className={`${headlineSizeStandard} font-bold tracking-tight leading-snug`}
              />
              <p className="text-[11px] sm:text-xs line-clamp-2" style={{ color: theme.textMutedHex }}>
                {slide.bodyCopy}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2.5 preserve-3d">
              {slide.kpis.map((kpi, idx) => (
                <div
                  key={kpi.id || idx}
                  className={`p-3 border flex flex-col justify-between transition-transform duration-200 ${
                    enable3DDesignMotion ? 'animate-headline-depth' : ''
                  }`}
                  style={{
                    backgroundColor: theme.surfaceHex,
                    borderColor: theme.borderHex,
                    animationDelay: `${idx * 140}ms`,
                  }}
                >
                  <div className="text-[11px] font-medium truncate" style={{ color: theme.textMutedHex }}>
                    {kpi.label}
                  </div>
                  <div
                    className={`${compact ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold font-mono tabular-nums my-1.5 tracking-tight whitespace-nowrap`}
                    style={{ color: theme.textPrimaryHex }}
                  >
                    {kpi.value}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono tabular-nums truncate">
                    <span className="font-semibold shrink-0" style={{ color: theme.accentHex }}>
                      {kpi.delta}
                    </span>
                    <span aria-hidden="true" style={{ color: theme.textMutedHex }}>
                      ·
                    </span>
                    <span className="truncate" style={{ color: theme.textMutedHex }}>
                      {kpi.context}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.layout === 'split-narrative' && (
          <div className="grid grid-cols-12 gap-4 items-stretch h-full preserve-3d">
            <div className="col-span-6 flex flex-col justify-between space-y-2 preserve-3d">
              <div className="space-y-1.5">
                <AnimatedHeadline
                  as="h2"
                  text={slide.headline}
                  animationStyle={headlineAnimation}
                  primaryColorHex={theme.textPrimaryHex}
                  accentColorHex={theme.accentHex}
                  fontFamilyCss={typography.headingFontFamilyCss}
                  className={`${headlineSizeStandard} font-bold tracking-tight leading-snug`}
                />
                <p className="text-xs font-medium" style={{ color: theme.accentHex }}>
                  {slide.subtitle}
                </p>
                <p
                  className="text-[11px] sm:text-xs leading-relaxed line-clamp-3"
                  style={{ color: theme.textMutedHex }}
                >
                  {slide.bodyCopy}
                </p>
              </div>

              {slide.kpis.length > 0 && (
                <div
                  className="grid grid-cols-2 gap-2.5 pt-2 border-t"
                  style={{ borderColor: theme.borderHex }}
                >
                  {slide.kpis.slice(0, 2).map((kpi, idx) => (
                    <div
                      key={kpi.id}
                      className={enable3DDesignMotion ? 'animate-headline-depth' : ''}
                      style={{ animationDelay: `${idx * 180}ms` }}
                    >
                      <div className="text-[10px] truncate" style={{ color: theme.textMutedHex }}>
                        {kpi.label}
                      </div>
                      <div className="text-base sm:text-lg font-bold font-mono tabular-nums whitespace-nowrap">
                        {kpi.value}
                      </div>
                      <div
                        className="text-[10px] font-mono truncate"
                        style={{ color: theme.accentHex }}
                      >
                        {kpi.delta} · {kpi.context}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-6 flex flex-col justify-center preserve-3d">
              {slide.customMedia && slide.customMedia.mode !== 'artwork' ? (
                <SlideMediaFrame
                  media={slide.customMedia}
                  theme={theme}
                  compact={compact}
                  editable={editable}
                  onUpdateMedia={
                    onUpdateSlideField
                      ? (m) => onUpdateSlideField('customMedia', m)
                      : undefined
                  }
                  className="w-full h-full"
                />
              ) : (
                <SlideArtwork
                  artworkId={slide.artworkId}
                  theme={theme}
                  compact={compact}
                  className="w-full h-full"
                />
              )}
            </div>
          </div>
        )}

        {slide.layout === 'financial-waterfall' && (
          <div className="space-y-2.5 preserve-3d">
            <div className="flex items-end justify-between gap-2">
              <div>
                <AnimatedHeadline
                  as="h2"
                  text={slide.headline}
                  animationStyle={headlineAnimation}
                  primaryColorHex={theme.textPrimaryHex}
                  accentColorHex={theme.accentHex}
                  fontFamilyCss={typography.headingFontFamilyCss}
                  className={`${headlineSizeStandard} font-bold tracking-tight`}
                />
                <p className="text-[11px] sm:text-xs" style={{ color: theme.textMutedHex }}>
                  {slide.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2"
                    style={{ backgroundColor: theme.textPrimaryHex }}
                  />
                  Base Run-Rate
                </span>
                <span className="flex items-center gap-1">
                  <span
                    className="inline-block w-2 h-2"
                    style={{ backgroundColor: theme.accentHex }}
                  />
                  Expansion
                </span>
              </div>
            </div>

            <div
              className={`grid grid-cols-6 gap-2.5 pt-4 pb-2 px-3 border items-end h-36 ${
                enable3DDesignMotion ? 'animate-artwork-3d' : ''
              }`}
              style={{ backgroundColor: theme.surfaceHex, borderColor: theme.borderHex }}
            >
              {slide.waterfallBars.map((bar, idx) => {
                const total = bar.primaryValue + bar.secondaryValue;
                const primaryHeightPct = Math.round((bar.primaryValue / maxWaterfallValue) * 100);
                const secondaryHeightPct = Math.round((bar.secondaryValue / maxWaterfallValue) * 100);
                return (
                  <div
                    key={bar.id}
                    className={`h-full flex flex-col justify-end items-center gap-1 ${
                      enable3DDesignMotion ? 'animate-headline-depth' : ''
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <span className="text-[10px] font-mono font-semibold tabular-nums">
                      {bar.unitLabel}
                      {total.toFixed(1)}
                    </span>
                    <div className="w-full max-w-[40px] flex flex-col justify-end h-20">
                      <div
                        style={{
                          height: `${Math.max(secondaryHeightPct, 8)}%`,
                          backgroundColor: theme.accentHex,
                        }}
                        className="w-full"
                      />
                      <div
                        style={{
                          height: `${Math.max(primaryHeightPct, 14)}%`,
                          backgroundColor: theme.textPrimaryHex,
                        }}
                        className="w-full"
                      />
                    </div>
                    <span
                      className="text-[10px] font-mono tabular-nums"
                      style={{ color: theme.textMutedHex }}
                    >
                      {bar.period}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {slide.layout === 'roadmap-timeline' && (
          <div className="space-y-3 preserve-3d">
            <div>
              <AnimatedHeadline
                as="h2"
                text={slide.headline}
                animationStyle={headlineAnimation}
                primaryColorHex={theme.textPrimaryHex}
                accentColorHex={theme.accentHex}
                fontFamilyCss={typography.headingFontFamilyCss}
                className={`${headlineSizeStandard} font-bold tracking-tight`}
              />
              <p className="text-[11px] sm:text-xs" style={{ color: theme.textMutedHex }}>
                {slide.bodyCopy}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 preserve-3d">
              {slide.milestones.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className={`p-3 border flex flex-col justify-between space-y-2 ${
                    enable3DDesignMotion ? 'animate-headline-depth' : ''
                  }`}
                  style={{
                    backgroundColor: theme.surfaceHex,
                    borderColor: theme.borderHex,
                    animationDelay: `${idx * 160}ms`,
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono tabular-nums">
                      <span className="font-semibold" style={{ color: theme.accentHex }}>
                        {item.quarter}
                      </span>
                      <span style={{ color: theme.textMutedHex }}>{item.status}</span>
                    </div>
                    <h3 className="text-xs font-bold leading-snug" style={headingFontStyle}>
                      {item.title}
                    </h3>
                    <p
                      className="text-[11px] leading-relaxed line-clamp-2"
                      style={{ color: theme.textMutedHex }}
                    >
                      {item.deliverable}
                    </p>
                  </div>
                  <div
                    className="pt-1.5 border-t text-[10px] font-mono flex items-center justify-between"
                    style={{ borderColor: theme.borderHex, color: theme.textMutedHex }}
                  >
                    <span>Lead</span>
                    <span style={{ color: theme.textPrimaryHex }}>{item.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.layout === 'comparison-matrix' && (
          <div className="space-y-2.5 preserve-3d">
            <div>
              <AnimatedHeadline
                as="h2"
                text={slide.headline}
                animationStyle={headlineAnimation}
                primaryColorHex={theme.textPrimaryHex}
                accentColorHex={theme.accentHex}
                fontFamilyCss={typography.headingFontFamilyCss}
                className={`${headlineSizeStandard} font-bold tracking-tight`}
              />
              <p className="text-[11px] sm:text-xs" style={{ color: theme.textMutedHex }}>
                {slide.subtitle}
              </p>
            </div>

            <div
              className={`border overflow-hidden ${
                enable3DDesignMotion ? 'animate-artwork-3d' : ''
              }`}
              style={{ borderColor: theme.borderHex }}
            >
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr
                    className="border-b font-mono"
                    style={{
                      backgroundColor: theme.surfaceHex,
                      borderColor: theme.borderHex,
                      color: theme.textMutedHex,
                    }}
                  >
                    <th className="py-2 px-2.5 font-medium">Dimension</th>
                    <th className="py-2 px-2.5 font-medium">Legacy Baseline</th>
                    <th className="py-2 px-2.5 font-medium" style={{ color: theme.textPrimaryHex }}>
                      Proposed Architecture
                    </th>
                    <th className="py-2 px-2.5 font-medium text-right">Verified Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {slide.matrixRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: theme.borderHex }}
                    >
                      <td className="py-2 px-2.5 font-semibold">{row.dimension}</td>
                      <td className="py-2 px-2.5" style={{ color: theme.textMutedHex }}>
                        {row.baselineSpec}
                      </td>
                      <td className="py-2 px-2.5 font-medium">{row.proposedSpec}</td>
                      <td
                        className="py-2 px-2.5 font-mono font-semibold text-right tabular-nums"
                        style={{ color: theme.accentHex }}
                      >
                        {row.impactDelta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {slide.layout === 'media-showcase' && (
          <div className="grid grid-cols-12 gap-4 items-stretch h-full preserve-3d">
            <div className="col-span-5 flex flex-col justify-between space-y-2 preserve-3d">
              <div className="space-y-1.5">
                <AnimatedHeadline
                  as="h2"
                  text={slide.headline}
                  animationStyle={headlineAnimation}
                  primaryColorHex={theme.textPrimaryHex}
                  accentColorHex={theme.accentHex}
                  fontFamilyCss={typography.headingFontFamilyCss}
                  className={`${headlineSizeStandard} font-bold tracking-tight leading-snug`}
                />
                <p className="text-xs font-medium" style={{ color: theme.accentHex }}>
                  {slide.subtitle}
                </p>
                <p
                  className="text-[11px] sm:text-xs leading-relaxed line-clamp-3"
                  style={{ color: theme.textMutedHex }}
                >
                  {slide.bodyCopy}
                </p>
              </div>

              {slide.kpis.length > 0 && (
                <div
                  className="grid grid-cols-2 gap-2 pt-2 border-t"
                  style={{ borderColor: theme.borderHex }}
                >
                  {slide.kpis.slice(0, 2).map((kpi, idx) => (
                    <div
                      key={kpi.id || idx}
                      className={enable3DDesignMotion ? 'animate-headline-depth' : ''}
                      style={{ animationDelay: `${idx * 150}ms` }}
                    >
                      <div className="text-[10px] truncate" style={{ color: theme.textMutedHex }}>
                        {kpi.label}
                      </div>
                      <div className="text-sm sm:text-base font-bold font-mono tabular-nums whitespace-nowrap">
                        {kpi.value}
                      </div>
                      <div
                        className="text-[10px] font-mono truncate"
                        style={{ color: theme.accentHex }}
                      >
                        {kpi.delta}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-7 flex flex-col justify-center preserve-3d">
              <SlideMediaFrame
                media={
                  slide.customMedia && slide.customMedia.mode !== 'artwork'
                    ? slide.customMedia
                    : {
                        ...DEFAULT_SLIDE_MEDIA_CONFIG,
                        mode: 'video',
                        url: SAMPLE_MEDIA_ASSETS[2].url,
                        caption: 'Interactive 4K Motion Showreel · Upload Photo or Video',
                      }
                }
                theme={theme}
                compact={compact}
                editable={editable}
                onUpdateMedia={
                  onUpdateSlideField
                    ? (m) => onUpdateSlideField('customMedia', m)
                    : undefined
                }
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Slide Running Footer */}
      <footer
        className="relative z-10 flex items-center justify-between gap-4 pt-2 border-t text-[10px] shrink-0"
        style={{ borderColor: theme.borderHex, color: theme.textMutedHex }}
      >
        {editable && onUpdateSlideField ? (
          <input
            type="text"
            aria-label="Slide footnote"
            value={slide.footnote}
            onChange={(e) => onUpdateSlideField('footnote', e.target.value)}
            className="w-full max-w-md bg-transparent border-b border-transparent focus:border-current focus:outline-none px-0.5"
            style={{ color: theme.textMutedHex }}
          />
        ) : (
          <span className="truncate">{slide.footnote}</span>
        )}
        <span className="font-mono tabular-nums shrink-0">{aspectRatio} Format</span>
      </footer>
    </div>
  );
};
