import { resCommandTypes } from 'types/commands/resCommandTypes';
import { Message } from 'types/message';

export function createResponseMessage(type: resCommandTypes, data: unknown): string {
  const message: Message = { type: type, data: JSON.stringify(data), id: 0 };
  return JSON.stringify(message);
}
