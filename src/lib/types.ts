/** @format */

// Question Types
export enum QuestionType {
  MCQ = "MCQ",
  FILL_IN_THE_BLANKS = "FILL_IN_THE_BLANKS",
  TRUE_FALSE = "TRUE_FALSE",
  MATCH_THE_FOLLOWING = "MATCH_THE_FOLLOWING",
  ONE_WORD = "ONE_WORD",
  NUMERICAL = "NUMERICAL",
  SHORT_ANSWER = "SHORT_ANSWER",
  LONG_ANSWER = "LONG_ANSWER",
  UNSEEN_PASSAGE = "UNSEEN_PASSAGE",
  POEM_EXPLANATION = "POEM_EXPLANATION",
  IMAGE_QUESTION = "IMAGE_QUESTION",
}

// Languages
export enum Language {
  ENGLISH = "ENGLISH",
  HINDI = "HINDI",
  SANSKRIT = "SANSKRIT",
}

// Difficulty Levels
export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

// User Roles
export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  EXAM_HEAD = "EXAM_HEAD",
  PRINTER = "PRINTER",
}

// Blueprint Section Definition
export interface BlueprintSection {
  name: string;
  questionType: QuestionType;
  count: number;
  marksPerQuestion: number;
  totalMarks: number;
}

// Question Search Filters
export interface QuestionFilters {
  bookId?: string;
  chapterId?: string;
  topicId?: string;
  type?: QuestionType;
  language?: Language;
  difficulty?: Difficulty;
  marks?: number;
  searchText?: string;
  tags?: string[];
}

// Paper Builder Context
export interface PaperBuilderSection {
  name: string;
  questions: PaperQuestion[];
  maxQuestions?: number;
  marksPerQuestion?: number;
}

export interface PaperQuestion {
  id: string;
  questionId: string;
  text: string;
  type: QuestionType;
  marks: number;
  order: number;
  sectionName: string;
}
