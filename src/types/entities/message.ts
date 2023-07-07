import { resCommandTypes, reqCommandTypes } from './commandTypes';

export type Message = {
  type: reqCommandTypes | resCommandTypes;
  data: string;
  id: number;
};
