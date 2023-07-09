import { Winner } from '../types/entities/users';
import { WSClientsService } from './clientsService';
import { UserService } from './userService';

export class WinnerService {
  public static getWinners(): Array<Winner> {
    const users = UserService.getInstance().getUsers();
    return users
      .map((user) => {
        const winner: Winner = { name: user.name, wins: user.wins };
        return winner;
      })
      .filter((winner) => winner.wins > 0);
  }
}
