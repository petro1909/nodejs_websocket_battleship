import { WebSocket } from 'ws';

export type Client = {
  user?: User;
  wsClient: WebSocket;
};
export type User = {
  name: string;
  password: string;
  index: string;
  wins: number;
};

export type Winner = Omit<User, 'password' | 'index'>;
