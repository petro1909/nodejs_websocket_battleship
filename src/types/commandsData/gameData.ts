import { Ship } from '../entities/ship';

export type CreateGameData = {
  idGame: string;
  idPlayer: string;
};

export type StartGameData = {
  ships: Array<Ship>;
  currentPlayerIndex: string;
};

export type AttackRequestData = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
};

export type AttackResponseData = {
  position: { x: number; y: number };
  currentPlayer: string;
  status?: 'miss' | 'killed' | 'shot';
};

export type FinishGame = {
  winPlayer: string;
};

export type RandomAttackRequestData = {
  gameId: string;
  indexPlayer: string;
};

export type Turn = {
  currentPlayer: string;
};
