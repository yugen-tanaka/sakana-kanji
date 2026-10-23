import React, { useEffect } from 'react';
import type { QuizQuestion } from '../types/kanji';

export interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  onSelectAnswer: (choice: string) => void;
  onNext?: () => void;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isAnswered,
  onSelectAnswer,
  onNext,
  className = '',
}) => {
  const { target, prompt, choices, correctIndex, mode } = question;
  const correctChoice = choices[correctIndex];
  const isKanjiMode = mode === 'KANJI_TO_READING';

  // キーボードショートカット (1, 2, 3 キーで回答、Enter / Space で次へ)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (!isAnswered) {
        if (e.key === '1' && choices[0]) {
          e.preventDefault();
          onSelectAnswer(choices[0]);
        } else if (e.key === '2' && choices[1]) {
          e.preventDefault();
          onSelectAnswer(choices[1]);
        } else if (e.key === '3' && choices[2]) {
          e.preventDefault();
          onSelectAnswer(choices[2]);
        }
      } else if (
        onNext &&
        (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')
      ) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onSelectAnswer, onNext, choices]);

  // 難易度バッジ表示
  const levelLabels = { 1: '初級', 2: '中級', 3: '上級' };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* 寿司下駄（木製トレイ） */}
      <div className="relative">
        <div className="wood-card rounded-2xl p-6 sm:p-9 text-center relative border border-[#c49f6b] shadow-2xl overflow-hidden">
          {/* 和紙の繊細な光彩と木目アクセント */}
          <div className="absolute inset-0 bg-wood-pattern opacity-30 pointer-events-none" />

          {/* 上部バッジ（貫数・分類・難易度） */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-6">
            {/* 貫数（進行状況） */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-wood-deep/80 text-amber-200 border border-amber-400/30 text-xs font-brush tracking-widest shadow-sm">
                第 {questionNumber} 貫 / {totalQuestions > 0 ? `${totalQuestions} 貫` : '全問'}
              </span>
              <span className="text-[11px] font-mincho text-wood-deep/80 hidden sm:inline">
                【{isKanjiMode ? '漢字 ➜ 読み' : '読み ➜ 漢字'}】
              </span>
            </div>

            {/* カテゴリ & 難易度バッジ */}
            <div className="flex items-center gap-1.5">
              {target.category && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#231d17]/80 text-amber-200 border border-amber-500/40 text-xs font-mincho shadow-xs">
                  {target.category}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-wood-base/40 text-wood-deep border border-wood-base/60 text-xs font-brush">
                {levelLabels[target.level]}
              </span>
            </div>
          </div>

          {/* 出題プロンプト */}
          <div className="relative z-10 my-4 sm:my-6 min-h-[140px] flex flex-col items-center justify-center">
            {isKanjiMode ? (
              /* 漢字モード: 毛筆 (Yuji Boku) 特大サイズ */
              <div className="font-brush text-7xl sm:text-8xl tracking-wider text-wood-deep select-none drop-shadow-[0_4px_6px_rgba(45,26,8,0.25)]">
                {prompt}
              </div>
            ) : (
              /* 読みモード: 明朝 (Shippori Mincho) */
              <div className="font-mincho text-4xl sm:text-5xl font-bold tracking-widest text-wood-deep select-none drop-shadow-[0_2px_4px_rgba(45,26,8,0.2)]">
                {prompt}
              </div>
            )}
            <div className="mt-2 text-xs font-mincho text-wood-dark/90 tracking-widest">
              {isKanjiMode ? 'この魚の正しい読み（名前）は？' : 'この魚の正しい魚偏漢字は？'}
            </div>
          </div>

          {/* 回答後の豆知識・解説パネル */}
          {isAnswered && (
            <div className="relative z-10 mt-6 pt-5 border-t border-wood-base/40 text-left bg-washi-50/90 rounded-xl p-4 shadow-inner border border-wood-base/30 animate-fade-in">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-brush text-2xl text-wood-deep font-bold">
                    {target.kanji}
                  </span>
                  <span className="font-mincho text-sm text-indigo-noren font-semibold">
                    ({target.reading} / {target.furigana})
                  </span>
                </div>
                <div className="text-xs font-mincho text-wood-dark">
                  豆知識
                </div>
              </div>
              <p className="text-xs sm:text-sm font-mincho text-washi-800 leading-relaxed">
                {target.trivia}
              </p>
            </div>
          )}
        </div>

        {/* 寿司下駄の脚（木製の台座） */}
        <div className="flex justify-between px-10 sm:px-14 -mt-1 relative z-0 pointer-events-none">
          <div className="w-10 sm:w-12 h-3.5 bg-[#8c6738] rounded-b-md shadow-md border-t border-[#6d4d23]" />
          <div className="w-10 sm:w-12 h-3.5 bg-[#8c6738] rounded-b-md shadow-md border-t border-[#6d4d23]" />
        </div>
      </div>

      {/* 3つの選択肢（木札スタイル） */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-mincho text-washi-800/80">
          <span>選択肢を選んでください（数字キー [1] [2] [3] でも回答可）:</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {choices.map((choice, index) => {
            const keyNumber = index + 1;
            const isCorrect = choice === correctChoice;
            const isSelected = choice === selectedAnswer;

            // 状態スタイル判定
            let buttonStyle =
              'wood-button text-wood-deep hover:border-amber-600 hover:shadow-md';
            let statusBadge = null;

            if (isAnswered) {
              if (isCorrect) {
                // 正解（緑 / 抹茶スタイル）
                buttonStyle =
                  'bg-emerald-50 border-2 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-500/40 scale-[1.01]';
                statusBadge = (
                  <span className="flex items-center gap-1 font-brush text-xs font-bold text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-md border border-emerald-400">
                    <span className="text-sm">○</span> 正解
                  </span>
                );
              } else if (isSelected) {
                // 不正解（赤 / 朱肉スタイル）
                buttonStyle =
                  'bg-rose-50 border-2 border-vermilion-stamp text-rose-950 shadow-md ring-2 ring-rose-500/40';
                statusBadge = (
                  <span className="flex items-center gap-1 font-brush text-xs font-bold text-rose-800 bg-rose-200/80 px-2.5 py-1 rounded-md border border-rose-400">
                    <span className="text-sm">✕</span> 不正解
                  </span>
                );
              } else {
                // その他の選択肢（薄暗く）
                buttonStyle =
                  'opacity-40 bg-wood-light/40 border-wood-base/20 text-washi-800/70';
              }
            }

            return (
              <button
                key={choice}
                type="button"
                disabled={isAnswered}
                onClick={() => onSelectAnswer(choice)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-150 flex items-center justify-between group ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5">
                  {/* キー番号バッジ [1], [2], [3] */}
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-brush text-sm border shadow-xs transition-colors ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : isAnswered && isSelected
                        ? 'bg-vermilion-stamp text-white border-rose-700'
                        : 'bg-wood-base/20 text-wood-deep border-wood-base/50 group-hover:bg-amber-600 group-hover:text-white'
                    }`}
                  >
                    {keyNumber}
                  </span>

                  {/* 選択肢テキスト */}
                  <span
                    className={`tracking-wide ${
                      isKanjiMode
                        ? 'font-mincho text-lg sm:text-xl font-bold'
                        : 'font-brush text-2xl sm:text-3xl'
                    }`}
                  >
                    {choice}
                  </span>
                </div>

                {/* 状態バッジ */}
                {statusBadge && <div>{statusBadge}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 回答後の次へ進むボタン（ショートカットキー案内付き） */}
      {isAnswered && onNext && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-amber-50 font-brush text-lg tracking-wider shadow-lg border border-amber-800 flex items-center justify-center gap-2 group transition-all"
          >
            <span>次の一貫へ進む</span>
            <span className="text-xs font-mincho bg-amber-900/60 px-2 py-0.5 rounded text-amber-200">
              [Enter ↵]
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
