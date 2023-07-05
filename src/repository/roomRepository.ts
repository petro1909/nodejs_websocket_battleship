import { uuidv4 } from 'service/identificationService';
import { User } from 'types/models/user';
import { Room } from 'types/room/room';
import { RoomUser } from 'types/room/roomUser';

export class RoomRepository {
  private rooms: Array<Room> = [];
  private static instanse: RoomRepository;

  public static getInstance(): RoomRepository {
    if (!this.instanse) {
      this.instanse = new RoomRepository();
    }
    return this.instanse;
  }
  public getRooms() {
    return this.rooms;
  }

  public createRoom(creator: User): Room {
    const roomId = uuidv4();
    const roomUsers: Array<RoomUser> = [];
    const roomUser: RoomUser = { name: creator.name, index: creator.index };
    roomUsers.push(roomUser);
    const room: Room = { roomId: roomId, roomUsers: roomUsers };
    this.rooms.push(room);
    return room;
  }

  public addPlayerToRoom(player: User, roomIdex: string): Room | undefined {
    const findedRoom = this.rooms.find((room) => room.roomId == roomIdex);
    if (findedRoom) {
      const newPlayer: RoomUser = { name: player.name, index: player.index };
      findedRoom.roomUsers.push(newPlayer);
    }
    return findedRoom;
  }
}
