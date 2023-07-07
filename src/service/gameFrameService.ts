import { FrameCell, PlayerFrame, FrameShip } from '../types/entities/game';
import { Ship } from '../types/entities/ship';

export class GameFrameService {
  public static getEmpyGameFrame(): FrameCell[][] {
    const frameLength = 10;
    const emptyGameFrame: FrameCell[][] = [];
    for (let i = 0; i < frameLength; i++) {
      const emptyGameFrameLine: FrameCell[] = [];
      for (let j = 0; j < frameLength; j++) {
        emptyGameFrameLine.push({ shipIndex: -1, occupated: false, hitted: false, status: undefined });
      }
      emptyGameFrame.push(emptyGameFrameLine);
    }
    return emptyGameFrame;
  }

  public static fillPlayerFrame(frame: FrameCell[][], ships: Array<Ship>): PlayerFrame {
    const frameShips: Array<FrameShip> = [];
    const shipsCount = ships.length;
    for (let i = 0; i < shipsCount; i++) {
      const ship = ships[i] as Ship;
      const frameShip: FrameShip = { liveCellsCount: ship.length, cellsAroundShip: [] };
      const coordinate = ship.position;
      for (let j = 0; j < ship.length; j++) {
        let cell: FrameCell;
        //Fill game frame depends on ship length and direction
        if (ship.direction) {
          cell = frame[coordinate.y + j]![coordinate.x] as FrameCell;
        } else {
          cell = frame[coordinate.y]![coordinate.x + j] as FrameCell;
        }
        cell.shipIndex = i;
        cell.occupated = true;
        //Remember cells around ship
        for (let y = coordinate.y - 1; y < coordinate.y + 2; y++) {
          if (y < 0 || y > frame!.length) continue;
          for (let x = coordinate.x - 1; x < coordinate.x + 2; x++) {
            if (x < 0 || x > frame[y]!.length) continue;
            if (x === coordinate.x && y === coordinate.y) continue;
            //if ((frame[y]![x] as FrameCell).occupated) continue;
            frameShip.cellsAroundShip.push({ x: x, y: y });
          }
        }
        frameShips.push(frameShip);
      }
    }
    return { ships: ships, shipsFrame: frameShips, cellsFrame: frame };
  }
}
