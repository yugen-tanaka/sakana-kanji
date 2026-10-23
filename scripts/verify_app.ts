/**
 * すし処 魚偏亭 - 総合品質保証・検証自動テストスクリプト
 * Run via: node --experimental-strip-types scripts/verify_app.ts
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { KANJI_LIST } from '../src/data/kanjiList.ts';
import {
  filterKanji,
  getDifficultyLabel,
  getRankTitle,
  generateQuizQuestions,
  createQuizSummary,
} from '../src/utils/quizGenerator.ts';
import * as soundModule from '../src/utils/sound.ts';
import type { DifficultyLevel, KanjiItem, QuizMode } from '../src/types/kanji.ts';

interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, suite: string, message?: string) {
  if (condition) {
    results.push({ suite, testName, passed: true });
    console.log(`  [PASS] ${testName}`);
  } else {
    results.push({ suite, testName, passed: false, message });
    console.error(`  [FAIL] ${testName}: ${message ?? 'Assertion failed'}`);
  }
}

console.log('='.repeat(70));
console.log('  🍣 魚偏漢字クイズ 〜すし処 魚偏亭〜 自動品質検証スイート 🍣');
console.log('='.repeat(70));

// -----------------------------------------------------------------------------
// Suite 1: Kanji Dataset Verification (77 items & No English field)
// -----------------------------------------------------------------------------
console.log('\n[Suite 1] 魚偏漢字データセット検証 (77種・スキーマ・英語項目非含有)');

assert(
  KANJI_LIST.length === 77,
  'Kanji list item count is exactly 77',
  'Kanji Dataset',
  `Expected 77 items, found ${KANJI_LIST.length}`
);

const seenIds = new Set<string>();
const seenKanjis = new Set<string>();
let allFieldsValid = true;
let englishFieldFound = false;

for (const item of KANJI_LIST) {
  // Check unique ID
  if (seenIds.has(item.id)) {
    allFieldsValid = false;
    assert(false, `Unique ID check for ${item.id}`, 'Kanji Dataset', `Duplicate ID found: ${item.id}`);
  }
  seenIds.add(item.id);

  // Check unique Kanji
  if (seenKanjis.has(item.kanji)) {
    allFieldsValid = false;
    assert(false, `Unique Kanji check for ${item.kanji}`, 'Kanji Dataset', `Duplicate Kanji found: ${item.kanji}`);
  }
  seenKanjis.add(item.kanji);

  // Check fields
  if (!item.id || typeof item.id !== 'string') allFieldsValid = false;
  if (!item.kanji || typeof item.kanji !== 'string') allFieldsValid = false;
  if (!item.reading || typeof item.reading !== 'string') allFieldsValid = false;
  if (!item.furigana || typeof item.furigana !== 'string') allFieldsValid = false;
  if (!item.romaji || typeof item.romaji !== 'string') allFieldsValid = false;
  if (!item.trivia || typeof item.trivia !== 'string' || item.trivia.length < 5) allFieldsValid = false;
  if (![1, 2, 3].includes(item.level)) allFieldsValid = false;

  // Check no english property
  const keys = Object.keys(item);
  for (const key of keys) {
    if (key.toLowerCase().includes('english') || key === 'en') {
      englishFieldFound = true;
    }
  }
}

assert(
  allFieldsValid,
  'All 77 items have valid non-empty kanji, reading, furigana, romaji, trivia, and level (1-3)',
  'Kanji Dataset'
);

assert(
  !englishFieldFound,
  'No "english" property exists on any KanjiItem object in runtime memory',
  'Kanji Dataset',
  'Found forbidden english property on KanjiItem'
);

// Static source code check for 'english:' property definitions
const kanjiListSrc = readFileSync(resolve('src/data/kanjiList.ts'), 'utf-8');
const kanjiTypesSrc = readFileSync(resolve('src/types/kanji.ts'), 'utf-8');

// Match property declarations like "english:" or "english?:", but allow comments like "※英語項目"
const englishPropertyPattern = /^\s*['"]?english['"]?\s*:\s*.+$/m;
const foundInList = englishPropertyPattern.test(kanjiListSrc);
const foundInTypes = englishPropertyPattern.test(kanjiTypesSrc);

assert(
  !foundInList && !foundInTypes,
  'Static source code analysis confirms NO "english" property definition in kanjiList.ts or kanji.ts',
  'Kanji Dataset',
  `Found english property in source: list=${foundInList}, types=${foundInTypes}`
);

// -----------------------------------------------------------------------------
// Suite 2: Dual Slider & Level Filtering Constraints
// -----------------------------------------------------------------------------
console.log('\n[Suite 2] 難易度デュアルスライダー＆候補絞り込み検証');

const level1Items = filterKanji(KANJI_LIST, 1, 1);
const level2Items = filterKanji(KANJI_LIST, 2, 2);
const level3Items = filterKanji(KANJI_LIST, 3, 3);
const level12Items = filterKanji(KANJI_LIST, 1, 2);
const level23Items = filterKanji(KANJI_LIST, 2, 3);
const level13Items = filterKanji(KANJI_LIST, 1, 3);

console.log(`    Level 1 (初級) count: ${level1Items.length}`);
console.log(`    Level 2 (中級) count: ${level2Items.length}`);
console.log(`    Level 3 (上級) count: ${level3Items.length}`);
console.log(`    Level 1-2 count:      ${level12Items.length}`);
console.log(`    Level 2-3 count:      ${level23Items.length}`);
console.log(`    Level 1-3 count:      ${level13Items.length}`);

assert(
  level1Items.length === 25,
  'Range [1, 1] contains exactly 25 level 1 kanji',
  'Dual Slider',
  `Expected 25, got ${level1Items.length}`
);

assert(
  level2Items.length === 25,
  'Range [2, 2] contains exactly 25 level 2 kanji',
  'Dual Slider',
  `Expected 25, got ${level2Items.length}`
);

assert(
  level3Items.length === 27,
  'Range [3, 3] contains exactly 27 level 3 kanji',
  'Dual Slider',
  `Expected 27, got ${level3Items.length}`
);

assert(
  level12Items.length === 50,
  'Range [1, 2] contains exactly 50 kanji (25 + 25)',
  'Dual Slider',
  `Expected 50, got ${level12Items.length}`
);

assert(
  level23Items.length === 52,
  'Range [2, 3] contains exactly 52 kanji (25 + 27)',
  'Dual Slider',
  `Expected 52, got ${level23Items.length}`
);

assert(
  level13Items.length === 77,
  'Range [1, 3] contains all 77 kanji (25 + 25 + 27)',
  'Dual Slider',
  `Expected 77, got ${level13Items.length}`
);

// Inverted input normalization test (e.g., filterKanji(KANJI_LIST, 3, 1))
const invertedRange = filterKanji(KANJI_LIST, 3, 1);
assert(
  invertedRange.length === 77,
  'Inverted min/max inputs [3, 1] automatically normalize to [1, 3] yielding 77 kanji',
  'Dual Slider'
);

// Difficulty labels check
assert(getDifficultyLabel(1, 1) === '初級のみ', 'Label [1, 1] is "初級のみ"', 'Dual Slider');
assert(getDifficultyLabel(2, 2) === '中級のみ', 'Label [2, 2] is "中級のみ"', 'Dual Slider');
assert(getDifficultyLabel(3, 3) === '上級のみ', 'Label [3, 3] is "上級のみ"', 'Dual Slider');
assert(getDifficultyLabel(1, 2) === '初級〜中級', 'Label [1, 2] is "初級〜中級"', 'Dual Slider');
assert(getDifficultyLabel(2, 3) === '中級〜上級', 'Label [2, 3] is "中級〜上級"', 'Dual Slider');
assert(getDifficultyLabel(1, 3) === '全難易度（初級〜上級）', 'Label [1, 3] is "全難易度（初級〜上級）"', 'Dual Slider');

// -----------------------------------------------------------------------------
// Suite 3: 100+ Random Quiz Generation & Constraint Verification
// -----------------------------------------------------------------------------
console.log('\n[Suite 3] ランダムクイズ生成ストレステスト (計200回・厳密選択肢検証)');

const testModes: QuizMode[] = ['KANJI_TO_READING', 'READING_TO_KANJI'];
const testRanges: [DifficultyLevel, DifficultyLevel][] = [
  [1, 1],
  [2, 2],
  [3, 3],
  [1, 2],
  [2, 3],
  [1, 3],
];

let totalQuestionsTested = 0;
let choicesCountViolations = 0;
let duplicateChoicesViolations = 0;
let correctIndexViolations = 0;
let distractorViolations = 0;

for (const mode of testModes) {
  for (let run = 1; run <= 100; run++) {
    const range = testRanges[run % testRanges.length];
    const questionCount = 5 + (run % 20); // 5 to 24 questions

    const questions = generateQuizQuestions(KANJI_LIST, {
      minLevel: range[0],
      maxLevel: range[1],
      mode,
      questionCount,
    });

    const expectedCount = Math.min(questionCount, filterKanji(KANJI_LIST, range[0], range[1]).length);
    if (questions.length !== expectedCount) {
      assert(false, `Question count check run #${run}`, 'Quiz Generation', `Expected ${expectedCount}, got ${questions.length}`);
    }

    for (const q of questions) {
      totalQuestionsTested++;

      // 1. Exactly 3 choices
      if (q.choices.length !== 3) {
        choicesCountViolations++;
      }

      // 2. Choices have NO duplicates
      const uniqueChoices = new Set(q.choices);
      if (uniqueChoices.size !== 3) {
        duplicateChoicesViolations++;
      }

      // 3. choices[correctIndex] matches target
      const expectedCorrect = mode === 'KANJI_TO_READING' ? q.target.reading : q.target.kanji;
      const expectedPrompt = mode === 'KANJI_TO_READING' ? q.target.kanji : q.target.reading;

      if (q.prompt !== expectedPrompt) {
        correctIndexViolations++;
      }

      if (q.choices[q.correctIndex] !== expectedCorrect) {
        correctIndexViolations++;
      }

      // 4. Distractors must not equal correct answer, and must exist in kanji list
      const distractors = q.choices.filter((_, idx) => idx !== q.correctIndex);
      for (const distractor of distractors) {
        if (distractor === expectedCorrect) {
          distractorViolations++;
        }
        const existsInPool = KANJI_LIST.some((k) =>
          mode === 'KANJI_TO_READING' ? k.reading === distractor : k.kanji === distractor
        );
        if (!existsInPool) {
          distractorViolations++;
        }
      }
    }
  }
}

console.log(`    Total quiz questions generated and rigorously verified: ${totalQuestionsTested}`);

assert(
  choicesCountViolations === 0,
  `All ${totalQuestionsTested} questions have exactly 3 choices`,
  'Quiz Generation',
  `Found ${choicesCountViolations} violations`
);

assert(
  duplicateChoicesViolations === 0,
  `All ${totalQuestionsTested} questions have zero duplicate choices`,
  'Quiz Generation',
  `Found ${duplicateChoicesViolations} violations`
);

assert(
  correctIndexViolations === 0,
  `All ${totalQuestionsTested} questions have choices[correctIndex] matching the prompt target`,
  'Quiz Generation',
  `Found ${correctIndexViolations} violations`
);

assert(
  distractorViolations === 0,
  `All distractors across ${totalQuestionsTested} questions are valid distinct choices from the pool`,
  'Quiz Generation',
  `Found ${distractorViolations} violations`
);

// -----------------------------------------------------------------------------
// Suite 4: Web Audio Synthesizer Export Integrity & Headless Safety
// -----------------------------------------------------------------------------
console.log('\n[Suite 4] 和風Web Audioシンセサイザー エクスポート完全性＆安全性検証');

const requiredSoundExports = [
  'isMuted',
  'setMuted',
  'toggleMute',
  'subscribeMute',
  'playWoodClack',
  'playTaikoDrum',
  'playWoodGong',
  'playCelebrationChime',
] as const;

let allExportsPresent = true;
for (const fnName of requiredSoundExports) {
  if (typeof (soundModule as Record<string, unknown>)[fnName] !== 'function') {
    allExportsPresent = false;
    assert(false, `Sound export function ${fnName}`, 'Web Audio', `Missing or not a function: ${fnName}`);
  }
}

assert(
  allExportsPresent,
  'All 8 audio synth functions (clack, taiko, gong, chime, mute controls) are properly exported',
  'Web Audio'
);

// Test mute state logic & listener subscription
let listenerNotified = false;
let observedMuted = false;
const unsubscribe = soundModule.subscribeMute((muted) => {
  listenerNotified = true;
  observedMuted = muted;
});

soundModule.setMuted(true);
assert(
  soundModule.isMuted() === true && listenerNotified && observedMuted === true,
  'setMuted(true) updates isMuted() and notifies subscription listeners',
  'Web Audio'
);

listenerNotified = false;
soundModule.toggleMute();
assert(
  soundModule.isMuted() === false && listenerNotified && observedMuted === false,
  'toggleMute() toggles mute to false and triggers listeners',
  'Web Audio'
);

unsubscribe();

// Test calling audio methods in headless SSR environment without exception
let audioCallsThrew = false;
try {
  soundModule.playWoodClack();
  soundModule.playTaikoDrum();
  soundModule.playWoodGong();
  soundModule.playCelebrationChime();
} catch (err) {
  audioCallsThrew = true;
  console.error(err);
}

assert(
  !audioCallsThrew,
  'Calling playWoodClack, playTaikoDrum, playWoodGong, playCelebrationChime is 100% safe in headless/SSR environments',
  'Web Audio'
);

// -----------------------------------------------------------------------------
// Suite 5: Rank Title & Quiz Summary Integrity
// -----------------------------------------------------------------------------
console.log('\n[Suite 5] 番付称号・結果サマリー整合性検証');

assert(getRankTitle(10, 10) === '魚偏免許皆伝・名代総板前', '100% score gets "魚偏免許皆伝・名代総板前"', 'Rank Title');
assert(getRankTitle(8, 10) === '花形寿司職人・目利き名人', '80% score gets "花形寿司職人・目利き名人"', 'Rank Title');
assert(getRankTitle(6, 10) === '一人前の一流板前', '60% score gets "一人前の一流板前"', 'Rank Title');
assert(getRankTitle(4, 10) === '修業中の見習い板前', '40% score gets "修業中の見習い板前"', 'Rank Title');
assert(getRankTitle(2, 10) === '皿洗い見習い・出直し', '20% score gets "皿洗い見習い・出直し"', 'Rank Title');

// Test createQuizSummary
const mockSummary = createQuizSummary(
  [
    {
      question: generateQuizQuestions(KANJI_LIST, {
        minLevel: 1,
        maxLevel: 1,
        mode: 'KANJI_TO_READING',
        questionCount: 1,
      })[0],
      selectedAnswer: 'たい',
      isCorrect: true,
    },
    {
      question: generateQuizQuestions(KANJI_LIST, {
        minLevel: 1,
        maxLevel: 1,
        mode: 'KANJI_TO_READING',
        questionCount: 1,
      })[0],
      selectedAnswer: 'さば',
      isCorrect: false,
    },
  ],
  12500
);

assert(
  mockSummary.totalQuestions === 2 && mockSummary.correctCount === 1 && mockSummary.durationMs === 12500,
  'createQuizSummary correctly calculates totalQuestions, correctCount, and durationMs',
  'Rank Title'
);

// -----------------------------------------------------------------------------
// Final Report
// -----------------------------------------------------------------------------
console.log('\n' + '='.repeat(70));
const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = total - passed;

console.log(`検証サマリー: 全 ${total} 件のテスト項目中、${passed} 件 成功 / ${failed} 件 失敗`);
if (failed === 0) {
  console.log('🎉 全テスト合格！アプリケーションは本番稼働基準（Production Ready）を満たしています。');
  console.log('='.repeat(70));
  process.exit(0);
} else {
  console.error('❌ 不合格の検証項目があります。');
  console.log('='.repeat(70));
  process.exit(1);
}
