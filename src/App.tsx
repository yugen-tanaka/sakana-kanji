import { useState, useEffect, useCallback } from 'react';
import type { QuizSettings, DifficultyLevel, QuizMode } from './types/kanji';
import { useQuiz } from './hooks/useQuiz';
import {
  Header,
  QuizCard,
  FeedbackOverlay,
  ResultRank,
  DifficultySlider,
  QuizModeSelector,
  QuestionCountSelector,
} from './components';
import { playWoodClack, playTaikoDrum, playWoodGong } from './utils/sound';
import { Flame, Utensils } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<'START' | 'PLAYING' | 'RESULT'>('START');

  // クイズ設定ステート
  const [settings, setSettings] = useState<QuizSettings>({
    minLevel: 1,
    maxLevel: 3,
    mode: 'KANJI_TO_READING',
    questionCount: 10,
  });

  // クイズ実行フック
  const {
    currentQuestion,
    currentIndex,
    questions,
    selectedAnswer,
    isAnswered,
    isCorrect,
    streak,
    isCompleted,
    quizSummary,
    startQuiz,
    submitAnswer,
    goToNext,
    resetQuiz,
  } = useQuiz();

  // 全問回答終了時に自動で結果画面へ遷移
  useEffect(() => {
    if (isCompleted && quizSummary && appState === 'PLAYING') {
      setAppState('RESULT');
    }
  }, [isCompleted, quizSummary, appState]);

  // 設定変更ハンドラ
  const handleDifficultyChange = useCallback(
    (minLevel: DifficultyLevel, maxLevel: DifficultyLevel) => {
      playWoodClack();
      setSettings((prev) => ({ ...prev, minLevel, maxLevel }));
    },
    []
  );

  const handleModeChange = useCallback((mode: QuizMode) => {
    playWoodClack();
    setSettings((prev) => ({ ...prev, mode }));
  }, []);

  const handleCountChange = useCallback((questionCount: number) => {
    playWoodClack();
    setSettings((prev) => ({ ...prev, questionCount }));
  }, []);

  // クイズ開始
  const handleStart = () => {
    playWoodClack();
    startQuiz(settings);
    setAppState('PLAYING');
  };

  // 回答送信（正誤に応じた和太鼓 / 木魚効果音を再生）
  const handleSelectAnswer = useCallback(
    (choice: string) => {
      if (isAnswered || !currentQuestion) return;

      const correctChoice =
        currentQuestion.choices[currentQuestion.correctIndex];
      const correct = choice === correctChoice;

      if (correct) {
        playTaikoDrum();
      } else {
        playWoodGong();
      }

      submitAnswer(choice);
    },
    [isAnswered, currentQuestion, submitAnswer]
  );

  // 次の一貫へ進む
  const handleNext = useCallback(() => {
    playWoodClack();
    goToNext();
  }, [goToNext]);

  // お品書き（設定画面）へ戻る
  const handleReturnToStart = useCallback(() => {
    resetQuiz();
    setAppState('START');
  }, [resetQuiz]);

  // 再挑戦（同じ設定でリトライ）
  const handleRetry = useCallback(() => {
    startQuiz(settings);
    setAppState('PLAYING');
  }, [settings, startQuiz]);

  return (
    <div className="min-h-screen washi-pattern text-washi-900 flex flex-col justify-between selection:bg-amber-200">
      {/* 暖簾ヘッダー */}
      <Header
        currentState={appState}
        onReturnToStart={handleReturnToStart}
        className="mb-4 sm:mb-8"
      />

      {/* メインコンテンツエリア */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {/* ＝＝＝＝＝ 1. スタート画面（お品書き・道場設定） ＝＝＝＝＝ */}
        {appState === 'START' && (
          <div className="space-y-8 animate-fade-in">
            {/* 道場の歓迎口上（案内幕） */}
            <div className="text-center space-y-2 py-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wood-base/20 border border-wood-base/40 text-wood-deep text-xs font-brush tracking-widest shadow-xs">
                <span>🍣</span>
                <span>江戸前寿司処・魚偏漢字の腕試し</span>
                <span>🐟</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-brush font-bold text-wood-deep tracking-wider drop-shadow-xs">
                いらっしゃい！本日の仕入れ
              </h2>
              <p className="max-w-xl mx-auto font-mincho text-xs sm:text-sm text-wood-dark leading-relaxed">
                全七十七種の魚偏漢字から出題。難易度・出題方式・貫数を選び、
                暖簾をくぐって板前の握りに挑んでください。
              </p>
            </div>

            {/* お品書き設定カード（木目枠） */}
            <div className="space-y-6">
              {/* 1. 難易度範囲スライダー */}
              <DifficultySlider
                minLevel={settings.minLevel}
                maxLevel={settings.maxLevel}
                onChange={handleDifficultyChange}
              />

              {/* 2. 出題モード選択（漢字→読み / 読み→漢字） */}
              <QuizModeSelector
                mode={settings.mode}
                onChange={handleModeChange}
              />

              {/* 3. 貫数（出題数）選択 */}
              <QuestionCountSelector
                questionCount={settings.questionCount}
                onChange={handleCountChange}
              />
            </div>

            {/* 暖簾をくぐる（開始）大ボタン */}
            <div className="pt-4 pb-8 flex flex-col items-center">
              <button
                type="button"
                onClick={handleStart}
                className="w-full max-w-md py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:via-amber-700 hover:to-amber-800 text-amber-50 font-brush text-2xl tracking-[0.2em] shadow-2xl border-2 border-amber-900 active:scale-98 transition-all flex items-center justify-center gap-3 group"
              >
                <Utensils className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
                <span>暖簾をくぐる（開始）</span>
              </button>
              <div className="mt-3 flex items-center gap-2 text-xs font-mincho text-wood-dark/80">
                <span>※</span>
                <span>回答はクリックまたは数字キー [1] [2] [3] で素早く回答できます</span>
              </div>
            </div>
          </div>
        )}

        {/* ＝＝＝＝＝ 2. プレイ中画面（クイズカード & フィードバック） ＝＝＝＝＝ */}
        {appState === 'PLAYING' && currentQuestion && (
          <div className="space-y-6 animate-fade-in">
            {/* 連勝（ストリーク）バッジ表示 */}
            {streak >= 2 && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 text-white font-brush text-sm shadow-md animate-bounce">
                  <Flame className="w-4 h-4 text-amber-200" />
                  <span>{streak}貫 連続的中！板前も唸る目利き！</span>
                </div>
              </div>
            )}

            {/* 寿司下駄クイズカード */}
            <QuizCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              selectedAnswer={selectedAnswer}
              isAnswered={isAnswered}
              onSelectAnswer={handleSelectAnswer}
              onNext={handleNext}
            />

            {/* 回答後の判子（ハンコ）付きフィードバックオーバーレイ */}
            {isAnswered && isCorrect !== null && (
              <FeedbackOverlay
                isCorrect={isCorrect}
                question={currentQuestion}
                onNext={handleNext}
                streak={streak}
                variant="overlay"
              />
            )}
          </div>
        )}

        {/* ＝＝＝＝＝ 3. 結果画面（お勘定 兼 番付認定証） ＝＝＝＝＝ */}
        {appState === 'RESULT' && quizSummary && (
          <ResultRank
            summary={quizSummary}
            onRetry={handleRetry}
            onBackToMenu={handleReturnToStart}
          />
        )}
      </main>

      {/* 和風フッター */}
      <footer className="w-full mt-12 py-6 border-t border-wood-base/30 text-center text-xs font-mincho text-wood-dark/70">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>すし処 魚偏亭 〜魚偏漢字道場〜（全七十七種 厳選魚偏）</div>
          <div>純和風音響・完全オフライン仕様</div>
        </div>
      </footer>
    </div>
  );
}
