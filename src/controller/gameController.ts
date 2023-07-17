import { WSClientsService } from '../service/clientsService';
import { GameService } from '../service/gameService';
import { Client } from '../types/entities/users';
import { createResponseMessage } from '../util/messageParser';
import { resCommandTypes } from '../types/entities/commandTypes';
import { AttackRequestData, FinishGame, RandomAttackRequestData } from '../types/commandsData/gameData';
import { Bot, Game, Player } from '../types/entities/game';
import { WinnerService } from '../service/winnerService';
import { RoomService } from '../service/roomService';

export class GameController {
  private gameService: GameService;
  private wsClientsService: WSClientsService;
  private roomService: RoomService;

  constructor() {
    this.roomService = RoomService.getInstance();
    this.gameService = GameService.getInstance();
    this.wsClientsService = WSClientsService.getInstance();
  }

  public createGameWithBot(client: Client, data: string) {
    //hide all rooms created by this room creator
    const creatorPlayerRooms = this.roomService.getRooms().filter((item) => item.roomClients[0] === client);
    creatorPlayerRooms.forEach((room) => (room.visible = false));

    const createGameResponseData = this.gameService.createGameWithBot(client);
    const createGameResponse = createResponseMessage(resCommandTypes.CREATE_GAME, createGameResponseData);
    client.wsClient.send(createGameResponse);

    const roomResponseData = this.roomService.getRoomsData();
    const roomResponseMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomResponseData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomResponseMessage));
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
      if (!game.isGameWithBot) {
        const player2Client = game.player2 as Player;
        player2Client.client.wsClient.send(startGame2ndPlayerResponse);
      }

      this.nextMove(client, game);
    }
  }

  public attack(client: Client, data: string) {
    const attackRequestData: AttackRequestData = JSON.parse(data);

    const game = this.gameService.getGameById(attackRequestData.gameId);
    if (game.currentTurn.currentPlayerIndex !== attackRequestData.indexPlayer) {
      return;
    }
    const attackResponseDataArray = this.gameService.attack(attackRequestData);
    if (!attackResponseDataArray) {
      this.nextMove(client, game);
      return;
    }
    attackResponseDataArray.forEach((attackResponseData) => {
      const attackResponse = createResponseMessage(resCommandTypes.ATTACK, attackResponseData);
      game.player1.client.wsClient.send(attackResponse);
      if (!game.isGameWithBot) {
        const player2Client = game.player2 as Player;
        player2Client.client.wsClient.send(attackResponse);
      }
    });
    this.nextMove(client, game);
  }

  public randomAttack(client: Client, data: string) {
    const randomAttackRequestData: RandomAttackRequestData = JSON.parse(data);

    const game = this.gameService.getGameById(randomAttackRequestData.gameId);
    if (game.currentTurn.currentPlayerIndex !== randomAttackRequestData.indexPlayer) {
      return;
    }
    const attackResponseDataArray = this.gameService.randomAttack(randomAttackRequestData);
    if (!attackResponseDataArray) {
      this.nextMove(client, game);
      return;
    }

    attackResponseDataArray.forEach((attackResponseData) => {
      const attackResponse = createResponseMessage(resCommandTypes.ATTACK, attackResponseData);
      game.player1.client.wsClient.send(attackResponse);
      if (!game.isGameWithBot) {
        const player2Client = game.player2 as Player;
        player2Client.client.wsClient.send(attackResponse);
      }
    });

    this.nextMove(client, game);
  }

  private nextMove(client: Client, game: Game) {
    const gameFinished = this.gameService.gameFinished(game);
    if (!gameFinished) {
      const turnResponseData = this.gameService.changeTurn(game.gameId);
      const turnResponse = createResponseMessage(resCommandTypes.TURN, turnResponseData);
      game.player1.client.wsClient.send(turnResponse);
      if (!game.isGameWithBot) {
        const player2Client = game.player2 as Player;
        player2Client.client.wsClient.send(turnResponse);
      } else {
        if (game.currentTurn.currentPlayerIndex === game.player2.playerIndex) {
          const randomAttackRequestData: RandomAttackRequestData = { gameId: game.gameId, indexPlayer: game.player2.playerIndex };
          const randomAttackResponse = JSON.stringify(randomAttackRequestData);
          setTimeout(() => this.randomAttack(client, randomAttackResponse), 1000);
        }
      }
    } else {
      this.endGame(game);
    }
  }

  private endGame(game: Game) {
    this.gameService.removeGame(game);
    const finishGameResponseData: FinishGame = { winPlayer: game.winner!.playerIndex };
    const finishGameResponse = createResponseMessage(resCommandTypes.FINISH, finishGameResponseData);
    game.player1.client.wsClient.send(finishGameResponse);

    //show all rooms created by this game creator
    const creatorPlayerRooms = this.roomService.getRooms().filter((room) => room.roomClients[0] === game.player1.client);
    creatorPlayerRooms.forEach((room) => (room.visible = true));
    const winner = game.winner as Player;
    if (!game.isGameWithBot) {
      const player2Client = game.player2 as Player;
      player2Client.client.wsClient.send(finishGameResponse);
      winner.client.user!.wins += 1;
      //show all rooms created by this game added player
      const addedPlayerRooms = this.roomService.getRooms().filter((room) => room.roomClients[0] === player2Client.client);
      addedPlayerRooms.forEach((room) => (room.visible = true));
    } else {
      if (winner.client) {
        winner.client.user!.wins += 1;
      }
    }
    const winnersData = WinnerService.getWinners();
    const winnersResponse = createResponseMessage(resCommandTypes.UPDATE_WINNERS, winnersData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(winnersResponse));

    const roomResponseData = this.roomService.getRoomsData();
    const roomResponseMessage = createResponseMessage(resCommandTypes.UPDATE_ROOM, roomResponseData);
    this.wsClientsService.getClients().forEach((client) => client.wsClient.send(roomResponseMessage));
  }

  public handleUserDisconnect(client: Client) {
    //get all games in what this client is taking part
    const games = this.gameService.getGames();
    //handle disconnect for games in what player1 is clinet. With bots or with other player
    let userGames = games.filter((game) => game.player1.client === client);
    for (const userGame of userGames) {
      userGame.winner = userGame.player2;
      this.endGame(userGame);
    }

    const gamesWithTwoPlayers = games.filter((game) => !game.isGameWithBot);
    userGames = gamesWithTwoPlayers.filter((game) => (game.player2 as Player).client === client);
    for (const userGame of userGames) {
      userGame.winner = userGame.player1;
      this.endGame(userGame);
    }
  }
}
