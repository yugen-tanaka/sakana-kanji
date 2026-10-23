/**
 * 難易度レベル
 * 1: 初級 (一般的な食用魚・基礎漢字)
 * 2: 中級 (寿司通・季節の魚・やや珍しい魚)
 * 3: 上級 (難読漢字・古字・魚類マニアック)
 */
export type DifficultyLevel = 1 | 2 | 3;

/**
 * 魚偏漢字データ構造
 * ※英語項目（english）は含めない仕様
 */
export interface KanjiItem {
  id: string;
  kanji: string;
  reading: string; // ひらがな読み (例: "たい")
  furigana: string; // カタカナ表記 (例: "タイ")
  romaji: string; // ローマ字表記 (例: "tai")
  level: DifficultyLevel; // 難易度 (1: 初級, 2: 中級, 3: 上級)
  trivia: string; // 由来・生態・寿司ネタ豆知識
  category?: string; // 魚種・分類 (例: "白身", "赤身", "青魚", "川魚", "貝・軟体", "その他")
}

/**
 * クイズ出題モード
 * - KANJI_TO_READING: 漢字を見て読みを当てる (例: 「鮪」→「まぐろ」)
 * - READING_TO_KANJI: 読みを見て漢字を当てる (例: 「まぐろ」→「鮪」)
 */
export type QuizMode = 'KANJI_TO_READING' | 'READING_TO_KANJI';

/**
 * 単一のクイズ問題データ
 */
export interface QuizQuestion {
  target: KanjiItem;
  prompt: string; // 出題テキスト (漢字または読み)
  choices: string[]; // 3択の選択肢
  correctIndex: number; // 正解のインデックス (0〜2)
  mode: QuizMode;
}

/**
 * ユーザーの回答記録
 */
export interface UserAnswer {
  question: QuizQuestion;
  selectedAnswer: string;
  isCorrect: boolean;
}

/**
 * クイズ設定
 */
export interface QuizSettings {
  minLevel: DifficultyLevel;
  maxLevel: DifficultyLevel;
  mode: QuizMode;
  questionCount: number;
}

/**
 * クイズ結果サマリー
 */
export interface QuizSummary {
  totalQuestions: number;
  correctCount: number;
  answers: UserAnswer[];
  durationMs: number;
  rankTitle: string; // 成績に応じた称号 (例: "魚偏免許皆伝・名代総板前")
}
