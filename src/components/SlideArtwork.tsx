import React, { useState } from 'react';
import { ThemePalette, VisualArtworkId } from '../types/presentation';
import { computeCard3DTiltTransform } from '../utils/deckEngine';

interface SlideArtworkProps {
  artworkId: VisualArtworkId;
  theme: ThemePalette;
  compact?: boolean;
  className?: string;
}

export const SlideArtwork: React.FC<SlideArtworkProps> = ({
  artworkId,
  theme,
  compact = false,
  className = 'w-full h-full',
}) => {
  const [tiltTransform, setTiltTransform] = useState<string | null>(null);
  const accent = theme.accentHex;
  const textPrimary = theme.textPrimaryHex;
  const textMuted = theme.textMutedHex;
  const border = theme.borderHex;
  const surface = theme.surfaceHex;
  const padClass = compact ? 'p-2.5' : 'p-3.5';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setTiltTransform(computeCard3DTiltTransform(normX, normY, 9, 10));
  };

  const handleMouseLeave = () => {
    setTiltTransform(null);
  };

  const wrapperClass = `relative overflow-hidden flex flex-col justify-between ${padClass} border transition-transform duration-150 ${
    tiltTransform ? '' : 'animate-artwork-3d'
  } ${className}`;

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: surface,
    borderColor: border,
    ...(tiltTransform ? { transform: tiltTransform } : {}),
  };

  if (artworkId === 'dravidian-gopuram') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-tight whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">DRAVIDIAN GOPURAM · 11-TIER</span>
          <span className="shrink-0" style={{ color: accent }}>
            24K KALASH FINIAL
          </span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[135px]"
          role="img"
          aria-label="Dravidian granite temple gopuram and carved mandapa pillars"
        >
          {/* Golden Kalash Finials at Crown */}
          {[150, 175, 200, 225, 250].map((cx) => (
            <g key={cx}>
              <polygon
                points={`${cx},12 ${cx - 5},24 ${cx + 5},24`}
                fill={accent}
              />
              <circle cx={cx} cy={11} r="2.5" fill="#FEF08A" />
            </g>
          ))}
          {/* Stepped Gopuram Pyramid Tiers */}
          {[
            { y: 24, w: 124 },
            { y: 42, w: 148 },
            { y: 60, w: 174 },
            { y: 78, w: 202 },
            { y: 96, w: 232 },
          ].map((tier, idx) => (
            <g key={tier.y}>
              <rect
                x={200 - tier.w / 2}
                y={tier.y}
                width={tier.w}
                height="15"
                fill={idx % 2 === 0 ? textPrimary : surface}
                fillOpacity={idx % 2 === 0 ? 0.85 : 1}
                stroke={accent}
                strokeWidth="1.2"
              />
            </g>
          ))}
          {/* Carved Granite Mandapa Pillars */}
          {[44, 84, 124, 276, 316, 356].map((px) => (
            <g key={px}>
              <rect
                x={px - 7}
                y="114"
                width="14"
                height="66"
                fill={textPrimary}
                fillOpacity="0.82"
                stroke={accent}
                strokeWidth="1"
              />
              <rect
                x={px - 10}
                y="112"
                width="20"
                height="5"
                fill={accent}
              />
            </g>
          ))}
          {/* Central Garbhagriha Sanctum Portal */}
          <rect
            x="166"
            y="114"
            width="68"
            height="66"
            fill={accent}
            fillOpacity="0.16"
            stroke={accent}
            strokeWidth="2"
          />
          <circle cx="200" cy="148" r="12" fill={accent} fillOpacity="0.45" />
          {/* Temple Adhisthana Plinth */}
          <rect x="24" y="180" width="352" height="10" fill={textPrimary} />
          <line x1="20" y1="194" x2="380" y2="194" stroke={accent} strokeWidth="1.5" />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>CHISELED CHARNOCKITE</span>
          <span>1000-PILLAR MANDAPA</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'nagara-shikhara') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-tight whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">NAGARA SHIKHARA & JAALI</span>
          <span className="shrink-0" style={{ color: accent }}>
            DHOLPUR SANDSTONE
          </span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[135px]"
          role="img"
          aria-label="Nagara sandstone temple shikhara and intricate jaali lattice"
        >
          {/* Amalaka & Kalash Crown */}
          <ellipse cx="200" cy="22" rx="18" ry="5" fill={accent} />
          <polygon points="200,9 194,20 206,20" fill="#FDE68A" />
          {/* Curvilinear Rekha-Prasada Shikhara Spire */}
          <path
            d="M 140 176 Q 156 68, 184 26 L 216 26 Q 244 68, 260 176 Z"
            fill={accent}
            fillOpacity="0.18"
            stroke={accent}
            strokeWidth="2"
          />
          {/* Subsidiary Urushringa Spires */}
          <path
            d="M 105 176 Q 116 105, 136 74 L 154 74 Q 164 115, 168 176 Z"
            fill={surface}
            stroke={textPrimary}
            strokeWidth="1.4"
          />
          <path
            d="M 232 176 Q 236 115, 246 74 L 264 74 Q 284 105, 295 176 Z"
            fill={surface}
            stroke={textPrimary}
            strokeWidth="1.4"
          />
          {/* Perforated Geometric Jaali Screens */}
          {[46, 314].map((jx) => (
            <g key={jx}>
              <rect
                x={jx}
                y="96"
                width="40"
                height="80"
                fill="none"
                stroke={accent}
                strokeWidth="1.4"
              />
              <polygon
                points={`${jx + 20},104 ${jx + 36},136 ${jx + 20},168 ${jx + 4},136`}
                fill="none"
                stroke={textPrimary}
                strokeWidth="1"
              />
            </g>
          ))}
          <rect x="28" y="176" width="344" height="10" fill={textPrimary} />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>URUSHRINGA FRACTAL</span>
          <span>GEOMETRIC JAALI</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'himalayan-pagoda') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-tight whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">HIMALAYAN KATH-KUNI PAGODA</span>
          <span className="shrink-0" style={{ color: accent }}>
            CEDAR & BRASS BELLS
          </span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[135px]"
          role="img"
          aria-label="Himalayan wooden pagoda with slate roofs and hanging brass bells"
        >
          {/* Brass Canopy Finial */}
          <polygon points="200,10 186,28 214,28" fill={accent} />
          {/* 3 Cantilevered Slate & Cedar Pagoda Roofs */}
          {[
            { y: 28, topW: 72, botW: 164 },
            { y: 66, topW: 112, botW: 224 },
            { y: 106, topW: 156, botW: 288 },
          ].map((roof) => (
            <g key={roof.y}>
              <polygon
                points={`${200 - roof.topW / 2},${roof.y} ${200 + roof.topW / 2},${roof.y} ${200 + roof.botW / 2},${roof.y + 24} ${200 - roof.botW / 2},${roof.y + 24}`}
                fill={textPrimary}
                fillOpacity="0.86"
                stroke={accent}
                strokeWidth="1.5"
              />
              {/* Hanging Brass Eave Bells (Ghantas) */}
              {[200 - roof.botW / 2 + 12, 200 + roof.botW / 2 - 12].map((bx) => (
                <circle key={bx} cx={bx} cy={roof.y + 29} r="3.5" fill={accent} />
              ))}
            </g>
          ))}
          {/* Interlocking Deodar Cedar Timber Sanctum Base */}
          <rect
            x="116"
            y="130"
            width="168"
            height="48"
            fill={accent}
            fillOpacity="0.14"
            stroke={accent}
            strokeWidth="1.6"
          />
          <rect x="44" y="178" width="312" height="10" fill={textPrimary} />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>DEODAR CEDAR TIMBER</span>
          <span>SEISMIC KATH-KUNI</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'makrana-mandapa') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-tight whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">MAKRANA MARBLE MANDAPA</span>
          <span className="shrink-0" style={{ color: accent }}>
            24K GOLD INLAY
          </span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[135px]"
          role="img"
          aria-label="White Makrana marble sanctum with cuspate torana arches and golden inlay"
        >
          {/* Lotus Dome & Golden Inlay Medallion */}
          <path
            d="M 116 74 Q 200 10, 284 74 Z"
            fill={accent}
            fillOpacity="0.15"
            stroke={accent}
            strokeWidth="2"
          />
          <circle cx="200" cy="48" r="14" fill="none" stroke={accent} strokeWidth="1.6" />
          {/* Cuspate Marble Torana Arches */}
          <path
            d="M 68 92 Q 100 68, 132 92 Q 166 66, 200 92 Q 234 66, 268 92 Q 300 68, 332 92"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
          />
          {/* Fluted White Marble Pillars with Golden Base/Capital */}
          {[68, 132, 200, 268, 332].map((px) => (
            <g key={px}>
              <rect
                x={px - 6}
                y="74"
                width="12"
                height="102"
                fill={surface}
                stroke={textPrimary}
                strokeWidth="1.4"
              />
              <rect x={px - 9} y="72" width="18" height="5" fill={accent} />
              <rect x={px - 9} y="172" width="18" height="5" fill={accent} />
            </g>
          ))}
          <rect x="36" y="177" width="328" height="9" fill={textPrimary} />
          <line x1="36" y1="191" x2="364" y2="191" stroke={accent} strokeWidth="1.5" />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>98% CALCITE MARBLE</span>
          <span>PARCHIN KARI INLAY</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'arch-pavilion') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-tight whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">ELEVATION A-04 · 1:200</span>
          <span className="shrink-0">3D TIMBER SPAN</span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[130px]"
          role="img"
          aria-label="Architectural timber pavilion structural elevation"
        >
          <defs>
            <linearGradient id="archSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.16" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect x="10" y="12" width="380" height="135" fill="url(#archSky)" />
          {[50, 110, 170, 230, 290, 350].map((x) => (
            <line
              key={x}
              x1={x}
              y1="12"
              x2={x}
              y2="190"
              stroke={border}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}
          <polygon points="24,72 376,44 364,64 24,86" fill={accent} />
          {[68, 128, 188, 248, 308, 344].map((x, idx) => (
            <g key={x}>
              <rect
                x={x}
                y={72 - idx * 4}
                width="8"
                height={92 + idx * 4}
                fill={textPrimary}
                fillOpacity={0.85}
              />
              <line
                x1={x + 4}
                y1="164"
                x2={x + 4}
                y2="196"
                stroke={accent}
                strokeWidth="1.5"
                strokeOpacity="0.45"
              />
            </g>
          ))}
          <rect x="16" y="164" width="368" height="9" fill={textPrimary} />
          <line x1="16" y1="182" x2="384" y2="182" stroke={accent} strokeWidth="1.5" strokeOpacity="0.6" />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>SPAN: 48.0m</span>
          <span>GLULAM CL-28h</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'hardware-monolith') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">GRADE 5 TITANIUM</span>
          <span className="shrink-0">ISO-10360</span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[130px]"
          role="img"
          aria-label="Precision hardware monolith isometric diagram"
        >
          <rect x="70" y="20" width="260" height="170" rx="6" fill="none" stroke={textPrimary} strokeWidth="2" />
          <rect x="86" y="34" width="228" height="142" rx="3" fill={accent} fillOpacity="0.08" stroke={accent} strokeWidth="1.2" />
          {Array.from({ length: 13 }).map((_, idx) => {
            const x = 104 + idx * 16;
            return (
              <line
                key={x}
                x1={x}
                y1="46"
                x2={x}
                y2="164"
                stroke={idx === 6 ? accent : textPrimary}
                strokeWidth={idx === 6 ? '2.5' : '1.2'}
                strokeOpacity={idx === 6 ? '1' : '0.45'}
              />
            );
          })}
          <circle cx="200" cy="105" r="34" fill={surface} stroke={accent} strokeWidth="2.5" />
          <circle cx="200" cy="105" r="15" fill={accent} fillOpacity="0.25" stroke={textPrimary} strokeWidth="1.5" />
          <circle cx="200" cy="105" r="4" fill={accent} />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>FLOOR: 14.2 dBA</span>
          <span>±1.8 μm</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'sustainable-grid') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">HVDC TOPOLOGY</span>
          <span className="shrink-0">400kV BUS</span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[130px]"
          role="img"
          aria-label="Grid storage topology and dispatch curve"
        >
          {[40, 85, 130, 175].map((y) => (
            <line key={y} x1="24" y1={y} x2="376" y2={y} stroke={border} strokeWidth="1" />
          ))}
          {[40, 128, 216, 304].map((x, i) => (
            <g key={x}>
              <rect
                x={x}
                y="45"
                width="60"
                height="42"
                rx="3"
                fill={i === 1 || i === 2 ? accent : 'none'}
                fillOpacity={i === 1 || i === 2 ? '0.18' : '0'}
                stroke={i === 1 || i === 2 ? accent : textPrimary}
                strokeWidth="1.5"
              />
              <text x={x + 14} y="70" fill={textPrimary} fontSize="11" fontFamily="monospace">
                B-{i + 1}
              </text>
            </g>
          ))}
          <path
            d="M 28 162 Q 90 108, 150 144 T 275 118 T 372 108"
            fill="none"
            stroke={accent}
            strokeWidth="3"
          />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>1,420 MWh</span>
          <span>99.94% UP</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'editorial-workspace') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">SWISS 12-COL CANON</span>
          <span className="shrink-0">RATIO 1:1.618</span>
        </div>
        <svg
          viewBox="0 0 400 210"
          className="w-full h-auto my-auto max-h-[130px]"
          role="img"
          aria-label="Editorial layout grid and typographic proportion study"
        >
          <rect x="24" y="18" width="352" height="174" fill="none" stroke={textPrimary} strokeWidth="1.5" />
          <line x1="160" y1="18" x2="160" y2="192" stroke={textPrimary} strokeWidth="1.2" />
          <line x1="160" y1="122" x2="376" y2="122" stroke={textPrimary} strokeWidth="1.2" />
          <rect x="40" y="34" width="102" height="12" fill={accent} />
          <rect x="40" y="56" width="84" height="7" fill={textPrimary} fillOpacity="0.6" />
          <rect x="40" y="70" width="92" height="7" fill={textPrimary} fillOpacity="0.4" />
          <circle cx="268" cy="70" r="34" fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="2" />
          <rect x="180" y="138" width="172" height="36" fill={textPrimary} fillOpacity="0.08" stroke={border} />
        </svg>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
          style={{ borderColor: border, color: textMuted }}
        >
          <span>8px BASE GRID</span>
          <span>WCAG AAA</span>
        </div>
      </div>
    );
  }

  if (artworkId === 'swiss-typography') {
    return (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={wrapperClass}
        style={wrapperStyle}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">SPECIMEN</span>
          <span className="shrink-0">0123456789</span>
        </div>
        <div
          className="my-auto py-3 flex items-baseline justify-between border-y"
          style={{ borderColor: border }}
        >
          <span
            className={`${compact ? 'text-4xl' : 'text-5xl'} font-bold tracking-tighter select-none`}
            style={{ color: textPrimary }}
          >
            Aa
          </span>
          <span
            className={`${compact ? 'text-2xl' : 'text-3xl'} font-mono font-semibold tabular-nums select-none`}
            style={{ color: accent }}
          >
            99.4%
          </span>
        </div>
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span>65–75 CH</span>
          <span>TABULAR-NUMS</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={wrapperClass}
      style={wrapperStyle}
    >
      <div
        className="flex items-center justify-between gap-2 text-[10px] font-mono whitespace-nowrap"
        style={{ color: textMuted }}
      >
        <span className="truncate">42 FOUNDRY NODES</span>
        <span className="shrink-0">EDGE INFERENCE</span>
      </div>
      <svg
        viewBox="0 0 400 210"
        className="w-full h-auto my-auto max-h-[130px]"
        role="img"
        aria-label="Supply chain telemetry network graph"
      >
        <line x1="76" y1="148" x2="164" y2="74" stroke={accent} strokeWidth="2" />
        <line x1="164" y1="74" x2="268" y2="116" stroke={accent} strokeWidth="2" />
        <line x1="268" y1="116" x2="342" y2="52" stroke={accent} strokeWidth="2.5" />
        <line x1="76" y1="148" x2="268" y2="116" stroke={textMuted} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="164" y1="74" x2="342" y2="52" stroke={textMuted} strokeWidth="1" strokeDasharray="3 3" />
        {[
          { cx: 76, cy: 148, label: 'MUNICH' },
          { cx: 164, cy: 74, label: 'ZURICH' },
          { cx: 268, cy: 116, label: 'DETROIT' },
          { cx: 342, cy: 52, label: 'OSAKA' },
        ].map((node, i) => (
          <g key={node.label}>
            <circle
              cx={node.cx}
              cy={node.cy}
              r={i === 3 ? '12' : '9'}
              fill={i === 3 ? accent : surface}
              stroke={accent}
              strokeWidth="2.5"
            />
            <text
              x={node.cx - 22}
              y={node.cy + 24}
              fill={textPrimary}
              fontSize="10"
              fontFamily="monospace"
              fontWeight="600"
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div
        className="flex items-center justify-between gap-2 text-[10px] font-mono pt-1.5 border-t whitespace-nowrap"
        style={{ borderColor: border, color: textMuted }}
      >
        <span>LATENCY: 4.2 ms</span>
        <span>UPTIME: 99.98%</span>
      </div>
    </div>
  );
};
