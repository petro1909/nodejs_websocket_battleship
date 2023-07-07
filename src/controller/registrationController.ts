import { WSClientsService } from '../service/clientsService';
import { UserService } from '../service/userService';
import { RoomService } from '../service/roomService';
import { Client } from '../types/entities/users';
import { resCommandTypes } from '../types/entities/commandTypes';
import { createResponseMessage } from '../util/messageParser';

export class RegistrationController {
  private userService: UserService;
  private roomService: RoomService;
  private wsClientsService: WSClientsService;

  constructor() {
    this.userService = UserService.getInstance();
    this.roomService = RoomService.getInstance();
    this.wsClientsService = WSClientsService.getInstance();
  }

  public userRegistration(client: Client, data: string) {
    const registrationResponseData = this.userService.userRegistration(client, data);
    const registrationAnswerMessage: string = createResponseMessage(resCommandTypes.REGISTRATION, registrationResponseData);
    client.wsClient.send(registrationAnswerMessage);

    const roomAnswerData = this.roomService.getRooms();
    const roomAnswerMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomAnswerData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomAnswerMessage));
  }
}
