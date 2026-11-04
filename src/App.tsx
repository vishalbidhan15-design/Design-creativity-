import React, { useState, useEffect } from 'react';
import {
  AspectRatioFormat,
  SavedCustomDeck,
  SlideData,
  SlideLayoutType,
  TemplateDeck,
  ThemePalette,
  TypographyPair,
  VisualArtworkId,
} from './types/presentation';
import {
  INITIAL_TEMPLATES,
  THEME_PALETTES,
  TYPOGRAPHY_PAIRS,
} from './data/initialTemplates';
import {
  ATMOSPHERE_PRESETS,
  AtmospherePreset,
  calculateContrastRatio,
  deleteSlideFromDeck,
  duplicateSlideInDeck,
  getWcagComplianceLevel,
  HEADLINE_ANIMATION_PRESETS,
  HeadlineAnimationStyle,
  reorderSlideInDeck,
} from './utils/deckEngine';
import { SlideCanvas } from './components/SlideCanvas';
import { ThreeStageShowcase } from './components/ThreeStageShowcase';
import { TemplateGallery } from './components/TemplateGallery';
import { BrandSystemBuilder } from './components/BrandSystemBuilder';
import { PresentationModal } from './components/PresentationModal';
import { ExportModal } from './components/ExportModal';
import { AnimatedHeadline } from './components/AnimatedHeadline';
import {
  Play,
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Grid,
  Download,
  FolderOpen,
  Layers,
  Palette,
  Box,
} from 'lucide-react';

const LAYOUT_OPTIONS: { value: SlideLayoutType; label: string }[] = [
  { value: 'cover-editorial', label: '01. Editorial Cover' },
  { value: 'kpi-grid', label: '02. Executive KPI Grid' },
  { value: 'split-narrative', label: '03. Split Architecture' },
  { value: 'financial-waterfall', label: '04. Financial Waterfall' },
  { value: 'roadmap-timeline', label: '05. Strategic Roadmap' },
  { value: 'comparison-matrix', label: '06. Benchmark Matrix' },
];

const ARTWORK_OPTIONS: { value: VisualArtworkId; label: string }[] = [
  { value: 'venture-topology', label: 'Telemetry Network Graph' },
  { value: 'arch-pavilion', label: 'Nordhavn Timber Elevation' },
  { value: 'hardware-monolith', label: 'Grade-5 Titanium Section' },
  { value: 'sustainable-grid', label: 'HVDC Substation Dispatch' },
  { value: 'editorial-workspace', label: 'Swiss 12-Col Proportion' },
  { value: 'swiss-typography', label: 'Tabular Specimen Aa' },
];

const STORAGE_KEY_SAVED_DECKS = 'foliodeck_saved_decks_v1';

const SEED_SAVED_DECKS: SavedCustomDeck[] = [
  {
    id: 'saved-zurich-q4',
    name: 'Zurich Reinsurance Board Pack — Q4 Final',
    sourceTemplateTitle: 'Q4 Shareholder & Board Ledger',
    savedAt: '2026-11-02',
    aspectRatio: '16:9',
    theme: THEME_PALETTES[0],
    typographyId: TYPOGRAPHY_PAIRS[1].id,
    slides: INITIAL_TEMPLATES[1].slides,
  },
  {
    id: 'saved-munich-series-b',
    name: 'Munich Foundry Robotics — Partner Pitch',
    sourceTemplateTitle: 'Series B Capital & Growth Briefing',
    savedAt: '2026-10-29',
    aspectRatio: '16:9',
    theme: THEME_PALETTES[1],
    typographyId: TYPOGRAPHY_PAIRS[0].id,
    slides: INITIAL_TEMPLATES[0].slides,
  },
];

export default function App() {
  const [themes, setThemes] = useState<ThemePalette[]>(THEME_PALETTES);
  const [activeAtmosphere, setActiveAtmosphere] = useState<AtmospherePreset>(
    ATMOSPHERE_PRESETS[0]
  );
  const [show3DAnimation, setShow3DAnimation] = useState<boolean>(true);
  const [enable3DCardTilt, setEnable3DCardTilt] = useState<boolean>(true);
  const [headlineAnimation, setHeadlineAnimation] =
    useState<HeadlineAnimationStyle>('kinetic-3d-wave');

  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    INITIAL_TEMPLATES[0].id
  );
  const [deckTitle, setDeckTitle] = useState<string>(
    INITIAL_TEMPLATES[0].title
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioFormat>(
    INITIAL_TEMPLATES[0].aspectRatio
  );
  const [slides, setSlides] = useState<SlideData[]>(
    INITIAL_TEMPLATES[0].slides
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [activeTheme, setActiveTheme] = useState<ThemePalette>(
    THEME_PALETTES[1]
  );
  const [activeTypography, setActiveTypography] = useState<TypographyPair>(
    TYPOGRAPHY_PAIRS[0]
  );
  const [showGridGuides, setShowGridGuides] = useState<boolean>(false);
  const [inspectorTab, setInspectorTab] = useState<'content' | 'theme'>(
    'content'
  );
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [studioBannerNotice, setStudioBannerNotice] = useState<string | null>(
    null
  );

  const [savedDecks, setSavedDecks] = useState<SavedCustomDeck[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_DECKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return SEED_SAVED_DECKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_DECKS, JSON.stringify(savedDecks));
    } catch {
      // ignore storage errors
    }
  }, [savedDecks]);

  const currentSlide = slides[activeSlideIndex] || slides[0];
  const currentContrastRatio = calculateContrastRatio(
    activeTheme.textPrimaryHex,
    activeTheme.backgroundHex
  );
  const currentWcagLevel = getWcagComplianceLevel(currentContrastRatio);

  const triggerNotice = (msg: string) => {
    setStudioBannerNotice(msg);
    setTimeout(() => {
      setStudioBannerNotice((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleLoadTemplateIntoStudio = (tpl: TemplateDeck) => {
    setActiveTemplateId(tpl.id);
    setDeckTitle(tpl.title);
    setAspectRatio(tpl.aspectRatio);
    setSlides(JSON.parse(JSON.stringify(tpl.slides)));
    setActiveSlideIndex(0);
    const matchedTheme =
      themes.find((t) => t.id === tpl.defaultThemeId) || themes[0];
    const matchedTypo =
      TYPOGRAPHY_PAIRS.find((tp) => tp.id === tpl.defaultTypographyId) ||
      TYPOGRAPHY_PAIRS[0];
    setActiveTheme(matchedTheme);
    setActiveTypography(matchedTypo);
    triggerNotice(`Loaded "${tpl.title}" (${tpl.slides.length} slides) into Studio.`);
    const studioEl = document.getElementById('studio-workspace');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePreviewTemplateModal = (tpl: TemplateDeck) => {
    handleLoadTemplateIntoStudio(tpl);
    setIsPresenting(true);
  };

  const handleUpdateSlideField = <K extends keyof SlideData>(
    field: K,
    value: SlideData[K]
  ) => {
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === activeSlideIndex ? { ...s, [field]: value } : s
      )
    );
  };

  const handleAddBlankSlide = () => {
    const newSlideNumber = slides.length + 1;
    const newSlide: SlideData = {
      id: `slide-custom-${Date.now()}`,
      layout: 'split-narrative',
      sectionKicker: `${String(newSlideNumber).padStart(2, '0')}. Strategic Module`,
      headline: 'New Architectural Narrative & Key Deliverables',
      subtitle: 'Executive Summary · Key Operational Metrics',
      bodyCopy:
        'Click directly on any text block on the slide canvas or use the right inspector panel to customize narrative copy, layout geometry, and tabular metrics.',
      footnote: `${deckTitle} · Verified Specification`,
      speakerNotes: 'Introduce the core objective and key metrics for this section.',
      artworkId: 'arch-pavilion',
      kpis: [
        {
          id: `kpi-${Date.now()}-1`,
          label: 'Target Efficiency',
          value: '+42.0%',
          delta: '+8.4 pts YoY',
          context: 'Audited Baseline',
        },
        {
          id: `kpi-${Date.now()}-2`,
          label: 'Unit Payback',
          value: '6.5 Mos',
          delta: '-2.0 Mos',
          context: 'Enterprise Tier',
        },
      ],
      waterfallBars: INITIAL_TEMPLATES[0].slides[0].waterfallBars,
      milestones: INITIAL_TEMPLATES[0].slides[0].milestones,
      matrixRows: INITIAL_TEMPLATES[0].slides[0].matrixRows,
    };
    const nextSlides = [...slides, newSlide];
    setSlides(nextSlides);
    setActiveSlideIndex(nextSlides.length - 1);
  };

  const handleDuplicateSlide = (slideId: string) => {
    const next = duplicateSlideInDeck(slides, slideId);
    setSlides(next);
    setActiveSlideIndex((prev) => Math.min(prev + 1, next.length - 1));
  };

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    const idx = slides.findIndex((s) => s.id === slideId);
    if (idx === -1) return;
    const next = reorderSlideInDeck(slides, slideId, direction);
    setSlides(next);
    const targetIdx =
      direction === 'up'
        ? Math.max(0, idx - 1)
        : Math.min(next.length - 1, idx + 1);
    setActiveSlideIndex(targetIdx);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (slides.length <= 1) {
      triggerNotice('A presentation deck must retain at least 1 slide.');
      return;
    }
    const next = deleteSlideFromDeck(slides, slideId);
    setSlides(next);
    setActiveSlideIndex((prev) => Math.min(prev, next.length - 1));
  };

  const handleCreateCustomTheme = (newTheme: ThemePalette) => {
    setThemes((prev) => [newTheme, ...prev]);
    setActiveTheme(newTheme);
  };

  const handleSaveCustomDeck = (customName: string) => {
    const newEntry: SavedCustomDeck = {
      id: `saved-${Date.now()}`,
      name: customName,
      sourceTemplateTitle: deckTitle,
      savedAt: new Date().toISOString().slice(0, 10),
      aspectRatio,
      theme: activeTheme,
      typographyId: activeTypography.id,
      slides: JSON.parse(JSON.stringify(slides)),
    };
    setSavedDecks((prev) => [newEntry, ...prev]);
    setDeckTitle(customName);
    triggerNotice(`Saved "${customName}" to Saved Decks.`);
  };

  const handleLoadSavedDeck = (saved: SavedCustomDeck) => {
    setDeckTitle(saved.name);
    setAspectRatio(saved.aspectRatio);
    setActiveTheme(saved.theme);
    const matchedTypo =
      TYPOGRAPHY_PAIRS.find((tp) => tp.id === saved.typographyId) ||
      TYPOGRAPHY_PAIRS[0];
    setActiveTypography(matchedTypo);
    setSlides(JSON.parse(JSON.stringify(saved.slides)));
    setActiveSlideIndex(0);
    triggerNotice(`Restored saved deck "${saved.name}" into Studio.`);
    const studioEl = document.getElementById('studio-workspace');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteSavedDeck = (id: string) => {
    setSavedDecks((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div
      className="min-h-screen flex flex-col text-slate-900 transition-colors duration-200"
      style={{ backgroundImage: activeAtmosphere.pageBgCss }}
    >
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/90 border-b border-slate-200/90 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#studio-workspace"
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
        >
          FolioDeck
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-600"
        >
          <a
            href="#studio-workspace"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Studio Workspace
          </a>
          <a
            href="#template-gallery"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Template Gallery
          </a>
          <a
            href="#brand-systems"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Brand Systems
          </a>
          <a
            href="#saved-decks"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Saved Decks
          </a>
        </nav>

        {/* Zone 3: 1 primary action button */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Export Deck
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 01: Editorial Hero, Interactive 3D Animation Showcase & Live Studio */}
        <section id="studio-workspace" className="scroll-mt-16 pt-8 pb-12 px-6">
          <div className="max-w-[1360px] mx-auto space-y-6">
            {/* Hero Proposition Card with Luminous Atmosphere Mesh */}
            <div
              className="p-6 sm:p-8 border border-slate-200/90 bg-white/80 space-y-6"
              style={{ backgroundImage: activeAtmosphere.heroMeshCss }}
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="font-semibold text-blue-700">
                      01. Interactive 3D Presentation Studio
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{activeAtmosphere.accentBadgeText}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Contrast {currentContrastRatio}:1 (WCAG {currentWcagLevel})
                    </span>
                  </div>
                  <AnimatedHeadline
                    as="h1"
                    text="Design and Customize Institutional Presentation Systems with 3D Spatial Depth"
                    animationStyle={headlineAnimation}
                    primaryColorHex="#0F172A"
                    accentColorHex={activeAtmosphere.threeKeyLightHex}
                    className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display leading-tight"
                  />
                </div>

                {/* Primary Studio & 3D Animation Action Bar */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShow3DAnimation((prev) => !prev)}
                    aria-pressed={show3DAnimation}
                    className={`px-3.5 py-2 text-xs font-medium border rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      show3DAnimation
                        ? 'bg-indigo-950 border-indigo-800 text-white'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" aria-hidden="true" />
                    {show3DAnimation ? 'Hide 3D Animation' : 'Show 3D Animation'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGridGuides((prev) => !prev)}
                    aria-pressed={showGridGuides}
                    className={`px-3.5 py-2 text-xs font-medium border rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      showGridGuides
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" aria-hidden="true" />
                    {showGridGuides ? 'Hide 12-Col Grid' : 'Show 12-Col Grid'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveCustomDeck(`${deckTitle}`)}
                    className="px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    Save Snapshot
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPresenting(true)}
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Present Deck
                  </button>
                </div>
              </div>

              {/* Interactive Background Atmosphere & Headline Text Animation Switcher Strip */}
              <div className="pt-4 border-t border-slate-200/80 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 mr-1">
                      Canvas Atmosphere:
                    </span>
                    {ATMOSPHERE_PRESETS.map((atmo) => {
                      const isSelected = atmo.id === activeAtmosphere.id;
                      return (
                        <button
                          key={atmo.id}
                          type="button"
                          onClick={() => setActiveAtmosphere(atmo)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${atmo.threeKeyLightHex}, ${atmo.threeRimLightHex})`,
                            }}
                          />
                          {atmo.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs font-mono text-slate-600 tabular-nums">
                    Active Slide: {String(activeSlideIndex + 1).padStart(2, '0')} /{' '}
                    {String(slides.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Headline Text Animation & Global 3D Motion Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 mr-1">
                      Headline Text Animation:
                    </span>
                    {HEADLINE_ANIMATION_PRESETS.map((preset) => {
                      const isSelected = preset.id === headlineAnimation;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setHeadlineAnimation(preset.id)}
                          aria-pressed={isSelected}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                            isSelected
                              ? 'bg-blue-700 text-white border-blue-700'
                              : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                          }`}
                        >
                          {preset.name}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setEnable3DCardTilt((prev) => !prev)}
                    aria-pressed={enable3DCardTilt}
                    className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      enable3DCardTilt
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                    }`}
                  >
                    {enable3DCardTilt ? '3D Design Motion: Active' : 'Enable 3D Design Motion'}
                  </button>
                </div>
              </div>

              {/* Interactive Three.js 3D Spatial Presentation Stage */}
              {show3DAnimation && (
                <ThreeStageShowcase
                  deckTitle={deckTitle}
                  slides={slides}
                  activeSlideIndex={activeSlideIndex}
                  theme={activeTheme}
                  atmosphere={activeAtmosphere}
                  onSelectSlideIndex={setActiveSlideIndex}
                />
              )}
            </div>

            {studioBannerNotice && (
              <div
                role="status"
                className="px-4 py-2.5 bg-slate-900 text-white text-xs font-medium flex items-center justify-between"
              >
                <span>{studioBannerNotice}</span>
                <button
                  type="button"
                  onClick={() => setStudioBannerNotice(null)}
                  className="text-slate-400 hover:text-white text-xs underline ml-4"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 3-Pane Studio Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT RAIL (3 Cols): Deck Metadata & Slide Filmstrip */}
              <aside
                aria-label="Slide filmstrip and deck structure"
                className="lg:col-span-3 bg-white/95 border border-slate-200 p-4 space-y-4"
              >
                <div className="space-y-3 pb-3 border-b border-slate-200">
                  <div>
                    <label
                      htmlFor="studio-deck-title-input"
                      className="block text-[11px] font-medium text-slate-500 mb-1"
                    >
                      Active Presentation Title
                    </label>
                    <input
                      id="studio-deck-title-input"
                      type="text"
                      value={deckTitle}
                      onChange={(e) => setDeckTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="studio-template-preset"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Template Base
                      </label>
                      <select
                        id="studio-template-preset"
                        value={activeTemplateId}
                        onChange={(e) => {
                          const found = INITIAL_TEMPLATES.find(
                            (t) => t.id === e.target.value
                          );
                          if (found) handleLoadTemplateIntoStudio(found);
                        }}
                        className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
                      >
                        {INITIAL_TEMPLATES.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="studio-aspect-select"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Frame Ratio
                      </label>
                      <select
                        id="studio-aspect-select"
                        value={aspectRatio}
                        onChange={(e) =>
                          setAspectRatio(e.target.value as AspectRatioFormat)
                        }
                        className="w-full px-2 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded text-slate-800"
                      >
                        <option value="16:9">16:9 Wide</option>
                        <option value="4:3">4:3 Classic</option>
                        <option value="A4">A4 Print</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Slide Filmstrip Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 font-mono tabular-nums">
                    Slides ({slides.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddBlankSlide}
                    className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add Slide
                  </button>
                </div>

                {/* Slide Filmstrip List */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {slides.map((s, idx) => {
                    const isCurrent = idx === activeSlideIndex;
                    return (
                      <div
                        key={s.id}
                        className={`p-2.5 border transition-colors ${
                          isCurrent
                            ? 'border-blue-700 bg-blue-50/40'
                            : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveSlideIndex(idx)}
                          className="w-full text-left space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500">
                            <span className="font-semibold text-slate-800">
                              Slide {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span>{s.layout}</span>
                          </div>
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {s.headline}
                          </div>
                        </button>

                        {/* Per-Slide Reorder / Duplicate / Delete Actions */}
                        <div className="flex items-center justify-end gap-1 pt-2 mt-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            aria-label={`Move slide ${idx + 1} up`}
                            disabled={idx === 0}
                            onClick={() => handleMoveSlide(s.id, 'up')}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move slide ${idx + 1} down`}
                            disabled={idx === slides.length - 1}
                            onClick={() => handleMoveSlide(s.id, 'down')}
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Duplicate slide ${idx + 1}`}
                            onClick={() => handleDuplicateSlide(s.id)}
                            className="p-1 text-slate-500 hover:text-slate-900"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete slide ${idx + 1}`}
                            disabled={slides.length <= 1}
                            onClick={() => handleDeleteSlide(s.id)}
                            className="p-1 text-slate-500 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </aside>

              {/* CENTER STAGE (6 Cols): Live Slide Canvas & Layout Switcher */}
              <div className="lg:col-span-6 space-y-4">
                {/* Canvas Toolbar */}
                <div className="bg-white/95 border border-slate-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <label
                      htmlFor="slide-layout-select"
                      className="text-xs font-medium text-slate-600 whitespace-nowrap"
                    >
                      Layout:
                    </label>
                    <select
                      id="slide-layout-select"
                      aria-label="Slide master layout"
                      value={currentSlide.layout}
                      onChange={(e) =>
                        handleUpdateSlideField(
                          'layout',
                          e.target.value as SlideLayoutType
                        )
                      }
                      className="px-2 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-700"
                    >
                      {LAYOUT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="slide-artwork-select"
                      className="text-xs font-medium text-slate-600 whitespace-nowrap"
                    >
                      Figure:
                    </label>
                    <select
                      id="slide-artwork-select"
                      aria-label="Slide technical figure"
                      value={currentSlide.artworkId}
                      onChange={(e) =>
                        handleUpdateSlideField(
                          'artworkId',
                          e.target.value as VisualArtworkId
                        )
                      }
                      className="px-2 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-blue-700"
                    >
                      {ARTWORK_OPTIONS.map((art) => (
                        <option key={art.value} value={art.value}>
                          {art.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => setEnable3DCardTilt((prev) => !prev)}
                      aria-pressed={enable3DCardTilt}
                      className={`px-2.5 py-1.5 text-xs font-medium border rounded transition-colors whitespace-nowrap shrink-0 ${
                        enable3DCardTilt
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      3D Tilt View
                    </button>
                  </div>
                </div>

                {/* Interactive Slide Stage with 3D Perspective & Animated Headlines */}
                <div className="preserve-3d">
                  <SlideCanvas
                    slide={currentSlide}
                    slideIndex={activeSlideIndex}
                    totalSlides={slides.length}
                    deckTitle={deckTitle}
                    theme={activeTheme}
                    typography={activeTypography}
                    aspectRatio={aspectRatio}
                    showGridGuides={showGridGuides}
                    editable={true}
                    headlineAnimation={headlineAnimation}
                    enable3DDesignMotion={enable3DCardTilt}
                    onUpdateSlideField={handleUpdateSlideField}
                  />
                </div>

                {/* Speaker Notes Bar Below Stage */}
                <div className="bg-white/95 border border-slate-200 p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <label
                      htmlFor="speaker-notes-textarea"
                      className="font-semibold text-slate-800"
                    >
                      Presenter Teleprompter & Speaker Notes
                    </label>
                    <span className="font-mono tabular-nums">
                      Slide {String(activeSlideIndex + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <textarea
                    id="speaker-notes-textarea"
                    rows={2}
                    value={currentSlide.speakerNotes}
                    onChange={(e) =>
                      handleUpdateSlideField('speakerNotes', e.target.value)
                    }
                    placeholder="Add talking points or pacing cues for this slide..."
                    className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded p-2.5 focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>

              {/* RIGHT INSPECTOR (3 Cols): Content & Theme Token Inspector */}
              <aside
                aria-label="Slide content and theme inspector"
                className="lg:col-span-3 bg-white/95 border border-slate-200 p-4 space-y-4"
              >
                {/* Segmented Inspector Mode Switch */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md">
                  <button
                    type="button"
                    onClick={() => setInspectorTab('content')}
                    className={`py-1.5 px-2 text-xs font-medium rounded transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                      inspectorTab === 'content'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    Slide Copy & Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setInspectorTab('theme')}
                    className={`py-1.5 px-2 text-xs font-medium rounded transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 ${
                      inspectorTab === 'theme'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" aria-hidden="true" />
                    Theme & Fonts
                  </button>
                </div>

                {inspectorTab === 'content' ? (
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="inspector-kicker"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Section Kicker
                      </label>
                      <input
                        id="inspector-kicker"
                        type="text"
                        value={currentSlide.sectionKicker}
                        onChange={(e) =>
                          handleUpdateSlideField('sectionKicker', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="inspector-headline"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Primary Slide Headline
                      </label>
                      <textarea
                        id="inspector-headline"
                        rows={2}
                        value={currentSlide.headline}
                        onChange={(e) =>
                          handleUpdateSlideField('headline', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="inspector-subtitle"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Subtitle / Analytical Lead-In
                      </label>
                      <input
                        id="inspector-subtitle"
                        type="text"
                        value={currentSlide.subtitle}
                        onChange={(e) =>
                          handleUpdateSlideField('subtitle', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="inspector-body"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Narrative Body Copy
                      </label>
                      <textarea
                        id="inspector-body"
                        rows={3}
                        value={currentSlide.bodyCopy}
                        onChange={(e) =>
                          handleUpdateSlideField('bodyCopy', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="inspector-footnote"
                        className="block text-[11px] font-medium text-slate-500 mb-1"
                      >
                        Source Citation / Footnote
                      </label>
                      <input
                        id="inspector-footnote"
                        type="text"
                        value={currentSlide.footnote}
                        onChange={(e) =>
                          handleUpdateSlideField('footnote', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    {/* Editable KPI Metric Cards when KPIs exist on slide */}
                    {currentSlide.kpis.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 space-y-2">
                        <div className="text-[11px] font-semibold text-slate-700">
                          Tabular KPI Metrics ({currentSlide.kpis.length})
                        </div>
                        {currentSlide.kpis.slice(0, 2).map((kpi, kIdx) => (
                          <div
                            key={kpi.id}
                            className="p-2 bg-slate-50 border border-slate-200 space-y-1.5"
                          >
                            <input
                              type="text"
                              aria-label={`KPI ${kIdx + 1} label`}
                              value={kpi.label}
                              onChange={(e) => {
                                const updated = currentSlide.kpis.map(
                                  (item, i) =>
                                    i === kIdx
                                      ? { ...item, label: e.target.value }
                                      : item
                                );
                                handleUpdateSlideField('kpis', updated);
                              }}
                              className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded"
                            />
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="text"
                                aria-label={`KPI ${kIdx + 1} value`}
                                value={kpi.value}
                                onChange={(e) => {
                                  const updated = currentSlide.kpis.map(
                                    (item, i) =>
                                      i === kIdx
                                        ? { ...item, value: e.target.value }
                                        : item
                                  );
                                  handleUpdateSlideField('kpis', updated);
                                }}
                                className="w-full px-2 py-1 text-xs font-mono font-bold bg-white border border-slate-200 rounded"
                              />
                              <input
                                type="text"
                                aria-label={`KPI ${kIdx + 1} delta`}
                                value={kpi.delta}
                                onChange={(e) => {
                                  const updated = currentSlide.kpis.map(
                                    (item, i) =>
                                      i === kIdx
                                        ? { ...item, delta: e.target.value }
                                        : item
                                  );
                                  handleUpdateSlideField('kpis', updated);
                                }}
                                className="w-full px-2 py-1 text-[11px] font-mono bg-white border border-slate-200 rounded"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-slate-800">
                        Color System Palette
                      </div>
                      <div className="space-y-1.5">
                        {themes.map((t) => {
                          const isSelected = t.id === activeTheme.id;
                          const ratio = calculateContrastRatio(
                            t.textPrimaryHex,
                            t.backgroundHex
                          );
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setActiveTheme(t)}
                              className={`w-full p-2.5 text-left border transition-colors flex items-center justify-between gap-2 ${
                                isSelected
                                  ? 'border-blue-700 bg-blue-50/40'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-4 h-4 border border-slate-300 shrink-0"
                                  style={{ backgroundColor: t.backgroundHex }}
                                />
                                <span
                                  className="w-3 h-4 shrink-0"
                                  style={{ backgroundColor: t.accentHex }}
                                />
                                <span className="text-xs font-medium text-slate-900 truncate">
                                  {t.name}
                                </span>
                              </div>
                              <span className="text-[11px] font-mono tabular-nums text-slate-500 shrink-0">
                                {ratio}:1
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <div className="text-xs font-semibold text-slate-800">
                        Typography Pairing
                      </div>
                      <div className="space-y-1.5">
                        {TYPOGRAPHY_PAIRS.map((tp) => {
                          const isSelected = tp.id === activeTypography.id;
                          return (
                            <button
                              key={tp.id}
                              type="button"
                              onClick={() => setActiveTypography(tp)}
                              className={`w-full p-2.5 text-left border transition-colors ${
                                isSelected
                                  ? 'border-blue-700 bg-blue-50/40'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="text-xs font-semibold text-slate-900">
                                {tp.name}
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {tp.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* Section 02: Curated Template Gallery */}
        <TemplateGallery
          templates={INITIAL_TEMPLATES}
          themes={themes}
          typographies={TYPOGRAPHY_PAIRS}
          activeTemplateId={activeTemplateId}
          headlineAnimation={headlineAnimation}
          enable3DDesignMotion={enable3DCardTilt}
          onSelectTemplateForStudio={handleLoadTemplateIntoStudio}
          onPreviewTemplateDeck={handlePreviewTemplateModal}
        />

        {/* Section 03: Brand Systems & Real-Time WCAG Contrast Lab */}
        <BrandSystemBuilder
          themes={themes}
          activeTheme={activeTheme}
          typographies={TYPOGRAPHY_PAIRS}
          activeTypography={activeTypography}
          headlineAnimation={headlineAnimation}
          enable3DDesignMotion={enable3DCardTilt}
          onSelectTheme={setActiveTheme}
          onSelectTypography={setActiveTypography}
          onCreateCustomTheme={handleCreateCustomTheme}
        />

        {/* Section 04: Saved Custom Decks & Quantitative Proof */}
        <section
          id="saved-decks"
          className="scroll-mt-16 py-12 border-t border-slate-200/80 px-6"
        >
          <div className="max-w-[1360px] mx-auto space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-medium text-slate-500">
                  04. Workspace Library & Institutional Benchmarks
                </p>
                <AnimatedHeadline
                  as="h2"
                  text="Saved Presentation Snapshots & Verified Client Outcomes"
                  animationStyle={headlineAnimation}
                  primaryColorHex="#0F172A"
                  accentColorHex="#2563EB"
                  className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display"
                />
                <p className="text-sm text-slate-600">
                  Resume customizing your saved presentation decks or export production-ready HTML and JSON specifications for board distribution.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExportOpen(true)}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Save Current Studio Deck
              </button>
            </div>

            {/* Saved Decks Grid */}
            {savedDecks.length === 0 ? (
              <div className="p-8 bg-white border border-slate-200 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-800">
                  No saved presentation snapshots in your workspace yet
                </p>
                <p className="text-xs text-slate-500">
                  Click "Save Snapshot" in the Studio toolbar to store customized decks here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 preserve-3d">
                {savedDecks.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`bg-white/95 border border-slate-200 p-5 flex flex-col justify-between space-y-4 ${
                      enable3DCardTilt ? 'animate-design-orbit-3d' : ''
                    }`}
                    style={{ animationDelay: `${idx * 200}ms` }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                        <span>{item.slides.length} Slides · {item.aspectRatio}</span>
                        <span>Saved {item.savedAt}</span>
                      </div>
                      <AnimatedHeadline
                        as="h3"
                        text={item.name}
                        animationStyle={headlineAnimation}
                        primaryColorHex="#0F172A"
                        accentColorHex={item.theme.accentHex}
                        className="text-base font-bold text-slate-900 font-display"
                      />
                      <p className="text-xs text-slate-600">
                        Base Architecture: {item.sourceTemplateTitle} · Theme: {item.theme.name}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadSavedDeck(item)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        Load in Studio
                      </button>

                      <button
                        type="button"
                        aria-label={`Delete saved deck ${item.name}`}
                        onClick={() => handleDeleteSavedDeck(item.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Claim-to-Proof Adjacency: Quantitative Outcomes & Attributable Testimonials */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-6 preserve-3d">
              <div
                className={`bg-white/95 border border-slate-200 p-6 space-y-2 ${
                  enable3DCardTilt ? 'animate-headline-depth' : ''
                }`}
              >
                <div className="text-xs text-slate-500">
                  Board Deck Preparation Velocity
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                  -68% Prep Time
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Measured across 140 quarterly audit and investor relations briefings over 12 months by replacing manual slide alignment with locked 12-column master grids.
                </p>
              </div>

              <div
                className={`bg-white/95 border border-slate-200 p-6 space-y-2 ${
                  enable3DCardTilt ? 'animate-headline-depth' : ''
                }`}
                style={{ animationDelay: '150ms' }}
              >
                <div className="text-xs text-slate-500">
                  Accessibility & Legibility Audit
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
                  100% WCAG AA+
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every exported deck enforces minimum 4.5:1 body text contrast and tabular monospace alignment for financial waterfalls and benchmark tables.
                </p>
              </div>

              <div
                className={`bg-white/95 border border-slate-200 p-6 flex flex-col justify-between space-y-3 ${
                  enable3DCardTilt ? 'animate-headline-depth' : ''
                }`}
                style={{ animationDelay: '300ms' }}
              >
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "Before FolioDeck, our Zurich IR team spent four days reformatting quarterly EBITDA bridges from spreadsheets into slides. Standardized tabular templates cut deck assembly to 90 minutes with zero typographical drift."
                </p>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <strong className="text-slate-900 font-semibold">
                    Dr. Lukas Vetter
                  </strong>{' '}
                  · VP of Investor Relations, Helvetia Precision Systems AG
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-xs text-slate-500">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 font-display">
              FolioDeck
            </span>
            <span aria-hidden="true">·</span>
            <span>Architectural Presentation Design System</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#studio-workspace" className="hover:text-slate-900">
              Studio
            </a>
            <a href="#template-gallery" className="hover:text-slate-900">
              Templates
            </a>
            <a href="#brand-systems" className="hover:text-slate-900">
              Brand Tokens
            </a>
            <a href="#saved-decks" className="hover:text-slate-900">
              Saved Decks
            </a>
          </div>
        </div>
      </footer>

      {/* Full-Viewport Presentation Mode Modal */}
      <PresentationModal
        isOpen={isPresenting}
        deckTitle={deckTitle}
        slides={slides}
        initialSlideIndex={activeSlideIndex}
        theme={activeTheme}
        typography={activeTypography}
        aspectRatio={aspectRatio}
        headlineAnimation={headlineAnimation}
        enable3DDesignMotion={enable3DCardTilt}
        onClose={() => setIsPresenting(false)}
      />

      {/* Export & Specification Sheet Modal */}
      <ExportModal
        isOpen={isExportOpen}
        deckTitle={deckTitle}
        slides={slides}
        theme={activeTheme}
        typography={activeTypography}
        aspectRatio={aspectRatio}
        onSaveCustomDeck={handleSaveCustomDeck}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
