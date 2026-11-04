export type SlideLayoutType =
  | 'cover-editorial'
  | 'kpi-grid'
  | 'split-narrative'
  | 'financial-waterfall'
  | 'roadmap-timeline'
  | 'comparison-matrix';

export type VisualArtworkId =
  | 'arch-pavilion'
  | 'hardware-monolith'
  | 'editorial-workspace'
  | 'sustainable-grid'
  | 'swiss-typography'
  | 'venture-topology';

export type AspectRatioFormat = '16:9' | '4:3' | 'A4';

export type TemplateCategory =
  | 'All Templates'
  | 'Pitch & Venture'
  | 'Financial & Board'
  | 'Product & Roadmap'
  | 'Architecture & Brand';

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
