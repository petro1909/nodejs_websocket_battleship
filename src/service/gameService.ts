import { Room } from '../types/entities/room';
import { Game, PlayerFrame, Player, Coordinate, FrameCell, FrameShip } from '../types/entities/game';
import { AttackRequestData, AttackResponseData, CreateGameData, RandomAttackRequestData, StartGameData, Turn } from 'types/commandsData/gameData';
import { uuidv4 } from '../util/identification';
import { GameFrameService } from './gameFrameService';
import { AddShips } from 'types/commandsData/shipData';
import { Client, Winner } from 'types/entities/users';
export class GameService {
  private games: Array<Game> = [];
  private static instance: GameService;

  public static getInstance() {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }
  public getGameById(gameId: string) {
    const findedGame = this.games.find((game) => game.gameId === gameId) as Game;
    return findedGame;
  }
  public createGame(inputRoom: Room): [CreateGameData, CreateGameData] {
    const gameId = uuidv4();
    const player1Clinet = inputRoom.roomClients[0] as Client;
    const player2Clinet = inputRoom.roomClients[1] as Client;

    const player1Id = uuidv4();
    const player2Id = uuidv4();

    const player1: Player = { client: player1Clinet, playerIndex: player1Id };
    const player2: Player = { client: player2Clinet, playerIndex: player2Id };

    const game: Game = { gameId: gameId, player1: player1, player2: player2, currentPlayerIndex: player1.playerIndex };
    this.games.push(game);

    const player1AnswerData: CreateGameData = { idGame: gameId, idPlayer: player1Id };
    const player2AnswerData: CreateGameData = { idGame: gameId, idPlayer: player2Id };

    return [player1AnswerData, player2AnswerData];
  }

  public addShipsToGameFrame(data: string): Game {
    const addShipsCommand: AddShips = JSON.parse(data);
    const game = this.games.find((game) => game.gameId === addShipsCommand.gameId) as Game;

    const cellsFrame = GameFrameService.getEmpyGameFrame();
    console.log(JSON.stringify(cellsFrame));
    const playerFrame: PlayerFrame = GameFrameService.fillPlayerFrame(cellsFrame, addShipsCommand.ships);
    if (game.player1.playerIndex == addShipsCommand.indexPlayer) {
      game.player1.frame = playerFrame;
    } else {
      game.player2.frame = playerFrame;
    }
    return game;
  }

  public startGame(gameId: string): [StartGameData, StartGameData] {
    const game = this.games.find((game) => game.gameId === gameId) as Game;
    const firstPlayerAnswer: StartGameData = { ships: game.player1.frame!.ships, currentPlayerIndex: game.player1.playerIndex };
    const secondPlayerAnswer: StartGameData = { ships: game.player2.frame!.ships, currentPlayerIndex: game.player2.playerIndex };
    return [firstPlayerAnswer, secondPlayerAnswer];
  }

  public changeTurn(gameId: string): Turn {
    const game = this.games.find((game) => game.gameId === gameId) as Game;
    if (game.currentPlayerIndex == game.player1.playerIndex) {
      game.currentPlayerIndex = game.player2.playerIndex;
    } else {
      game.currentPlayerIndex = game.player1.playerIndex;
    }
    return { currentPlayer: game.currentPlayerIndex };
  }

  public attack(attackRequestData: AttackRequestData): Array<AttackResponseData> | undefined {
    const players = this.getPlayers(attackRequestData.gameId);
    const attackingPlayer = players[0];
    const attackedPlayer = players[1];
    return this.checkAttack(attackRequestData, attackingPlayer, attackedPlayer);
  }

  public randomAttack(randomAttackRequestData: RandomAttackRequestData): Array<AttackResponseData> | undefined {
    const players = this.getPlayers(randomAttackRequestData.gameId);
    const attackingPlayer = players[0];
    const attackedPlayer = players[1];

    const attackedPlayerFrame = attackedPlayer.frame?.cellsFrame as Map<number, Map<number, FrameCell>>;
    const attackedCoordinate = this.getRandomCoordiante(attackedPlayerFrame);

    const attackRequestData: AttackRequestData = { gameId: randomAttackRequestData.gameId, indexPlayer: attackingPlayer.playerIndex, x: attackedCoordinate.x, y: attackedCoordinate.y };

    return this.checkAttack(attackRequestData, attackingPlayer, attackedPlayer);
  }

  private checkAttack(attackRequestData: AttackRequestData, attackingPlayer: Player, attackedPlayer: Player): Array<AttackResponseData> | undefined {
    const attackedX = attackRequestData.x;
    const attackedY = attackRequestData.y;

    const attackResponseDataArray: Array<AttackResponseData> = [];
    const attackResponseData: AttackResponseData = { position: { x: attackedX, y: attackedY }, currentPlayer: attackingPlayer.playerIndex };

    const attackedPlayerFrame = attackedPlayer.frame?.cellsFrame as Map<number, Map<number, FrameCell>>;
    const attackedPlayerShipsFrame = attackedPlayer.frame?.shipsFrame as Array<FrameShip>;
    console.log(JSON.stringify({ line: attackedY, column: attackedX }));
    const attackedCell = attackedPlayerFrame.get(attackedY)!.get(attackedX);
    if (!attackedCell) {
      return;
    }
    //attackedCell.hitted = true;
    attackedPlayerFrame.get(attackedY)?.delete(attackedX);
    //if miss
    if (!attackedCell.occupated) {
      attackResponseData.status = 'miss';
      attackResponseDataArray.push(attackResponseData);
    } else {
      // if hitt
      const shipIndex = attackedCell.shipIndex;
      const attackedPlayerShipFrame = attackedPlayerShipsFrame[shipIndex] as FrameShip;
      --attackedPlayerShipFrame.liveCellsCount;
      --attackedPlayer.frame!.liveCells;
      //if just shot
      if (attackedPlayerShipFrame.liveCellsCount !== 0) {
        attackResponseData.status = 'shot';
        attackResponseDataArray.push(attackResponseData);
      } else {
        //if kill
        attackResponseData.status = 'killed';

        const cellsAroundShip = attackedPlayerShipFrame.cellsAroundShip;
        const missedAttacksAroundShipResponseData = new Array<AttackResponseData>();
        for (let i = 0; i < cellsAroundShip.length; i++) {
          const attackResponseData: AttackResponseData = { position: { x: cellsAroundShip[i]!.x, y: cellsAroundShip[i]!.y }, currentPlayer: attackingPlayer.playerIndex, status: 'miss' };
          attackedPlayerFrame.get(cellsAroundShip[i]!.y)?.delete(cellsAroundShip[i]!.x);
          missedAttacksAroundShipResponseData.push(attackResponseData);
        }
        attackResponseDataArray.push(attackResponseData, ...missedAttacksAroundShipResponseData);
      }
    }
    return attackResponseDataArray;
  }

  private getRandomCoordiante(attackedPlayerFrame: Map<number, Map<number, FrameCell>>): Coordinate {
    const lines = attackedPlayerFrame.size - 1;
    const randomMapLine = Math.round(Math.random() * lines);
    const columnsInLine = attackedPlayerFrame.get(randomMapLine)!.size - 1;
    const randomMapColumn = Math.round(Math.random() * columnsInLine);

    const randomY = Array.from(attackedPlayerFrame.keys())[randomMapLine]!;
    const randomX = Array.from(attackedPlayerFrame.get(randomY)!.keys())[randomMapColumn]!;
    console.log(`${lines} ${columnsInLine}`);
    console.log(`${randomY} ${randomX}`);
    return { x: randomX, y: randomY };
  }

  private getPlayers(gameId: string): [Player, Player] {
    const findedGame = this.games.find((game) => game.gameId === gameId) as Game;
    const attackingPlayer = findedGame.currentPlayerIndex === findedGame.player1.playerIndex ? findedGame.player1 : findedGame.player2;
    const attackedPlayer = attackingPlayer === findedGame.player1 ? findedGame.player2 : findedGame.player1;
    return [attackingPlayer, attackedPlayer];
  }

  public gameFinished(game: Game): Player | undefined {
    const attackingPlayer = this.getPlayers(game.gameId)[0];
    const attackedPlayer = this.getPlayers(game.gameId)[1];
    if (attackedPlayer.frame!.liveCells === 0) {
      attackingPlayer.client.user!.wins += 1;
      return attackingPlayer;
    }
  }
}
