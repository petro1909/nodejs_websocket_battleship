import { regRequestData, regResponseData } from '../types/commandsData/registrationData';
import { User } from '../types/entities/users';
import { Client } from '../types/entities/users';
import { uuidv4 } from '../util/identification';

export class UserService {
  private users: Array<User> = [];
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  public getUsers() {
    return this.users;
  }

  private createUser(inputName: string, inputPassword: string): User {
    const existingUser = this.users.find((user) => user.name == inputName);
    if (existingUser) {
      if (existingUser.isOnline) {
        throw new Error('user with this login is already in system');
      }
      if (existingUser.password === inputPassword) {
        return existingUser;
      } else {
        throw new Error('user password is not correct');
      }
    }
    try {
      this.validateUser(inputName, inputPassword);
    } catch (err) {
      throw new Error((err as Error).message);
    }
    const userIndex = uuidv4();
    const newUser: User = { name: inputName, password: inputPassword, index: userIndex, wins: 0, isOnline: true };
    this.users.push(newUser);
    return newUser;
  }

  public userRegistration(client: Client, data: string): regResponseData {
    const registrationRequestData: regRequestData = JSON.parse(data);
    let registrationResponseData: regResponseData;
    try {
      const newUser = this.createUser(registrationRequestData.name, registrationRequestData.password);
      client.user = newUser;
      registrationResponseData = { name: newUser.name, index: newUser.index, error: false, errorText: '' };
    } catch (err) {
      registrationResponseData = { name: '', index: '', error: true, errorText: (err as Error).message };
    }
    return registrationResponseData;
  }

  private validateUser(inputName: string, inputPassword: string) {
    if (inputName.length < 7) {
      throw new Error('minimum login length 7 characters');
    }
    if (inputPassword.length < 7) {
      throw new Error('minimum password length 7 characters');
    }
  }
}
