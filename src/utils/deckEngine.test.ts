import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateContrastRatio,
  getWcagComplianceLevel,
  filterTemplates,
  duplicateSlideInDeck,
  reorderSlideInDeck,
  deleteSlideFromDeck,
  validateCustomBrandKit,
  generateCssTokens,
} from './deckEngine';
import { INITIAL_TEMPLATES, THEME_PALETTES, TYPOGRAPHY_PAIRS } from '../data/initialTemplates';

test('WCAG contrast calculation computes accurate ratios and compliance levels', () => {
  const ratioBw = calculateContrastRatio('#FFFFFF', '#000000');
  assert.equal(ratioBw, 21);
  assert.equal(getWcagComplianceLevel(ratioBw), 'AAA');

  const obsidianTheme = THEME_PALETTES[0];
  const ratioTheme = calculateContrastRatio(
    obsidianTheme.textPrimaryHex,
    obsidianTheme.backgroundHex
  );
  assert.ok(ratioTheme >= 12, `Expected high contrast >= 12, got ${ratioTheme}`);
  assert.equal(getWcagComplianceLevel(ratioTheme), 'AAA');

  const lowContrast = calculateContrastRatio('#94A3B8', '#CBD5E1');
  assert.equal(getWcagComplianceLevel(lowContrast), 'Fail');
});

test('filterTemplates filters by category, aspect ratio, and search query', () => {
  const pitchOnly = filterTemplates(
    INITIAL_TEMPLATES,
    'Pitch & Venture',
    '',
    'ALL'
  );
  assert.ok(pitchOnly.length >= 1);
  assert.ok(pitchOnly.every((t) => t.category === 'Pitch & Venture'));

  const searchMatch = filterTemplates(
    INITIAL_TEMPLATES,
    'All Templates',
    'Shareholder',
    'ALL'
  );
  assert.equal(searchMatch.length, 1);
  assert.ok(searchMatch[0].title.includes('Shareholder'));

  const ratioFilter = filterTemplates(
    INITIAL_TEMPLATES,
    'All Templates',
    '',
    'A4'
  );
  assert.ok(ratioFilter.every((t) => t.aspectRatio === 'A4'));
});

test('slide operations duplicate, reorder, and enforce minimum 1 slide on delete', () => {
  const baseSlides = INITIAL_TEMPLATES[0].slides;
  const initialCount = baseSlides.length;
  const firstId = baseSlides[0].id;

  const afterDup = duplicateSlideInDeck(baseSlides, firstId);
  assert.equal(afterDup.length, initialCount + 1);
  assert.equal(afterDup[1].headline, `${baseSlides[0].headline} (Copy)`);

  const afterMoveDown = reorderSlideInDeck(baseSlides, firstId, 'down');
  assert.equal(afterMoveDown[1].id, firstId);

  const singleSlide = [baseSlides[0]];
  const afterDeleteSingle = deleteSlideFromDeck(singleSlide, firstId);
  assert.equal(afterDeleteSingle.length, 1, 'Should not delete the last remaining slide');
});

test('validateCustomBrandKit rejects low-contrast or malformed hex values and accepts valid kits', () => {
  const invalidKit = validateCustomBrandKit({
    name: 'A',
    backgroundHex: '#FFFFFF',
    surfaceHex: '#F8FAFC',
    textHex: '#E2E8F0', // fails contrast on white
    accentHex: 'not-a-hex',
  });
  assert.equal(invalidKit.valid, false);
  assert.ok(invalidKit.errors.name);
  assert.ok(invalidKit.errors.accentHex);
  assert.ok(invalidKit.errors.contrast);

  const validKit = validateCustomBrandKit({
    name: 'Zurich Financial Dark',
    backgroundHex: '#0B0F19',
    surfaceHex: '#111827',
    textHex: '#F8FAFC',
    accentHex: '#3B82F6',
  });
  assert.equal(validKit.valid, true);
  assert.equal(validKit.wcagLevel, 'AAA');
});

test('generateCssTokens outputs expected CSS custom properties', () => {
  const css = generateCssTokens(THEME_PALETTES[0], TYPOGRAPHY_PAIRS[0], '16:9');
  assert.ok(css.includes('--deck-bg-canvas:'));
  assert.ok(css.includes('--deck-aspect-ratio: 16 / 9;'));
});
