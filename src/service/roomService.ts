import { Client, User } from '../types/entities/users';
import { Room, RoomData } from '../types/entities/room';
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

  public setRooms(newRooms: Array<Room>) {
    this.rooms = newRooms;
  }

  public getRoomsData(): Array<RoomData> {
    return this.rooms.map((room) => {
      const roomUsers: Array<RoomUser> = [];
      if (room.roomClients[0]) {
        const roomUser1: RoomUser = { name: room.roomClients[0].user!.name, index: room.roomClients[0].user!.index };
        roomUsers.push(roomUser1);
      }
      if (room.roomClients[1]) {
        const roomUser2: RoomUser = { name: room.roomClients[1].user!.name, index: room.roomClients[1].user!.index };
        roomUsers.push(roomUser2);
      }
      const roomData: RoomData = { roomId: room.roomId, roomUsers: roomUsers };
      return roomData;
    });
  }

  public createRoom(creator: Client): void {
    const roomId = uuidv4();

    const roomClients: Array<Client> = [];
    roomClients.push(creator);

    const room: Room = { roomId: roomId, roomClients: roomClients };
    this.rooms.push(room);
  }

  public addPlayerToRoom(addedPlayerClient: Client, data: string): Room | undefined {
    const roomId = JSON.parse(data).indexRoom;
    const findedRoom = this.rooms.find((room) => room.roomId == roomId) as Room;
    if (findedRoom.roomClients[0]?.user?.index !== addedPlayerClient.user?.index) {
      findedRoom.roomClients.push(addedPlayerClient);
      const roomIndex = this.rooms.indexOf(findedRoom);
      this.rooms.splice(roomIndex, 1);
      return findedRoom;
    }
  }
}
