import { User } from '../types/entities/users';
import { Room } from '../types/entities/room';
import { RoomUser } from '../types/entities/room';
import { uuidv4 } from '../util/identification';
import { CreateGameData } from '../types/commandsData/gameData';

export class RoomService {
  private rooms: Array<Room> = [];
  private static instance: RoomService;

  public static getInstance(): RoomService {
    if (!this.instance) {
      this.instance = new RoomService();
    }
    return this.instance;
  }

  public getRooms(): Array<Room> {
    return this.rooms;
  }

  public createRoom(creator: User): void {
    const roomId = uuidv4();

    const roomUsers: Array<RoomUser> = [];
    const roomUser: RoomUser = { name: creator.name, index: creator.index };
    roomUsers.push(roomUser);

    const room: Room = { roomId: roomId, roomUsers: roomUsers };
    this.rooms.push(room);
  }

  public addPlayerToRoom(addedPlayer: User, data: string): Room {
    const roomId = JSON.parse(data).indexRoom;
    const findedRoom = this.rooms.find((room) => room.roomId == roomId) as Room;
    const newPlayer: RoomUser = { name: addedPlayer.name, index: addedPlayer.index };
    findedRoom.roomUsers.push(newPlayer);

    const roomIndex = this.rooms.indexOf(findedRoom);
    this.rooms.splice(roomIndex, 1);

    return findedRoom;
  }
}
