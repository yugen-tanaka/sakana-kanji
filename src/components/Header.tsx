import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { isMuted, toggleMute, subscribeMute, playWoodClack } from '../utils/sound';

export interface HeaderProps {
  currentState: 'START' | 'PLAYING' | 'RESULT';
  onReturnToStart?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentState,
  onReturnToStart,
  className = '',
}) => {
  const [muted, setMutedState] = useState<boolean>(isMuted());
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  useEffect(() => {
    // ミュート状態の変更を購読
    const unsubscribe = subscribeMute((newMuted) => {
      setMutedState(newMuted);
    });
    return unsubscribe;
  }, []);

  const handleToggleMute = () => {
    playWoodClack();
    const next = toggleMute();
    setMutedState(next);
  };

  const handleReturnClick = () => {
    playWoodClack();
    if (currentState === 'PLAYING') {
      setShowConfirmModal(true);
    } else if (onReturnToStart) {
      onReturnToStart();
    }
  };

  const confirmReturn = () => {
    playWoodClack();
    setShowConfirmModal(false);
    if (onReturnToStart) {
      onReturnToStart();
    }
  };

  const cancelReturn = () => {
    playWoodClack();
    setShowConfirmModal(false);
  };

  return (
    <header className={`w-full relative select-none ${className}`}>
      {/* 暖簾掛け竹竿（ポール） */}
      <div className="relative mx-auto max-w-4xl px-4 pt-2">
        <div className="h-2.5 sm:h-3 w-full bg-gradient-to-r from-[#5a3818] via-[#8d6132] to-[#5a3818] rounded-full shadow-md border-b border-[#3b230d] relative z-20">
          {/* 竹竿の両端の留め具 */}
          <div className="absolute -left-1.5 -top-0.5 w-3.5 h-3.5 sm:h-4 bg-[#3b230d] rounded-full shadow" />
          <div className="absolute -right-1.5 -top-0.5 w-3.5 h-3.5 sm:h-4 bg-[#3b230d] rounded-full shadow" />
        </div>

        {/* 暖簾の吊り紐（乳・チチ） */}
        <div className="flex justify-around px-8 -mt-1 relative z-10">
          <div className="w-2 sm:w-2.5 h-3 bg-[#e8d7be] border-x border-[#8d6132] shadow-xs" />
          <div className="w-2 sm:w-2.5 h-3 bg-[#e8d7be] border-x border-[#8d6132] shadow-xs" />
          <div className="w-2 sm:w-2.5 h-3 bg-[#e8d7be] border-x border-[#8d6132] shadow-xs" />
          <div className="w-2 sm:w-2.5 h-3 bg-[#e8d7be] border-x border-[#8d6132] shadow-xs" />
          <div className="w-2 sm:w-2.5 h-3 bg-[#e8d7be] border-x border-[#8d6132] shadow-xs" />
        </div>
      </div>

      {/* 暖簾カーテン本体 */}
      <div className="relative mx-auto max-w-4xl px-3 -mt-1 z-10">
        <div className="bg-gradient-to-b from-[#101d2d] via-[#152538] to-[#1a2d44] text-amber-50 rounded-b-2xl shadow-xl border-x-2 border-b-4 border-[#0c1622] relative overflow-hidden">
          {/* 藍染めの布目模様テクスチャ */}
          <div className="absolute inset-0 bg-repeat opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* 暖簾のスリット演出（縦のスリット区切り線） */}
          <div className="absolute inset-y-0 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-[#0a121c]/70 to-[#0a121c] pointer-events-none" />
          <div className="absolute inset-y-0 right-1/3 w-[1px] bg-gradient-to-b from-transparent via-[#0a121c]/70 to-[#0a121c] pointer-events-none" />

          {/* 上部・下部の白染めライン（伝統的な江戸前暖簾デザイン） */}
          <div className="w-full h-1 bg-amber-100/20" />

          <div className="px-4 py-3 sm:py-5 flex items-center justify-between gap-3 relative z-10">
            {/* 左側：戻るボタン（プレイ中または結果画面時のみ表示） */}
            <div className="w-28 sm:w-36 flex items-center justify-start">
              {currentState !== 'START' && (
                <button
                  type="button"
                  onClick={handleReturnClick}
                  className="wood-button flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-wood-deep text-xs font-brush hover:brightness-105 active:scale-95 transition-all shadow-md group"
                  title="最初（お品書き）に戻る"
                  aria-label="お品書きに戻る"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-wood-dark group-hover:-rotate-45 transition-transform" />
                  <span className="hidden xs:inline">お品書きへ</span>
                  <span className="xs:hidden">戻る</span>
                </button>
              )}
            </div>

            {/* 中央：屋号看板 「すし処 魚偏亭」 & サブタイトル 「魚偏漢字道場」 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl drop-shadow">🍣</span>
                <h1 className="text-2xl sm:text-4xl font-brush font-bold tracking-widest text-[#f5ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  すし処 魚偏亭
                </h1>
                <span className="text-xl sm:text-2xl drop-shadow">🐟</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-[1px] w-6 sm:w-10 bg-amber-400/40" />
                <span className="text-xs sm:text-sm font-mincho tracking-[0.25em] text-amber-200/90 font-medium">
                  魚偏漢字道場
                </span>
                <span className="h-[1px] w-6 sm:w-10 bg-amber-400/40" />
              </div>
            </div>

            {/* 右側：木札風サウンドトグルボタン */}
            <div className="w-28 sm:w-36 flex items-center justify-end">
              <button
                type="button"
                onClick={handleToggleMute}
                className="wood-button flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-wood-deep text-xs font-brush hover:brightness-105 active:scale-95 transition-all shadow-md group border border-[#a87d46]"
                title={muted ? '音声を有効にする' : '音声をミュートする'}
                aria-label={muted ? '音：無' : '音：有'}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4 text-vermilion-stamp group-hover:scale-110 transition-transform" />
                ) : (
                  <Volume2 className="w-4 h-4 text-matcha-deep group-hover:scale-110 transition-transform" />
                )}
                <span className="font-semibold tracking-wider">
                  {muted ? '音：無' : '音：有'}
                </span>
              </button>
            </div>
          </div>

          {/* 暖簾の裾の房・飾りステッチ風 */}
          <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />
        </div>
      </div>

      {/* プレイ中の途中離脱確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="wood-card max-w-sm w-full p-6 rounded-2xl border-2 border-wood-base shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-vermilion-stamp" />
            <div className="font-brush text-2xl text-wood-deep mb-2">暖簾をくぐり直しますか？</div>
            <p className="font-mincho text-xs sm:text-sm text-washi-800 mb-6 leading-relaxed">
              現在挑戦中のクイズの記録は保存されません。お品書き（設定画面）に戻りますか？
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={cancelReturn}
                className="px-4 py-2 rounded-xl bg-washi-200 hover:bg-washi-300 text-washi-800 font-mincho text-sm font-semibold border border-wood-base/50 transition-colors"
              >
                続ける
              </button>
              <button
                type="button"
                onClick={confirmReturn}
                className="px-4 py-2 rounded-xl bg-vermilion-stamp hover:bg-vermilion-deep text-white font-brush text-sm tracking-wider shadow-md transition-colors"
              >
                お品書きに戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
