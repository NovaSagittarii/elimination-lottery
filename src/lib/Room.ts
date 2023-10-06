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
  private eliminated_candidates: EliminationRecord[] = [];
  private questionSet: LIB.QuestionSet | null = null;
  private question: LIB.Question | null = null;
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
    this.eliminated_candidates = [];
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
        Math.round(this.questionSet.questions.length * Math.random())
      ];
    for (const user of this.candidates.values()) user.setChoice(-1);
  }
  public getQuestion() {
    return this.question;
  }
  setUserChoice(key: string, choice: number) {
    this.candidates.get(key)?.setChoice(choice);
  }
  endRound() {
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

    let worst_choice = -1;
    let choices = [...choice_count.entries()]
      .filter(([_choice, count]) => count)
      .sort((a, b) => a[1] - b[1]);
    choices = choices.filter((x) => x[1] === choices[0][1]);
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
      if (user.getChoice() !== -1 && user.getChoice() !== worst_choice) {
        passed_candidates.set(key, user);
      } else {
        this.eliminated_candidates.push({
          username: user.getName(),
          time: this.currentRound,
        });
      }
    }

    this.candidates = passed_candidates;
  }
  public getCandidateNames(): string[] {
    // console.log('looking up names', [...this.candidates.values()]);
    return [...this.candidates.values()].map((x) => x.getName());
  }
  public getEliminationLog() {
    return this.eliminated_candidates;
  }
  public getCandidateEntries() {
    return this.candidates.entries();
  }
}

export default Room;
