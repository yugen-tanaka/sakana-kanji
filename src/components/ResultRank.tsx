import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Menu,
  Share2,
  CheckCircle,
  Trophy,
  Clock,
  Target,
  Award,
  BookOpen,
} from 'lucide-react';
import type { QuizSummary } from '../types/kanji';
import { playCelebrationChime, playWoodClack } from '../utils/sound';

export interface ResultRankProps {
  summary: QuizSummary;
  onRetry: () => void;
  onBackToMenu: () => void;
  className?: string;
}

/**
 * 成績に基づく番付ランク情報
 */
interface BanzukeRank {
  rankTitle: string; // 番付名 (見習い小僧, 三番板前, 花形板前, 江戸前親方, 魚偏免許皆伝)
  sealText: string;
  badgeColor: string;
  evaluation: string;
}

function getBanzukeRank(ratio: number): BanzukeRank {
  if (ratio === 1.0) {
    return {
      rankTitle: '魚偏免許皆伝・江戸前親方',
      sealText: '免許皆伝',
      badgeColor: 'bg-amber-600 text-amber-50 border-amber-700',
      evaluation: '見事全問正解！魚偏の真理を極めた当代無双の江戸前親方です。',
    };
  }
  if (ratio >= 0.8) {
    return {
      rankTitle: '花形板前・目利き名人',
      sealText: '花形板前',
      badgeColor: 'bg-emerald-700 text-emerald-50 border-emerald-800',
      evaluation: '鮮やかな包丁捌きと優れた目利き！カウンターを任せられる花形板前です。',
    };
  }
  if (ratio >= 0.6) {
    return {
      rankTitle: '三番板前・一人前職人',
      sealText: '三番板前',
      badgeColor: 'bg-indigo-700 text-indigo-50 border-indigo-800',
      evaluation: '確かな腕前の持ち主。基本がしっかり身についている一人前職人です。',
    };
  }
  if (ratio >= 0.4) {
    return {
      rankTitle: '修業中の見習い板前',
      sealText: '修業中',
      badgeColor: 'bg-wood-dark text-wood-light border-wood-deep',
      evaluation: '魚偏の奥深さはここから。日々の仕込みと研鑽でさらなる高みへ！',
    };
  }
  return {
    rankTitle: '見習い小僧・出直し',
    sealText: '出直し',
    badgeColor: 'bg-stone-700 text-stone-100 border-stone-800',
    evaluation: 'まずは湯呑みの魚偏漢字を眺めるところから！もう一丁暖簾をくぐりましょう。',
  };
}

/**
 * 所要時間を「○分○秒」または「○秒」にフォーマット
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  }
  return `${seconds}秒`;
}

export const ResultRank: React.FC<ResultRankProps> = ({
  summary,
  onRetry,
  onBackToMenu,
  className = '',
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const { totalQuestions, correctCount, answers, durationMs } = summary;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const ratio = totalQuestions > 0 ? correctCount / totalQuestions : 0;

  const rankInfo = getBanzukeRank(ratio);
  const missedAnswers = answers.filter((a) => !a.isCorrect);

  // 80%以上の場合に紙吹雪（confetti）と祝賀音を発動
  useEffect(() => {
    if (accuracy >= 80) {
      // 祝賀鈴の演奏
      playCelebrationChime();

      // 和風カラーの紙吹雪 (朱色、金、抹茶、白、桜色)
      const colors = ['#c53d2f', '#d4a359', '#536544', '#faf6ee', '#e07a5f'];

      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.55 },
        colors,
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [accuracy]);

  // 結果共有（クリップボードコピー）
  const handleShare = async () => {
    playWoodClack();

    const formattedTime = formatDuration(durationMs);
    const shareText = [
      '【すし処 魚偏亭 魚偏漢字道場】',
      `番付称号：${rankInfo.rankTitle}`,
      `お勘定成績：${correctCount} / ${totalQuestions} 貫（正答率 ${accuracy}%）`,
      `所要時間：${formattedTime}`,
      '#魚偏漢字 #すし処魚偏亭 #寿司漢字クイズ',
    ].join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // フォールバック
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // コピー失敗時は何もしない
    }
  };

  const handleRetryClick = () => {
    playWoodClack();
    onRetry();
  };

  const handleBackToMenuClick = () => {
    playWoodClack();
    onBackToMenu();
  };

  return (
    <div className={`w-full max-w-3xl mx-auto space-y-8 animate-fade-in ${className}`}>
      {/* ＝＝＝＝＝ お勘定 兼 番付認定証 ＝＝＝＝＝ */}
      <div className="relative washi-pattern rounded-2xl border-4 border-[#9c7746] shadow-2xl p-6 sm:p-10 overflow-hidden">
        {/* 背景の和風装飾枠線 */}
        <div className="absolute inset-2 border border-[#d4a359]/40 rounded-xl pointer-events-none" />
        <div className="absolute inset-3 border border-[#d4a359]/20 rounded-lg pointer-events-none" />

        {/* 認定証・お勘定ヘッダー */}
        <div className="text-center pb-6 border-b-2 border-dashed border-[#c49f6b] relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wood-base/20 border border-wood-base/50 text-wood-deep text-xs font-brush tracking-widest mb-2">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            すし処 魚偏亭 公認
          </div>

          <h2 className="text-3xl sm:text-5xl font-brush font-bold text-wood-deep tracking-wider drop-shadow-xs">
            番付認定証 兼 お勘定
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-mincho text-wood-dark tracking-widest">
            本日のおまかせ握りコース・腕前鑑定
          </p>
        </div>

        {/* 認定番付（称号）エリア */}
        <div className="my-7 flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#f4ede0]/90 rounded-2xl p-6 border border-[#c49f6b]/60 relative shadow-inner">
          <div className="text-center sm:text-left flex-1">
            <div className="text-xs font-mincho text-wood-dark font-medium tracking-wider mb-1">
              鑑定番付（職人称号）
            </div>
            <div className="font-brush text-2xl sm:text-3xl text-indigo-noren font-bold tracking-wide">
              {rankInfo.rankTitle}
            </div>
            <p className="mt-2 text-xs sm:text-sm font-mincho text-washi-800 leading-relaxed">
              {rankInfo.evaluation}
            </p>
          </div>

          {/* 朱色印鑑（判子） */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="hanko-stamp px-4 py-2.5 text-center select-none bg-vermilion-stamp/5 border-vermilion-stamp text-vermilion-stamp shadow-[0_0_0_1px_rgba(197,61,47,0.3)] animate-stamp">
              <div className="text-xl sm:text-2xl font-bold tracking-widest font-brush">
                {rankInfo.sealText}
              </div>
              <div className="text-[9px] tracking-wider border-t border-current pt-0.5 mt-0.5">
                魚偏亭 主之印
              </div>
            </div>
          </div>
        </div>

        {/* 成績一覧グリッド（木札・お勘定スタイル） */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          {/* 正解貫数 */}
          <div className="bg-[#f9f5ed] rounded-xl p-4 border border-[#d6be96] text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mincho text-wood-dark mb-1">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>正解貫数</span>
            </div>
            <div className="font-brush text-3xl text-wood-deep font-bold">
              {correctCount}
              <span className="text-sm font-mincho text-wood-dark font-normal ml-1">
                / {totalQuestions} 貫
              </span>
            </div>
          </div>

          {/* 正答率 */}
          <div className="bg-[#f9f5ed] rounded-xl p-4 border border-[#d6be96] text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mincho text-wood-dark mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>正答率（的中率）</span>
            </div>
            <div
              className={`font-brush text-3xl font-bold ${
                accuracy >= 80
                  ? 'text-emerald-700'
                  : accuracy >= 60
                  ? 'text-indigo-800'
                  : 'text-vermilion-stamp'
              }`}
            >
              {accuracy}
              <span className="text-sm font-mincho text-wood-dark font-normal ml-0.5">
                %
              </span>
            </div>
          </div>

          {/* 所要時間 */}
          <div className="bg-[#f9f5ed] rounded-xl p-4 border border-[#d6be96] text-center shadow-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mincho text-wood-dark mb-1">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>所要時間（勘定時間）</span>
            </div>
            <div className="font-brush text-3xl text-wood-deep font-bold">
              {formatDuration(durationMs)}
            </div>
          </div>
        </div>

        {/* コピー完了トースト */}
        {copied && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-mincho flex items-center justify-center gap-2 animate-fade-in shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>番付認定結果をクリップボードに控えました（コピー完了）</span>
          </div>
        )}

        {/* アクションボタン群 */}
        <div className="mt-8 pt-6 border-t border-[#c49f6b]/50 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 再挑戦ボタン */}
          <button
            type="button"
            onClick={handleRetryClick}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-amber-50 font-brush text-base tracking-wider shadow-lg border border-amber-800 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>もう一度暖簾をくぐる</span>
          </button>

          {/* 設定変更ボタン */}
          <button
            type="button"
            onClick={handleBackToMenuClick}
            className="w-full py-3.5 px-4 rounded-xl wood-button text-wood-deep font-brush text-base tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Menu className="w-4 h-4 text-wood-dark" />
            <span>お品書きを変える</span>
          </button>

          {/* 結果共有ボタン */}
          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3.5 px-4 rounded-xl bg-[#231d17] hover:bg-[#342b22] text-amber-100 font-brush text-base tracking-wider shadow-lg border border-amber-900/40 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>写し完了</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-300" />
                <span>結果を共有</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ＝＝＝＝＝ 本日の復習・おさらい（間違えた問題の一覧） ＝＝＝＝＝ */}
      <div className="washi-pattern rounded-2xl border-2 border-[#c49f6b] shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#c49f6b]/40">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-wood-dark" />
            <h3 className="font-brush text-2xl text-wood-deep font-bold tracking-wider">
              本日の復習・おさらい
            </h3>
          </div>
          <span className="text-xs font-mincho px-2.5 py-1 rounded-full bg-wood-base/20 text-wood-deep border border-wood-base/40">
            {missedAnswers.length > 0
              ? `復習ネタ：${missedAnswers.length} 貫`
              : '全問正解！'}
          </span>
        </div>

        {missedAnswers.length === 0 ? (
          /* 全問正解時の祝賀表示 */
          <div className="my-8 text-center py-8 px-4 bg-emerald-50/60 rounded-xl border border-emerald-300/60">
            <div className="text-4xl mb-3">🍣✨</div>
            <div className="font-brush text-2xl text-emerald-950 font-bold mb-2">
              全問正解！文句なしの大入り満点
            </div>
            <p className="font-mincho text-xs sm:text-sm text-emerald-900/80 max-w-md mx-auto leading-relaxed">
              間違えたネタは一貫もございません。魚偏の真理を見事に会得されました。
            </p>
          </div>
        ) : (
          /* 間違えた漢字の復習カード一覧 */
          <div className="mt-5 space-y-4">
            <p className="text-xs font-mincho text-wood-dark">
              本日つまずいたネタです。由来や豆知識を読み込んで、次回の挑戦に活かしましょう。
            </p>

            <div className="space-y-3.5">
              {missedAnswers.map(({ question, selectedAnswer }, index) => {
                const { target, choices, correctIndex } = question;
                const correctChoice = choices[correctIndex];

                return (
                  <div
                    key={`${target.id}-${index}`}
                    className="bg-[#faf5eb] rounded-xl p-4 sm:p-5 border border-[#dfcca8] shadow-xs relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      {/* 漢字・読み・カテゴリ */}
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="font-brush text-4xl text-wood-deep font-bold">
                          {target.kanji}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-mincho text-lg font-bold text-indigo-noren">
                            {target.reading}
                          </span>
                          <span className="font-mincho text-xs text-wood-dark">
                            【{target.furigana} / {target.romaji}】
                          </span>
                        </div>
                        {target.category && (
                          <span className="px-2 py-0.5 rounded bg-wood-base/20 border border-wood-base/40 text-wood-deep font-mincho text-xs">
                            {target.category}
                          </span>
                        )}
                      </div>

                      {/* あなたの回答 vs 正解 */}
                      <div className="flex items-center gap-2 text-xs font-mincho self-start sm:self-auto bg-washi-100 px-3 py-1.5 rounded-lg border border-wood-base/30">
                        <span className="text-rose-800 font-semibold line-through">
                          選択: {selectedAnswer}
                        </span>
                        <span className="text-wood-dark">➜</span>
                        <span className="text-emerald-800 font-bold">
                          正解: {correctChoice}
                        </span>
                      </div>
                    </div>

                    {/* 豆知識 */}
                    <div className="mt-3 pt-3 border-t border-[#dfcca8]/60 text-xs sm:text-sm font-mincho text-washi-900 leading-relaxed bg-[#f2e6d1]/60 rounded-lg p-3">
                      <div className="font-semibold text-wood-dark text-xs mb-1">
                        【由来とネタ帳】
                      </div>
                      <p>{target.trivia}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
