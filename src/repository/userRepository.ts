import { User } from '../types/models/user';

export class UserRepository {
  private users: Array<User> = [];
  private static instanse: UserRepository;

  public static getInstance(): UserRepository {
    if (!this.instanse) {
      this.instanse = new UserRepository();
    }
    return this.instanse;
  }

  public createUser(inputName: string, inputPassword: string): User {
    const existingUser = this.users.find((user) => user.name == inputName);
    if (existingUser) {
      throw new Error('user with such name already exist');
    }
    const userIndex = this.users.length;
    const newUser: User = { name: inputName, password: inputPassword, index: userIndex, wins: 0 };
    this.users.push(newUser);
    return newUser;
  }

  public getUsers() {
    return this.users;
  }
}
