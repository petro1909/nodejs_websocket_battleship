import { Room } from '../entities/room';

export type AddPlayerToRoomData = {
  indexRoom: string;
};

export type UpdateRoom = {
  _: Array<Room>;
};
