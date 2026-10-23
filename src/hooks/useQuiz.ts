import { useState, useCallback, useRef } from 'react';
import type {
  QuizSettings,
  QuizQuestion,
  UserAnswer,
  QuizSummary,
} from '../types/kanji';
import { KANJI_LIST } from '../data/kanjiList';
import { generateQuizQuestions, createQuizSummary } from '../utils/quizGenerator';

const DEFAULT_SETTINGS: QuizSettings = {
  minLevel: 1,
  maxLevel: 3,
  mode: 'KANJI_TO_READING',
  questionCount: 10,
};

export interface UseQuizReturn {
  settings: QuizSettings;
  questions: QuizQuestion[];
  currentIndex: number;
  currentQuestion: QuizQuestion | null;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  streak: number;
  userAnswers: UserAnswer[];
  isCompleted: boolean;
  quizSummary: QuizSummary | null;
  startQuiz: (settings: QuizSettings) => void;
  submitAnswer: (choice: string) => void;
  goToNext: () => void;
  resetQuiz: () => void;
}

export function useQuiz(): UseQuizReturn {
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);

  const startTimeRef = useRef<number>(0);
  const userAnswersRef = useRef<UserAnswer[]>([]);

  const currentQuestion = questions[currentIndex] ?? null;

  /**
   * クイズ開始
   */
  const startQuiz = useCallback((newSettings: QuizSettings) => {
    setSettings(newSettings);
    const generated = generateQuizQuestions(KANJI_LIST, newSettings);
    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setScore(0);
    setStreak(0);
    setUserAnswers([]);
    userAnswersRef.current = [];
    setIsCompleted(false);
    setQuizSummary(null);
    startTimeRef.current = Date.now();
  }, []);

  /**
   * 回答送信
   */
  const submitAnswer = useCallback(
    (choice: string) => {
      if (isAnswered || !currentQuestion) return;

      const correctChoice =
        currentQuestion.choices[currentQuestion.correctIndex];
      const correct = choice === correctChoice;

      setSelectedAnswer(choice);
      setIsAnswered(true);
      setIsCorrect(correct);

      if (correct) {
        setScore((prev) => prev + 1);
        setStreak((prev) => prev + 1);
      } else {
        setStreak(0);
      }

      const answerRecord: UserAnswer = {
        question: currentQuestion,
        selectedAnswer: choice,
        isCorrect: correct,
      };

      const updatedAnswers = [...userAnswersRef.current, answerRecord];
      userAnswersRef.current = updatedAnswers;
      setUserAnswers(updatedAnswers);
    },
    [isAnswered, currentQuestion]
  );

  /**
   * 次の問題へ進む（全問終了時は結果サマリーを生成）
   */
  const goToNext = useCallback(() => {
    if (!isAnswered) return;

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      // 全問終了
      const durationMs = Date.now() - (startTimeRef.current || Date.now());
      const summary = createQuizSummary(userAnswersRef.current, durationMs);
      setQuizSummary(summary);
      setIsCompleted(true);
    }
  }, [isAnswered, currentIndex, questions.length]);

  /**
   * クイズをリセットして初期状態へ
   */
  const resetQuiz = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setScore(0);
    setStreak(0);
    setUserAnswers([]);
    userAnswersRef.current = [];
    setIsCompleted(false);
    setQuizSummary(null);
  }, []);

  return {
    settings,
    questions,
    currentIndex,
    currentQuestion,
    selectedAnswer,
    isAnswered,
    isCorrect,
    score,
    streak,
    userAnswers,
    isCompleted,
    quizSummary,
    startQuiz,
    submitAnswer,
    goToNext,
    resetQuiz,
  };
}
