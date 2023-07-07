import { GameService } from '../service/gameService';
import { WSClientsService } from '../service/clientsService';
import { RoomService } from '../service/roomService';
import { resCommandTypes } from '../types/entities/commandTypes';
import { Client } from '../types/entities/users';
import { createResponseMessage } from '../util/messageParser';

export class RoomController {
  private roomService: RoomService;
  private gameService: GameService;
  private wsClientsService: WSClientsService;

  constructor() {
    this.roomService = RoomService.getInstance();
    this.gameService = GameService.getInstance();
    this.wsClientsService = WSClientsService.getInstance();
  }

  public createRoom(client: Client, data: string) {
    this.roomService.createRoom(client.user!);

    const roomAnswerData = this.roomService.getRooms();
    const roomAnswerMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomAnswerData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomAnswerMessage));
  }

  public addPlayerToRoom(client: Client, data: string) {
    const room = this.roomService.addPlayerToRoom(client.user!, data);
    const createGameAnswer = this.gameService.createGame(room);

    const createrPlayerAnswerData = createGameAnswer[0];
    const addedPlayerAnswerData = createGameAnswer[1];

    const createrPlayerClient = this.wsClientsService.getClients().find((client) => client.user?.index === createrPlayerAnswerData?.idPlayer);
    if (createrPlayerClient) {
      const createrPlayerAnswer = createResponseMessage(resCommandTypes.CREATE_GAME, createrPlayerAnswerData);
      createrPlayerClient.wsClient.send(createrPlayerAnswer);
    }
    const addedPlayerAnswer = createResponseMessage(resCommandTypes.CREATE_GAME, addedPlayerAnswerData);
    client.wsClient.send(addedPlayerAnswer);

    const roomAnswerData = this.roomService.getRooms();
    const roomAnswerMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomAnswerData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomAnswerMessage));
  }
}
