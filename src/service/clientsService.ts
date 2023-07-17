import { Message } from '../types/entities/message';
import { Client } from '../types/entities/users';
import { parseRequestMessageString } from '../util/messageParser';
import { RawData, WebSocket } from 'ws';
import { CommandService } from './commandService';
import { reqCommandTypes } from '../types/entities/commandTypes';

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

  public addClient(client: Client) {
    this.clients.push(client);
  }

  public connectWsClient(wsClient: WebSocket) {
    const client: Client = { wsClient: wsClient };
    this.handleClientActions(client);
  }

  private handleClientActions(client: Client) {
    client.wsClient.on('message', (data: RawData) => this.handleClientMessage(client, data));
    client.wsClient.on('close', () => this.handleClientDisconnect(client));
  }

  private handleClientDisconnect(inputClient: Client) {
    console.log('executing disconnect...');
    const disconnectedClient = this.clients.find((client) => client.wsClient == inputClient.wsClient);
    if (disconnectedClient) {
      disconnectedClient.user!.isOnline = false;
      const indexOfClient = this.clients.indexOf(disconnectedClient);
      this.clients.splice(indexOfClient, 1);
      const disconnectCommandHandler = this.commands.get(reqCommandTypes.DISCONNECT);
      if (disconnectCommandHandler) {
        disconnectCommandHandler(disconnectedClient, '');
      }
      console.log('\x1b[41m%s\x1b[0m', `client ${inputClient.user?.name} disconnected`);
    } else {
      console.log('\x1b[41m%s\x1b[0m', `unregistered client disconnected`);
    }
    inputClient.wsClient.terminate();
  }

  private handleClientMessage(client: Client, message: RawData) {
    const parsedMessage: Message = parseRequestMessageString(message.toString());
    console.log(`RECEIVED COMMAND:`);
    console.log(parsedMessage);
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
