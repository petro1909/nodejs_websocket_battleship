import { WSClientsService } from '../service/clientsService';
import { GameService } from '../service/gameService';
import { Client } from '../types/entities/users';
import { createResponseMessage } from '../util/messageParser';
import { resCommandTypes } from '../types/entities/commandTypes';
import { AttackRequestData, FinishGame, RandomAttackRequestData } from '../types/commandsData/gameData';
import { Game } from '../types/entities/game';
import { WinnerService } from '../service/winnerService';

export class GameController {
  private gameService: GameService;
  private wsClientsService: WSClientsService;

  constructor() {
    this.gameService = GameService.getInstance();
    this.wsClientsService = WSClientsService.getInstance();
  }

  public addShipsToBoard(client: Client, data: string) {
    const game = this.gameService.addShipsToGameFrame(data);
    //if both players set their ships
    if (game.player1.frame && game.player2.frame) {
      const startGameResponseData = this.gameService.startGame(game.gameId);

      const startGame1stPlayerData = startGameResponseData[0];
      const startGame1stPlayerResponse = createResponseMessage(resCommandTypes.START_GAME, startGame1stPlayerData);
      game.player1.client.wsClient.send(startGame1stPlayerResponse);

      const startGame2ndPlayerData = startGameResponseData[1];
      const startGame2ndPlayerResponse = createResponseMessage(resCommandTypes.START_GAME, startGame2ndPlayerData);
      game.player2.client.wsClient.send(startGame2ndPlayerResponse);

      this.nextMove(game, game.gameId);
    }
  }

  public attack(clinet: Client, data: string) {
    const attackRequestData: AttackRequestData = JSON.parse(data);

    const game = this.gameService.getGameById(attackRequestData.gameId);
    if (game.currentPlayerIndex !== attackRequestData.indexPlayer) {
      const attackResponse = createResponseMessage(resCommandTypes.ATTACK, { message: 'there is not your turn' });
      clinet.wsClient.send(attackResponse);
      return;
    }
    const attackResponseDataArray = this.gameService.attack(attackRequestData);
    if (!attackResponseDataArray) {
      return;
    }
    attackResponseDataArray.forEach((attackResponseData) => {
      const attackResponse = createResponseMessage(resCommandTypes.ATTACK, attackResponseData);
      game.player1.client.wsClient.send(attackResponse);
      game.player2.client.wsClient.send(attackResponse);
    });
    this.nextMove(game, game.gameId);
  }

  public randomAttack(client: Client, data: string) {
    const randomAttackRequestData: RandomAttackRequestData = JSON.parse(data);

    const game = this.gameService.getGameById(randomAttackRequestData.gameId);
    if (game.currentPlayerIndex !== randomAttackRequestData.indexPlayer) {
      return;
    }
    const attackResponseDataArray = this.gameService.randomAttack(randomAttackRequestData);
    if (!attackResponseDataArray) {
      return;
    }
    attackResponseDataArray.forEach((attackResponseData) => {
      const attackResponse = createResponseMessage(resCommandTypes.ATTACK, attackResponseData);
      game.player1.client.wsClient.send(attackResponse);
      game.player2.client.wsClient.send(attackResponse);
    });

    this.nextMove(game, game.gameId);
  }

  private nextMove(game: Game, gameId: string) {
    const gameFinished = this.gameService.gameFinished(game);
    if (!gameFinished) {
      const turnResponseData = this.gameService.changeTurn(gameId);
      const turnResponse = createResponseMessage(resCommandTypes.TURN, turnResponseData);
      game.player1.client.wsClient.send(turnResponse);
      game.player2.client.wsClient.send(turnResponse);
    } else {
      const finishGameResponseData: FinishGame = { winPlayer: gameFinished.playerIndex };
      const finishGameResponse = createResponseMessage(resCommandTypes.FINISH, finishGameResponseData);
      game.player1.client.wsClient.send(finishGameResponse);
      game.player2.client.wsClient.send(finishGameResponse);

      const winnersData = WinnerService.getWinners();
      const winnersResponse = createResponseMessage(resCommandTypes.UPDATE_WINNERS, winnersData);
      this.wsClientsService.getClients().forEach((client) => client.wsClient.send(winnersResponse));
    }
  }
}
