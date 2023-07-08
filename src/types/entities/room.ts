import { Client, User } from './users';

export type Room = {
  roomId: string;
  roomClients: Array<Client>;
};

export type RoomData = {
  roomId: string;
  roomUsers: Array<RoomUser>;
};

export type RoomUser = Pick<User, 'index' | 'name'>;
