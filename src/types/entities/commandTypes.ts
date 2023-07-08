export enum reqCommandTypes {
  REGISTRATION = 'reg',
  CREATE_ROOM = 'create_room',
  ADD_PLAYER_TO_ROOM = 'add_user_to_room',
  ADD_SHIPS = 'add_ships',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  SINGLE_PLAY = 'single_play',
}

export enum resCommandTypes {
  REGISTRATION = 'reg',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  TURN = 'turn',
  FINISH = 'finish',
  UPDATE_WINNERS = 'update_winners',
}
