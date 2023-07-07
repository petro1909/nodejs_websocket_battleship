import { WebSocketServer } from 'ws';
import { WSClientsService } from '../service/clientsService';

export const websocketServerStart = (wsPort: number) => {
  const clientService = WSClientsService.getInstance();
  clientService.setCommands();
  console.log(`Start websocket server on the ${wsPort} port!`);
  const server = new WebSocketServer({ port: wsPort });
  server.on('connection', (wsClient) => {
    clientService.createClient(wsClient);
  });
};
