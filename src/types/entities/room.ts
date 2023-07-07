import { User } from './users';
export type Room = {
  roomId: string;
  roomUsers: Array<RoomUser>;
};

export type RoomUser = Pick<User, 'index' | 'name'>;
