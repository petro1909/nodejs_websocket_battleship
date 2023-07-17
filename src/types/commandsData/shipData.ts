import { Ship } from '../entities/ship';

export type AddShips = {
  gameId: string;
  ships: Array<Ship>;
  indexPlayer: string;
};
