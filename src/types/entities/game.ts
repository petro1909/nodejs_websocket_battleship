import { Ship } from './ship';

export type Game = {
  gameId: string;
  player1: Player;
  player2: Player;
  currentPlayerIndex: string;
};
export type Player = {
  playerIndex: string;
  frame?: PlayerFrame;
};

export type PlayerFrame = {
  ships: Array<Ship>;
  cellsFrame: FrameCell[][];
  shipsFrame: Array<FrameShip>;
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
