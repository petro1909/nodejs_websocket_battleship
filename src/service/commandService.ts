import { GameController } from '../controller/gameController';
import { RegistrationController } from '../controller/registrationController';
import { RoomController } from '../controller/roomController';
import { reqCommandTypes } from '../types/entities/commandTypes';
import { Client } from '../types/entities/users';

export class CommandService {
  private commandHanlders: Map<string, (clinet: Client, data: string) => void>;
  private registrationController: RegistrationController;
  private roomController: RoomController;
  private gameController: GameController;
  constructor() {
    this.commandHanlders = new Map<string, (clinet: Client, data: string) => void>();
    this.registrationController = new RegistrationController();
    this.roomController = new RoomController();
    this.gameController = new GameController();
    this.fillHandlers();
  }
  private fillHandlers() {
    this.commandHanlders.set(reqCommandTypes.REGISTRATION, this.registrationController.userRegistration.bind(this.registrationController));
    this.commandHanlders.set(reqCommandTypes.CREATE_ROOM, this.roomController.createRoom.bind(this.roomController));
    this.commandHanlders.set(reqCommandTypes.ADD_PLAYER_TO_ROOM, this.roomController.addPlayerToRoom.bind(this.roomController));
    this.commandHanlders.set(reqCommandTypes.SINGLE_PLAY, this.gameController.createGameWithBot.bind(this.gameController));
    this.commandHanlders.set(reqCommandTypes.ADD_SHIPS, this.gameController.addShipsToBoard.bind(this.gameController));
    this.commandHanlders.set(reqCommandTypes.ATTACK, this.gameController.attack.bind(this.gameController));
    this.commandHanlders.set(reqCommandTypes.RANDOM_ATTACK, this.gameController.randomAttack.bind(this.gameController));
    this.commandHanlders.set(reqCommandTypes.DISCONNECT, this.disconnectHandler.bind(this));
  }

  private disconnectHandler(client: Client, data: string) {
    this.roomController.handleUserDisconnect(client);
    this.gameController.handleUserDisconnect(client);
  }

  getCommandHandlers() {
    return this.commandHanlders;
  }
}
