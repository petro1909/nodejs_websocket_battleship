import { RoomData } from '../entities/room';

export type AddPlayerToRoomData = {
  indexRoom: string;
};

export type UpdateRoom = {
  _: Array<RoomData>;
};
