export type SerializedEliminationEvent = {
  /**
   * which round this is part of
   */
  t: number;

  /**
   * list of eliminated candidates' names
   */
  e: string[];
};
export type EliminationEventProps = {
  time?: number;
};

export class EliminationEvent {
  private time: number;
  private eliminated: string[];

  /**
   * Creates a container for storing the eliminations
   * at the end of a round.
   * @param time which round this takes place
   */
  constructor({ time = 0 }: EliminationEventProps = {}) {
    this.time = time;
    this.eliminated = [];
  }

  public getTime() {
    return this.time;
  }
  public getEliminated() {
    return this.eliminated;
  }

  /**
   * Add a user to the elimination list
   * @param name eliminated candidate's name
   * @returns same object (for chaining)
   */
  public addUser(name: string) {
    this.eliminated.push(name);
    return this;
  }

  /**
   * Serializes the event to be transmitted over network.
   * @returns `SerializedEliminationEvent`
   */
  public exportAsObject(): SerializedEliminationEvent {
    return {
      t: this.time,
      e: this.eliminated,
    };
  }

  /**
   * Deserializes the event and overwrites current information
   * @param data `SerializedEliminationEvent`
   * @returns same object (for chaining)
   */
  public loadObject(data: SerializedEliminationEvent) {
    this.time = data.t;
    this.eliminated = data.e;
    return this;
  }
}
