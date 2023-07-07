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

  public createUser(inputName: string, inputPassword: string): User {
    const existingUser = this.users.find((user) => user.name == inputName);
    if (existingUser) {
      throw new Error('user with such name already exist');
    }
    const userIndex = uuidv4();
    const newUser: User = { name: inputName, password: inputPassword, index: userIndex, wins: 0 };
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
}
