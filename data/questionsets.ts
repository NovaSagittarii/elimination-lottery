import { type QuestionSet } from '../src/lib';

export const QUESTIONSETS: QuestionSet[] = [
  {
    category: 'test',
    questions: [
      {
        title: 'a or b?',
        options: ['a', 'b'],
      },
      {
        title: 'a or b or c?',
        options: ['a', 'b', 'c'],
      },
    ],
  },
];

export default QUESTIONSETS;
