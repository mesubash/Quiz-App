export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE"
}

export type QuizQuestion = {
  text: string;
  questionType: QuestionType;
  isMultipleCorrect: boolean;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
};

export type QuizData = {
  title: string;
  description: string;
  category: string;
  timeLimitMinutes: number;
  isPublished: boolean;
  questions: QuizQuestion[];
};