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
    const disconnectedClient = this.clients.find((client) => client.wsClient == inputClient.wsClient);
    if (disconnectedClient) {
      disconnectedClient.user!.isOnline = false;
      const indexOfClient = this.clients.indexOf(disconnectedClient);
      this.clients.splice(indexOfClient, 1);
    }
    console.log(this.clients.length);
    inputClient.wsClient.terminate();
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
