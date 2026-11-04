import React from 'react';
import { ThemePalette, VisualArtworkId } from '../types/presentation';

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
  const accent = theme.accentHex;
  const textPrimary = theme.textPrimaryHex;
  const textMuted = theme.textMutedHex;
  const border = theme.borderHex;
  const surface = theme.surfaceHex;
  const padClass = compact ? 'p-2.5' : 'p-3.5';

  if (artworkId === 'arch-pavilion') {
    return (
      <div
        className={`relative overflow-hidden flex flex-col justify-between ${padClass} border ${className}`}
        style={{ backgroundColor: surface, borderColor: border }}
      >
        <div
          className="flex items-center justify-between gap-2 text-[10px] font-mono tracking-tight whitespace-nowrap"
          style={{ color: textMuted }}
        >
          <span className="truncate">ELEVATION A-04 · 1:200</span>
          <span className="shrink-0">TIMBER SPAN</span>
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
        className={`relative overflow-hidden flex flex-col justify-between ${padClass} border ${className}`}
        style={{ backgroundColor: surface, borderColor: border }}
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
        className={`relative overflow-hidden flex flex-col justify-between ${padClass} border ${className}`}
        style={{ backgroundColor: surface, borderColor: border }}
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
        className={`relative overflow-hidden flex flex-col justify-between ${padClass} border ${className}`}
        style={{ backgroundColor: surface, borderColor: border }}
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
        className={`relative overflow-hidden flex flex-col justify-between ${padClass} border ${className}`}
        style={{ backgroundColor: surface, borderColor: border }}
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
      className={`relative overflow-hidden flex flex-col justify-between ${padClass} border ${className}`}
      style={{ backgroundColor: surface, borderColor: border }}
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
