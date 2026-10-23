import type {
  DifficultyLevel,
  KanjiItem,
  QuizQuestion,
  QuizSettings,
  QuizSummary,
  UserAnswer,
} from '../types/kanji';

/**
 * Fisher-Yatesアルゴリズムによる配列シャッフル
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * 難易度範囲で漢字リストをフィルタリング
 */
export function filterKanji(
  list: KanjiItem[],
  minLevel: DifficultyLevel,
  maxLevel: DifficultyLevel
): KanjiItem[] {
  const min = Math.min(minLevel, maxLevel);
  const max = Math.max(minLevel, maxLevel);
  return list.filter((item) => item.level >= min && item.level <= max);
}

/**
 * 難易度範囲ラベルの生成
 * 例:
 * [1, 1] -> '初級のみ'
 * [2, 2] -> '中級のみ'
 * [3, 3] -> '上級のみ'
 * [1, 2] -> '初級〜中級'
 * [2, 3] -> '中級〜上級'
 * [1, 3] -> '全難易度（初級〜上級）'
 */
export function getDifficultyLabel(
  min: DifficultyLevel,
  max: DifficultyLevel
): string {
  const minL = Math.min(min, max);
  const maxL = Math.max(min, max);

  if (minL === 1 && maxL === 1) return '初級のみ';
  if (minL === 2 && maxL === 2) return '中級のみ';
  if (minL === 3 && maxL === 3) return '上級のみ';
  if (minL === 1 && maxL === 2) return '初級〜中級';
  if (minL === 2 && maxL === 3) return '中級〜上級';
  if (minL === 1 && maxL === 3) return '全難易度（初級〜上級）';

  return `${minL}〜${maxL}`;
}

/**
 * 正解数に応じた職人称号（番付）を判定
 */
export function getRankTitle(correctCount: number, totalQuestions: number): string {
  if (totalQuestions <= 0) return '見習い板前';
  const ratio = correctCount / totalQuestions;

  if (ratio === 1) return '魚偏免許皆伝・名代総板前';
  if (ratio >= 0.8) return '花形寿司職人・目利き名人';
  if (ratio >= 0.6) return '一人前の一流板前';
  if (ratio >= 0.4) return '修業中の見習い板前';
  return '皿洗い見習い・出直し';
}

/**
 * クイズ結果サマリーを作成
 */
export function createQuizSummary(
  answers: UserAnswer[],
  durationMs: number
): QuizSummary {
  const totalQuestions = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const rankTitle = getRankTitle(correctCount, totalQuestions);

  return {
    totalQuestions,
    correctCount,
    answers,
    durationMs,
    rankTitle,
  };
}

/**
 * 設定に基づいて3択クイズ問題を生成
 *
 * @param list 全漢字データリスト
 * @param settings クイズ設定（難易度範囲、出題モード、出題数）
 * @returns 生成されたQuizQuestionの配列
 */
export function generateQuizQuestions(
  list: KanjiItem[],
  settings: QuizSettings
): QuizQuestion[] {
  const { minLevel, maxLevel, mode, questionCount } = settings;
  const isKanjiToReading = mode === 'KANJI_TO_READING';

  // 難易度範囲で絞り込み（該当なしの場合はリスト全体をフォールバック）
  const candidates = filterKanji(list, minLevel, maxLevel);
  const activePool = candidates.length > 0 ? candidates : list;

  // 出題候補をシャッフルし、出題数分を抽出
  const shuffledTargets = shuffleArray(activePool);
  const targetCount = Math.min(questionCount, shuffledTargets.length);
  const selectedTargets = shuffledTargets.slice(0, targetCount);

  return selectedTargets.map((target) => {
    const prompt = isKanjiToReading ? target.kanji : target.reading;
    const correctAnswer = isKanjiToReading ? target.reading : target.kanji;

    // 誤答選択肢（ダミー）の候補プール
    // 1. 同難易度プールから抽出
    // 2. 読み被りや重複を除外
    const candidateDistractors = activePool.filter((item) =>
      isKanjiToReading
        ? item.reading !== target.reading
        : item.kanji !== target.kanji && item.reading !== target.reading
    );

    // 候補が足りない場合は全体リストからフォールバック
    const fallbackDistractors = list.filter((item) =>
      isKanjiToReading
        ? item.reading !== target.reading
        : item.kanji !== target.kanji && item.reading !== target.reading
    );

    const distractorSource =
      candidateDistractors.length >= 2 ? candidateDistractors : fallbackDistractors;

    const shuffledDistractorSource = shuffleArray(distractorSource);

    // 正解と異なる、かつ相互に重複しない2つの誤答を決定
    const chosenDistractorAnswers: string[] = [];
    for (const item of shuffledDistractorSource) {
      const answerVal = isKanjiToReading ? item.reading : item.kanji;
      if (
        answerVal !== correctAnswer &&
        !chosenDistractorAnswers.includes(answerVal)
      ) {
        chosenDistractorAnswers.push(answerVal);
        if (chosenDistractorAnswers.length === 2) break;
      }
    }

    // 正解と誤答2つを混ぜて3択にし、シャッフル
    const choices = shuffleArray([correctAnswer, ...chosenDistractorAnswers]);
    const correctIndex = choices.indexOf(correctAnswer);

    return {
      target,
      prompt,
      choices,
      correctIndex,
      mode,
    };
  });
}
