import { FrameCell, PlayerFrame, FrameShip } from '../types/entities/game';
import { Ship } from '../types/entities/ship';

export class GameFrameService {
  public static getEmpyGameFrame(): Map<number, Map<number, FrameCell>> {
    const frameLength = 10;
    const emptyGameFrame = new Map<number, Map<number, FrameCell>>();
    for (let i = 0; i < frameLength; i++) {
      const emptyGameFrameLine = new Map<number, FrameCell>();
      for (let j = 0; j < frameLength; j++) {
        emptyGameFrameLine.set(j, { shipIndex: -1, occupated: false, hitted: false, status: undefined });
      }
      emptyGameFrame.set(i, emptyGameFrameLine);
    }
    return emptyGameFrame;
  }

  public static fillPlayerFrame(frame: Map<number, Map<number, FrameCell>>, ships: Array<Ship>): PlayerFrame {
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
          cell = frame.get(coordinate.y + j)!.get(coordinate.x) as FrameCell;
        } else {
          cell = frame.get(coordinate.y)!.get(coordinate.x + j) as FrameCell;
        }
        cell.shipIndex = i;
        cell.occupated = true;
      }

      for (let j = 0; j < ship.length; j++) {
        let currentX = 0;
        let currentY = 0;
        if (ship.direction) {
          currentX = coordinate.x;
          currentY = coordinate.y + j;
        } else {
          currentX = coordinate.x + j;
          currentY = coordinate.y;
        }
        //Remember cells around ship
        for (let y = currentY - 1; y <= currentY + 1; y++) {
          if (y < 0 || y > 9) continue;
          for (let x = currentX - 1; x <= currentX + 1; x++) {
            if (x < 0 || x > 9) continue;
            if (x === currentX && y === currentY) continue;
            if ((frame.get(y)!.get(x) as FrameCell).occupated) continue;
            frameShip.cellsAroundShip.push({ x: x, y: y });
          }
        }
      }
      frameShips.push(frameShip);
    }
    return { ships: ships, shipsFrame: frameShips, cellsFrame: frame, liveCells: 20 };
  }
}
