import { Ship } from './ship';
import { Client } from './users';

export type Game = {
  gameId: string;
  player1: Player;
  player2: Player;
  currentPlayerIndex: string;
};
export type Player = {
  client: Client;
  playerIndex: string;
  frame?: PlayerFrame;
};

export type PlayerFrame = {
  ships: Array<Ship>;
  cellsFrame: Map<number, Map<number, FrameCell>>;
  shipsFrame: Array<FrameShip>;
  liveCells: number;
};

export type FrameShip = {
  liveCellsCount: number;
  cellsAroundShip: Array<Coordinate>;
};

export type FrameCell = {
  //coordinate: Coordinate;
  shipIndex: number;
  occupated: boolean;
  hitted: boolean;
  status: 'miss' | 'killed' | 'shot' | undefined;
};

export type Coordinate = {
  x: number;
  y: number;
};
