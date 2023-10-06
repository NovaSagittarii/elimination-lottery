export type Question = {
  title: string;
  options: string[];
};

export type QuestionSet = {
  category: string;
  questions: Question[];
};

export type QuestionResult = {
  candidateVotes: number[];
  tiebreakerVotes: number[];
};
