import { RoomRepository } from 'repository/roomRepository';
import { createResponseMessage } from 'service/messageService';
import { resCommandTypes } from 'types/commands/resCommandTypes';
import { User } from 'types/models/user';

export class RoomController {
  private roomRepository: RoomRepository;
  constructor() {
    this.roomRepository = RoomRepository.getInstance();
  }
  public createRoom(user: User, data: string): string {
    const createdRoom = this.roomRepository.createRoom(user);

    const roomData = { idGame: createdRoom.roomId, idPlayer: user.index };
    const message = createResponseMessage(resCommandTypes.CREATE_GAME, roomData);
    return message;
  }
  public addPlayer(user: User, data: string) {
    const 
    this.roomRepository.addPlayerToRoom(user, )
  }
  public getUnplayableRooms() {
    const rooms = this.roomRepository.getRooms().filter((room) => room.roomUsers.length == 1);
    const roomsData = { rooms };
    const message = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomsData);
    return message;
  }
}
