import { httpServerStart } from './http_server/index';
import { websocketServerStart } from './websoket_server/index';
import { config } from 'dotenv';
import { resolve } from 'path';

export class App {
  private httpPort: number;
  private websocketPort: number;
  constructor() {
    config({ path: resolve(process.cwd(), './.env') });
    this.httpPort = +process.env['HTTP_PORT']!;
    this.websocketPort = +process.env['WS_PORT']!;
  }

  start() {
    httpServerStart(this.httpPort);
    websocketServerStart(this.websocketPort);
  }
}
