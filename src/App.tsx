import React, { useState, useEffect, useRef } from 'react';
import {
  AspectRatioFormat,
  SavedCustomDeck,
  SlideData,
  SlideLayoutType,
  SlideMediaConfig,
  SlideMediaMode,
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
  DEFAULT_SLIDE_MEDIA_CONFIG,
  deleteSlideFromDeck,
  duplicateSlideInDeck,
  getWcagComplianceLevel,
  HEADLINE_ANIMATION_PRESETS,
  HeadlineAnimationStyle,
  injectVisitorMediaIntoSlides,
  injectVisitorSlotMediaIntoSlides,
  isAdminModeFromSearch,
  MEDIA_FILTER_PRESETS,
  PREDEFINED_MEDIA_SLOTS,
  reorderSlideInDeck,
  SAMPLE_MEDIA_ASSETS,
  VisitorUploadedAsset,
} from './utils/deckEngine';
import { downloadActiveSlideToGallery } from './utils/slideGalleryExport';
import { SlideCanvas } from './components/SlideCanvas';
import { ThreeStageShowcase } from './components/ThreeStageShowcase';
import { TemplateGallery } from './components/TemplateGallery';
import { MediaStudioSection } from './components/MediaStudioSection';
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
  Film,
  Upload,
  Lock,
  Sparkles,
  Camera,
} from 'lucide-react';

const LAYOUT_OPTIONS: { value: SlideLayoutType; label: string }[] = [
  { value: 'cover-editorial', label: '01. Editorial Cover' },
  { value: 'kpi-grid', label: '02. Executive KPI Grid' },
  { value: 'split-narrative', label: '03. Split Architecture' },
  { value: 'financial-waterfall', label: '04. Financial Waterfall' },
  { value: 'roadmap-timeline', label: '05. Strategic Roadmap' },
  { value: 'comparison-matrix', label: '06. Benchmark Matrix' },
  { value: 'media-showcase', label: '07. Photo & Video Showcase' },
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
  const visitorMediaInputRef = useRef<HTMLInputElement | null>(null);
  const slotMediaInputRef = useRef<HTMLInputElement | null>(null);
  const studioMediaInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadSlotIndex, setActiveUploadSlotIndex] = useState<number>(0);
  const [slotAssignedAssets, setSlotAssignedAssets] = useState<
    Record<number, VisitorUploadedAsset>
  >({});

  // Admin mode is strictly controlled by the URL parameter (?mode=admin); defaults to false (Visitor Showcase Mode)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? isAdminModeFromSearch(window.location.search)
      : false
  );

  useEffect(() => {
    const syncModeFromUrl = () => {
      setIsAdminMode(isAdminModeFromSearch(window.location.search));
    };
    window.addEventListener('popstate', syncModeFromUrl);
    return () => window.removeEventListener('popstate', syncModeFromUrl);
  }, []);

  const [themes, setThemes] = useState<ThemePalette[]>(THEME_PALETTES);
  const [activeAtmosphere, setActiveAtmosphere] = useState<AtmospherePreset>(
    ATMOSPHERE_PRESETS[0]
  );
  const [show3DAnimation, setShow3DAnimation] = useState<boolean>(true);
  const [enable3DCardTilt, setEnable3DCardTilt] = useState<boolean>(true);
  const [headlineAnimation, setHeadlineAnimation] =
    useState<HeadlineAnimationStyle>('kinetic-3d-wave');

  // Default to a media-rich 3D template with designated media placeholders ready for visitor uploads
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    INITIAL_TEMPLATES[0].id
  );
  const [deckTitle, setDeckTitle] = useState<string>(
    INITIAL_TEMPLATES[0].title
  );
  const [aspectRatio, setAspectRatio] = useState<AspectRatioFormat>(
    INITIAL_TEMPLATES[0].aspectRatio
  );
  const [slides, setSlides] = useState<SlideData[]>(() => {
    const initial = JSON.parse(
      JSON.stringify(INITIAL_TEMPLATES[0].slides)
    ) as SlideData[];
    if (initial.length > 0 && (!initial[0].customMedia || initial[0].customMedia.mode === 'artwork')) {
      initial[0].customMedia = {
        ...DEFAULT_SLIDE_MEDIA_CONFIG,
        mode: 'video',
        url: 'procedural://cinema-prism',
        caption: 'Designated 3D Media Placeholder · Upload Your Photo or Funny Video',
        zoom: 1.06,
      };
    }
    return initial;
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [activeTheme, setActiveTheme] = useState<ThemePalette>(
    THEME_PALETTES[1]
  );
  const [activeTypography, setActiveTypography] = useState<TypographyPair>(
    TYPOGRAPHY_PAIRS[0]
  );
  const [showGridGuides, setShowGridGuides] = useState<boolean>(false);
  const [inspectorTab, setInspectorTab] = useState<
    'content' | 'media' | 'theme'
  >('content');
  const [isPresenting, setIsPresenting] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [studioBannerNotice, setStudioBannerNotice] = useState<string | null>(
    null
  );
  const [visitorUploadedAssets, setVisitorUploadedAssets] = useState<
    VisitorUploadedAsset[]
  >([]);

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
  const currentMedia: SlideMediaConfig = currentSlide.customMedia || {
    ...DEFAULT_SLIDE_MEDIA_CONFIG,
  };
  const currentContrastRatio = calculateContrastRatio(
    activeTheme.textPrimaryHex,
    activeTheme.backgroundHex
  );
  const currentWcagLevel = getWcagComplianceLevel(currentContrastRatio);

  const triggerNotice = (msg: string) => {
    setStudioBannerNotice(msg);
    setTimeout(() => {
      setStudioBannerNotice((prev) => (prev === msg ? null : prev));
    }, 4500);
  };

  // Interactive Visitor Media Upload: reads local files in browser memory & injects into 3D template placeholders
  const handleVisitorMediaFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newAssets: VisitorUploadedAsset[] = Array.from(fileList).map(
      (file, idx) => {
        const isVideo = file.type.startsWith('video/');
        const objectUrl = URL.createObjectURL(file);
        return {
          id: `visitor-media-${Date.now()}-${idx}`,
          name: file.name,
          type: isVideo ? 'video' : 'photo',
          url: objectUrl,
        };
      }
    );

    setVisitorUploadedAssets((prev) => [...newAssets, ...prev]);
    setSlotAssignedAssets((prev) => {
      const updated = { ...prev };
      newAssets.forEach((asset, idx) => {
        updated[idx % 3] = asset;
      });
      return updated;
    });
    setSlides((prevSlides) => injectVisitorMediaIntoSlides(prevSlides, newAssets));
    setActiveSlideIndex(0);
    triggerNotice(
      `Injected ${newAssets.length} uploaded ${
        newAssets.length === 1 ? 'media file' : 'media files'
      } (${newAssets.map((a) => a.name).join(', ')}) into predefined 3D template slots with automatic 3D depth tilt & floating motion.`
    );
  };

  // Predefined Slot Upload Handler (Single Slot 01, 02, or 03)
  const handleSlotMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const objectUrl = URL.createObjectURL(file);
    const slotIdx = activeUploadSlotIndex;
    const newAsset: VisitorUploadedAsset = {
      id: `slot-${slotIdx}-${Date.now()}`,
      name: file.name,
      type: isVideo ? 'video' : 'photo',
      url: objectUrl,
    };

    setVisitorUploadedAssets((prev) => [newAsset, ...prev]);
    setSlotAssignedAssets((prev) => ({ ...prev, [slotIdx]: newAsset }));
    setSlides((prevSlides) =>
      injectVisitorSlotMediaIntoSlides(prevSlides, slotIdx, newAsset)
    );
    setActiveSlideIndex(slotIdx % slides.length);
    triggerNotice(
      `Uploaded "${file.name}" into Predefined Slot 0${
        slotIdx + 1
      } — automatic 3D depth tilt, floating motion, and dynamic zoom activated.`
    );
  };

  // Instant 1-Click Visitor Sample Funny Video Injection into Predefined Slots
  const handleInjectSampleFunnyVideo = () => {
    const sampleAsset: VisitorUploadedAsset = {
      id: `visitor-funny-${Date.now()}`,
      name: 'Playful 3D Bouncing Arcade Reel',
      type: 'video',
      url: 'procedural://funny-arcade-reel',
    };
    setVisitorUploadedAssets((prev) => [sampleAsset, ...prev]);
    setSlotAssignedAssets({
      0: sampleAsset,
      1: sampleAsset,
      2: sampleAsset,
    });
    setSlides((prevSlides) =>
      injectVisitorMediaIntoSlides(prevSlides, [sampleAsset])
    );
    setActiveSlideIndex(0);
    triggerNotice(
      'Injected "Playful 3D Bouncing Arcade Reel" into all 3 Predefined Media Slots with automatic 3D depth tilt & floating motion.'
    );
  };

  // High-Resolution Canvas Capture & Automatic Download to Gallery
  const handleDownloadSlideToGallery = () => {
    const result = downloadActiveSlideToGallery({
      slide: currentSlide,
      slideIndex: activeSlideIndex,
      totalSlides: slides.length,
      deckTitle,
      theme: activeTheme,
    });
    triggerNotice(
      `Downloaded "${result.fileName}" (${result.width}×${result.height} Full HD PNG) to your device gallery.`
    );
  };

  const handleLoadTemplateIntoStudio = (tpl: TemplateDeck) => {
    setActiveTemplateId(tpl.id);
    setDeckTitle(tpl.title);
    setAspectRatio(tpl.aspectRatio);
    let nextSlides: SlideData[] = JSON.parse(JSON.stringify(tpl.slides));
    // If visitor already uploaded media in memory, automatically inject into the newly selected template's placeholders
    if (visitorUploadedAssets.length > 0) {
      nextSlides = injectVisitorMediaIntoSlides(nextSlides, visitorUploadedAssets);
    } else if (
      nextSlides.length > 0 &&
      (!nextSlides[0].customMedia || nextSlides[0].customMedia.mode === 'artwork')
    ) {
      nextSlides[0].customMedia = {
        ...DEFAULT_SLIDE_MEDIA_CONFIG,
        mode: 'video',
        url: 'procedural://cinema-prism',
        caption: `${tpl.title} · 3D Media Placeholder`,
        zoom: 1.06,
      };
    }
    setSlides(nextSlides);
    setActiveSlideIndex(0);
    const matchedTheme =
      themes.find((t) => t.id === tpl.defaultThemeId) || themes[0];
    const matchedTypo =
      TYPOGRAPHY_PAIRS.find((tp) => tp.id === tpl.defaultTypographyId) ||
      TYPOGRAPHY_PAIRS[0];
    setActiveTheme(matchedTheme);
    setActiveTypography(matchedTypo);
    triggerNotice(
      `Loaded "${tpl.title}" (${tpl.slides.length} slides) into ${
        isAdminMode ? 'Admin Studio' : 'Visitor 3D Showcase'
      }.`
    );
    const studioEl = document.getElementById('studio-workspace');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenTemplateMediaEditor = (tpl: TemplateDeck) => {
    setActiveTemplateId(tpl.id);
    setDeckTitle(tpl.title);
    setAspectRatio(tpl.aspectRatio);
    let clonedSlides: SlideData[] = JSON.parse(JSON.stringify(tpl.slides));
    if (visitorUploadedAssets.length > 0) {
      clonedSlides = injectVisitorMediaIntoSlides(
        clonedSlides,
        visitorUploadedAssets
      );
    } else if (clonedSlides.length > 0) {
      const first = clonedSlides[0];
      if (!first.customMedia || first.customMedia.mode === 'artwork') {
        first.customMedia = {
          ...DEFAULT_SLIDE_MEDIA_CONFIG,
          mode: 'video',
          url: 'procedural://funny-arcade-reel',
          caption: `${tpl.title} · Visitor Media Placeholder`,
          zoom: 1.08,
        };
      }
      if (
        first.layout !== 'media-showcase' &&
        first.layout !== 'cover-editorial' &&
        first.layout !== 'split-narrative'
      ) {
        first.layout = 'media-showcase';
      }
    }
    setSlides(clonedSlides);
    setActiveSlideIndex(0);
    const matchedTheme =
      themes.find((t) => t.id === tpl.defaultThemeId) || themes[0];
    const matchedTypo =
      TYPOGRAPHY_PAIRS.find((tp) => tp.id === tpl.defaultTypographyId) ||
      TYPOGRAPHY_PAIRS[0];
    setActiveTheme(matchedTheme);
    setActiveTypography(matchedTypo);
    if (isAdminMode) {
      setInspectorTab('media');
    }
    triggerNotice(
      `Loaded "${tpl.title}" — click "Upload Your Media" to inject your own photos or funny videos into the 3D slides.`
    );
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
    if (!isAdminMode) return;
    setSlides((prev) =>
      prev.map((s, idx) =>
        idx === activeSlideIndex ? { ...s, [field]: value } : s
      )
    );
  };

  const handleUpdateSlideMedia = (patch: Partial<SlideMediaConfig>) => {
    setSlides((prev) =>
      prev.map((s, idx) => {
        if (idx !== activeSlideIndex) return s;
        const base = s.customMedia || { ...DEFAULT_SLIDE_MEDIA_CONFIG };
        const updatedMedia: SlideMediaConfig = { ...base, ...patch };
        const nextLayout =
          updatedMedia.mode !== 'artwork' &&
          s.layout !== 'cover-editorial' &&
          s.layout !== 'split-narrative' &&
          s.layout !== 'media-showcase'
            ? 'media-showcase'
            : s.layout;
        return {
          ...s,
          layout: nextLayout,
          customMedia: updatedMedia,
        };
      })
    );
  };

  const handleStudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const objectUrl = URL.createObjectURL(file);
    handleUpdateSlideMedia({
      mode: isVideo ? 'video' : 'photo',
      url: objectUrl,
      caption: `${file.name} · Custom ${isVideo ? 'Video' : 'Photo'}`,
    });
    if (isAdminMode) {
      setInspectorTab('media');
    }
    triggerNotice(
      `Uploaded ${isVideo ? 'video' : 'photo'} "${file.name}" onto Slide ${
        activeSlideIndex + 1
      }.`
    );
  };

  const handleApplyLabMediaToActiveSlide = (mediaConfig: SlideMediaConfig) => {
    handleUpdateSlideMedia(mediaConfig);
    if (isAdminMode) {
      setInspectorTab('media');
    }
    triggerNotice(
      `Applied graded ${mediaConfig.mode} "${mediaConfig.caption}" to Slide ${
        activeSlideIndex + 1
      }.`
    );
  };

  const handleAddBlankSlide = () => {
    if (!isAdminMode) return;
    const newSlideNumber = slides.length + 1;
    const newSlide: SlideData = {
      id: `slide-custom-${Date.now()}`,
      layout: 'media-showcase',
      sectionKicker: `${String(newSlideNumber).padStart(2, '0')}. Custom Media Module`,
      headline: 'Custom Photo & Video Narrative Showcase',
      subtitle: 'Executive Summary · Interactive Media & Key Metrics',
      bodyCopy:
        'Upload your own video or photo or customize any text block directly on the slide canvas.',
      footnote: `${deckTitle} · Verified Specification`,
      speakerNotes: 'Introduce the core objective and key visual media for this section.',
      artworkId: 'arch-pavilion',
      customMedia: {
        ...DEFAULT_SLIDE_MEDIA_CONFIG,
        mode: 'photo',
        url: SAMPLE_MEDIA_ASSETS[0].url,
        caption: SAMPLE_MEDIA_ASSETS[0].caption,
      },
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
    if (!isAdminMode) return;
    const next = duplicateSlideInDeck(slides, slideId);
    setSlides(next);
    setActiveSlideIndex((prev) => Math.min(prev + 1, next.length - 1));
  };

  const handleMoveSlide = (slideId: string, direction: 'up' | 'down') => {
    if (!isAdminMode) return;
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
    if (!isAdminMode) return;
    if (slides.length <= 1) {
      triggerNotice('A presentation deck must retain at least 1 slide.');
      return;
    }
    const next = deleteSlideFromDeck(slides, slideId);
    setSlides(next);
    setActiveSlideIndex((prev) => Math.min(prev, next.length - 1));
  };

  const handleCreateCustomTheme = (newTheme: ThemePalette) => {
    if (!isAdminMode) return;
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
    triggerNotice(`Restored saved deck "${saved.name}" into Showcase.`);
    const studioEl = document.getElementById('studio-workspace');
    if (studioEl) {
      studioEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeleteSavedDeck = (id: string) => {
    if (!isAdminMode) return;
    setSavedDecks((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div
      data-mode={isAdminMode ? 'admin' : 'visitor-showcase'}
      className="min-h-screen flex flex-col text-slate-900 transition-colors duration-200"
      style={{ backgroundImage: activeAtmosphere.pageBgCss }}
    >
      {/* Hidden Visitor Media File Input (Multiple Photos & Funny Videos, Local Browser Memory Only) */}
      <input
        ref={visitorMediaInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        aria-label="Upload Your Media files"
        onChange={handleVisitorMediaFiles}
        className="hidden"
      />
      <input
        ref={slotMediaInputRef}
        type="file"
        accept="image/*,video/*"
        aria-label="Upload media into predefined slot"
        onChange={handleSlotMediaFileChange}
        className="hidden"
      />
      {isAdminMode && (
        <input
          ref={studioMediaInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleStudioFileUpload}
          className="hidden"
        />
      )}

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-slate-950/95 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between gap-8 text-white">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#studio-workspace"
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0"
        >
          FolioDeck
        </a>

        {/* Zone 2: Concise single-line navigation links (Mode-Separated) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300"
        >
          <a
            href="#studio-workspace"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {isAdminMode ? 'Admin Studio' : '3D Showcase'}
          </a>
          {!isAdminMode && (
            <a
              href="#visitor-predefined-slots"
              className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Predefined Media Slots (3)
            </a>
          )}
          <a
            href="#template-gallery"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Template Gallery ({INITIAL_TEMPLATES.length})
          </a>
          {isAdminMode && (
            <>
              <a
                href="#media-studio-lab"
                className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Photo & Video Lab
              </a>
              <a
                href="#brand-systems"
                className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
              >
                Brand Systems
              </a>
            </>
          )}
          <a
            href="#saved-decks"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {isAdminMode ? 'Saved Decks' : 'Verified Benchmarks'}
          </a>
        </nav>

        {/* Zone 3: 1 primary action button ("Download to Gallery") */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleDownloadSlideToGallery}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            Download to Gallery
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Section 01: Visitor Showcase Mode (Default) & Admin Studio (?mode=admin) */}
        <section id="studio-workspace" className="scroll-mt-16 pt-8 pb-12 px-6">
          <div className="max-w-[1360px] mx-auto space-y-6">
            {/* Hero Proposition Card with Ambient Aurora Mesh Background */}
            <div
              className={`p-6 sm:p-8 border space-y-6 shadow-xs ${
                isAdminMode
                  ? 'border-slate-200/90 bg-white/85 text-slate-900'
                  : 'aurora-ambient-stage border-slate-800 text-white'
              }`}
              style={
                isAdminMode
                  ? { backgroundImage: activeAtmosphere.heroMeshCss }
                  : undefined
              }
            >
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2.5 max-w-3xl">
                  <div
                    className={`flex flex-wrap items-center gap-2 text-xs ${
                      isAdminMode ? 'text-slate-600' : 'text-sky-300'
                    }`}
                  >
                    <span
                      data-testid="access-mode-pill"
                      className={`font-semibold inline-flex items-center gap-1 ${
                        isAdminMode ? 'text-blue-700' : 'text-sky-300'
                      }`}
                    >
                      {!isAdminMode && (
                        <Lock className="w-3 h-3 text-sky-300" aria-hidden="true" />
                      )}
                      {isAdminMode
                        ? '01. Admin Studio Mode (?mode=admin Unlocked)'
                        : '01. Visitor Showcase Mode · Base Design Locked'}
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
                    text="Interactive 3D Presentation Showcase with Instant Visitor Media Injection"
                    animationStyle={headlineAnimation}
                    primaryColorHex={isAdminMode ? '#0F172A' : '#F8FAFC'}
                    accentColorHex={activeAtmosphere.threeKeyLightHex}
                    className={`text-3xl sm:text-4xl font-bold tracking-tight font-display leading-tight ${
                      isAdminMode ? 'text-slate-900' : 'text-white'
                    }`}
                  />
                  <p
                    className={`text-sm leading-relaxed max-w-2xl ${
                      isAdminMode ? 'text-slate-600' : 'text-slate-300'
                    }`}
                  >
                    {isAdminMode
                      ? 'Admin View active: all deck configuration panels, inline slide copy editors, typography forms, and animation adjustment sliders are unlocked.'
                      : 'Read-only visual showcase: upload your photos or funny videos into the predefined 3D slots below to automatically trigger spatial depth tilts and floating effects, then click "Download to Gallery" to save a 1920×1080 Full HD render.'}
                  </p>
                </div>

                {/* Primary Action Bar ("Download to Gallery" as Primary CTA + Media Slot Upload) */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    data-testid="visitor-download-gallery-btn"
                    onClick={handleDownloadSlideToGallery}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                    Download to Gallery
                  </button>

                  <button
                    type="button"
                    data-testid="visitor-upload-media-btn"
                    onClick={() => visitorMediaInputRef.current?.click()}
                    className={`px-4 py-2.5 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 ${
                      isAdminMode
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-white text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    Upload Your Media
                  </button>

                  <button
                    type="button"
                    data-testid="visitor-sample-funny-video-btn"
                    onClick={handleInjectSampleFunnyVideo}
                    className={`px-3.5 py-2.5 text-xs font-medium border rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isAdminMode
                        ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                        : 'bg-slate-900/90 border-white/20 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                    Try Sample Funny Video
                  </button>

                  {isAdminMode && (
                    <button
                      type="button"
                      onClick={() => setShow3DAnimation((prev) => !prev)}
                      aria-pressed={show3DAnimation}
                      className={`px-3 py-2.5 text-xs font-medium border rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                        show3DAnimation
                          ? 'bg-indigo-950 border-indigo-800 text-white'
                          : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" aria-hidden="true" />
                      {show3DAnimation ? 'Hide 3D Stage' : 'Show 3D Stage'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsPresenting(true)}
                    className={`px-3.5 py-2.5 text-xs font-medium border rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                      isAdminMode
                        ? 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                        : 'bg-slate-900/90 border-white/20 text-white hover:bg-slate-800'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    Present Fullscreen
                  </button>
                </div>
              </div>

              {/* ADMIN-ONLY Parameter Tweaking Strip: Atmosphere & Headline Animation Switchers */}
              {isAdminMode && (
                <div
                  data-testid="admin-animation-parameter-controls"
                  className="pt-4 border-t border-slate-200/80 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-700 mr-1">
                        Ambient Aurora Glow:
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
                      {enable3DCardTilt
                        ? '3D Spatial Depth Tilt: Active'
                        : 'Enable 3D Spatial Depth Tilt'}
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive Three.js 3D Spatial Presentation Stage (Always Automatic in Visitor Mode) */}
              {(isAdminMode ? show3DAnimation : true) && (
                <ThreeStageShowcase
                  deckTitle={deckTitle}
                  slides={slides}
                  activeSlideIndex={activeSlideIndex}
                  theme={activeTheme}
                  atmosphere={activeAtmosphere}
                  isAdminMode={isAdminMode}
                  onSelectSlideIndex={setActiveSlideIndex}
                />
              )}
            </div>

            {studioBannerNotice && (
              <div
                role="status"
                data-testid="gallery-download-status"
                className="px-4 py-2.5 bg-slate-900 border border-sky-500/40 text-white text-xs font-medium flex items-center justify-between"
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

            {/* CONDITIONAL WORKSPACE: Visitor Read-Only Showcase with Predefined Media Slots vs. Admin 3-Pane Studio (?mode=admin) */}
            {!isAdminMode ? (
              <div
                data-testid="visitor-showcase-stage"
                className="aurora-ambient-stage border border-slate-800 p-6 sm:p-8 space-y-6 text-white"
              >
                {/* Predefined Media Slots Grid (Visitor-Only Upload Workflow, Zero Parameter Sliders) */}
                <div
                  id="visitor-predefined-slots"
                  data-testid="visitor-predefined-slots"
                  className="space-y-3 pb-6 border-b border-white/15"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider font-mono">
                        Predefined 3D Media Slots · Read-Only Visitor Workflow
                      </div>
                      <p className="text-xs text-slate-300">
                        Upload photos or funny videos into any predefined slot below. Smooth 3D depth tilts, floating motion, and dynamic zooms activate automatically.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-300 bg-slate-950/80 border border-white/15 px-2.5 py-1 rounded">
                      Auto 3D Tilt · Auto Floating Orbit · Zero Manual Sliders
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PREDEFINED_MEDIA_SLOTS.map((slot) => {
                      const assigned = slotAssignedAssets[slot.slotIndex];
                      return (
                        <div
                          key={slot.id}
                          data-testid={`predefined-slot-${slot.slotIndex + 1}`}
                          className="bg-slate-950/80 border border-white/15 p-4 flex flex-col justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                              <span className="text-sky-400 font-semibold">
                                {slot.label}
                              </span>
                              <span className="text-slate-400">
                                Slides 0{slot.slideIndices[0] + 1} & 0{slot.slideIndices[1] + 1}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300">
                              {slot.targetDescription}
                            </p>
                            <div className="text-[11px] font-mono text-emerald-300 pt-1 truncate">
                              {assigned
                                ? `Active: ${assigned.name} (${assigned.type.toUpperCase()})`
                                : 'Default 3D Showreel Active · Ready for Upload'}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                            <button
                              type="button"
                              data-testid={`upload-slot-${slot.slotIndex + 1}-btn`}
                              onClick={() => {
                                setActiveUploadSlotIndex(slot.slotIndex);
                                slotMediaInputRef.current?.click();
                              }}
                              className="w-full py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                              Upload into Slot 0{slot.slotIndex + 1}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visitor Showcase Slide Selector & Primary Download to Gallery CTA */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-sky-300">
                      <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="font-semibold">
                        Active Presentation Deck: {deckTitle}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-300">
                        Slide {String(activeSlideIndex + 1).padStart(2, '0')} of{' '}
                        {String(slides.length).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Interactive Slide Switcher & Primary Download Action */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <div
                      role="tablist"
                      aria-label="Showcase slide selector"
                      className="flex items-center gap-1 bg-slate-950/85 p-1 rounded border border-white/15"
                    >
                      {slides.map((s, idx) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={idx === activeSlideIndex}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded transition-colors whitespace-nowrap shrink-0 ${
                            idx === activeSlideIndex
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          Slide {String(idx + 1).padStart(2, '0')}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadSlideToGallery}
                      className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      Download to Gallery
                    </button>
                  </div>
                </div>

                {/* Centered 3D Spatial Showcase Slide Stage (Read-Only, Automatic 3D Tilt + Floating Motion + Dynamic Zoom) */}
                <div className="max-w-5xl mx-auto preserve-3d">
                  <SlideCanvas
                    slide={currentSlide}
                    slideIndex={activeSlideIndex}
                    totalSlides={slides.length}
                    deckTitle={deckTitle}
                    theme={activeTheme}
                    typography={activeTypography}
                    aspectRatio={aspectRatio}
                    showGridGuides={false}
                    editable={false}
                    headlineAnimation="kinetic-3d-wave"
                    enable3DDesignMotion={true}
                  />
                </div>

                {/* Visitor Injected Media Memory Strip */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/15 text-xs text-slate-300">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sky-300">
                      Local Browser Memory Status:
                    </span>
                    <span>
                      {visitorUploadedAssets.length === 0
                        ? 'Ready for local photo or funny video upload (0 repository files modified).'
                        : `${visitorUploadedAssets.length} custom media file(s) active in local memory (${visitorUploadedAssets
                            .map((a) => a.name)
                            .join(', ')}).`}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    High-Res Canvas Export: 1920×1080 PNG
                  </div>
                </div>
              </div>
            ) : (
              /* ADMIN MODE (?mode=admin): Full 3-Pane Studio Workspace Grid Unlocked */
              <div
                data-testid="admin-studio-workspace"
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
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
                          Template Base ({INITIAL_TEMPLATES.length})
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
                        onClick={() => setShowGridGuides((prev) => !prev)}
                        aria-pressed={showGridGuides}
                        className={`px-2.5 py-1.5 text-xs font-medium border rounded transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0 ${
                          showGridGuides
                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <Grid className="w-3.5 h-3.5" aria-hidden="true" />
                        12-Col Grid
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

                {/* RIGHT INSPECTOR (3 Cols): Copy, Photo & Video Editor, and Theme Inspector */}
                <aside
                  aria-label="Slide content, photo video editor, and theme inspector"
                  className="lg:col-span-3 bg-white/95 border border-slate-200 p-4 space-y-4"
                >
                  {/* Segmented Inspector Mode Switch (3 Tabs) */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-md">
                    <button
                      type="button"
                      onClick={() => setInspectorTab('content')}
                      className={`py-1.5 px-1.5 text-[11px] font-medium rounded transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                        inspectorTab === 'content'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3 h-3" aria-hidden="true" />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('media')}
                      className={`py-1.5 px-1.5 text-[11px] font-medium rounded transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                        inspectorTab === 'media'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Film className="w-3 h-3" aria-hidden="true" />
                      Photo / Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('theme')}
                      className={`py-1.5 px-1.5 text-[11px] font-medium rounded transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 ${
                        inspectorTab === 'theme'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Palette className="w-3 h-3" aria-hidden="true" />
                      Theme
                    </button>
                  </div>

                  {inspectorTab === 'content' && (
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
                            handleUpdateSlideField(
                              'sectionKicker',
                              e.target.value
                            )
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
                    </div>
                  )}

                  {inspectorTab === 'media' && (
                    <div className="space-y-3.5">
                      <div className="space-y-1.5">
                        <span className="block text-[11px] font-semibold text-slate-700">
                          Slide Visual Mode
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          {(
                            [
                              { id: 'artwork', label: 'Vector SVG' },
                              { id: 'photo', label: 'Photo' },
                              { id: 'video', label: 'Video' },
                            ] as { id: SlideMediaMode; label: string }[]
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                if (
                                  m.id === 'photo' &&
                                  !currentMedia.url.startsWith('data:image')
                                ) {
                                  handleUpdateSlideMedia({
                                    mode: 'photo',
                                    url: SAMPLE_MEDIA_ASSETS[0].url,
                                    caption: SAMPLE_MEDIA_ASSETS[0].caption,
                                  });
                                } else if (
                                  m.id === 'video' &&
                                  !currentMedia.url.startsWith('procedural://')
                                ) {
                                  handleUpdateSlideMedia({
                                    mode: 'video',
                                    url: 'procedural://cinema-prism',
                                    caption: SAMPLE_MEDIA_ASSETS[3].caption,
                                  });
                                } else {
                                  handleUpdateSlideMedia({ mode: m.id });
                                }
                              }}
                              className={`py-1.5 px-2 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                                currentMedia.mode === m.id
                                  ? 'bg-blue-700 text-white border-blue-700'
                                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 space-y-2">
                        <button
                          type="button"
                          onClick={() => studioMediaInputRef.current?.click()}
                          className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                          Upload Your Own Photo / Video
                        </button>

                        <div>
                          <label
                            htmlFor="inspector-media-preset"
                            className="block text-[11px] font-medium text-slate-500 mb-1"
                          >
                            Or Choose Studio Photo / Video Preset
                          </label>
                          <select
                            id="inspector-media-preset"
                            value={currentMedia.url}
                            onChange={(e) => {
                              const found = SAMPLE_MEDIA_ASSETS.find(
                                (a) => a.url === e.target.value
                              );
                              if (found) {
                                handleUpdateSlideMedia({
                                  mode: found.type,
                                  url: found.url,
                                  caption: found.caption,
                                });
                              }
                            }}
                            className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800"
                          >
                            {SAMPLE_MEDIA_ASSETS.map((a) => (
                              <option key={a.id} value={a.url}>
                                [{a.type.toUpperCase()}] {a.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 space-y-1.5">
                        <span className="block text-[11px] font-semibold text-slate-700">
                          1-Click LUT Filter Presets
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {MEDIA_FILTER_PRESETS.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() =>
                                handleUpdateSlideMedia({
                                  brightness: preset.brightness,
                                  contrast: preset.contrast,
                                  saturation: preset.saturation,
                                  sepia: preset.sepia,
                                  blurPx: preset.blurPx,
                                })
                              }
                              className="px-2 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded whitespace-nowrap shrink-0"
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {inspectorTab === 'theme' && (
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
            )}
          </div>
        </section>

        {/* Section 02: Curated Template Gallery (12 Templates across 6 Categories) */}
        <TemplateGallery
          templates={INITIAL_TEMPLATES}
          themes={themes}
          typographies={TYPOGRAPHY_PAIRS}
          activeTemplateId={activeTemplateId}
          headlineAnimation={isAdminMode ? headlineAnimation : 'kinetic-3d-wave'}
          enable3DDesignMotion={isAdminMode ? enable3DCardTilt : true}
          isAdminMode={isAdminMode}
          onSelectTemplateForStudio={handleLoadTemplateIntoStudio}
          onOpenTemplateMediaEditor={handleOpenTemplateMediaEditor}
          onPreviewTemplateDeck={handlePreviewTemplateModal}
        />

        {/* Section 03 & 04: Admin-Only Media Grading Sliders & Typography/Brand Governance */}
        {isAdminMode && (
          <>
            <MediaStudioSection
              theme={activeTheme}
              headlineAnimation={headlineAnimation}
              enable3DDesignMotion={enable3DCardTilt}
              onApplyMediaToActiveSlide={handleApplyLabMediaToActiveSlide}
            />

            <BrandSystemBuilder
              themes={themes}
              activeTheme={activeTheme}
              typographies={TYPOGRAPHY_PAIRS}
              activeTypography={activeTypography}
              headlineAnimation={headlineAnimation}
              enable3DDesignMotion={enable3DCardTilt}
              isAdminMode={isAdminMode}
              onSelectTheme={setActiveTheme}
              onSelectTypography={setActiveTypography}
              onCreateCustomTheme={handleCreateCustomTheme}
            />
          </>
        )}

        {/* Section 05: Saved Custom Decks & Quantitative Proof */}
        <section
          id="saved-decks"
          className="scroll-mt-16 py-12 border-t border-slate-200/80 px-6"
        >
          <div className="max-w-[1360px] mx-auto space-y-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-medium text-slate-500">
                  05. Workspace Library & Institutional Benchmarks
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
                  Explore saved presentation snapshots or download high-resolution slide captures directly to your device gallery.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadSlideToGallery}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  Download Active Slide to Gallery
                </button>
                {isAdminMode && (
                  <button
                    type="button"
                    onClick={() => setIsExportOpen(true)}
                    className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0"
                  >
                    Export Full Deck Bundle
                  </button>
                )}
              </div>
            </div>

            {/* Saved Decks Grid */}
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
                      <span>
                        {item.slides.length} Slides · {item.aspectRatio}
                      </span>
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
                      Base Architecture: {item.sourceTemplateTitle} · Theme:{' '}
                      {item.theme.name}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadSavedDeck(item)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      Load in Showcase
                    </button>

                    {isAdminMode && (
                      <button
                        type="button"
                        aria-label={`Delete saved deck ${item.name}`}
                        onClick={() => handleDeleteSavedDeck(item.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

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
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">
              {isAdminMode ? 'Admin Mode Active' : 'Visitor Showcase Mode'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#studio-workspace" className="hover:text-slate-900">
              Showcase
            </a>
            <a href="#template-gallery" className="hover:text-slate-900">
              Templates
            </a>
            <a href="#media-studio-lab" className="hover:text-slate-900">
              Photo & Video Lab
            </a>
            <a href="#brand-systems" className="hover:text-slate-900">
              Brand Tokens
            </a>
            <a
              href={isAdminMode ? '?' : '?mode=admin'}
              className="font-mono text-slate-600 hover:text-blue-700"
            >
              {isAdminMode ? 'Exit Admin Mode' : 'Admin Access (?mode=admin)'}
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
