import React from 'react';
import type { QuizMode } from '../types/kanji';

export interface QuizModeSelectorProps {
  mode: QuizMode;
  onChange: (mode: QuizMode) => void;
  className?: string;
}

interface ModeOption {
  key: QuizMode;
  title: string;
  subtitle: string;
  description: string;
  samplePrompt: string;
  samplePromptType: 'kanji' | 'reading';
  sampleTarget: string;
  sampleTargetType: 'kanji' | 'reading';
}

const MODES: ModeOption[] = [
  {
    key: 'KANJI_TO_READING',
    title: '漢字 → 読み',
    subtitle: '王道・魚名当て',
    description: '板前の掲げた魚偏漢字を見て、正しい魚の名前（読み）を当てます。',
    samplePrompt: '鮪',
    samplePromptType: 'kanji',
    sampleTarget: 'まぐろ',
    sampleTargetType: 'reading',
  },
  {
    key: 'READING_TO_KANJI',
    title: '読み → 漢字',
    subtitle: '目利き・漢字当て',
    description: '注文された魚の名前を見て、正しい魚偏の漢字を見極めます。',
    samplePrompt: 'まぐろ',
    samplePromptType: 'reading',
    sampleTarget: '鮪',
    sampleTargetType: 'kanji',
  },
];

export const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({
  mode,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={`bg-washi-50 border-2 border-wood-base/60 rounded-2xl p-5 shadow-sm relative ${className}`}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-wood-base/30">
        <span className="w-8 h-8 rounded-lg bg-indigo-noren text-amber-200 border border-amber-500/40 flex items-center justify-center text-lg font-brush shadow-xs">
          簾
        </span>
        <div>
          <h3 className="font-brush text-xl text-wood-deep tracking-wide">
            出題形式（暖簾分け）
          </h3>
          <p className="text-xs text-washi-800/80 font-mincho">
            漢字から読みを当てるか、読みから漢字を当てるかを選択
          </p>
        </div>
      </div>

      {/* 2つのモード切替カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODES.map((item) => {
          const isSelected = mode === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-noren to-indigo-deep text-washi-50 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-washi-100 hover:bg-wood-light/40 text-washi-900 border-wood-base/40 hover:border-wood-base'
              }`}
            >
              {/* 選択中の落款印 / Hanko */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 hanko-stamp px-1.5 py-0.5 text-xs font-brush tracking-tighter bg-amber-50/90 shadow-sm">
                  選定
                </div>
              )}

              {/* 上部タイトル */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-mincho px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30'
                        : 'bg-wood-base/20 text-wood-deep'
                    }`}
                  >
                    {item.subtitle}
                  </span>
                </div>
                <h4
                  className={`font-brush text-2xl tracking-wide mb-1.5 ${
                    isSelected ? 'text-amber-200' : 'text-wood-deep'
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs font-mincho leading-relaxed mb-4 ${
                    isSelected ? 'text-washi-200' : 'text-washi-800/80'
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* サンプルプレビュー（寿司下駄風の枠） */}
              <div
                className={`p-3 rounded-lg border flex items-center justify-center gap-3 transition-colors ${
                  isSelected
                    ? 'bg-indigo-light/50 border-amber-500/30 text-washi-50'
                    : 'bg-washi-50 border-wood-base/30 text-washi-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`${
                      item.samplePromptType === 'kanji'
                        ? 'font-brush text-3xl text-amber-400 drop-shadow-xs'
                        : 'font-mincho text-xl font-bold'
                    }`}
                  >
                    {item.samplePrompt}
                  </span>
                  <span
                    className={`text-sm ${
                      isSelected ? 'text-amber-300' : 'text-wood-dark'
                    }`}
                  >
                    ➜
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded border shadow-xs ${
                      isSelected
                        ? 'bg-amber-200 text-indigo-deep border-amber-300 font-bold'
                        : 'wood-button text-wood-deep font-bold'
                    } ${
                      item.sampleTargetType === 'kanji'
                        ? 'font-brush text-xl'
                        : 'font-mincho text-sm'
                    }`}
                  >
                    {item.sampleTarget}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
