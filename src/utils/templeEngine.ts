import { TempleTextureId, VisualArtworkId } from '../types/presentation';

export interface TempleStylePreset {
  id: TempleTextureId;
  templateId: string;
  name: string;
  shortName: string;
  regionTag: string;
  materialLabel: string;
  motifSummary: string;
  defaultThemeId: string;
  artworkId: VisualArtworkId;
  proceduralShowreelUrl: string;
  primaryStoneHex: string;
  goldAccentHex: string;
}

export interface TempleAmbientFxConfig {
  godRays: boolean;
  incenseSmoke: boolean;
  diyaLamps: boolean;
  cinematicPillarPan: boolean;
}

export const DEFAULT_TEMPLE_FX_CONFIG: TempleAmbientFxConfig = {
  godRays: true,
  incenseSmoke: true,
  diyaLamps: true,
  cinematicPillarPan: true,
};

export const TEMPLE_STYLE_PRESETS: TempleStylePreset[] = [
  {
    id: 'dravidian-granite',
    templateId: 'tpl-dravidian-granite-temple',
    name: 'Dravidian Granite Temple',
    shortName: 'Dravidian Granite',
    regionTag: 'Chola & Pandya Canon · South India',
    materialLabel: 'Chiseled Black Granite & 24K Gold Kalash',
    motifSummary:
      'Dark monolithic gneiss-granite, carved yali & gopuram pillar reliefs, and gilded kalash finials.',
    defaultThemeId: 'theme-dravidian-gold',
    artworkId: 'dravidian-gopuram',
    proceduralShowreelUrl: 'procedural://temple-dravidian-sanctum',
    primaryStoneHex: '#0D0C0A',
    goldAccentHex: '#F59E0B',
  },
  {
    id: 'nagara-sandstone',
    templateId: 'tpl-nagara-sandstone-sanctum',
    name: 'Nagara Sandstone Sanctum',
    shortName: 'Nagara Sandstone',
    regionTag: 'Maru-Gurjara & Chandela Canon · North-West India',
    materialLabel: 'Carved Dholpur Sandstone & Jaali Lattice',
    motifSummary:
      'Warm ochre-terracotta sandstone, geometric perforated jaali screens, and curvilinear shikhara spires.',
    defaultThemeId: 'theme-nagara-sandstone',
    artworkId: 'nagara-shikhara',
    proceduralShowreelUrl: 'procedural://temple-nagara-sanctum',
    primaryStoneHex: '#1F130D',
    goldAccentHex: '#FB923C',
  },
  {
    id: 'himalayan-cedar',
    templateId: 'tpl-himalayan-wooden-pagoda',
    name: 'Himalayan Wooden Pagoda',
    shortName: 'Himalayan Pagoda',
    regionTag: 'Kath-Kuni & Pahari Canon · Western Himalayas',
    materialLabel: 'Aged Deodar Cedar, Slate Tiles & Brass Bells',
    motifSummary:
      'Dark Himalayan cedar wood grain, cantilevered slate roofs, and resonant hanging brass temple ghantas.',
    defaultThemeId: 'theme-himalayan-cedar',
    artworkId: 'himalayan-pagoda',
    proceduralShowreelUrl: 'procedural://temple-himalayan-sanctum',
    primaryStoneHex: '#0E1311',
    goldAccentHex: '#EAB308',
  },
  {
    id: 'makrana-marble',
    templateId: 'tpl-white-marble-sanctum',
    name: 'White Marble Sanctum',
    shortName: 'Makrana Marble',
    regionTag: 'Dilwara & Chaumukha Canon · Rajasthan',
    materialLabel: 'Polished Makrana White Marble & Golden Inlay',
    motifSummary:
      'Luminous crystalline white marble with subtle golden lotus parchin kari inlay and carved torana arches.',
    defaultThemeId: 'theme-makrana-marble',
    artworkId: 'makrana-mandapa',
    proceduralShowreelUrl: 'procedural://temple-makrana-sanctum',
    primaryStoneHex: '#FCFBF7',
    goldAccentHex: '#B45309',
  },
];

/**
 * Generates an HD procedural SVG data-URI texture for the 4 temple materials:
 * - dravidian-granite: dark stone speckle, carved pillar flutes, gold kalash border
 * - nagara-sandstone: warm sandstone strata + geometric perforated jaali lattice
 * - himalayan-cedar: rich horizontal wood grain + slate roof shingle geometry + brass bell motif
 * - makrana-marble: polished white marble veining + delicate golden floral/lotus inlay
 */
export function generateProceduralTempleTextureSvg(
  textureId: TempleTextureId
): string {
  if (textureId === 'dravidian-granite') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="dgBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0B0A09"/>
          <stop offset="50%" stop-color="#151310"/>
          <stop offset="100%" stop-color="#090807"/>
        </linearGradient>
        <pattern id="pillarCarving" width="80" height="90" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="90" stroke="#F59E0B" stroke-opacity="0.16" stroke-width="1.5"/>
          <line x1="12" y1="0" x2="12" y2="90" stroke="#A8A29E" stroke-opacity="0.08" stroke-width="1"/>
          <line x1="68" y1="0" x2="68" y2="90" stroke="#A8A29E" stroke-opacity="0.08" stroke-width="1"/>
          <path d="M 12 22 L 40 8 L 68 22 L 40 36 Z" fill="none" stroke="#F59E0B" stroke-opacity="0.14" stroke-width="1"/>
          <circle cx="40" cy="22" r="4" fill="#F59E0B" fill-opacity="0.18"/>
          <rect x="20" y="52" width="40" height="24" fill="none" stroke="#78716C" stroke-opacity="0.14" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="450" fill="url(#dgBg)"/>
      <rect width="800" height="450" fill="url(#pillarCarving)"/>
      <line x1="0" y1="18" x2="800" y2="18" stroke="#F59E0B" stroke-opacity="0.35" stroke-width="1.5"/>
      <line x1="0" y1="432" x2="800" y2="432" stroke="#F59E0B" stroke-opacity="0.35" stroke-width="1.5"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (textureId === 'nagara-sandstone') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="nsBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1E120B"/>
          <stop offset="50%" stop-color="#2C1A11"/>
          <stop offset="100%" stop-color="#170E09"/>
        </linearGradient>
        <pattern id="jaaliLattice" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="none" stroke="#FB923C" stroke-opacity="0.12" stroke-width="1"/>
          <polygon points="32,4 60,32 32,60 4,32" fill="none" stroke="#FDBA74" stroke-opacity="0.18" stroke-width="1.2"/>
          <circle cx="32" cy="32" r="9" fill="none" stroke="#F59E0B" stroke-opacity="0.16" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="800" height="450" fill="url(#nsBg)"/>
      <rect width="800" height="450" fill="url(#jaaliLattice)"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (textureId === 'himalayan-cedar') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
      <defs>
        <linearGradient id="hcBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0E1412"/>
          <stop offset="50%" stop-color="#18201C"/>
          <stop offset="100%" stop-color="#0B100E"/>
        </linearGradient>
        <pattern id="cedarGrain" width="120" height="48" patternUnits="userSpaceOnUse">
          <line x1="0" y1="12" x2="120" y2="12" stroke="#D97706" stroke-opacity="0.12" stroke-width="1"/>
          <line x1="0" y1="28" x2="120" y2="28" stroke="#94A3B8" stroke-opacity="0.09" stroke-width="1"/>
          <path d="M 0 38 Q 30 34, 60 38 T 120 38" fill="none" stroke="#EAB308" stroke-opacity="0.15" stroke-width="1.2"/>
          <circle cx="60" cy="18" r="3" fill="#EAB308" fill-opacity="0.22"/>
        </pattern>
      </defs>
      <rect width="800" height="450" fill="url(#hcBg)"/>
      <rect width="800" height="450" fill="url(#cedarGrain)"/>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  // makrana-marble
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="mmBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FCFBF7"/>
        <stop offset="50%" stop-color="#F5F1E6"/>
        <stop offset="100%" stop-color="#FAF7F0"/>
      </linearGradient>
      <pattern id="marbleInlay" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M 0 25 Q 45 12, 100 32" fill="none" stroke="#D6D3D1" stroke-opacity="0.45" stroke-width="1.2"/>
        <path d="M 0 75 Q 55 88, 100 64" fill="none" stroke="#E7E5E4" stroke-opacity="0.55" stroke-width="1"/>
        <polygon points="50,28 62,50 50,72 38,50" fill="none" stroke="#D97706" stroke-opacity="0.22" stroke-width="1"/>
        <circle cx="50" cy="50" r="4" fill="#B45309" fill-opacity="0.18"/>
      </pattern>
    </defs>
    <rect width="800" height="450" fill="url(#mmBg)"/>
    <rect width="800" height="450" fill="url(#marbleInlay)"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Computes organic flickering diya oil-lamp luminescence in [0.55, 1.0].
 */
export function computeDiyaFlickerIntensity(
  elapsedSec: number,
  lampIndex: number
): number {
  const wave1 = Math.sin(elapsedSec * 5.2 + lampIndex * 1.7) * 0.14;
  const wave2 = Math.cos(elapsedSec * 11.4 + lampIndex * 2.9) * 0.08;
  const raw = 0.8 + wave1 + wave2;
  return Number(Math.max(0.55, Math.min(1.0, raw)).toFixed(3));
}

/**
 * Computes rising incense smoke wisp coordinates and opacity.
 */
export function computeIncenseSmokeOffset(
  elapsedSec: number,
  wispIndex: number
): { xOffset: number; yProgress: number; opacity: number } {
  const cycle = (elapsedSec * 0.14 + wispIndex * 0.27) % 1;
  const xOffset = Number(
    (Math.sin(elapsedSec * 1.4 + wispIndex * 2.1) * 18).toFixed(2)
  );
  const yProgress = Number(cycle.toFixed(3));
  const opacity = Number(
    (Math.sin(cycle * Math.PI) * 0.34).toFixed(3)
  );
  return { xOffset, yProgress, opacity };
}
