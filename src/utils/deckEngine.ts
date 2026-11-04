import {
  AspectRatioFormat,
  SlideData,
  TemplateCategory,
  TemplateDeck,
  ThemePalette,
  TypographyPair,
} from '../types/presentation';

export function parseHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace(/^#/, '');
  if (!/^[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(cleaned)) {
    return null;
  }
  const fullHex =
    cleaned.length === 3
      ? cleaned
          .split('')
          .map((c) => c + c)
          .join('')
      : cleaned;
  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function calculateRelativeLuminance(hex: string): number {
  const rgb = parseHexToRgb(hex);
  if (!rgb) return 0;
  const transformChannel = (val: number) => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  const r = transformChannel(rgb.r);
  const g = transformChannel(rgb.g);
  const b = transformChannel(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function calculateContrastRatio(foregroundHex: string, backgroundHex: string): number {
  const lum1 = calculateRelativeLuminance(foregroundHex);
  const lum2 = calculateRelativeLuminance(backgroundHex);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function getWcagComplianceLevel(
  ratio: number,
  isLargeText = false
): 'AAA' | 'AA' | 'Fail' {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3.0) return 'AA';
    return 'Fail';
  }
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

export function filterTemplates(
  templates: TemplateDeck[],
  category: TemplateCategory,
  searchQuery: string,
  aspectRatio: AspectRatioFormat | 'ALL'
): TemplateDeck[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return templates.filter((tpl) => {
    const matchesCategory =
      category === 'All Templates' || tpl.category === category;
    const matchesRatio =
      aspectRatio === 'ALL' || tpl.aspectRatio === aspectRatio;
    const matchesSearch =
      normalizedQuery === '' ||
      tpl.title.toLowerCase().includes(normalizedQuery) ||
      tpl.summary.toLowerCase().includes(normalizedQuery) ||
      tpl.category.toLowerCase().includes(normalizedQuery) ||
      tpl.slides.some(
        (s) =>
          s.headline.toLowerCase().includes(normalizedQuery) ||
          s.sectionKicker.toLowerCase().includes(normalizedQuery)
      );
    return matchesCategory && matchesRatio && matchesSearch;
  });
}

export function duplicateSlideInDeck(
  slides: SlideData[],
  slideId: string
): SlideData[] {
  const index = slides.findIndex((s) => s.id === slideId);
  if (index === -1) return slides;
  const source = slides[index];
  const copy: SlideData = {
    ...JSON.parse(JSON.stringify(source)),
    id: `${source.id}-copy-${Date.now().toString(36)}`,
    headline: `${source.headline} (Copy)`,
  };
  const next = [...slides];
  next.splice(index + 1, 0, copy);
  return next;
}

export function reorderSlideInDeck(
  slides: SlideData[],
  slideId: string,
  direction: 'up' | 'down'
): SlideData[] {
  const index = slides.findIndex((s) => s.id === slideId);
  if (index === -1) return slides;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= slides.length) return slides;
  const next = [...slides];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}

export function deleteSlideFromDeck(
  slides: SlideData[],
  slideId: string
): SlideData[] {
  if (slides.length <= 1) {
    return slides;
  }
  return slides.filter((s) => s.id !== slideId);
}

export function validateCustomBrandKit(kit: {
  name: string;
  backgroundHex: string;
  surfaceHex: string;
  textHex: string;
  accentHex: string;
}): {
  valid: boolean;
  errors: Record<string, string>;
  contrastRatio: number;
  wcagLevel: 'AAA' | 'AA' | 'Fail';
} {
  const errors: Record<string, string> = {};
  if (!kit.name || kit.name.trim().length < 2) {
    errors.name = 'Brand system name must be at least 2 characters.';
  }
  if (!parseHexToRgb(kit.backgroundHex)) {
    errors.backgroundHex = 'Enter a valid 6-digit hex color (e.g. #0F172A).';
  }
  if (!parseHexToRgb(kit.surfaceHex)) {
    errors.surfaceHex = 'Enter a valid 6-digit hex color (e.g. #1E293B).';
  }
  if (!parseHexToRgb(kit.textHex)) {
    errors.textHex = 'Enter a valid 6-digit hex color (e.g. #F8FAFC).';
  }
  if (!parseHexToRgb(kit.accentHex)) {
    errors.accentHex = 'Enter a valid 6-digit hex color (e.g. #2563EB).';
  }

  const contrastRatio =
    !errors.textHex && !errors.backgroundHex
      ? calculateContrastRatio(kit.textHex, kit.backgroundHex)
      : 1;
  const wcagLevel = getWcagComplianceLevel(contrastRatio, false);

  if (!errors.textHex && !errors.backgroundHex && contrastRatio < 4.5) {
    errors.contrast = `Text-to-background contrast is ${contrastRatio}:1. WCAG AA requires at least 4.5:1.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    contrastRatio,
    wcagLevel,
  };
}

export function generateCssTokens(
  theme: ThemePalette,
  typography: TypographyPair,
  aspectRatio: AspectRatioFormat
): string {
  const ratioValue =
    aspectRatio === '16:9' ? '16 / 9' : aspectRatio === '4:3' ? '4 / 3' : '1.414 / 1';
  return `:root {
  /* FolioDeck Brand System: ${theme.name} */
  --deck-bg-canvas: ${theme.backgroundHex};
  --deck-bg-surface: ${theme.surfaceHex};
  --deck-text-primary: ${theme.textPrimaryHex};
  --deck-text-muted: ${theme.textMutedHex};
  --deck-accent-primary: ${theme.accentHex};
  --deck-border-hairline: ${theme.borderHex};

  /* Typography Pairing: ${typography.name} */
  --deck-font-heading: ${typography.headingFontFamilyCss};
  --deck-font-body: ${typography.bodyFontFamilyCss};
  --deck-font-mono: ${typography.monoFontFamilyCss};

  /* Spatial & Frame Geometry */
  --deck-aspect-ratio: ${ratioValue};
  --deck-safe-margin: 5%;
}`;
}

export function generateStandaloneHtmlDeck(
  deckTitle: string,
  slides: SlideData[],
  theme: ThemePalette,
  typography: TypographyPair,
  aspectRatio: AspectRatioFormat
): string {
  const slideSections = slides
    .map(
      (s, idx) => `
    <section class="slide" data-slide-index="${idx + 1}">
      <header class="slide-header">
        <span class="kicker">${s.sectionKicker}</span>
        <span class="counter">${String(idx + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</span>
      </header>
      <div class="slide-body">
        <h1>${s.headline}</h1>
        <p class="subtitle">${s.subtitle}</p>
        <p class="narrative">${s.bodyCopy}</p>
      </div>
      <footer class="slide-footer">
        <span>${deckTitle}</span>
        <span>${s.footnote}</span>
      </footer>
    </section>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${deckTitle} — Presentation Deck</title>
  <style>
    ${generateCssTokens(theme, typography, aspectRatio)}
    body {
      margin: 0;
      background: #111827;
      color: var(--deck-text-primary);
      font-family: var(--deck-font-body);
      display: grid;
      gap: 32px;
      padding: 32px;
      justify-items: center;
    }
    .slide {
      width: min(1120px, 94vw);
      aspect-ratio: var(--deck-aspect-ratio);
      background: var(--deck-bg-canvas);
      border: 1px solid var(--deck-border-hairline);
      padding: 48px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .slide-header, .slide-footer {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--deck-text-muted);
      border-bottom: 1px solid var(--deck-border-hairline);
      padding-bottom: 12px;
    }
    .slide-footer {
      border-bottom: none;
      border-top: 1px solid var(--deck-border-hairline);
      padding-top: 12px;
      padding-bottom: 0;
    }
    h1 {
      font-family: var(--deck-font-heading);
      font-size: 36px;
      margin: 0 0 12px 0;
    }
    .subtitle {
      color: var(--deck-accent-primary);
      font-weight: 600;
      margin: 0 0 16px 0;
    }
    .counter {
      font-family: var(--deck-font-mono);
      font-variant-numeric: tabular-nums;
    }
  </style>
</head>
<body>
  ${slideSections}
</body>
</html>`;
}

export interface AtmospherePreset {
  id: string;
  name: string;
  pageBgCss: string;
  heroMeshCss: string;
  threeSkyHex: string;
  threeKeyLightHex: string;
  threeRimLightHex: string;
  accentBadgeText: string;
}

export const ATMOSPHERE_PRESETS: AtmospherePreset[] = [
  {
    id: 'atmo-aurora-cobalt',
    name: 'Aurora Cobalt & Violet',
    pageBgCss:
      'radial-gradient(circle at 12% 10%, rgba(59, 130, 246, 0.16), transparent 42%), radial-gradient(circle at 88% 14%, rgba(139, 92, 246, 0.15), transparent 45%), radial-gradient(circle at 50% 85%, rgba(14, 165, 233, 0.10), transparent 50%), linear-gradient(180deg, #F4F7FF 0%, #EEF2FF 50%, #F8FAFC 100%)',
    heroMeshCss:
      'linear-gradient(135deg, rgba(30, 64, 175, 0.08) 0%, rgba(109, 40, 217, 0.08) 50%, rgba(14, 165, 233, 0.06) 100%)',
    threeSkyHex: '#0B1120',
    threeKeyLightHex: '#60A5FA',
    threeRimLightHex: '#A78BFA',
    accentBadgeText: 'Cobalt & Violet Mesh',
  },
  {
    id: 'atmo-sunset-amber',
    name: 'Solstice Amber & Rose',
    pageBgCss:
      'radial-gradient(circle at 15% 12%, rgba(245, 158, 11, 0.16), transparent 42%), radial-gradient(circle at 85% 18%, rgba(244, 63, 94, 0.14), transparent 45%), radial-gradient(circle at 50% 90%, rgba(234, 88, 12, 0.10), transparent 50%), linear-gradient(180deg, #FFFDF9 0%, #FFF7ED 50%, #FAF8F5 100%)',
    heroMeshCss:
      'linear-gradient(135deg, rgba(217, 119, 6, 0.09) 0%, rgba(225, 29, 72, 0.07) 50%, rgba(245, 158, 11, 0.06) 100%)',
    threeSkyHex: '#18101C',
    threeKeyLightHex: '#FBBF24',
    threeRimLightHex: '#FB7185',
    accentBadgeText: 'Warm Amber & Rose Glow',
  },
  {
    id: 'atmo-nordic-emerald',
    name: 'Nordic Emerald & Cyan',
    pageBgCss:
      'radial-gradient(circle at 14% 12%, rgba(16, 185, 129, 0.16), transparent 42%), radial-gradient(circle at 86% 16%, rgba(6, 182, 212, 0.15), transparent 44%), radial-gradient(circle at 50% 85%, rgba(59, 130, 246, 0.10), transparent 50%), linear-gradient(180deg, #F2FBF9 0%, #ECFEFF 50%, #F8FAFC 100%)',
    heroMeshCss:
      'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(8, 145, 178, 0.08) 50%, rgba(37, 99, 235, 0.05) 100%)',
    threeSkyHex: '#09191B',
    threeKeyLightHex: '#34D399',
    threeRimLightHex: '#22D3EE',
    accentBadgeText: 'Emerald & Cyan Horizon',
  },
  {
    id: 'atmo-prism-atelier',
    name: 'Prism Atelier Spectrum',
    pageBgCss:
      'radial-gradient(circle at 10% 15%, rgba(236, 72, 153, 0.14), transparent 40%), radial-gradient(circle at 50% 10%, rgba(99, 102, 241, 0.15), transparent 45%), radial-gradient(circle at 90% 20%, rgba(20, 184, 166, 0.15), transparent 42%), linear-gradient(180deg, #FAF7FF 0%, #F4F8FF 55%, #F8FAFC 100%)',
    heroMeshCss:
      'linear-gradient(135deg, rgba(219, 39, 119, 0.07) 0%, rgba(79, 70, 229, 0.08) 50%, rgba(13, 148, 136, 0.07) 100%)',
    threeSkyHex: '#130F26',
    threeKeyLightHex: '#818CF8',
    threeRimLightHex: '#F472B6',
    accentBadgeText: 'Tri-Chromatic Spectrum',
  },
];

export function computeSlideLayerOffset(
  layerIndex: number,
  totalLayers: number,
  explosionFactor: number
): { zOffset: number; yOffset: number; rotationY: number } {
  const clamped = Math.max(0, Math.min(1, explosionFactor));
  const centeredIdx = layerIndex - (totalLayers - 1) / 2;
  const baseSpacingZ = 0.55 + clamped * 1.15;
  const baseSpacingY = 0.18 + clamped * 0.35;
  return {
    zOffset: Number((centeredIdx * baseSpacingZ).toFixed(4)),
    yOffset: Number((centeredIdx * baseSpacingY).toFixed(4)),
    rotationY: Number((centeredIdx * 0.08 * clamped).toFixed(4)),
  };
}

export type HeadlineAnimationStyle =
  | 'kinetic-3d-wave'
  | 'stagger-3d-flip'
  | 'aurora-shimmer'
  | 'editorial-depth';

export interface HeadlineAnimationPreset {
  id: HeadlineAnimationStyle;
  name: string;
  description: string;
}

export const HEADLINE_ANIMATION_PRESETS: HeadlineAnimationPreset[] = [
  {
    id: 'kinetic-3d-wave',
    name: '3D Kinetic Wave',
    description: 'Word-by-word 3D spatial wave with luminous gradient shimmer',
  },
  {
    id: 'stagger-3d-flip',
    name: '3D Perspective Flip',
    description: 'Staggered 3D rotational flip along the X and Z axes',
  },
  {
    id: 'aurora-shimmer',
    name: 'Chromatic Shimmer',
    description: 'Continuous multi-spectrum light sweep across display letterforms',
  },
  {
    id: 'editorial-depth',
    name: 'Architectural Float',
    description: 'Subtle 3D Z-axis elevation with synchronized word breathing',
  },
];

export interface AnimatedWordToken {
  word: string;
  index: number;
  delayMs: number;
  isAccentWord: boolean;
}

export function tokenizeHeadlineForAnimation(headline: string): AnimatedWordToken[] {
  const cleaned = (headline || '').trim();
  if (!cleaned) return [];
  const words = cleaned.split(/\s+/);
  return words.map((word, index) => {
    const stripped = word.replace(/[^a-zA-Z0-9%$+.-]/g, '');
    const isNumericOrMetric = /^[+$%-]?\d/.test(stripped) || stripped.length >= 8;
    const isHighlightPosition = index === 0 || index === words.length - 1 || isNumericOrMetric;
    return {
      word,
      index,
      delayMs: index * 65,
      isAccentWord: isHighlightPosition,
    };
  });
}

export function computeCard3DTiltTransform(
  normX: number,
  normY: number,
  maxDegrees = 8,
  elevationZPx = 12
): string {
  const clampedX = Math.max(-1, Math.min(1, normX));
  const clampedY = Math.max(-1, Math.min(1, normY));
  const rotateY = Number((clampedX * maxDegrees).toFixed(2));
  const rotateX = Number((-clampedY * maxDegrees).toFixed(2));
  return `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${elevationZPx}px)`;
}

export const DEFAULT_SLIDE_MEDIA_CONFIG: import('../types/presentation').SlideMediaConfig = {
  mode: 'artwork',
  url: '',
  caption: 'Executive Visual Plate · 4K Studio Capture',
  objectFit: 'cover',
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  blurPx: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
  borderRadiusPx: 4,
  videoAutoplay: true,
  videoLoop: true,
  videoMuted: true,
  videoPlaybackRate: 1,
};

export interface MediaFilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  blurPx: number;
}

export const MEDIA_FILTER_PRESETS: MediaFilterPreset[] = [
  {
    id: 'preset-original',
    name: 'Original Studio',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sepia: 0,
    blurPx: 0,
  },
  {
    id: 'preset-monochrome',
    name: 'Cinema Monochrome',
    brightness: 105,
    contrast: 128,
    saturation: 0,
    sepia: 6,
    blurPx: 0,
  },
  {
    id: 'preset-kodachrome',
    name: 'Warm Kodachrome',
    brightness: 104,
    contrast: 116,
    saturation: 135,
    sepia: 24,
    blurPx: 0,
  },
  {
    id: 'preset-keynote-vivid',
    name: 'High-Contrast Keynote',
    brightness: 106,
    contrast: 132,
    saturation: 145,
    sepia: 0,
    blurPx: 0,
  },
  {
    id: 'preset-blueprint',
    name: 'Soft Matte Film',
    brightness: 108,
    contrast: 92,
    saturation: 82,
    sepia: 12,
    blurPx: 0,
  },
];

function createStudioSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

export interface SampleMediaAsset {
  id: string;
  title: string;
  type: 'photo' | 'video';
  url: string;
  caption: string;
}

export const SAMPLE_MEDIA_ASSETS: SampleMediaAsset[] = [
  {
    id: 'sample-photo-arch',
    title: 'Nordic Timber Pavilion Photo',
    type: 'photo',
    caption: 'Copenhagen Waterfront Pavilion · Architectural Photography Plate',
    url: createStudioSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0F172A"/>
            <stop offset="50%" stop-color="#1E3A8A"/>
            <stop offset="100%" stop-color="#C2410C"/>
          </linearGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1E293B"/>
            <stop offset="100%" stop-color="#090D16"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="440" fill="url(#sky)"/>
        <circle cx="920" cy="190" r="88" fill="#FBBF24" fill-opacity="0.85"/>
        <rect y="440" width="1200" height="235" fill="url(#water)"/>
        <polygon points="120,250 1080,170 1040,220 120,295" fill="#F59E0B"/>
        <rect x="210" y="275" width="26" height="165" fill="#F8FAFC"/>
        <rect x="390" y="260" width="26" height="180" fill="#F8FAFC"/>
        <rect x="570" y="245" width="26" height="195" fill="#F8FAFC"/>
        <rect x="750" y="230" width="26" height="210" fill="#F8FAFC"/>
        <rect x="930" y="215" width="26" height="225" fill="#F8FAFC"/>
        <rect x="100" y="425" width="1000" height="22" fill="#E2E8F0"/>
        <line x1="100" y1="490" x2="1100" y2="490" stroke="#38BDF8" stroke-width="3" stroke-opacity="0.45"/>
        <line x1="220" y1="535" x2="980" y2="535" stroke="#FBBF24" stroke-width="2" stroke-opacity="0.4"/>
      </svg>
    `),
  },
  {
    id: 'sample-photo-hardware',
    title: 'Titanium Monolith Studio Photo',
    type: 'photo',
    caption: 'Grade-5 Anodized Optical Chassis · Studio Macro Capture',
    url: createStudioSvgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675">
        <defs>
          <radialGradient id="studioGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.45"/>
            <stop offset="55%" stop-color="#1E1B4B" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#09090B"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="675" fill="url(#studioGlow)"/>
        <rect x="260" y="110" width="680" height="455" rx="24" fill="#18181B" stroke="#60A5FA" stroke-width="4"/>
        <rect x="310" y="150" width="580" height="375" rx="14" fill="#09090B" stroke="#38BDF8" stroke-width="2"/>
        <circle cx="600" cy="337" r="118" fill="#1E293B" stroke="#F59E0B" stroke-width="6"/>
        <circle cx="600" cy="337" r="56" fill="#3B82F6" fill-opacity="0.35" stroke="#F8FAFC" stroke-width="3"/>
        <circle cx="600" cy="337" r="16" fill="#F59E0B"/>
        <line x1="340" y1="337" x2="460" y2="337" stroke="#38BDF8" stroke-width="4"/>
        <line x1="740" y1="337" x2="860" y2="337" stroke="#38BDF8" stroke-width="4"/>
      </svg>
    `),
  },
  {
    id: 'sample-video-showreel',
    title: '4K Telemetry & Motion Showreel (Video)',
    type: 'video',
    caption: 'procedural://showreel-telemetry',
    url: 'procedural://showreel-telemetry',
  },
  {
    id: 'sample-video-aurora',
    title: 'Cinema Prism Light Wave (Video)',
    type: 'video',
    caption: 'Cinema Prism Light Wave · 4K Motion Loop',
    url: 'procedural://cinema-prism',
  },
  {
    id: 'sample-video-funny',
    title: 'Playful 3D Bouncing Arcade & Confetti (Funny Video)',
    type: 'video',
    caption: 'Visitor Showcase · Playful 3D Arcade & Confetti Clip',
    url: 'procedural://funny-arcade-reel',
  },
];

export function buildMediaFilterCss(
  media: import('../types/presentation').SlideMediaConfig
): string {
  const b = Math.max(20, Math.min(200, media.brightness ?? 100));
  const c = Math.max(20, Math.min(200, media.contrast ?? 100));
  const s = Math.max(0, Math.min(250, media.saturation ?? 100));
  const sep = Math.max(0, Math.min(100, media.sepia ?? 0));
  const blur = Math.max(0, Math.min(20, media.blurPx ?? 0));
  return `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sep}%) blur(${blur}px)`;
}

export function buildMediaTransformCss(
  media: import('../types/presentation').SlideMediaConfig
): string {
  const z = Number(Math.max(0.5, Math.min(2.5, media.zoom ?? 1)).toFixed(2));
  const px = Number(Math.max(-50, Math.min(50, media.panX ?? 0)).toFixed(1));
  const py = Number(Math.max(-50, Math.min(50, media.panY ?? 0)).toFixed(1));
  return `scale(${z}) translate(${px}%, ${py}%)`;
}

export function isAdminModeFromSearch(search: string): boolean {
  if (!search) return false;
  const normalized = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(normalized);
  const mode = params.get('mode');
  return Boolean(mode && mode.trim().toLowerCase() === 'admin');
}

export interface VisitorUploadedAsset {
  id: string;
  name: string;
  type: 'photo' | 'video';
  url: string;
}

export interface PredefinedMediaSlot {
  slotIndex: number;
  id: string;
  label: string;
  targetDescription: string;
  slideIndices: number[];
}

export const PREDEFINED_MEDIA_SLOTS: PredefinedMediaSlot[] = [
  {
    slotIndex: 0,
    id: 'slot-01-hero',
    label: 'Slot 01 · Hero Keynote Frame',
    targetDescription: 'Injects into Slide 01 & Slide 04 with 3D Depth Tilt + Dynamic Zoom',
    slideIndices: [0, 3],
  },
  {
    slotIndex: 1,
    id: 'slot-02-narrative',
    label: 'Slot 02 · Feature Narrative Frame',
    targetDescription: 'Injects into Slide 02 & Slide 05 with Floating 3D Motion',
    slideIndices: [1, 4],
  },
  {
    slotIndex: 2,
    id: 'slot-03-showreel',
    label: 'Slot 03 · Spotlight Showreel Frame',
    targetDescription: 'Injects into Slide 03 & Slide 06 with Aurora Spatial Glow',
    slideIndices: [2, 5],
  },
];

export function injectVisitorSlotMediaIntoSlides(
  slides: SlideData[],
  slotIndex: number,
  asset: VisitorUploadedAsset
): SlideData[] {
  const normalizedSlot = Math.max(0, Math.min(2, slotIndex));
  return slides.map((slide, index) => {
    if (index % 3 !== normalizedSlot) return slide;
    const supportsMediaPlaceholder =
      slide.layout === 'cover-editorial' ||
      slide.layout === 'split-narrative' ||
      slide.layout === 'media-showcase';

    return {
      ...slide,
      layout: supportsMediaPlaceholder ? slide.layout : 'media-showcase',
      customMedia: {
        ...DEFAULT_SLIDE_MEDIA_CONFIG,
        ...(slide.customMedia || {}),
        mode: asset.type,
        url: asset.url,
        caption: `Slot 0${normalizedSlot + 1} · ${asset.name}`,
        brightness: 104,
        contrast: 108,
        saturation: 112,
        zoom: 1.08,
        borderRadiusPx: 6,
        videoAutoplay: true,
        videoLoop: true,
        videoMuted: true,
        videoPlaybackRate: 1,
      },
    };
  });
}

export function injectVisitorMediaIntoSlides(
  slides: SlideData[],
  assets: VisitorUploadedAsset[]
): SlideData[] {
  if (!assets || assets.length === 0) return slides;

  return slides.map((slide, index) => {
    const asset = assets[index % assets.length];
    const supportsMediaPlaceholder =
      slide.layout === 'cover-editorial' ||
      slide.layout === 'split-narrative' ||
      slide.layout === 'media-showcase';

    return {
      ...slide,
      layout: supportsMediaPlaceholder ? slide.layout : 'media-showcase',
      customMedia: {
        ...DEFAULT_SLIDE_MEDIA_CONFIG,
        ...(slide.customMedia || {}),
        mode: asset.type,
        url: asset.url,
        caption: `${asset.name} · Injected Visitor ${
          asset.type === 'video' ? 'Video' : 'Photo'
        }`,
        brightness: 104,
        contrast: 108,
        saturation: 112,
        zoom: 1.08,
        borderRadiusPx: 6,
        videoAutoplay: true,
        videoLoop: true,
        videoMuted: true,
        videoPlaybackRate: 1,
      },
    };
  });
}

