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
      const frameShip: FrameShip = { shipXP: ship.length, liveShipCells: [], cellsAroundShip: [] };
      const coordinate = ship.position;
      for (let j = 0; j < ship.length; j++) {
        //Fill game frame depends on ship length and direction
        let y;
        let x;
        if (ship.direction) {
          y = coordinate.y + j;
          x = coordinate.x;
        } else {
          y = coordinate.y;
          x = coordinate.x + j;
        }
        const cell = frame.get(y)!.get(x) as FrameCell;
        frameShip.liveShipCells.push({ x: x, y: y });
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
    const randomShipArrayNumber = Math.round(Math.random() * 2);
    const ships: Array<Ship> = [];
    let ship1: Ship, ship2: Ship, ship3: Ship, ship4: Ship, ship5: Ship, ship6: Ship, ship7: Ship, ship8: Ship, ship9: Ship, ship10: Ship;
    console.log(randomShipArrayNumber);
    switch (randomShipArrayNumber) {
      case 0:
        ship1 = { position: { x: 2, y: 3 }, direction: false, type: 'huge', length: 4 };
        ship2 = { position: { x: 0, y: 5 }, direction: true, type: 'large', length: 3 };
        ship3 = { position: { x: 3, y: 9 }, direction: false, type: 'large', length: 3 };
        ship4 = { position: { x: 2, y: 0 }, direction: false, type: 'medium', length: 2 };
        ship5 = { position: { x: 7, y: 4 }, direction: false, type: 'medium', length: 2 };
        ship6 = { position: { x: 4, y: 7 }, direction: false, type: 'medium', length: 2 };
        ship7 = { position: { x: 8, y: 1 }, direction: true, type: 'small', length: 1 };
        ship8 = { position: { x: 0, y: 3 }, direction: false, type: 'small', length: 1 };
        ship9 = { position: { x: 7, y: 8 }, direction: false, type: 'small', length: 1 };
        ship10 = { position: { x: 5, y: 0 }, direction: true, type: 'small', length: 1 };
        ships.push(ship1, ship2, ship3, ship4, ship5, ship6, ship7, ship8, ship9, ship10);
        break;
      case 1:
        ship1 = { position: { x: 2, y: 5 }, direction: false, type: 'huge', length: 4 };
        ship2 = { position: { x: 7, y: 6 }, direction: false, type: 'large', length: 3 };
        ship3 = { position: { x: 8, y: 1 }, direction: true, type: 'large', length: 3 };
        ship4 = { position: { x: 5, y: 8 }, direction: false, type: 'medium', length: 2 };
        ship5 = { position: { x: 4, y: 0 }, direction: true, type: 'medium', length: 2 };
        ship6 = { position: { x: 0, y: 0 }, direction: false, type: 'medium', length: 2 };
        ship7 = { position: { x: 1, y: 2 }, direction: true, type: 'small', length: 1 };
        ship8 = { position: { x: 0, y: 7 }, direction: false, type: 'small', length: 1 };
        ship9 = { position: { x: 2, y: 7 }, direction: true, type: 'small', length: 1 };
        ship10 = { position: { x: 6, y: 1 }, direction: false, type: 'small', length: 1 };
        ships.push(ship1, ship2, ship3, ship4, ship5, ship6, ship7, ship8, ship9, ship10);
        break;
      default:
        ship1 = { position: { x: 5, y: 5 }, direction: false, type: 'huge', length: 4 };
        ship2 = { position: { x: 7, y: 0 }, direction: true, type: 'large', length: 3 };
        ship3 = { position: { x: 3, y: 8 }, direction: false, type: 'large', length: 3 };
        ship4 = { position: { x: 1, y: 2 }, direction: true, type: 'medium', length: 2 };
        ship5 = { position: { x: 0, y: 7 }, direction: false, type: 'medium', length: 2 };
        ship6 = { position: { x: 8, y: 7 }, direction: true, type: 'medium', length: 2 };
        ship7 = { position: { x: 9, y: 2 }, direction: true, type: 'small', length: 1 };
        ship8 = { position: { x: 3, y: 4 }, direction: true, type: 'small', length: 1 };
        ship9 = { position: { x: 2, y: 0 }, direction: true, type: 'small', length: 1 };
        ship10 = { position: { x: 5, y: 1 }, direction: true, type: 'small', length: 1 };
        ships.push(ship1, ship2, ship3, ship4, ship5, ship6, ship7, ship8, ship9, ship10);
        break;
    }
    return ships;
  }
}
