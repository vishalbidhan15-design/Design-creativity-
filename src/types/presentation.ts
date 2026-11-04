export type SlideLayoutType =
  | 'cover-editorial'
  | 'kpi-grid'
  | 'split-narrative'
  | 'financial-waterfall'
  | 'roadmap-timeline'
  | 'comparison-matrix'
  | 'media-showcase';

export type VisualArtworkId =
  | 'arch-pavilion'
  | 'hardware-monolith'
  | 'editorial-workspace'
  | 'sustainable-grid'
  | 'swiss-typography'
  | 'venture-topology'
  | 'dravidian-gopuram'
  | 'nagara-shikhara'
  | 'himalayan-pagoda'
  | 'makrana-mandapa';

export type TempleTextureId =
  | 'dravidian-granite'
  | 'nagara-sandstone'
  | 'himalayan-cedar'
  | 'makrana-marble';

export type AspectRatioFormat = '16:9' | '4:3' | 'A4';

export type TemplateCategory =
  | 'All Templates'
  | 'Sacred & Temple Architecture'
  | 'Pitch & Venture'
  | 'Financial & Board'
  | 'Product & Roadmap'
  | 'Architecture & Brand'
  | 'Media & Video Showreel'
  | 'Marketing & Launch';

export type SlideMediaMode = 'artwork' | 'photo' | 'video';

export interface SlideMediaConfig {
  mode: SlideMediaMode;
  url: string;
  caption: string;
  objectFit: 'cover' | 'contain';
  brightness: number; // 50 to 150 (%)
  contrast: number; // 50 to 150 (%)
  saturation: number; // 0 to 200 (%)
  sepia: number; // 0 to 100 (%)
  blurPx: number; // 0 to 12 (px)
  zoom: number; // 1 to 1.8
  panX: number; // -40 to 40 (%)
  panY: number; // -40 to 40 (%)
  borderRadiusPx: number; // 0 to 24 (px)
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  videoPlaybackRate: number; // 0.5 to 2.0
}

export interface SlideKpiItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  context: string;
}

export interface WaterfallBarItem {
  id: string;
  period: string;
  primaryValue: number;
  secondaryValue: number;
  unitLabel: string;
}

export interface RoadmapMilestone {
  id: string;
  quarter: string;
  title: string;
  deliverable: string;
  owner: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
}

export interface MatrixRow {
  id: string;
  dimension: string;
  baselineSpec: string;
  proposedSpec: string;
  impactDelta: string;
}

export interface SlideData {
  id: string;
  layout: SlideLayoutType;
  sectionKicker: string;
  headline: string;
  subtitle: string;
  bodyCopy: string;
  footnote: string;
  speakerNotes: string;
  artworkId: VisualArtworkId;
  templeTextureId?: TempleTextureId;
  customMedia?: SlideMediaConfig;
  kpis: SlideKpiItem[];
  waterfallBars: WaterfallBarItem[];
  milestones: RoadmapMilestone[];
  matrixRows: MatrixRow[];
}

export interface ThemePalette {
  id: string;
  name: string;
  category: string;
  backgroundHex: string;
  surfaceHex: string;
  textPrimaryHex: string;
  textMutedHex: string;
  accentHex: string;
  borderHex: string;
  isDark: boolean;
}

export interface TypographyPair {
  id: string;
  name: string;
  headingFontClass: 'font-display' | 'font-editorial';
  headingFontFamilyCss: string;
  bodyFontFamilyCss: string;
  monoFontFamilyCss: string;
  description: string;
}

export interface TemplateDeck {
  id: string;
  title: string;
  category: Exclude<TemplateCategory, 'All Templates'>;
  summary: string;
  aspectRatio: AspectRatioFormat;
  defaultThemeId: string;
  defaultTypographyId: string;
  templeTextureId?: TempleTextureId;
  authorTeam: string;
  lastUpdated: string;
  slides: SlideData[];
}

export interface SavedCustomDeck {
  id: string;
  name: string;
  sourceTemplateTitle: string;
  savedAt: string;
  aspectRatio: AspectRatioFormat;
  theme: ThemePalette;
  typographyId: string;
  slides: SlideData[];
}
