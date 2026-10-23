import React, { useEffect } from 'react';
import type { QuizQuestion } from '../types/kanji';
import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export interface FeedbackOverlayProps {
  isCorrect: boolean;
  question: QuizQuestion;
  onNext: () => void;
  streak?: number;
  variant?: 'overlay' | 'inline';
  className?: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  isCorrect,
  question,
  onNext,
  streak = 0,
  variant = 'overlay',
  className = '',
}) => {
  const { target } = question;

  // EnterキーまたはSpaceキーで次の一貫へ進む
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  // 印鑑の文字決定
  // 連続正解時は「大入」、通常正解時は「正解！」、不正解時は「残念！」
  const stampText = isCorrect
    ? streak >= 3
      ? '大入'
      : '正解！'
    : '残念！';

  const stampSubText = isCorrect
    ? streak >= 3
      ? `${streak}貫連続的中！大入り満員`
      : '見事な目利き！'
    : '惜しい！次回に期待';

  const content = (
    <div
      className={`relative w-full max-w-xl mx-auto washi-pattern rounded-2xl border-2 shadow-2xl p-6 sm:p-8 overflow-hidden ${
        isCorrect
          ? 'border-emerald-600/60 bg-[#fbf9f4]'
          : 'border-vermilion-stamp/60 bg-[#fcf8f6]'
      } ${className}`}
    >
      {/* 背景のうっすらとした朱肉・印影装飾 */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-vermilion-stamp/5 pointer-events-none blur-xl" />

      {/* 朱色印鑑（判子・ハンコ）スタンプ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-wood-base/30">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span
              className={`text-xs font-brush px-2.5 py-0.5 rounded-full border ${
                isCorrect
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}
            >
              判定結果
            </span>
            <span className="text-xs font-mincho text-wood-dark">
              {stampSubText}
            </span>
          </div>

          {/* 対象漢字と読み */}
          <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-3 flex-wrap">
            <span className="font-brush text-4xl sm:text-5xl text-wood-deep font-bold drop-shadow-xs">
              {target.kanji}
            </span>
            <div className="flex flex-col">
              <span className="font-mincho text-xl sm:text-2xl font-bold text-indigo-noren">
                {target.reading}
              </span>
              <span className="font-mincho text-xs text-wood-dark">
                【{target.furigana} / {target.romaji}】
              </span>
            </div>
            {target.category && (
              <span className="ml-auto px-2 py-0.5 rounded bg-wood-base/20 border border-wood-base/40 text-wood-deep font-mincho text-xs">
                {target.category}
              </span>
            )}
          </div>
        </div>

        {/* ハンコ印影 */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div
            className={`hanko-stamp px-4 py-2 text-center select-none ${
              isCorrect
                ? 'border-vermilion-stamp text-vermilion-stamp shadow-[0_0_0_1px_rgba(197,61,47,0.3)] animate-stamp'
                : 'border-[#7a4842] text-[#7a4842] shadow-[0_0_0_1px_rgba(122,72,66,0.3)] animate-stamp'
            }`}
            style={{
              fontFamily: '"Yuji Boku", serif',
            }}
          >
            <div className="text-2xl sm:text-3xl font-bold tracking-widest whitespace-nowrap">
              {stampText}
            </div>
            <div className="text-[10px] tracking-wider border-t border-current pt-0.5 mt-0.5">
              すし処 魚偏亭
            </div>
          </div>
        </div>
      </div>

      {/* ネタ帳・巻物風の由来・生態・寿司豆知識カード */}
      <div className="mt-5 relative">
        <div className="bg-[#f5ecdc] border border-[#d6be96] rounded-xl p-4 sm:p-5 shadow-inner relative">
          {/* 和紙巻物の巻緒（紐）と見出し */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#dfcca8]">
            <BookOpen className="w-4 h-4 text-wood-dark" />
            <h4 className="font-brush text-base text-wood-deep font-semibold tracking-wider">
              魚偏亭 ネタ帳の覚え書き
            </h4>
            <Sparkles className="w-3.5 h-3.5 text-amber-600 ml-auto" />
          </div>

          {/* 豆知識テキスト */}
          <p className="font-mincho text-xs sm:text-sm text-washi-900 leading-relaxed sm:leading-loose">
            {target.trivia}
          </p>
        </div>
      </div>

      {/* 「次の一貫へ（Enter）」ボタン */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-700 text-amber-50 font-brush text-lg tracking-widest shadow-xl border border-amber-800 hover:shadow-2xl active:scale-98 transition-all flex items-center justify-center gap-3 group"
        >
          <span>次の一貫へ</span>
          <span className="text-xs font-mincho bg-amber-950/50 px-2 py-0.5 rounded text-amber-200 border border-amber-500/30">
            Enter ↵
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );

  // オーバーレイ表示の場合（モーダル背景付き）
  if (variant === 'overlay') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
        {content}
      </div>
    );
  }

  // インライン表示の場合
  return content;
};
