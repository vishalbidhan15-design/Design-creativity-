import React, { useState } from 'react';
import { ThemePalette, TypographyPair } from '../types/presentation';
import {
  calculateContrastRatio,
  getWcagComplianceLevel,
  HeadlineAnimationStyle,
  validateCustomBrandKit,
} from '../utils/deckEngine';
import { AnimatedHeadline } from './AnimatedHeadline';
import { Check, Plus } from 'lucide-react';

interface BrandSystemBuilderProps {
  themes: ThemePalette[];
  activeTheme: ThemePalette;
  typographies: TypographyPair[];
  activeTypography: TypographyPair;
  headlineAnimation?: HeadlineAnimationStyle;
  enable3DDesignMotion?: boolean;
  onSelectTheme: (theme: ThemePalette) => void;
  onSelectTypography: (typo: TypographyPair) => void;
  onCreateCustomTheme: (newTheme: ThemePalette) => void;
}

export const BrandSystemBuilder: React.FC<BrandSystemBuilderProps> = ({
  themes,
  activeTheme,
  typographies,
  activeTypography,
  headlineAnimation = 'kinetic-3d-wave',
  enable3DDesignMotion = true,
  onSelectTheme,
  onSelectTypography,
  onCreateCustomTheme,
}) => {
  const [kitName, setKitName] = useState('Zurich Institutional Slate');
  const [backgroundHex, setBackgroundHex] = useState('#0F172A');
  const [surfaceHex, setSurfaceHex] = useState('#1E293B');
  const [textHex, setTextHex] = useState('#F8FAFC');
  const [accentHex, setAccentHex] = useState('#38BDF8');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const liveValidation = validateCustomBrandKit({
    name: kitName,
    backgroundHex,
    surfaceHex,
    textHex,
    accentHex,
  });

  const handleCreateBrandKit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateCustomBrandKit({
      name: kitName,
      backgroundHex,
      surfaceHex,
      textHex,
      accentHex,
    });
    if (!check.valid) {
      setFormErrors(check.errors);
      setStatusMessage(null);
      return;
    }

    setFormErrors({});
    const newPalette: ThemePalette = {
      id: `custom-theme-${Date.now()}`,
      name: kitName.trim(),
      category: 'Custom Brand System',
      backgroundHex: backgroundHex.trim(),
      surfaceHex: surfaceHex.trim(),
      textPrimaryHex: textHex.trim(),
      textMutedHex: '#94A3B8',
      accentHex: accentHex.trim(),
      borderHex: surfaceHex.trim(),
      isDark: true,
    };

    onCreateCustomTheme(newPalette);
    setStatusMessage(
      `Applied "${newPalette.name}" across all slides (${check.contrastRatio}:1 WCAG ${check.wcagLevel}).`
    );
  };

  return (
    <section id="brand-systems" className="scroll-mt-16 py-12 border-t border-slate-200/80 bg-white/85">
      <div className="max-w-[1360px] mx-auto px-6 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs font-medium text-slate-500">
              04. Brand Governance & Contrast Architecture
            </p>
            <AnimatedHeadline
              as="h2"
              text="Color Token Calibration & Real-Time WCAG Legibility Gate"
              animationStyle={headlineAnimation}
              primaryColorHex="#0F172A"
              accentColorHex="#2563EB"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display"
            />
            <p className="text-sm text-slate-600 leading-relaxed">
              Test and apply architectural color systems and editorial font pairings across your entire slide deck. Every palette enforces strict 60-30-10 color allocation and minimum 4.5:1 text contrast.
            </p>
          </div>

          <div className="text-xs font-mono tabular-nums text-slate-600 border border-slate-200 px-4 py-2.5 bg-slate-50">
            Active System: <strong className="text-slate-900">{activeTheme.name}</strong> ·{' '}
            {calculateContrastRatio(activeTheme.textPrimaryHex, activeTheme.backgroundHex)}:1 Contrast
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Curated Palettes & Typography Matrix */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Curated Presentation Palettes ({themes.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 preserve-3d">
                {themes.map((palette, idx) => {
                  const isSelected = palette.id === activeTheme.id;
                  const ratio = calculateContrastRatio(
                    palette.textPrimaryHex,
                    palette.backgroundHex
                  );
                  const level = getWcagComplianceLevel(ratio);
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      onClick={() => onSelectTheme(palette)}
                      className={`p-4 text-left border transition-transform duration-150 flex flex-col justify-between gap-3 ${
                        enable3DDesignMotion ? 'animate-headline-depth' : ''
                      } ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      style={{ animationDelay: `${idx * 120}ms` }}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {palette.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                        )}
                      </div>

                      {/* 60-30-10 Swatch Bar */}
                      <div className="w-full h-6 flex border border-slate-200 overflow-hidden">
                        <div
                          className="w-[60%] h-full"
                          style={{ backgroundColor: palette.backgroundHex }}
                          title={`60% Canvas: ${palette.backgroundHex}`}
                        />
                        <div
                          className="w-[30%] h-full"
                          style={{ backgroundColor: palette.surfaceHex }}
                          title={`30% Surface: ${palette.surfaceHex}`}
                        />
                        <div
                          className="w-[10%] h-full"
                          style={{ backgroundColor: palette.accentHex }}
                          title={`10% Accent: ${palette.accentHex}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums w-full">
                        <span>{palette.category}</span>
                        <span>
                          {ratio}:1 · WCAG {level}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography Pairings */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900">
                Editorial Typography Pairings (2+1 Font Rule)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {typographies.map((typo) => {
                  const isSelected = typo.id === activeTypography.id;
                  return (
                    <button
                      key={typo.id}
                      type="button"
                      onClick={() => onSelectTypography(typo)}
                      className={`p-4 text-left border transition-colors space-y-1.5 ${
                        isSelected
                          ? 'border-blue-700 bg-blue-50/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-sm font-bold text-slate-900"
                          style={{ fontFamily: typo.headingFontFamilyCss }}
                        >
                          {typo.name}
                        </span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {typo.description}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500 pt-1">
                        Data: JetBrains Mono (tabular-nums)
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Custom Brand Token Validator Form */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Create & Audit Custom Brand Kit
              </h3>
              <p className="text-xs text-slate-600">
                Define your organization’s hex tokens below. Palettes failing WCAG AA (4.5:1) legibility are automatically flagged before deck application.
              </p>
            </div>

            <form onSubmit={handleCreateBrandKit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="brand-kit-name"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Brand System Name
                </label>
                <input
                  id="brand-kit-name"
                  type="text"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="e.g. Geneva Private Banking"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700"
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="brand-bg-hex"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    60% Dominant Canvas Hex
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 border border-slate-300 shrink-0"
                      style={{ backgroundColor: backgroundHex }}
                    />
                    <input
                      id="brand-bg-hex"
                      type="text"
                      value={backgroundHex}
                      onChange={(e) => setBackgroundHex(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
                  {formErrors.backgroundHex && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.backgroundHex}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="brand-surface-hex"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    30% Structural Surface Hex
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 border border-slate-300 shrink-0"
                      style={{ backgroundColor: surfaceHex }}
                    />
                    <input
                      id="brand-surface-hex"
                      type="text"
                      value={surfaceHex}
                      onChange={(e) => setSurfaceHex(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
                  {formErrors.surfaceHex && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.surfaceHex}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="brand-text-hex"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    Primary Typography Hex
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 border border-slate-300 shrink-0"
                      style={{ backgroundColor: textHex }}
                    />
                    <input
                      id="brand-text-hex"
                      type="text"
                      value={textHex}
                      onChange={(e) => setTextHex(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
                  {formErrors.textHex && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.textHex}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="brand-accent-hex"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    10% Primary Accent Hex
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 border border-slate-300 shrink-0"
                      style={{ backgroundColor: accentHex }}
                    />
                    <input
                      id="brand-accent-hex"
                      type="text"
                      value={accentHex}
                      onChange={(e) => setAccentHex(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900"
                    />
                  </div>
                  {formErrors.accentHex && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.accentHex}</p>
                  )}
                </div>
              </div>

              {/* Live Contrast Preview Strip */}
              <div
                className="p-4 border flex items-center justify-between"
                style={{
                  backgroundColor: backgroundHex,
                  borderColor: surfaceHex,
                  color: textHex,
                }}
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-bold">Live Contrast Sample</div>
                  <div className="text-[11px]" style={{ color: accentHex }}>
                    Accent Highlight · 10% Allocation
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="text-sm font-bold">{liveValidation.contrastRatio}:1</div>
                  <div className="text-[11px]">WCAG {liveValidation.wcagLevel}</div>
                </div>
              </div>

              {formErrors.contrast && (
                <p role="alert" className="text-xs text-red-600 font-medium">
                  {formErrors.contrast}
                </p>
              )}

              {statusMessage && (
                <p role="status" className="text-xs text-emerald-700 font-medium">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full px-4 py-2.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Validate & Apply Brand Kit to Deck
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
