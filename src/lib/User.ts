export type UserProps = {
  name?: string;
};

export class User {
  private name: string;
  private choice: number = -1;
  constructor({ name = '' }: UserProps = {}) {
    this.name = name;
  }
  public setName(name: string) {
    this.name = name;
  }
  public getName() {
    return this.name;
  }
  public setChoice(choice: number) {
    this.choice = choice;
  }
  public getChoice() {
    return this.choice;
  }
}

export default User;
