import { Message } from '../types/entities/message';
import { Client } from '../types/entities/users';
import { parseRequestMessageString } from '../util/messageParser';
import { RawData, WebSocket } from 'ws';
import { CommandService } from './commandService';

export class WSClientsService {
  private clients: Array<Client> = [];
  private commands: Map<string, (clinet: Client, data: string) => void>;
  private static instance: WSClientsService;

  public setCommands() {
    this.commands = new CommandService().getCommandHandlers();
  }
  public static getInstance(): WSClientsService {
    if (!WSClientsService.instance) {
      WSClientsService.instance = new WSClientsService();
    }
    return WSClientsService.instance;
  }
  public getClients(): Array<Client> {
    return this.clients;
  }

  public createClient(wsClient: WebSocket) {
    console.log(`connection created ${this.clients.length + 1}`);
    const client: Client = { wsClient: wsClient };
    this.handleClientActions(client);
    this.clients.push(client);
  }

  private handleClientActions(client: Client) {
    client.wsClient.on('message', (data: RawData) => this.handleClientMessage(client, data));
    client.wsClient.on('close', () => this.handleClientDisconnect(client.wsClient));
  }

  private handleClientDisconnect(wsClient: WebSocket) {
    console.log('disconnect');
    const disconnectedClient = this.clients.find((client) => client.wsClient == wsClient);
    if (disconnectedClient) {
      const indexOfClient = this.clients.indexOf(disconnectedClient);
      this.clients.splice(indexOfClient, 1);
    }
  }

  private handleClientMessage(client: Client, message: RawData) {
    const parsedMessage: Message = parseRequestMessageString(message.toString());
    const commandType = parsedMessage.type;
    const commandHandler = this.commands.get(commandType);
    if (!commandHandler) {
      console.log('unknown command');
      return 'unknown command';
    }
    const response = commandHandler(client, parsedMessage.data.toString());
    return response;
  }
}
// const userRepository = new UserRepository();
// export function wsProcessMessage(message: string, user: User): string {
//   const parsedMessage = JSON.parse(message) as Message;
//   const commandType = parsedMessage.type;
//   const commandHandler = commands.get(commandType);
//   if (!commandHandler) {
//     return 'unknown command';
//   }
//   const response = commandHandler(parsedMessage.data, user);
//   return response;
// }

// const commands = new Map();

// console.log(data.toString());
// const input = JSON.parse(data.toString());
// const type = input.type;
// const inputData = JSON.parse(input.data);
// let res = '';
// if (type == 'reg') {
//   res = JSON.stringify({
//     type: 'reg',
//     data: JSON.stringify({
//       name: 'string',
//       index: 0,
//       error: false,
//       errorText: 'user with this name exist',
//     }),

//     id: 0,
//   });
//   userRepository.createUser(inputData.name, inputData.password);
// }
// wsClient.send(res);
// const res2 = JSON.stringify({
//   type: 'update_room',
//   data: JSON.stringify([
//     {
//       roomId: 5,
//       roomUsers: [
//         {
//           name: 'fewf',
//           index: 5,
//         },
//       ],
//     },
//     {
//       roomId: 6,
//       roomUsers: [
//         {
//           name: 'fewf1',
//           index: 4,
//         },
//       ],
//     },
//   ]),
//   id: 0,
// });
// if (type == 'create_room' || type == 'single_play') {
//   res = JSON.stringify({
//     type: 'create_game',
//     data: JSON.stringify({
//       idGame: 2,
//       idPlayer: 2,
//     }),

//     id: 0,
//   });
// }

//wsClient.send(res2);
