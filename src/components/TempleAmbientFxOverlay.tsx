import React, { useMemo } from 'react';
import { TempleTextureId } from '../types/presentation';
import {
  generateProceduralTempleTextureSvg,
  TempleAmbientFxConfig,
} from '../utils/templeEngine';

interface TempleAmbientFxOverlayProps {
  textureId?: TempleTextureId;
  fxConfig: TempleAmbientFxConfig;
  compact?: boolean;
}

export const TempleAmbientFxOverlay: React.FC<TempleAmbientFxOverlayProps> = ({
  textureId,
  fxConfig,
  compact = false,
}) => {
  const textureDataUri = useMemo(
    () =>
      textureId ? generateProceduralTempleTextureSvg(textureId) : undefined,
    [textureId]
  );

  const isLightMarble = textureId === 'makrana-marble';

  return (
    <div
      data-testid="temple-ambient-fx-overlay"
      data-texture={textureId || 'none'}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* 1. Realistic HD Procedural Stone / Wood / Marble Texture Underlay */}
      {textureDataUri && (
        <div
          className={`absolute inset-0 bg-cover bg-center ${
            fxConfig.cinematicPillarPan ? 'animate-temple-pillar-pan' : ''
          }`}
          style={{
            backgroundImage: `url("${textureDataUri}")`,
            opacity: isLightMarble ? 0.55 : 0.42,
          }}
        />
      )}

      {/* 2. Soft Golden God Rays (Volumetric Diagonal Sanctum Light Shafts) */}
      {fxConfig.godRays && (
        <div
          data-testid="fx-golden-god-rays"
          className="absolute inset-0 temple-god-rays"
          style={{
            opacity: isLightMarble ? 0.45 : 0.72,
          }}
        />
      )}

      {/* 3. Rising Incense Smoke Mist (Sacred Dhoop Plume Layers) */}
      {fxConfig.incenseSmoke && (
        <div
          data-testid="fx-incense-smoke-mist"
          className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden"
        >
          <div className="temple-incense-wisp temple-incense-wisp-1" />
          <div className="temple-incense-wisp temple-incense-wisp-2" />
          <div className="temple-incense-wisp temple-incense-wisp-3" />
        </div>
      )}

      {/* 4. Flickering Diya Lamp Glows along the Sanctum Plinth */}
      {fxConfig.diyaLamps && (
        <div
          data-testid="fx-diya-lamp-glows"
          className={`absolute inset-x-6 ${
            compact ? 'bottom-1.5' : 'bottom-2.5'
          } flex items-center justify-between px-4`}
        >
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="relative flex flex-col items-center"
              style={{ animationDelay: `${idx * 320}ms` }}
            >
              {/* Radial Warm Diya Halo */}
              <span
                className="temple-diya-halo rounded-full"
                style={{
                  width: compact ? '26px' : '40px',
                  height: compact ? '26px' : '40px',
                  animationDelay: `${idx * 270}ms`,
                }}
              />
              {/* Flickering Golden Flame Tip */}
              <span
                className="temple-diya-flame"
                style={{
                  width: compact ? '4px' : '6px',
                  height: compact ? '7px' : '10px',
                  animationDelay: `${idx * 190}ms`,
                }}
              />
              {/* Brass Diya Bowl Base */}
              <span
                className="block rounded-b-full bg-amber-600/85 border-t border-amber-300/80"
                style={{
                  width: compact ? '10px' : '14px',
                  height: compact ? '3px' : '4px',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
