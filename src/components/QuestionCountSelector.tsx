import React from 'react';

export interface QuestionCountSelectorProps {
  questionCount: number;
  onChange: (count: number) => void;
  totalAvailable?: number;
  className?: string;
}

interface CountOption {
  value: number;
  name: string;
  countLabel: string;
  badge: string;
  description: string;
  icon: string;
}

export const QuestionCountSelector: React.FC<QuestionCountSelectorProps> = ({
  questionCount,
  onChange,
  totalAvailable = 77,
  className = '',
}) => {
  const options: CountOption[] = [
    {
      value: 10,
      name: '十貫盛り',
      countLabel: '10問',
      badge: '並盛り・標準',
      description: '手軽にサクッと挑戦できる定番の10貫コース（所要 約1分）',
      icon: '🍣',
    },
    {
      value: 20,
      name: '特上二十貫',
      countLabel: '20問',
      badge: '特上・満足',
      description: '寿司通ネタも交えてじっくり腕試しする20貫コース（所要 約2分）',
      icon: '🍣🍣',
    },
    {
      value: -1,
      name: '食べ放題',
      countLabel: `全${totalAvailable}問`,
      badge: '極限・全問',
      description: '指定難易度の魚偏漢字をすべて制覇する極みコース',
      icon: '🥢🐟',
    },
  ];

  return (
    <div
      className={`bg-washi-50 border-2 border-wood-base/60 rounded-2xl p-5 shadow-sm relative ${className}`}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-wood-base/30">
        <span className="w-8 h-8 rounded-lg bg-wood-base/20 border border-wood-base/60 flex items-center justify-center text-lg font-brush shadow-xs">
          貫
        </span>
        <div>
          <h3 className="font-brush text-xl text-wood-deep tracking-wide">
            出題数（お品書き）
          </h3>
          <p className="text-xs text-washi-800/80 font-mincho">
            お好みのコース（貫数）をお選びください
          </p>
        </div>
      </div>

      {/* お品書き木札（3択グリッド） */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {options.map((opt) => {
          const isSelected = questionCount === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 relative flex flex-col justify-between group overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-50 to-wood-light/60 border-amber-700 shadow-md ring-2 ring-amber-500/30 scale-[1.01]'
                  : 'bg-washi-100 hover:bg-wood-light/30 text-washi-900 border-wood-base/40 hover:border-wood-base'
              }`}
            >
              {/* 落款印（選択時） */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 hanko-stamp px-1.5 py-0.5 text-xs font-brush tracking-tighter bg-amber-50/90 shadow-sm">
                  注文
                </div>
              )}

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">{opt.icon}</span>
                  <span
                    className={`text-[10px] font-mincho px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-amber-600 text-amber-50 font-semibold'
                        : 'bg-wood-base/20 text-wood-deep'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <h4
                    className={`font-brush text-2xl tracking-wide ${
                      isSelected ? 'text-amber-900 font-bold' : 'text-wood-deep'
                    }`}
                  >
                    {opt.name}
                  </h4>
                  <span
                    className={`text-sm font-mincho font-bold ${
                      isSelected ? 'text-amber-700' : 'text-washi-800/70'
                    }`}
                  >
                    ({opt.countLabel})
                  </span>
                </div>

                <p
                  className={`text-xs font-mincho leading-relaxed mt-2 ${
                    isSelected ? 'text-wood-deep' : 'text-washi-800/80'
                  }`}
                >
                  {opt.description}
                </p>
              </div>

              {/* 選択インジケーター */}
              <div className="mt-4 pt-2 border-t border-wood-base/20 flex items-center justify-between">
                <span className="text-[11px] font-mincho text-wood-dark">
                  {opt.value === -1 ? '全問完全制覇' : `${opt.countLabel}チャレンジ`}
                </span>
                <span
                  className={`text-xs font-brush px-2 py-0.5 rounded ${
                    isSelected
                      ? 'bg-amber-700 text-amber-50'
                      : 'bg-wood-base/20 text-wood-dark group-hover:bg-wood-base/30'
                  }`}
                >
                  {isSelected ? '選択中' : '選択する'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
