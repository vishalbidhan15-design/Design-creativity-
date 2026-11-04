import React from 'react';
import {
  HeadlineAnimationStyle,
  tokenizeHeadlineForAnimation,
} from '../utils/deckEngine';

interface AnimatedHeadlineProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3';
  animationStyle?: HeadlineAnimationStyle;
  primaryColorHex?: string;
  accentColorHex?: string;
  fontFamilyCss?: string;
  className?: string;
}

export const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({
  text,
  as: Tag = 'h2',
  animationStyle = 'kinetic-3d-wave',
  primaryColorHex = '#0F172A',
  accentColorHex = '#2563EB',
  fontFamilyCss,
  className = '',
}) => {
  const tokens = tokenizeHeadlineForAnimation(text);

  const animClassForWord =
    animationStyle === 'kinetic-3d-wave'
      ? 'animate-headline-wave-3d'
      : animationStyle === 'stagger-3d-flip'
      ? 'animate-headline-flip-3d'
      : animationStyle === 'editorial-depth'
      ? 'animate-headline-depth'
      : 'animate-headline-wave-3d';

  const shimmerGradient = `linear-gradient(110deg, ${primaryColorHex} 15%, ${accentColorHex} 48%, ${primaryColorHex} 85%)`;

  return (
    <Tag
      aria-label={text}
      className={`preserve-3d ${className}`}
      style={{
        fontFamily: fontFamilyCss,
        color: primaryColorHex,
        textWrap: 'balance',
      }}
    >
      <span aria-hidden="true" className="inline">
        {tokens.map((tok) => {
          const useShimmerOnWord =
            animationStyle === 'aurora-shimmer' ||
            (animationStyle === 'kinetic-3d-wave' && tok.isAccentWord);

          return (
            <span
              key={`${tok.word}-${tok.index}`}
              className={`mr-[0.26em] last:mr-0 ${animClassForWord} ${
                useShimmerOnWord ? 'animate-headline-shimmer' : ''
              }`}
              style={{
                animationDelay: `${tok.delayMs}ms`,
                ...(useShimmerOnWord
                  ? {
                      backgroundImage: shimmerGradient,
                    }
                  : {
                      color: primaryColorHex,
                    }),
              }}
            >
              {tok.word}
            </span>
          );
        })}
      </span>
    </Tag>
  );
};
