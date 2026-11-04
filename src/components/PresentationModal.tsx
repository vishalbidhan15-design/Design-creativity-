import React, { useEffect, useState } from 'react';
import {
  AspectRatioFormat,
  SlideData,
  ThemePalette,
  TypographyPair,
} from '../types/presentation';
import { SlideCanvas } from './SlideCanvas';
import { ChevronLeft, ChevronRight, X, FileText } from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  deckTitle: string;
  slides: SlideData[];
  initialSlideIndex?: number;
  theme: ThemePalette;
  typography: TypographyPair;
  aspectRatio: AspectRatioFormat;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  deckTitle,
  slides,
  initialSlideIndex = 0,
  theme,
  typography,
  aspectRatio,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);

  useEffect(() => {
    setCurrentIndex(initialSlideIndex);
  }, [initialSlideIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  if (!isOpen) return null;

  const activeSlide = slides[currentIndex] || slides[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Presentation mode: ${deckTitle}`}
      className="fixed inset-0 z-50 bg-slate-950/95 text-white flex flex-col justify-between p-4 sm:p-6"
    >
      {/* Top Presenter Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-bold tracking-tight truncate">{deckTitle}</span>
          <span aria-hidden="true" className="text-slate-600">
            ·
          </span>
          <span className="text-xs font-mono tabular-nums text-slate-400">
            Slide {String(currentIndex + 1).padStart(2, '0')} of{' '}
            {String(slides.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSpeakerNotes((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              showSpeakerNotes
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-transparent border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            {showSpeakerNotes ? 'Hide Speaker Notes' : 'Show Speaker Notes'}
          </button>

          <button
            type="button"
            aria-label="Exit presentation mode"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium bg-white text-slate-900 hover:bg-slate-200 rounded-md transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            Exit Presentation
          </button>
        </div>
      </div>

      {/* Main Stage & Optional Speaker Notes */}
      <div className="my-auto py-4 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className={showSpeakerNotes ? 'lg:col-span-9' : 'lg:col-span-12'}>
          <SlideCanvas
            slide={activeSlide}
            slideIndex={currentIndex}
            totalSlides={slides.length}
            deckTitle={deckTitle}
            theme={theme}
            typography={typography}
            aspectRatio={aspectRatio}
            editable={false}
          />
        </div>

        {showSpeakerNotes && (
          <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 p-5 space-y-4 self-stretch flex flex-col justify-between">
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">
                PRESENTER TELEPROMPTER
              </div>
              <h3 className="text-sm font-semibold text-white">
                {activeSlide.sectionKicker}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSlide.speakerNotes ||
                  'No speaker notes recorded for this slide.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div>Keyboard: ← / → Arrows</div>
              <div>Format: {aspectRatio}</div>
            </div>
          </aside>
        )}
      </div>

      {/* Bottom Slide Navigation Bar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          className="px-4 py-2 text-xs font-medium bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Previous Slide
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`px-2.5 py-1 text-xs font-mono tabular-nums rounded transition-colors whitespace-nowrap shrink-0 ${
                idx === currentIndex
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {String(idx + 1).padStart(2, '0')}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentIndex === slides.length - 1}
          onClick={() =>
            setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
          }
          className="px-4 py-2 text-xs font-medium bg-slate-900 border border-slate-700 rounded-md hover:bg-slate-800 disabled:opacity-40 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          Next Slide
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
