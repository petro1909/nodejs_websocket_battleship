import { FrameCell, PlayerFrame, FrameShip } from '../types/entities/game';
import { Ship } from '../types/entities/ship';

export class GameFrameService {
  public static createPlayerFrame(ships: Array<Ship>): PlayerFrame {
    const cellsFrame = GameFrameService.getEmptyGameFrame();
    const playerFrame: PlayerFrame = GameFrameService.fillPlayerFrame(cellsFrame, ships);
    return playerFrame;
  }
  public static createBotPlayerFrame(): PlayerFrame {
    const ships = GameFrameService.createRandomShipsArray();
    const cellsFrame = GameFrameService.getEmptyGameFrame();
    const playerFrame: PlayerFrame = GameFrameService.fillPlayerFrame(cellsFrame, ships);
    return playerFrame;
  }

  private static getEmptyGameFrame(): Map<number, Map<number, FrameCell>> {
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

  private static fillPlayerFrame(frame: Map<number, Map<number, FrameCell>>, ships: Array<Ship>): PlayerFrame {
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

  private static createRandomShipsArray(): Array<Ship> {
    const ships: Array<Ship> = [];
    const ship1: Ship = { position: { x: 3, y: 7 }, direction: false, type: 'huge', length: 4 };
    const ship2: Ship = { position: { x: 9, y: 3 }, direction: true, type: 'large', length: 3 };
    const ship3: Ship = { position: { x: 0, y: 3 }, direction: false, type: 'large', length: 3 };
    const ship4: Ship = { position: { x: 8, y: 0 }, direction: true, type: 'medium', length: 2 };
    const ship5: Ship = { position: { x: 5, y: 3 }, direction: false, type: 'medium', length: 2 };
    const ship6: Ship = { position: { x: 2, y: 0 }, direction: true, type: 'medium', length: 2 };
    const ship7: Ship = { position: { x: 0, y: 0 }, direction: false, type: 'small', length: 1 };
    const ship8: Ship = { position: { x: 4, y: 0 }, direction: true, type: 'small', length: 1 };
    const ship9: Ship = { position: { x: 0, y: 8 }, direction: false, type: 'small', length: 1 };
    const ship10: Ship = { position: { x: 8, y: 8 }, direction: false, type: 'small', length: 1 };
    ships.push(ship1, ship2, ship3, ship4, ship5, ship6, ship7, ship8, ship9, ship10);
    return ships;
  }
}
