import { Winner } from '../types/entities/users';
import { WSClientsService } from './clientsService';

export class WinnerService {
  public static getWinners(): Array<Winner> {
    const clients = WSClientsService.getInstance().getClients();
    return clients
      .filter((client) => client.user)
      .map((client) => {
        const winner: Winner = { name: client.user!.name, wins: client.user!.wins };
        return winner;
      })
      .filter((winner) => winner.wins > 0);
  }
}
