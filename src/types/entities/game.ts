import { Ship } from './ship';
import { Client } from './users';

export type Game = {
  gameId: string;
  player1: Player;
  player2: Player | Bot;
  currentTurn: CurrentTurn;
  isGameWithBot: boolean;
  winner?: Player | Bot;
};

export type Player = {
  client: Client;
  playerIndex: string;
  frame?: PlayerFrame;
};
export type Bot = Omit<Player, 'client'>;

export type CurrentTurn = {
  isHitted: boolean;
  isHittedAlreadyHiitedSell: boolean;
  currentPlayerIndex: string;
};

export type PlayerFrame = {
  ships: Array<Ship>;
  cellsFrame: Map<number, Map<number, FrameCell>>;
  shipsFrame: Array<FrameShip>;
  liveCells: number;
};

export type FrameShip = {
  shipXP: number;
  liveShipCells: Array<Coordinate>;
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
