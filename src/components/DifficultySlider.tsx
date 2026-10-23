import React, { useRef, useCallback } from 'react';
import type { DifficultyLevel } from '../types/kanji';
import { KANJI_LIST } from '../data/kanjiList';
import { filterKanji, getDifficultyLabel } from '../utils/quizGenerator';

export interface DifficultySliderProps {
  minLevel: DifficultyLevel;
  maxLevel: DifficultyLevel;
  onChange: (minLevel: DifficultyLevel, maxLevel: DifficultyLevel) => void;
  className?: string;
}

interface PresetOption {
  label: string;
  min: DifficultyLevel;
  max: DifficultyLevel;
  description: string;
}

const PRESETS: PresetOption[] = [
  { label: '初級のみ', min: 1, max: 1, description: '基本25字' },
  { label: '中級のみ', min: 2, max: 2, description: '寿司通25字' },
  { label: '上級のみ', min: 3, max: 3, description: '難読27字' },
  { label: '全難易度', min: 1, max: 3, description: '全77字' },
];

const LEVEL_INFO: Record<DifficultyLevel, { name: string; numberKanji: string; desc: string }> = {
  1: { name: '初級', numberKanji: '一', desc: '日常・定番魚' },
  2: { name: '中級', numberKanji: '二', desc: '寿司通・旬の魚' },
  3: { name: '上級', numberKanji: '三', desc: '難読・珍味・古字' },
};

export const DifficultySlider: React.FC<DifficultySliderProps> = ({
  minLevel,
  maxLevel,
  onChange,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  // 対象漢字数の計算
  const candidateCount = filterKanji(KANJI_LIST, minLevel, maxLevel).length;
  const activeLabel = getDifficultyLabel(minLevel, maxLevel);

  // 安全に値を更新（交差禁止: min <= max を厳格に保持）
  const updateRange = useCallback(
    (newMin: DifficultyLevel, newMax: DifficultyLevel) => {
      // 交差厳禁のガード
      const safeMin = Math.min(newMin, newMax) as DifficultyLevel;
      const safeMax = Math.max(newMin, newMax) as DifficultyLevel;
      onChange(safeMin, safeMax);
    },
    [onChange]
  );

  // ポインタードラッグ処理（マウス / タッチ対応）
  const startDrag = (handleType: 'min' | 'max' | 'overlap', e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const initialMin = minLevel;
    const initialMax = maxLevel;

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
      const ratio = x / rect.width;
      const targetStep = (ratio < 0.25 ? 1 : ratio < 0.75 ? 2 : 3) as DifficultyLevel;

      if (handleType === 'min') {
        // 下限ハンドル: 上限を超えない（交差防止、同値は許可）
        const clampedMin = Math.min(targetStep, initialMax) as DifficultyLevel;
        onChange(clampedMin, initialMax);
      } else if (handleType === 'max') {
        // 上限ハンドル: 下限を下回らない（交差防止、同値は許可）
        const clampedMax = Math.max(targetStep, initialMin) as DifficultyLevel;
        onChange(initialMin, clampedMax);
      } else {
        // 重なり状態 (min === max): 左右への移動方向でどちらのハンドルを動かすか自動判定
        const deltaX = moveEvent.clientX - startX;
        if (deltaX < -15) {
          // 左へ引く → 下限を小さくする
          const newMin = Math.min(targetStep, initialMax) as DifficultyLevel;
          onChange(newMin, initialMax);
        } else if (deltaX > 15) {
          // 右へ引く → 上限を大きくする
          const newMax = Math.max(targetStep, initialMin) as DifficultyLevel;
          onChange(initialMin, newMax);
        }
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // トラッククリック時の挙動
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = x / rect.width;
    const clickedStep = (ratio < 0.25 ? 1 : ratio < 0.75 ? 2 : 3) as DifficultyLevel;

    if (clickedStep < minLevel) {
      // 範囲より左側をクリック → 下限を拡大
      onChange(clickedStep, maxLevel);
    } else if (clickedStep > maxLevel) {
      // 範囲より右側をクリック → 上限を拡大
      onChange(minLevel, clickedStep);
    } else if (minLevel === maxLevel) {
      // 重なり時に別の場所をクリック
      if (clickedStep < minLevel) {
        onChange(clickedStep, maxLevel);
      } else if (clickedStep > maxLevel) {
        onChange(minLevel, clickedStep);
      }
    } else {
      // 範囲内をクリックした場合: 近い側の境界を合わせる
      const distToMin = Math.abs(clickedStep - minLevel);
      const distToMax = Math.abs(clickedStep - maxLevel);
      if (distToMin <= distToMax) {
        onChange(clickedStep, maxLevel);
      } else {
        onChange(minLevel, clickedStep);
      }
    }
  };

  // キーボード操作（アクセシビリティ対応）
  const handleKeyDown = (handle: 'min' | 'max', e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (handle === 'min' && minLevel > 1) {
        onChange((minLevel - 1) as DifficultyLevel, maxLevel);
      } else if (handle === 'max' && maxLevel > minLevel) {
        onChange(minLevel, (maxLevel - 1) as DifficultyLevel);
      }
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (handle === 'min' && minLevel < maxLevel) {
        onChange((minLevel + 1) as DifficultyLevel, maxLevel);
      } else if (handle === 'max' && maxLevel < 3) {
        onChange(minLevel, (maxLevel + 1) as DifficultyLevel);
      }
    }
  };

  // トラック上のパーセンテージ計算 (1 -> 0%, 2 -> 50%, 3 -> 100%)
  const minPercent = ((minLevel - 1) / 2) * 100;
  const maxPercent = ((maxLevel - 1) / 2) * 100;
  const rangeWidth = maxPercent - minPercent;
  const isOverlapping = minLevel === maxLevel;

  return (
    <div
      className={`bg-washi-50 border-2 border-wood-base/60 rounded-2xl p-5 shadow-sm relative overflow-hidden ${className}`}
    >
      {/* 寿司屋風ヘッダー */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-wood-base/30">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-wood-base/20 border border-wood-base/60 flex items-center justify-center text-lg font-brush shadow-xs">
            品
          </span>
          <div>
            <h3 className="font-brush text-xl text-wood-deep tracking-wide">
              難易度（職人番付）
            </h3>
            <p className="text-xs text-washi-800/80 font-mincho">
              スライダーまたは木札で出題範囲を指定
            </p>
          </div>
        </div>

        {/* 現在の選択ラベル & 対象漢字数 */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-indigo-noren text-amber-200 border border-amber-500/40 shadow-sm flex items-center gap-2">
            <span className="font-brush text-sm tracking-wide">{activeLabel}</span>
            <span className="w-1 h-3 bg-amber-400/40 rounded-full" />
            <span className="font-mincho text-xs text-amber-100 font-semibold">
              対象: {candidateCount}字
            </span>
          </div>
        </div>
      </div>

      {/* スライダー本体エリア */}
      <div className="px-4 pt-2 pb-6">
        {/* 段位（初級・中級・上級）の木札表示 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {([1, 2, 3] as DifficultyLevel[]).map((level) => {
            const inRange = level >= minLevel && level <= maxLevel;
            const isBound = level === minLevel || level === maxLevel;
            const info = LEVEL_INFO[level];

            return (
              <button
                key={level}
                type="button"
                onClick={() => {
                  // クリックで該当レベルに素早く調整
                  if (level < minLevel) updateRange(level, maxLevel);
                  else if (level > maxLevel) updateRange(minLevel, level);
                  else updateRange(level, level);
                }}
                className={`text-left p-2.5 rounded-xl border transition-all duration-200 relative group ${
                  inRange
                    ? 'bg-gradient-to-b from-amber-50 to-wood-light/50 border-amber-600/70 shadow-sm'
                    : 'bg-washi-100/60 border-wood-base/30 text-washi-800/60 hover:bg-wood-light/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-brush px-1.5 py-0.5 rounded ${
                      inRange
                        ? 'bg-amber-600 text-white'
                        : 'bg-wood-base/30 text-wood-deep'
                    }`}
                  >
                    {info.numberKanji}
                  </span>
                  {isBound && (
                    <span className="text-[10px] font-mincho text-amber-800 bg-amber-200/60 px-1 rounded">
                      {isOverlapping
                        ? '選択中'
                        : level === minLevel
                        ? '開始'
                        : '終了'}
                    </span>
                  )}
                </div>
                <div
                  className={`font-brush text-base ${
                    inRange ? 'text-wood-deep font-bold' : 'text-washi-800/70'
                  }`}
                >
                  {info.name}
                </div>
                <div className="text-[11px] font-mincho text-washi-800/70 truncate">
                  {info.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* インタラクティブな木目トラック */}
        <div className="relative py-4 select-none">
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="h-4 bg-wood-deep/20 rounded-full cursor-pointer relative shadow-inner border border-wood-base/40"
          >
            {/* 選択範囲のハイライトバー */}
            <div
              className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-full shadow transition-all duration-150 pointer-events-none"
              style={{
                left: `${minPercent}%`,
                width: `${rangeWidth}%`,
              }}
            />

            {/* 3つのステップ目安点 */}
            {[0, 50, 100].map((percent, idx) => {
              const level = (idx + 1) as DifficultyLevel;
              const inRange = level >= minLevel && level <= maxLevel;
              return (
                <div
                  key={percent}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    inRange
                      ? 'bg-amber-100 border-amber-600 ring-2 ring-amber-400/40'
                      : 'bg-washi-100 border-wood-base/60'
                  }`}
                  style={{ left: `${percent}%` }}
                />
              );
            })}
          </div>

          {/* ハンドル表示 */}
          {isOverlapping ? (
            /* 重なり時 (min === max): 1つの木札ハンドルに左右の引き出し翼を装備 */
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-100"
              style={{ left: `${minPercent}%` }}
            >
              <div
                onPointerDown={(e) => startDrag('overlap', e)}
                tabIndex={0}
                role="slider"
                aria-label={`難易度（${LEVEL_INFO[minLevel].name}固定）`}
                aria-valuenow={minLevel}
                aria-valuemin={1}
                aria-valuemax={3}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft' && minLevel > 1) {
                    onChange((minLevel - 1) as DifficultyLevel, maxLevel);
                  } else if (e.key === 'ArrowRight' && maxLevel < 3) {
                    onChange(minLevel, (maxLevel + 1) as DifficultyLevel);
                  }
                }}
                className="cursor-ew-resize group flex items-center justify-between px-2.5 py-1.5 rounded-xl wood-button shadow-lg border-2 border-amber-700 min-w-[110px] touch-none select-none hover:scale-105 active:scale-95 transition-transform"
              >
                <button
                  type="button"
                  title="下限を下げる"
                  disabled={minLevel <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (minLevel > 1) onChange((minLevel - 1) as DifficultyLevel, maxLevel);
                  }}
                  className="text-xs text-amber-900 disabled:opacity-20 hover:text-amber-700 px-1"
                >
                  ◀
                </button>
                <div className="text-center px-1">
                  <div className="font-brush text-xs font-bold text-wood-deep whitespace-nowrap">
                    {LEVEL_INFO[minLevel].name}のみ
                  </div>
                  <div className="text-[9px] font-mincho text-wood-dark leading-none">
                    左右ドラッグで展開
                  </div>
                </div>
                <button
                  type="button"
                  title="上限を上げる"
                  disabled={maxLevel >= 3}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (maxLevel < 3) onChange(minLevel, (maxLevel + 1) as DifficultyLevel);
                  }}
                  className="text-xs text-amber-900 disabled:opacity-20 hover:text-amber-700 px-1"
                >
                  ▶
                </button>
              </div>
            </div>
          ) : (
            /* 離れている場合: それぞれのハンドルを独立表示 */
            <>
              {/* 下限ハンドル (Min Handle) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-100"
                style={{ left: `${minPercent}%` }}
              >
                <div
                  onPointerDown={(e) => startDrag('min', e)}
                  tabIndex={0}
                  role="slider"
                  aria-label="難易度下限"
                  aria-valuenow={minLevel}
                  aria-valuemin={1}
                  aria-valuemax={maxLevel}
                  onKeyDown={(e) => handleKeyDown('min', e)}
                  className="cursor-grab active:cursor-grabbing group flex items-center gap-1 px-2.5 py-1.5 rounded-xl wood-button shadow-md border-2 border-wood-base hover:border-amber-600 touch-none select-none hover:scale-105 transition-transform"
                >
                  <span className="text-[10px] text-amber-800">◀</span>
                  <div className="text-center">
                    <span className="font-brush text-xs font-bold text-wood-deep whitespace-nowrap block">
                      {LEVEL_INFO[minLevel].name}
                    </span>
                    <span className="text-[9px] font-mincho text-wood-dark leading-none block">
                      開始
                    </span>
                  </div>
                </div>
              </div>

              {/* 上限ハンドル (Max Handle) */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 transition-all duration-100"
                style={{ left: `${maxPercent}%` }}
              >
                <div
                  onPointerDown={(e) => startDrag('max', e)}
                  tabIndex={0}
                  role="slider"
                  aria-label="難易度上限"
                  aria-valuenow={maxLevel}
                  aria-valuemin={minLevel}
                  aria-valuemax={3}
                  onKeyDown={(e) => handleKeyDown('max', e)}
                  className="cursor-grab active:cursor-grabbing group flex items-center gap-1 px-2.5 py-1.5 rounded-xl wood-button shadow-md border-2 border-wood-base hover:border-amber-600 touch-none select-none hover:scale-105 transition-transform"
                >
                  <div className="text-center">
                    <span className="font-brush text-xs font-bold text-wood-deep whitespace-nowrap block">
                      {LEVEL_INFO[maxLevel].name}
                    </span>
                    <span className="text-[9px] font-mincho text-wood-dark leading-none block">
                      終了
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-800">▶</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* クイックプリセットボタン群 */}
      <div className="mt-2 pt-3 border-t border-wood-base/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mincho text-washi-800/80">一発選択（おまかせ）:</span>
          {isOverlapping && (
            <span className="text-[11px] font-mincho text-amber-800">
              ※ 単一難易度のみ集中出題中
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESETS.map((preset) => {
            const isActive = minLevel === preset.min && maxLevel === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.min, preset.max)}
                className={`py-2 px-3 rounded-xl text-center border font-brush text-sm transition-all duration-200 relative ${
                  isActive
                    ? 'bg-amber-700 text-amber-50 border-amber-800 shadow-md ring-2 ring-amber-500/40 font-bold scale-[1.02]'
                    : 'bg-washi-100 hover:bg-wood-light/40 text-wood-deep border-wood-base/40 hover:border-wood-base'
                }`}
              >
                <div>{preset.label}</div>
                <div
                  className={`text-[10px] font-mincho ${
                    isActive ? 'text-amber-200' : 'text-washi-800/70'
                  }`}
                >
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
