import { SlideData, ThemePalette } from '../types/presentation';

export interface GalleryCaptureResult {
  fileName: string;
  width: number;
  height: number;
  dataUrl: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function downloadActiveSlideToGallery(params: {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  deckTitle: string;
  theme: ThemePalette;
}): GalleryCaptureResult {
  const { slide, slideIndex, totalSlides, deckTitle, theme } = params;
  const width = 1920;
  const height = 1080;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Base slide background
    ctx.fillStyle = theme.backgroundHex;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Aurora Glow Mesh overlay
    const auroraA = ctx.createRadialGradient(320, 220, 40, 320, 220, 680);
    auroraA.addColorStop(0, `${theme.accentHex}2A`);
    auroraA.addColorStop(1, 'transparent');
    ctx.fillStyle = auroraA;
    ctx.fillRect(0, 0, width, height);

    const auroraB = ctx.createRadialGradient(1560, 820, 40, 1560, 820, 720);
    auroraB.addColorStop(0, 'rgba(139, 92, 246, 0.16)');
    auroraB.addColorStop(1, 'transparent');
    ctx.fillStyle = auroraB;
    ctx.fillRect(0, 0, width, height);

    // 3. Subtle 12-column architectural grid lines
    ctx.strokeStyle = `${theme.borderHex}55`;
    ctx.lineWidth = 1;
    for (let col = 1; col < 12; col++) {
      const x = (width / 12) * col;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 4. Top Accent Bar & Running Header
    ctx.fillStyle = theme.accentHex;
    ctx.fillRect(0, 0, width, 14);

    ctx.fillStyle = theme.accentHex;
    ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(slide.sectionKicker, 96, 92);

    ctx.fillStyle = theme.textMutedHex;
    ctx.font = '500 24px "DM Sans", sans-serif';
    ctx.fillText(`·  ${deckTitle}`, 96 + ctx.measureText(slide.sectionKicker).width + 24, 92);

    ctx.font = '600 24px "JetBrains Mono", monospace';
    const slideCounter = `${String(slideIndex + 1).padStart(2, '0')} / ${String(
      totalSlides
    ).padStart(2, '0')}`;
    ctx.fillText(slideCounter, width - 190, 92);

    ctx.strokeStyle = theme.borderHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 124);
    ctx.lineTo(width - 96, 124);
    ctx.stroke();

    // 5. Left Narrative Column (Headline, Subtitle, Body Copy, KPIs)
    ctx.fillStyle = theme.textPrimaryHex;
    ctx.font = '700 58px "Plus Jakarta Sans", sans-serif';
    const words = slide.headline.split(' ');
    let line = '';
    let y = 248;
    const maxTextWidth = 860;
    for (let i = 0; i < words.length; i++) {
      const candidate = line + words[i] + ' ';
      if (ctx.measureText(candidate).width > maxTextWidth && line !== '') {
        ctx.fillText(line.trim(), 96, y);
        line = words[i] + ' ';
        y += 72;
        if (y > 410) break;
      } else {
        line = candidate;
      }
    }
    if (y <= 410 && line.trim()) {
      ctx.fillText(line.trim(), 96, y);
    }

    // Subtitle
    ctx.fillStyle = theme.accentHex;
    ctx.font = '600 30px "DM Sans", sans-serif';
    ctx.fillText(slide.subtitle.slice(0, 68), 96, y + 66);

    // Body copy
    ctx.fillStyle = theme.textMutedHex;
    ctx.font = '400 24px "DM Sans", sans-serif';
    const bodyWords = slide.bodyCopy.split(' ');
    let bLine = '';
    let bY = y + 124;
    for (let i = 0; i < bodyWords.length; i++) {
      const candidate = bLine + bodyWords[i] + ' ';
      if (ctx.measureText(candidate).width > maxTextWidth && bLine !== '') {
        ctx.fillText(bLine.trim(), 96, bY);
        bLine = bodyWords[i] + ' ';
        bY += 38;
        if (bY > y + 215) break;
      } else {
        bLine = candidate;
      }
    }
    if (bY <= y + 215 && bLine.trim()) {
      ctx.fillText(bLine.trim(), 96, bY);
    }

    // Bottom-left KPI Cards
    const kpiItems =
      slide.kpis.length > 0
        ? slide.kpis.slice(0, 2)
        : [
            { label: 'Presentation Resolution', value: '1920×1080', delta: 'Full HD Gallery' },
            { label: 'Contrast Verification', value: 'WCAG AAA', delta: '3D Spatial Grid' },
          ];

    kpiItems.forEach((kpi, idx) => {
      const kx = 96 + idx * 430;
      const ky = 690;
      const kw = 400;
      const kh = 210;

      ctx.fillStyle = theme.surfaceHex;
      ctx.fillRect(kx, ky, kw, kh);
      ctx.strokeStyle = theme.borderHex;
      ctx.lineWidth = 2;
      ctx.strokeRect(kx, ky, kw, kh);

      ctx.fillStyle = theme.accentHex;
      ctx.fillRect(kx, ky, 92, 6);

      ctx.fillStyle = theme.textMutedHex;
      ctx.font = '500 22px "DM Sans", sans-serif';
      ctx.fillText(kpi.label.slice(0, 28), kx + 28, ky + 56);

      ctx.fillStyle = theme.textPrimaryHex;
      ctx.font = '700 52px "JetBrains Mono", monospace';
      ctx.fillText(kpi.value, kx + 28, ky + 132);

      ctx.fillStyle = theme.accentHex;
      ctx.font = '600 22px "JetBrains Mono", monospace';
      ctx.fillText(kpi.delta, kx + 28, ky + 178);
    });

    // 6. Right-Hand Designated Media Placeholder Frame (Draws live uploaded photo/video/canvas)
    const mediaX = 1020;
    const mediaY = 186;
    const mediaW = 804;
    const mediaH = 714;

    ctx.save();
    drawRoundedRect(ctx, mediaX, mediaY, mediaW, mediaH, 14);
    ctx.fillStyle = '#090D16';
    ctx.fill();
    ctx.clip();

    // Try to capture the live DOM media element inside [data-testid="active-slide-canvas"]
    const stageEl = document.querySelector('[data-testid="active-slide-canvas"]');
    const liveVideo = stageEl?.querySelector('video') as HTMLVideoElement | null;
    const liveCanvas = stageEl?.querySelector('canvas') as HTMLCanvasElement | null;
    const liveImg = stageEl?.querySelector('img') as HTMLImageElement | null;

    let drewLiveMedia = false;
    try {
      if (liveVideo && liveVideo.readyState >= 2) {
        ctx.drawImage(liveVideo, mediaX, mediaY, mediaW, mediaH);
        drewLiveMedia = true;
      } else if (liveCanvas && liveCanvas.width > 0) {
        ctx.drawImage(liveCanvas, mediaX, mediaY, mediaW, mediaH);
        drewLiveMedia = true;
      } else if (liveImg && liveImg.complete && liveImg.naturalWidth > 0) {
        ctx.drawImage(liveImg, mediaX, mediaY, mediaW, mediaH);
        drewLiveMedia = true;
      }
    } catch {
      drewLiveMedia = false;
    }

    if (!drewLiveMedia) {
      // Fallback high-resolution studio aurora prism graphic inside the media frame
      const frameGrad = ctx.createLinearGradient(
        mediaX,
        mediaY,
        mediaX + mediaW,
        mediaY + mediaH
      );
      frameGrad.addColorStop(0, '#0F172A');
      frameGrad.addColorStop(0.5, '#1E1B4B');
      frameGrad.addColorStop(1, '#311042');
      ctx.fillStyle = frameGrad;
      ctx.fillRect(mediaX, mediaY, mediaW, mediaH);

      ctx.strokeStyle = theme.accentHex;
      ctx.lineWidth = 4;
      for (let wIdx = 0; wIdx < 3; wIdx++) {
        ctx.beginPath();
        for (let px = 0; px <= mediaW; px += 16) {
          const py =
            mediaY +
            mediaH * 0.5 +
            Math.sin(px * 0.012 + wIdx * 1.3) * (54 + wIdx * 24);
          if (px === 0) ctx.moveTo(mediaX + px, py);
          else ctx.lineTo(mediaX + px, py);
        }
        ctx.stroke();
      }
    }

    // Bottom caption scrim inside media frame
    const scrimGrad = ctx.createLinearGradient(
      mediaX,
      mediaY + mediaH - 110,
      mediaX,
      mediaY + mediaH
    );
    scrimGrad.addColorStop(0, 'rgba(0,0,0,0)');
    scrimGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = scrimGrad;
    ctx.fillRect(mediaX, mediaY + mediaH - 110, mediaW, 110);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    const mediaCaption =
      slide.customMedia?.caption || `${deckTitle} · 3D Spatial Media Showcase`;
    ctx.fillText(mediaCaption.slice(0, 56), mediaX + 28, mediaY + mediaH - 34);
    ctx.restore();

    // Media frame border
    ctx.save();
    drawRoundedRect(ctx, mediaX, mediaY, mediaW, mediaH, 14);
    ctx.strokeStyle = theme.accentHex;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 7. Bottom Running Footer
    ctx.strokeStyle = theme.borderHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 968);
    ctx.lineTo(width - 96, 968);
    ctx.stroke();

    ctx.fillStyle = theme.textMutedHex;
    ctx.font = '400 20px "DM Sans", sans-serif';
    ctx.fillText(slide.footnote, 96, 1014);

    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillText('FolioDeck Gallery Export · 1920×1080 HD', width - 520, 1014);
  }

  const slug = deckTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const fileName = `${slug || 'foliodeck'}-slide-${String(slideIndex + 1).padStart(
    2,
    '0'
  )}-gallery.png`;
  const dataUrl = canvas.toDataURL('image/png', 1.0);

  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  return {
    fileName,
    width,
    height,
    dataUrl,
  };
}
