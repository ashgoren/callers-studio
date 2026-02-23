import { useState } from 'react';
import type { FigureItem } from '@/lib/types/database';

const PHRASES = ['A1', 'A2', 'B1', 'B2'];

export const useFigures = (
  dance: { figures?: FigureItem[] } | undefined,
) => {
  const [pendingFigures, setPendingFigures] = useState<FigureItem[] | null>(null);
  const figures = pendingFigures ?? (dance?.figures ?? []);

  const addFigure = () => {
    const nextOrder = figures.length > 0 ? Math.max(...figures.map(f => f.order)) + 1 : 1;
    const totalBeats = figures.reduce((sum, f) => sum + (f.beats ?? 0), 0);
    const phraseIndex = Math.min(Math.floor(totalBeats / 16), PHRASES.length - 1);
    const nextPhrase = PHRASES[phraseIndex];
    const beatsRemaining = Math.min(16 - (totalBeats % 16), 8);
    setPendingFigures([...figures, { phrase: nextPhrase, beats: beatsRemaining, description: '', order: nextOrder }]);
  };

  const updateFigure = (index: number, key: 'phrase' | 'beats' | 'description', value: string | number | null) => {
    setPendingFigures(figures.map((figure, i) => i === index ? { ...figure, [key]: value } : figure));
  };

  const deleteFigure = (index: number) => {
    setPendingFigures(figures.filter((_, i) => i !== index));
  };

  return { figures, addFigure, updateFigure, deleteFigure, hasPendingChanges: pendingFigures !== null };
};
