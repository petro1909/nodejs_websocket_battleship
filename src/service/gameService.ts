import { Room } from '../types/entities/room';
import { Game, PlayerFrame, Player, Coordinate, FrameCell, FrameShip, Bot } from '../types/entities/game';
import { AttackRequestData, AttackResponseData, CreateGameData, RandomAttackRequestData, StartGameData, Turn } from '../types/commandsData/gameData';
import { uuidv4 } from '../util/identification';
import { GameFrameService } from './gameFrameService';
import { AddShips } from '../types/commandsData/shipData';
import { Client } from '../types/entities/users';

export class GameService {
  private games: Array<Game> = [];
  private static instance: GameService;

  public static getInstance() {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  public getGames(): Array<Game> {
    return this.games;
  }
  public removeGame(game: Game) {
    this.games = this.games.filter((item) => item.gameId !== game.gameId);
  }
  public getGameById(gameId: string): Game {
    const findedGame = this.games.find((game) => game.gameId === gameId) as Game;
    return findedGame;
  }

  public createGame(inputRoom: Room): [CreateGameData, CreateGameData] {
    const gameId = uuidv4();
    const player1Id = uuidv4();
    const player2Id = uuidv4();

    const player1: Player = { client: inputRoom.roomClients[0]!, playerIndex: player1Id };
    const player2: Player = { client: inputRoom.roomClients[1]!, playerIndex: player2Id };

    const game: Game = {
      gameId: gameId,
      player1: player1,
      player2: player2,
      currentTurn: { isHitted: false, isHittedAlreadyHiitedSell: false, currentPlayerIndex: player2.playerIndex },
      isGameWithBot: false,
    };
    this.games.push(game);

    const player1ResponseData: CreateGameData = { idGame: gameId, idPlayer: player1Id };
    const player2ResponseData: CreateGameData = { idGame: gameId, idPlayer: player2Id };
    return [player1ResponseData, player2ResponseData];
  }

  public createGameWithBot(client: Client): CreateGameData {
    const gameId = uuidv4();
    const playerId = uuidv4();
    const botId = uuidv4();
    //create players
    const player: Player = { client: client, playerIndex: playerId };
    const bot: Bot = { playerIndex: botId };
    //create bot random player frame
    const playerFrame: PlayerFrame = GameFrameService.createBotPlayerFrame();
    bot.frame = playerFrame;

    const game: Game = {
      gameId: gameId,
      player1: player,
      player2: bot,
      currentTurn: { isHitted: false, isHittedAlreadyHiitedSell: false, currentPlayerIndex: bot.playerIndex },
      isGameWithBot: true,
    };
    this.games.push(game);

    const player1ResponseData: CreateGameData = { idGame: gameId, idPlayer: playerId };
    return player1ResponseData;
  }

  public addShipsToGameFrame(data: string): Game {
    const addShipsCommand: AddShips = JSON.parse(data);
    const game = this.games.find((game) => game.gameId === addShipsCommand.gameId) as Game;

    const playerFrame: PlayerFrame = GameFrameService.createPlayerFrame(addShipsCommand.ships);
    if (game.player1.playerIndex == addShipsCommand.indexPlayer) {
      game.player1.frame = playerFrame;
    } else {
      game.player2.frame = playerFrame;
    }
    return game;
  }

  public startGame(gameId: string): [StartGameData, StartGameData] {
    const game = this.games.find((game) => game.gameId === gameId) as Game;
    const firstPlayerResponse: StartGameData = { ships: game.player1.frame!.ships, currentPlayerIndex: game.player1.playerIndex };
    const secondPlayerResponse: StartGameData = { ships: game.player2.frame!.ships, currentPlayerIndex: game.player2.playerIndex };
    return [firstPlayerResponse, secondPlayerResponse];
  }

  public changeTurn(gameId: string): Turn {
    const game = this.games.find((game) => game.gameId === gameId) as Game;
    if (!game.currentTurn.isHitted && !game.currentTurn.isHittedAlreadyHiitedSell) {
      if (game.currentTurn.currentPlayerIndex == game.player1.playerIndex) {
        game.currentTurn.currentPlayerIndex = game.player2.playerIndex;
      } else {
        game.currentTurn.currentPlayerIndex = game.player1.playerIndex;
      }
    }
    return { currentPlayer: game.currentTurn.currentPlayerIndex };
  }

  private getPlayers(gameId: string): [Player | Bot, Player | Bot, Game] {
    const findedGame = this.games.find((game) => game.gameId === gameId) as Game;
    const attackingPlayer = findedGame.currentTurn.currentPlayerIndex === findedGame.player1.playerIndex ? findedGame.player1 : findedGame.player2;
    const attackedPlayer = attackingPlayer === findedGame.player1 ? findedGame.player2 : findedGame.player1;
    return [attackingPlayer, attackedPlayer, findedGame];
  }

  public gameFinished(game: Game): boolean {
    const attackingPlayer = this.getPlayers(game.gameId)[0];
    const attackedPlayer = this.getPlayers(game.gameId)[1];
    //if end all ships live cells
    if (attackedPlayer.frame!.liveCells === 0) {
      game.winner = attackingPlayer;
      return true;
    }
    return false;
  }

  public attack(attackRequestData: AttackRequestData): Array<AttackResponseData> | undefined {
    const gameData = this.getPlayers(attackRequestData.gameId);
    const attackingPlayer = gameData[0];
    const attackedPlayer = gameData[1];
    const game = gameData[2];
    return this.checkAttack(attackRequestData, attackingPlayer, attackedPlayer, game);
  }

  public randomAttack(randomAttackRequestData: RandomAttackRequestData): Array<AttackResponseData> | undefined {
    const gameData = this.getPlayers(randomAttackRequestData.gameId);
    const attackingPlayer = gameData[0];
    const attackedPlayer = gameData[1];
    const game = gameData[2];

    const attackedPlayerFrame = attackedPlayer.frame?.cellsFrame as Map<number, Map<number, FrameCell>>;
    const attackedCoordinate = this.getRandomCoordiante(attackedPlayerFrame);

    const attackRequestData: AttackRequestData = {
      gameId: randomAttackRequestData.gameId,
      indexPlayer: attackingPlayer.playerIndex,
      x: attackedCoordinate.x,
      y: attackedCoordinate.y,
    };

    return this.checkAttack(attackRequestData, attackingPlayer, attackedPlayer, game);
  }

  private checkAttack(
    attackRequestData: AttackRequestData,
    attackingPlayer: Player | Bot,
    attackedPlayer: Player | Bot,
    game: Game,
  ): Array<AttackResponseData> | undefined {
    const attackedX = attackRequestData.x;
    const attackedY = attackRequestData.y;

    const attackResponseDataArray: Array<AttackResponseData> = [];
    const attackResponseData: AttackResponseData = { position: { x: attackedX, y: attackedY }, currentPlayer: attackingPlayer.playerIndex };

    const attackedPlayerFrame = attackedPlayer.frame?.cellsFrame as Map<number, Map<number, FrameCell>>;
    const attackedPlayerShipsFrame = attackedPlayer.frame?.shipsFrame as Array<FrameShip>;
    const attackedCell = attackedPlayerFrame.get(attackedY)!.get(attackedX);
    if (!attackedCell) {
      game.currentTurn.isHittedAlreadyHiitedSell = true;
      return;
    }
    game.currentTurn.isHittedAlreadyHiitedSell = false;
    //attackedCell.hitted = true;
    attackedPlayerFrame.get(attackedY)?.delete(attackedX);
    if (attackedPlayerFrame.get(attackedY)?.size === 0) {
      attackedPlayerFrame.delete(attackedY);
    }
    //if miss
    if (!attackedCell.occupated) {
      attackResponseData.status = 'miss';
      game.currentTurn.isHitted = false;
      attackResponseDataArray.push(attackResponseData);
    } else {
      // if hitt
      const shipIndex = attackedCell.shipIndex;
      const attackedPlayerShipFrame = attackedPlayerShipsFrame[shipIndex] as FrameShip;
      --attackedPlayerShipFrame.liveCellsCount;
      --attackedPlayer.frame!.liveCells;
      game.currentTurn.isHitted = true;
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
          const attackResponseData: AttackResponseData = {
            position: { x: cellsAroundShip[i]!.x, y: cellsAroundShip[i]!.y },
            currentPlayer: attackingPlayer.playerIndex,
            status: 'miss',
          };
          attackedPlayerFrame.get(cellsAroundShip[i]!.y)?.delete(cellsAroundShip[i]!.x);
          if (attackedPlayerFrame.get(cellsAroundShip[i]!.y)?.size === 0) {
            attackedPlayerFrame.delete(cellsAroundShip[i]!.y);
          }
          missedAttacksAroundShipResponseData.push(attackResponseData);
        }
        attackResponseDataArray.push(attackResponseData, ...missedAttacksAroundShipResponseData);
      }
    }
    return attackResponseDataArray;
  }

  private getRandomCoordiante(attackedPlayerFrame: Map<number, Map<number, FrameCell>>): Coordinate {
    const lines = attackedPlayerFrame.size;
    const randomMapLineNumber = Math.round(Math.random() * (lines - 1));
    const randomY = Array.from(attackedPlayerFrame.keys())[randomMapLineNumber]!;

    const randomLine = attackedPlayerFrame.get(randomY)!;
    const columnsInLine = randomLine!.size;
    const randomColumnNumber = Math.round(Math.random() * (columnsInLine - 1));
    const randomX = Array.from(randomLine.keys())[randomColumnNumber]!;
    return { x: randomX, y: randomY };
  }
}
