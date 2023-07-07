import { Room } from '../types/entities/room';
import { Ship } from '../types/entities/ship';
import { Game, PlayerFrame, Player } from '../types/entities/game';
import { CreateGameData, StartGameData } from 'types/commandsData/gameData';
import { uuidv4 } from '../util/identification';
import { GameFrameService } from './gameFrameService';
export class GameService {
  private games: Array<Game> = [];
  private static instance: GameService;

  public static getInstance() {
    if (!GameService.instance) {
      GameService.instance = new GameService();
    }
    return GameService.instance;
  }

  public createGame(inputRoom: Room): [CreateGameData, CreateGameData] {
    const gameId = uuidv4();
    const creatorId = inputRoom.roomUsers[0]?.index as string;
    const addedPlayerId = inputRoom.roomUsers[1]?.index as string;

    const player1: Player = { playerIndex: creatorId };
    const player2: Player = { playerIndex: addedPlayerId };

    const game: Game = { gameId: gameId, player1: player1, player2: player2, currentPlayerIndex: player1.playerIndex };
    this.games.push(game);

    const createrPlayerAnswerData: CreateGameData = { idGame: gameId, idPlayer: creatorId };
    const addedPlayerAnswerData: CreateGameData = { idGame: gameId, idPlayer: addedPlayerId };

    return [createrPlayerAnswerData, addedPlayerAnswerData];
  }

  public addShipsToGameFrame(gameId: string, playerId: string, ships: Array<Ship>): Game {
    const game = this.games.find((game) => game.gameId === gameId) as Game;

    const cellsFrame = GameFrameService.getEmpyGameFrame();
    console.log(JSON.stringify(cellsFrame));
    const playerFrame: PlayerFrame = GameFrameService.fillPlayerFrame(cellsFrame, ships);

    if (game.player1.playerIndex == playerId) {
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
}
