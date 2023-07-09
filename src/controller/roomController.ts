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
    this.roomService.createRoom(client);

    const roomResponseData = this.roomService.getRoomsData();
    const roomResponseMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomResponseData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomResponseMessage));
  }

  public addPlayerToRoom(addedClient: Client, data: string) {
    const room = this.roomService.addPlayerToRoom(addedClient, data);
    if (!room) {
      return;
    }
    const createGameResponse = this.gameService.createGame(room);
    //send create game Response to creater of room
    const createrPlayerResponseData = createGameResponse[0];
    const createrPlayerResponse = createResponseMessage(resCommandTypes.CREATE_GAME, createrPlayerResponseData);
    const createrPlayerClient = room.roomClients[0] as Client;
    createrPlayerClient.wsClient.send(createrPlayerResponse);
    //send create game Response to client that added to room
    const addedPlayerResponseData = createGameResponse[1];
    const addedPlayerResponse = createResponseMessage(resCommandTypes.CREATE_GAME, addedPlayerResponseData);
    addedClient.wsClient.send(addedPlayerResponse);

    const roomResponseData = this.roomService.getRoomsData();
    const roomResponseMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomResponseData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomResponseMessage));
  }

  public handleUserDisconnect(client: Client) {
    const rooms = this.roomService.getRooms();
    this.roomService.setRooms(rooms.filter((room) => room.roomClients[0] !== client));

    const roomResponseData = this.roomService.getRoomsData();
    const roomResponseMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomResponseData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomResponseMessage));
  }
}
