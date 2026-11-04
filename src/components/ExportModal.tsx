import React, { useState } from 'react';
import {
  AspectRatioFormat,
  SlideData,
  ThemePalette,
  TypographyPair,
} from '../types/presentation';
import {
  generateCssTokens,
  generateStandaloneHtmlDeck,
} from '../utils/deckEngine';
import { Download, Copy, Check, X, BookmarkCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  deckTitle: string;
  slides: SlideData[];
  theme: ThemePalette;
  typography: TypographyPair;
  aspectRatio: AspectRatioFormat;
  onSaveCustomDeck: (customName: string) => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  deckTitle,
  slides,
  theme,
  typography,
  aspectRatio,
  onSaveCustomDeck,
  onClose,
}) => {
  const [customDeckName, setCustomDeckName] = useState(deckTitle);
  const [copiedCss, setCopiedCss] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const cssTokens = generateCssTokens(theme, typography, aspectRatio);

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssTokens);
    } catch {
      // Fallback if clipboard permission is restricted in iframe
    }
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2500);
  };

  const handleDownloadHtml = () => {
    const htmlContent = generateStandaloneHtmlDeck(
      customDeckName || deckTitle,
      slides,
      theme,
      typography,
      aspectRatio
    );
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(customDeckName || deckTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-deck.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const payload = JSON.stringify(
      {
        deckTitle: customDeckName || deckTitle,
        exportedAt: new Date().toISOString(),
        aspectRatio,
        theme,
        typography,
        slides,
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(customDeckName || deckTitle)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-schema.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveWorkspaceSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customDeckName.trim() || deckTitle;
    onSaveCustomDeck(trimmed);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export Presentation & Design Tokens"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-200 max-w-2xl w-full p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Export Presentation & Design System Specification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {slides.length} Slides · {aspectRatio} Format · Theme: {theme.name}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close export modal"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Save Snapshot to Saved Decks */}
        <form
          onSubmit={handleSaveWorkspaceSnapshot}
          className="p-4 bg-slate-50 border border-slate-200 space-y-3"
        >
          <label
            htmlFor="export-deck-title"
            className="block text-xs font-semibold text-slate-800"
          >
            Save Customized Deck to Workspace Library
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="export-deck-title"
              type="text"
              value={customDeckName}
              onChange={(e) => setCustomDeckName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-blue-700"
              placeholder="Enter custom deck title..."
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <BookmarkCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Save to Saved Decks
            </button>
          </div>
          {savedNotice && (
            <p role="status" className="text-xs text-emerald-700 font-medium">
              Saved "{customDeckName}" to your Saved Decks library.
            </p>
          )}
        </form>

        {/* Direct File Export Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="p-4 border border-slate-200 hover:border-slate-300 text-left space-y-1 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Standalone HTML5 Slide Deck
              </span>
              <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
            </div>
            <p className="text-xs text-slate-500">
              Self-contained offline presentation bundle with embedded CSS tokens and print rules.
            </p>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="p-4 border border-slate-200 hover:border-slate-300 text-left space-y-1 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Structured Deck Schema (.JSON)
              </span>
              <Download className="w-4 h-4 text-slate-600" aria-hidden="true" />
            </div>
            <p className="text-xs text-slate-500">
              Complete slide tree, tabular KPI metrics, and brand tokens for CI/CD automation.
            </p>
          </button>
        </div>

        {/* CSS Custom Properties Token Codeblock */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              Generated CSS Design Tokens
            </span>
            <button
              type="button"
              onClick={handleCopyCss}
              className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {copiedCss ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  Copied CSS Tokens
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Copy CSS Tokens
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
            {cssTokens}
          </pre>
        </div>
      </div>
    </div>
  );
};
