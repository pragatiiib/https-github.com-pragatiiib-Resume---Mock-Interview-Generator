
export enum InterviewTone {
  STRICT = 'Strict',
  FRIENDLY = 'Friendly',
  STARTUP = 'Startup',
  MNC = 'MNC'
}

export interface RedFlag {
  issue: string;
  reason: string;
  howToFix: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Question {
  id: string;
  text: string;
  type: 'HR' | 'Technical' | 'FollowUp';
  context?: string;
}

export interface Evaluation {
  score: number;
  feedback: string;
  improvementTips: string[];
  followUpQuestions: string[];
}

export interface InterviewState {
  resumeContent: string;
  tone: InterviewTone;
  redFlags: RedFlag[];
  questions: Question[];
  currentQuestionIndex: number;
  history: {
    question: Question;
    answer: string;
    evaluation?: Evaluation;
  }[];
  isAnalyzing: boolean;
  isEvaluating: boolean;
}
