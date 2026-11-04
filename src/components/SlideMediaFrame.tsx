import React, { useEffect, useRef, useState } from 'react';
import { SlideMediaConfig, ThemePalette } from '../types/presentation';
import {
  buildMediaFilterCss,
  buildMediaTransformCss,
  SAMPLE_MEDIA_ASSETS,
} from '../utils/deckEngine';
import { Play, Pause, Upload } from 'lucide-react';

interface SlideMediaFrameProps {
  media: SlideMediaConfig;
  theme: ThemePalette;
  compact?: boolean;
  editable?: boolean;
  onUpdateMedia?: (updated: SlideMediaConfig) => void;
  className?: string;
}

export const SlideMediaFrame: React.FC<SlideMediaFrameProps> = ({
  media,
  theme,
  compact = false,
  editable = false,
  onUpdateMedia,
  className = 'w-full h-full',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(media.videoAutoplay ?? true);
  const [imageError, setImageError] = useState<boolean>(false);

  const filterCss = buildMediaFilterCss(media);
  const transformCss = buildMediaTransformCss(media);

  useEffect(() => {
    setImageError(false);
  }, [media.url]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = media.videoPlaybackRate || 1;
    }
  }, [media.videoPlaybackRate, media.url]);

  // Procedural Canvas Showreel for built-in video presets
  useEffect(() => {
    if (media.mode !== 'video') return;
    const isProcedural = !media.url || media.url.startsWith('procedural://');
    if (!isProcedural) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;
    const isPrism = media.url === 'procedural://cinema-prism';
    const isFunnyArcade = media.url === 'procedural://funny-arcade-reel';
    const isTempleSanctum = Boolean(
      media.url && media.url.startsWith('procedural://temple-')
    );
    const isMarbleTemple = media.url === 'procedural://temple-makrana-sanctum';
    const isSandstoneTemple = media.url === 'procedural://temple-nagara-sanctum';
    const isCedarTemple = media.url === 'procedural://temple-himalayan-sanctum';

    const drawFrame = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Deep cinema, playful aurora, or sacred temple sanctum background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      if (isTempleSanctum) {
        if (isMarbleTemple) {
          bgGrad.addColorStop(0, '#F5F0E6');
          bgGrad.addColorStop(0.5, '#EAE2D3');
          bgGrad.addColorStop(1, '#DCD2C0');
        } else if (isSandstoneTemple) {
          bgGrad.addColorStop(0, '#1F120B');
          bgGrad.addColorStop(0.5, '#331D12');
          bgGrad.addColorStop(1, '#140B07');
        } else if (isCedarTemple) {
          bgGrad.addColorStop(0, '#0D1311');
          bgGrad.addColorStop(0.5, '#182420');
          bgGrad.addColorStop(1, '#090D0C');
        } else {
          // Dravidian Granite & Gold
          bgGrad.addColorStop(0, '#0B0A09');
          bgGrad.addColorStop(0.5, '#1C1917');
          bgGrad.addColorStop(1, '#090807');
        }
      } else if (isFunnyArcade) {
        bgGrad.addColorStop(0, '#1E1B4B');
        bgGrad.addColorStop(0.5, '#3B0764');
        bgGrad.addColorStop(1, '#0F172A');
      } else if (isPrism) {
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.5, '#311042');
        bgGrad.addColorStop(1, '#090D16');
      } else {
        bgGrad.addColorStop(0, '#090D16');
        bgGrad.addColorStop(0.5, '#111C33');
        bgGrad.addColorStop(1, '#0B1320');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      if (isTempleSanctum) {
        // 1. Diagonal Golden God Rays
        ctx.save();
        for (let r = 0; r < 4; r++) {
          const rayX = 70 + r * 125 + Math.sin(phase * 0.7 + r) * 14;
          const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 90, h);
          rayGrad.addColorStop(
            0,
            isMarbleTemple
              ? 'rgba(217, 119, 6, 0.22)'
              : 'rgba(251, 191, 36, 0.25)'
          );
          rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0.0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(rayX - 24, 0);
          ctx.lineTo(rayX + 36, 0);
          ctx.lineTo(rayX + 135, h);
          ctx.lineTo(rayX + 35, h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 2. Smooth Panning Carved Temple Pillars & Gopuram/Mandapa Silhouette
        const panX = Math.sin(phase * 0.45) * 22;
        const pillarColor = isMarbleTemple
          ? 'rgba(120, 113, 108, 0.35)'
          : 'rgba(28, 25, 23, 0.88)';
        const goldStroke = isMarbleTemple ? '#B45309' : '#F59E0B';

        [65, 165, 395, 495].forEach((basePx, idx) => {
          const px = basePx + panX * (idx % 2 === 0 ? 1 : 0.65);
          ctx.fillStyle = pillarColor;
          ctx.fillRect(px - 16, 36, 32, h - 68);
          ctx.strokeStyle = goldStroke;
          ctx.lineWidth = 1.4;
          ctx.strokeRect(px - 16, 36, 32, h - 68);
          // Carved pillar capital & kalash motif
          ctx.fillStyle = goldStroke;
          ctx.fillRect(px - 22, 32, 44, 6);
          ctx.fillRect(px - 20, h - 34, 40, 6);
        });

        // Central Sanctum Kalash / Mandala Emblem
        const centerX = w / 2 + panX * 0.4;
        const centerY = h * 0.46;
        ctx.strokeStyle = goldStroke;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 56);
        ctx.lineTo(centerX - 16, centerY - 26);
        ctx.lineTo(centerX + 16, centerY - 26);
        ctx.closePath();
        ctx.fillStyle = goldStroke;
        ctx.fill();

        // 3. Rising Incense Smoke Mist Wisps
        for (let s = 0; s < 5; s++) {
          const smokeY = h - 30 - ((phase * 28 + s * 52) % (h * 0.72));
          const smokeX =
            w * (0.25 + s * 0.12) + Math.sin(phase * 1.3 + s) * 18;
          const smokeAlpha = Math.max(
            0.04,
            Math.sin(((h - smokeY) / (h * 0.72)) * Math.PI) * 0.24
          );
          const smokeGrad = ctx.createRadialGradient(
            smokeX,
            smokeY,
            2,
            smokeX,
            smokeY,
            34
          );
          smokeGrad.addColorStop(0, `rgba(254, 243, 199, ${smokeAlpha})`);
          smokeGrad.addColorStop(1, 'rgba(254, 243, 199, 0)');
          ctx.fillStyle = smokeGrad;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, 34, 0, Math.PI * 2);
          ctx.fill();
        }

        // 4. Flickering Golden Diya Lamps along the Sanctum Plinth
        for (let d = 0; d < 5; d++) {
          const dx = 90 + d * 95;
          const dy = h - 22;
          const flicker = 0.78 + Math.sin(phase * 6.5 + d * 1.9) * 0.22;
          const haloGrad = ctx.createRadialGradient(
            dx,
            dy - 5,
            1,
            dx,
            dy - 5,
            22 * flicker
          );
          haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
          haloGrad.addColorStop(0.45, 'rgba(245, 158, 11, 0.45)');
          haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(dx, dy - 5, 22 * flicker, 0, Math.PI * 2);
          ctx.fill();

          // Flame tip
          ctx.fillStyle = '#FEF08A';
          ctx.beginPath();
          ctx.arc(dx, dy - 5, 3.5 * flicker, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Subtle architectural grid
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
        ctx.lineWidth = 1;
        for (let x = 40; x < w; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 30; y < h; y += 45) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        if (isFunnyArcade) {
          // Playful bouncing 3D spheres & confetti rings for funny video showcase
          const colors = ['#F43F5E', '#FBBF24', '#34D399', '#38BDF8', '#A855F7'];
          for (let i = 0; i < 5; i++) {
            const bx = w * (0.18 + i * 0.16) + Math.sin(phase * 1.4 + i) * 26;
            const bounce = Math.abs(Math.sin(phase * 2.2 + i * 0.75));
            const by = h * 0.68 - bounce * (h * 0.36);
            const radius = 24 + (i % 3) * 6;

            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.arc(bx, by, radius, 0, Math.PI * 2);
            ctx.fill();

            // Playful eyes on bouncing spheres
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(bx - 7, by - 4, 4.5, 0, Math.PI * 2);
            ctx.arc(bx + 7, by - 4, 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.arc(bx - 6, by - 4, 2, 0, Math.PI * 2);
            ctx.arc(bx + 8, by - 4, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Animated wave / telemetry curves
          for (let layer = 0; layer < 3; layer++) {
            ctx.beginPath();
            const colors = isPrism
              ? ['#F472B6', '#818CF8', '#38BDF8']
              : ['#38BDF8', '#60A5FA', '#F59E0B'];
            ctx.strokeStyle = colors[layer];
            ctx.lineWidth = 3 - layer * 0.6;
            for (let x = 0; x <= w; x += 12) {
              const y =
                h * 0.52 +
                Math.sin(x * 0.014 + phase * (1.2 + layer * 0.35) + layer) *
                  (28 + layer * 14) +
                Math.cos(x * 0.008 - phase * 0.8) * 14;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }

          // Scanning telemetry nodes
          const scanX = ((phase * 65) % (w - 80)) + 40;
          ctx.fillStyle = isPrism ? '#F472B6' : '#38BDF8';
          ctx.beginPath();
          ctx.arc(scanX, h * 0.45 + Math.sin(phase * 2) * 24, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Timecode HUD inside video frame
      ctx.fillStyle = isMarbleTemple
        ? 'rgba(28, 25, 23, 0.82)'
        : 'rgba(248, 250, 252, 0.86)';
      ctx.font = '600 12px "JetBrains Mono", monospace';
      const sec = Math.floor(phase % 60);
      const frames = Math.floor((phase * 24) % 24);
      ctx.fillText(
        `REC · TC 01:14:${String(sec).padStart(2, '0')}:${String(frames).padStart(2, '0')} · ${
          isTempleSanctum
            ? 'SACRED SANCTUM 60FPS FX'
            : isFunnyArcade
              ? 'VISITOR FUNNY REEL'
              : '4K DCI'
        }`,
        18,
        26
      );

      if (isPlaying) {
        phase += 0.035 * (media.videoPlaybackRate || 1);
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();
    return () => cancelAnimationFrame(rafId);
  }, [media.mode, media.url, media.videoPlaybackRate, isPlaying]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateMedia) return;
    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    onUpdateMedia({
      ...media,
      mode: isVideo ? 'video' : 'photo',
      url: objectUrl,
      caption: `${file.name} · Custom Studio Media`,
    });
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const fallbackPhotoUrl = SAMPLE_MEDIA_ASSETS[0].url;
  const effectivePhotoUrl =
    !media.url || media.url.startsWith('procedural://') || imageError
      ? fallbackPhotoUrl
      : media.url;

  const isProceduralVideo =
    media.mode === 'video' && (!media.url || media.url.startsWith('procedural://'));

  return (
    <div
      data-testid="slide-media-frame"
      className={`relative overflow-hidden border flex flex-col justify-between bg-slate-950 ${className}`}
      style={{
        borderColor: theme.borderHex,
        borderRadius: `${media.borderRadiusPx ?? 4}px`,
      }}
    >
      {/* Hidden File Input for Direct Canvas Upload */}
      {editable && onUpdateMedia && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          aria-label="Upload custom photo or video to slide"
          onChange={handleFileUpload}
          className="hidden"
        />
      )}

      {/* Media Layer with Smooth Dynamic Zoom, Live CSS Filters & Zoom/Pan Transform */}
      <div className="relative w-full h-full flex-1 min-h-[120px] overflow-hidden flex items-center justify-center">
        <div className="w-full h-full animate-ken-burns-zoom flex items-center justify-center">
          {media.mode === 'video' ? (
            isProceduralVideo ? (
              <canvas
                ref={canvasRef}
                width={560}
                height={315}
                className="w-full h-full object-cover transition-transform duration-150"
                style={{
                  filter: filterCss,
                  transform: transformCss,
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={media.url}
                autoPlay={media.videoAutoplay}
                loop={media.videoLoop}
                muted={media.videoMuted}
                playsInline
                className="w-full h-full transition-transform duration-150"
                style={{
                  objectFit: media.objectFit || 'cover',
                  filter: filterCss,
                  transform: transformCss,
                }}
              />
            )
          ) : (
            <img
              src={effectivePhotoUrl}
              alt={media.caption || 'Slide custom visual plate'}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full transition-transform duration-150"
              style={{
                objectFit: media.objectFit || 'cover',
                filter: filterCss,
                transform: transformCss,
              }}
            />
          )}
        </div>

        {/* Top-Right Interactive Controls Overlay (Admin Editable Mode Only) */}
        {editable && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
            {media.mode === 'video' && (
              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause slide video' : 'Play slide video'}
                className="px-2 py-1 text-[10px] font-mono font-medium bg-black/65 hover:bg-black/80 text-white border border-white/15 rounded inline-flex items-center gap-1 whitespace-nowrap"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-2.5 h-2.5" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5" aria-hidden="true" />
                    Play
                  </>
                )}
              </button>
            )}

            {onUpdateMedia && !compact && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[10px] font-medium bg-blue-600/90 hover:bg-blue-700 text-white rounded inline-flex items-center gap-1 whitespace-nowrap shadow-xs"
              >
                <Upload className="w-2.5 h-2.5" aria-hidden="true" />
                Upload Photo / Video
              </button>
            )}
          </div>
        )}

        {/* Measured Contrast Scrim with Caption Overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-3 py-2 flex items-center justify-between gap-2 text-white">
          <span className="text-[10px] font-mono truncate">{media.caption}</span>
          <span className="text-[10px] font-mono text-sky-300 shrink-0 uppercase">
            {editable
              ? `${media.mode === 'video' ? 'VIDEO' : 'PHOTO'} · ${media.brightness}%B / ${media.contrast}%C`
              : `${media.mode === 'video' ? '3D LIVE VIDEO SLOT' : '3D PHOTO SLOT'} · AUTO 3D TILT & ZOOM`}
          </span>
        </div>
      </div>
    </div>
  );
};
