import { resCommandTypes } from '../types/entities/commandTypes';
import { Message } from '../types/entities/message';

export function createResponseMessage(type: resCommandTypes, data: unknown): string {
  const message: Message = { type: type, data: JSON.stringify(data), id: 0 };
  return JSON.stringify(message);
}

export function parseRequestMessageString(message: string): Message {
  return JSON.parse(message) as Message;
}
