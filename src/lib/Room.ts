import * as LIB from '.';

export type EliminationRecord = {
  username: string;
  time: number;
};

export type RoomProps = {};

export class Room {
  private usedNames: Set<string> = new Set();
  private users = new Map<string, LIB.User>();
  private candidates = new Map<string, LIB.User>();
  private eliminatedCandidates = new Map<string, LIB.User>();
  private eliminationHistory: EliminationRecord[] = [];
  private questionSet: LIB.QuestionSet | null = null;
  private question: LIB.Question | null = null;
  private questionResult: LIB.QuestionResult | null = null;
  private currentRound: number = 0;
  constructor() {
    this.initialize();
  }
  setQuestionSet(questionSet: LIB.QuestionSet) {
    this.questionSet = questionSet;
  }
  initialize() {
    this.currentRound = 0;
    this.candidates.clear();
    this.eliminatedCandidates.clear();
    this.eliminationHistory = [];
  }
  getUser(key: string) {
    return this.users.get(key);
  }
  addUser(key: string) {
    this.users.set(key, new LIB.User());
  }
  removeUser(key: string) {
    this.users.delete(key);
  }
  setUserName(key: string, newName: string) {
    if (!this.getUser(key)) throw 'key not in user map';
    if (this.usedNames.has(newName)) return false;
    this.usedNames.add(newName);
    const user = this.getUser(key)!; // surely it exists
    this.usedNames.delete(user.getName());
    this.usedNames.add(newName);
    user.setName(newName);
  }
  public startGame() {
    this.initialize();
    for (const [key, user] of this.users.entries()) {
      // users must have set a name to be qualified
      if (user.getName()) {
        this.candidates.set(key, user);
      }
    }
    // console.log('users', this.users);
    // console.log('ok', this.candidates);
  }
  public getActiveUserCount() {
    // console.log("huh?");
    // console.log([...this.users.values()]);
    return [...this.users.values()].filter((x) => x.getName()).length;
  }
  startRound() {
    ++this.currentRound;
    if (this.questionSet === null) throw 'no questions';
    this.question =
      this.questionSet.questions[
        Math.floor(this.questionSet.questions.length * Math.random())
      ];
    for (const user of this.candidates.values()) user.setChoice(-1);
  }
  public getQuestion() {
    return this.question;
  }
  setUserChoice(key: string, choice: number) {
    // console.log('set uchoice', key, choice);
    // console.log(this.candidates);
    this.users.get(key)?.setChoice(choice);
    // console.log(this.candidates);
  }
  endRound() {
    if (this.question === null) throw 'cannot end round: round was not started';
    const passed_candidates: typeof this.candidates = new Map();
    const choice_count = new Map<number, number>();
    const tiebreaker = new Map<number, number>();

    for (const [key, user] of this.users.entries()) {
      const choice = user.getChoice();
      if (!choice_count.has(choice)) choice_count.set(choice, 0);
      if (!tiebreaker.has(choice)) tiebreaker.set(choice, 0);
      if (this.candidates.has(key)) {
        // users are still candidates
        choice_count.set(choice, choice_count.get(choice)! + 1);
      } else {
        tiebreaker.set(choice, tiebreaker.get(choice)! + 1);
      }
    }
    this.questionResult = {
      candidateVotes: this.question.options.map(
        (_, i) => choice_count.get(i) || 0,
      ),
      tiebreakerVotes: this.question.options.map(
        (_, i) => tiebreaker.get(i) || 0,
      ),
    };

    let worst_choice = -1;
    let choices = [...choice_count.entries()]
      .filter(([_choice, count]) => count)
      .sort((a, b) => a[1] - b[1]);
    choices = choices.filter((x) => x[1] === choices[0][1]);
    console.log(choices);

    if (choices.length === 1) {
      // only one is the minimum
      worst_choice = choices[0][0];
    } else {
      // use tiebreaker
      let tiebreaker_choices = [...tiebreaker.entries()]
        .filter(([_choice, count]) => count === choices[0][1])
        .sort((a, b) => a[1] - b[1]);
      if (tiebreaker_choices.length === 1) {
        worst_choice = tiebreaker_choices[0][0];
      }
    }

    for (const [key, user] of this.candidates.entries()) {
      // console.log(user.getName(), user.getChoice(), worst_choice);
      if (user.getChoice() !== -1 && user.getChoice() !== worst_choice) {
        passed_candidates.set(key, user);
      } else {
        this.eliminatedCandidates.set(key, user);
        this.eliminationHistory.push({
          username: user.getName(),
          time: this.currentRound,
        });
      }
    }
    // console.log(passed_candidates, this.eliminationHistory);

    this.candidates = passed_candidates;
  }
  public getCandidateNames(): string[] {
    // console.log('looking up names', [...this.candidates.values()]);
    return [...this.candidates.values()].map((x) => x.getName());
  }
  public getEliminationLog() {
    return this.eliminationHistory;
  }
  public getPendingChoiceCount(): number {
    // console.log([...this.users.values()]);
    return [
      ...this.candidates.values(),
      ...this.eliminatedCandidates.values(),
    ].filter((x) => x.getChoice() === -1).length;
  }
  public getCandidateEntries() {
    return this.candidates.entries();
  }
  public getQuestionResult() {
    return this.questionResult;
  }
  public getCurrentRound() {
    return this.currentRound;
  }
  public hasWinner() {
    return this.candidates.size <= 1;
  }
}

export default Room;
