import React, { useState } from 'react';
import {
  AspectRatioFormat,
  TemplateCategory,
  TemplateDeck,
  ThemePalette,
  TypographyPair,
} from '../types/presentation';
import {
  calculateContrastRatio,
  computeCard3DTiltTransform,
  filterTemplates,
  getWcagComplianceLevel,
  HeadlineAnimationStyle,
} from '../utils/deckEngine';
import { SlideCanvas } from './SlideCanvas';
import { AnimatedHeadline } from './AnimatedHeadline';
import { Search, SlidersHorizontal, ArrowUpRight, Eye, Film } from 'lucide-react';

interface TemplateGalleryProps {
  templates: TemplateDeck[];
  themes: ThemePalette[];
  typographies: TypographyPair[];
  activeTemplateId: string;
  headlineAnimation?: HeadlineAnimationStyle;
  enable3DDesignMotion?: boolean;
  isAdminMode?: boolean;
  onSelectTemplateForStudio: (template: TemplateDeck) => void;
  onOpenTemplateMediaEditor: (template: TemplateDeck) => void;
  onPreviewTemplateDeck: (template: TemplateDeck) => void;
}

const CATEGORIES: TemplateCategory[] = [
  'All Templates',
  'Pitch & Venture',
  'Financial & Board',
  'Product & Roadmap',
  'Architecture & Brand',
  'Media & Video Showreel',
  'Marketing & Launch',
];

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  templates,
  themes,
  typographies,
  activeTemplateId,
  headlineAnimation = 'kinetic-3d-wave',
  enable3DDesignMotion = true,
  isAdminMode = false,
  onSelectTemplateForStudio,
  onOpenTemplateMediaEditor,
  onPreviewTemplateDeck,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All Templates');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioFormat | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [slidePreviewIndexByDeck, setSlidePreviewIndexByDeck] = useState<Record<string, number>>({});
  const [hoveredCardTilt, setHoveredCardTilt] = useState<Record<string, string>>({});

  const filteredTemplates = filterTemplates(
    templates,
    selectedCategory,
    searchQuery,
    selectedRatio
  );

  const handleResetFilters = () => {
    setSelectedCategory('All Templates');
    setSelectedRatio('ALL');
    setSearchQuery('');
  };

  return (
    <section id="template-gallery" className="scroll-mt-16 py-12 border-t border-slate-200/80">
      <div className="max-w-[1360px] mx-auto px-6 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              02. Curated Presentation Architecture
            </p>
            <AnimatedHeadline
              as="h2"
              text="Domain-Engineered Slide Systems Ready for Executive Customization"
              animationStyle={headlineAnimation}
              primaryColorHex="#0F172A"
              accentColorHex="#2563EB"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display"
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              Every template is built on a 12-column mathematical grid with 3D spatial depth, pre-audited WCAG AA/AAA contrast pairings, tabular financial matrices, and modular slide masters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search templates by keyword or domain"
                placeholder="Search decks, metrics, or layouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 w-64"
              />
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
              <label htmlFor="ratio-filter-select" className="sr-only">
                Filter by aspect ratio
              </label>
              <select
                id="ratio-filter-select"
                aria-label="Filter by aspect ratio"
                value={selectedRatio}
                onChange={(e) => setSelectedRatio(e.target.value as AspectRatioFormat | 'ALL')}
                className="px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-800 font-medium focus:outline-none focus:border-blue-700"
              >
                <option value="ALL">All Aspect Ratios</option>
                <option value="16:9">16:9 Widescreen</option>
                <option value="4:3">4:3 Boardroom</option>
                <option value="A4">A4 Print Dossier</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactive Category Segmented Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div
            role="tablist"
            aria-label="Template category filters"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg"
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {filteredTemplates.length} of {templates.length} template architectures
          </div>
        </div>

        {/* Populated or Empty State */}
        {filteredTemplates.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white border border-slate-200 rounded-lg space-y-3">
            <h3 className="text-base font-semibold text-slate-900">
              No presentation templates match your current filter criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try clearing your search query or switching back to all aspect ratios and categories.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Reset Filter Criteria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredTemplates.map((tpl) => {
              const tplTheme =
                themes.find((t) => t.id === tpl.defaultThemeId) || themes[0];
              const tplTypo =
                typographies.find((tp) => tp.id === tpl.defaultTypographyId) ||
                typographies[0];
              const activeSlideIdx = slidePreviewIndexByDeck[tpl.id] || 0;
              const previewSlide = tpl.slides[activeSlideIdx] || tpl.slides[0];
              const contrast = calculateContrastRatio(
                tplTheme.textPrimaryHex,
                tplTheme.backgroundHex
              );
              const wcag = getWcagComplianceLevel(contrast);
              const isLoadedInStudio = tpl.id === activeTemplateId;
              const cardTilt = hoveredCardTilt[tpl.id];

              return (
                <article
                  key={tpl.id}
                  onMouseMove={(e) => {
                    if (!enable3DDesignMotion) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (!rect.width || !rect.height) return;
                    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
                    setHoveredCardTilt((prev) => ({
                      ...prev,
                      [tpl.id]: computeCard3DTiltTransform(normX, normY, 4, 6),
                    }));
                  }}
                  onMouseLeave={() => {
                    setHoveredCardTilt((prev) => {
                      const next = { ...prev };
                      delete next[tpl.id];
                      return next;
                    });
                  }}
                  className="bg-white/95 border border-slate-200 flex flex-col justify-between p-6 space-y-5 transition-transform duration-150 hover:border-slate-300 preserve-3d"
                  style={cardTilt ? { transform: cardTilt } : undefined}
                >
                  <div className="space-y-4">
                    {/* Unboxed Clean Typographic Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{tpl.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {tpl.slides.length === 1
                            ? '1 Slide'
                            : `${tpl.slides.length} Slides`}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{tpl.aspectRatio}</span>
                      </div>
                      <div className="font-mono tabular-nums text-slate-600">
                        Contrast {contrast}:1 ({wcag})
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <div className="space-y-1.5">
                      <AnimatedHeadline
                        as="h3"
                        text={tpl.title}
                        animationStyle={headlineAnimation}
                        primaryColorHex="#0F172A"
                        accentColorHex={tplTheme.accentHex}
                        className="text-xl font-bold text-slate-900 font-display tracking-tight"
                      />
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {tpl.summary}
                      </p>
                    </div>

                    {/* Live Scaled Slide Preview Stage */}
                    <div className="space-y-2.5 preserve-3d">
                      <SlideCanvas
                        slide={previewSlide}
                        slideIndex={activeSlideIdx}
                        totalSlides={tpl.slides.length}
                        deckTitle={tpl.title}
                        theme={tplTheme}
                        typography={tplTypo}
                        aspectRatio={tpl.aspectRatio}
                        editable={false}
                        compact={true}
                        headlineAnimation={headlineAnimation}
                        enable3DDesignMotion={enable3DDesignMotion}
                      />

                      {/* Interactive Slide Scrubber Tabs */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Inspect slide layout:
                        </span>
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {tpl.slides.map((s, idx) => (
                            <button
                              key={s.id}
                              type="button"
                              aria-label={`Preview slide ${idx + 1} of ${tpl.title}`}
                              onClick={() =>
                                setSlidePreviewIndexByDeck((prev) => ({
                                  ...prev,
                                  [tpl.id]: idx,
                                }))
                              }
                              className={`px-2 py-1 text-[11px] font-mono tabular-nums rounded transition-colors whitespace-nowrap shrink-0 ${
                                idx === activeSlideIdx
                                  ? 'bg-slate-900 text-white font-semibold'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {String(idx + 1).padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 truncate">
                      <span>{tpl.authorTeam}</span>
                      <span aria-hidden="true" className="mx-1.5">
                        ·
                      </span>
                      <span>Updated {tpl.lastUpdated}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onPreviewTemplateDeck(tpl)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                        Preview
                      </button>

                      {isAdminMode && (
                        <button
                          type="button"
                          onClick={() => onOpenTemplateMediaEditor(tpl)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <Film className="w-3.5 h-3.5" aria-hidden="true" />
                          Edit Photo / Video
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectTemplateForStudio(tpl)}
                        className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                          isLoadedInStudio
                            ? 'bg-blue-700 text-white hover:bg-blue-800'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isLoadedInStudio
                          ? isAdminMode
                            ? 'Active in Studio'
                            : 'Active in Showcase'
                          : isAdminMode
                            ? 'Use Template'
                            : 'Load in 3D Showcase'}
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
